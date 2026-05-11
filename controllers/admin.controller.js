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

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    // Build search query
    const query = {
      role: { $ne: "ADMIN" },
      ...(search && {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }),
    };

    // Fetch users with pagination
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      data: users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get Users Error:", error);
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
