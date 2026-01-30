import express from "express";
import auth from "../middleware/auth.middleware.js";
import admin from "../middleware/admin.middleware.js";
import upload from "../middleware/upload.middleware.js";
import {
  getAllUsers,
  pendingUsers,
  verifyUser
} from "../controllers/admin.controller.js";
import { createOrUpdateBanner, deleteBanner } from "../controllers/banner.controller.js";

const router = express.Router();

router.get("/pending-users", auth, admin, pendingUsers);
router.get("/users", auth, admin, getAllUsers);
router.put("/verify-user/:id", auth, admin, verifyUser);

// Admin: upload or update banner (multipart: field name 'image')
router.post("/banner", auth, admin, upload.single("image"), createOrUpdateBanner);
// Admin: delete banner (optional id -> deletes active banner when omitted)
router.delete("/banner/:id?", auth, admin, deleteBanner);

export default router;
