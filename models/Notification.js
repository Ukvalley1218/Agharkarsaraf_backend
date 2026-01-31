import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // optional
      required: false,
    },

    fcmToken: {
      type: String,
      required: function () {
        return !this.isBulk; // 🔥 REQUIRED ONLY for personal notifications
      },
    },

    title: {
      type: String,
      required: true,
    },

    body: {
      type: String,
      required: true,
    },

    data: {
      type: Object, // extra payload (screen, id, etc.)
      default: {},
    },

    isRead: {
      type: Boolean,
      default: false,
    },
    isBulk: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Notification", notificationSchema);
