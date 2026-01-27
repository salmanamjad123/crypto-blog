import { NextResponse } from 'next/server';
import { trackApiCall } from '@/utils/apiMonitor';

// ============================================
// MARKET METRICS API - Binance Liquidations & Long/Short Ratios
// ============================================
// Free Tier: Unlimited (1200 requests/minute rate limit)
// Strategy: 5-minute cache per coin
// Expected Usage: ~50 unique coins/day × 12 calls/hour = ~600 calls/day (negligible)
// ============================================

interface BinanceLongShortRatio {
  symbol: string;
  longShortRatio: string;
  longAccount: string;
  shortAccount: string;
  timestamp: number;
}

interface Binance24hrStats {
  symbol: string;
  volume: string;
  quoteVolume: string;
  openInterest?: string;
}

export interface MarketMetrics {
  longShortRatio: number;
  signal: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  score: number; // 0-100 for prediction weighting
  interpretation: string;
  longAccountPercent: number;
  shortAccountPercent: number;
  volume24h: number;
  sentiment: 'EXTREME_LONG' | 'LONG_BIAS' | 'BALANCED' | 'SHORT_BIAS' | 'EXTREME_SHORT';
  cached: boolean;
  cachedAt: string;
}

// In-memory cache
const metricsCache = new Map<string, { data: MarketMetrics; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Map CoinGecko IDs to Binance futures symbols
const SYMBOL_MAP: Record<string, string> = {
  'bitcoin': 'BTCUSDT',
  'ethereum': 'ETHUSDT',
  'binancecoin': 'BNBUSDT',
  'ripple': 'XRPUSDT',
  'cardano': 'ADAUSDT',
  'solana': 'SOLUSDT',
  'dogecoin': 'DOGEUSDT',
  'polkadot': 'DOTUSDT',
  'polygon': 'MATICUSDT',
  'shiba-inu': 'SHIBUSDT',
  'avalanche-2': 'AVAXUSDT',
  'chainlink': 'LINKUSDT',
  'uniswap': 'UNIUSDT',
  'litecoin': 'LTCUSDT',
  'monero': 'XMRUSDT',
  'stellar': 'XLMUSDT',
  'cosmos': 'ATOMUSDT',
  'algorand': 'ALGOUSDT',
  'vechain': 'VETUSDT',
  'filecoin': 'FILUSDT',
  'tron': 'TRXUSDT',
  'aptos': 'APTUSDT',
  'arbitrum': 'ARBUSDT',
  'optimism': 'OPUSDT',
  'near': 'NEARUSDT',
  'apecoin': 'APEUSDT',
  'sandbox': 'SANDUSDT',
  'decentraland': 'MANAUSDT',
  'axie-infinity': 'AXSUSDT',
  'gala': 'GALAUSDT',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ coinId: string }> }
) {
  try {
    const { coinId } = await params;
    const now = Date.now();

    // Check cache first
    const cached = metricsCache.get(coinId);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(`[Market Metrics] Cache hit for ${coinId}`);
      return NextResponse.json({
        ...cached.data,
        cached: true,
      });
    }

    // Clean old cache entries (keep only last 100 coins)
    if (metricsCache.size > 100) {
      const oldestKey = Array.from(metricsCache.keys())[0];
      metricsCache.delete(oldestKey);
    }

    // Get Binance symbol
    const symbol = SYMBOL_MAP[coinId];
    
    if (!symbol) {
      console.log(`[Market Metrics] No futures contract for ${coinId}`);
      // Return neutral for coins without futures contracts
      const neutralData: MarketMetrics = {
        longShortRatio: 1.0,
        signal: 'NEUTRAL',
        score: 50,
        interpretation: 'No futures contract available',
        longAccountPercent: 50,
        shortAccountPercent: 50,
        volume24h: 0,
        sentiment: 'BALANCED',
        cached: false,
        cachedAt: new Date().toISOString(),
      };
      return NextResponse.json(neutralData);
    }

    console.log(`[Market Metrics] Fetching data for ${coinId} (${symbol})...`);
    trackApiCall(`market-metrics/${coinId}`);

    // Fetch Long/Short ratio (5-minute period for more responsive data)
    const ratioUrl = `https://fapi.binance.com/futures/data/topLongShortPositionRatio?symbol=${symbol}&period=5m&limit=1`;
    
    const ratioResponse = await fetch(ratioUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 },
    });

    if (!ratioResponse.ok) {
      throw new Error(`Binance Long/Short API error: ${ratioResponse.status}`);
    }

    const ratioData: BinanceLongShortRatio[] = await ratioResponse.json();

    if (!ratioData || ratioData.length === 0) {
      throw new Error('No long/short ratio data returned');
    }

    // Fetch 24h volume
    const statsUrl = `https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${symbol}`;
    
    const statsResponse = await fetch(statsUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 },
    });

    let volume24h = 0;
    if (statsResponse.ok) {
      const statsData: Binance24hrStats = await statsResponse.json();
      volume24h = parseFloat(statsData.quoteVolume || '0');
    }

    // Parse the data
    const latest = ratioData[0];
    const longShortRatio = parseFloat(latest.longShortRatio);
    const longPercent = parseFloat(latest.longAccount);
    const shortPercent = parseFloat(latest.shortAccount);

    // Interpret long/short ratio
    // Ratio > 2.0 = Too many longs = Potential cascade down (Bearish)
    // Ratio < 0.5 = Too many shorts = Potential short squeeze (Bullish)
    let signal: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
    let score: number;
    let interpretation: string;
    let sentiment: 'EXTREME_LONG' | 'LONG_BIAS' | 'BALANCED' | 'SHORT_BIAS' | 'EXTREME_SHORT';

    if (longShortRatio > 3.0) {
      signal = 'BEARISH';
      score = 20;
      sentiment = 'EXTREME_LONG';
      interpretation = 'Extremely high long/short ratio (>3.0) indicates overcrowded longs, high liquidation risk on downside';
    } else if (longShortRatio > 2.0) {
      signal = 'BEARISH';
      score = 30;
      sentiment = 'EXTREME_LONG';
      interpretation = 'Very high long/short ratio (>2.0) suggests market is overextended to the long side';
    } else if (longShortRatio > 1.5) {
      signal = 'BEARISH';
      score = 40;
      sentiment = 'LONG_BIAS';
      interpretation = 'High long bias may lead to downward pressure if longs get liquidated';
    } else if (longShortRatio > 1.2) {
      signal = 'NEUTRAL';
      score = 45;
      sentiment = 'LONG_BIAS';
      interpretation = 'Moderate long bias, generally healthy for uptrends';
    } else if (longShortRatio >= 0.8) {
      signal = 'NEUTRAL';
      score = 50;
      sentiment = 'BALANCED';
      interpretation = 'Balanced long/short ratio indicates healthy market equilibrium';
    } else if (longShortRatio >= 0.7) {
      signal = 'NEUTRAL';
      score = 55;
      sentiment = 'SHORT_BIAS';
      interpretation = 'Moderate short bias, generally healthy for downtrends';
    } else if (longShortRatio >= 0.5) {
      signal = 'BULLISH';
      score = 60;
      sentiment = 'SHORT_BIAS';
      interpretation = 'High short bias creates potential for short squeeze upward';
    } else if (longShortRatio >= 0.33) {
      signal = 'BULLISH';
      score = 70;
      sentiment = 'EXTREME_SHORT';
      interpretation = 'Very high short/long ratio (<0.5) suggests overcrowded shorts, potential for sharp rally';
    } else {
      signal = 'BULLISH';
      score = 80;
      sentiment = 'EXTREME_SHORT';
      interpretation = 'Extremely low long/short ratio (<0.33) indicates extreme short positioning, high short squeeze potential';
    }

    const metricsData: MarketMetrics = {
      longShortRatio: parseFloat(longShortRatio.toFixed(3)),
      signal,
      score: Math.round(score),
      interpretation,
      longAccountPercent: parseFloat(longPercent.toFixed(2)),
      shortAccountPercent: parseFloat(shortPercent.toFixed(2)),
      volume24h: Math.round(volume24h),
      sentiment,
      cached: false,
      cachedAt: new Date().toISOString(),
    };

    // Cache the result
    metricsCache.set(coinId, { data: metricsData, timestamp: now });

    return NextResponse.json(metricsData);

  } catch (error) {
    console.error('[Market Metrics] Error:', error);
    
    // Return neutral on error
    return NextResponse.json({
      longShortRatio: 1.0,
      signal: 'NEUTRAL',
      score: 50,
      interpretation: 'Unable to fetch market metrics',
      longAccountPercent: 50,
      shortAccountPercent: 50,
      volume24h: 0,
      sentiment: 'BALANCED',
      cached: false,
      cachedAt: new Date().toISOString(),
      error: 'Failed to fetch market metrics',
    }, { status: 500 });
  }
}
