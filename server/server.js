const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const dashboardRoutes = require('./routes/dashboard.routes');

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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
