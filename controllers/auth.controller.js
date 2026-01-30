import User from "../models/User.js";
import Otp from "../models/Otp.js";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../services/email.service.js";

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const register = async (req, res) => {
  const data = req.body;
  if (await User.findOne({ email: data.email }))
    return res.status(400).json({ message: "Email exists" });

  await User.create(data);
  res.json({ message: "Registered. Await admin approval." });
};

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.isVerified)
    return res.status(403).json({ message: "Not verified" });

  const otp = generateOtp();
  await Otp.findOneAndUpdate(
    { email },
    { otp, expiresAt: new Date(Date.now() + 300000) },
    { upsert: true }
  );

  await sendOtpEmail(email, otp);
  res.json({ message: "OTP sent" });
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = await Otp.findOne({ email, otp });

  if (!record || record.expiresAt < new Date())
    return res.status(400).json({ message: "Invalid OTP" });

  await Otp.deleteOne({ email });
  const user = await User.findOne({ email });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  res.json({ token, user });
};
