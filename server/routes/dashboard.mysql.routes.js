const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.mysql.controller');

// Health check endpoint
router.get('/health', dashboardController.healthCheck);

// GET dashboard data
router.post('/summaryData', dashboardController.getDashboardDataCtrl);

// GET filter data
router.get('/get/filterData', dashboardController.getFilterDataCtrl);

// GET monthly trend data
router.post('/get/mnthly/Trnd/bllVsBkngs', dashboardController.getMonthlyTrndBllVsBkngsCtrl);

// GET backlog by region data
router.post('/get/backlogByRegion', dashboardController.getBacklogByRegionCtrl);

// GET product distribution data
router.post('/get/productDistribution', dashboardController.getProductDistributionCtrl);

// GET drill-down summary data
router.post('/get/drillDownSummary', dashboardController.getDrillDownSummaryCtrl);

module.exports = router;
