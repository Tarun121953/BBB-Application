const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database and routes
const { testConnection, initializeDatabase } = require('./config/database');
const dashboardRoutes = require('./routes/dashboard.mysql.routes');

// Initialize express app
const app = express();
const PORT =  4901;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/dashboard', dashboardRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('BBB Dashboard API is running');
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔄 Initializing BBB Dashboard Server...');
    
    // Test database connection
    console.log('🔄 Testing database connection...');
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Database connected successfully!');
      
      // Initialize database tables
      console.log('🔄 Initializing database tables...');
      await initializeDatabase();
      console.log('✅ Database tables initialized!');
    } else {
      console.log('⚠️  Database connection failed, but server will start anyway');
      console.log('💡 Please check your ScaleGrid IP whitelist configuration');
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 BBB Dashboard Server is running on port ${PORT}`);
      console.log(`📊 Dashboard API: http://localhost:${PORT}`);
      console.log(`🔗 Database: ${process.env.DB_HOST}`);
    });
    
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
