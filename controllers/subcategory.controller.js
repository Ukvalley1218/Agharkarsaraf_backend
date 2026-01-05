import Subcategory from "../models/Subcategory.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

export const createSubcategory = async (req, res) => {
  const { name, categoryId } = req.body;
  const category = await Category.findById(categoryId);
  if (!category) return res.status(404).json({ message: "Category not found" });

  const sub = await Subcategory.create({ name, categoryId });
  res.json(sub);
};

export const getSubcategories = async (req, res) => {
  const { categoryId } = req.query;
  const filter = {};
  if (categoryId) filter.categoryId = categoryId;
  res.json(await Subcategory.find(filter));
};

export const updateSubcategory = async (req, res) => {
  res.json(await Subcategory.findByIdAndUpdate(req.params.id, req.body, { new: true }));
};

export const deleteSubcategory = async (req, res) => {
  const subId = req.params.id;
  const product = await Product.findOne({ subcategoryId: subId });
  if (product) return res.status(400).json({ message: "Cannot delete subcategory with products. Remove or reassign products first." });

  await Subcategory.findByIdAndDelete(subId);
  res.json({ message: "Subcategory deleted" });
};
