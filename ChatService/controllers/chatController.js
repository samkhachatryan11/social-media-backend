const Message = require("../db/messageSchema");
const Chat = require("../db/chatSchema");
const User = require("../db/userSchema");

async function getMessagesWithDetails(req, res) {
  const { userId, friendId } = req.query;

  try {
    const existingChat = await Chat.findOne({
      $or: [
        { first_member: userId, second_member: friendId },
        { first_member: friendId, second_member: userId },
      ],
    });

    if (!existingChat) {
      return res.json({ message: "No chat found", messages: [] });
    }

    const messages = await Message.find({
      chat_id: existingChat._id,
    }).sort({ created_at: 1 });

    if (!messages.length) {
      return res.status(200).json({ messages: [] });
    }

    const senderIds = [
      ...new Set(messages.map((message) => message.sender_id)),
    ];

    const users = await User.find({ userId: { $in: senderIds } }).select(
      "userId username email avatar"
    );

    const userMap = {};
    users.forEach((user) => {
      userMap[user.userId] = user;
    });

    const formattedMessages = messages.map((message) => ({
      sender_id: message.sender_id,
      content: {
        userId: message.sender_id,
        friendId: friendId,
        content: message.content,
      },
      senderDetails: userMap[message.sender_id] || {},
    }));

    res.send(formattedMessages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).send("Server Error");
  }
}

module.exports = { getMessagesWithDetails };
