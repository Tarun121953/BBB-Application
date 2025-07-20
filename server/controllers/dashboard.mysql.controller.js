const { 
  BookingsModel, 
  BillingsModel, 
  BacklogModel, 
  MonthlyTrendsModel, 
  ProductDistributionModel,
  DrillDownSummaryModel
} = require('../models/database.model');
const { testConnection } = require('../config/database');

// Helper function to safely handle null values
const safeToFixed = (value, decimals = 2) => {
  if (value === null || value === undefined) return 0;
  const numValue = parseFloat(value);
  return isNaN(numValue) ? 0 : parseFloat(numValue.toFixed(decimals));
};

const safeParseFloat = (value) => {
  if (value === null || value === undefined) return 0;
  const numValue = parseFloat(value);
  return isNaN(numValue) ? 0 : numValue;
};

/*******************************************************************
 * Function Name: getDashboardData
 * Description: Get Summary statistics data from MySQL database
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
  // console.log('getDashboardDataCtrl (MySQL)');
  try {
    const filters = {
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
      region: req.body.region || null,
      product: req.body.product || null,
      customer: req.body.customer || null
    };

    // Get current and previous month data for comparison
    const getCurrentAndPreviousMonthData = async () => {
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
      
      // Get current month data
      const currentMonthBookingsCount = await BookingsModel.getCount(currentMonthFilters);
      // console.log('currentMonthBookingsCount', currentMonthBookingsCount);
      const currentMonthBillingsCount = await BillingsModel.getCount(currentMonthFilters);
      const currentMonthBacklogAmount = await BacklogModel.getSum(currentMonthFilters);
      const currentMonthBookToBillRatio = currentMonthBookingsCount > 0 ? currentMonthBookingsCount / currentMonthBillingsCount : 0;
      
      // Get previous month data
      const prevTotalBookings = await BookingsModel.getCount(previousMonthFilters);
      const prevTotalBillings = await BillingsModel.getCount(previousMonthFilters);
      const prevTotalBacklogAmount = await BacklogModel.getSum(previousMonthFilters);
      const prevBookToBillRatio = prevTotalBookings > 0 ? prevTotalBookings / prevTotalBillings : 0;
      
      return {
        currentMonthBookingsCount,
        currentMonthBillingsCount,
        currentMonthBacklogAmount: parseFloat(currentMonthBacklogAmount),
        currentMonthBookToBillRatio,
        prevTotalBookings,
        prevTotalBillings,
        prevTotalBacklogAmount: parseFloat(prevTotalBacklogAmount),
        prevBookToBillRatio
      };
    };

    // Get current and previous month data
    const currentAndPreviousMonthData = await getCurrentAndPreviousMonthData();
    
    // Create non-date filters for MTD/YTD calculations
    const nonDateFilters = {
      region: filters.region || null,
      product: filters.product || null,
      customer: filters.customer || null
    };
    
    // Calculate MTD and YTD metrics
    const bookingsMetrics = await BookingsModel.getMTDYTD(nonDateFilters);
    const billingsMetrics = await BillingsModel.getMTDYTD(nonDateFilters);
    const backlogMetrics = await BacklogModel.getMTDYTD(nonDateFilters);
    
    // Calculate MTD and YTD for book-to-bill ratio
    const calculateBookToBillRatioMTDYTD = async () => {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      // MTD filters
      const mtdFilters = {
        ...nonDateFilters,
        startDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
        endDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`
      };
      
      // YTD filters
      const ytdFilters = {
        ...nonDateFilters,
        startDate: `${currentYear}-01-01`,
        endDate: `${currentYear}-12-31`
      };
      
      const mtdBookingsCount = await BookingsModel.getCount(mtdFilters);
      const mtdBillingsCount = await BillingsModel.getCount(mtdFilters);
      const ytdBookingsCount = await BookingsModel.getCount(ytdFilters);
      const ytdBillingsCount = await BillingsModel.getCount(ytdFilters);
      
      const mtdRatio = mtdBookingsCount > 0 && mtdBillingsCount > 0 ? mtdBookingsCount / mtdBillingsCount : 0;
      const ytdRatio = ytdBookingsCount > 0 && ytdBillingsCount > 0 ? ytdBookingsCount / ytdBillingsCount : 0;
      
      return {
        mtd: safeToFixed(mtdRatio, 2),
        ytd: safeToFixed(ytdRatio, 2)
      };
    };
    
    const bookToBillRatioMetrics = await calculateBookToBillRatioMTDYTD();
    
    // Calculate totals with applied filters
    const totalBacklogAmount = await BacklogModel.getSum(filters);
    const totalBookingAmount = await BookingsModel.getSum(filters);
    const totalBillingAmount = await BillingsModel.getSum(filters);
    const totalBookings = await BookingsModel.getCount(filters);
    const totalBillings = await BillingsModel.getCount(filters);
    const totalBacklogs = await BacklogModel.getCount(filters);
    
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
        totalBacklogAmount: safeParseFloat(totalBacklogAmount),
        totalBacklogAmountChange: safeToFixed(totalBacklogAmountChange),
        bookToBillRatio: safeToFixed(bookToBillRatio),
        bookToBillRatioChange: safeToFixed(bookToBillRatioChange),
        totalBookingAmount: safeToFixed(totalBookingAmount),
        totalBillingAmount: safeToFixed(totalBillingAmount),
        totalBookings: totalBookings || 0,
        totalBookingsChange: safeToFixed(totalBookingsChange),
        totalBillings: totalBillings || 0,
        totalBillingsChange: safeToFixed(totalBillingsChange),
        totalBacklogs: totalBacklogs || 0,
        // Current month counts and changes
        currentMonthBookingsCount: currentAndPreviousMonthData.currentMonthBookingsCount,
        currentMonthBillingsCount: currentAndPreviousMonthData.currentMonthBillingsCount,
        currentMonthBookingsChange: safeToFixed(currentMonthBookingsChange, 2),
        currentMonthBillingsChange: safeToFixed(currentMonthBillingsChange, 2),
        currentMonthBacklogAmount: safeParseFloat(currentAndPreviousMonthData.currentMonthBacklogAmount),
        currentMonthBacklogAmountChange: safeToFixed(currentMonthBacklogAmountChange, 2),
        currentMonthBookToBillRatio: safeToFixed(currentAndPreviousMonthData.currentMonthBookToBillRatio, 2),
        currentMonthBookToBillRatioChange: safeToFixed(currentMonthBookToBillRatioChange, 2)
      },
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    // console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: "Error retrieving dashboard data",
      error: error.message
    });
  }
};

/*******************************************************************
 * Function Name: getFilterData
 * Description: Get Filter data from MySQL database
 * Returns: 
 *  success: true if the data was retrieved successfully
 *  data: Filter data
 *  error: Error message if the data was not retrieved successfully
 *******************************************************************/
exports.getFilterDataCtrl = async (req, res) => {
  // console.log('getFilterDataCtrl (MySQL)');
  try {
    const regions = await BookingsModel.getUniqueRegions();
    const products = await BookingsModel.getUniqueProducts();
    const customers = await BookingsModel.getUniqueCustomers();

    res.status(200).json({
      success: true,
      data: {
        regions,
        products,
        customers
      }
    });
  } catch (error) {
    // console.error('Filter data error:', error);
    res.status(500).json({
      success: false,
      message: "Error retrieving filter data",
      error: error.message
    });
  }
};

/*******************************************************************
 * Function Name: getMonthlyTrndBllVsBkngs
 * Description: Get Monthly Trend data from MySQL database
 * Returns: 
 *  success: true if the data was retrieved successfully
 *  data: Monthly Trend data
 *  error: Error message if the data was not retrieved successfully
 *******************************************************************/
exports.getMonthlyTrndBllVsBkngsCtrl = async (req, res) => {
  // console.log('getMonthlyTrndBllVsBkngsCtrl (MySQL)');
  try {
    const filters = {
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
      region: req.body.region || null,
      product: req.body.product || null,
      customer: req.body.customer || null
    };

    const monthlyTrendData = await MonthlyTrendsModel.getMonthlyData(filters);

    res.status(200).json({
      success: true,
      data: {
        title: "Monthly Trend: Bookings vs Billings",
        description: "Monthly comparison of booking and billing amounts",
        monthlyTrend: monthlyTrendData,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    // console.error('Monthly trend data error:', error);
    res.status(500).json({
      success: false,
      message: "Error retrieving monthly trend data",
      error: error.message
    });
  }
};

/*******************************************************************
 * Function Name: getBacklogByRegionCtrl
 * Description: Get Backlog By Region data from MySQL database
 * Returns: 
 *  success: true if the data was retrieved successfully
 *  data: Backlog By Region data
 *  error: Error message if the data was not retrieved successfully
 *******************************************************************/
exports.getBacklogByRegionCtrl = async (req, res) => {
  // console.log('getBacklogByRegionCtrl (MySQL)');
  try {
    const filters = {
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
      region: req.body.region || null,
      product: req.body.product || null,
      customer: req.body.customer || null
    };

    const backlogByRegionData = await BacklogModel.getByRegion(filters);
    
    // Define colors for regions
    const regionColors = {
      'South': '#8884d8',
      'North': '#83a6ed',
      'East': '#82ca9d',
      'West': '#a4de6c'
    };

    // Add colors to the data
    const formattedData = backlogByRegionData.map(item => ({
      ...item,
      value: safeToFixed(item.value, 2),
      fill: regionColors[item.name] || '#ffc658'
    }));

    res.status(200).json({
      success: true,
      data: {
        title: "Backlog by Region",
        description: "Distribution of backlog amounts across regions",
        backlogByRegion: formattedData,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    // console.error('Backlog by region data error:', error);
    res.status(500).json({
      success: false,
      message: "Error retrieving backlog by region data",
      error: error.message
    });
  }
};

/*******************************************************************
 * Function Name: getProductDistributionCtrl
 * Description: Get Product Distribution data from MySQL database
 * Returns: 
 *  success: true if the data was retrieved successfully
 *  data: Product Distribution data
 *  error: Error message if the data was not retrieved successfully
 *******************************************************************/
exports.getProductDistributionCtrl = async (req, res) => {
  // console.log('getProductDistributionCtrl (MySQL)');
  try {
    const filters = {
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
      region: req.body.region || null,
      product: req.body.product || null,
      customer: req.body.customer || null
    };

    const productDistribution = await ProductDistributionModel.getProductDistribution(filters);

    res.status(200).json({
      success: true,
      data: {
        title: "Product Distribution",
        description: "Distribution of booking amounts across products",
        productDistribution: productDistribution,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    // console.error('Product distribution data error:', error);
    res.status(500).json({
      success: false,
      message: "Error retrieving product distribution data",
      error: error.message
    });
  }
};

/*******************************************************************
 * Function Name: getDrillDownSummaryCtrl
 * Description: Get Drill-Down Summary data from MySQL database with Customer, Region, Product, 
 *              Total Bookings, Total Billings, Backlog, and Book-to-Bill Ratio
 * Returns: 
 *  success: true if the data was retrieved successfully
 *  data: Drill-Down Summary data
 *  error: Error message if the data was not retrieved successfully
 *******************************************************************/
exports.getDrillDownSummaryCtrl = async (req, res) => {
  // console.log('getDrillDownSummaryCtrl (MySQL)');
  try {
    const filters = {
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
      region: req.body.region || null,
      product: req.body.product || null,
      customer: req.body.customer || null
    };

    const customerData = await DrillDownSummaryModel.getDrillDownSummary(filters);

    // Process the results to group by region and calculate ratios
    const regionStats = {};
    
    customerData.forEach(row => {
      const region = row.region || 'Unknown';
      const customer = row.customer || 'Unknown';
      
      // Initialize region if not exists
      if (!regionStats[region]) {
        regionStats[region] = {
          region: region,
          totalBookings: 0,
          bookingAmount: 0,
          totalBillings: 0,
          billingAmount: 0,
          totalBacklogs: 0,
          backlogAmount: 0,
          bookingCustomersCount: new Set(),
          billingCustomersCount: new Set(),
          backlogCustomersCount: new Set(),
          customers: []
        };
      }
      
      // Calculate customer-level book-to-bill ratios
      const customerBookToBillRatio = row.billings > 0 ? 
        safeToFixed(row.bookings / row.billings, 2) : 0;
      const customerBookToBillAmountRatio = row.billingAmount > 0 ? 
        safeToFixed(row.bookingAmount / row.billingAmount, 2) : 0;
      
      // Add customer data
      const customerRecord = {
        customer: customer,
        region: region,
        bookings: parseInt(row.bookings) || 0,
        bookingAmount: safeToFixed(row.bookingAmount, 2),
        billings: parseInt(row.billings) || 0,
        billingAmount: safeToFixed(row.billingAmount, 2),
        backlogs: parseInt(row.backlogs) || 0,
        backlogAmount: safeToFixed(row.backlogAmount, 2),
        bookToBillRatio: customerBookToBillRatio,
        bookToBillAmountRatio: customerBookToBillAmountRatio
      };
      
      regionStats[region].customers.push(customerRecord);
      
      // Aggregate region totals
      regionStats[region].totalBookings += parseInt(row.bookings) || 0;
      regionStats[region].bookingAmount += safeParseFloat(row.bookingAmount);
      regionStats[region].totalBillings += parseInt(row.billings) || 0;
      regionStats[region].billingAmount += safeParseFloat(row.billingAmount);
      regionStats[region].totalBacklogs += parseInt(row.backlogs) || 0;
      regionStats[region].backlogAmount += safeParseFloat(row.backlogAmount);
      
      // Track unique customers per region for each data type
      if (row.bookings > 0) regionStats[region].bookingCustomersCount.add(customer);
      if (row.billings > 0) regionStats[region].billingCustomersCount.add(customer);
      if (row.backlogs > 0) regionStats[region].backlogCustomersCount.add(customer);
    });

    // Convert region stats to array and format for response
    const regionStatsArray = Object.values(regionStats).map(region => {
      // Calculate region-level book-to-bill ratios
      const bookToBillRatio = region.totalBillings > 0 ? 
        safeToFixed(region.totalBookings / region.totalBillings, 2) : 0;
      const bookToBillAmountRatio = region.billingAmount > 0 ? 
        safeToFixed(region.bookingAmount / region.billingAmount, 2) : 0;
      
      return {
        region: region.region,
        bookingCustomersCount: region.bookingCustomersCount.size,
        billingCustomersCount: region.billingCustomersCount.size,
        backlogCustomersCount: region.backlogCustomersCount.size,
        totalBookings: region.totalBookings,
        bookingAmount: safeToFixed(region.bookingAmount, 2),
        totalBillings: region.totalBillings,
        billingAmount: safeToFixed(region.billingAmount, 2),
        totalBacklogs: region.totalBacklogs,
        backlogAmount: safeToFixed(region.backlogAmount, 2),
        bookToBillRatio: bookToBillRatio,
        bookToBillAmountRatio: bookToBillAmountRatio,
        // Sort customers alphabetically by name
        customers: region.customers.sort((a, b) => a.customer.localeCompare(b.customer))
      };
    });

    res.status(200).json({
      success: true,
      data: {
        regionStats: regionStatsArray
      }
    });
  } catch (error) {
    // console.error('Drill-down summary data error:', error);
    res.status(500).json({
      success: false,
      message: "Error retrieving drill-down summary data",
      error: error.message
    });
  }
};

/*******************************************************************
 * Function Name: healthCheck
 * Description: Check database connection health
 *******************************************************************/
exports.healthCheck = async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.status(200).json({
      success: true,
      message: "Database connection healthy",
      connected: isConnected,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
};
