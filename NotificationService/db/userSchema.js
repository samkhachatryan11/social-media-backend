const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const UserSchema = new Schema({
  userId: { type: Number, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String, required: false },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("users", UserSchema);
