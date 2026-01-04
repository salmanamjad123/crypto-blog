'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const CandleStickChart = dynamic(() => import('@/components/common/CandleStickChart'), { ssr: false });

// --- Interfaces and Types ---
interface Coin { id: string; symbol: string; name: string; }
type PredictionDirection = 'Up' | 'Down' | 'Neutral';

// --- Constants ---
const PREDICTION_COINS: Coin[] = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
  { id: 'solana', symbol: 'sol', name: 'Solana' },
  { id: 'binancecoin', symbol: 'bnb', name: 'Binance Coin' },
  { id: 'ripple', symbol: 'xrp', name: 'Ripple' },
  { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin' },
];

// --- Main Page Component ---
export default function PredictionPage() {
  const [selectedCoinId, setSelectedCoinId] = useState<string>(PREDICTION_COINS[0].id);
  const [predictionDirection, setPredictionDirection] = useState<PredictionDirection | null>(null);
  const [riskPrediction, setRiskPrediction] = useState<PredictionDirection | null>(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [rsiValue, setRsiValue] = useState<number | null>(null);

  const selectedCoin = PREDICTION_COINS.find(c => c.id === selectedCoinId);

  // --- Helper Functions ---
  const getRsiPrediction = (rsi: number | null): PredictionDirection | null => {
    if (rsi === null) return null;
    if (rsi > 70) return 'Down';
    if (rsi < 30) return 'Up';
    return 'Neutral';
  };

  // New function for trend-based risk prediction
  const calculateRiskPrediction = (candles: any[]): PredictionDirection => {
      if (candles.length < 24) return 'Neutral'; // Need at least 24 hours of data
      const startPrice = candles[candles.length - 24].y[3]; // Close price 24h ago
      const endPrice = candles[candles.length - 1].y[3];   // Current close price
      if (endPrice > startPrice) return 'Up';
      if (endPrice < startPrice) return 'Down';
      return 'Neutral';
  };

  const formatPakistanTime = (date: Date | null): string => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Karachi', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true, timeZoneName: 'short' }).format(date);
  };

  // --- Data Fetching ---
  const fetchPrediction = async () => {
    if (!selectedCoin) return;
    setLoading(true);
    setPredictionError(null);
    try {
      const res = await fetch(`/api/prediction?coinId=${selectedCoin.id}`);
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch prediction');
      const data = await res.json();
      if (data && data.rsi?.value !== null && Array.isArray(data.candles) && data.candles.length > 0) {
        const lastCandle = data.candles[data.candles.length - 1];
        setChartData(data.candles);
        setPredictionDirection(getRsiPrediction(data.rsi.value));
        setRiskPrediction(calculateRiskPrediction(data.candles)); // <-- Calculate risk prediction
        setLastUpdated(new Date(lastCandle.x));
        setLatestPrice(lastCandle.y[3]);
        setRsiValue(data.rsi.value);
      } else {
        setPredictionError('Not enough data for a prediction.');
        setChartData([]);
      }
    } catch (error: any) {
      console.error('Error fetching prediction:', error);
      setPredictionError(error.message || 'An unexpected error occurred.');
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrediction(); }, [selectedCoinId]);

  // --- UI Components ---
  const PredictionAnalysisCard = () => {
    if (loading || !predictionDirection || latestPrice === null) return null;
    let analysisText = `The RSI value of ${rsiValue?.toFixed(2)} is neutral, suggesting the price is stable.`;
    if (predictionDirection === 'Up') analysisText = `The RSI value of ${rsiValue?.toFixed(2)} suggests the asset is oversold, indicating a potential upward correction.`
    if (predictionDirection === 'Down') analysisText = `The RSI value of ${rsiValue?.toFixed(2)} suggests the asset is overbought, indicating a potential downward correction.`
    return (
      <div className="max-w-4xl mx-auto mt-8 bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">RSI-Based Prediction for {selectedCoin?.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-gray-900 rounded-lg"><p className="text-sm text-gray-400">Last Updated (PKT)</p><p className="text-lg font-semibold text-white">{formatPakistanTime(lastUpdated)}</p></div>
          <div className="p-4 bg-gray-900 rounded-lg"><p className="text-sm text-gray-400">Latest Price (USD)</p><p className="text-lg font-semibold text-white">${latestPrice.toLocaleString()}</p></div>
          <div className="p-4 bg-gray-900 rounded-lg"><p className="text-sm text-gray-400">Immediate Outlook</p><p className={`text-xl font-bold ${predictionDirection === 'Up' ? 'text-green-500' : predictionDirection === 'Down' ? 'text-red-500' : 'text-gray-500'}`}>{predictionDirection}</p></div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700"><p className="text-sm text-gray-400">Analysis</p><p className="italic text-gray-400">{analysisText}</p></div>
      </div>
    );
  };

  const RiskAnalysisCard = () => {
      if (loading || !riskPrediction) return null;
      let analysisText = "The price has been stable over the last 24 hours.";
      if (riskPrediction === 'Up') analysisText = "The price has been on an upward trend over the last 24 hours, suggesting bullish momentum.";
      if (riskPrediction === 'Down') analysisText = "The price has been on a downward trend over the last 24 hours, suggesting bearish momentum.";
      return (
        <div className="max-w-4xl mx-auto mt-8 bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-orange-400 mb-4">24-Hour Risk Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-gray-900 rounded-lg"><p className="text-sm text-gray-400">Tomorrow's Risky Prediction</p><p className={`text-xl font-bold ${riskPrediction === 'Up' ? 'text-green-500' : riskPrediction === 'Down' ? 'text-red-500' : 'text-gray-500'}`}>{riskPrediction}</p></div>
            <div className="p-4 bg-gray-900 rounded-lg"><p className="text-sm text-gray-400">Basis</p><p className="text-lg font-semibold text-white">24-Hour Price Trend</p></div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700"><p className="text-sm text-gray-400">Summary</p><p className="italic text-gray-400">{analysisText}</p></div>
        </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center text-cyan-400">Cryptocurrency Prediction</h1>
      <div className="max-w-lg mx-auto bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center space-x-4">
          <select value={selectedCoinId} onChange={(e) => setSelectedCoinId(e.target.value)} className="bg-gray-700 text-white border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 flex-grow">
            {PREDICTION_COINS.map(coin => <option key={coin.id} value={coin.id}>{coin.name}</option>)}
          </select>
          <button onClick={fetchPrediction} disabled={loading} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-md disabled:bg-gray-600 transition duration-300">{loading ? 'Loading...' : 'Refresh'}</button>
        </div>
      </div>
      {predictionError && <div className="max-w-4xl mx-auto text-center text-red-400 bg-red-900 bg-opacity-50 rounded-lg p-4">{predictionError}</div>}
      <PredictionAnalysisCard />
      <RiskAnalysisCard /> 
      <div className="mt-8 max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-4">
        {loading ? <div className="flex items-center justify-center h-96 text-gray-500"><p>Loading chart...</p></div> : chartData.length > 0 ? <CandleStickChart data={chartData} prediction={predictionDirection} /> : !predictionError && <div className="flex items-center justify-center h-96 text-gray-500"><p>No chart data available.</p></div>}
      </div>
    </div>
  );
}
