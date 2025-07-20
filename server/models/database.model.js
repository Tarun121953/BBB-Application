const { executeQuery } = require('../config/database');

// Base filter builder for SQL queries
const buildWhereClause = (filters) => {
  const conditions = [];
  const params = [];
  
  if (filters.startDate) {
    conditions.push('date >= ?');
    params.push(filters.startDate);
  }
  
  if (filters.endDate) {
    conditions.push('date <= ?');
    params.push(filters.endDate);
  }
  
  if (filters.region) {
    conditions.push('region = ?');
    params.push(filters.region);
  }
  
  if (filters.product) {
    conditions.push('product = ?');
    params.push(filters.product);
  }
  
  if (filters.customer) {
    conditions.push('customer = ?');
    params.push(filters.customer);
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereClause, params };
};

// Bookings Model
const BookingsModel = {
  // Get all bookings with filters
  getFiltered: async (filters = {}) => {
    const { whereClause, params } = buildWhereClause(filters);
    const query = `SELECT * FROM bookings ${whereClause} ORDER BY date DESC`;
    return await executeQuery(query, params);
  },
  
  // Get bookings count with filters
  getCount: async (filters = {}) => {
    const { whereClause, params } = buildWhereClause(filters);
    const query = `SELECT COUNT(*) as count FROM bookings ${whereClause}`;
    const result = await executeQuery(query, params);
    return result[0].count;
  },
  
  // Get bookings sum with filters
  getSum: async (filters = {}) => {
    const { whereClause, params } = buildWhereClause(filters);
    const query = `SELECT COALESCE(SUM(booking_amount), 0) as total FROM bookings ${whereClause}`;
    const result = await executeQuery(query, params);
    return result[0].total;
  },
  
  // Get unique regions
  getUniqueRegions: async () => {
    const query = 'SELECT DISTINCT region FROM bookings ORDER BY region';
    const result = await executeQuery(query);
    return result.map(row => row.region);
  },
  
  // Get unique products
  getUniqueProducts: async () => {
    const query = 'SELECT DISTINCT product FROM bookings ORDER BY product';
    const result = await executeQuery(query);
    return result.map(row => row.product);
  },
  
  // Get unique customers
  getUniqueCustomers: async () => {
    const query = 'SELECT DISTINCT customer FROM bookings ORDER BY customer';
    const result = await executeQuery(query);
    return result.map(row => row.customer);
  },
  
  // Get MTD/YTD calculations
  getMTDYTD: async (filters = {}) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // MTD query
    const mtdFilters = { 
      ...filters, 
      startDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
      endDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`
    };
    const mtdSum = await BookingsModel.getSum(mtdFilters);
    
    // YTD query
    const ytdFilters = { 
      ...filters, 
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-12-31`
    };
    const ytdSum = await BookingsModel.getSum(ytdFilters);
    
    return { mtd: parseFloat(mtdSum), ytd: parseFloat(ytdSum) };
  }
};

// Billings Model
const BillingsModel = {
  // Get all billings with filters
  getFiltered: async (filters = {}) => {
    const { whereClause, params } = buildWhereClause(filters);
    const query = `SELECT * FROM billings ${whereClause} ORDER BY date DESC`;
    return await executeQuery(query, params);
  },
  
  // Get billings count with filters
  getCount: async (filters = {}) => {
    const { whereClause, params } = buildWhereClause(filters);
    const query = `SELECT COUNT(*) as count FROM billings ${whereClause}`;

    const result = await executeQuery(query, params);
    // console.log('result', result);
    return result[0].count;
  },
  
  // Get billings sum with filters
  getSum: async (filters = {}) => {
    const { whereClause, params } = buildWhereClause(filters);
    const query = `SELECT COALESCE(SUM(billed_amount), 0) as total FROM billings ${whereClause}`;
    const result = await executeQuery(query, params);
    return result[0].total;
  },
  
  // Get MTD/YTD calculations
  getMTDYTD: async (filters = {}) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // MTD query
    const mtdFilters = { 
      ...filters, 
      startDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
      endDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`
    };
    const mtdSum = await BillingsModel.getSum(mtdFilters);
    
    // YTD query
    const ytdFilters = { 
      ...filters, 
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-12-31`
    };
    const ytdSum = await BillingsModel.getSum(ytdFilters);
    
    return { mtd: parseFloat(mtdSum), ytd: parseFloat(ytdSum) };
  }
};

// Backlog Model
const BacklogModel = {
  // Get all backlog with filters
  getFiltered: async (filters = {}) => {
    const { whereClause, params } = buildWhereClause(filters);
    const query = `SELECT * FROM backlog ${whereClause} ORDER BY date DESC`;
    return await executeQuery(query, params);
  },
  
  // Get backlog count with filters
  getCount: async (filters = {}) => {
    const { whereClause, params } = buildWhereClause(filters);
    const query = `SELECT COUNT(*) as count FROM backlog ${whereClause}`;
    const result = await executeQuery(query, params);
    return result[0].count;
  },
  
  // Get backlog sum with filters
  getSum: async (filters = {}) => {
    const { whereClause, params } = buildWhereClause(filters);
    const query = `SELECT COALESCE(SUM(backlog_amount), 0) as total FROM backlog ${whereClause}`;
    const result = await executeQuery(query, params);
    return result[0].total;
  },
  
  // Get MTD/YTD calculations
  getMTDYTD: async (filters = {}) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // MTD query
    const mtdFilters = { 
      ...filters, 
      startDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
      endDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`
    };
    const mtdSum = await BacklogModel.getSum(mtdFilters);
    
    // YTD query
    const ytdFilters = { 
      ...filters, 
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-12-31`
    };
    const ytdSum = await BacklogModel.getSum(ytdFilters);
    
    return { mtd: parseFloat(mtdSum), ytd: parseFloat(ytdSum) };
  },
  
  // Get backlog by region
  getByRegion: async (filters = {}) => {
    const { whereClause, params } = buildWhereClause(filters);
    const query = `
      SELECT 
        region as name,
        COALESCE(SUM(backlog_amount), 0) as value,
        COUNT(*) as count
      FROM backlog 
      ${whereClause}
      GROUP BY region
      ORDER BY value DESC
    `;
    return await executeQuery(query, params);
  }
};

// Monthly Trends Model
const MonthlyTrendsModel = {
  getMonthlyData: async (filters = {}) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const monthlyData = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize data for the last 12 months
    for (let i = 0; i < 12; i++) {
      let monthOffset = currentMonth - i;
      let yearOffset = currentYear;
      
      if (monthOffset < 0) {
        yearOffset--;
        monthOffset = 12 + monthOffset;
      }
      
      const monthYear = `${yearOffset}-${String(monthOffset + 1).padStart(2, '0')}`;
      const monthName = monthNames[monthOffset];
      
      monthlyData[monthYear] = {
        name: monthName,
        Bookings: 0,
        Billings: 0,
        BookingsCount: 0,
        BillingsCount: 0,
        monthYear: monthYear
      };
    }
    
    // Get bookings data
    const { whereClause: bookingsWhere, params: bookingsParams } = buildWhereClause(filters);
    const bookingsQuery = `
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month_year,
        COALESCE(SUM(booking_amount), 0) as total_amount,
        COUNT(*) as count
      FROM bookings 
      ${bookingsWhere}
      GROUP BY DATE_FORMAT(date, '%Y-%m')
    `;
    const bookingsData = await executeQuery(bookingsQuery, bookingsParams);
    
    // Get billings data
    const { whereClause: billingsWhere, params: billingsParams } = buildWhereClause(filters);
    const billingsQuery = `
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month_year,
        COALESCE(SUM(billed_amount), 0) as total_amount,
        COUNT(*) as count
      FROM billings 
      ${billingsWhere}
      GROUP BY DATE_FORMAT(date, '%Y-%m')
    `;
    const billingsData = await executeQuery(billingsQuery, billingsParams);
    
    // Populate bookings data
    bookingsData.forEach(row => {
      if (monthlyData[row.month_year]) {
        monthlyData[row.month_year].Bookings = parseFloat(row.total_amount);
        monthlyData[row.month_year].BookingsCount = row.count;
      }
    });
    
    // Populate billings data
    billingsData.forEach(row => {
      if (monthlyData[row.month_year]) {
        monthlyData[row.month_year].Billings = parseFloat(row.total_amount);
        monthlyData[row.month_year].BillingsCount = row.count;
      }
    });
    
    // Convert to array and sort by month order
    const monthOrder = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 
                        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
    
    const monthlyTrendData = Object.values(monthlyData).sort((a, b) => {
      return monthOrder[a.name] - monthOrder[b.name];
    });
    
    // Format and remove monthYear property
    return monthlyTrendData.map(({ monthYear, ...rest }) => ({
      ...rest,
      Bookings: parseFloat(rest.Bookings.toFixed(2)),
      Billings: parseFloat(rest.Billings.toFixed(2)),
      BookingsCount: rest.BookingsCount,
      BillingsCount: rest.BillingsCount
    }));
  }
};

// Product Distribution Model
const ProductDistributionModel = {
  getProductDistribution: async (filters = {}) => {
    const { whereClause, params } = buildWhereClause(filters);
    const query = `
      SELECT 
        product as name,
        COALESCE(SUM(booking_amount), 0) as value,
        COUNT(*) as count
      FROM bookings 
      ${whereClause}
      GROUP BY product
      ORDER BY value DESC
    `;
    const results = await executeQuery(query, params);
    
    // Define colors for products
    const productColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];
    
    return results.map((item, index) => ({
      name: item.name,
      value: parseFloat(item.value),
      count: item.count,
      fill: productColors[index % productColors.length]
    }));
  }
};

// Drill-Down Summary Model
const DrillDownSummaryModel = {
  // Get drill-down summary data aggregated by region and customer
  getDrillDownSummary: async (filters = {}) => {
    const { whereClause, params } = buildWhereClause(filters);
    
    // Complex query to get drill-down summary data aggregated by region and customer
    const drillDownQuery = `
      SELECT 
        COALESCE(all_data.region, 'Unknown') as region,
        COALESCE(all_data.customer, 'Unknown') as customer,
        
        -- Booking metrics
        COALESCE(SUM(all_data.bookings_count), 0) as bookings,
        COALESCE(SUM(all_data.booking_amount), 0) as bookingAmount,
        
        -- Billing metrics
        COALESCE(SUM(all_data.billings_count), 0) as billings,
        COALESCE(SUM(all_data.billing_amount), 0) as billingAmount,
        
        -- Backlog metrics
        COALESCE(SUM(all_data.backlogs_count), 0) as backlogs,
        COALESCE(SUM(all_data.backlog_amount), 0) as backlogAmount
        
      FROM (
        -- Bookings data
        SELECT 
          region,
          customer,
          COUNT(*) as bookings_count,
          SUM(booking_amount) as booking_amount,
          0 as billings_count,
          0 as billing_amount,
          0 as backlogs_count,
          0 as backlog_amount
        FROM bookings 
        ${whereClause}
        GROUP BY region, customer
        
        UNION ALL
        
        -- Billings data
        SELECT 
          region,
          customer,
          0 as bookings_count,
          0 as booking_amount,
          COUNT(*) as billings_count,
          SUM(billed_amount) as billing_amount,
          0 as backlogs_count,
          0 as backlog_amount
        FROM billings 
        ${whereClause}
        GROUP BY region, customer
        
        UNION ALL
        
        -- Backlog data
        SELECT 
          region,
          customer,
          0 as bookings_count,
          0 as booking_amount,
          0 as billings_count,
          0 as billing_amount,
          COUNT(*) as backlogs_count,
          SUM(backlog_amount) as backlog_amount
        FROM backlog 
        ${whereClause}
        GROUP BY region, customer
      ) as all_data
      
      GROUP BY all_data.region, all_data.customer
      HAVING (bookings > 0 OR billings > 0 OR backlogs > 0)
      ORDER BY all_data.region, all_data.customer
    `;

    // Execute the query with parameters repeated for each UNION
    const queryParams = [...params, ...params, ...params];
    return await executeQuery(drillDownQuery, queryParams);
  }
};

module.exports = {
  BookingsModel,
  BillingsModel,
  BacklogModel,
  MonthlyTrendsModel,
  ProductDistributionModel,
  DrillDownSummaryModel,
  buildWhereClause
};
