import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'hiifll86',
  api_key: process.env.CLOUDINARY_API_KEY || '462785225922261',
  api_secret: process.env.CLOUDINARY_API_SECRET || '0twa0k3FswbX-vSzSvS1E4eBTsQ',
  secure: true
});

export default cloudinary;
