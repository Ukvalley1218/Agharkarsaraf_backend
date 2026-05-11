import cloudinary from "cloudinary";

const CLOUDINARY_CLOUD_NAME="dqjkzp4vz"
const CLOUDINARY_API_KEY="957942746461772"
const CLOUDINARY_API_SECRET="SoFYXSuZDf6iD0pDUaw7r6OA8Cc"

cloudinary.v2.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary.v2;
