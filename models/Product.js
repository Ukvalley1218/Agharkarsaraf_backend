import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },
  grams: Number,
  rate: Number,
  description: String,
  images: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
