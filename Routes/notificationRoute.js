    const authMiddleware = require("../middelware/authMiddleware");
    const NotificationModel = require("../models/notificationModel");
    const express = require("express");


    const notificationRoute = express.Router();

    notificationRoute.get("/", authMiddleware(["user"]), async (req, res) => {
    const userId = req.user;

    const notifications = await NotificationModel.find({ userId })
        .sort({ createdAt: -1 });

    res.json(notifications);
    });



    // PATCH /notifications/:id/read
notificationRoute.patch(
  "/:id/read",
  authMiddleware(["user"]),
  async (req, res) => {
    try {
      const notificationId = req.params.id;

      await NotificationModel.findByIdAndUpdate(
        notificationId,
        { isRead: true }
      );

      res.json({
        success: true,
        message: "Notification marked as read",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);


    module.exports = notificationRoute;

