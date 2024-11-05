const { Friend } = require("../models/index.js");
const { User } = require("../models/index.js");
const { Op } = require("sequelize");
const { sendNotificationInfo } = require("../rabbitmq/send.js");

async function getAllFriends(req, res) {
  const userWithFriends = await User.findOne({
    where: { id: req.user.id },
    include: [
      {
        model: User,
        as: "friends",
        attributes: ["id", "username", "email", "avatar"],
      },
    ],
  });

  if (!userWithFriends) {
    return;
  }

  let filtered = [];

  if (req.query.username) {
    const myFriends = userWithFriends.friends;
    for (let i = 0; i < myFriends.length; i++) {
      if (myFriends[i].username.startsWith(req.query.username)) {
        filtered.push(myFriends[i]);
      }
    }
  }

  if (userWithFriends.length < 1) {
    res.status(404).send({ message: "Friend list is empty" });
  } else if (req.query.username) {
    res.send(filtered);
  } else {
    res.send(userWithFriends.friends);
  }
}

async function friendRequests(req, res) {
  try {
    const unacceptedRequests = await Friend.findAll({
      where: {
        is_accepted: false,
        receiver_id: req.user.id,
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "avatar"],
        },
      ],
    });

    return res.send(unacceptedRequests);
  } catch (error) {
    console.error("Error fetching unaccepted requests:", error);
    res.status(500).json(error);
  }
}

async function searchInFriends() {
  const friends = await Friend.findAll({
    where: {
      [Op.or]: [{ sender_id: req.user.id }, { receiver_id: req.user.id }],
      is_accepted: true,
    },
  });
  const Ids = friends.map((friend) => friend.receiver_id);

  const friendsInfo = await User.findAll({
    where: {
      [Op.and]: [
        {
          [Op.not]: {
            id: req.user.id,
          },
        },
        {
          id: {
            [Op.in]: Ids,
          },
        },
      ],
    },
  });

  const filtered = [];

  for (i in friendsInfo) {
    if (friendsInfo[i].username.includes(req.params.username)) {
      filtered.push(friendsInfo[i]);
    }
  }

  res.send(filtered);
}

async function sendFriendRequest(req, res) {
  const id = req.params.id;

  const user = await User.findOne({ where: { id: id } });

  if (!user) {
    return res.status(404).send("User does not exist");
  } else if (user.id === req.user.id) {
    return res.status(404).send("Can not send request!");
  } else {
    await Friend.create({
      sender_id: req.user.id,
      receiver_id: user.id,
    });

    await sendNotificationInfo(
      {
        sender_id: req.user.id,
        receiver_id: user.id,
        type: "Request",
      },
      "send.notification"
    );
    res.send({ message: "Friend request has been successfully sent!" });
  }
}

async function acceptFriendRequest(req, res) {
  await Friend.update(
    { is_accepted: true },
    {
      where: {
        sender_id: req.params.id,
      },
    }
  );

  res.send({ message: "Request has been accepted!" });
}

async function rejectFriendRequest(req, res) {
  await Friend.destroy({ where: { sender_id: req.params.id } });

  res.send({ message: "Request has been rejected!" });
}

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getAllFriends,
  searchInFriends,
  friendRequests,
};
