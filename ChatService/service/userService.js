const User = require("../db/userSchema");

exports.createUser = async function (userInfo) {
  try {
    await User.create({
      userId: userInfo.id,
      username: userInfo.username,
      email: userInfo.email,
      avatar: userInfo.avatar,
    });
  } catch (error) {
    throw new Error(error);
  }
};
