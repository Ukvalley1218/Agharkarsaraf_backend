import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import Product from '../models/Product.js';

dotenv.config();

const run = async () => {
  await connectDB();

  const products = await Product.find().lean();
  let catCount = 0, subCount = 0, updated = 0;

  for (const p of products) {
    // Skip if already migrated
    if (p.categoryId || p.subcategoryId) continue;

    // Ensure category
    let category = await Category.findOne({ name: p.category });
    if (!category && p.category) {
      category = await Category.create({ name: p.category });
      catCount++;
    }

    // Ensure subcategory
    let sub;
    if (p.subcategory && category) {
      sub = await Subcategory.findOne({ name: p.subcategory, categoryId: category._id });
      if (!sub) {
        sub = await Subcategory.create({ name: p.subcategory, categoryId: category._id });
        subCount++;
      }
    }

    // Update product.
    const update = {};
    if (category) update.categoryId = category._id;
    if (sub) update.subcategoryId = sub._id;
    // remove old string fields
    update.$unset = { category: "", subcategory: "" };

    await Product.updateOne({ _id: p._id }, update);
    updated++;
  }

  console.log(`Created categories: ${catCount}, created subcategories: ${subCount}, products updated: ${updated}`);
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
