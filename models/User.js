import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  address: String,
  shopName: String,
  gstNo: String,
  email: { type: String, unique: true },
  userType: { type: String, enum: ["WHOLESALER", "RETAILER"] },
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
