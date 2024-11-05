const Notification = require("../db/notificationSchema");
const { notificationEmitter } = require("../rabbitmq/consume");

module.exports = (socket) => {
  console.log("New user connected for notifications:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their notification room.`);
  });

  notificationEmitter.on("friendRequest", async (notificationData) => {
    console.log("notificationData", notificationData);
    const { sender_id, receiver_id, type } = notificationData;
    const content = "You have a new friend request!";

    const stringSenderId = sender_id.toString();
    const stringReceiverId = receiver_id.toString();

    const newNotification = await Notification.create({
      sender_id: stringSenderId,
      receiver_id: stringReceiverId,
      content,
      type,
    });

    console.log("New notification created:", newNotification);

    socket.to(receiver_id.toString()).emit("notification", newNotification);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected from notifications:", socket.id);
  });
};
