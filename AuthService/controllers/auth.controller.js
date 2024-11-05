const { User, Sequelize, Friend } = require("../models/index.js");
const bcrypt = require("bcrypt");
const passport = require("../utils/passportStrategy.js");
const { Session } = require("express-session");
const nodemailer = require("nodemailer");
const path = require("path");
const clientPromise = require("../utils/redis.js");
const generateToken = require("../helpers/tokenGenerator.js");
const { sendUserInfo } = require("../rabbitmq/send.js");
const sharp = require("sharp");
const fs = require("fs");
const { Op } = require("sequelize");
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  secure: false,
  auth: {
    user: "dd38103037c866",
    pass: "2397dccb1821be",
  },
});

const saltRounds = 10;

async function registration(req, res) {
  try {
    bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
      if (err) {
        throw err;
      }
      const userInfo = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: hash,
      });

      passport.authenticate("local", { session: true }, async (user) => {
        req.logIn(user, () => {
          return res
            .cookie(process.env.COOKIE_NAME, req.body.email, {
              httpOnly: process.env.COOKIE_HTTP_ONLY,
              secure: process.env.COOKIE_SECURE,
              sameSite: process.env.COOKIE_SAME_SITE,
              maxAge: process.env.COOKIE_MAX_AGE,
            })
            .send({ message: "Account successfully created!" });
        });
      })(req, res);

      if (userInfo) {
        const toSend = {
          id: userInfo.id,
          username: userInfo.username,
          email: userInfo.email,
        };
        await sendUserInfo(toSend);
      } else {
        console.error("Message is undefined");
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

async function login(req, res, next) {
  passport.authenticate("local", { session: true }, async (err, user) => {
    if (err) {
      res.send({ message: "Wrong password!" });
      return next(err);
    }
    await req.logIn(user, () => {
      return res
        .cookie(process.env.COOKIE_NAME, req.body.email, {
          httpOnly: process.env.COOKIE_HTTP_ONLY,
          secure: process.env.COOKIE_SECURE,
          sameSite: process.env.COOKIE_SAME_SITE,
          maxAge: process.env.COOKIE_MAX_AGE,
        })
        .send({ message: "successfully logged in!" });
    });
  })(req, res, next);
}

async function logout(req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }

    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      }

      res
        .clearCookie(process.env.COOKIE_NAME)
        .clearCookie("connect.sid")
        .send({ message: "Successfully logged out" });
    });
  });
}

async function deleteAccount(req, res) {
  try {
    await sendUserInfo(req.user.id, "user.deleted");

    await sendUserInfo();

    await User.destroy({
      where: {
        id: req.user.id,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }

  res.clearCookie(process.env.COOKIE_NAME).json({
    message: "User has been successfully deleted!",
  });
}

async function VerifyEmail(req, res) {
  try {
    const client = await clientPromise;
    const token = generateToken();
    let mailOptions = {
      from: "social_media_site",
      to: req.user.email,
      subject: "Email confirmation",
      html: `Press <a href=http://localhost:${process.env.PORT}/api/account/email-is-verified/${token}> here </a> to verify your email. thanks`,
    };

    transporter.sendMail(mailOptions, function (error) {
      if (error) {
        throw error;
      }
    });

    await client.SET(token, req.user.email);

    res.send({
      message:
        "Link to verify your email has been successfully sent to your email!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

async function emailIsVerified(req, res) {
  const client = await clientPromise;
  try {
    const { token } = req.params;

    await client.get(token);

    if (!token) {
      res.status(400).json({
        error: "Your url is wrong, or it has been expired",
      });
    }

    await User.update(
      { is_email_verified: true },
      {
        where: {
          email: await client.get(token),
        },
      }
    );

    res.send({ message: "Your email is verified" });
  } catch (error) {
    console.error(error);
    res.send({ message: "An error occurred while verifying the email" });
  }
}

async function getUserInfo(req, res) {
  const id = req.query.id;

  try {
    if (id) {
      const user = await User.findOne({
        attributes: ["id", "username", "email", "avatar"],
        where: { id: id },
      });
      return res.send(user);
    }

    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: ["id", "username", "email", "avatar"],
      include: [
        {
          model: Friend,
          as: "sentRequests",
          where: { is_accepted: true },
          include: [
            {
              model: User,
              as: "receiver",
              attributes: ["id", "username", "avatar"],
            },
          ],
          required: false,
        },
        {
          model: Friend,
          as: "receivedRequests",
          where: { is_accepted: true },
          include: [
            {
              model: User,
              as: "sender",
              attributes: ["id", "username", "avatar"],
            },
          ],
          required: false,
        },
      ],
    });

    const friendsArray = [
      ...user.sentRequests.map((friend) => friend.receiver),
      ...user.receivedRequests.map((friend) => friend.sender),
    ];

    const uniqueFriends = Array.from(
      new Map(friendsArray.map((friend) => [friend.id, friend])).values()
    ).filter((friend) => friend.id !== req.user.id);

    const response = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
      friends: uniqueFriends,
    };

    return res.json(response);
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Not Authorized" });
  }
}

async function setProfilePicture(req, res) {
  const avatar = req.file;

  const resizedPath = path.join(
    __dirname,
    `../uploads/resized/${avatar.filename}`
  );

  await sharp(avatar.path)
    .jpeg({ mozjpeg: true })
    .resize(400)
    .toFile(resizedPath, avatar.filename);

  await User.update(
    {
      avatar: `${avatar.destination}resized/${avatar.filename}`,
    },
    { where: { id: req.user.id } }
  );

  res.send({
    message: "Profile picture successfully updated",
    avatar: avatar.path,
  });
}

async function removeProfilePicture(req, res) {
  try {
    const user = User.findOne({ where: { id: req.user.id } });
    await User.update({ avatar: null }, { where: { id: req.user.id } });

    fs.unlink(path.join(__dirname, `../${user.avatar}`), (err) => {
      if (err) {
        console.error(`Error removing avatar`);
        return;
      }
    });
    fs.unlink(path.join(__dirname, `../resized/${user.avatar}`), (err) => {
      if (err) {
        console.error(`Error removing avatar`);
        return;
      }
    });
    res.send({ message: "Avatar successfully removed" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

async function returnRandomUsers(req, res) {
  try {
    const users = await User.findAll({
      order: Sequelize.literal("random()"),
      limit: 3,
      where: {
        [Op.not]: { id: req.user.id },
      },
    });
    res.send(users);
  } catch (error) {
    console.log(error);
  }
}

async function searchUsers(req, res) {
  let usernameParam = req.query.username;

  const users = await User.findAll({
    where: {
      username: {
        [Op.substring]: usernameParam,
        [Op.not]: req.user.username,
      },
    },
  });

  if (usernameParam === "") {
    return res.send([]);
  } else {
    return res.send(users);
  }
}

module.exports = {
  registration,
  login,
  deleteAccount,
  logout,
  VerifyEmail,
  emailIsVerified,
  getUserInfo,
  setProfilePicture,
  removeProfilePicture,
  returnRandomUsers,
  searchUsers,
};
