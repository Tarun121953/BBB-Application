import React, { useEffect, useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Badge,
    Stack,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Autocomplete,
    TextField,
    useTheme,
    useMediaQuery,
    Paper,
    Collapse,
    Divider,
    Chip,
    Grid
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import PublicIcon from '@mui/icons-material/Public';
import InventoryIcon from '@mui/icons-material/Inventory';
import BusinessIcon from '@mui/icons-material/Business';
import TuneIcon from '@mui/icons-material/Tune';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateRange } from '@mui/x-date-pickers-pro';
import { format } from 'date-fns';
import axios from 'axios';

// Sample data interfaces
interface Product {
    id: string;
    name: string;
}

interface Customer {
    id: string;
    name: string;
}

interface Region {
    id: string;
    name: string;
}

interface FilterState {
    dateRange: DateRange<Date>;
    region: string;
    product: string;
    customer: string | null;
}

interface DashboardHeaderProps {
    onFilterChange?: (filters: FilterState) => void;
    toggleFilters?: () => void;
    showFilters?: boolean;
    currentFilters?: FilterState;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    onFilterChange,
    toggleFilters,
    showFilters = false,
    currentFilters
}) => {
    // Use currentFilters from parent or default values
    const filters = currentFilters || {
        dateRange: [null, null],
        region: '',
        product: '',
        customer: null
    };
    
    // Calculate activeFilters based on current filters
    const activeFilters = 
        !!filters.region ||
        !!filters.product ||
        !!filters.customer ||
        !!(filters.dateRange[0] && filters.dateRange[1]);
    const [tempFilters, setTempFilters] = useState<FilterState>({
        dateRange: [null, null],
        region: '',
        product: '',
        customer: null
    });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleToggleFilters = () => {
        if (toggleFilters) {
            toggleFilters();
        }

        if (!showFilters) {
            // When opening, set temp filters to current filters
            setTempFilters({ ...filters });
        }
    };

    const handleRegionChange = (event: SelectChangeEvent) => {
        setTempFilters({ ...tempFilters, region: event.target.value });
    };

    const handleProductChange = (event: SelectChangeEvent) => {
        setTempFilters({ ...tempFilters, product: event.target.value });
    };

    const handleCustomerChange = (event: React.SyntheticEvent, value: string | null) => {
        setTempFilters({ ...tempFilters, customer: value });
    };

    const handleDateRangeChange = (newDateRange: DateRange<Date>) => {
        setTempFilters({ ...tempFilters, dateRange: newDateRange });
    };

    const applyFilters = () => {
        if (onFilterChange) {
            onFilterChange(tempFilters);
        }
        if (toggleFilters) {
            toggleFilters();
        }
    };

    const clearFilters = () => {
        const emptyFilters = {
            dateRange: [null, null] as DateRange<Date>,
            region: '',
            product: '',
            customer: null
        };
        setTempFilters(emptyFilters);
        if (onFilterChange) {
            onFilterChange(emptyFilters);
        }
    };

    const handleDeleteFilter = (filterType: keyof FilterState) => {
        const updatedFilters = { ...filters };
        
        if (filterType === 'dateRange') {
            updatedFilters.dateRange = [null, null];
        } else if (filterType === 'customer') {
            updatedFilters[filterType] = null;
        } else {
            updatedFilters[filterType] = '';
        }
        
        if (onFilterChange) {
            onFilterChange(updatedFilters);
        }
    };

    // Format date range for display
    const formatDateRange = (range: DateRange<Date>) => {
        if (range[0] && range[1]) {
            return `${format(range[0], 'MMM d, yyyy')} - ${format(range[1], 'MMM d, yyyy')}`;
        }
        return '';
    };

    // Render active filter chips
    const renderActiveFilterChips = () => {
        const hasActiveFilters =
            !!filters.region ||
            !!filters.product ||
            !!filters.customer ||
            !!(filters.dateRange[0] && filters.dateRange[1]);

        if (!hasActiveFilters) return null;

        return (
            <Box sx={{
                mt: 1,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                px: 2,
                py: 1,
                backgroundColor: '#ffffff',
                borderRadius: 1
            }}>
                {filters.dateRange[0] && filters.dateRange[1] && (
                    <Chip
                        icon={<CalendarMonthIcon />}
                        label={formatDateRange(filters.dateRange)}
                        onDelete={() => handleDeleteFilter('dateRange')}
                        deleteIcon={<CloseIcon />}
                        color="primary"
                        variant="outlined"
                        size="small"
                    />
                )}

                {filters.region && (
                    <Chip
                        icon={<LocationOnIcon />}
                        label={filters.region}
                        onDelete={() => handleDeleteFilter('region')}
                        deleteIcon={<CloseIcon />}
                        color="primary"
                        variant="outlined"
                        size="small"
                    />
                )}

                {filters.product && (
                    <Chip
                        icon={<CategoryIcon />}
                        label={filters.product}
                        onDelete={() => handleDeleteFilter('product')}
                        deleteIcon={<CloseIcon />}
                        color="primary"
                        variant="outlined"
                        size="small"
                    />
                )}

                {filters.customer && (
                    <Chip
                        icon={<PersonIcon />}
                        label={filters.customer}
                        onDelete={() => handleDeleteFilter('customer')}
                        deleteIcon={<CloseIcon />}
                        color="primary"
                        variant="outlined"
                        size="small"
                    />
                )}
            </Box>
        );
    };
// State for filter data
    const [products, setProducts] = useState<string[]>([]);
    const [customers, setCustomers] = useState<string[]>([]);
    const [regions, setRegions] = useState<string[]>([]);

    useEffect(() => {
        getFilterData()
    },[])
    
    const getFilterData = async () => {
        try {
            // Determine API base URL based on environment
            const baseUrl = process.env.NODE_ENV === 'production' 
                ? 'https://bbb-application.onrender.com' 
                : 'http://localhost:4901';
                
            const response = await axios.get(`${baseUrl}/api/dashboard/get/filterData`);
            setProducts(response.data.data.products)
            setCustomers(response.data.data.customers)
            setRegions(response.data.data.regions)
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <>
            <AppBar
                position="sticky"
                sx={{
                    backgroundColor: '#ffffff',
                    color: 'text.primary',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
            >
                <Toolbar sx={{backgroundImage: 'url(/header-bg.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', color: '#ffffff', position: 'relative'}}>
                    {/* Dark overlay for better text readability */}
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 0 }} />
                    
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', position: 'relative', zIndex: 1, textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                        BBB Dashboard
                    </Typography>

                    <IconButton
                        color="inherit"
                        aria-label="filter dashboard"
                        onClick={handleToggleFilters}
                        sx={{
                            transition: 'transform 0.3s ease',
                            transform: showFilters ? 'rotate(180deg)' : 'rotate(0)',
                        }}
                    >
                        <Badge
                            color="secondary"
                            variant="dot"
                            invisible={!activeFilters}
                        >
                            <FilterListIcon />
                        </Badge>
                    </IconButton>
                </Toolbar>

                {/* Display active filter chips */}
                {activeFilters && renderActiveFilterChips()}
            </AppBar>

            <Collapse in={showFilters}>
                <Paper
                    elevation={1}
                    sx={{
                        width: '100%',
                        padding: theme.spacing(2),
                        borderRadius: 0,
                        backgroundColor: '#ffffff',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                    }}
                >
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        {isMobile ? (
                            // Mobile view - vertical layout
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <TuneIcon sx={{ mr: 1, color: 'primary.main' }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Filters</Typography>
                                    </Box>
                                </Box>

                                <Divider />

                                <Box sx={{ mt: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <CalendarMonthIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Date Range</Typography>
                                    </Box>
                                    <DateRangePicker
                                        value={tempFilters.dateRange}
                                        onChange={handleDateRangeChange}
                                        sx={{ width: '100%', '& .MuiInputBase-root': { height: '40px' } }}
                                        slotProps={{
                                            textField: {
                                                InputProps: {
                                                    startAdornment: <CalendarMonthIcon sx={{ mr: 1, color: 'action.active', fontSize: 20 }} />
                                                }
                                            }
                                        }}
                                    />
                                </Box>

                                <Box sx={{ mt: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <PublicIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Region</Typography>
                                    </Box>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            id="region-select"
                                            value={tempFilters.region}
                                            onChange={handleRegionChange}
                                            startAdornment={<LocationOnIcon sx={{ mr: 1, color: 'action.active', fontSize: 20 }} />}
                                        >
                                        <MenuItem value=""><em>Select region</em></MenuItem>
                                        {regions.map((region: string) => (
                                            <MenuItem key={region} value={region}>{region}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                </Box>

                                <Box sx={{ mt: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <InventoryIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Product</Typography>
                                    </Box>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            id="product-select"
                                            value={tempFilters.product}
                                            onChange={handleProductChange}
                                            startAdornment={<CategoryIcon sx={{ mr: 1, color: 'action.active', fontSize: 20 }} />}
                                        >
                                        <MenuItem value=""><em>Select product</em></MenuItem>
                                        {products.map((product: string) => (
                                            <MenuItem key={product} value={product}>{product}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                </Box>

                                <Box sx={{ mt: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <BusinessIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Customer</Typography>
                                    </Box>
                                    <Autocomplete
                                        id="customer-select"
                                        options={customers}
                                        value={tempFilters.customer}
                                        onChange={handleCustomerChange}
                                        size="small"
                                        renderInput={(params) => 
                                            <TextField 
                                                {...params} 
                                                placeholder="Select customer"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <>
                                                            <PersonIcon sx={{ mr: 1, color: 'action.active', fontSize: 20 }} />
                                                            {params.InputProps.startAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        }
                                    />
                                </Box>

                                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={clearFilters}
                                        fullWidth
                                        size="small"
                                        startIcon={<ClearIcon />}
                                        color="error"
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={applyFilters}
                                        startIcon={<CheckIcon />}
                                        fullWidth
                                        size="small"
                                    >
                                        Apply Filters
                                    </Button>
                                </Stack>
                            </Stack>
                        ) : (
                            // Desktop view - horizontal layout
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <TuneIcon sx={{ mr: 1, color: 'primary.main' }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Filters</Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            variant="outlined"
                                            onClick={clearFilters}
                                            size="small"
                                            startIcon={<ClearIcon />}
                                            color="error"
                                        >
                                            Clear
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={applyFilters}
                                            size="small"
                                            startIcon={<CheckIcon />}
                                        >
                                            Apply
                                        </Button>
                                    </Stack>
                                </Box>

                                <Divider sx={{ mb: 2 }} />

                                <Grid container spacing={2} alignItems="flex-end">
                                    <Grid item xs={12} md={4}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <CalendarMonthIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Date Range</Typography>
                                        </Box>
                                        <DateRangePicker
                                            value={tempFilters.dateRange}
                                            onChange={handleDateRangeChange}
                                            sx={{ width: '100%', '& .MuiInputBase-root': { height: '40px' } }}
                                            slotProps={{
                                                textField: {
                                                    InputProps: {
                                                        startAdornment: <CalendarMonthIcon sx={{ mr: 1, color: 'action.active', fontSize: 20 }} />
                                                    }
                                                }
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={2}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <PublicIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Region</Typography>
                                        </Box>
                                        <FormControl fullWidth size="small">
                                            <Select
                                                id="region-select"
                                                value={tempFilters.region}
                                                onChange={handleRegionChange}
                                                startAdornment={<LocationOnIcon sx={{ mr: 1, color: 'action.active', fontSize: 20 }} />}
                                            >
                                                <MenuItem value=""><em>Select region</em></MenuItem>
                                                {regions.map((region: string) => (
                                                    <MenuItem key={region} value={region}>{region}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <InventoryIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Product</Typography>
                                        </Box>
                                        <FormControl fullWidth size="small">
                                            <Select
                                                id="product-select"
                                                value={tempFilters.product}
                                                onChange={handleProductChange}
                                                startAdornment={<CategoryIcon sx={{ mr: 1, color: 'action.active', fontSize: 20 }} />}
                                            >
                                                <MenuItem value=""><em>Select product</em></MenuItem>
                                                {products.map((product: string) => (
                                                    <MenuItem key={product} value={product}>{product}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <BusinessIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Customer</Typography>
                                        </Box>
                                        <Autocomplete
                                            id="customer-select"
                                            options={customers}
                                            value={tempFilters.customer}
                                            onChange={handleCustomerChange}
                                            size="small"
                                            renderInput={(params) => 
                                                <TextField 
                                                    {...params} 
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: (
                                                            <>
                                                                <PersonIcon sx={{ mr: 1, color: 'action.active', fontSize: 20 }} />
                                                                {params.InputProps.startAdornment}
                                                            </>
                                                        ),
                                                    }}
                                                />
                                            }
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </LocalizationProvider>
                </Paper>
            </Collapse>
        </>
    );
};

export default DashboardHeader;
