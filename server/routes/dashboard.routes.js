const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// GET dashboard data
router.get('/', dashboardController.getDashboardData);

// POST create new dashboard
router.post('/', dashboardController.createDashboard);

module.exports = router;
