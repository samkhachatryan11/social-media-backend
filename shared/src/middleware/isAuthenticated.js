const axios = require("axios");

async function isAuthenticated(req, res, next) {
  const cookies = req.cookies;

  try {
    if (cookies) {
      const cookieHeader = Object.keys(cookies)
        .map((key) => `${key}=${cookies[key]}`)
        .join(";");
      try {
        const url = `${process.env.AUTH_SERVICE_ORIGIN}/api/user`;

        const { data } = await axios.get(url, {
          headers: { Cookie: cookieHeader },
        });

        req.user = data.user;

        next();
      } catch (error) {
        throw error;
      }
    }
  } catch (error) {
    console.log(error);
    res.send({ message: "You are not authenticated" });
    next();
  }
}

module.exports = isAuthenticated;
