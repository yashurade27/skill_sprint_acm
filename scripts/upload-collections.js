const { v2: cloudinary } = require('cloudinary');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(filePath, publicId, folder = 'collections') {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      folder: folder,
      transformation: [
        { width: 1200, height: 800, crop: 'fill', quality: 'auto:good' }
      ]
    });
    
    console.log(`✅ Uploaded ${publicId}: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Failed to upload ${publicId}:`, error.message);
    return null;
  }
}

async function uploadCollectionImages() {
  const publicDir = path.join(__dirname, '../public');
  
  // Collection images mapping
  const collectionImages = [
    {
      fileName: 'kadam_kate',
      publicId: 'kadam_kate_story',
      folder: 'story',
      description: 'Kadam Kate story image'
    },
    {
      fileName: 'kadam_kate_1',
      publicId: 'kadam_kate_story_1',
      folder: 'story',
      description: 'Kadam Kate story image (alternative)'
    },
    {
      fileName: 'diwali_collection', 
      publicId: 'diwali_collection',
      folder: 'collections',
      description: 'Diwali special collection'
    },
    {
      fileName: 'savory_collection',
      publicId: 'savory_collection', 
      folder: 'collections',
      description: 'Savory snacks collection'
    },
    {
      fileName: 'upvas_collection',
      publicId: 'upvas_collection',
      folder: 'collections', 
      description: 'Upvas/Fasting collection'
    }
  ];

  const uploadedUrls = {};

  console.log('🚀 Starting collection images upload to Cloudinary...\n');

  for (const image of collectionImages) {
    // Try different file extensions
    const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
    let filePath = null;
    
    for (const ext of extensions) {
      const testPath = path.join(publicDir, image.fileName + ext);
      if (fs.existsSync(testPath)) {
        filePath = testPath;
        break;
      }
    }

    if (!filePath) {
      console.log(`⚠️  File not found: ${image.fileName} (tried .jpg, .jpeg, .png, .webp)`);
      continue;
    }

    console.log(`📤 Uploading ${image.description}...`);
    const url = await uploadToCloudinary(filePath, image.publicId, image.folder);
    
    if (url) {
      uploadedUrls[image.publicId] = {
        url: url,
        description: image.description,
        folder: image.folder
      };
    }
  }

  console.log('\n📋 Upload Results:');
  console.log('===============================================');
  Object.entries(uploadedUrls).forEach(([key, value]) => {
    console.log(`${key}: ${value.url}`);
  });
  console.log('===============================================');
  
  // Generate code snippets
  console.log('\n📝 Code to use in your components:');
  console.log('===============================================');
  
  if (uploadedUrls.kadam_kate_story || uploadedUrls.kadam_kate_story_1) {
    console.log(`// For Our Story component:
const KADAM_KATE_IMAGES = {
  main: "${uploadedUrls.kadam_kate_story?.url || 'UPLOAD_PENDING'}",
  alternative: "${uploadedUrls.kadam_kate_story_1?.url || 'UPLOAD_PENDING'}"
};`);
  }
  
  if (uploadedUrls.diwali_collection || uploadedUrls.savory_collection || uploadedUrls.upvas_collection) {
    console.log(`\n// For Special Collections component:
const COLLECTION_IMAGES = {
  diwali: "${uploadedUrls.diwali_collection?.url || 'UPLOAD_PENDING'}",
  savory: "${uploadedUrls.savory_collection?.url || 'UPLOAD_PENDING'}",
  upvas: "${uploadedUrls.upvas_collection?.url || 'UPLOAD_PENDING'}"
};`);
  }
  
  console.log('===============================================');
  
  return uploadedUrls;
}

// Run the upload
if (require.main === module) {
  uploadCollectionImages()
    .then(() => {
      console.log('\n✅ All collection uploads completed!');
      console.log('💡 Copy the URLs above and update your components.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Upload failed:', error);
      process.exit(1);
    });
}

module.exports = { uploadCollectionImages };