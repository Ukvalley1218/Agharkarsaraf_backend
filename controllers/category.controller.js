import Category from "../models/Category.js";
import Subcategory from "../models/Subcategory.js";
import Product from "../models/Product.js";

export const createCategory = async (req, res) => {
  res.json(await Category.create(req.body));
};

export const getCategories = async (_, res) => {
  const categories = await Category.find();
  const categoriesWithSubs = await Promise.all(
    categories.map(async (cat) => {
      const subcategories = await Subcategory.find({ categoryId: cat._id });
      return { ...cat.toObject(), subcategories };
    })
  );
  res.json(categoriesWithSubs);
};

export const updateCategory = async (req, res) => {
  res.json(await Category.findByIdAndUpdate(req.params.id, req.body, { new: true }));
};

export const deleteCategory = async (req, res) => {
  const id = req.params.id;
  const hasSub = await Subcategory.findOne({ categoryId: id });
  const hasProducts = await Product.findOne({ categoryId: id });
  if (hasSub || hasProducts) {
    return res.status(400).json({ message: "Cannot delete category with subcategories or products. Remove or reassign them first." });
  }

  await Category.findByIdAndDelete(id);
  res.json({ message: "Category deleted" });
};

