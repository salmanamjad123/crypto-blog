
import axios from "axios";
import { NextResponse } from "next/server";

// --- Simple In-Memory Cache ---
interface CacheEntry {
  timestamp: number;
  data: any;
}
const cache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// --- Coin ID to CoinGecko ID Mapping ---
const coinIdToCoinGeckoId: { [key: string]: string } = {
  bitcoin: "bitcoin",
  ethereum: "ethereum",
  solana: "solana",
  binancecoin: "binancecoin",
  ripple: "ripple",
  dogecoin: "dogecoin",
};

// --- RSI Calculation (no changes) ---
const calculateRSI = (prices: number[], period = 14) => {
    if (prices.length < period) return null;
    let gains = 0, losses = 0;
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change; else losses -= change;
    }
    let avgGain = gains / period, avgLoss = losses / period;
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) - change) / period;
      }
    }
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

// --- API Handler using CoinGecko API (DAILY data) ---
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const coinId = searchParams.get("coinId");

  if (!coinId) return NextResponse.json({ error: "Coin ID is required" }, { status: 400 });

  const coingeckoId = coinIdToCoinGeckoId[coinId];
  if (!coingeckoId) return NextResponse.json({ error: `Invalid coin ID: ${coinId}` }, { status: 400 });

  // 1. Check cache
  const cachedEntry = cache.get(coinId);
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION_MS) {
    console.log(`[Cache HIT] for ${coinId}`);
    return NextResponse.json(cachedEntry.data);
  }

  console.log(`[Cache MISS] for ${coinId}. Fetching from CoinGecko API.`);

  try {
    // 2. Fetch DAILY data from CoinGecko
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coingeckoId}/ohlc`, {
      params: {
        vs_currency: "usd",
        days: "90", // Fetch last 90 days for RSI calculation
      },
    });

    const ohlc = response.data;
    if (!Array.isArray(ohlc) || ohlc.length === 0) throw new Error("No data from CoinGecko");

    // 3. Process data
    const closingPrices = ohlc.map((k: any) => k[4]); // Closing price is the 5th element
    const rsi = calculateRSI(closingPrices);

    // Format candlestick data for the chart (show last 30 days)
    const candleData = ohlc.slice(-30).map((k: any) => ({
      x: new Date(k[0]),
      y: [k[1], k[2], k[3], k[4]],
    }));

    const responseData = { rsi: { value: rsi }, candles: candleData };

    // 4. Store in cache
    cache.set(coinId, { timestamp: Date.now(), data: responseData });

    return NextResponse.json(responseData);

  } catch (e: any) {
    console.error(`Error fetching from CoinGecko: ${e.message}`, { errorBody: e.response?.data });
    const errorMsg = e.response?.data?.error || "An internal server error occurred.";
    const errorStatus = e.response?.status || 500;
    return NextResponse.json({ error: `Error from CoinGecko: ${errorMsg}` }, { status: errorStatus });
  }
}
