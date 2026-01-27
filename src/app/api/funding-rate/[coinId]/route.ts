import { NextResponse } from 'next/server';
import { trackApiCall } from '@/utils/apiMonitor';

// ============================================
// FUNDING RATE API - Binance Futures Integration
// ============================================
// Free Tier: Unlimited (1200 requests/minute rate limit)
// Strategy: 5-minute cache per coin
// Expected Usage: ~50 unique coins/day × 12 calls/hour = ~600 calls/day (negligible)
// ============================================

interface BinanceFundingRate {
  symbol: string;
  fundingRate: string;
  fundingTime: number;
}

export interface FundingRateData {
  rate: number; // Funding rate as percentage
  signal: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  score: number; // 0-100 for prediction weighting
  interpretation: string;
  rawRate: number; // Original rate value
  annualizedRate: number; // Yearly equivalent
  nextFundingTime: number;
  cached: boolean;
  cachedAt: string;
}

// In-memory cache: { coinId: { data, timestamp } }
const fundingCache = new Map<string, { data: FundingRateData; timestamp: number }>();
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
    const cached = fundingCache.get(coinId);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(`[Funding Rate] Cache hit for ${coinId}`);
      return NextResponse.json({
        ...cached.data,
        cached: true,
      });
    }

    // Clean old cache entries (keep only last 100 coins)
    if (fundingCache.size > 100) {
      const oldestKey = Array.from(fundingCache.keys())[0];
      fundingCache.delete(oldestKey);
    }

    // Get Binance symbol
    const symbol = SYMBOL_MAP[coinId];
    
    if (!symbol) {
      console.log(`[Funding Rate] No futures contract for ${coinId}`);
      // Return neutral for coins without futures contracts
      const neutralData: FundingRateData = {
        rate: 0,
        signal: 'NEUTRAL',
        score: 50,
        interpretation: 'No futures contract available',
        rawRate: 0,
        annualizedRate: 0,
        nextFundingTime: 0,
        cached: false,
        cachedAt: new Date().toISOString(),
      };
      return NextResponse.json(neutralData);
    }

    console.log(`[Funding Rate] Fetching data for ${coinId} (${symbol})...`);
    trackApiCall(`funding-rate/${coinId}`);

    // Fetch from Binance Futures API (no key required for public data)
    const url = `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data: BinanceFundingRate[] = await response.json();

    if (!data || data.length === 0) {
      throw new Error('No funding rate data returned');
    }

    const latestRate = data[0];
    const rawRate = parseFloat(latestRate.fundingRate);
    const ratePercent = rawRate * 100; // Convert to percentage
    
    // Funding rate occurs every 8 hours, so annualized = rate × 3 × 365
    const annualizedRate = rawRate * 3 * 365 * 100;

    // Interpret funding rate
    // Positive funding = longs pay shorts = market is bullish (potential reversal down)
    // Negative funding = shorts pay longs = market is bearish (potential reversal up)
    let signal: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
    let score: number;
    let interpretation: string;

    if (ratePercent > 0.10) {
      // Very high positive funding (>0.10%) = Too bullish = Bearish signal
      signal = 'BEARISH';
      score = Math.max(20, 50 - (ratePercent * 200)); // Higher rate = lower score
      interpretation = 'Extremely high funding rate suggests overleveraged longs, potential for downward correction';
    } else if (ratePercent > 0.05) {
      // High positive funding = Moderately overbought
      signal = 'BEARISH';
      score = 35;
      interpretation = 'High funding rate indicates bullish sentiment may be overextended';
    } else if (ratePercent > 0.01) {
      // Moderate positive funding = Healthy bullish
      signal = 'NEUTRAL';
      score = 45;
      interpretation = 'Moderate positive funding shows healthy bullish sentiment';
    } else if (ratePercent > -0.01) {
      // Near zero = Balanced
      signal = 'NEUTRAL';
      score = 50;
      interpretation = 'Balanced funding rate indicates neutral market sentiment';
    } else if (ratePercent > -0.05) {
      // Moderate negative funding = Healthy bearish
      signal = 'NEUTRAL';
      score = 55;
      interpretation = 'Moderate negative funding shows healthy bearish sentiment';
    } else if (ratePercent > -0.10) {
      // High negative funding = Oversold
      signal = 'BULLISH';
      score = 65;
      interpretation = 'High negative funding rate indicates potential for upward correction';
    } else {
      // Very high negative funding (<-0.10%) = Too bearish = Bullish signal
      signal = 'BULLISH';
      score = Math.min(80, 50 + (Math.abs(ratePercent) * 200)); // Higher negative = higher score
      interpretation = 'Extremely negative funding rate suggests overleveraged shorts, potential for short squeeze';
    }

    const fundingData: FundingRateData = {
      rate: parseFloat(ratePercent.toFixed(4)),
      signal,
      score: Math.round(score),
      interpretation,
      rawRate,
      annualizedRate: parseFloat(annualizedRate.toFixed(2)),
      nextFundingTime: latestRate.fundingTime + (8 * 60 * 60 * 1000), // +8 hours
      cached: false,
      cachedAt: new Date().toISOString(),
    };

    // Cache the result
    fundingCache.set(coinId, { data: fundingData, timestamp: now });

    return NextResponse.json(fundingData);

  } catch (error) {
    console.error('[Funding Rate] Error:', error);
    
    // Return neutral on error
    return NextResponse.json({
      rate: 0,
      signal: 'NEUTRAL',
      score: 50,
      interpretation: 'Unable to fetch funding rate data',
      rawRate: 0,
      annualizedRate: 0,
      nextFundingTime: 0,
      cached: false,
      cachedAt: new Date().toISOString(),
      error: 'Failed to fetch funding rate',
    }, { status: 500 });
  }
}
