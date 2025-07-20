const XLSX = require('xlsx');

// Function to inspect Excel file structure
const inspectExcelFile = () => {
  try {
    // console.log('🔍 Inspecting Excel file structure...');
    
    // Load the Excel workbook
    const workbook = XLSX.readFile('./data/bbb.xlsx');
    const sheetNames = workbook.SheetNames;
    
    // console.log(`📊 Found ${sheetNames.length} sheets: ${sheetNames.join(', ')}`);
    
    // Inspect each sheet
    sheetNames.forEach((sheetName, index) => {
      // console.log(`\n📋 Sheet ${index + 1}: "${sheetName}"`);
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      
      if (sheet.length > 0) {
        // console.log(`   Records: ${sheet.length}`);
        // console.log(`   Columns: ${Object.keys(sheet[0]).join(', ')}`);
        // console.log(`   Sample record:`, sheet[0]);
      } else {
        // console.log(`   No data found in this sheet`);
      }
    });
    
  } catch (error) {
    // console.error('❌ Error inspecting Excel file:', error.message);
  }
};

// Run inspection
inspectExcelFile();
