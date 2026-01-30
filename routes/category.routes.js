import express from "express";
import upload from "../middleware/upload.middleware.js";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import admin from "../middleware/admin.middleware.js";

const router = express.Router();

// 🔓 Public
router.get("/", getCategories);

// 🔒 Admin only
router.post("/", authMiddleware, admin, upload.single("image"), createCategory);
router.put("/:id", authMiddleware, admin, upload.single("image"), updateCategory);
router.delete("/:id", authMiddleware, admin, deleteCategory);

export default router;
