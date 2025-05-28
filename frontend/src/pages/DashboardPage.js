import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardHeader,
  CardContent,
  Typography,
  CircularProgress,
  Tooltip,
  IconButton,
  Paper,
  Table, 
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Grid,
  Chip,
  ButtonGroup,
  Snackbar,
  useTheme
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import { format, formatDistanceToNow, subHours, subDays, subYears } from 'date-fns';
import { Line } from 'react-chartjs-2';
import { 
  getDashboardSummary, 
  getPONOutageList, 
  refreshComponents, 
  refreshAllOnts, 
  refreshAllOlts, 
  refreshPonPorts,
  getNetworkStatus,
  getNetworkStatusSummary,
  getAllOnts 
} from '../services/api';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  TimeScale
);

// Helper function to generate time-based labels
const generateTimeLabels = (count = 30) => {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now);
    date.setMinutes(date.getMinutes() - (count - i - 1) * 5); // 5-minute intervals
    return date;
  });
};

// Helper function to get status color
const getStatusColor = (status) => {
  if (!status) return 'text.secondary';
  switch (status.toLowerCase()) {
    case 'up': return 'success.main';
    case 'degraded': 
    case 'warning': 
      return 'warning.main';
    case 'down': 
    case 'error': 
      return 'error.main';
    case 'maintenance': 
      return 'info.main';
    default: 
      return 'text.secondary';
  }
};

// NetworkStatusGraph component to display ONT status metrics
const NetworkStatusGraph = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h'); // Default to 24 hours
  
  // Time range options for the dropdown
  const timeRangeOptions = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '1y', label: 'Last Year' },
  ];
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Online ONTs',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Signal Loss',
        data: [],
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Power Failure',
        data: [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.3,
      },
    ],
  });
  
  const [metrics, setMetrics] = useState({
    totalOnts: 0,
    onlineOnts: 0,
    offlineOnts: 0,
    signalLoss: 0,
    powerFailure: 0,
    status: 'up',
  });

  // Error boundary component
  const ErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState(null);
    
    useEffect(() => {
      const errorHandler = (error) => {
        console.error('Error in component:', error);
        setError(error);
        setHasError(true);
        return true; // Prevent default error handling
      };
      
      window.addEventListener('error', errorHandler);
      return () => window.removeEventListener('error', errorHandler);
    }, []);
    
    if (hasError) {
      return (
        <Box color="error.main" p={2} border={1} borderColor="error.main">
          <Typography variant="h6">Error in Network Status Graph</Typography>
          <Typography variant="body2">{error?.message || 'An unknown error occurred'}</Typography>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={() => window.location.reload()}
            sx={{ mt: 1 }}
          >
            Reload Component
          </Button>
        </Box>
      );
    }
    
    return children;
  };

  // Get date range based on selected time range
  const getDateRange = () => {
    const now = new Date();
    let from;
    
    switch(timeRange) {
      case '1h':
        from = subHours(now, 1);
        break;
      case '24h':
        from = subDays(now, 1);
        break;
      case '7d':
        from = subDays(now, 7);
        break;
      case '30d':
        from = subDays(now, 30);
        break;
      case '1y':
        from = subYears(now, 1);
        break;
      default:
        from = subDays(now, 1);
    }
    
    return { from, to: now };
  };

  // Format date based on time range for display
  const formatDateLabel = (date, range) => {
    const d = new Date(date);
    switch(range) {
      case '1h':
        return format(d, 'HH:mm');
      case '24h':
        return format(d, 'HH:00');
      case '7d':
      case '30d':
        return format(d, 'MMM d');
      case '1y':
        return format(d, 'MMM yyyy');
      default:
        return format(d, 'MMM d, yyyy HH:mm');
    }
  };

  // Fetch and process ONT data
  const fetchOntData = useCallback(async () => {
    const { from, to } = getDateRange();
    console.log(`Fetching data from ${from} to ${to} (${timeRange} range)`);
    console.log('Starting ONT data fetch...');
    setIsLoading(true);
    
    try {
      console.log('1. Starting API call to getAllOnts()...');
      
      // 1. Fetch data from API with timeout
      let onts;
      try {
        const response = await Promise.race([
          getAllOnts(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          )
        ]);
        
        // Ensure we have valid data
        if (!response) {
          throw new Error('Empty response from server');
        }
        
        // Handle case where response might be { data: [...] }
        onts = Array.isArray(response) ? response : (response.data || []);
        
        console.log('2. Received ONTs:', onts);
        
        if (!Array.isArray(onts)) {
          console.error('Expected array of ONTs but got:', typeof onts, onts);
          throw new Error(`Invalid response: expected array, got ${typeof onts}`);
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        throw new Error(`Failed to fetch ONT data: ${apiError.message}`);
      }
      
      console.log(`3. Processed ${onts.length} ONTs`);
      
      // 2. Calculate metrics safely
      const {
        totalOnts,
        onlineOnts,
        offlineOnts,
        signalLoss,
        powerFailure,
        status
      } = safeCalculateMetrics(onts);
      
      console.log('3. Calculated metrics:', {
        totalOnts,
        onlineOnts,
        offlineOnts,
        signalLoss,
        powerFailure,
        status
      });
      
      // 3. Update metrics state
      setMetrics({
        totalOnts,
        onlineOnts,
        offlineOnts,
        signalLoss,
        powerFailure,
        status,
      });
      
      // 4. Update chart data and set last update time
      try {
        const now = new Date();
        const timeLabel = format(now, 'HH:mm');
        
        setChartData(prev => {
          try {
            // Ensure we have valid data before updating
            const safePrev = {
              labels: Array.isArray(prev?.labels) ? prev.labels : [],
              datasets: Array.isArray(prev?.datasets) ? prev.datasets : []
            };
            
            // Initialize datasets if they don't exist
            while (safePrev.datasets.length < 3) {
              safePrev.datasets.push({ data: [] });
            }
            
            // Update labels and data based on time range
        const now = new Date();
        const timeLabel = formatDateLabel(now, timeRange);
        
        // Determine max data points based on time range
        const maxDataPoints = {
          '1h': 12,    // 5-min intervals for 1 hour
          '24h': 24,   // 1-hour intervals for 24 hours
          '7d': 7,     // 1-day intervals for 1 week
          '30d': 30,   // 1-day intervals for 1 month
          '1y': 12     // 1-month intervals for 1 year
        }[timeRange] || 24;
        
        const newLabels = [...safePrev.labels, timeLabel].slice(-maxDataPoints);
        const newOnlineData = [...(safePrev.datasets[0]?.data || []), onlineOnts].slice(-maxDataPoints);
        const newSignalLossData = [...(safePrev.datasets[1]?.data || []), signalLoss].slice(-maxDataPoints);
        const newPowerFailureData = [...(safePrev.datasets[2]?.data || []), powerFailure].slice(-maxDataPoints);
            
            return {
              labels: newLabels,
              datasets: [
                { ...safePrev.datasets[0], data: newOnlineData },
                { ...safePrev.datasets[1], data: newSignalLossData },
                { ...safePrev.datasets[2], data: newPowerFailureData },
              ],
            };
          } catch (chartError) {
            console.error('Error updating chart data:', chartError);
            return prev; // Return previous state if update fails
          }
        });
        
        setLastUpdate(now);
      } catch (updateError) {
        console.error('Error in chart update:', updateError);
        throw updateError; // Re-throw to be caught by the outer catch
      }
      setError(null);
      
    } catch (err) {
      console.error('Error in fetchOntData:', err);
      setError(`Error loading ONT data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Safely calculate metrics from ONT data
  const safeCalculateMetrics = (onts) => {
    // Default values
    const defaultMetrics = {
      totalOnts: 0,
      onlineOnts: 0,
      offlineOnts: 0,
      signalLoss: 0,
      powerFailure: 0,
      status: 'degraded'
    };

    if (!onts) {
      console.error('safeCalculateMetrics: onts is null or undefined');
      return defaultMetrics;
    }

    if (!Array.isArray(onts)) {
      console.error('safeCalculateMetrics: Expected array, got', typeof onts, onts);
      return defaultMetrics;
    }
    
    try {
      const totalOnts = onts.length;
      if (totalOnts === 0) {
        console.warn('safeCalculateMetrics: Received empty ONTs array');
        return { ...defaultMetrics, status: 'down' };
      }
      
      const onlineOnts = onts.filter(ont => ont && ont.status === 'online').length;
      const offlineOnts = Math.max(0, totalOnts - onlineOnts);
      
      const signalLoss = onts.filter(ont => 
        ont?.status !== 'online' || 
        (ont?.rx_power_at_ont !== null && ont.rx_power_at_ont < -28)
      ).length;
      
      const powerFailure = onts.filter(ont => 
        ont?.last_down_cause && 
        (ont.last_down_cause.toLowerCase().includes('power') || 
         ont.last_down_cause.toLowerCase().includes('offline'))
      ).length;
      
      const status = totalOnts > 0 && (onlineOnts / totalOnts) > 0.9 ? 'up' : 'degraded';
      
      return { totalOnts, onlineOnts, offlineOnts, signalLoss, powerFailure, status };
    } catch (error) {
      console.error('Error calculating metrics:', error);
      return {
        totalOnts: 0,
        onlineOnts: 0,
        offlineOnts: 0,
        signalLoss: 0,
        powerFailure: 0,
        status: 'degraded'
      };
    }
  };

  // Handle time range change
  useEffect(() => {
    if (timeRange) {
      fetchOntData();
    }
  }, [timeRange]);

  // Initial data fetch and set up polling
  useEffect(() => {
    console.log('Setting up ONT data polling...');
    
    // Initial fetch
    const fetchData = async () => {
      console.log('Executing ONT data fetch...');
      await fetchOntData();
    };
    
    // Initial fetch
    fetchData().catch(console.error);
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    // Cleanup
    return () => {
      console.log('Cleaning up ONT data polling...');
      clearInterval(interval);
    };
  }, [fetchOntData]);
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of ONTs',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      },
    },
  };

  const statusColor = metrics.status === 'up' ? 'success' : 'warning';
  const statusText = metrics.status === 'up' ? 'All ONTs Operational' : 'Degraded Performance';

  // Show loading state
  if (isLoading && chartData.labels.length === 0) {
    console.log('Showing loading state...');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading ONT data...</Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
        <Button onClick={fetchOntData} color="inherit" size="small" sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
        <Typography variant="h6">ONT Status</Typography>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
              size="small"
            >
              <MenuItem value="1h">Last Hour</MenuItem>
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="1y">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh data">
            <IconButton 
              onClick={fetchOntData} 
              size="small"
              disabled={isLoading}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Box display="flex" alignItems="center" gap={1}>
            <FiberManualRecordIcon 
              fontSize="small" 
              color={statusColor}
              sx={{ 
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 },
                },
              }}
            />
            <Typography variant="caption" color="textSecondary" noWrap>
              {statusText} • Updated: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ height: 300, position: 'relative' }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
      
      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>Online ONTs</Typography>
            <Box display="flex" alignItems="baseline">
              <Typography variant="h4" component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                {metrics.onlineOnts}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                / {metrics.totalOnts} total
              </Typography>
            </Box>
            <Typography variant="caption" color={statusColor}>
              {statusText}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>Signal Loss</Typography>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold',
              color: metrics.signalLoss > 0 ? 'warning.main' : 'text.primary'
            }}>
              {metrics.signalLoss}
            </Typography>
            <Typography variant="caption" color={metrics.signalLoss > 0 ? 'warning.main' : 'text.secondary'}>
              {metrics.signalLoss > 0 ? 'Signal issues detected' : 'No signal issues'}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>Power Failures</Typography>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold',
              color: metrics.powerFailure > 0 ? 'error.main' : 'text.primary'
            }}>
              {metrics.powerFailure}
            </Typography>
            <Typography variant="caption" color={metrics.powerFailure > 0 ? 'error.main' : 'text.secondary'}>
              {metrics.powerFailure > 0 ? 'Power issues detected' : 'No power issues'}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>Last Check</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {format(lastUpdate, 'MMM d, yyyy')}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {format(lastUpdate, 'h:mm:ss a')}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const DashboardPage = () => {
  // Refs
  const wsRef = useRef(null);
  
  // State management
  const [summaryData, setSummaryData] = useState(null);
  const [outageData, setOutageData] = useState([]);
  const [networkStatusData, setNetworkStatusData] = useState([]);
  const [networkStatusLoading, setNetworkStatusLoading] = useState(true);
  const [networkStatusError, setNetworkStatusError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Theme
  const theme = useTheme();

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Refresh state
  const [refreshing, setRefreshing] = useState({
    summary: false,
    outages: false,
    networkStatus: false,
    all: false
  });
  
  // Helper function to get CSRF token
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // WebSocket connection and reconnection logic
  const connectWebSocket = useCallback(() => {
    if (wsRef.current) return;
    
    setLoading(true);
    setError(null);
    
    // Use environment variable or fallback to current host
    const backendHost = process.env.REACT_APP_WS_BACKEND_HOST || 
                      `${window.location.hostname}:${window.location.port || (window.location.protocol === 'https:' ? '443' : '80')}`;
    
    // Use wss:// if the current page is loaded over https, otherwise use ws://
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${backendHost}/ws/dashboard/`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    let ws;
    let retryTimer;
    
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setLoading(false);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log('WebSocket message received:', msg);
          
          switch (msg.type) {
            case 'dashboard_summary':
              setSummaryData(msg.data);
              break;
            case 'outage_update':
              setOutageData(prev => [msg.data, ...prev]);
              break;
            case 'network_status':
              setNetworkStatusData(msg.data);
              break;
            default:
              console.warn('Unhandled message type:', msg.type);
          }
        } catch (e) {
          console.error('Error processing WebSocket message:', e);
          setError('Error processing server message');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error. Reconnecting...');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        wsRef.current = null;
        
        // Attempt to reconnect after a delay
        retryTimer = setTimeout(() => {
          if (!wsRef.current) {
            connectWebSocket();
          }
        }, 5000);
      };
      
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setError('Failed to connect to WebSocket');
      setLoading(false);
      
      // Retry connection after delay
      retryTimer = setTimeout(() => {
        if (wsRef.current) {
          connectWebSocket();
        }
      }, 5000);
    }
    
    // Cleanup function
    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Fetch network status
  const fetchNetworkStatus = async () => {
    try {
      setNetworkStatusLoading(true);
      const [statusData] = await Promise.all([
        getNetworkStatus(),
        getNetworkStatusSummary()
      ]);
      setNetworkStatusData(statusData);
      setNetworkStatusError(null);
      return statusData;
    } catch (err) {
      console.error('Error fetching network status:', err);
      setNetworkStatusError('Failed to load network status');
      throw err;
    } finally {
      setNetworkStatusLoading(false);
    }
  };

  // Fetch data function
  const fetchData = async (component = 'all') => {
    try {
      const promises = [];

      if (component === 'all' || component === 'summary') {
        promises.push(getDashboardSummary().then(data => setSummaryData(data)));
      }
      
      if (component === 'all' || component === 'outages') {
        promises.push(getPONOutageList().then(data => setOutageData(data)));
      }
      
      if (component === 'all' || component === 'networkStatus') {
        promises.push(fetchNetworkStatus());
      }
      
      await Promise.all(promises);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again later.');
      throw err;
    }
  };
  
  // Handle refresh button clicks
  const handleRefresh = async (component = 'all') => {
    setRefreshing(prev => ({
      ...prev,
      [component]: true,
      all: component === 'all'
    }));
    
    try {
      await fetchData(component);
      setSnackbar({
        open: true,
        message: `Successfully refreshed ${component === 'all' ? 'all data' : component}`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || `Failed to refresh ${component}`,
        severity: 'error'
      });
    } finally {
      setRefreshing(prev => ({
        ...prev,
        [component]: false,
        all: false
      }));
    }
  };

  // Initialize WebSocket connection on component mount
  useEffect(() => {
    // Use the same base URL as the API but replace http/https with ws/wss
    const apiUrl = new URL(process.env.REACT_APP_API_BASE_URL || window.location.origin);
    const protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${apiUrl.host}/ws/pon_outages/`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    let ws;
    let reconnectTimeout;
    
    const connectWebSocket = () => {
      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          setLoading(false);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (!msg || !msg.type) {
              console.warn('Received message without type:', msg);
              return;
            }
            
            console.log('Received message type:', msg.type, 'data:', msg.data);
            
            switch(msg.type) {
              case 'dashboard_summary':
                setSummaryData(prev => ({ ...prev, ...msg.data }));
                break;
                
              case 'new_outage':
              case 'updated_outage':
                setOutageData(prev => [msg.data, ...prev.slice(0, 9)]);
                break;
                
              default:
                console.warn('Unhandled message type:', msg.type);
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setError('Connection error. Reconnecting...');
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          if (wsRef.current) { // Only try to reconnect if component is still mounted
            setError('Disconnected. Reconnecting...');
            reconnectTimeout = setTimeout(connectWebSocket, 3000);
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        setError('Failed to connect. Retrying...');
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
      }
    };
    
    // Initial connection
    connectWebSocket();
    
    // Cleanup function
    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      wsRef.current = null;
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // Helper function to get OLT status chip
  const getOltStatusChip = (statusValue, statusDisplay) => {
    if (statusValue?.toLowerCase() === "active") {
      return <Chip label={statusDisplay || "Active"} color="success" size="small" />;
    } else if (statusValue?.toLowerCase() === "inactive" || statusValue?.toLowerCase() === "offline") {
      return <Chip label={statusDisplay || "Inactive"} color="error" size="small" />;
    } else if (statusDisplay) {
      return <Chip label={statusDisplay} color="warning" size="small" />;
    }
    return <Chip label="Unknown" size="small" />;
  };

  // Format temperature with °C
  const formatTemperature = (temp) => (temp !== null && temp !== undefined ? `${temp}°C` : 'N/A');

  // Format time since a given date
  const formatTimeSince = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      const date = new Date(dateTimeString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      console.error("Error formatting date:", dateTimeString, e);
      return 'Invalid Date';
    }
  };

  if (loading && !summaryData && outageData.length === 0) {
    // Only show full loading spinner on initial load
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  }

  if (error && !summaryData && outageData.length === 0) {
     // Only show full error on initial load
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Box sx={{ p: 3, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4">Dashboard</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Tooltip title="Refresh Network Status">
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => handleRefresh('networkStatus')}
                disabled={refreshing.networkStatus}
              >
                {refreshing.networkStatus ? 'Refreshing...' : 'Refresh Status'}
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {/* Network Status Section */}
        <Grid container spacing={3}>
          {/* Network Status Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center">
                    <SignalCellularAltIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      Network Status
                    </Typography>
                  </Box>
                  <Box>
                    <Tooltip title="Refresh Network Status">
                      <IconButton 
                        size="small" 
                        onClick={() => handleRefresh('networkStatus')}
                        disabled={refreshing.networkStatus || refreshing.all}
                      >
                        <RefreshIcon 
                          fontSize="small" 
                          className={refreshing.networkStatus ? 'spin' : ''} 
                          sx={{
                            '@keyframes spin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' },
                            },
                            animation: refreshing.networkStatus ? 'spin 1s linear infinite' : 'none',
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <NetworkStatusGraph 
                  statusData={networkStatusData} 
                  loading={refreshing.networkStatus}
                  error={networkStatusError}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5">Network Overview</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Tooltip title="Refresh all ONTs">
              <Button 
                variant="outlined"
                size="small"
                onClick={() => handleRefresh('pon_ports')}
                disabled={refreshing.ponPorts}
                startIcon={<RefreshIcon />}
                sx={{ minWidth: 140 }}
              >
                {refreshing.ponPorts ? 'Refreshing...' : 'Refresh PON Ports'}
              </Button>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>Online OLTs</Typography>
                <Typography variant="h5" color="success.main">{summaryData?.online_olts_count ?? '...'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>Total ONTs</Typography>
                <Typography variant="h5">
                  <Link to="/all-onts" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                    {summaryData?.total_onts ?? '...'}
                  </Link>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>Online ONTs</Typography>
                <Typography variant="h5" color="success.main">{summaryData?.online_onts_count ?? '...'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>Offline ONTs</Typography>
                <Typography variant="h5" color="error.main">{summaryData?.offline_onts_count ?? '...'}</Typography>
              </CardContent>
            </Card>
          </Grid>
           <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>Offline (Power)</Typography>
                <Typography variant="h5" color="error.main">{summaryData?.offline_power_onts_count ?? '...'}</Typography>
              </CardContent>
            </Card>
          </Grid>
           <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>Offline (LOS)</Typography>
                <Typography variant="h5" color="error.main">{summaryData?.offline_los_onts_count ?? '...'}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Online OLTs Table */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>OLT Status</Typography>
         <TableContainer component={Paper} elevation={1} sx={{ mb: 4 }}>
             <Table size="small">
                 <TableHead>
                     <TableRow>
                         <TableCell>OLT Name</TableCell>
                          <TableCell>Status</TableCell>
                         <TableCell>Uptime</TableCell>
                         <TableCell>Temperature</TableCell>
                     </TableRow>
                 </TableHead>
                 <TableBody>
                     {summaryData?.all_olts_details && summaryData.all_olts_details.length > 0 ? (
                         summaryData.all_olts_details.map((olt) => (
                             <TableRow key={olt.id}>
                                 <TableCell>{olt.name}</TableCell>
                                 <TableCell>{getOltStatusChip(olt.status, olt.status_display)}</TableCell>
                                 <TableCell>{olt.uptime || 'N/A'}</TableCell> {/* Display raw uptime string */}
                                 <TableCell>{formatTemperature(olt.temperature)}</TableCell>
                             </TableRow>
                         ))
                     ) : (
                         <TableRow><TableCell colSpan={4}>No OLTs found.</TableCell></TableRow>
                     )}
                 </TableBody>
             </Table>
         </TableContainer>

        {/* PON Outage Table */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Recent PON Outages</Typography>
          <TableContainer component={Paper} elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>OLT Name</TableCell>
                <TableCell>Slot/Port</TableCell>
                <TableCell>Affected ONUs</TableCell>
                {/* LOS and Power columns might be redundant if covered by Possible Cause, but can be added if needed */}
                <TableCell>Possible Cause</TableCell>
                <TableCell>Time Since Failure</TableCell>
                <TableCell>End Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {outageData.length > 0 ? (
                outageData.map((outage) => (
                  <TableRow key={outage.id}>
                    <TableCell>{outage.olt_name}</TableCell>
                    <TableCell>{outage.slot_port}</TableCell>
                    <TableCell>{outage.affected_ont_count}</TableCell>
                    <TableCell>{outage.possible_cause || 'Unknown'}</TableCell>
                    <TableCell>{formatTimeSince(outage.start_time)}</TableCell>
                    <TableCell>{outage.end_time ? formatTimeSince(outage.end_time) + ' ago' : 'Active'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6}>No recent PON outages found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DashboardPage;