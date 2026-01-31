import {
  register,
  sendOtp,
  verifyOtp,
  getAllUsers,
  getUserById,
} from "../controllers/auth.controller.js";

import User from "../models/User.js";
import Otp from "../models/Otp.js";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../services/email.service.js";
import mongoose from "mongoose";
// import { jest } from "@jest/globals";


jest.mock("../models/User.js");
jest.mock("../models/Otp.js");
jest.mock("../services/email.service.js");
jest.mock("jsonwebtoken");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Auth Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /* =======================
     REGISTER
     ======================= */
  describe("register", () => {
    it("should update user profile", async () => {
      const req = {
        body: {
          email: "test@test.com",
          name: "John",
          mobile: "9999999999",
          address: "Pune",
          shopName: "Shop",
          gstNo: "GST123",
        },
      };

      const res = mockResponse();

      const mockUser = {
        save: jest.fn(),
      };

      User.findOne.mockResolvedValue(mockUser);

      await register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@test.com" });
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Profile completed successfully",
        user: mockUser,
      });
    });

    it("should return 404 if user not found", async () => {
      const req = {
        body: { email: "test@test.com", name: "John", mobile: "999" },
      };
      const res = mockResponse();

      User.findOne.mockResolvedValue(null);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  /* =======================
     SEND OTP
     ======================= */
  describe("sendOtp", () => {
    it("should send OTP successfully", async () => {
      const req = { body: { email: "test@test.com" } };
      const res = mockResponse();

      Otp.findOneAndUpdate.mockResolvedValue(true);
      sendOtpEmail.mockResolvedValue(true);

      await sendOtp(req, res);

      expect(Otp.findOneAndUpdate).toHaveBeenCalled();
      expect(sendOtpEmail).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "OTP sent successfully",
      });
    });

    it("should fail if email missing", async () => {
      const req = { body: {} };
      const res = mockResponse();

      await sendOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  /* =======================
     VERIFY OTP
     ======================= */
  describe("verifyOtp", () => {
    it("should verify OTP and login user", async () => {
      const req = {
        body: { email: "test@test.com", otp: "123456" },
      };
      const res = mockResponse();

      Otp.findOne.mockResolvedValue({
        otp: "123456",
        expiresAt: new Date(Date.now() + 60000),
      });

      User.findOne.mockResolvedValue({
        _id: "user123",
        role: "User",
      });

      jwt.sign.mockReturnValue("jwt_token");

      await verifyOtp(req, res);

      expect(jwt.sign).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Login successful",
          token: "jwt_token",
        }),
      );
    });

    it("should reject expired OTP", async () => {
      const req = {
        body: { email: "test@test.com", otp: "123456" },
      };
      const res = mockResponse();

      Otp.findOne.mockResolvedValue({
        expiresAt: new Date(Date.now() - 1000),
      });

      await verifyOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "OTP expired" });
    });
  });

  /* =======================
     GET ALL USERS
     ======================= */
  describe("getAllUsers", () => {
    it("should return users list", async () => {
      const req = {};
      const res = mockResponse();

      const users = [{ email: "a@test.com" }, { email: "b@test.com" }];
      User.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(users),
      });

      await getAllUsers(req, res);

      expect(res.json).toHaveBeenCalledWith({
        count: users.length,
        users,
      });
    });
  });

  /* =======================
     GET USER BY ID
     ======================= */
  describe("getUserById", () => {
    it("should return user by id", async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const req = { params: { id } };
      const res = mockResponse();

      User.findById.mockResolvedValue({ _id: id });

      await getUserById(req, res);

      expect(User.findById).toHaveBeenCalledWith(id);
      expect(res.json).toHaveBeenCalled();
    });

    it("should return 400 for invalid id", async () => {
      const req = { params: { id: "invalid-id" } };
      const res = mockResponse();

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid user ID",
      });
    });
  });
});

export const updateDeviceToken = async (req, res) => {
  try {
    const { deviceToken } = req.body;

    if (!deviceToken) {
      return res.status(400).json({ message: "Device token is required" });
    }

    const userId = req.user.id; // from auth middleware

    await User.findByIdAndUpdate(userId, { deviceToken }, { new: true });

    res.json({ message: "Device token updated successfully" });
  } catch (error) {
    console.error("UPDATE DEVICE TOKEN ERROR:", error);
    res.status(500).json({ message: "Failed to update device token" });
  }
};
