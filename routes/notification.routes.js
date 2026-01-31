import express from "express";
import { getUserNotifications, sendBulkNotification, sendNotification } from "../controllers/notification.controller.js";

const router = express.Router();

router.post("/send", sendNotification);
router.post("/send-bulk", sendBulkNotification);
router.get("/user/:userId", getUserNotifications);

export default router;
