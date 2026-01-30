import Category from "../models/Category.js";
import Subcategory from "../models/Subcategory.js";
import Product from "../models/Product.js";
import { uploadImageBuffer } from "../services/cloudinary.service.js";

export const createCategory = async (req, res) => {
  try {
    let imageData = {};

    // if image is sent
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
    console.error(error);
    res.status(500).json({ message: "Failed to create category" });
  }
};

export const getCategories = async (_, res) => {
  const categories = await Category.find();
  const categoriesWithSubs = await Promise.all(
    categories.map(async (cat) => {
      const subcategories = await Subcategory.find({ categoryId: cat._id });
      return { ...cat.toObject(), subcategories };
    }),
  );
  res.json(categoriesWithSubs);
};

export const updateCategory = async (req, res) => {
  res.json(
    await Category.findByIdAndUpdate(req.params.id, req.body, { new: true }),
  );
};

export const deleteCategory = async (req, res) => {
  const id = req.params.id;

  const hasSub = await Subcategory.findOne({ categoryId: id });
  const hasProducts = await Product.findOne({ categoryId: id });

  if (hasSub || hasProducts) {
    return res.status(400).json({
      message:
        "Cannot delete category with subcategories or products. Remove or reassign them first.",
    });
  }

  const category = await Category.findById(id);

  if (category?.imagePublicId) {
    await deleteImage(category.imagePublicId);
  }

  await Category.findByIdAndDelete(id);
  res.json({ message: "Category deleted" });
};
