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

## � Deployment

### Local Development vs Production

**Local Development:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4901`

**Production (Render):**
- Frontend: `https://bbb-dashboard.onrender.com`
- Backend API: `https://bbb-application.onrender.com`

### Render Deployment Guide

#### Prerequisites for Render Deployment
- GitHub repository with your code
- Render account (free tier available)
- MySQL database (can use Render's managed database or external provider)

#### Step 1: Database Setup

**Option A: Render Managed MySQL Database**
1. Go to Render Dashboard → New → PostgreSQL (or use external MySQL)
2. Create database instance
3. Note down connection details

**Option B: External MySQL Provider (Recommended)**
- Use services like PlanetScale, AWS RDS, or Google Cloud SQL
- Ensure the database allows external connections
- Whitelist Render's IP ranges if required

#### Step 2: Backend Deployment on Render

1. **Create Web Service**
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub repository
   - Configure the service:

2. **Service Configuration**
   ```yaml
   # render.yaml (optional - can be configured in UI)
   services:
     - type: web
       name: bbb-backend
       env: node
       buildCommand: cd server && npm install
       startCommand: cd server && npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 4901
         - key: DB_HOST
           value: your-mysql-host
         - key: DB_PORT
           value: 3306
         - key: DB_USER
           value: your-mysql-username
         - key: DB_PASSWORD
           value: your-mysql-password
         - key: DB_NAME
           value: your-database-name
   ```

3. **Environment Variables Setup**
   In Render Dashboard, add these environment variables:
   ```env
   NODE_ENV=production
   PORT=4901
   DB_HOST=your-mysql-host.com
   DB_PORT=3306
   DB_USER=your-mysql-username
   DB_PASSWORD=your-secure-password
   DB_NAME=your-database-name
   ```

4. **Build & Start Commands**
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: Leave empty (or specify if needed)

#### Step 3: Frontend Deployment on Render

1. **Create Static Site**
   - Go to Render Dashboard → New → Static Site
   - Connect the same GitHub repository
   - Configure the service:

2. **Static Site Configuration**
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`
   - **Root Directory**: Leave empty

3. **Environment Variables for Frontend**
   ```env
   REACT_APP_API_URL=https://your-backend-service.onrender.com
   NODE_ENV=production
   ```

4. **Update Frontend API Configuration**
   In your React app, update the API base URL:
   ```javascript
   // client/src/components/Dashboard/Dashboard.tsx
   const baseUrl = process.env.NODE_ENV === 'production'
     ? 'https://bbb-application.onrender.com'  // Your Render backend URL
     : 'http://localhost:4901';
   ```

#### Step 4: Database Migration on Render

After backend deployment, run the migration:

1. **Access Render Shell** (if available) or use a one-time job:
   ```bash
   cd server && node scripts/migrateExcelToMySQL.js
   ```

2. **Alternative: Local Migration to Production DB**
   ```bash
   # Set production database credentials locally
   export DB_HOST=your-production-host
   export DB_USER=your-production-user
   export DB_PASSWORD=your-production-password
   export DB_NAME=your-production-database
   
   # Run migration
   cd server && node scripts/migrateExcelToMySQL.js
   ```

#### Step 5: Custom Domain (Optional)

1. In Render Dashboard → Your Service → Settings
2. Add custom domain
3. Configure DNS records as instructed by Render

### Production Environment Variables

**Backend (.env for Render)**
```env
# Database Configuration
DB_HOST=your-mysql-host.com
DB_PORT=3306
DB_USER=your-mysql-username
DB_PASSWORD=your-secure-password
DB_NAME=your-production-database

# Server Configuration
NODE_ENV=production
PORT=4901

# Optional: Add any additional production configs
```

**Frontend Environment Variables**
```env
REACT_APP_API_URL=https://your-backend.onrender.com
NODE_ENV=production
```

### Render Deployment Best Practices

#### Performance Optimization
- **Connection Pooling**: Ensure MySQL connection pooling is properly configured
- **Environment-based Configuration**: Use different configs for development and production
- **Caching**: Implement appropriate caching strategies for API responses
- **Database Indexing**: Ensure all frequently queried columns are indexed

#### Security Considerations
- **Environment Variables**: Never commit sensitive data to repository
- **CORS Configuration**: Configure CORS properly for production domains
- **Database Security**: Use strong passwords and limit database access
- **HTTPS**: Render provides HTTPS by default

#### Monitoring & Maintenance
- **Health Checks**: Use the `/health` endpoint for monitoring
- **Logs**: Monitor Render logs for errors and performance issues
- **Database Monitoring**: Monitor database performance and connection counts
- **Regular Updates**: Keep dependencies updated for security

### Troubleshooting Render Deployment

#### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs in Render dashboard
   # Ensure all dependencies are in package.json
   # Verify build commands are correct
   ```

2. **Database Connection Issues**
   ```bash
   # Verify database credentials
   # Check if database allows external connections
   # Test connection using the health endpoint
   ```

3. **CORS Errors**
   ```javascript
   // Ensure backend CORS is configured for frontend domain
   app.use(cors({
     origin: ['https://your-frontend.onrender.com', 'http://localhost:3000']
   }));
   ```

4. **Environment Variable Issues**
   - Double-check all environment variables in Render dashboard
   - Ensure no typos in variable names
   - Verify values are correctly set

#### Deployment Checklist

- [ ] Database is set up and accessible
- [ ] Backend service is deployed with correct environment variables
- [ ] Frontend is deployed with correct API URL
- [ ] Database migration has been run
- [ ] Health check endpoint returns success
- [ ] All API endpoints are working
- [ ] Frontend can communicate with backend
- [ ] CORS is properly configured
- [ ] Custom domain is configured (if applicable)

### Database Optimization for Production
- Ensure proper indexing on frequently queried columns
- Use connection pooling for better performance
- Implement query caching for static data
- Regular database maintenance and optimization
- Monitor query performance and optimize slow queries

## �🛠️ Installation & Setup

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
