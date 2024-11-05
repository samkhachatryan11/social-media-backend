const amqp = require("amqplib");

exports.userCreated = async function () {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queue = "user.created.chat";

    await channel.assertQueue(queue, { durable: true });

    console.log(`Waiting for messages in queue: ${queue}`);

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const userInfo = JSON.parse(msg.content.toString());
        console.log("Received user info:", userInfo);

        channel.ack(msg);
      } else {
        console.log("Received null message.");
      }
    });
  } catch (error) {
    console.error("Error subscribing to messages:", error);
  }
};
