async function isAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).send({ message: "Not Authenticated" });
  }
  return next();
}

module.exports = isAuthenticated;
