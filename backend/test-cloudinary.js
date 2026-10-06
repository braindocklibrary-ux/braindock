import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'hiifll86',
  api_key: '462785225922261',
  api_secret: '0twa0k3FswbX-vSzSvS1E4eBTsQ',
  secure: true
});

console.log("Testing Cloudinary connection...");
try {
  const res = await cloudinary.api.ping();
  console.log("Cloudinary Ping Success:", res);
} catch (err) {
  console.error("Cloudinary Error:", err.message);
}
