import Inquiry from "../models/Inquiry.js";

export const createInquiry = async (req, res) => {
  res.json(await Inquiry.create({ ...req.body, userId: req.user.id }));
};

export const getInquiries = async (_, res) => {
  res.json(await Inquiry.find().populate("userId").populate("productId"));
};

export const updateInquiryStatus = async (req, res) => {
  res.json(await Inquiry.findByIdAndUpdate(req.params.id, req.body, { new: true }));
};

export const deleteInquiry = async (req, res) => {
  await Inquiry.findByIdAndDelete(req.params.id);
  res.json({ message: "Inquiry deleted" });
};
