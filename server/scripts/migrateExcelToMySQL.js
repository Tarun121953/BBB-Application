const XLSX = require('xlsx');
const { pool, initializeDatabase, executeQuery } = require('../config/database');

// Function to convert Excel serial date to YYYY-MM-DD format
const excelDateToJSDate = (excelDate) => {
  if (!excelDate) return null;
  
  // If it's already a string date, try to parse it
  if (typeof excelDate === 'string') {
    const date = new Date(excelDate);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  
  // If it's a number (Excel serial date)
  if (typeof excelDate === 'number') {
    // Excel's epoch starts from January 1, 1900 (but Excel incorrectly treats 1900 as a leap year)
    const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
    const jsDate = new Date(excelEpoch.getTime() + (excelDate * 24 * 60 * 60 * 1000));
    return jsDate.toISOString().split('T')[0];
  }
  
  return null;
};

// Process sheet data and convert dates
const processSheetData = (sheet, dateColumn) => {
  return sheet.map(row => {
    const processedRow = { ...row };
    if (row[dateColumn]) {
      processedRow[dateColumn] = excelDateToJSDate(row[dateColumn]);
    }
    return processedRow;
  });
};

// Migration function
const migrateExcelToMySQL = async () => {
  try {
    console.log('🚀 Starting Excel to MySQL migration...');
    
    // Initialize database and create tables
    await initializeDatabase();
    
    // Load the Excel workbook
    const workbook = XLSX.readFile('./data/bbb.xlsx');
    const sheetNames = workbook.SheetNames;
    
    console.log(`📊 Found ${sheetNames.length} sheets: ${sheetNames.join(', ')}`);
    
    // Process each sheet
    const bookingsSheet = processSheetData(XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]), 'Booking_Date');
    const billingsSheet = processSheetData(XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[1]]), 'Billing_Date');
    const backlogSheet = processSheetData(XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[2]]), 'Expected_Shipping_Date');
    
    console.log(`📈 Bookings records: ${bookingsSheet.length}`);
    console.log(`💰 Billings records: ${billingsSheet.length}`);
    console.log(`📋 Backlog records: ${backlogSheet.length}`);
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await executeQuery('DELETE FROM bookings');
    await executeQuery('DELETE FROM billings');
    await executeQuery('DELETE FROM backlog');
    
    // Migrate bookings data
    console.log('📈 Migrating bookings data...');
    for (const booking of bookingsSheet) {
      if (booking.Booking_Date && booking.Region && booking.Product && booking.Customer) {
        await executeQuery(
          'INSERT INTO bookings (date, region, product, customer, booking_amount) VALUES (?, ?, ?, ?, ?)',
          [
            booking.Booking_Date,
            booking.Region,
            booking.Product,
            booking.Customer,
            booking.Booking_Amount || 0
          ]
        );
      }
    }
    
    // Migrate billings data
    console.log('💰 Migrating billings data...');
    for (const billing of billingsSheet) {
      if (billing.Billing_Date && billing.Region && billing.Product && billing.Customer) {
        await executeQuery(
          'INSERT INTO billings (date, region, product, customer, billed_amount) VALUES (?, ?, ?, ?, ?)',
          [
            billing.Billing_Date,
            billing.Region,
            billing.Product,
            billing.Customer,
            billing.Billed_Amount || 0
          ]
        );
      }
    }
    
    // Migrate backlog data
    console.log('📋 Migrating backlog data...');
    for (const backlog of backlogSheet) {
      if (backlog.Expected_Shipping_Date && backlog.Region && backlog.Product && backlog.Customer) {
        await executeQuery(
          'INSERT INTO backlog (date, region, product, customer, backlog_amount) VALUES (?, ?, ?, ?, ?)',
          [
            backlog.Expected_Shipping_Date,
            backlog.Region,
            backlog.Product,
            backlog.Customer,
            backlog.Backlog_Amount || 0
          ]
        );
      }
    }
    
    // Verify migration
    const bookingsCount = await executeQuery('SELECT COUNT(*) as count FROM bookings');
    const billingsCount = await executeQuery('SELECT COUNT(*) as count FROM billings');
    const backlogCount = await executeQuery('SELECT COUNT(*) as count FROM backlog');
    
    console.log('✅ Migration completed successfully!');
    console.log(`📊 Final counts:`);
    console.log(`   - Bookings: ${bookingsCount[0].count}`);
    console.log(`   - Billings: ${billingsCount[0].count}`);
    console.log(`   - Backlog: ${backlogCount[0].count}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

// Run migration if this script is executed directly
if (require.main === module) {
  migrateExcelToMySQL();
}

module.exports = { migrateExcelToMySQL };
