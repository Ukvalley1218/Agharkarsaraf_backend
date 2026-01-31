import { sendPush, sendToTopic } from "../services/sendnotification.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const sendNotification = async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        message: "title and body are required",
      });
    }

    // ✅ FETCH USER (FIXED)
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const fcmToken = user.deviceToken;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: "User does not have a registered device token",
      });
    }
    // ✅ SEND PUSH
    await sendPush({
      token: fcmToken,
      title,
      body,
      data,
    });

    // ✅ STORE IN DB
    const notification = await Notification.create({
      userId,
      fcmToken,
      title,
      body,
      data,
    });

    res.status(201).json({
      success: true,
      message: "Notification sent & saved",
      notification,
    });
  } catch (error) {
    console.error("Notification Error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendBulkNotification = async (req, res) => {
  try {
    const { title, message, data } = req.body;
    console.log(title, message);
    if (!title || !message) {
      return res.status(400).json({
        message: "title and body are required",
      });
    }

    // 🔔 Send to ALL users
    await sendToTopic({
      topic: "all_users",
      title,
      body: message,
      data,
    });

    // 💾 Store ONE record (bulk type)
    const notification = await Notification.create({
      title,
      body: message,
      data,
      isBulk: true,
    });

    res.status(200).json({
      success: true,
      message: "Bulk notification sent to all users",
      notification,
    });
  } catch (error) {
    console.error("Bulk Notification Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send bulk notification",
    });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const notifications = await Notification.find({
      $or: [
        { userId: userId }, // 👤 user specific
        { isBulk: true }, // 🔔 bulk notifications
      ],
    }).sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get Notification Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
