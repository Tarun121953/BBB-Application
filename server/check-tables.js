const { pool } = require('./config/database');

async function checkTables() {
  try {
    // console.log('🔍 Checking BBB Dashboard Database Tables...');
    // console.log('=========================================');
    
    // Get database connection
    const connection = await pool.getConnection();
    
    // Show all tables
    // console.log('📋 Available Tables:');
    const [tables] = await connection.execute('SHOW TABLES');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      // console.log(`  ${index + 1}. ${tableName}`);
    });
    
    // console.log('\n🏗️  Table Structures:');
    // console.log('=====================');
    
    // Check each table structure
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      // console.log(`\n📊 Table: ${tableName}`);
      // console.log('-'.repeat(30));
      
      const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
      columns.forEach(col => {
        // console.log(`  ${col.Field} | ${col.Type} | ${col.Null} | ${col.Key} | ${col.Default}`);
      });
      
      // Count records
      const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      // console.log(`  📈 Records: ${count[0].count}`);
    }
    
    connection.release();
    // console.log('\n✅ Database check completed!');
    
  } catch (error) {
    // console.error('❌ Error checking tables:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

checkTables();
