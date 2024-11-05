const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const ChatSchema = new Schema({
  first_member: {
    type: String,
    ref: "users",
    required: true,
  },
  second_member: {
    type: String,
    ref: "users",
    required: true,
  },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("chats", ChatSchema);
