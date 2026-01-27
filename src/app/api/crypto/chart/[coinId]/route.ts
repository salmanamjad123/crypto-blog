import { NextResponse } from 'next/server';
import { fetchCoinChart, ChartData } from '@/utils/coingecko';
import { trackApiCall } from '@/utils/apiMonitor';

// Server-side cache for chart data
const chartCache = new Map<string, { data: ChartData; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour for charts

export async function GET(
  request: Request,
  { params }: { params: Promise<{ coinId: string }> }
) {
  try {
    const { coinId } = await params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const cacheKey = `${coinId}_${days}`;
    const now = Date.now();
    const cached = chartCache.get(cacheKey);

    // Return cached data if still fresh
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        data: cached.data,
        cached: true,
        expiresIn: Math.round((CACHE_DURATION - (now - cached.timestamp)) / 1000),
      });
    }

    // Fetch fresh data from CoinGecko
    console.log(`[API] Fetching chart for ${coinId} (${days} days)...`);
    trackApiCall(`chart/${coinId}`); // Track API usage
    const data = await fetchCoinChart(coinId, days);

    // Update cache
    chartCache.set(cacheKey, { data, timestamp: now });

    // Clean old cache entries (keep only last 100)
    if (chartCache.size > 100) {
      const oldestKey = Array.from(chartCache.keys())[0];
      chartCache.delete(oldestKey);
    }

    return NextResponse.json({
      data,
      cached: false,
      expiresIn: CACHE_DURATION / 1000,
    });
  } catch (error) {
    console.error('[API] Error fetching chart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}
