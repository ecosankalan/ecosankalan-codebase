const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendMulticastNotification } = require("../services/notification");

exports.saveFCMToken = async (req, res) => {
  try {
    const { token, device } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const user = await User.findById(req.user.userId).select("+fcmTokens");

    // One token per user: replace the existing token (if any) with the current one.
    user.fcmTokens = [
      {
        token,
        device: device || "unknown",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await user.save();

    res.json({ success: true, message: "Token saved" });
  } catch (err) {
    console.error("saveFCMToken error:", err);
    res.status(500).json({ success: false, message: "Failed to save token" });
  }
};

exports.removeFCMToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { fcmTokens: { token } },
    });

    res.json({ success: true, message: "Token removed" });
  } catch (err) {
    console.error("removeFCMToken error:", err);
    res.status(500).json({ success: false, message: "Failed to remove token" });
  }
};

exports.sendToUser = async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;
    if (!userId || !title || !body) {
      return res.status(400).json({ success: false, message: "userId, title, and body are required" });
    }

    const user = await User.findById(userId).select("+fcmTokens");
    if (!user || !user.fcmTokens.length) {
      return res.status(404).json({ success: false, message: "No tokens found for user" });
    }

    const tokens = user.fcmTokens.map((t) => t.token);
  
    const result = await sendMulticastNotification({ tokens, title, body, data });

    if (result.invalidTokens.length) {
      await User.findByIdAndUpdate(userId, {
        $pull: { fcmTokens: { token: { $in: result.invalidTokens } } },
      });
    }

    res.json({ success: true, result });
  } catch (err) {
    console.error("sendToUser error:", err);
    res.status(500).json({ success: false, message: "Failed to send notification" });
  }
};

exports.broadcast = async (req, res) => {
  try {
    const { title, body, data } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: "title and body are required" });
    }

    const users = await User.find({ "fcmTokens.0": { $exists: true } }).select("+fcmTokens");
    const allTokens = users.flatMap((u) => u.fcmTokens.map((t) => t.token));

    if (!allTokens.length) {
      return res.status(404).json({ success: false, message: "No registered tokens" });
    }

    const result = await sendMulticastNotification({ tokens: allTokens, title, body, data });

    if (result.invalidTokens.length) {
      await User.updateMany(
        { "fcmTokens.token": { $in: result.invalidTokens } },
        { $pull: { fcmTokens: { token: { $in: result.invalidTokens } } } }
      );
    }

    const saved = await Notification.create({
      title,
      body,
      sentBy: req.user.userId,
      recipientCount: result.successCount || 0,
      failedCount: result.failureCount || 0,
    });

    res.json({ success: true, notification: saved, result });
  } catch (err) {
    console.error("broadcast error:", err);
    res.status(500).json({ success: false, message: "Failed to broadcast" });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sentBy', 'name')
        .lean(),
      Notification.countDocuments(),
    ]);

    res.status(200).json({
      notifications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ success: false, message: "Failed to load notifications" });
  }
};