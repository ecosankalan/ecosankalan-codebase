const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  saveFCMToken,
  removeFCMToken,
  sendToUser,
  broadcast,
  getNotifications,
} = require("../controllers/notificationController");

router.post("/token", protect, saveFCMToken);
router.delete("/token", protect, removeFCMToken);
router.post("/send", protect, authorize("admin"), sendToUser);
router.post("/broadcast", protect, authorize("admin"), broadcast);
router.get("/", protect, authorize("admin"), getNotifications);

module.exports = router;