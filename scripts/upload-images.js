const { v2: cloudinary } = require('cloudinary');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(filePath, publicId) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      folder: 'products',
      transformation: [
        { width: 800, height: 800, crop: 'fill', quality: 'auto:good' }
      ]
    });
    
    console.log(`✅ Uploaded ${publicId}: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Failed to upload ${publicId}:`, error.message);
    return null;
  }
}

async function uploadProductImages() {
  const publicDir = path.join(__dirname, '../public');
  
  const imageFiles = [
    'chakli.jpeg',
    'besan-laddo.jpeg', 
    'fried-modak.jpeg',
    'karanji.jpeg',
    'poha-chivda.jpeg',
    'ukdiche-modak.jpeg',
    'puran-poli.jpeg',
    'shankarpali.jpeg'
  ];

  const uploadedUrls = {};

  console.log('🚀 Starting image upload to Cloudinary...\n');

  for (const fileName of imageFiles) {
    const filePath = path.join(publicDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${fileName}`);
      continue;
    }

    const publicId = fileName.split('.')[0]; // Remove extension
    const url = await uploadToCloudinary(filePath, publicId);
    
    if (url) {
      uploadedUrls[fileName] = url;
    }
  }

  console.log('\n📋 Upload Results:');
  console.log(JSON.stringify(uploadedUrls, null, 2));
  
  return uploadedUrls;
}

// Run the upload
if (require.main === module) {
  uploadProductImages()
    .then(() => {
      console.log('\n✅ All uploads completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Upload failed:', error);
      process.exit(1);
    });
}

module.exports = { uploadProductImages };