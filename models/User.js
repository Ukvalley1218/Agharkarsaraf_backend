import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    mobile: String,
    address: String,
    shopName: String,
    gstNo: String,
    email: { type: String, unique: true },
    userType: { type: String, enum: ["WHOLESALER", "RETAILER"] },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
    isVerified: { type: Boolean, default: false },
    deviceToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
