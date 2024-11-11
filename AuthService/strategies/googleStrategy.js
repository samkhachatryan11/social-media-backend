const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models/index.js");

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await User.findOne({
        where: { email: profile.emails[0].value },
      });

      if (!user) {
        const newUser = await User.create({
          username: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos ? profile.photos[0].value : null,
        });
        await sendUserInfo(newUser);
        return done(null, newUser);
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
);

module.exports = googleStrategy;
