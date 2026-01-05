import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }
  },
  { timestamps: true }
);

subcategorySchema.index({ name: 1, categoryId: 1 }, { unique: true });

export default mongoose.model("Subcategory", subcategorySchema);
