import { useState, useEffect } from 'react';
import { ChartData } from '@/utils/coingecko';

export const useCoinChart = (coinId: string | null, days: number = 7) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coinId) {
      setChartData(null);
      return;
    }

    const loadChart = async () => {
      try {
        setLoading(true);
        
        // Fetch from our server API (which has caching)
        const response = await fetch(`/api/crypto/chart/${coinId}?days=${days}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch chart');
        }

        const result = await response.json();
        setChartData(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch chart');
        console.error('Error fetching chart:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChart();
  }, [coinId, days]);

  return {
    chartData,
    loading,
    error,
  };
};
