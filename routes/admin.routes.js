import express from "express";
import auth from "../middleware/auth.middleware.js";
import admin from "../middleware/admin.middleware.js";
import {
  pendingUsers,
  verifyUser
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/pending-users", auth, admin, pendingUsers);
router.put("/verify-user/:id", auth, admin, verifyUser);

export default router;
