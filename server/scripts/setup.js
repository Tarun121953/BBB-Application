const { initializeDatabase } = require('../config/database');
const migrateExcelToMySQL = require('./migrateExcelToMySQL');

async function setup() {
  try {
    // console.log('🚀 Starting BBB Dashboard MySQL setup...\n');
    
    // Step 1: Initialize database and create tables
    // console.log('📊 Initializing database and creating tables...');
    await initializeDatabase();
    // console.log('✅ Database initialized successfully\n');
    
    // Step 2: Run migration script
    // console.log('📋 Migrating Excel data to MySQL...');
    await migrateExcelToMySQL();
    // console.log('✅ Data migration completed successfully\n');
    
    // console.log('🎉 Setup completed! Your BBB Dashboard is now using MySQL.');
    // console.log('📍 You can now use the MySQL API endpoints at: /api/mysql/dashboard');
    
  } catch (error) {
    // console.error('❌ Setup failed:', error.message);
    // console.error('\n💡 Please check:');
    // console.error('   - MySQL server is running');
    // console.error('   - Database credentials in .env file are correct');
    // console.error('   - Excel files exist in the data directory');
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setup();
}

module.exports = setup;
