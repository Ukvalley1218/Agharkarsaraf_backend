import multer from "multer";

// store file in memory so we can forward buffer directly to Cloudinary
const storage = multer.memoryStorage();
const limits = { fileSize: 5 * 1024 * 1024 }; // 5MB limit

const upload = multer({ storage, limits });

export default upload;