import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import type { AnalysisData } from '../api/analyze';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

interface DataChartsProps {
  analysisData: AnalysisData;
  activeTab: 'analytics' | 'ndvi';
}

const DataCharts: React.FC<DataChartsProps> = ({ analysisData, activeTab }) => {
  // Chart options for consistent styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 10,
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 10,
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  // Analytics Chart - Land Use Distribution
  const getLandUseChartData = () => {
    const data = analysisData.ndviVegetationAnalysis?.landUseDistribution || [
      { type: 'Vegetation Gain', value: 25 },
      { type: 'Urban Expansion', value: 18 },
      { type: 'Water Loss', value: 12 },
      { type: 'Other Changes', value: 8 },
    ];

    return {
      labels: data.map((item: { type: string; value: number }) => item.type.split(' ')[0]), // First word only for compact display
      datasets: [
        {
          data: data.map((item: { type: string; value: number }) => item.value),
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',   // Green for vegetation
            'rgba(249, 115, 22, 0.8)',  // Orange for urban
            'rgba(59, 130, 246, 0.8)',  // Blue for water
            'rgba(168, 85, 247, 0.8)',  // Purple for other
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(249, 115, 22, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(168, 85, 247, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // NDVI Chart - Comparison Data
  const getNDVIChartData = () => {
    const ndviData = analysisData.ndviVegetationAnalysis?.ndviComparison;
    
    if (ndviData) {
      return {
        labels: ['Mean (Before)', 'Mean (After)', 'Max (After)', 'Min (After)'],
        datasets: [
          {
            label: 'NDVI Values',
            data: [
              ndviData.before.mean * 100,
              ndviData.after.mean * 100,
              ndviData.after.max * 100,
              Math.abs(ndviData.after.min) * 100,
            ],
            backgroundColor: [
              'rgba(107, 114, 128, 0.8)',  // Gray for before
              'rgba(34, 197, 94, 0.8)',    // Green for after mean
              'rgba(34, 197, 94, 0.6)',    // Lighter green for max
              'rgba(34, 197, 94, 0.4)',    // Lightest green for min
            ],
            borderColor: [
              'rgba(107, 114, 128, 1)',
              'rgba(34, 197, 94, 1)',
              'rgba(34, 197, 94, 1)',
              'rgba(34, 197, 94, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };
    }

    // Fallback data
    return {
      labels: ['High', 'Medium', 'Low', 'Very Low'],
      datasets: [
        {
          label: 'NDVI Values',
          data: [80, 65, 40, 25],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(34, 197, 94, 0.6)',
            'rgba(34, 197, 94, 0.4)',
            'rgba(251, 191, 36, 0.8)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(251, 191, 36, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // NDVI Trend Chart - Time series
  const getNDVITrendData = () => {
    // Generate sample trend data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trendValues = [0.4, 0.45, 0.52, 0.48, 0.55, 0.58];
    
    return {
      labels: months,
      datasets: [
        {
          label: 'NDVI Trend',
          data: trendValues.map(val => val * 100),
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  if (activeTab === 'analytics') {
    return (
      <div className="space-y-4 pb-4">
        {/* Land Use Distribution Chart */}
        <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
          <h4 className="text-xs font-medium text-white mb-3">Land Use Change Distribution</h4>
          <div className="h-48">
            <Bar data={getLandUseChartData()} options={chartOptions} />
          </div>
        </div>

        {/* Change Intensity Chart */}
        <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
          <h4 className="text-xs font-medium text-white mb-3">Change Intensity Analysis</h4>
          <div className="h-32">
            <Bar 
              data={{
                labels: ['Low', 'Medium', 'High'],
                datasets: [{
                  data: [35, 45, 20],
                  backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                  ],
                  borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(251, 191, 36, 1)',
                    'rgba(239, 68, 68, 1)',
                  ],
                  borderWidth: 1,
                }],
              }} 
              options={chartOptions} 
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'ndvi') {
    return (
      <div className="space-y-4 pb-4">
        {/* NDVI Values Comparison Chart */}
        <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
          <h4 className="text-xs font-medium text-white mb-3">NDVI Values Comparison</h4>
          <div className="h-48">
            <Bar data={getNDVIChartData()} options={chartOptions} />
          </div>
        </div>

        {/* NDVI Trend Chart */}
        <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
          <h4 className="text-xs font-medium text-white mb-3">NDVI Trend Over Time</h4>
          <div className="h-32">
            <Line data={getNDVITrendData()} options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  min: 0,
                  max: 100,
                },
              },
            }} />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default DataCharts;
