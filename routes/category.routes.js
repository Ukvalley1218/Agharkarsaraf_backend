import express from "express";
import upload from "../middleware/upload.js";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminOnly.js";

const router = express.Router();

// 🔓 Public
router.get("/", getCategories);

// 🔒 Admin only
router.post("/", authMiddleware, adminOnly, upload.single("image"), createCategory);
router.put("/:id", authMiddleware, adminOnly, upload.single("image"), updateCategory);
router.delete("/:id", authMiddleware, adminOnly, deleteCategory);

export default router;
