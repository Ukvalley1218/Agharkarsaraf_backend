import express from "express";
import auth from "../middleware/auth.middleware.js";
import admin from "../middleware/admin.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { createProduct, getProducts, updateProduct, deleteProduct, addProductImages, removeProductImage } from "../controllers/product.controller.js";

const router = express.Router();
router.post("/", auth, admin, upload.array("images", 6), createProduct);
router.get("/", auth, getProducts);
router.put("/:id", auth, admin, upload.array("images", 6), updateProduct);
router.delete("/:id", auth, admin, deleteProduct);

// Admin: add images to product
router.post("/:id/images", auth, admin, upload.array("images", 6), addProductImages);
// Admin: remove image by public_id
router.delete("/:id/images/:publicId", auth, admin, removeProductImage);

export default router;
