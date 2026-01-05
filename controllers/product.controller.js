import Product from "../models/Product.js";
import Subcategory from "../models/Subcategory.js";

export const createProduct = async (req, res) => {
  const { categoryId, subcategoryId } = req.body;

  if (subcategoryId) {
    const sub = await Subcategory.findById(subcategoryId);
    if (!sub) return res.status(404).json({ message: "Subcategory not found" });
    if (categoryId && sub.categoryId.toString() !== categoryId)
      return res.status(400).json({ message: "Subcategory does not belong to the specified category" });
  }

  res.json(await Product.create(req.body));
};

export const getProducts = async (req, res) => {
  const {
    categoryId,
    subcategoryId,
    minGram,
    maxGram,
    minRate,
    maxRate,
    search,
  } = req.query;

  let filter = { isActive: true };

  if (categoryId) filter.categoryId = categoryId;
  if (subcategoryId) filter.subcategoryId = subcategoryId;
  if (search) filter.name = { $regex: search, $options: "i" };

  if (minGram || maxGram)
    filter.grams = { $gte: +minGram || 0, $lte: +maxGram || 9999 };

  if (minRate || maxRate)
    filter.rate = { $gte: +minRate || 0, $lte: +maxRate || 999999 };

  res.json(
    await Product.find(filter).populate("categoryId").populate("subcategoryId")
  );
};

export const updateProduct = async (req, res) => {
  const { categoryId, subcategoryId } = req.body;

  if (subcategoryId) {
    const sub = await Subcategory.findById(subcategoryId);
    if (!sub) return res.status(404).json({ message: "Subcategory not found" });
    if (categoryId && sub.categoryId.toString() !== categoryId)
      return res.status(400).json({ message: "Subcategory does not belong to the specified category" });
  }

  res.json(
    await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
  );
};

export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
};
