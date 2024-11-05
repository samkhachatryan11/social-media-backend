require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const authRouter = require("./routes/auth.routes");
const friendRouter = require("./routes/friend.routes");
const path = require("path");
const cors = require("cors");
const apiProxy = require("./proxy");
const isAuthenticated = require("./middleware/isAuthenticated");
const app = express();

const corsOptions = {
  origin: [
    process.env.CORS_POST_SERVICE_ORIGIN,
    process.env.CORS_FRONT_END_ORIGIN,
  ],
  credentials: true,
  "Access-Control-Allow-Credentials": true,
};

app.use(cors(corsOptions));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.use("/api", authRouter);
app.use("/api/friends", isAuthenticated, friendRouter);

app.listen(process.env.PORT, () => {
  console.log(`Success | PORT: ${process.env.PORT}`);
});
