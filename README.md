# BBB Dashboard

A comprehensive business intelligence dashboard for tracking bookings, billings, and backlog data with advanced filtering and visualization capabilities.

## 🚀 Features

### Dashboard Overview
- **Real-time Metrics**: Track key performance indicators including total bookings, billings, and backlog amounts
- **MTD/YTD Analysis**: Month-to-date and year-to-date comparisons with percentage changes
- **Book-to-Bill Ratio**: Monitor the ratio between bookings and billings for financial health
- **Interactive Charts**: Multiple chart types including line charts, bar charts, and pie charts
- **Data Export**: Export dashboard data and drill-down reports to Excel

### Advanced Filtering System
- **Date Range Picker**: Select custom date ranges for data analysis
- **Region Filter**: Filter data by geographical regions
- **Product Filter**: Filter by specific products or product categories  
- **Customer Filter**: Filter by individual customers (alphabetically sorted)
- **Multi-dimensional Filtering**: Combine multiple filters for precise data analysis

### Visualization Components
- **Monthly Trend Analysis**: Line charts showing bookings vs billings trends over time
- **Backlog by Region**: Regional distribution of backlog amounts
- **Product Distribution**: Pie charts showing product-wise revenue distribution
- **Drill-down Summary**: Detailed tabular view with customer, region, and product breakdowns

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5 with custom theming
- **Charts**: Recharts for data visualization
- **Date Handling**: MUI X Date Pickers with date-fns
- **HTTP Client**: Axios for API communication
- **Excel Export**: ExcelJS and FileSaver for data export

### Backend (Node.js + Express)
- **Framework**: Express.js
- **Data Processing**: Lodash for data manipulation
- **Excel Reading**: XLSX library for reading Excel files
- **CORS**: Enabled for cross-origin requests
- **Environment**: dotenv for configuration management

## 📊 API Endpoints

### Base URL: `http://localhost:4901/api/dashboard`

### PRODUCTION URL: `https://bbb-application.onrender.com`

#### 1. Get Filter Data
```http
GET /get/filterData
```
**Description**: Retrieves available filter options (regions, products, customers)

**Response**:
```json
{
  "success": true,
  "data": {
    "regions": ["North", "South", "East", "West"],
    "products": ["Product A", "Product B", "Product C"],
    "customers": ["Customer 1", "Customer 2", "Customer 3"]
  }
}
```

#### 2. Get Summary Data
```http
POST /summaryData
```
**Description**: Retrieves dashboard summary metrics with filtering

**Request Body**:
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "region": "North",
  "product": "Product A",
  "customer": "Customer 1"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalBookingsMTD": 1500000,
    "totalBookingsYTD": 18000000,
    "totalBillingsMTD": 1200000,
    "totalBillingsYTD": 15000000,
    "totalBacklogAmount": 5000000,
    "bookToBillRatio": 1.2,
    "totalBookingsChange": 15.5,
    "totalBillingsChange": 12.3,
    "totalBacklogAmountChange": -5.2,
    "bookToBillRatioChange": 0.1
  }
}
```

#### 3. Get Monthly Trend Data
```http
POST /get/mnthly/Trnd/bllVsBkngs
```
**Description**: Retrieves monthly trend data for bookings vs billings

**Request Body**: Same as Summary Data

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "month": "Jan 2024",
      "bookings": 1500000,
      "billings": 1200000
    },
    {
      "month": "Feb 2024",
      "bookings": 1600000,
      "billings": 1300000
    }
  ]
}
```

#### 4. Get Backlog by Region
```http
POST /get/backlogByRegion
```
**Description**: Retrieves backlog distribution by region

**Request Body**: Same as Summary Data

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "region": "North",
      "backlogAmount": 2000000
    },
    {
      "region": "South",
      "backlogAmount": 1500000
    }
  ]
}
```

#### 5. Get Product Distribution
```http
POST /get/productDistribution
```
**Description**: Retrieves revenue distribution by product

**Request Body**: Same as Summary Data

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "product": "Product A",
      "revenue": 5000000,
      "percentage": 45.5
    },
    {
      "product": "Product B",
      "revenue": 3000000,
      "percentage": 27.3
    }
  ]
}
```

#### 6. Get Drill-down Summary
```http
POST /get/drillDownSummary
```
**Description**: Retrieves detailed drill-down data with all dimensions

**Request Body**: Same as Summary Data

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "customer": "Customer 1",
      "region": "North",
      "product": "Product A",
      "totalBookings": 1000000,
      "totalBillings": 800000,
      "backlog": 200000,
      "bookToBillRatio": 1.25
    }
  ]
}
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Backend Setup
1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional for additional configuration)

4. Ensure your Excel data file is placed at `./data/bbb.xlsx`

5. Start the server:
```bash
# Development mode
nodemon server.js
```

The server will run on `http://localhost:4901`

### Frontend Setup
1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The client will run on `http://localhost:3000`

## 📁 Project Structure

```
BBB-Dashboard/
├── client/                     # React frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   └── Dashboard/      # Dashboard components
│   │   │       ├── Dashboard.tsx
│   │   │       └── DashboardHeader.tsx
│   │   ├── App.tsx            # Main app component
│   │   └── index.tsx          # Entry point
│   └── package.json           # Frontend dependencies
├── server/                    # Node.js backend
│   ├── controllers/
│   │   └── dashboard.controller.js  # Business logic
│   ├── routes/
│   │   └── dashboard.routes.js      # API routes
│   ├── data/
│   │   └── bbb.xlsx          # Excel data source
│   ├── server.js             # Server entry point
│   └── package.json          # Backend dependencies
└── README.md                 # This file
```

## 🎨 Dashboard Features in Detail

### Filter System
- **Smart Filtering**: All filters work together to provide precise data filtering
- **Date Range**: Custom date picker with preset options (MTD, YTD, etc.)
- **Alphabetical Sorting**: Customer names are automatically sorted alphabetically
- **Real-time Updates**: Dashboard updates immediately when filters are applied

### Key Metrics Cards
- **Total Bookings**: Current period bookings with MTD/YTD comparison
- **Total Billings**: Current period billings with trend indicators
- **Backlog Amount**: Outstanding backlog with change indicators
- **Book-to-Bill Ratio**: Financial health indicator with trend analysis

### Charts & Visualizations
- **Monthly Trends**: Interactive line charts showing bookings vs billings over time
- **Regional Analysis**: Bar charts displaying backlog distribution by region
- **Product Mix**: Pie charts showing revenue distribution by product
- **Drill-down Table**: Sortable table with all dimensional data

### Export Capabilities
- **Excel Export**: Export filtered data to Excel format
- **Summary Reports**: Generate comprehensive reports with current filter settings

## 🔧 Data Processing

### Excel Data Structure
The system expects Excel files with three sheets:
1. **Bookings Sheet**: Contains booking transactions with Customer, Region, Product, Amount, Date
2. **Billings Sheet**: Contains billing transactions with similar structure
3. **Backlog Sheet**: Contains backlog data with outstanding amounts

### Date Handling
- Automatic conversion of Excel serial dates to JavaScript dates
- Support for various date formats
- MTD/YTD calculations based on current date

### Data Aggregation
- Real-time aggregation of metrics based on applied filters
- Percentage change calculations for trend analysis
- Book-to-bill ratio calculations for financial insights

## 🚦 Error Handling

### Frontend
- Loading states for all API calls
- Error boundaries for component failures
- User-friendly error messages
- Retry mechanisms for failed requests

### Backend
- Comprehensive error handling for all endpoints
- Validation of request parameters
- Graceful handling of missing data
- Detailed error logging

## 🔒 Security Features

- CORS enabled for secure cross-origin requests
- Input validation on all API endpoints
- Environment-based configuration
- Secure file handling for Excel data

## 📈 Performance Optimizations

- Efficient data processing with Lodash
- Memoized calculations for repeated operations
- Optimized React rendering with proper state management
- Lazy loading of chart components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation above
- Review the code comments for implementation details

---

**Built with ❤️ for business intelligence and data visualization**
