import Category from "../models/Category.js";
import Subcategory from "../models/Subcategory.js";
import Product from "../models/Product.js";
import { uploadImageBuffer, deleteImage } from "../services/cloudinary.service.js";
import mongoose from "mongoose";

/* ================= CREATE CATEGORY ================= */
export const createCategory = async (req, res) => {
  try {
    let imageData = {};

    if (req.file) {
      const result = await uploadImageBuffer(req.file.buffer, "categories");

      imageData = {
        image: result.secure_url,
        imagePublicId: result.public_id,
      };
    }

    const category = await Category.create({
      ...req.body,
      ...imageData,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
};


/* ================= GET ALL CATEGORIES (NO SUBCATEGORIES) ================= */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    res.json(categories);
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};


/* ================= UPDATE CATEGORY ================= */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // If new image uploaded → delete old image
    if (req.file) {
      if (category.imagePublicId) {
        await deleteImage(category.imagePublicId);
      }

      const result = await uploadImageBuffer(req.file.buffer, "categories");

      req.body.image = result.secure_url;
      req.body.imagePublicId = result.public_id;
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);
    res.status(500).json({ message: "Failed to update category" });
  }
};


/* ================= DELETE CATEGORY ================= */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const hasSub = await Subcategory.findOne({ categoryId: id });
    const hasProducts = await Product.findOne({ categoryId: id });

    if (hasSub || hasProducts) {
      return res.status(400).json({
        message:
          "Cannot delete category with subcategories or products. Remove or reassign them first.",
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.imagePublicId) {
      await deleteImage(category.imagePublicId);
    }

    await Category.findByIdAndDelete(id);

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
};
