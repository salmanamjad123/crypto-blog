import { useState, useEffect } from 'react';
import { CoinData } from '@/utils/coingecko';

export const useCryptoData = () => {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);

  const loadCoins = async () => {
    try {
      setLoading(true);
      
      // Fetch from our server API (which has caching)
      const response = await fetch('/api/crypto/coins');
      
      if (!response.ok) {
        throw new Error('Failed to fetch coins');
      }

      const result = await response.json();
      
      setCoins(result.data);
      setLastUpdated(new Date(result.cachedAt));
      setIsCached(result.cached);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch coins');
      console.error('Error fetching coins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoins();

    // Auto-refresh every 7 minutes
    // Server cache is 6 min, so this ensures fresh data
    const interval = setInterval(loadCoins, 7 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    coins,
    loading,
    error,
    lastUpdated,
    isCached,
    refresh: loadCoins,
  };
};
