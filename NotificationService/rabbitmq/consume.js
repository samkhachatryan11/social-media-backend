const amqp = require("amqplib");
const notificationEmitter = require("../emitters/notificationEmitter");
const { createUser } = require("../service/userService");

exports.userCreated = async function () {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const exchange = "user.created";
    const queue = "user.created.notification";

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

async function friendRequestReceived() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    const queue = "send.notification";

    await channel.assertQueue(queue, { durable: true });

    console.log(`Waiting for friend request messages in queue: ${queue}`);

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const friendRequestInfo = JSON.parse(msg.content.toString());
        console.log("Received friend request info:", friendRequestInfo);

        notificationEmitter.emit("friendRequest", friendRequestInfo);

        channel.ack(msg);
      } else {
        console.log("Received null message.");
      }
    });

    process.on("exit", async () => {
      await channel.close();
      await connection.close();
      console.log("RabbitMQ channel and connection closed.");
    });
  } catch (error) {
    console.error("Error subscribing to friend request messages:", error);
  }
}

friendRequestReceived();
