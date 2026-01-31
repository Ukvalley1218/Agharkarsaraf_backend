import { pendingUsers, getAllUsers, verifyUser } from "../controllers/admin.controller.js";
import User from "../models/User.js";

jest.mock("../models/User.js");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("User Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /* =======================
     GET ALL PENDING USERS
     ======================= */
  describe("pendingUsers", () => {
    it("should return pending users", async () => {
      const req = {};
      const res = mockResponse();

      const mockUsers = [
        { _id: "1", isVerified: false },
        { _id: "2", isVerified: false },
      ];

      User.find.mockResolvedValue(mockUsers);

      await pendingUsers(req, res);

      expect(User.find).toHaveBeenCalledWith({ isVerified: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it("should handle server error", async () => {
      const req = {};
      const res = mockResponse();

      User.find.mockRejectedValue(new Error("DB Error"));

      await pendingUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  /* =======================
     GET ALL USERS (NON ADMIN)
     ======================= */
  describe("getAllUsers", () => {
    it("should return all non-admin users", async () => {
      const req = {};
      const res = mockResponse();

      const mockUsers = [
        { _id: "1", role: "USER" },
        { _id: "2", role: "DRIVER" },
      ];

      User.find.mockResolvedValue(mockUsers);

      await getAllUsers(req, res);

      expect(User.find).toHaveBeenCalledWith({
        role: { $ne: "ADMIN" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it("should handle server error", async () => {
      const req = {};
      const res = mockResponse();

      User.find.mockRejectedValue(new Error("DB Error"));

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  /* =======================
     VERIFY USER
     ======================= */
  describe("verifyUser", () => {
    it("should verify a user", async () => {
      const req = {
        params: { id: "123" },
      };
      const res = mockResponse();

      User.findByIdAndUpdate.mockResolvedValue(true);

      await verifyUser(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith("123", {
        isVerified: true,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "User verified" });
    });

    it("should handle server error", async () => {
      const req = {
        params: { id: "123" },
      };
      const res = mockResponse();

      User.findByIdAndUpdate.mockRejectedValue(new Error("DB Error"));

      await verifyUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
});
