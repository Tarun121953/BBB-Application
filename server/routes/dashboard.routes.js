const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// GET dashboard data
router.post('/summaryData', dashboardController.getDashboardDataCtrl);

router.get('/get/filterData',dashboardController.getFilterDataCtrl);

router.post('/get/mnthly/Trnd/bllVsBkngs',dashboardController.getMonthlyTrndBllVsBkngsCtrl);

router.post('/get/backlogByRegion',dashboardController.getBacklogByRegionCtrl);

router.post('/get/productDistribution',dashboardController.getProductDistributionCtrl);

// Get drill-down summary data
router.post('/get/drillDownSummary',dashboardController.getDrillDownSummaryCtrl);

module.exports = router;
