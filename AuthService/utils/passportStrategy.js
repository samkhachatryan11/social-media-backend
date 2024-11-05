const passport = require("passport");
const userAuthStrategy = require("../strategies/localStrategy.js");

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use("local", userAuthStrategy);

module.exports = passport;
