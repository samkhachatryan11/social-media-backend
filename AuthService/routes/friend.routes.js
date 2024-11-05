const express = require("express");
const friendRouter = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");

const {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getAllFriends,
  friendRequests,
} = require("../controllers/friend.controller");

friendRouter.post("/send-friend-request/:id", sendFriendRequest);
friendRouter.put("/accept-friend-request/:id", acceptFriendRequest);
friendRouter.delete("/reject-friend-request/:id", rejectFriendRequest);
friendRouter.get("/my-friends", isAuthenticated, getAllFriends);
friendRouter.get("/friend-requests", isAuthenticated, friendRequests);

module.exports = friendRouter;
