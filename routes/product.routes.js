import express from "express";
import auth from "../middleware/auth.middleware.js";
import admin from "../middleware/admin.middleware.js";
import { createProduct, getProducts, updateProduct, deleteProduct } from "../controllers/product.controller.js";

const router = express.Router();
router.post("/", auth, admin, createProduct);
router.get("/", auth, getProducts);
router.put("/:id", auth, admin, updateProduct);
router.delete("/:id", auth, admin, deleteProduct);
export default router;
