import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: 'hiifll86',
  api_key: '462785225922261',
  api_secret: '0twa0k3FswbX-vSzSvS1E4eBTsQ',
  secure: true
});

async function uploadLogos() {
  try {
    const logoPngPath = path.join(__dirname, '..', 'logo.png');
    const logoJpgPath = path.join(__dirname, '..', 'logo-horizontal.jpg');

    console.log("Uploading logo.png to Cloudinary...");
    const res1 = await cloudinary.uploader.upload(logoPngPath, {
      folder: 'braindock/branding',
      public_id: 'braindock_logo_primary'
    });
    console.log("Primary Logo Cloudinary URL:", res1.secure_url);

    console.log("Uploading logo-horizontal.jpg to Cloudinary...");
    const res2 = await cloudinary.uploader.upload(logoJpgPath, {
      folder: 'braindock/branding',
      public_id: 'braindock_logo_horizontal'
    });
    console.log("Horizontal Logo Cloudinary URL:", res2.secure_url);

  } catch (err) {
    console.error("Upload failed:", err);
  }
}

uploadLogos();
