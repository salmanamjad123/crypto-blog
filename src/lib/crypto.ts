import { CoinRate } from './types';
import { cryptoCache } from './cache';

const coinIdMap: { [key: string]: string } = {
    'bitcoin': 'BTC',
    'ethereum': 'ETH',
    'solana': 'SOL',
    'binancecoin': 'BNB',
    'ripple': 'XRP',
    'dogecoin': 'DOGE'
};
const coinIds = Object.keys(coinIdMap).join(',');
const CACHE_DURATION = 60 * 1000; // 60 seconds

/**
 * Fetches cryptocurrency rates, using a server-side cache to avoid rate limits.
 * Fetches new data from CoinGecko only if the cache is older than 60 seconds.
 */
export async function getCryptoRates(): Promise<CoinRate[]> {
  const now = Date.now();

  // 1. Check if we have fresh data in the cache
  if (cryptoCache.data && (now - cryptoCache.timestamp < CACHE_DURATION)) {
    return cryptoCache.data;
  }

  // 2. If cache is stale, fetch new data
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error fetching from CoinGecko: ${response.status} ${response.statusText}`, { errorBody });
      // Return stale data if available, otherwise an empty array
      return cryptoCache.data || []; 
    }

    const data = await response.json();

    if (Object.keys(data).length === 0) {
        console.error('CoinGecko API returned empty data.');
        // Return stale data if available, otherwise an empty array
        return cryptoCache.data || [];
    }

    const formattedData: CoinRate[] = Object.keys(data).map(coinId => ({
        id: coinId,
        symbol: coinIdMap[coinId],
        price: data[coinId].usd,
        change: data[coinId].usd_24h_change,
    }));

    // 3. Update the cache with the new data
    cryptoCache.data = formattedData;
    cryptoCache.timestamp = now;
      
    return formattedData;

  } catch (error) {
    console.error('A network or runtime error occurred while fetching crypto rates.', error);
    // Return stale data on error, otherwise an empty array
    return cryptoCache.data || [];
  }
}
