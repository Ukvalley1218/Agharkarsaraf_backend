import User from "../models/User.js";
import Otp from "../models/Otp.js";
import jwt from "jsonwebtoken";
import { sendOtpSmsWithRetry } from "../services/sms.service.js";
import mongoose from "mongoose";
import { sendOtpEmail } from "../services/email.service.js";

// Generate 6-digit OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Format mobile number (remove non-digits, ensure proper format)
const formatMobile = (mobile) => {
  let formatted = mobile.replace(/\D/g, "");
  // Remove country code if present (91 for India)
  if (formatted.startsWith("91") && formatted.length === 12) {
    formatted = formatted.slice(2);
  }
  return formatted;
};

/**
 * Send OTP to mobile number
 * POST /api/auth/send-otp
 * Body: { mobile }
 */
export const sendOtp = async (req, res) => {
  try {
    const { mobile, email } = req.body;

    if (!mobile || !email) {
      return res.status(400).json({
        success: false,
        message: "Mobile number / email are required",
      });
    }

    const formattedMobile = formatMobile(mobile);

    // Validate mobile number (10 digits for India)
    if (formattedMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid mobile number. Please enter a valid 10-digit mobile number",
      });
    }

    // Check for rate limiting - max 3 OTPs per number in 10 minutes
    const recentOtps = await Otp.countDocuments({
      mobile: formattedMobile,
      createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) },
    });

    if (recentOtps >= 3) {
      return res.status(429).json({
        success: false,
        message: "Too many OTP requests. Please try again after 10 minutes.",
      });
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Delete any existing OTP for this mobile
    await Otp.deleteMany({ mobile: formattedMobile });

    // Save new OTP
    await Otp.create({
      mobile: formattedMobile,
      otp,
      expiresAt,
    });

    // Send OTP via BestSMS
    try {
      if (email) {
        await sendOtpEmail(email, otp);
      } else {
        await sendOtpSmsWithRetry(formattedMobile, otp);
      }
    } catch (smsError) {
      console.error("SMS Error:", smsError.message);
      // Still return success in development (OTP is saved in DB)
      // In production, you may want to fail here
      if (process.env.NODE_ENV === "production") {
        return res.status(500).json({
          success: false,
          message: "Failed to send OTP. Please try again.",
        });
      }
    }

    res.json({
      success: true,
      message: "OTP sent successfully",
      // Only in development
      ...(process.env.NODE_ENV !== "production" && { otp }),
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error sending OTP. Please try again.",
    });
  }
};

/**
 * Verify OTP and Login/Register
 * POST /api/auth/verify-otp
 * Body: { mobile, otp, deviceToken? }
 */
export const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp, deviceToken } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and OTP are required",
      });
    }

    const formattedMobile = formatMobile(mobile);

    // Find OTP record
    const otpRecord = await Otp.findOne({ mobile: formattedMobile });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ mobile: formattedMobile });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Check attempts (max 3)
    if (otpRecord.attempts >= 3) {
      await Otp.deleteOne({ mobile: formattedMobile });
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.`,
      });
    }

    // OTP verified - delete it
    await Otp.deleteOne({ mobile: formattedMobile });

    // Find or create user
    let user = await User.findOne({ mobile: formattedMobile });
    let isNewUser = false;

    if (!user) {
      // Create new user
      user = await User.create({
        mobile: formattedMobile,
        role: "User",
        isProfileComplete: false,
        deviceToken: deviceToken || null,
        lastLogin: new Date(),
      });
      isNewUser = true;
    } else {
      // Update existing user
      user.lastLogin = new Date();
      if (deviceToken) {
        user.deviceToken = deviceToken;
      }
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, mobile: user.mobile },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    res.json({
      success: true,
      message: isNewUser ? "Registration successful" : "Login successful",
      token,
      isNewUser,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        address: user.address,
        shopName: user.shopName,
        gstNo: user.gstNo,
        userType: user.userType,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    res.status(500).json({
      success: false,
      message: "OTP verification failed. Please try again.",
    });
  }
};

export const Admin_sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const cleanEmail = email.toLowerCase().trim();
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    await Otp.create({
      email: cleanEmail,
      otp,
      expiresAt,
    });

    await sendOtpEmail(cleanEmail, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

export const Admin_verifyOtp = async (req, res) => {
  try {
    const { email, otp, deviceToken } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    const record = await Otp.findOne({ email: cleanEmail, otp });
    if (!record) return res.status(400).json({ message: "Invalid OTP" });

    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ email: cleanEmail });
      return res.status(400).json({ message: "OTP expired" });
    }

    let user = await User.findOne({ email: cleanEmail });

    // 🆕 Create user if first time
    if (!user) {
      user = await User.create({
        email: cleanEmail,
        role: "User",
        deviceToken: deviceToken || null,
      });
    } else if (deviceToken) {
      // 🔔 Update device token on every login
      user.deviceToken = deviceToken;
      await user.save();
    }

    await Otp.deleteOne({ email: cleanEmail });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    res.json({ message: "Login successful", token, user });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/**
 * Complete user profile (after first login)
 * POST /api/auth/complete-profile
 * Body: { name, email?, address?, shopName?, gstNo?, userType? }
 * Headers: Authorization: Bearer <token>
 */
export const completeProfile = async (req, res) => {
  try {
    const { name, email, address, shopName, gstNo, userType, deviceToken } =
      req.body;
    const userId = req.user.id; // From auth middleware

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update profile
    user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    if (shopName) user.shopName = shopName;
    if (gstNo) user.gstNo = gstNo;
    if (userType) user.userType = userType;
    if (deviceToken) user.deviceToken = deviceToken;

    // Check if profile is complete
    user.isProfileComplete = !!(user.name && user.address && user.shopName);

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.mobile,
        mobile: user.mobile,
        email: user.email,
        address: user.address,
        shopName: user.shopName,
        gstNo: user.gstNo,
        userType: user.userType,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (error) {
    console.error("COMPLETE PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

/**
 * Resend OTP
 * POST /api/auth/resend-otp
 * Body: { mobile }
 */
export const resendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    const formattedMobile = formatMobile(mobile);

    // Check for rate limiting
    const recentOtps = await Otp.countDocuments({
      mobile: formattedMobile,
      createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) },
    });

    if (recentOtps >= 3) {
      return res.status(429).json({
        success: false,
        message: "Too many OTP requests. Please try again after 10 minutes.",
      });
    }

    // Generate and send new OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.deleteMany({ mobile: formattedMobile });
    await Otp.create({ mobile: formattedMobile, otp, expiresAt });

    try {
      await sendOtpSmsWithRetry(formattedMobile, otp);
    } catch (smsError) {
      console.error("SMS Error:", smsError.message);
      if (process.env.NODE_ENV === "production") {
        return res.status(500).json({
          success: false,
          message: "Failed to send OTP. Please try again.",
        });
      }
    }

    res.json({
      success: true,
      message: "OTP resent successfully",
      ...(process.env.NODE_ENV !== "production" && { otp }),
    });
  } catch (error) {
    console.error("RESEND OTP ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error resending OTP",
    });
  }
};

/**
 * Get all users (Admin only)
 * GET /api/auth/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "User" })
      .select("-deviceToken")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

/**
 * Get user by ID
 * GET /api/auth/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id).select("-deviceToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET USER BY ID ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

/**
 * Update device token for push notifications
 * POST /api/auth/update-device-token/:id
 */
export const updateDeviceToken = async (req, res) => {
  try {
    const { deviceToken } = req.body;
    const { id } = req.params;

    if (!deviceToken) {
      return res.status(400).json({
        success: false,
        message: "Device token is required",
      });
    }

    await User.findByIdAndUpdate(id, { deviceToken }, { new: true });

    res.json({
      success: true,
      message: "Device token updated successfully",
    });
  } catch (error) {
    console.error("UPDATE DEVICE TOKEN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update device token",
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-deviceToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

/**
 * Logout user (clear device token)
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { deviceToken: null });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
