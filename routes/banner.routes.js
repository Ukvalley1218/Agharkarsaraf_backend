import express from "express";
import { getActiveBanner } from "../controllers/banner.controller.js";

const router = express.Router();

// public route to fetch current active banner
router.get("/", getActiveBanner);

export default router;
