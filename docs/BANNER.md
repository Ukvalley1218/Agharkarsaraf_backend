# Banner (Hero) Image Setup

This backend now supports a dynamic promotional banner (hero image) that admins can upload via the admin API and which public dashboards can fetch.

## Environment variables
Add the following to your environment (e.g., .env):

- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

## Install dependencies
Run:

npm install cloudinary multer

## API Endpoints
- POST /api/admin/banner (protected: `auth` + `admin`): multipart/form-data with `image` file field and optional `title`, `link`, `alt`. This will upload the image to Cloudinary and create a new active banner (previous active banner is deactivated and its image removed from Cloudinary).

- DELETE /api/admin/banner/:id? (protected: `auth` + `admin`): delete the banner with the given `:id`. If `:id` is omitted, the current active banner will be deleted. The image is removed from Cloudinary when possible.

- GET /api/banner : public route to fetch the current active banner.

## Example upload (curl)

curl -X POST -H "Authorization: Bearer <token>" -F "image=@/path/to/image.jpg" -F "title=Promo" http://localhost:3000/api/admin/banner
