import cloudinary from "../config/cloudinary.js";

export const uploadImageBuffer = (buffer, folder = "banners") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });

export const deleteImage = (public_id) => cloudinary.uploader.destroy(public_id);
