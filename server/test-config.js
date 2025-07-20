require('dotenv').config();

// console.log('🔧 Environment Variables:');
// console.log('DB_HOST:', process.env.DB_HOST);
// console.log('DB_PORT:', process.env.DB_PORT);
// console.log('DB_USER:', process.env.DB_USER);
// console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***hidden***' : 'undefined');
// console.log('DB_NAME:', process.env.DB_NAME);
// console.log('-----------------------------------');

// Load database config
const { pool } = require('./config/database');

// console.log('🔧 Testing database config loading...');
