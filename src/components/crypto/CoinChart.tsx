'use client';

import React from 'react';
import { useCoinChart } from '@/hooks/useCoinChart';
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
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CoinChartProps {
  coinId: string;
  coinName: string;
  days?: number;
}

export const CoinChart: React.FC<CoinChartProps> = ({ coinId, coinName, days = 7 }) => {
  const { chartData, loading, error } = useCoinChart(coinId, days);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded">
        Error loading chart: {error}
      </div>
    );
  }

  if (!chartData || !chartData.prices.length) {
    return (
      <div className="bg-gray-100 p-4 rounded text-gray-600">
        No chart data available
      </div>
    );
  }

  // Prepare data for Chart.js
  const labels = chartData.prices.map(([timestamp]) =>
    new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  );

  const prices = chartData.prices.map(([, price]) => price);
  
  // Determine if price is going up or down
  const isPositive = prices[prices.length - 1] >= prices[0];

  const data = {
    labels,
    datasets: [
      {
        label: `${coinName} Price (USD)`,
        data: prices,
        borderColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        backgroundColor: isPositive
          ? 'rgba(34, 197, 94, 0.1)'
          : 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            return `$${context.parsed.y.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 7,
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value: any) => {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg">
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
      <div className="mt-4 text-sm text-gray-600">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};
