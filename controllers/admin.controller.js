import User from "../models/User.js";

/* GET ALL PENDING USERS */
export const pendingUsers = async (req, res) => {
  try {
    const users = await User.find({ isVerified: false });
    res.status(200).json(users);
  } catch (error) {
    console.error("Pending Users Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* VERIFY USER */
export const verifyUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isVerified: true });
    res.status(200).json({ message: "User verified" });
  } catch (error) {
    console.error("Verify User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
