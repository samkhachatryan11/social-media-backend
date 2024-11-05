const Message = require("../db/messageSchema");
const Chat = require("../db/chatSchema");
const User = require("../db/userSchema");
const { ObjectId } = require("mongoose").Types;

module.exports = (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("join", ({ userId }) => {
    socket.join(userId);
    console.log(`${userId} joined the room: ${userId}`);
  });

  socket.on("chat", async ({ userId, secondMember, messageContent }) => {
    let existingChat = await Chat.findOne({
      $or: [
        { first_member: userId, second_member: secondMember },
        { first_member: secondMember, second_member: userId },
      ],
    });

    if (!existingChat) {
      existingChat = await Chat.create({
        first_member: userId,
        second_member: secondMember,
      });
    }

    const user = await User.findOne({ userId });

    const newMessage = await Message.create({
      chat_id: existingChat._id,
      sender_id: userId,
      content: messageContent,
    });

    socket.to(secondMember).emit("chat", newMessage);
    socket.emit("chat", newMessage);
  });

  socket.on("typing", ({ userId }) => {
    console.log("userId", userId);
    socket.to(userId).emit("typing", { userId });
    console.log("asdhasudhuashd");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
};
