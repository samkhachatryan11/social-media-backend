require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const router = require("./router/post.routes");
const app = express();
const cors = require("cors");
const fs = require("fs");
const { userCreated } = require("./rabbitmq/consume");
const { isAuthenticated } = require("social-shared");

app.use(cookieParser());

const corsOptions = {
  origin: [process.env.AUTH_SERVICE_ORIGIN, process.env.FRONT_END_ORIGIN],
  credentials: true,
  "Access-Control-Allow-Credentials": true,
};

app.use(cors(corsOptions));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(bodyParser.json());
app.use("/api", router);

app.listen(process.env.PORT, async () => {
  console.log(`Success | PORT: ${process.env.PORT}`);
  await userCreated();
});
