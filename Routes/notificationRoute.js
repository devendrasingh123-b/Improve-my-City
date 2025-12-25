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

    module.exports = notificationRoute;

