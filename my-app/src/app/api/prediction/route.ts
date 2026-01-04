import axios from "axios";
import { NextResponse } from "next/server";

// --- Simple In-Memory Cache ---
interface CacheEntry {
  timestamp: number;
  data: any;
}
const cache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// --- Coin ID to Binance Symbol Mapping ---
const coinIdToBinanceSymbol: { [key: string]: string } = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  solana: "SOLUSDT",
  binancecoin: "BNBUSDT",
  ripple: "XRPUSDT",
  dogecoin: "DOGEUSDT",
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

// --- API Handler using Binance (HOURLY data) ---
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const coinId = searchParams.get("coinId");

  if (!coinId) return NextResponse.json({ error: "Coin ID is required" }, { status: 400 });

  const binanceSymbol = coinIdToBinanceSymbol[coinId];
  if (!binanceSymbol) return NextResponse.json({ error: `Invalid coin ID: ${coinId}` }, { status: 400 });

  // 1. Check cache
  const cachedEntry = cache.get(coinId);
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION_MS) {
    console.log(`[Cache HIT] for ${coinId}`);
    return NextResponse.json(cachedEntry.data);
  }

  console.log(`[Cache MISS] for ${coinId}. Fetching from Binance API.`);

  try {
    // 2. Fetch HOURLY data from Binance for more accurate, real-time RSI
    const response = await axios.get("https://api.binance.com/api/v3/klines", {
      params: {
        symbol: binanceSymbol,
        interval: "1h", // <-- Fetch hourly data
        limit: 720,    // <-- Fetch last 30 days (30*24=720 hours)
      },
    });

    const klines = response.data;
    if (!Array.isArray(klines) || klines.length === 0) throw new Error("No data from Binance");

    // 3. Process data
    const closingPrices = klines.map((k: any) => parseFloat(k[4]));
    const rsi = calculateRSI(closingPrices);

    // Format candlestick data for the chart (show last 7 days of hourly data)
    const candleData = klines.slice(-168).map((k: any) => ({ // <-- 7 days * 24 hours
      x: new Date(k[0]),
      y: [parseFloat(k[1]), parseFloat(k[2]), parseFloat(k[3]), parseFloat(k[4])],
    }));

    const responseData = { rsi: { value: rsi }, candles: candleData };

    // 4. Store in cache
    cache.set(coinId, { timestamp: Date.now(), data: responseData });

    return NextResponse.json(responseData);

  } catch (e: any) {
    console.error(`Error fetching from Binance: ${e.message}`, { errorBody: e.response?.data });
    const errorMsg = e.response?.data?.msg || "An internal server error occurred.";
    const errorStatus = e.response?.status || 500;
    return NextResponse.json({ error: `Error from Binance: ${errorMsg}` }, { status: errorStatus });
  }
}
