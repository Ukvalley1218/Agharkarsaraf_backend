import User from "../models/User.js";
import Otp from "../models/Otp.js";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../services/email.service.js";
import mongoose from "mongoose";
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const register = async (req, res) => {
  try {
    const { email, name, mobile, address, shopName, gstNo, deviceTokens } =
      req.body;

    if (!email || !name || !mobile || !shopName) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found. Login with OTP first." });

    // ✏️ Update profile
    user.name = name;
    user.mobile = mobile;
    user.address = address;
    user.shopName = shopName;
    user.gstNo = gstNo;

    // 🔔 Save device token if provided
    if (deviceToken) {
      user.deviceToken = deviceToken;
    }

    await user.save();

    res.json({ message: "Profile completed successfully", user });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Profile update failed" });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const cleanEmail = email.toLowerCase().trim();
    const otp = generateOtp();

    await Otp.findOneAndUpdate(
      { email: cleanEmail },
      { otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
      { upsert: true, new: true },
    );

    await sendOtpEmail(cleanEmail, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

export const verifyOtp = async (req, res) => {
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

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // newest first

    res.json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔍 Check if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("GET USER BY ID ERROR:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};
