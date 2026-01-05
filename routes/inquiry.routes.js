import express from "express";
import auth from "../middleware/auth.middleware.js";
import admin from "../middleware/admin.middleware.js";
import { createInquiry, getInquiries, updateInquiryStatus, deleteInquiry } from "../controllers/inquiry.controller.js";

const router = express.Router();
router.post("/", auth, createInquiry);
router.get("/", auth, admin, getInquiries);
router.put("/:id", auth, admin, updateInquiryStatus);
router.delete("/:id", auth, admin, deleteInquiry);
export default router;
