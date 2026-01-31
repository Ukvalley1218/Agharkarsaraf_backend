import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  addProductImages,
  removeProductImage,
} from "../controllers/product.controller.js";

import Product from "../models/Product.js";
import Subcategory from "../models/Subcategory.js";
import { uploadImageBuffer, deleteImage } from "../services/cloudinary.service.js";

jest.mock("../models/Product.js");
jest.mock("../models/Subcategory.js");
jest.mock("../services/cloudinary.service.js");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Product Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /* =======================
     CREATE PRODUCT
     ======================= */
  describe("createProduct", () => {
    it("should create product with images", async () => {
      const req = {
        body: { name: "Ring", categoryId: "cat1" },
        files: [{ buffer: Buffer.from("img1") }],
      };
      const res = mockResponse();

      uploadImageBuffer.mockResolvedValue({
        secure_url: "img.jpg",
        public_id: "pid123",
      });

      Product.create.mockResolvedValue({ name: "Ring" });

      await createProduct(req, res);

      expect(uploadImageBuffer).toHaveBeenCalled();
      expect(Product.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it("should reject invalid subcategory", async () => {
      const req = {
        body: { subcategoryId: "sub1" },
      };
      const res = mockResponse();

      Subcategory.findById.mockResolvedValue(null);

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  /* =======================
     GET PRODUCTS
     ======================= */
  describe("getProducts", () => {
    it("should return filtered products", async () => {
      const req = {
        query: { search: "ring" },
      };
      const res = mockResponse();

      const products = [{ name: "Gold Ring" }];

      Product.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(products),
        }),
      });

      await getProducts(req, res);

      expect(Product.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(products);
    });
  });

  /* =======================
     UPDATE PRODUCT
     ======================= */
  describe("updateProduct", () => {
    it("should update product and remove images", async () => {
      const req = {
        params: { id: "prod1" },
        body: {
          removePublicIds: ["img1"],
          name: "Updated",
        },
        files: [],
      };
      const res = mockResponse();

      const product = {
        images: [{ public_id: "img1" }],
        save: jest.fn(),
      };

      Product.findById.mockResolvedValue(product);
      deleteImage.mockResolvedValue(true);

      await updateProduct(req, res);

      expect(deleteImage).toHaveBeenCalledWith("img1");
      expect(product.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(product);
    });

    it("should return 404 if product not found", async () => {
      const req = { params: { id: "invalid" }, body: {} };
      const res = mockResponse();

      Product.findById.mockResolvedValue(null);

      await updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  /* =======================
     DELETE PRODUCT
     ======================= */
  describe("deleteProduct", () => {
    it("should delete product and images", async () => {
      const req = { params: { id: "prod1" } };
      const res = mockResponse();

      Product.findById.mockResolvedValue({
        images: [{ public_id: "img1" }],
      });

      Product.findByIdAndDelete.mockResolvedValue(true);
      deleteImage.mockResolvedValue(true);

      await deleteProduct(req, res);

      expect(deleteImage).toHaveBeenCalledWith("img1");
      expect(res.json).toHaveBeenCalledWith({
        message: "Product deleted",
      });
    });
  });

  /* =======================
     ADD PRODUCT IMAGES
     ======================= */
  describe("addProductImages", () => {
    it("should add images to product", async () => {
      const req = {
        params: { id: "prod1" },
        files: [{ buffer: Buffer.from("img") }],
        body: {},
      };
      const res = mockResponse();

      const product = {
        images: [],
        save: jest.fn(),
      };

      Product.findById.mockResolvedValue(product);
      uploadImageBuffer.mockResolvedValue({
        secure_url: "img.jpg",
        public_id: "pid1",
      });

      await addProductImages(req, res);

      expect(product.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  /* =======================
     REMOVE PRODUCT IMAGE
     ======================= */
  describe("removeProductImage", () => {
    it("should remove single image", async () => {
      const req = {
        params: { id: "prod1", publicId: "img1" },
      };
      const res = mockResponse();

      const product = {
        images: [{ public_id: "img1" }],
        save: jest.fn(),
      };

      Product.findById.mockResolvedValue(product);
      deleteImage.mockResolvedValue(true);

      await removeProductImage(req, res);

      expect(deleteImage).toHaveBeenCalledWith("img1");
      expect(product.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(product);
    });
  });
});
