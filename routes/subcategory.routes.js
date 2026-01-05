import express from "express";
import auth from "../middleware/auth.middleware.js";
import admin from "../middleware/admin.middleware.js";
import { createSubcategory, getSubcategories, updateSubcategory, deleteSubcategory } from "../controllers/subcategory.controller.js";

const router = express.Router();
router.post("/", auth, admin, createSubcategory);
router.get("/", auth, getSubcategories);
router.put("/:id", auth, admin, updateSubcategory);
router.delete("/:id", auth, admin, deleteSubcategory);
export default router;
