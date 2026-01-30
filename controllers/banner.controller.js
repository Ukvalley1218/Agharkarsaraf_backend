import Banner from "../models/Banner.js";
import { uploadImageBuffer, deleteImage } from "../services/cloudinary.service.js";

// Admin: create or update a new active banner
export const createOrUpdateBanner = async (req, res) => {
  try {
    const { title, link, alt } = req.body;

    
    let uploadResult = null;
    if (req.file) {
      uploadResult = await uploadImageBuffer(req.file.buffer);
    }

    // if file uploaded, create new banner and deactivate existing
    if (uploadResult) {
   
      const banner = new Banner({
        title,
        link,
        alt,
        imageUrl: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        isActive: true,
      });

      await banner.save();
      return res.status(201).json(banner);
    }

    return res.status(400).json({ message: "No image provided and no existing banner found" });
  } catch (error) {
    console.error("Banner create/update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Public: get active banner
export const getActiveBanner = async (req, res) => {
  try {
    const banner = await Banner.find({ isActive: true });
    if (!banner) return res.status(404).json({ message: "No active banner" });
    res.status(200).json(banner);
  } catch (error) {
    console.error("Get Banner Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: delete banner by id (or delete active banner when no id provided)
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    // find by id if provided, else find active banner
    let banner;
    if (id) {
      banner = await Banner.findById(id);
    } else {
      banner = await Banner.findOne({ isActive: true });
    }

    if (!banner) return res.status(404).json({ message: "Banner not found" });

    // delete image from Cloudinary if public_id exists
    if (banner.public_id) {
      try {
        await deleteImage(banner.public_id);
      } catch (err) {
        console.error("Error deleting image from Cloudinary:", err);
      }
    }

    await Banner.findByIdAndDelete(banner._id);
    res.status(200).json({ message: "Banner deleted" });
  } catch (error) {
    console.error("Delete Banner Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
