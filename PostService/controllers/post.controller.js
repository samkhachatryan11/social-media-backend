const {
  Post,
  Like,
  Comment,
  User,
  sequelize,
  Friend,
} = require("../models/index.js");
const { Op, Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

async function publishPost(req, res) {
  const postText = req.body.text;
  const postImages = req.files || [];

  try {
    if (postImages.length > 0 && postText) {
      for (let i = 0; i < postImages.length; i++) {
        const resizedOutputPath = path.join(
          __dirname,
          `../uploads/resized/${postImages[i].filename}`
        );

        await sharp(postImages[i].path)
          .resize({ width: 250, height: 270 })
          .toFile(resizedOutputPath);

        await Post.create({
          publisher_id: req.user?.id,
          postText: postText,
          image: postImages[i].filename,
        });
      }
      return res.send({ message: "Post(s) were successfully uploaded" });
    } else if (postImages.length === 0 && postText) {
      await Post.create({
        publisher_id: req.user?.id,
        text: postText,
      });
      return res.send({ message: "Post(s) were successfully uploaded" });
    } else if (postImages.length > 0 && !postText) {
      for (let i = 0; i < postImages.length; i++) {
        const resizedOutputPath = path.join(
          __dirname,
          `../uploads/resized/${postImages[i].filename}`
        );

        await sharp(postImages[i].path)
          .resize({ width: 250, height: 270 })
          .toFile(resizedOutputPath);

        await Post.create({
          publisher_id: req.user?.id,
          image: postImages[i].filename,
        });
      }
      return res.send({ message: "Post(s) were successfully uploaded" });
    } else {
      return res
        .status(400)
        .send({ message: "Post should contain text or image!" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "An error occurred while uploading the post." });
  }
}

async function myPosts(req, res) {
  const page = req.query.page || 1;
  const limit = 12;
  const offset = (page - 1) * limit;

  const posts = await Post.findAll({
    where: { publisher_id: req.user?.id },
    limit: limit,
    offset: offset,
  });
  return res.send(posts);
}

async function AllMyPosts(req, res) {
  try {
    const posts = await Post.findAll({
      where: {
        publisher_id: req.user?.id,
      },
    });
    res.send(posts);
  } catch (error) {
    throw error;
  }
}

async function myPostsInfo(req, res) {}

async function findPost(req, res) {
  const post = await Post.findOne({
    where: { id: req.params.id },
  });

  if (!post) {
    return res.status(404).send({ message: "Post does not exist" });
  } else {
    if (post.image === null) {
      return res.send(post.content);
    } else if (post.content === null) {
      return res.sendFile(path.join(__dirname, `../${post.image}`));
    } else {
      return res.send({
        image: path.join(__dirname, `../${post.image}`),
        content: post.content,
      });
    }
  }
}

async function likePost(req, res) {
  try {
    const post = await Post.findOne({ where: { id: req.params.id } });

    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    const existingLike = await Like.findOne({
      where: {
        liker_id: req.user.id,
        post_id: post.id,
      },
    });

    if (existingLike) {
      await existingLike.destroy();
      await Post.decrement("like_count", { where: { id: post.id } });
      return res.send({ message: "Like removed successfully!" });
    } else {
      await Like.create({
        liker_id: req.user.id,
        post_id: post.id,
        author_id: post.publisher_id,
      });
      await Post.increment("like_count", { where: { id: post.id } });
      return res.send({ message: "Post liked successfully!" });
    }
  } catch (error) {
    throw error;
  }
}

async function commentToPost(req, res) {
  try {
    const post = await Post.findOne({ where: { id: req.params.id } });

    if (post) {
      await Comment.create({
        commenter_id: req.user.id,
        post_id: post.id,
        author_id: post.publisher_id,
        comment_text: req.body.commentText,
      });

      if (!post.comment_count) {
        await Post.update({ comment_count: 1 }, { where: { id: post.id } });
      } else {
        await Post.increment("comment_count", { where: { id: post.id } });
      }
    }
    res.send({ message: "Post commented successfully!" });
  } catch (error) {
    throw error;
  }
}

async function likedByMe(req, res) {
  try {
    const posts = await Like.findAll({
      where: { liker_id: req.user.id },
    });
    res.send(posts);
  } catch (error) {
    throw error;
  }
}

async function deletePost(req, res) {
  const post = await Post.findOne({ where: { id: req.params.id } });

  if (!post) {
    return res.send(404).send({ message: "Post does not exist" });
  } else {
    await Post.destroy({ where: { id: req.params.id } });
    fs.unlink(path.join(__dirname, `../${post.image}`), (err) => {
      if (err) {
        console.error(`Error removing file: ${err}`);
        return;
      }
    });
  }

  res.send({ message: "Post successfully deleted" });
}

async function updatePost(req, res) {
  const post = await Post.findOne({ where: { id: req.params.id } });
  if (!post) {
    res.status(404).send({ message: "Can not find requested post" });
    throw new Error();
  } else {
    await Post.update(
      { content: req.body.content },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    res.send({ message: "Post successfully updated" });
  }
}

async function getUserPosts(req, res) {
  try {
    const page = req.query.page || 1;
    const userId = req.query.userId;
    const limit = 12;
    const offset = (page - 1) * limit;

    const posts = await Post.findAll({
      where: {
        publisher_id: userId,
      },
      include: [
        {
          model: User,
          as: "publisher",
          attributes: ["id", "username", "email", "avatar"],
        },
        {
          model: Like,
          as: "likes",
        },
        {
          model: Comment,
          as: "comments",
          include: {
            model: User,
            as: "commenter",
            attributes: ["id", "username", "email", "avatar"],
          },
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
    });

    posts.forEach((post) => {
      if (post.comments) {
        post.comments.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      }
    });

    const user = await User.findOne({
      where: {
        id: userId,
      },
    });

    const userLikeCount = await Post.sum("like_count", {
      where: {
        publisher_id: userId,
      },
    });

    res.send({
      posts: posts,
      user: user,
      like_count: userLikeCount,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send("Error fetching posts");
  }
}

async function getFriendsPosts(req, res) {
  try {
    const friends = req.query.friendsIds.split(",");

    const page = req.query.page || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: "publisher",
          attributes: ["id", "username", "email", "avatar"],
          where: {
            id: {
              [Op.in]: friends,
            },
          },
        },
        {
          model: Like,
          as: "likes",
        },
        {
          model: Comment,
          as: "comments",
          include: {
            model: User,
            as: "commenter",
            attributes: ["id", "username", "email", "avatar"],
          },
        },
      ],
      limit: limit,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    posts.forEach((post) => {
      if (post.comments) {
        post.comments.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      }
    });

    res.send(posts);
  } catch (error) {}
}

module.exports = {
  publishPost,
  findPost,
  deletePost,
  updatePost,
  likePost,
  likedByMe,
  getUserPosts,
  commentToPost,
  getFriendsPosts,
};
