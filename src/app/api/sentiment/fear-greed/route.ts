import { NextResponse } from 'next/server';

/**
 * Fear & Greed Index API Route
 * 
 * Fetches crypto market sentiment from Alternative.me
 * - 0-24: Extreme Fear (buy opportunity)
 * - 25-44: Fear
 * - 45-55: Neutral
 * - 56-75: Greed
 * - 76-100: Extreme Greed (sell signal)
 */

interface FearGreedData {
  value: string;
  value_classification: string;
  timestamp: string;
  time_until_update?: string;
}

interface FearGreedResponse {
  name: string;
  data: FearGreedData[];
  metadata: {
    error: null | string;
  };
}

// Server-side cache
let cachedData: {
  value: number;
  classification: string;
  timestamp: number;
} | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour (Fear & Greed updates once per day)

export async function GET() {
  try {
    const now = Date.now();
    
    // Return cached data if still valid
    if (cachedData && now - cacheTimestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
        cacheAge: Math.round((now - cacheTimestamp) / 1000),
      });
    }
    
    // Fetch fresh data from Alternative.me API
    const response = await fetch('https://api.alternative.me/fng/?limit=1', {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const result: FearGreedResponse = await response.json();
    
    if (!result.data || result.data.length === 0) {
      throw new Error('No data received from API');
    }
    
    const fearGreedData = result.data[0];
    
    // Cache the data
    cachedData = {
      value: parseInt(fearGreedData.value),
      classification: fearGreedData.value_classification,
      timestamp: parseInt(fearGreedData.timestamp) * 1000,
    };
    cacheTimestamp = now;
    
    return NextResponse.json({
      success: true,
      data: cachedData,
      cached: false,
    });
  } catch (error) {
    console.error('[Fear & Greed API Error]:', error);
    
    // If we have cached data, return it even if expired
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
        warning: 'Using stale cache due to API error',
      });
    }
    
    // Otherwise return error with default neutral value
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Fear & Greed Index',
        data: {
          value: 50,
          classification: 'Neutral',
          timestamp: Date.now(),
        },
      },
      { status: 500 }
    );
  }
}
