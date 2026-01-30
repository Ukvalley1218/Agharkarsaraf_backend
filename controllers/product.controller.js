import Product from "../models/Product.js";
import Subcategory from "../models/Subcategory.js";
import { uploadImageBuffer, deleteImage } from "../services/cloudinary.service.js";

export const createProduct = async (req, res) => {
  const { categoryId, subcategoryId } = req.body;

  if (subcategoryId) {
    const sub = await Subcategory.findById(subcategoryId);
    if (!sub) return res.status(404).json({ message: "Subcategory not found" });
    if (categoryId && sub.categoryId.toString() !== categoryId)
      return res.status(400).json({ message: "Subcategory does not belong to the specified category" });
  }

  // handle uploaded files (if any)
  if (req.files && req.files.length) {
    const uploads = await Promise.all(
      req.files.map((f) => uploadImageBuffer(f.buffer))
    );
    // map to stored image objects
    req.body.images = uploads.map((u, i) => ({ url: u.secure_url, public_id: u.public_id, alt: req.body[`alt_${i}`] ?? "" }));
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
  const { categoryId, subcategoryId, removePublicIds } = req.body;

  if (subcategoryId) {
    const sub = await Subcategory.findById(subcategoryId);
    if (!sub) return res.status(404).json({ message: "Subcategory not found" });
    if (categoryId && sub.categoryId.toString() !== categoryId)
      return res.status(400).json({ message: "Subcategory does not belong to the specified category" });
  }

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  // remove images by public_id if requested
  if (removePublicIds && Array.isArray(removePublicIds)) {
    for (const pid of removePublicIds) {
      const idx = product.images.findIndex((i) => i.public_id === pid);
      if (idx !== -1) {
        if (product.images[idx].public_id) await deleteImage(product.images[idx].public_id);
        product.images.splice(idx, 1);
      }
    }
  }

  // handle new uploaded files (append)
  if (req.files && req.files.length) {
    const uploads = await Promise.all(req.files.map((f) => uploadImageBuffer(f.buffer)));
    const mapped = uploads.map((u, i) => ({ url: u.secure_url, public_id: u.public_id, alt: req.body[`alt_${i}`] ?? "" }));
    product.images.push(...mapped);
  }

  // update other fields
  product.name = req.body.name ?? product.name;
  product.categoryId = req.body.categoryId ?? product.categoryId;
  product.subcategoryId = req.body.subcategoryId ?? product.subcategoryId;
  product.grams = req.body.grams ?? product.grams;
  product.rate = req.body.rate ?? product.rate;
  product.description = req.body.description ?? product.description;
  product.isActive = req.body.isActive ?? product.isActive;

  await product.save();
  res.json(product);
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  // delete images from Cloudinary
  for (const img of product.images) {
    if (img.public_id) await deleteImage(img.public_id);
  }

  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
};

// Admin: add images to existing product
export const addProductImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!req.files || !req.files.length) return res.status(400).json({ message: "No files provided" });

    const uploads = await Promise.all(req.files.map((f) => uploadImageBuffer(f.buffer)));
    const mapped = uploads.map((u, i) => ({ url: u.secure_url, public_id: u.public_id, alt: req.body[`alt_${i}`] ?? "" }));
    product.images.push(...mapped);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Add product images error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: remove a single image by public_id
export const removeProductImage = async (req, res) => {
  try {
    const { id, publicId } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const idx = product.images.findIndex((i) => i.public_id === publicId);
    if (idx === -1) return res.status(404).json({ message: "Image not found" });

    if (product.images[idx].public_id) await deleteImage(product.images[idx].public_id);
    product.images.splice(idx, 1);
    await product.save();
    res.json(product);
  } catch (error) {
    console.error("Remove product image error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
