const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: String,
    message: String,
   stage: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved"],
    default: "Pending",
  },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


const NotificationModel = mongoose.model("Notification", notificationSchema);


 module.exports = NotificationModel;