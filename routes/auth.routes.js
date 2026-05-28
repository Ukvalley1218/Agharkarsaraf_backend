import express from "express";
import {
  sendOtp,
  verifyOtp,
  completeProfile,
  resendOtp,
  getAllUsers,
  getUserById,
  updateDeviceToken,
  getProfile,
  logout,
  verifyToken,
  Admin_sendOtp,
  Admin_verifyOtp,
} from "../controllers/auth.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/send-otp", sendOtp);
router.post("/admin-send-otp", Admin_sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/admin-verify-otp", Admin_verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/verify-token", verifyToken);

// Protected routes (authentication required)
router.get("/me", protect, getProfile);
router.post("/complete-profile", protect, completeProfile);
router.post("/logout", protect, logout);
router.post("/update-device-token/:id", protect, updateDeviceToken);

// Admin routes (authentication + admin role required)
router.get("/users", protect, authorize("Admin"), getAllUsers);
router.get("/users/:id", protect, getUserById);

export default router;