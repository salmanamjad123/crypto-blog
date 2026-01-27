// API Usage Monitoring System
// Tracks all external API calls across multiple services
export type ApiStats = {
  totalCalls: number;
  lastReset: number;
  callsByEndpoint: Record<string, number>;
  hoursSinceReset?: number;
};

const stats: ApiStats = {
  totalCalls: 0,
  lastReset: Date.now(),
  callsByEndpoint: {},
};

/**
 * Track API call across all services
 * Monitors daily usage and warns when approaching limits
 * 
 * Tracked Services:
 * - CoinGecko: coins, chart, details (Free: 10,000/month ≈ 330/day)
 * - CryptoPanic: news-sentiment (Free: 500/day)
 * - Binance: funding-rate, market-metrics (Free: Unlimited with rate limits)
 * - Alternative.me: fear-greed (Free: Unlimited)
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
  
  // Separate CryptoPanic tracking (500/day limit)
  const cryptoPanicCalls = Object.keys(stats.callsByEndpoint)
    .filter(key => key.startsWith('news-sentiment'))
    .reduce((sum, key) => sum + stats.callsByEndpoint[key], 0);
  
  if (cryptoPanicCalls >= 400) {
    console.warn(`⚠️ [API Monitor] CryptoPanic: ${cryptoPanicCalls} calls today (limit: 500/day)`);
  }
  
  // General CoinGecko tracking (10,000/month ≈ 330/day)
  const coingeckoCalls = ['coins', 'chart', 'details']
    .reduce((sum, key) => sum + (stats.callsByEndpoint[key] || 0), 0);
  
  if (coingeckoCalls >= 200) {
    console.log(`✅ [API Monitor] CoinGecko: ${coingeckoCalls} calls today (target: ~330/day)`);
  }
  
  if (coingeckoCalls >= 300) {
    console.warn(`⚠️ [API Monitor] CoinGecko: ${coingeckoCalls} calls today - approaching daily target`);
  }
  
  if (coingeckoCalls > 400) {
    console.error(`🚨 [API Monitor] CoinGecko: ${coingeckoCalls} calls today - HIGH USAGE!`);
  }
  
  // Log endpoint breakdown every 50 calls
  if (stats.totalCalls % 50 === 0) {
    console.log(`[API Monitor] Total: ${stats.totalCalls} calls. Breakdown:`, stats.callsByEndpoint);
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
