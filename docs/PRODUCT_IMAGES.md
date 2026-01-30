# Product Image Uploads (Cloudinary)

This project now supports uploading product images via Cloudinary. Admins can upload multiple images when creating or updating a product, or add/remove images separately.

Endpoints

- POST /api/products (auth+admin): multipart/form-data with `images` file fields (multiple allowed). Optionally include `alt_0`, `alt_1`, ... for per-file alt text. Example: `-F "images=@/path/to/1.jpg" -F "images=@/path/to/2.jpg" -F "alt_0=Front" -F "alt_1=Back"`

- PUT /api/products/:id (auth+admin): multipart/form-data with `images` to append new images. Use `removePublicIds` JSON array in the body (as form field) to remove images by public_id.

- POST /api/products/:id/images (auth+admin): multipart upload to add images.

- DELETE /api/products/:id/images/:publicId (auth+admin): remove single image by `publicId`.

Notes
- Uploaded images are stored in Cloudinary; product `images` stores objects with `url`, `public_id`, and `alt`.
- When a product is deleted its images are removed from Cloudinary.
