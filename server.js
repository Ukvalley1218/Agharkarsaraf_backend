import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db.js";

dotenv.config();
const app = express();
app.use(express.json());

connectDB();
app.get("/", (_, res) => {
  res.send("Gold App Backend Running 🚀");
});
app.use("/api/admin", (await import("./routes/admin.routes.js")).default);
app.use("/api/auth", (await import("./routes/auth.routes.js")).default);
app.use(
  "/api/categories",
  (await import("./routes/category.routes.js")).default
);
app.use(
  "/api/subcategories",
  (await import("./routes/subcategory.routes.js")).default
);
app.use("/api/products", (await import("./routes/product.routes.js")).default);
app.use("/api/inquiry", (await import("./routes/inquiry.routes.js")).default);

app.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.PORT}`)
);
