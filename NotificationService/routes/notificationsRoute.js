const express = require("express");
const { getNotifications } = require("../controllers/notificationsController");
const router = express.Router();

router.get("/get-notifications/:userId", getNotifications);

module.exports = router;
