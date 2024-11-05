const express = require("express");
const upload = require("../multer/index.js");
const authRouter = express.Router();

const {
  registration,
  login,
  deleteAccount,
  logout,
  VerifyEmail,
  emailIsVerified,
  getUserInfo,
  setProfilePicture,
  getProfilePicture,
  removeProfilePicture,
  returnRandomUsers,
  searchUsers,
} = require("../controllers/auth.controller");

const {
  registrationRequest,
  loginRequest,
} = require("../requests/auth.requests");

const isAuthenticated = require("../middleware/isAuthenticated");

authRouter.post("/registration", registrationRequest, registration);
authRouter.post("/login", loginRequest, login);
authRouter.delete("/account/delete", isAuthenticated, deleteAccount);
authRouter.post("/logout", logout);
authRouter.post("/account/verify-email", isAuthenticated, VerifyEmail);
authRouter.get(
  "/account/email-is-verified/:token",
  isAuthenticated,
  emailIsVerified
);
authRouter.get("/user", isAuthenticated, getUserInfo);
authRouter.post(
  "/profile/change-avatar",
  isAuthenticated,
  upload.single("avatar"),
  setProfilePicture
);
authRouter.delete(
  "/profile/remove-avatar",
  isAuthenticated,
  removeProfilePicture
);
authRouter.get("/random-users", isAuthenticated, returnRandomUsers);
authRouter.get("/search-users", searchUsers);

module.exports = authRouter;
