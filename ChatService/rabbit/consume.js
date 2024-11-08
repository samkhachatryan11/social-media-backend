const amqp = require("amqplib");
const { createUser } = require("../service/userService");

exports.userCreated = async function () {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const exchange = "user.created";
    const queue = "user.created.chat";

    await channel.assertExchange(exchange, "fanout", { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, "");

    console.log(`Waiting for messages in queue: ${queue}`);

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const userInfo = JSON.parse(msg.content.toString());
        console.log("Received user info:", userInfo);
        createUser(userInfo);
        channel.ack(msg);
      } else {
        console.log("Received null message.");
      }
    });
  } catch (error) {
    console.error("Error subscribing to messages:", error);
  }
};
