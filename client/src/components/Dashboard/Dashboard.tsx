import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
  Skeleton,
  CardHeader,
  Avatar,
  useTheme,
  Backdrop,
  Fade,
  CircularProgress,
  ThemeProvider,
  CssBaseline,
  createTheme
} from '@mui/material';
import DashboardHeader from './DashboardHeader';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import BookOnlineOutlinedIcon from '@mui/icons-material/BookOnlineOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import InsightsIcon from '@mui/icons-material/Insights';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import TableChartIcon from '@mui/icons-material/TableChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SpeedIcon from '@mui/icons-material/Speed';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Rectangle,
  PieChart as RechartsPieChart,
  Pie,
  Sector,
  PieChart
} from 'recharts';

// DevExtreme imports
import 'devextreme/dist/css/dx.light.css';
import { DataGrid, Column, FilterRow, HeaderFilter, Sorting, GroupPanel, SearchPanel, Selection, Paging, Pager, Export, Summary, TotalItem, Scrolling, ColumnChooser } from 'devextreme-react/data-grid';
import { exportDataGrid } from 'devextreme/excel_exporter';
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';

interface DashboardMetrics {
  // Original metrics
  users: number;
  activeUsers: number;
  revenue: string;
  growth: string;
  conversionRate: string;
  averageSessionTime: string;
  
  // New metrics
  totalBillingsMTD: number;
  totalBillingsYTD: number;
  totalBookingsMTD: number;
  totalBookingsYTD: number;
  totalBacklogAmount: number;
  bookToBillRatio: number;
  
  // Additional metrics
  totalBookings: number;
  totalBookingAmount: number;
  totalBillings: number;
  totalBillingAmount: number;
  
  // Month-over-month percentage changes
  totalBookingsChange: number;
  totalBillingsChange: number;
  totalBacklogAmountChange: number;
  bookToBillRatioChange: number;
  
  // Current month counts and changes
  currentMonthBookingsCount: number;
  currentMonthBillingsCount: number;
  currentMonthBookingsChange: number;
  currentMonthBillingsChange: number;
  currentMonthBacklogAmount: number;
  currentMonthBacklogAmountChange: number;
  currentMonthBookToBillRatio: number;
  currentMonthBookToBillRatioChange: number;
}

interface ChartData {
  id: number;
  type: string;
  title: string;
  data: number[];
}

export interface DashboardData {
  title: string;
  description: string;
  metrics: DashboardMetrics;
  charts: ChartData[];
  lastUpdated: string;
}

interface FilterState {
  dateRange: [Date | null, Date | null];
  region: string;
  product: string;
  customer: string | null;
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({ 
    dateRange: [null, null],
    region: '',
    product: '',
    customer: null
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [animationReady, setAnimationReady] = useState<boolean>(false);
  const [monthlyTrndBllVsBkngsData, setMonthlyTrndBllVsBkngsData] = useState<any[]>([]);
  const [regionwiseBcklogs, setRegionwiseBcklogs] = useState<any[]>([]);
  const [productDistribution, setProductDistribution] = useState<any[]>([]);
  const [drillDownSummaryData, setDrillDownSummaryData] = useState<any[]>([]);
  // Create a theme instance with light mode
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#3f88c5',
      },
      secondary: {
        main: '#ff6b6b',
      },
      background: {
        default: '#ffffff',
        paper: '#ffffff',
      },
      text: {
        primary: '#333333',
        secondary: '#666666',
      },
      success: {
        main: '#4caf50',
        light: '#e8f5e9',
      },
      error: {
        main: '#f44336',
        light: '#ffebee',
      }
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      subtitle1: {
        fontSize: '0.875rem',
        color: '#666666',
      },
      subtitle2: {
        fontSize: '0.75rem',
        color: '#999999',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            height: '100%',
          },
          body: {
            height: '100%',
            margin: 0,
          },
          '#root': {
            height: '100%',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#ffffff',
            color: '#333333',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
          },
        },
      },
    },
  });

  useEffect(() => {
    fetchDashboardData();
    fetchMonthlyTrndBllVsBkngsData();
    fetchRegionwiseBcklogs();
    fetchProductDistribution();
    fetchDrillDownSummary();
  }, [filters]); 
  // Add filters as dependency to re-fetch when filters change
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setAnimationReady(false);
      
      // Prepare filters for API request
      const requestFilters = {
        startDate: filters.dateRange[0] ? filters.dateRange[0].toISOString() : null,
        endDate: filters.dateRange[1] ? filters.dateRange[1].toISOString() : null,
        region: filters.region || null,
        product: filters.product || null,
        customer: filters.customer || null
      };
      // Send request with axios including filters
      const response = await axios.post('http://localhost:4901/api/dashboard/summaryData', requestFilters);
      console.log("response",response.data.data);
      setDashboardData(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again later.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      // Delay setting animation ready to ensure smooth transition
      setTimeout(() => {
        setAnimationReady(true);
      }, 300);
    }
  };
  const fetchMonthlyTrndBllVsBkngsData = async () => {
    try {
      setLoading(true);
      setAnimationReady(false);
      
      // Prepare filters for API request
      const requestFilters = {
        startDate: filters.dateRange[0] ? filters.dateRange[0].toISOString() : null,
        endDate: filters.dateRange[1] ? filters.dateRange[1].toISOString() : null,
        region: filters.region || null,
        product: filters.product || null,
        customer: filters.customer || null
      };
      console.log("requestFilters",requestFilters);
      // Send request with axios including filters
      const response = await axios.post('http://localhost:4901/api/dashboard/get/mnthly/Trnd/bllVsBkngs', requestFilters);
     console.log("response",response.data.data)
      setMonthlyTrndBllVsBkngsData(response.data.data.monthlyTrend);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again later.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      // Delay setting animation ready to ensure smooth transition
      setTimeout(() => {
        setAnimationReady(true);
      }, 300);
    }
  };
  const fetchRegionwiseBcklogs = async () => {
    try {
      setLoading(true);
      setAnimationReady(false);
      
      // Prepare filters for API request
      const requestFilters = {
        startDate: filters.dateRange[0] ? filters.dateRange[0].toISOString() : null,
        endDate: filters.dateRange[1] ? filters.dateRange[1].toISOString() : null,
        region: filters.region || null,
        product: filters.product || null,
        customer: filters.customer || null
      };
      // Send request with axios including filters
      const response = await axios.post('http://localhost:4901/api/dashboard/get/backlogByRegion', requestFilters);
     console.log("respofetchRegionwiseBcklogs",response.data.data.backlogByRegion)
      setRegionwiseBcklogs(response.data.data.backlogByRegion);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again later.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      // Delay setting animation ready to ensure smooth transition
      setTimeout(() => {
        setAnimationReady(true);
      }, 300);
    }
  }
  const fetchProductDistribution = async () => {
    try {
      setLoading(true);
      setAnimationReady(false);
      
      // Prepare filters for API request
      const requestFilters = {
        startDate: filters.dateRange[0] ? filters.dateRange[0].toISOString() : null,
        endDate: filters.dateRange[1] ? filters.dateRange[1].toISOString() : null,
        region: filters.region || null,
        product: filters.product || null,
        customer: filters.customer || null
      };
      // Send request with axios including filters
      const response = await axios.post('http://localhost:4901/api/dashboard/get/productDistribution', requestFilters);
     console.log("respofetchProductDistribution",response.data.data.productDistribution)
      setProductDistribution(response.data.data.productDistribution);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again later.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      // Delay setting animation ready to ensure smooth transition
      setTimeout(() => {
        setAnimationReady(true);
      }, 300);
    }
  }
  const fetchDrillDownSummary = async () => {
    try {
      setLoading(true);
      
      // Prepare filters for API request
      const requestFilters = {
        startDate: filters.dateRange[0] ? filters.dateRange[0].toISOString() : null,
        endDate: filters.dateRange[1] ? filters.dateRange[1].toISOString() : null,
        region: filters.region || null,
        product: filters.product || null,
        customer: filters.customer || null
      };
      
      // Send request with axios including filters
      const response = await axios.post('http://localhost:4901/api/dashboard/get/drillDownSummary', requestFilters);
      console.log("fetchDrillDownSummary response", response.data.data.drillDownSummary);
      
      // Update state with the fetched data
      setDrillDownSummaryData(response.data.data.drillDownSummary);
      setError(null);
    } catch (err) {
      setError('Failed to fetch drill-down summary data. Please try again later.');
      console.error('Error fetching drill-down summary data:', err);
    }
  }
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    console.log('Filters applied:', newFilters);
    // Here you would typically refetch data with the new filters
    // or filter the existing data client-side
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle Excel export
  const onExporting = (e: any) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dashboard Data');
    
    exportDataGrid({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
      customizeCell: ({ gridCell, excelCell }: any) => {
        if(gridCell.column.dataType === 'number' && gridCell.column.format === 'currency') {
          excelCell.numFmt = '₹#,##0.00';
        }
      }
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer: any) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Dashboard-Data.xlsx');
      });
    });
  };

  // Helper function to render percentage change indicator
  const renderPercentageChange = (value: string, isPositive: boolean) => {
    const color = isPositive ? 'success' : 'error';
    const icon = isPositive ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;

    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: isPositive ? 'success.light' : 'error.light',
        color: isPositive ? 'success.main' : 'error.main',
        borderRadius: '4px',
        px: 0.75,
        py: 0.25,
        fontSize: '0.75rem',
        fontWeight: 500,
        width: 'fit-content'
      }}>
        {icon}
        <Typography variant="caption" sx={{ ml: 0.5 }}>
          {value}
        </Typography>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'rgba(0, 0, 0, 0.85)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          color: 'white'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <InsightsIcon sx={{ fontSize: 60, color: '#3f88c5' }} />
          </Box>
          <CircularProgress size={48} sx={{ mb: 2, color: '#3f88c5' }} />
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 500 }}>
            Loading Dashboard
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Preparing your analytics data...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'background.default',
          color: 'error.main'
        }}
      >
        <Typography variant="h2" sx={{ mb: 2 }}>Error</Typography>
        <Typography>{error}</Typography>
        <Typography sx={{ mt: 1 }}>Make sure the server is running on port 4901</Typography>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'background.default'
        }}
      >
        <Typography>No dashboard data available</Typography>
      </Box>
    );
  }


 


  // Custom shape for the bar chart
  const CustomBar = (props: any) => {
    const { x, y, width, height, fill } = props;
    const radius = 6;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          rx={radius}
          ry={radius}
        />
      </g>
    );
  };

  // Custom label for pie chart
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, name } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Sample data for the drill-down summary table
  const drillDownSummaryDataSample = [
    {
      id: 1,
      customer: 'Acme Corporation',
      region: 'North America',
      product: 'Product A',
      totalBookings: 1250000,
      totalBillings: 980000,
      backlog: 270000,
      bookToBillRatio: 1.28
    },
    {
      id: 2,
      customer: 'Globex Industries',
      region: 'Europe',
      product: 'Product B',
      totalBookings: 890000,
      totalBillings: 820000,
      backlog: 70000,
      bookToBillRatio: 1.09
    },
    {
      id: 3,
      customer: 'Initech Systems',
      region: 'Asia Pacific',
      product: 'Product A',
      totalBookings: 750000,
      totalBillings: 620000,
      backlog: 130000,
      bookToBillRatio: 1.21
    },
    {
      id: 4,
      customer: 'Umbrella Corp',
      region: 'North America',
      product: 'Product C',
      totalBookings: 1100000,
      totalBillings: 950000,
      backlog: 150000,
      bookToBillRatio: 1.16
    },
    {
      id: 5,
      customer: 'Stark Industries',
      region: 'Europe',
      product: 'Product D',
      totalBookings: 2100000,
      totalBillings: 1800000,
      backlog: 300000,
      bookToBillRatio: 1.17
    },
    {
      id: 6,
      customer: 'Wayne Enterprises',
      region: 'North America',
      product: 'Product B',
      totalBookings: 1650000,
      totalBillings: 1450000,
      backlog: 200000,
      bookToBillRatio: 1.14
    },
    {
      id: 7,
      customer: 'Cyberdyne Systems',
      region: 'Asia Pacific',
      product: 'Product C',
      totalBookings: 920000,
      totalBillings: 750000,
      backlog: 170000,
      bookToBillRatio: 1.23
    },
    {
      id: 8,
      customer: 'Oscorp Industries',
      region: 'Latin America',
      product: 'Product A',
      totalBookings: 580000,
      totalBillings: 520000,
      backlog: 60000,
      bookToBillRatio: 1.12
    },
    {
      id: 9,
      customer: 'LexCorp',
      region: 'Middle East',
      product: 'Product D',
      totalBookings: 430000,
      totalBillings: 380000,
      backlog: 50000,
      bookToBillRatio: 1.13
    },
    {
      id: 10,
      customer: 'Massive Dynamic',
      region: 'Africa',
      product: 'Product B',
      totalBookings: 320000,
      totalBillings: 290000,
      backlog: 30000,
      bookToBillRatio: 1.10
    }
  ];

  // Function to format currency values
  const currencyFormatter = (data: any) => {
    return `$${Number(data.value).toLocaleString()}`;
  };

  // Function to format ratio values
  const ratioFormatter = (data: any) => {
    return Number(data.value).toFixed(2);
  };

  // Function to render skeleton loading for table
  const renderTableSkeleton = () => {
    return (
      <Paper sx={{
        p: 3,
        height: '100%',
        bgcolor: 'background.default',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderRadius: 2,
        mb: 3
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Drill-Down Summary</Typography>
          
        </Box>
        <Box sx={{ width: '100%', height: 400 }}>
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </Box>
      </Paper>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        minHeight: '100vh',
        width: '100%'
      }}>
        <DashboardHeader
          onFilterChange={handleFilterChange}
          toggleFilters={toggleFilters}
          showFilters={showFilters}
          currentFilters={filters}
        />

        <Box sx={{ p: { xs: 2, md: 3 }, flexGrow: 1 }} style={{ backgroundColor: '#f3f3f3' }}>
          {/* Overview Section */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#333333' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <DashboardIcon />
              </Avatar>
              <Typography variant="h1">Overview</Typography>
            </Box>
          </Box>


          {/* Metrics Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  borderRadius: 3, 
                  boxShadow: '0 8px 16px rgba(63, 136, 197, 0.12)', 
                  overflow: 'hidden',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 20px rgba(63, 136, 197, 0.18)'
                  },
                  position: 'relative',
                  height: '100%'
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    height: '6px', 
                    background: 'linear-gradient(90deg, #3f88c5 0%, #4dabf5 100%)' 
                  }} 
                />
                <CardContent sx={{ pt: 2, pb: 2, px: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 500, 
                        fontSize: '0.85rem', 
                        color: 'text.secondary',
                        letterSpacing: '0.1px'
                      }}
                    >
                      Total Billings
                    </Typography>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'rgba(63, 136, 197, 0.1)', 
                        width: 32, 
                        height: 32 
                      }}
                    >
                      <PaidOutlinedIcon sx={{ color: '#3f88c5' }} />
                    </Avatar>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h1" 
                        component="div" 
                        sx={{ 
                          mb: 0.5, 
                          fontWeight: 600, 
                          fontSize: '1.6rem',
                          color: '#1a1a1a',
                          letterSpacing: '-0.5px'
                        }}
                      >
                        {animationReady && dashboardData ? (
                          <CountUp 
                            start={0}
                            end={dashboardData.metrics.totalBillings || 0}
                            duration={1.5}
                            separator=","
                            decimals={0}
                          />
                        ) : '0'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        Billings
                      </Typography>
                    </Box>
                    
                    <Box sx={{ flex: 1, textAlign: 'right' }}>
                      <Typography 
                        variant="h2" 
                        component="div" 
                        sx={{ 
                          mb: 0.5, 
                          fontWeight: 600, 
                          fontSize: '1.3rem',
                          color: '#1a1a1a',
                          letterSpacing: '-0.5px'
                        }}
                      >
                        {animationReady && dashboardData ? (
                          <CountUp 
                            start={0}
                            end={dashboardData.metrics.totalBillingAmount || 0}
                            duration={1.5}
                            separator=","
                            decimals={2}
                            decimal="."
                            prefix="₹"
                          />
                        ) : '₹0.00'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        Amount
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      MTD: {animationReady && dashboardData ? (
                        <span style={{ fontWeight: 500, color: '#1a1a1a' }}>
                          ₹{dashboardData.metrics.totalBillingsMTD ? 
                            dashboardData.metrics.totalBillingsMTD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 
                            '0.00'}
                        </span>
                      ) : '₹0.00'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      YTD: {animationReady && dashboardData ? (
                        <span style={{ fontWeight: 500, color: '#1a1a1a' }}>
                          ₹{dashboardData.metrics.totalBillingsYTD ? 
                            dashboardData.metrics.totalBillingsYTD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 
                            '0.00'}
                        </span>
                      ) : '₹0.00'}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center' }}>
                    {dashboardData && dashboardData.metrics.currentMonthBillingsChange !== undefined ? (
                      <>
                        {renderPercentageChange(`${dashboardData.metrics.currentMonthBillingsChange}%`, dashboardData.metrics.currentMonthBillingsChange >= 0)}
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            ml: 1, 
                            color: 'text.secondary', 
                            fontSize: '0.75rem',
                            fontWeight: 400
                          }}
                        >
                          vs. last month
                        </Typography>
                      </>
                    ) : null}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  borderRadius: 3, 
                  boxShadow: '0 8px 16px rgba(102, 187, 106, 0.12)', 
                  overflow: 'hidden',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 20px rgba(102, 187, 106, 0.18)'
                  },
                  position: 'relative',
                  height: '100%'
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    height: '6px', 
                    background: 'linear-gradient(90deg, #66bb6a 0%, #81c784 100%)' 
                  }} 
                />
                <CardContent sx={{ pt: 2, pb: 2, px: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 500, 
                        fontSize: '0.85rem', 
                        color: 'text.secondary',
                        letterSpacing: '0.1px'
                      }}
                    >
                      Total Bookings
                    </Typography>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'rgba(102, 187, 106, 0.1)', 
                        width: 32, 
                        height: 32 
                      }}
                    >
                      <BookOnlineOutlinedIcon sx={{ color: '#66bb6a' }} />
                    </Avatar>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h1" 
                        component="div" 
                        sx={{ 
                          mb: 0.5, 
                          fontWeight: 600, 
                          fontSize: '1.6rem',
                          color: '#1a1a1a',
                          letterSpacing: '-0.5px'
                        }}
                      >
                        {animationReady && dashboardData ? (
                          <CountUp 
                            start={0}
                            end={dashboardData.metrics.totalBookings || 0}
                            duration={1.5}
                            separator=","
                            decimals={0}
                          />
                        ) : '0'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        Bookings
                      </Typography>
                    </Box>
                    
                    <Box sx={{ flex: 1, textAlign: 'right' }}>
                      <Typography 
                        variant="h2" 
                        component="div" 
                        sx={{ 
                          mb: 0.5, 
                          fontWeight: 600, 
                          fontSize: '1.3rem',
                          color: '#1a1a1a',
                          letterSpacing: '-0.5px'
                        }}
                      >
                        {animationReady && dashboardData ? (
                          <CountUp 
                            start={0}
                            end={dashboardData.metrics.totalBookingAmount || 0}
                            duration={1.5}
                            separator=","
                            decimals={2}
                            decimal="."
                            prefix="₹"
                          />
                        ) : '₹0.00'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        Amount
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      MTD: {animationReady && dashboardData ? (
                        <span style={{ fontWeight: 500, color: '#1a1a1a' }}>
                          ₹{dashboardData.metrics.totalBookingsMTD ? 
                            dashboardData.metrics.totalBookingsMTD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 
                            '0.00'}
                        </span>
                      ) : '₹0.00'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      YTD: {animationReady && dashboardData ? (
                        <span style={{ fontWeight: 500, color: '#1a1a1a' }}>
                          ₹{dashboardData.metrics.totalBookingsYTD ? 
                            dashboardData.metrics.totalBookingsYTD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 
                            '0.00'}
                        </span>
                      ) : '₹0.00'}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center' }}>
                    {dashboardData && dashboardData.metrics.currentMonthBookingsChange !== undefined ? (
                      <>
                        {renderPercentageChange(`${dashboardData.metrics.currentMonthBookingsChange}%`, dashboardData.metrics.currentMonthBookingsChange >= 0)}
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            ml: 1, 
                            color: 'text.secondary', 
                            fontSize: '0.75rem',
                            fontWeight: 400
                          }}
                        >
                          vs. last month
                        </Typography>
                      </>
                    ) : null}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  borderRadius: 3, 
                  boxShadow: '0 8px 16px rgba(255, 167, 38, 0.12)', 
                  overflow: 'hidden',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 20px rgba(255, 167, 38, 0.18)'
                  },
                  position: 'relative',
                  height: '100%'
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    height: '6px', 
                    background: 'linear-gradient(90deg, #ffa726 0%, #ffb74d 100%)' 
                  }} 
                />
                <CardContent sx={{ pt: 2, pb: 2, px: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 500, 
                        fontSize: '0.85rem', 
                        color: 'text.secondary',
                        letterSpacing: '0.1px'
                      }}
                    >
                      Total Backlog Amount
                    </Typography>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'rgba(255, 167, 38, 0.1)', 
                        width: 32, 
                        height: 32 
                      }}
                    >
                      <AssignmentOutlinedIcon sx={{ color: '#ffa726' }} />
                    </Avatar>
                  </Box>
                  <Typography 
                    variant="h1" 
                    component="div" 
                    sx={{ 
                      mb: 1.5, 
                      fontWeight: 600, 
                      fontSize: '1.6rem',
                      color: '#1a1a1a',
                      letterSpacing: '-0.5px'
                    }}
                  >
                    {animationReady && dashboardData ? (
                      <CountUp 
                        start={0}
                        end={dashboardData.metrics.totalBacklogAmount || 0}
                        duration={1.5}
                        separator=","
                            decimals={2}
                            decimal="."
                            prefix="₹"
                      />
                    ) : '₹0.00'}
                  </Typography>
                  <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center' }}>
                    {renderPercentageChange(`${dashboardData.metrics.currentMonthBacklogAmountChange}%`, dashboardData.metrics.currentMonthBacklogAmountChange >= 0)}
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        ml: 1, 
                        color: 'text.secondary', 
                        fontSize: '0.75rem',
                        fontWeight: 400
                      }}
                    >
                      vs. last month
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  borderRadius: 3, 
                  boxShadow: '0 8px 16px rgba(156, 39, 176, 0.12)', 
                  overflow: 'hidden',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 20px rgba(156, 39, 176, 0.18)'
                  },
                  position: 'relative',
                  height: '100%'
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    height: '6px', 
                    background: 'linear-gradient(90deg, #9c27b0 0%, #ba68c8 100%)' 
                  }} 
                />
                <CardContent sx={{ pt: 2, pb: 2, px: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 500, 
                        fontSize: '0.85rem', 
                        color: 'text.secondary',
                        letterSpacing: '0.1px'
                      }}
                    >
                      Book-to-Bill Ratio
                    </Typography>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'rgba(156, 39, 176, 0.1)', 
                        width: 32, 
                        height: 32 
                      }}
                    >
                      <TrendingUpOutlinedIcon sx={{ color: '#9c27b0' }} />
                    </Avatar>
                  </Box>
                  <Typography 
                    variant="h1" 
                    component="div" 
                    sx={{ 
                      mb: 1.5, 
                      fontWeight: 600, 
                      fontSize: '1.6rem',
                      color: '#1a1a1a',
                      letterSpacing: '-0.5px'
                    }}
                  >
                    {animationReady && dashboardData ? (
                      <CountUp 
                        start={0}
                        end={dashboardData.metrics.bookToBillRatio || 0}
                        duration={1.5}
                        decimals={2}
                        decimal="."
                      />
                    ) : '0.00'}
                  </Typography>
                  <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center' }}>
                      {renderPercentageChange(`${dashboardData.metrics.currentMonthBookToBillRatioChange}%`, dashboardData.metrics.currentMonthBookToBillRatioChange > 0)}
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        ml: 1, 
                        color: 'text.secondary', 
                        fontSize: '0.75rem',
                        fontWeight: 400
                      }}
                    >
                      vs. last month
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={12}>
              <Paper sx={{ p: 3, height: '100%', bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <TimelineIcon />
                    </Avatar>
                    <Typography variant="h6">Monthly Trend: Bookings vs Billings</Typography>
                  </Box>
                </Box>
                <Box sx={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyTrndBllVsBkngsData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Bookings"
                        stroke="#8884d8"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Billings"
                        stroke="#82ca9d"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Backlog by Region Chart */}
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3, height: '100%', bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <BarChartIcon />
                    </Avatar>
                    <Typography variant="h6">Backlog by Region</Typography>
                  </Box>
                </Box>
                <Box sx={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={regionwiseBcklogs}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Backlog']} />
                      <Bar
                        dataKey="value"
                        name="Backlog Value"
                        shape={<CustomBar />}
                      >
                        {regionwiseBcklogs.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3, height: '100%', bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <PieChartIcon />
                    </Avatar>
                    <Typography variant="h6">Product Distribution</Typography>
                  </Box>
                </Box>
                <Box sx={{ width: '100%', height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {productDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${value}`, 'Market Share']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>


          {/* Table View (Drill-Down Summary) */}
          {dashboardData ? (
            <Box sx={{ mt: 4, mb: 4 }}>
              <Paper sx={{
                p: 3,
                height: '100%',
                bgcolor: 'background.default',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderRadius: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <EqualizerIcon />
                  </Avatar>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 500 }}>
                    Detailed Data Analysis
                  </Typography>
                </Box>
                <Box sx={{ mt: 2, height: 500 }}>
                  <DataGrid
                    dataSource={drillDownSummaryData}
                    showBorders={true}
                    columnAutoWidth={true}
                    rowAlternationEnabled={true}
                    allowColumnReordering={true}
                    className="colored-header-grid"
                    onExporting={onExporting}
                  >
                    <Scrolling columnRenderingMode="virtual" />
                    <ColumnChooser enabled={true} />
                    <GroupPanel visible={true} />
                    <SearchPanel visible={true} width={240} placeholder="Search..." />
                    <FilterRow visible={true} />
                    <HeaderFilter visible={true} />
                    <Sorting mode="multiple" />
                    <Export enabled={true} allowExportSelectedData={true} />

                    <Column dataField="customer" caption="Customer" />
                    <Column dataField="region" caption="Region" />
                    <Column dataField="product" caption="Product" />
                    <Column
                      dataField="totalBookings"
                      caption="Total Bookings"
                      dataType="number"
                      format="currency"
                      alignment="right"
                      cellRender={currencyFormatter}
                      allowFiltering={false}
                      allowHeaderFiltering={false}
                    />
                    <Column
                      dataField="totalBillings"
                      caption="Total Billings"
                      dataType="number"
                      format="currency"
                      alignment="right"
                      cellRender={currencyFormatter}
                      allowFiltering={false}
                      allowHeaderFiltering={false}
                    />
                    <Column
                      dataField="backlog"
                      caption="Backlog"
                      dataType="number"
                      format="currency"
                      alignment="right"
                      cellRender={currencyFormatter}
                      allowFiltering={false}
                      allowHeaderFiltering={false}
                    />
                    <Column
                      dataField="bookToBillRatio"
                      caption="Book-to-Bill Ratio"
                      dataType="number"
                      alignment="right"
                      cellRender={ratioFormatter}
                      allowFiltering={false}
                      allowHeaderFiltering={false}
                    />

                    <Paging defaultPageSize={10} />
                    <Pager
                      showPageSizeSelector={true}
                      allowedPageSizes={[5, 10, 20]}
                      showInfo={true}
                      showNavigationButtons={true}
                    />

                    <Summary>
                      <TotalItem
                        column="totalBookings"
                        summaryType="sum"
                        valueFormat="currency"
                        displayFormat="Total: {0}"
                      />
                      <TotalItem
                        column="totalBillings"
                        summaryType="sum"
                        valueFormat="currency"
                        displayFormat="Total: {0}"
                      />
                      <TotalItem
                        column="backlog"
                        summaryType="sum"
                        valueFormat="currency"
                        displayFormat="Total: {0}"
                      />
                      <TotalItem
                        column="bookToBillRatio"
                        summaryType="avg"
                        valueFormat="fixedPoint"
                        displayFormat="Avg: {0}"
                      />
                    </Summary>
                  </DataGrid>
                </Box>
              </Paper>
            </Box>
          ) : (
            renderTableSkeleton()
          )}

          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Typography variant="subtitle2">
              Last updated: {new Date(dashboardData.lastUpdated).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
