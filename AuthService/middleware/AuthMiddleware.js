const { User } = require("../models/index");

async function isAuthorized(req, res, next) {
  try {
    const user = await User.findOne({ where: { id: req.session.userId } });

    if (!user) {
      const err = new Error("Not authorized!");
      err.status = 401;
      return next(err);
    } else {
      return next();
    }
  } catch (error) {
    return next(error);
  }
}

module.exports = isAuthorized;
