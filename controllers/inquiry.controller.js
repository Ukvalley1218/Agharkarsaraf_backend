import Inquiry from "../models/Inquiry.js";

export const createInquiry = async (req, res) => {
  try {
    const { productId, message } = req.body;
    const userId = req.user.id;

    if (!productId || !message) {
      return res.status(400).json({
        message: "Product ID and message are required",
      });
    }

    // ✅ Check only PENDING inquiry for same user + product
    const existingInquiry = await Inquiry.findOne({
      userId,
      productId,
      status: "PENDING",
    });

    if (existingInquiry) {
      return res.status(409).json({
        message:
          "Your inquiry for this product is already pending. Our team will contact you soon.",
        inquiry: existingInquiry,
      });
    }

    // ✅ Create new inquiry if no PENDING one exists
    const inquiry = await Inquiry.create({
      userId,
      productId,
      message,
      status: "PENDING",
    });

    res.status(201).json({
      message: "Inquiry submitted successfully",
      inquiry,
    });
  } catch (error) {
    console.error("Create Inquiry Error:", error);
    res.status(500).json({
      message: "Something went wrong while creating inquiry",
    });
  }
};

export const getInquiries = async (_, res) => {
  res.json(await Inquiry.find().populate("userId").populate("productId"));
};

export const updateInquiryStatus = async (req, res) => {
  res.json(
    await Inquiry.findByIdAndUpdate(req.params.id, req.body, { new: true }),
  );
};

export const deleteInquiry = async (req, res) => {
  await Inquiry.findByIdAndDelete(req.params.id);
  res.json({ message: "Inquiry deleted" });
};
