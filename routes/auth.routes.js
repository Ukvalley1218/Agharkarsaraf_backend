import express from "express";
import {
  getAllUsers,
  getUserById,
  register,
  sendOtp,
  verifyOtp,
} from "../controllers/auth.controller.js";
import { updateDeviceToken } from "../test/authController.test.js";

const router = express.Router();
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/register", register);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/update-device-token", updateDeviceToken);

export default router;
