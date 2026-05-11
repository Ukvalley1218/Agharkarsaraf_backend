import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    shopName: {
      type: String,
      default: null,
    },
    gstNo: {
      type: String,
      default: null,
    },
    userType: {
      type: String,
      enum: ["WHOLESALER", "RETAILER"],
      default: null,
    },
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    deviceToken: {
      type: String,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries
userSchema.index({ mobile: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.model("User", userSchema);