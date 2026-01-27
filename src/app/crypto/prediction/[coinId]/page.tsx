'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CoinDetails } from '@/utils/coingecko';
import { CoinChart } from '@/components/crypto/CoinChart';
import { performTechnicalAnalysis, predictPrice, type TechnicalAnalysis } from '@/utils/technicalIndicators';
import { analyzeMarketSentiment, applySentimentToScore, type SentimentData } from '@/utils/sentimentAnalysis';

interface EnhancedPrediction {
  predictedPrice: number;
  predictedChange: number;
  confidence: number;
  signals: string[];
  technicalAnalysis: TechnicalAnalysis;
  sentimentData: SentimentData | null;
  sentimentImpact?: number;
  reasoning?: string;
}

export default function PredictionPage() {
  const params = useParams();
  const router = useRouter();
  const coinId = params.coinId as string;

  const [coinDetails, setCoinDetails] = useState<CoinDetails | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartDays, setChartDays] = useState(7);
  const [predictionDays, setPredictionDays] = useState(7);
  const [prediction, setPrediction] = useState<EnhancedPrediction | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch coin details and chart data in parallel
        const [detailsResponse, chartResponse] = await Promise.all([
          fetch(`/api/crypto/details/${coinId}`),
          fetch(`/api/crypto/chart/${coinId}?days=90`), // Get 90 days for better analysis
        ]);
        
        if (!detailsResponse.ok || !chartResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [detailsResult, chartResult] = await Promise.all([
          detailsResponse.json(),
          chartResponse.json(),
        ]);
        
        setCoinDetails(detailsResult.data);
        setChartData(chartResult.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [coinId]);

  const generatePrediction = async () => {
    if (!coinDetails || !chartData) return;
    
    setAnalyzing(true);
    
    try {
      // Extract price and volume data
      const prices = chartData.prices.map((p: [number, number]) => p[1]);
      const volumes = chartData.total_volumes?.map((v: [number, number]) => v[1]) || [];
      const currentPrice = coinDetails.market_data.current_price.usd;
      
      // Perform technical analysis
      const technical = performTechnicalAnalysis(prices, volumes);
      
      // Get base prediction from technical analysis
      const basePrediction = predictPrice(currentPrice, technical, predictionDays);
      
      // Fetch sentiment data
      let sentiment: SentimentData | null = null;
      let finalPrediction = { ...basePrediction };
      
      try {
        sentiment = await analyzeMarketSentiment();
        
        // Apply sentiment adjustment
        const adjusted = applySentimentToScore(
          technical.signals.strength,
          sentiment
        );
        
        // Recalculate prediction with sentiment
        const sentimentAdjustment = (adjusted.adjustedScore - technical.signals.strength) / 100;
        finalPrediction.predictedChange += sentimentAdjustment * 5; // Max ±5% adjustment
        finalPrediction.predictedPrice = currentPrice * (1 + finalPrediction.predictedChange / 100);
        
        setPrediction({
          ...finalPrediction,
          technicalAnalysis: technical,
          sentimentData: sentiment,
          sentimentImpact: adjusted.sentimentImpact,
          reasoning: adjusted.reasoning,
        });
      } catch (sentimentError) {
        // If sentiment fails, use technical-only prediction
        console.warn('Sentiment analysis failed, using technical-only prediction');
        setPrediction({
          ...finalPrediction,
          technicalAnalysis: technical,
          sentimentData: null,
        });
      }
    } catch (err) {
      console.error('Prediction error:', err);
      alert('Failed to generate prediction. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !coinDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || 'Coin not found'}</p>
          <button
            onClick={() => router.push('/crypto')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Back to Table
          </button>
        </div>
      </div>
    );
  }

  const currentPrice = coinDetails.market_data.current_price.usd;
  const priceChange24h = coinDetails.market_data.price_change_percentage_24h;
  const ta = prediction?.technicalAnalysis;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.push('/crypto')}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
      >
        ← Back to Table
      </button>

      {/* Coin Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={coinDetails.image.large}
            alt={coinDetails.name}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{coinDetails.name}</h1>
            <p className="text-gray-900 uppercase font-medium">{coinDetails.symbol}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Current Price</p>
            <p className="text-2xl font-bold text-gray-900">${currentPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            })}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">24h Change</p>
            <p
              className={`text-2xl font-bold ${
                priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {priceChange24h >= 0 ? '▲' : '▼'} {Math.abs(priceChange24h).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Market Cap</p>
            <p className="text-2xl font-bold text-gray-900">
              ${(coinDetails.market_data.market_cap.usd / 1e9).toFixed(2)}B
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Volume (24h)</p>
            <p className="text-2xl font-bold text-gray-900">
              ${(coinDetails.market_data.total_volume.usd / 1e9).toFixed(2)}B
            </p>
          </div>
        </div>
      </div>

      {/* Prediction Section */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          🔮 AI-Powered Price Prediction
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Prediction Timeframe
            </label>
            <select
              value={predictionDays}
              onChange={(e) => setPredictionDays(Number(e.target.value))}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
              disabled={analyzing}
            >
              <option value={1}>1 Day</option>
              <option value={7}>7 Days</option>
              <option value={30}>30 Days</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={generatePrediction}
              disabled={analyzing}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                '🎯 Generate Smart Prediction'
              )}
            </button>
          </div>
        </div>

        {prediction && (
          <div className="space-y-4">
            {/* Main Prediction Results */}
            <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                📊 Prediction Results ({predictionDays} {predictionDays === 1 ? 'Day' : 'Days'})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-900 mb-1 font-medium">Predicted Price</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${prediction.predictedPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-900 mb-1 font-medium">Expected Change</p>
                  <p
                    className={`text-3xl font-bold ${
                      prediction.predictedChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {prediction.predictedChange >= 0 ? '+' : ''}
                    {prediction.predictedChange.toFixed(2)}%
                  </p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-900 mb-1 font-medium">Confidence Level</p>
                  <p className="text-3xl font-bold text-green-600">{prediction.confidence}%</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Trading Signal */}
              <div className={`p-4 rounded-lg border-2 ${
                ta?.signals.overall === 'STRONG_BUY' ? 'bg-green-50 border-green-500' :
                ta?.signals.overall === 'BUY' ? 'bg-green-50 border-green-300' :
                ta?.signals.overall === 'NEUTRAL' ? 'bg-gray-50 border-gray-300' :
                ta?.signals.overall === 'SELL' ? 'bg-red-50 border-red-300' :
                'bg-red-50 border-red-500'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Trading Signal</p>
                    <p className={`text-2xl font-bold ${
                      ta?.signals.overall === 'STRONG_BUY' || ta?.signals.overall === 'BUY' ? 'text-green-700' :
                      ta?.signals.overall === 'NEUTRAL' ? 'text-gray-700' :
                      'text-red-700'
                    }`}>
                      {ta?.signals.overall.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-700 font-medium">Signal Strength</p>
                    <p className="text-2xl font-bold text-gray-900">{ta?.signals.strength}/100</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Analysis Details */}
            {ta && (
              <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📈 Technical Analysis
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* RSI */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">RSI (14)</p>
                    <p className="text-2xl font-bold text-gray-900">{ta.rsi.toFixed(1)}</p>
                    <p className={`text-sm mt-1 ${
                      ta.rsi > 70 ? 'text-red-600' :
                      ta.rsi < 30 ? 'text-green-600' :
                      'text-gray-600'
                    }`}>
                      {ta.rsi > 70 ? 'Overbought' : ta.rsi < 30 ? 'Oversold' : 'Neutral'}
                    </p>
                  </div>

                  {/* MACD */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">MACD</p>
                    <p className={`text-2xl font-bold ${
                      ta.macd.trend === 'BULLISH' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {ta.macd.trend}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Histogram: {ta.macd.histogram.toFixed(2)}
                    </p>
                  </div>

                  {/* Moving Averages */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Moving Avg</p>
                    <p className={`text-2xl font-bold ${
                      ta.movingAverages.trend === 'BULLISH' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {ta.movingAverages.trend}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      SMA7 vs SMA30
                    </p>
                  </div>

                  {/* Bollinger Position */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Bollinger Bands</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(ta.bollingerBands.position * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {ta.bollingerBands.position < 0.3 ? 'Near Lower' :
                       ta.bollingerBands.position > 0.7 ? 'Near Upper' : 'Mid-range'}
                    </p>
                  </div>
                </div>

                {/* Detailed Signals */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-bold text-gray-900 mb-2">🎯 Key Signals:</p>
                  <ul className="space-y-1">
                    {prediction.signals.map((signal, i) => (
                      <li key={i} className="text-sm text-gray-800">• {signal}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Sentiment Analysis */}
            {prediction.sentimentData && (
              <div className="bg-white rounded-lg p-6 border-2 border-purple-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  💭 Market Sentiment
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Fear & Greed Index</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {prediction.sentimentData.fearGreed.value}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {prediction.sentimentData.fearGreed.classification}
                    </p>
                    <p className={`text-sm font-bold mt-2 ${
                      prediction.sentimentData.fearGreed.signal === 'BUY' ? 'text-green-600' :
                      prediction.sentimentData.fearGreed.signal === 'SELL' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      Signal: {prediction.sentimentData.fearGreed.signal}
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Market Sentiment</p>
                    <p className="text-sm text-gray-800 font-medium mt-2">
                      {prediction.sentimentData.marketSentiment.description}
                    </p>
                    {prediction.reasoning && (
                      <p className="text-sm text-gray-700 mt-3 italic">
                        💡 {prediction.reasoning}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-900">
                ⚠️ <strong>Prediction Disclaimer:</strong> Our system analyzes multiple data sources including 
                technical indicators (RSI, MACD, Moving Averages, Bollinger Bands), market sentiment, volume trends, 
                and historical patterns to calculate probability-based price predictions. However, cryptocurrency 
                markets are inherently unpredictable and can be influenced by sudden news, regulatory changes, and 
                unexpected events that no algorithm can foresee. This analysis is not financial advice. Always 
                conduct thorough research, diversify your portfolio, and never invest more than you can afford to lose.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Price Chart</h2>
          <div className="flex gap-2">
            {[1, 7, 30, 90, 365].map((days) => (
              <button
                key={days}
                onClick={() => setChartDays(days)}
                className={`px-3 py-1 rounded ${
                  chartDays === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>
        <CoinChart coinId={coinId} coinName={coinDetails.name} days={chartDays} />
      </div>
    </div>
  );
}
