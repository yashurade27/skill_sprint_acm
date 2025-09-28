// Database Connection Test Script
// Run this with: node scripts/test-db-connection.js

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');
  
  // Check if DATABASE_URL exists
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('   Please check your .env.local file');
    return;
  }
  
  console.log('✅ DATABASE_URL found');
  
  // Parse URL to show connection details (without password)
  try {
    const url = new URL(databaseUrl);
    console.log(`📡 Attempting to connect to: ${url.hostname}:${url.port || 5432}`);
    console.log(`🗄️  Database: ${url.pathname.slice(1)}`);
    console.log(`👤 User: ${url.username}\n`);
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL format:', error.message);
    return;
  }
  
  // Test connection
  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 10000,
    ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();
    
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    console.log('🔄 Testing query execution...');
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    
    console.log('✅ Query executed successfully!');
    console.log(`⏰ Database time: ${result.rows[0].current_time}`);
    console.log(`🐘 PostgreSQL version: ${result.rows[0].pg_version.split(' ')[0]}\n`);
    
    // Test if products table exists
    console.log('🔄 Checking products table...');
    const tableCheck = await client.query(`
      SELECT COUNT(*) as product_count 
      FROM products 
      WHERE is_featured = true AND is_active = true
    `);
    
    console.log(`✅ Products table found with ${tableCheck.rows[0].product_count} featured products`);
    
    client.release();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ETIMEDOUT') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   1. Check if your database server is running');
      console.log('   2. Verify your DATABASE_URL is correct');
      console.log('   3. Check firewall/network connectivity');
      console.log('   4. Ensure your database allows connections from your IP');
    }
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 The hostname could not be found. Check your DATABASE_URL.');
    }
    
    if (error.code === '28P01') {
      console.log('\n💡 Authentication failed. Check your username/password.');
    }
    
  } finally {
    await pool.end();
    console.log('\n🔚 Connection test completed');
  }
}

// Run the test
testDatabaseConnection().catch(console.error);