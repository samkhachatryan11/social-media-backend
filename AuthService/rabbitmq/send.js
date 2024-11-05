const amqp = require("amqplib");

async function sendUserInfo(userInfo) {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "user.created";
  const msg = JSON.stringify(userInfo);

  await channel.assertExchange(exchange, "fanout", { durable: true });

  channel.publish(exchange, "", Buffer.from(msg));

  console.log("User info sent to exchange:", msg);

  await channel.close();
  await connection.close();
}

async function sendNotificationInfo(notificationInfo, queue) {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    const msg = JSON.stringify(notificationInfo);

    channel.sendToQueue(queue, Buffer.from(msg), { persistent: true });
    console.log("Friend request info sent:", msg);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Failed to send friend request info:", error);
  }
}

module.exports = {
  sendUserInfo,
  sendNotificationInfo,
};
