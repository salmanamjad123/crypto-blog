import { NextResponse } from 'next/server';
import { fetchCoins, CoinData } from '@/utils/coingecko';

// Server-side cache
let cachedCoins: CoinData[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 6 * 60 * 1000; // 6 minutes (synchronized with details endpoint)

export async function GET() {
  try {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (cachedCoins && now - cacheTimestamp < CACHE_DURATION) {
      return NextResponse.json({
        data: cachedCoins,
        cached: true,
        cachedAt: new Date(cacheTimestamp).toISOString(),
        expiresIn: Math.round((CACHE_DURATION - (now - cacheTimestamp)) / 1000),
      });
    }

    // Fetch fresh data from CoinGecko
    console.log('[API] Fetching fresh coin data from CoinGecko...');
    const data = await fetchCoins(1, 250, 'usd');
    
    // Update cache
    cachedCoins = data;
    cacheTimestamp = now;

    return NextResponse.json({
      data,
      cached: false,
      cachedAt: new Date(cacheTimestamp).toISOString(),
      expiresIn: CACHE_DURATION / 1000,
    });
  } catch (error) {
    console.error('[API] Error fetching coins:', error);
    
    // If we have cached data, return it even if expired
    if (cachedCoins) {
      return NextResponse.json({
        data: cachedCoins,
        cached: true,
        stale: true,
        error: 'Failed to fetch fresh data, serving stale cache',
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch cryptocurrency data' },
      { status: 500 }
    );
  }
}
