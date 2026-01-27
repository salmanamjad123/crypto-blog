import { NextResponse } from 'next/server';
import { fetchCoinDetails, CoinDetails } from '@/utils/coingecko';
import { trackApiCall } from '@/utils/apiMonitor';

// Server-side cache for coin details
const detailsCache = new Map<string, { data: CoinDetails; timestamp: number }>();
const CACHE_DURATION = 6 * 60 * 1000; // 6 minutes (synchronized with coins endpoint)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ coinId: string }> }
) {
  try {
    const { coinId } = await params;
    const now = Date.now();
    const cached = detailsCache.get(coinId);

    // Return cached data if still fresh
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        data: cached.data,
        cached: true,
        expiresIn: Math.round((CACHE_DURATION - (now - cached.timestamp)) / 1000),
      });
    }

    // Fetch fresh data from CoinGecko
    console.log(`[API] Fetching details for ${coinId}...`);
    trackApiCall(`details/${coinId}`); // Track API usage
    const data = await fetchCoinDetails(coinId);

    // Update cache
    detailsCache.set(coinId, { data, timestamp: now });

    // Clean old cache entries (keep only last 100)
    if (detailsCache.size > 100) {
      const oldestKey = Array.from(detailsCache.keys())[0];
      detailsCache.delete(oldestKey);
    }

    return NextResponse.json({
      data,
      cached: false,
      expiresIn: CACHE_DURATION / 1000,
    });
  } catch (error) {
    console.error('[API] Error fetching coin details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coin details' },
      { status: 500 }
    );
  }
}
