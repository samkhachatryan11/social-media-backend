const EventEmitter = require("events");
const Notification = require("../db/notificationSchema");
const notificationEmitter = new EventEmitter();

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

  global.socket
    .to(receiver_id.toString())
    .emit("notification", newNotification);
});

module.exports = notificationEmitter;
