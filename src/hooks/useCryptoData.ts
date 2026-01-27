import { useState, useEffect } from 'react';
import { CoinData } from '@/utils/coingecko';
import { useCryptoContext } from '@/contexts/CryptoContext';

export const useCryptoData = () => {
  const { 
    coins: contextCoins, 
    setCoins: setContextCoins, 
    lastUpdated: contextLastUpdated,
    setLastUpdated: setContextLastUpdated,
    isCached: contextIsCached,
    setIsCached: setContextIsCached,
  } = useCryptoContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCoins = async (forceRefresh = false) => {
    try {
      // Check if we have fresh data in context (less than 30 seconds old)
      if (!forceRefresh && contextCoins.length > 0 && contextLastUpdated) {
        const age = Date.now() - contextLastUpdated.getTime();
        if (age < 30000) { // 30 seconds
          console.log('[useCryptoData] Using fresh context data, age:', Math.round(age / 1000), 'seconds');
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      
      // Fetch from our server API (which has caching)
      const response = await fetch('/api/crypto/coins');
      
      if (!response.ok) {
        throw new Error('Failed to fetch coins');
      }

      const result = await response.json();
      
      // Update context (persists across navigation)
      setContextCoins(result.data);
      setContextLastUpdated(new Date(result.cachedAt));
      setContextIsCached(result.cached);
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
    coins: contextCoins,
    loading,
    error,
    lastUpdated: contextLastUpdated,
    isCached: contextIsCached,
    refresh: () => loadCoins(true), // Force refresh
  };
};
