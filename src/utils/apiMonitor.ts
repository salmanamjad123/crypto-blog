// API Usage Monitoring System
type ApiStats = {
  totalCalls: number;
  lastReset: number;
  callsByEndpoint: Record<string, number>;
};

const stats: ApiStats = {
  totalCalls: 0,
  lastReset: Date.now(),
  callsByEndpoint: {},
};

/**
 * Track API call to CoinGecko
 * Monitors daily usage and warns when approaching limits
 */
export function trackApiCall(endpoint: string): ApiStats {
  const now = Date.now();
  
  // Reset stats every 24 hours
  if (now - stats.lastReset > 24 * 60 * 60 * 1000) {
    console.log(`[API Monitor] Daily reset. Previous stats:`, stats);
    stats.totalCalls = 0;
    stats.callsByEndpoint = {};
    stats.lastReset = now;
  }
  
  // Increment counters
  stats.totalCalls++;
  stats.callsByEndpoint[endpoint] = (stats.callsByEndpoint[endpoint] || 0) + 1;
  
  // Warning thresholds (CoinGecko free tier: 10,000/month ≈ 330/day)
  if (stats.totalCalls === 200) {
    console.warn(`⚠️ [API Monitor] 200 calls today - tracking well`);
  }
  
  if (stats.totalCalls === 300) {
    console.warn(`⚠️ [API Monitor] 300 calls today - approaching daily target`);
  }
  
  if (stats.totalCalls > 400) {
    console.error(`🚨 [API Monitor] ${stats.totalCalls} calls today - HIGH USAGE!`);
  }
  
  if (stats.totalCalls > 500) {
    console.error(`🚨🚨 [API Monitor] ${stats.totalCalls} calls today - CRITICAL! May exceed monthly limit!`);
  }
  
  return { ...stats };
}

/**
 * Get current API usage statistics
 */
export function getApiStats(): ApiStats {
  return { 
    ...stats,
    hoursSinceReset: Math.round((Date.now() - stats.lastReset) / (60 * 60 * 1000)),
  };
}

/**
 * Reset stats (for testing or manual reset)
 */
export function resetApiStats(): void {
  stats.totalCalls = 0;
  stats.callsByEndpoint = {};
  stats.lastReset = Date.now();
  console.log('[API Monitor] Stats manually reset');
}
