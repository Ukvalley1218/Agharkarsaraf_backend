import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db.js";
import cors from "cors";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import Category from "./routes/category.routes.js";
import Subcategory from "./routes/subcategory.routes.js";
import Product_routes from "./routes/product.routes.js";
import Inquiryroutes from "./routes/inquiry.routes.js";
import Bannerroutes from "./routes/banner.routes.js";
import Notificationroutes from "./routes/notification.routes.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.get("/", (_, res) => {
  res.send("Gold App Backend Running 🚀");
});
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", Category);
app.use("/api/subcategories", Subcategory);
app.use("/api/products", Product_routes);
app.use("/api/inquiry", Inquiryroutes);
app.use("/api/banner", Bannerroutes);
app.use("/api/notifications", Notificationroutes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on http://localhost:${process.env.PORT}`),
);
