const mysql = require('mysql2/promise');
require('dotenv').config();

async function testScaleGridConnection() {
  console.log('🔄 Testing ScaleGrid MySQL connection...');
  console.log('Host:', process.env.DB_HOST);
  console.log('Port:', process.env.DB_PORT);
  console.log('User:', process.env.DB_USER);
  console.log('Database:', process.env.DB_NAME);
  console.log('-----------------------------------');
  
  // First, try connecting without specifying a database
  const baseConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    },
    connectTimeout: 20000,
    acquireTimeout: 20000
  };
  
  try {
    console.log('🔄 Testing basic connection (without database)...');
    const connection = await mysql.createConnection(baseConfig);
    console.log('✅ Basic connection successful!');
    
    // List available databases
    console.log('🔄 Checking available databases...');
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📋 Available databases:');
    databases.forEach(db => console.log(`  - ${db.Database}`));
    
    // Check if our target database exists
    const targetDb = process.env.DB_NAME || 'bbb_dashboard';
    const dbExists = databases.some(db => db.Database === targetDb);
    
    if (!dbExists) {
      console.log(`🔄 Creating database '${targetDb}'...`);
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${targetDb}\``);
      console.log(`✅ Database '${targetDb}' created successfully!`);
    } else {
      console.log(`✅ Database '${targetDb}' already exists!`);
    }
    
    await connection.end();
    
    // Now test connection with the database
    console.log('🔄 Testing connection with database...');
    const dbConfig = {
      ...baseConfig,
      database: targetDb
    };
    
    const dbConnection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const [result] = await dbConnection.execute('SELECT 1 as test');
    console.log('✅ Query test successful:', result[0]);
    
    await dbConnection.end();
    console.log('🎉 All connection tests passed!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'ETIMEDOUT') {
      console.log('💡 Suggestions:');
      console.log('  1. Check if your IP is whitelisted in ScaleGrid');
      console.log('  2. Verify the hostname and port are correct');
      console.log('  3. Check your internet connection');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Suggestions:');
      console.log('  1. Verify username and password are correct');
      console.log('  2. Check user permissions in ScaleGrid');
    }
  }
  
  process.exit(0);
}

testScaleGridConnection();
