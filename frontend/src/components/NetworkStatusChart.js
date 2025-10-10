import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale, // Import TimeScale for time-series data
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // Date adapter for Chart.js
import { getNetworkStatus } from '../services/api'; // Assuming api.js is in src/services

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale // Register TimeScale
);

const NetworkStatusChart = () => {
  const [chartData, setChartData] = useState({
    datasets: [],
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // The API returns an array of objects from NetworkStatusDataSerializer:
  // e.g., [{ timestamp: "2023-10-27T10:00:00Z", online_onts: 150, offline_onts: 5, ... }, ...]
  // We'll plot 'online_onts' as the 'value' for this example.
  const processDataForChart = (apiData) => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      return { datasets: [] }; // Return empty datasets, not labels and datasets separately
    }

    // Sort data by timestamp just in case it's not sorted (though API should sort by -timestamp)
    // For Chart.js time scale, it's better if data is sorted chronologically.
    const sortedData = [...apiData].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return {
      datasets: [
        {
          label: 'Online ONTs', // Updated label
          data: sortedData.map(item => ({ x: new Date(item.timestamp), y: item.online_onts })), // Use item.online_onts
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
        // You could add more datasets here, e.g., for offline_onts
        // {
        //   label: 'Offline ONTs',
        //   data: sortedData.map(item => ({ x: new Date(item.timestamp), y: item.offline_onts })),
        //   fill: false,
        //   borderColor: 'rgb(255, 99, 132)',
        //   tension: 0.1,
        // },
      ],
    };
  };

  const fetchData = async () => {
    try {
      // setIsLoading(true); // Set loading true at the start of fetch
      const response = await getNetworkStatus(); // This calls /api/network-status/
      // The ViewSet is paginated by default. getNetworkStatus might need to handle pagination
      // or the API endpoint should provide an unpaginated version for the chart, or accept a limit.
      // For now, assuming response.results if paginated, or response directly if not.
      const dataToProcess = response.results || response; 
      setChartData(processDataForChart(dataToProcess));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch network status:', err);
      setError('Failed to load chart data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch

    const intervalId = setInterval(fetchData, 60000); // Poll every 60 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Network Status - Online ONTs Over Time' },
    },
    scales: {
      x: { type: 'time', time: { unit: 'hour', tooltipFormat: 'PPpp' }, title: { display: true, text: 'Time' } },
      y: { beginAtZero: true, title: { display: true, text: 'Number of ONTs' } },
    },
  };

  if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;
  if (isLoading && (!chartData.datasets || chartData.datasets.length === 0)) return <div>Loading chart data...</div>;

  return <Line options={options} data={chartData} />;
};

export default NetworkStatusChart;