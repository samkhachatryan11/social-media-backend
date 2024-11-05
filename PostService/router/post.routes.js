const express = require("express");
const upload = require("../multer/index");
const { isAuthenticated } = require("social-shared");
const {
  publishPost,
  myPosts,
  findPost,
  deletePost,
  updatePost,
  AllMyPosts,
  likePost,
  myLikeCount,
  likedByMe,
  testGetFriends,
  getUserPosts,
  commentToPost,
  getFriendsPosts,
} = require("../controllers/post.controller");
const router = express.Router();
router.post(
  "/posts/upload",
  isAuthenticated,
  upload.array("images", 6),
  publishPost
);

router.delete("/my-posts/delete/:id", deletePost);
router.put("/my-posts/update/:id", updatePost);
router.post("/post/like/:id", isAuthenticated, likePost);
router.post("/post/comment/:id", isAuthenticated, commentToPost);
router.get("/posts", isAuthenticated, getUserPosts);
router.get("/friends-posts", isAuthenticated, getFriendsPosts);

module.exports = router;
