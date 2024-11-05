const Notification = require("../db/notificationSchema");
const User = require("../db/userSchema");

exports.getNotifications = async (req, res) => {
  const userId = req.params.userId;
  try {
    const notifications = await Notification.find({
      receiver_id: userId,
    }).sort({ createdAt: -1 });

    const senderIds = [...new Set(notifications.map((n) => n.sender_id))];
    const users = await User.find(
      { userId: { $in: senderIds } },
      "userId username"
    );

    const userMap = {};
    users.forEach((user) => {
      userMap[user.userId] = user;
    });

    const notificationsWithUserInfo = notifications.map((notification) => {
      return {
        ...notification.toObject(),
        sender: userMap[notification.sender_id] || null,
      };
    });

    res.send(notificationsWithUserInfo);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching notifications." });
  }
};
