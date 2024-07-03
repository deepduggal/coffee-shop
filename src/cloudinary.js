import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Configuration
cloudinary.config({
  cloud_name: 'dccqa1l3v',
  api_key: '662258395835132',
  api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary, params: {
    folder: 'coffee-shop',
    allowedFormats: ['jpg', 'png', 'jpeg', 'gif']
  }
});

export { cloudinary, storage };