const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
});

const products = [
  {
    name: "Chakli",
    description: "Crispy spiral snack made from rice and gram flour.",
    price_cents: 12000,
    inventory: 50,
    category_name: "Savory Snacks",
    image_file: "chakli.jpeg",
    is_active: true,
    is_featured: true
  },
  {
    name: "Besan Laddo",
    description: "Sweet balls made with roasted gram flour and ghee.",
    price_cents: 15000,
    inventory: 40,
    category_name: "Traditional Sweets",
    image_file: "besan-laddo.jpeg",
    is_active: true,
    is_featured: true
  },
  {
    name: "Fried Modak",
    description: "Traditional deep-fried dumplings filled with coconut and jaggery.",
    price_cents: 18000,
    inventory: 30,
    category_name: "Traditional Sweets",
    image_file: "fried-modak.jpeg",
    is_active: true,
    is_featured: false
  },
  {
    name: "Karanji",
    description: "Sweet fried pastry stuffed with coconut and dry fruits.",
    price_cents: 16000,
    inventory: 35,
    category_name: "Traditional Sweets",
    image_file: "karanji.jpeg",
    is_active: true,
    is_featured: true
  },
  {
    name: "Poha Chivda",
    description: "Crunchy poha mix with peanuts, curry leaves, and spices.",
    price_cents: 10000,
    inventory: 60,
    category_name: "Savory Snacks",
    image_file: "poha-chivda.jpeg",
    is_active: true,
    is_featured: true
  },
  {
    name: "Ukdiche Modak",
    description: "Steamed dumplings filled with jaggery and coconut.",
    price_cents: 20000,
    inventory: 25,
    category_name: "Traditional Sweets",
    image_file: "ukdiche-modak.jpeg",
    is_active: true,
    is_featured: true
  },
  {
    name: "Puran Poli",
    description: "Sweet flatbread stuffed with chana dal and jaggery.",
    price_cents: 22000,
    inventory: 20,
    category_name: "Traditional Sweets",
    image_file: "puran-poli.jpeg",
    is_active: true,
    is_featured: false
  },
  {
    name: "Shankarpali",
    description: "Sweet, crunchy snack made with flour, sugar, and ghee.",
    price_cents: 13000,
    inventory: 45,
    category_name: "Savory Snacks",
    image_file: "shankarpali.jpeg",
    is_active: true,
    is_featured: false
  }
];

async function addProductsToDatabase(uploadedUrls = {}) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🚀 Starting product insertion...\n');
    
    for (const product of products) {
      // Get category ID
      const categoryResult = await client.query(
        'SELECT id FROM categories WHERE name = $1',
        [product.category_name]
      );
      
      if (categoryResult.rows.length === 0) {
        console.log(`❌ Category not found: ${product.category_name}`);
        continue;
      }
      
      const categoryId = categoryResult.rows[0].id;
      
      // Use Cloudinary URL if available, otherwise use local path
      const imageUrl = uploadedUrls[product.image_file] || `/${product.image_file}`;
      const images = `{${imageUrl}}`; // PostgreSQL array format
      
      // Insert product
      const insertResult = await client.query(
        `INSERT INTO products (name, description, price_cents, inventory, category_id, image_url, images, is_active, is_featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          product.name,
          product.description,
          product.price_cents,
          product.inventory,
          categoryId,
          imageUrl,
          images,
          product.is_active,
          product.is_featured
        ]
      );
      
      const productId = insertResult.rows[0].id;
      console.log(`✅ Added product: ${product.name} (ID: ${productId})`);
    }
    
    await client.query('COMMIT');
    console.log('\n✅ All products added successfully!');
    
    // Show summary
    const featuredCount = await client.query('SELECT COUNT(*) FROM products WHERE is_featured = true');
    const totalCount = await client.query('SELECT COUNT(*) FROM products');
    
    console.log(`\n📊 Summary:`);
    console.log(`Total products: ${totalCount.rows[0].count}`);
    console.log(`Featured products: ${featuredCount.rows[0].count}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error adding products:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function setupComplete() {
  try {
    // First, upload images to Cloudinary
    console.log('Step 1: Uploading images to Cloudinary...');
    const { uploadProductImages } = require('./upload-images.js');
    const uploadedUrls = await uploadProductImages();
    
    console.log('\nStep 2: Adding products to database...');
    await addProductsToDatabase(uploadedUrls);
    
    console.log('\n🎉 Complete setup finished!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  setupComplete();
}

module.exports = { addProductsToDatabase };