import express from "express";
import auth from "../middleware/auth.middleware.js";
import admin from "../middleware/admin.middleware.js";
import { createCategory, getCategories, updateCategory, deleteCategory } from "../controllers/category.controller.js";

const router = express.Router();
router.post("/", auth, admin, createCategory);
router.get("/", auth, getCategories);
router.put("/:id", auth, admin, updateCategory);
router.delete("/:id", auth, admin, deleteCategory);
export default router;
