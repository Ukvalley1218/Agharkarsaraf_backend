import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  message: String,
  status: { type: String, enum: ["PENDING", "CONTACTED"], default: "PENDING" }
}, { timestamps: true });

export default mongoose.model("Inquiry", inquirySchema);
