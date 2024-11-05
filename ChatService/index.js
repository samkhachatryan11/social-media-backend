require("dotenv").config();
const express = require("express");
const app = express();
const { Server } = require("socket.io");
const server = require("http").createServer(app);
const { userCreated } = require("./rabbit/consume");
const ioConnection = require("./socket");
const bodyParser = require("body-parser");
const cors = require("cors");
const router = require("./routes/chatRoute");

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

require("./db/index");

app.use(bodyParser());
app.use("/api", router);

server.listen(process.env.PORT, async () => {
  console.log(`Success | PORT ${process.env.PORT}`);
  await userCreated();
});
