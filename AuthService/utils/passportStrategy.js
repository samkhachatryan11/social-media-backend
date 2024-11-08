const passport = require("passport");
const localStrategy = require("../strategies/localStrategy.js");
const googleStrategy = require("../strategies/googleStrategy.js");

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use("local", localStrategy);
passport.use("google", googleStrategy);

module.exports = passport;
