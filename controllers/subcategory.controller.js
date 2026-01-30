import Subcategory from "../models/Subcategory.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

export const createSubcategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    // ✅ validation
    if (!name || !categoryId) {
      return res.status(400).json({ message: "Name and categoryId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid categoryId" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const sub = await Subcategory.create({
      name,
      categoryId,
    });

    res.json(sub);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create subcategory" });
  }
};


export const getSubcategories = async (req, res) => {
  try {
    const { categoryId } = req.query;

    const filter = {};
    if (categoryId) filter.categoryId = categoryId;

    const subcategories = await Subcategory.find(filter).populate("categoryId"); // 👈 populate category

    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subcategories" });
  }
};

export const updateSubcategory = async (req, res) => {
  res.json(
    await Subcategory.findByIdAndUpdate(req.params.id, req.body, { new: true }),
  );
};

export const deleteSubcategory = async (req, res) => {
  const subId = req.params.id;
  const product = await Product.findOne({ subcategoryId: subId });
  if (product)
    return res.status(400).json({
      message:
        "Cannot delete subcategory with products. Remove or reassign products first.",
    });

  await Subcategory.findByIdAndDelete(subId);
  res.json({ message: "Subcategory deleted" });
};
