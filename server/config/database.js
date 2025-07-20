const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bbb_dashboard',
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('clever-cloud.com') ? false : {
    rejectUnauthorized: true
  },
  connectTimeout: 20000,
  waitForConnections: true,
  connectionLimit: 3,  // Reduced for Clever Cloud free tier (max 5 connections)
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize database and create tables if they don't exist
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create bookings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        region VARCHAR(100) NOT NULL,
        product VARCHAR(200) NOT NULL,
        customer VARCHAR(200) NOT NULL,
        booking_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_date (date),
        INDEX idx_region (region),
        INDEX idx_product (product),
        INDEX idx_customer (customer)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Create billings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS billings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        region VARCHAR(100) NOT NULL,
        product VARCHAR(200) NOT NULL,
        customer VARCHAR(200) NOT NULL,
        billed_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_date (date),
        INDEX idx_region (region),
        INDEX idx_product (product),
        INDEX idx_customer (customer)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Create backlog table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS backlog (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        region VARCHAR(100) NOT NULL,
        product VARCHAR(200) NOT NULL,
        customer VARCHAR(200) NOT NULL,
        backlog_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_date (date),
        INDEX idx_region (region),
        INDEX idx_product (product),
        INDEX idx_customer (customer)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Database tables created successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
};

// Execute SQL query with error handling
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('SQL Query Error:', error.message);
    throw error;
  }
};

// Get database connection from pool
const getConnection = async () => {
  return await pool.getConnection();
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  executeQuery,
  getConnection
};
