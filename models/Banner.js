import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema(
  {
    title: { type: String },
    link: { type: String },
    alt: { type: String },
    imageUrl: { type: String, required: true },
    public_id: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", BannerSchema);
