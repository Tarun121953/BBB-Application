const XLSX = require('xlsx');
const _ = require('lodash');

// Function to convert Excel serial date to YYYY-MM-DD format
const excelDateToJSDate = (excelDate) => {
  // Excel's epoch starts on 1/1/1900
  // JavaScript's epoch starts on 1/1/1970
  // Excel has a leap year bug where it thinks 1900 was a leap year
  // So we need to adjust by 1 day for dates after 2/28/1900
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const excelEpoch = new Date(1900, 0, 1);
  let daysSinceEpoch = excelDate - 1; // Excel counts from 1, JS from 0
  
  // Adjust for Excel's leap year bug
  if (excelDate > 60) {
    daysSinceEpoch -= 1;
  }
  
  const jsDate = new Date(excelEpoch.getTime() + (daysSinceEpoch * millisecondsPerDay));
  return jsDate.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

// Load the workbook
const workbook = XLSX.readFile('./data/bbb.xlsx');
const sheetNames = workbook.SheetNames;

// Example: Assume
// Sheet1: Bookings
// Sheet2: Billings
// Sheet3: Backlog

// Process the sheets and convert dates
const processSheetData = (sheet) => {
  return sheet.map(item => {
    const processed = {...item};
    
    // Convert Booking_Date if it exists
    if (processed.Booking_Date) {
      processed.Date = excelDateToJSDate(processed.Booking_Date);
    }
    
    // Convert Billing_Date if it exists
    if (processed.Billing_Date) {
      processed.Date = excelDateToJSDate(processed.Billing_Date);
    }
    
    // Convert Expected_Shipping_Date if it exists
    if (processed.Expected_Shipping_Date) {
      processed.Date = excelDateToJSDate(processed.Expected_Shipping_Date);
    }
    
    return processed;
  });
};

const bookingsSheet = processSheetData(XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]));
const billingsSheet = processSheetData(XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[1]]));
const backlogSheet = processSheetData(XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[2]]));


// Helper function to filter data based on filters
const filterData = (data, filters) => {
  return data.filter(item => {
    // console.log("item",item)
    // Date filter
    if (filters.startDate && new Date(item.Date) < new Date(filters.startDate)) {
      return false;
    }
    if (filters.endDate && new Date(item.Date) > new Date(filters.endDate)) {
      return false;
    }
    
    // Region filter
    if (filters.region && item.Region !== filters.region) {
      // console.log("region",item.Region,filters.region)
      return false;
    }
    
    // Product filter
    if (filters.product && item.Product !== filters.product) {
      return false;
    }
    
    // Customer filter
    if (filters.customer && item.Customer !== filters.customer) {
      return false;
    }
    
    return true;
  });
};

// Helper function to calculate MTD and YTD values
const calculateMTDYTD = (data,amountField) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const mtdData = data.filter(item => {
    const itemDate = new Date(item.Date);
    return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
  });
  // console.log("mtdData",mtdData)
  const ytdData = data.filter(item => {
    const itemDate = new Date(item.Date);
    return itemDate.getFullYear() === currentYear;
  });
  // console.log("ytdData",ytdData)
  return {
    mtd: mtdData.reduce((sum, item) => sum + (item[amountField]|| 0), 0),
    ytd: ytdData.reduce((sum, item) => sum + (item[amountField]|| 0), 0)
  };
};

/*******************************************************************
 * Function Name: getDashboardData
 * Description: Get Summary statistics data
 * Parameters: 
 *  startDate: Start date for the data range
 *  endDate: End date for the data range
 *  region: Region filter
 *  product: Product filter
 *  customer: Customer filter
 * Returns: 
 *  success: true if the data was retrieved successfully
 *  data: Dashboard data
 *  error: Error message if the data was not retrieved successfully
 *******************************************************************/
exports.getDashboardDataCtrl = async (req, res) => {
  // console.log(req.body)
  try {
    const filters = {
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
      region: req.body.region || null,
      product: req.body.product || null,
      customer: req.body.customer || null
    };
    
    // Filter data based on filters
    const filteredBookings = filterData(bookingsSheet, filters);
    const filteredBillings = filterData(billingsSheet, filters);
    const filteredBacklog = filterData(backlogSheet, filters);

    // Get current and previous month data for comparison
    const getCurrentAndPreviousMonthData = () => {
      // Get current date and previous month date
      const currentDate = new Date();
      const previousMonthDate = new Date();
      previousMonthDate.setMonth(currentDate.getMonth() - 1);
      
      // Format dates for current month
      const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
      const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
      
      // Format dates for previous month
      const previousMonthStart = new Date(previousMonthDate.getFullYear(), previousMonthDate.getMonth(), 1).toISOString().split('T')[0];
      const previousMonthEnd = new Date(previousMonthDate.getFullYear(), previousMonthDate.getMonth() + 1, 0).toISOString().split('T')[0];
      
      // Create current month filters
      const currentMonthFilters = {
        ...filters,
        startDate: currentMonthStart,
        endDate: currentMonthEnd
      };
      
      // Create previous month filters
      const previousMonthFilters = {
        ...filters,
        startDate: previousMonthStart,
        endDate: previousMonthEnd
      };
      
      // Filter data for current month
      const currentMonthBookings = filterData(bookingsSheet, currentMonthFilters);
      const currentMonthBillings = filterData(billingsSheet, currentMonthFilters);
      const currentMonthBacklog = filterData(backlogSheet, currentMonthFilters);
      
      // Filter data for previous month
      const prevMonthBookings = filterData(bookingsSheet, previousMonthFilters);
      const prevMonthBillings = filterData(billingsSheet, previousMonthFilters);
      const prevMonthBacklog = filterData(backlogSheet, previousMonthFilters);
      
      // Calculate metrics for current month
      const currentMonthBookingsCount = currentMonthBookings.length;
      const currentMonthBillingsCount = currentMonthBillings.length;
      const currentMonthBacklogAmount = currentMonthBacklog.reduce((sum, item) => sum + (item.Backlog_Amount || 0), 0);
      const currentMonthBookToBillRatio = currentMonthBookingsCount > 0 ? currentMonthBookingsCount / currentMonthBillingsCount : 0;
      
      // Calculate metrics for previous month
      const prevTotalBookings = prevMonthBookings.length;
      const prevTotalBillings = prevMonthBillings.length;
      const prevTotalBacklogAmount = prevMonthBacklog.reduce((sum, item) => sum + (item.Backlog_Amount || 0), 0);
      const prevBookToBillRatio = prevTotalBookings > 0 ? prevTotalBookings / prevTotalBillings : 0;
      
      return {
        currentMonthBookingsCount,
        currentMonthBillingsCount,
        currentMonthBacklogAmount,
        currentMonthBookToBillRatio,
        prevTotalBookings,
        prevTotalBillings,
        prevTotalBacklogAmount,
        prevBookToBillRatio
      };
    };

    // Get current and previous month data
    const currentAndPreviousMonthData = getCurrentAndPreviousMonthData();
    
    // Create non-date filters for MTD/YTD calculations (only region, product, customer)
    const nonDateFilters = {
      region: filters.region || null,
      product: filters.product || null,
      customer: filters.customer || null
    };
    
    // Filter data based on non-date filters for MTD/YTD calculations
    const mtdYtdFilterData = (data) => {
      return data.filter(item => {
        // Region filter
        if (nonDateFilters.region && item.Region !== nonDateFilters.region) {
          return false;
        }
        
        // Product filter
        if (nonDateFilters.product && item.Product !== nonDateFilters.product) {
          return false;
        }
        
        // Customer filter
        if (nonDateFilters.customer && item.Customer !== nonDateFilters.customer) {
          return false;
        }
        
        return true;
      });
    };
    
    // Apply non-date filters to data for MTD/YTD calculations
    const filteredForMtdYtdBookings = mtdYtdFilterData(bookingsSheet);
    const filteredForMtdYtdBillings = mtdYtdFilterData(billingsSheet);
    const filteredForMtdYtdBacklog = mtdYtdFilterData(backlogSheet);
    
    // Calculate MTD and YTD metrics using data filtered only by non-date filters
    const bookingsMetrics = calculateMTDYTD(filteredForMtdYtdBookings, 'Booking_Amount');
    const billingsMetrics = calculateMTDYTD(filteredForMtdYtdBillings, 'Billed_Amount');
    const backlogMetrics = calculateMTDYTD(filteredForMtdYtdBacklog, 'Backlog_Amount');
    
    // Calculate MTD and YTD for book-to-bill ratio
    const calculateBookToBillRatioMTDYTD = () => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Filter data for MTD
      const mtdBookings = filteredForMtdYtdBookings.filter(item => {
        const itemDate = new Date(item.Date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      });
      
      const mtdBillings = filteredForMtdYtdBillings.filter(item => {
        const itemDate = new Date(item.Date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      });
      
      // Filter data for YTD
      const ytdBookings = filteredForMtdYtdBookings.filter(item => {
        const itemDate = new Date(item.Date);
        return itemDate.getFullYear() === currentYear;
      });
      
      const ytdBillings = filteredForMtdYtdBillings.filter(item => {
        const itemDate = new Date(item.Date);
        return itemDate.getFullYear() === currentYear;
      });
      
      // Calculate book-to-bill ratios
      const mtdRatio = mtdBookings.length > 0 && mtdBillings.length > 0 ? 
        mtdBookings.length / mtdBillings.length : 0;
      
      const ytdRatio = ytdBookings.length > 0 && ytdBillings.length > 0 ? 
        ytdBookings.length / ytdBillings.length : 0;
      
      return {
        mtd: parseFloat(mtdRatio.toFixed(2)),
        ytd: parseFloat(ytdRatio.toFixed(2))
      };
    };
    
    const bookToBillRatioMetrics = calculateBookToBillRatioMTDYTD();
    
    // Calculate total backlog amount
    const totalBacklogAmount = filteredBacklog.reduce((sum, item) => sum + (item.Backlog_Amount || 0), 0);
    
    // Calculate total booking and billing amounts (all time)
    const totalBookingAmount = filteredBookings.reduce((sum, item) => sum + (item.Booking_Amount || 0), 0);
    const totalBillingAmount = filteredBillings.reduce((sum, item) => sum + (item.Billed_Amount || 0), 0);
    
    // Calculate total number of bookings and billings (count)
    const totalBookings = filteredBookings.length;
    const totalBillings = filteredBillings.length;
    
    // Calculate book-to-bill ratio
    const bookToBillRatio = totalBookings > 0 ? totalBookings / totalBillings : 0;
    
    // Calculate month-over-month changes
    const calculatePercentChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };
    
    const totalBacklogAmountChange = calculatePercentChange(totalBacklogAmount, currentAndPreviousMonthData.prevTotalBacklogAmount);
    const bookToBillRatioChange = calculatePercentChange(bookToBillRatio, currentAndPreviousMonthData.prevBookToBillRatio);
    const totalBookingsChange = calculatePercentChange(totalBookings, currentAndPreviousMonthData.prevTotalBookings);
    const totalBillingsChange = calculatePercentChange(totalBillings, currentAndPreviousMonthData.prevTotalBillings);
    
    // Calculate current month vs previous month changes
    const currentMonthBookingsChange = calculatePercentChange(currentAndPreviousMonthData.currentMonthBookingsCount, currentAndPreviousMonthData.prevTotalBookings);
    const currentMonthBillingsChange = calculatePercentChange(currentAndPreviousMonthData.currentMonthBillingsCount, currentAndPreviousMonthData.prevTotalBillings);
    const currentMonthBacklogAmountChange = calculatePercentChange(currentAndPreviousMonthData.currentMonthBacklogAmount, currentAndPreviousMonthData.prevTotalBacklogAmount);
    const currentMonthBookToBillRatioChange = calculatePercentChange(currentAndPreviousMonthData.currentMonthBookToBillRatio, currentAndPreviousMonthData.prevBookToBillRatio);
    
    // Prepare dashboard data
    const dashboardData = {
      title: "BBB Analytics Dashboard",
      description: "Key performance metrics for BBB platform",
      metrics: {
        totalBillingsMTD: billingsMetrics.mtd,
        totalBillingsYTD: billingsMetrics.ytd,
        totalBookingsMTD: bookingsMetrics.mtd,
        totalBookingsYTD: bookingsMetrics.ytd,
        totalBacklogMTD: backlogMetrics.mtd,
        totalBacklogYTD: backlogMetrics.ytd,
        bookToBillRatioMTD: bookToBillRatioMetrics.mtd,
        bookToBillRatioYTD: bookToBillRatioMetrics.ytd,
        totalBacklogAmount: totalBacklogAmount,
        totalBacklogAmountChange: parseFloat(totalBacklogAmountChange.toFixed(2)),
        bookToBillRatio: parseFloat(bookToBillRatio.toFixed(2)),
        bookToBillRatioChange: parseFloat(bookToBillRatioChange.toFixed(2)),
        totalBookingAmount: parseFloat(totalBookingAmount.toFixed(2)),
        totalBillingAmount: parseFloat(totalBillingAmount.toFixed(2)),
        totalBookings: totalBookings,
        totalBookingsChange: parseFloat(totalBookingsChange.toFixed(2)),
        totalBillings: totalBillings,
        totalBillingsChange: parseFloat(totalBillingsChange.toFixed(2)),
        // Current month counts and changes
        currentMonthBookingsCount: currentAndPreviousMonthData.currentMonthBookingsCount,
        currentMonthBillingsCount: currentAndPreviousMonthData.currentMonthBillingsCount,
        currentMonthBookingsChange: parseFloat(currentMonthBookingsChange.toFixed(2)),
        currentMonthBillingsChange: parseFloat(currentMonthBillingsChange.toFixed(2)),
        currentMonthBacklogAmount: currentAndPreviousMonthData.currentMonthBacklogAmount,
        currentMonthBacklogAmountChange: parseFloat(currentMonthBacklogAmountChange.toFixed(2)),
        currentMonthBookToBillRatio: parseFloat(currentAndPreviousMonthData.currentMonthBookToBillRatio.toFixed(2)),
        currentMonthBookToBillRatioChange: parseFloat(currentMonthBookToBillRatioChange.toFixed(2))
      },
      lastUpdated: new Date().toISOString()
    };
    // console.log("dashboardData",dashboardData);
    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving dashboard data",
      error: error.message
    });
  }
};

/*******************************************************************
 * Function Name: getFilterData
 * Description: Get Filter data
 * Returns: 
 *  success: true if the data was retrieved successfully
 *  data: Filter data
 *  error: Error message if the data was not retrieved successfully
 *******************************************************************/
exports.getFilterDataCtrl = async (req, res) => {
  console.log('getFilterDataCtrl')
  try {
    const regions = _.uniq(bookingsSheet.map(item => item.Region));
    const products = _.uniq(bookingsSheet.map(item => item.Product));
    const customers = _.uniq(bookingsSheet.map(item => item.Customer));
    res.status(200).json({
      success: true,
      data: {
        regions,
        products,
        customers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving dashboard data",
      error: error.message
    });
  }
};
/*******************************************************************
 * Function Name: getMonthlyTrndBllVsBkngs
 * Description: Get Monthly Trend data
 * Returns: 
 *  success: true if the data was retrieved successfully
 *  data: Monthly Trend data
 *  error: Error message if the data was not retrieved successfully
 *******************************************************************/
exports.getMonthlyTrndBllVsBkngsCtrl = async (req, res) => {
  console.log('getMonthlyTrndBllVsBkngsCtrl')
  try {
    const filters = {
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
      region: req.body.region || null,
      product: req.body.product || null,
      customer: req.body.customer || null
    };
    // Filter data based on filters
    const filteredBookings = filterData(bookingsSheet, filters);
    const filteredBillings = filterData(billingsSheet, filters);
    
    // Get current date to determine the 12-month range
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-11
    
    // Initialize data for all 12 months with zeros
    const monthlyData = {};
    
    // Month names for formatting
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Create entries for the last 12 months
    for (let i = 0; i < 12; i++) {
      // Calculate month by going backwards from current month
      let monthOffset = currentMonth - i;
      let yearOffset = currentYear;
      
      // Handle negative months by adjusting year and month
      if (monthOffset < 0) {
        yearOffset--;
        monthOffset = 12 + monthOffset; // Convert to positive month in previous year
      }
      
      const monthYear = `${yearOffset}-${String(monthOffset + 1).padStart(2, '0')}`;
      const monthName = monthNames[monthOffset]; // Get month name (Jan, Feb, etc.)
      
      // Initialize with zeros in the chart-friendly format
      monthlyData[monthYear] = {
        name: monthName,
        Bookings: 0,
        Billings: 0,
        monthYear: monthYear // Keep this for sorting
      };
    }
    
    // Process bookings data
    filteredBookings.forEach(booking => {
      const date = new Date(booking.Date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Only add to monthlyData if it's within our 12-month window
      if (monthlyData[monthYear]) {
        monthlyData[monthYear].Bookings += booking.Booking_Amount || 0;
      }
    });
    
    // Process billings data
    filteredBillings.forEach(billing => {
      const date = new Date(billing.Date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Only add to monthlyData if it's within our 12-month window
      if (monthlyData[monthYear]) {
        monthlyData[monthYear].Billings += billing.Billed_Amount || 0;
      }
    });
    
    // Define month order for proper sorting
    const monthOrder = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 
                       'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
    
    // Convert to array and sort by month order
    const monthlyTrendData = Object.values(monthlyData).sort((a, b) => {
      return monthOrder[a.name] - monthOrder[b.name];
    });
    
    // Round values to 2 decimal places and remove the monthYear property
    const formattedTrendData = monthlyTrendData.map(({ monthYear, ...rest }) => {
      return {
        ...rest,
        Bookings: parseFloat(rest.Bookings.toFixed(2)),
        Billings: parseFloat(rest.Billings.toFixed(2))
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        title: "Monthly Trend: Bookings vs Billings",
        description: "Monthly comparison of booking and billing amounts",
        monthlyTrend: formattedTrendData,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving monthly trend data",
      error: error.message
    });
  }
};
/*******************************************************************
 * Function Name: getBacklogByRegionCtrl
 * Description: Get Backlog By Region data
 * Returns: 
 *  success: true if the data was retrieved successfully
 *  data: Backlog By Region data
 *  error: Error message if the data was not retrieved successfully
 *******************************************************************/
exports.getBacklogByRegionCtrl = async (req, res) => {
  console.log('getBacklogByRegionCtrl')
  try {
    const filters = {
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
      region: req.body.region || null,
      product: req.body.product || null,
      customer: req.body.customer || null
    };
    
    // Filter backlog data based on filters
    const filteredBacklog = filterData(backlogSheet, filters);
    
    // Group backlog data by region
    const backlogByRegion = {};
    
    // Define colors for regions
    const regionColors = {
      'South': '#8884d8',
      'North': '#83a6ed',
      'East': '#82ca9d',
      'West': '#a4de6c'
    };
    
    // Process backlog data
    filteredBacklog.forEach(item => {
      const region = item.Region || 'Unknown';
      
      if (!backlogByRegion[region]) {
        backlogByRegion[region] = {
          name: region,
          value: 0,
          fill: regionColors[region] || '#ffc658' // Default color if region not in predefined list
        };
      }
      
      backlogByRegion[region].value += item.Backlog_Amount || 0;
    });
    
    // Convert to array and round values to 2 decimal places
    const backlogByRegionData = Object.values(backlogByRegion).map(item => {
      return {
        ...item,
        value: parseFloat(item.value.toFixed(2))
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        title: "Backlog by Region",
        description: "Distribution of backlog amounts across regions",
        backlogByRegion: backlogByRegionData,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving backlog by region data",
      error: error.message
    });
  }
};
/*******************************************************************
 * Function Name: getProductDistributionCtrl
 * Description: Get Product Distribution data
 * Returns: 
 *  success: true if the data was retrieved successfully
 *  data: Product Distribution data
 *  error: Error message if the data was not retrieved successfully
 *******************************************************************/
exports.getProductDistributionCtrl = async (req, res) => {
  console.log('getProductDistributionCtrl')
  try {
    const filters = {
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
      region: req.body.region || null,
      product: req.body.product || null,
      customer: req.body.customer || null
    };
    
    // Filter bookings data based on filters
    const filteredBookings = filterData(bookingsSheet, filters);
    
    // Group bookings data by product
    const productDistribution = {};
    
    // Define a set of colors for the pie chart
    const colors = [
      '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c',
      '#d0ed57', '#ffc658', '#ff8042', '#ff6361', '#bc5090',
      '#58508d', '#003f5c', '#444e86', '#955196', '#dd5182'
    ];
    
    // Process bookings data
    filteredBookings.forEach(item => {
      const product = item.Product || 'Unknown';
      
      if (!productDistribution[product]) {
        productDistribution[product] = {
          name: product,
          value: 0
        };
      }
      
      productDistribution[product].value += item.Booking_Amount || 0;
    });
    
    // Convert to array, round values to 2 decimal places, and assign colors
    const productDistributionData = Object.values(productDistribution)
      .map((item, index) => {
        return {
          ...item,
          value: parseFloat(item.value.toFixed(2)),
          fill: colors[index % colors.length] // Assign colors cyclically
        };
      })
      // Sort by value in descending order
      .sort((a, b) => b.value - a.value);
    
    res.status(200).json({
      success: true,
      data: {
        title: "Product Distribution",
        description: "Distribution of booking amounts across products",
        productDistribution: productDistributionData,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving product distribution data",
      error: error.message
    });
  }
};

/*******************************************************************
 * Function Name: getDrillDownSummaryCtrl
 * Description: Get Drill-Down Summary data with Customer, Region, Product, 
 *              Total Bookings, Total Billings, Backlog, and Book-to-Bill Ratio
 * Returns: 
 *  success: true if the data was retrieved successfully
 *  data: Drill-Down Summary data
 *  error: Error message if the data was not retrieved successfully
 *******************************************************************/
exports.getDrillDownSummaryCtrl = async (req, res) => {
  try {
    const filters = req.body;
    
    // Filter data based on request filters
    const filteredBookings = filterData(bookingsSheet, filters);
    const filteredBillings = filterData(billingsSheet, filters);
    
    // Create a map to store aggregated data by customer, region, and product
    const aggregatedData = new Map();
    
    // Process bookings data
    filteredBookings.forEach(booking => {
      const key = `${booking.customer}|${booking.region}|${booking.product}`;
      if (!aggregatedData.has(key)) {
        aggregatedData.set(key, {
          customer: booking.customer,
          region: booking.region,
          product: booking.product,
          totalBookings: 0,
          totalBillings: 0,
          backlog: 0,
          bookToBillRatio: 0
        });
      }
      
      const record = aggregatedData.get(key);
      record.totalBookings += booking.amount || 0;
    });
    
    // Process billings data
    filteredBillings.forEach(billing => {
      const key = `${billing.customer}|${billing.region}|${billing.product}`;
      if (!aggregatedData.has(key)) {
        aggregatedData.set(key, {
          customer: billing.customer,
          region: billing.region,
          product: billing.product,
          totalBookings: 0,
          totalBillings: 0,
          backlog: 0,
          bookToBillRatio: 0
        });
      }
      
      const record = aggregatedData.get(key);
      record.totalBillings += billing.amount || 0;
    });
    
    // Calculate backlog and book-to-bill ratio for each record
    const drillDownData = Array.from(aggregatedData.values()).map((record, index) => {
      // Calculate backlog (bookings - billings)
      record.backlog = record.totalBookings - record.totalBillings;
      
      // Calculate book-to-bill ratio (avoid division by zero)
      record.bookToBillRatio = record.totalBillings > 0 
        ? parseFloat((record.totalBookings / record.totalBillings).toFixed(2)) 
        : 0;
      
      // Add an ID for the grid
      record.id = index + 1;
      
      return record;
    });
    
    res.status(200).json({
      success: true,
      data: {
        drillDownSummary: drillDownData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving drill-down summary data",
      error: error.message
    });
  }
};