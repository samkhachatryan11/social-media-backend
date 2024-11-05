const express = require("express");
const { getMessagesWithDetails } = require("../controllers/chatController");
const router = express.Router();

router.get("/get-chat-messages", getMessagesWithDetails);

module.exports = router;
