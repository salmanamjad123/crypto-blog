// Smart caching system for crypto data
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CHART_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export const cryptoCache = {
  // Get cached data
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const { data, timestamp }: CacheItem<T> = JSON.parse(cached);
      
      // Check if cache is expired
      const duration = key.startsWith('chart_') ? CHART_CACHE_DURATION : CACHE_DURATION;
      if (Date.now() - timestamp > duration) {
        localStorage.removeItem(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Set cached data
  set<T>(key: string, data: T): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Cache set error:', error);
      // If quota exceeded, clear old cache
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearOldCache();
        // Try again
        try {
          const cacheItem: CacheItem<T> = {
            data,
            timestamp: Date.now(),
          };
          localStorage.setItem(key, JSON.stringify(cacheItem));
        } catch (retryError) {
          console.error('Cache retry failed:', retryError);
        }
      }
    }
  },

  // Remove specific cache
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },

  // Clear expired cache
  clearOldCache(): void {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('crypto_') || key.startsWith('chart_')) {
        const cached = this.get(key);
        if (!cached) {
          localStorage.removeItem(key);
        }
      }
    });
  },

  // Clear all crypto cache
  clearAll(): void {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('crypto_') || key.startsWith('chart_')) {
        localStorage.removeItem(key);
      }
    });
  },
};
