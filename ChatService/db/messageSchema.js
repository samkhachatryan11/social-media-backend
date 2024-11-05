const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const MessageSchema = new Schema({
  chat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "chats",
    required: true,
  },
  sender_id: {
    type: Number,
    ref: "users",
    required: true,
  },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("messages", MessageSchema);
