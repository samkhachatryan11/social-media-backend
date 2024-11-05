require("dotenv").config();
const express = require("express");
const ioConnection = require("./socket");
const { userCreated } = require("./rabbitmq/consume");
const cors = require("cors");
const router = require("./routes/notificationsRoute");
require("./db/index");

const app = express();
const { Server } = require("socket.io");
const server = require("http").createServer(app);

const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(","),
  credentials: true,
  "Access-Control-Allow-Credentials": true,
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", ioConnection);

app.use("/api", router);

server.listen(process.env.PORT || 3010, async () => {
  console.log(
    `Notification service running on port ${process.env.PORT || 3010}`
  );
  await userCreated();
});
