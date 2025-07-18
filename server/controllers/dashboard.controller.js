// Get dashboard data (dummy implementation)
exports.getDashboardData = async (req, res) => {
    console.log("getDashboardData",req);
  try {
    // Return dummy data
    const dummyData = {
      title: "BBB Analytics Dashboard",
      description: "Key performance metrics for BBB platform",
      metrics: {
        users: 1250,
        activeUsers: 876,
        revenue: "$12,450",
        growth: "8.5%",
        conversionRate: "3.2%",
        averageSessionTime: "4m 32s"
      },
      charts: [
        {
          id: 1,
          type: "bar",
          title: "Monthly Users",
          data: [120, 150, 180, 210, 250, 280, 310, 340, 360, 400, 420, 450]
        },
        {
          id: 2,
          type: "line",
          title: "Revenue Growth",
          data: [5000, 5500, 6000, 6200, 7000, 7500, 8000, 9000, 10000, 11000, 11500, 12450]
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: dummyData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving dashboard data",
      error: error.message
    });
  }
};

// Create new dashboard (dummy implementation)
exports.createDashboard = async (req, res) => {
  try {
    res.status(201).json({
      success: true,
      message: "Dashboard created successfully",
      data: {
        id: "dummy-id-12345",
        ...req.body,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating dashboard",
      error: error.message
    });
  }
};
