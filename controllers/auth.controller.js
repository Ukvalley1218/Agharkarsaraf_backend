import User from "../models/User.js";
import Otp from "../models/Otp.js";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../services/email.service.js";

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const register = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password)
      return res.status(400).json({ message: "All fields required" });

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user)
      return res.status(404).json({ message: "User not found. Verify OTP first." });

    if (!user.isVerified)
      return res.status(403).json({ message: "Email not verified" });

    // Update profile
    user.name = name;
    user.password = password; // ⚠️ Make sure you hash in model pre-save hook
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({ message: "Registration completed", token, user });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Registration failed" });
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
      { upsert: true, new: true }
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
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    const cleanEmail = email.toLowerCase().trim();

    const record = await Otp.findOne({ email: cleanEmail, otp });
    if (!record) return res.status(400).json({ message: "Invalid OTP" });

    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ email: cleanEmail });
      return res.status(400).json({ message: "OTP expired" });
    }

    // 🔍 Check if user already exists
    let user = await User.findOne({ email: cleanEmail });

    // 🆕 If not, create minimal user
    if (!user) {
      user = await User.create({
        email: cleanEmail,
        isVerified: true,
        role: "User", // default role
      });
    }

    await Otp.deleteOne({ email: cleanEmail });

    res.json({ message: "OTP verified. User created.", userId: user._id });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

