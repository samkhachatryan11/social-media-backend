const amqp = require("amqplib");

let connection, channel;

async function setupConnection() {
  try {
    connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();

    console.log("RabbitMQ connection and channel setup completed.");

    await channel.assertExchange("user.created", "fanout", { durable: true });
    await channel.assertExchange("send.notification", "fanout", {
      durable: true,
    });
  } catch (error) {
    console.error("Error setting up RabbitMQ connection:", error);
  }
}

async function sendUserInfo(userInfo) {
  try {
    if (!connection || !channel) {
      await setupConnection();
    }

    const exchange = "user.created";
    const msg = JSON.stringify(userInfo);

    channel.publish(exchange, "", Buffer.from(msg), { persistent: true });
    console.log("User info sent to exchange:", msg);
  } catch (error) {
    console.error("Error sending user info:", error);
  }
}

async function sendNotificationInfo(notificationInfo) {
  try {
    if (!connection || !channel) {
      await setupConnection();
    }

    const exchange = "send.notification";
    const msg = JSON.stringify(notificationInfo);

    channel.publish(exchange, "", Buffer.from(msg), { persistent: true });
    console.log("Notification info sent to exchange:", msg);
  } catch (error) {
    console.error("Error sending notification info:", error);
  }
}

process.on("exit", async () => {
  if (channel) await channel.close();
  if (connection) await connection.close();
  console.log("RabbitMQ channel and connection closed.");
});

module.exports = { sendUserInfo, sendNotificationInfo };
