import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

import Category from "../models/Category.js";
import Subcategory from "../models/Subcategory.js";
import Product from "../models/Product.js";
import { uploadImageBuffer, deleteImage } from "../services/cloudinary.service.js";
import mongoose from "mongoose";

jest.mock("../models/Category.js");
jest.mock("../models/Subcategory.js");
jest.mock("../models/Product.js");
jest.mock("../services/cloudinary.service.js");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Category Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /* =======================
     CREATE CATEGORY
     ======================= */
  describe("createCategory", () => {
    it("should create category with image", async () => {
      const req = {
        body: { name: "Electronics" },
        file: {
          buffer: Buffer.from("image"),
        },
      };
      const res = mockResponse();

      uploadImageBuffer.mockResolvedValue({
        secure_url: "img.jpg",
        public_id: "img123",
      });

      Category.create.mockResolvedValue({
        name: "Electronics",
        image: "img.jpg",
      });

      await createCategory(req, res);

      expect(uploadImageBuffer).toHaveBeenCalled();
      expect(Category.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Electronics",
          image: "img.jpg",
          imagePublicId: "img123",
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should create category without image", async () => {
      const req = { body: { name: "Clothes" } };
      const res = mockResponse();

      Category.create.mockResolvedValue({ name: "Clothes" });

      await createCategory(req, res);

      expect(Category.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  /* =======================
     GET CATEGORIES
     ======================= */
  describe("getCategories", () => {
    it("should return categories sorted", async () => {
      const req = {};
      const res = mockResponse();

      const categories = [{ name: "A" }, { name: "B" }];

      Category.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(categories),
      });

      await getCategories(req, res);

      expect(res.json).toHaveBeenCalledWith(categories);
    });
  });

  /* =======================
     UPDATE CATEGORY
     ======================= */
  describe("updateCategory", () => {
    it("should update category with new image", async () => {
      const id = new mongoose.Types.ObjectId().toString();

      const req = {
        params: { id },
        body: { name: "Updated" },
        file: {
          buffer: Buffer.from("new-image"),
        },
      };

      const res = mockResponse();

      Category.findById.mockResolvedValue({
        imagePublicId: "old_img",
      });

      uploadImageBuffer.mockResolvedValue({
        secure_url: "new.jpg",
        public_id: "new_img",
      });

      Category.findByIdAndUpdate.mockResolvedValue({
        name: "Updated",
      });

      await updateCategory(req, res);

      expect(deleteImage).toHaveBeenCalledWith("old_img");
      expect(uploadImageBuffer).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it("should return 400 for invalid ID", async () => {
      const req = {
        params: { id: "invalid-id" },
      };
      const res = mockResponse();

      await updateCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  /* =======================
     DELETE CATEGORY
     ======================= */
  describe("deleteCategory", () => {
    it("should delete category successfully", async () => {
      const id = new mongoose.Types.ObjectId().toString();

      const req = { params: { id } };
      const res = mockResponse();

      Subcategory.findOne.mockResolvedValue(null);
      Product.findOne.mockResolvedValue(null);

      Category.findById.mockResolvedValue({
        imagePublicId: "img123",
      });

      Category.findByIdAndDelete.mockResolvedValue(true);

      await deleteCategory(req, res);

      expect(deleteImage).toHaveBeenCalledWith("img123");
      expect(Category.findByIdAndDelete).toHaveBeenCalledWith(id);
      expect(res.json).toHaveBeenCalledWith({
        message: "Category deleted successfully",
      });
    });

    it("should prevent delete if subcategory exists", async () => {
      const id = new mongoose.Types.ObjectId().toString();

      const req = { params: { id } };
      const res = mockResponse();

      Subcategory.findOne.mockResolvedValue({ _id: "sub1" });

      await deleteCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 if category not found", async () => {
      const id = new mongoose.Types.ObjectId().toString();

      const req = { params: { id } };
      const res = mockResponse();

      Subcategory.findOne.mockResolvedValue(null);
      Product.findOne.mockResolvedValue(null);
      Category.findById.mockResolvedValue(null);

      await deleteCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
