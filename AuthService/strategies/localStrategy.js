const bcrypt = require("bcrypt");
const { User } = require("../models");
const { Strategy } = require("passport-local");

const AuthStrategy = new Strategy(
  {
    usernameField: "email",
    passwordField: "password",
  },
  async (email, password, done) => {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return done(new Error("Invalid username or password."));
    }

    done(null, user);
  }
);

module.exports = AuthStrategy;
