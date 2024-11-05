const { createClient } = require("redis");

async function connectRedis() {
  const client = createClient();

  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  return client;
}

module.exports = connectRedis();
