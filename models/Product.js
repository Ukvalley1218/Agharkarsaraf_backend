import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory", required: true  },
  grams: Number,
  price: Number,
  description: String,
  // store image objects so we can keep cloudinary public_id and alt text
  images: [
    {
      url: String,
      public_id: String,
      alt: String,
    }
  ],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
