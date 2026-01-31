import {
  createOrUpdateBanner,
  getActiveBanner,
  deleteBanner,
} from "../controllers/banner.controller.js";

import Banner from "../models/Banner.js";
import { uploadImageBuffer, deleteImage } from "../services/cloudinary.service.js";

jest.mock("../models/Banner.js");
jest.mock("../services/cloudinary.service.js");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Banner Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /* =======================
     CREATE / UPDATE BANNER
     ======================= */
  describe("createOrUpdateBanner", () => {
    it("should create banner when image is provided", async () => {
      const req = {
        body: {
          title: "Sale",
          link: "/sale",
          alt: "Banner",
        },
        file: {
          buffer: Buffer.from("image"),
        },
      };

      const res = mockResponse();

      uploadImageBuffer.mockResolvedValue({
        secure_url: "http://image.jpg",
        public_id: "img123",
      });

      await createOrUpdateBanner(req, res);

      expect(uploadImageBuffer).toHaveBeenCalled();
      expect(Banner).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Sale",
          imageUrl: "http://image.jpg",
          public_id: "img123",
          isActive: true,
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    it("should return 400 when no image provided", async () => {
      const req = { body: {} };
      const res = mockResponse();

      await createOrUpdateBanner(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "No image provided and no existing banner found",
      });
    });
  });

  /* =======================
     GET ACTIVE BANNER
     ======================= */
  describe("getActiveBanner", () => {
    it("should return active banner", async () => {
      const req = {};
      const res = mockResponse();

      const banner = [{ title: "Active Banner" }];
      Banner.find.mockResolvedValue(banner);

      await getActiveBanner(req, res);

      expect(Banner.find).toHaveBeenCalledWith({ isActive: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(banner);
    });

    it("should return 404 if no banner found", async () => {
      const req = {};
      const res = mockResponse();

      Banner.find.mockResolvedValue(null);

      await getActiveBanner(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No active banner",
      });
    });
  });

  /* =======================
     DELETE BANNER
     ======================= */
  describe("deleteBanner", () => {
    it("should delete banner by id", async () => {
      const req = {
        params: { id: "banner123" },
      };
      const res = mockResponse();

      const banner = {
        _id: "banner123",
        public_id: "img123",
      };

      Banner.findById.mockResolvedValue(banner);
      deleteImage.mockResolvedValue(true);
      Banner.findByIdAndDelete.mockResolvedValue(true);

      await deleteBanner(req, res);

      expect(deleteImage).toHaveBeenCalledWith("img123");
      expect(Banner.findByIdAndDelete).toHaveBeenCalledWith("banner123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Banner deleted",
      });
    });

    it("should delete active banner if id not provided", async () => {
      const req = { params: {} };
      const res = mockResponse();

      const banner = {
        _id: "active123",
        public_id: "img999",
      };

      Banner.findOne.mockResolvedValue(banner);
      Banner.findByIdAndDelete.mockResolvedValue(true);

      await deleteBanner(req, res);

      expect(Banner.findOne).toHaveBeenCalledWith({ isActive: true });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if banner not found", async () => {
      const req = { params: { id: "invalid" } };
      const res = mockResponse();

      Banner.findById.mockResolvedValue(null);

      await deleteBanner(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Banner not found",
      });
    });
  });
});
