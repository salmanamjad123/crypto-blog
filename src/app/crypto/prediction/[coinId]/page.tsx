'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CoinDetails } from '@/utils/coingecko';
import { CoinChart } from '@/components/crypto/CoinChart';
import { performTechnicalAnalysis, type TechnicalAnalysis } from '@/utils/technicalIndicators';
import { analyzeMarketSentiment, type SentimentData } from '@/utils/sentimentAnalysis';
import { calculateEnhancedPrediction, type EnhancedPrediction as EnhancedPredictionType } from '@/utils/enhancedPrediction';

interface PredictionDisplay extends EnhancedPredictionType {
  sentimentData?: SentimentData;
  technicalAnalysis?: TechnicalAnalysis;
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
  const [prediction, setPrediction] = useState<PredictionDisplay | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Cache predictions per timeframe
  const [predictionCache, setPredictionCache] = useState<Record<string, PredictionDisplay>>({});

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

  // Check cache when timeframe changes
  useEffect(() => {
    if (prediction) {
      const cacheKey = `${coinId}-${predictionDays}`;
      if (predictionCache[cacheKey]) {
        console.log(`[Prediction] Loading cached prediction for ${predictionDays} days`);
        setPrediction(predictionCache[cacheKey]);
      } else {
        // Clear current prediction if switching to uncached timeframe
        console.log(`[Prediction] No cache for ${predictionDays} days - user needs to generate`);
      }
    }
  }, [predictionDays, coinId]);

  const generatePrediction = async () => {
    if (!coinDetails || !chartData) return;
    
    // Check cache first for this specific timeframe
    const cacheKey = `${coinId}-${predictionDays}`;
    if (predictionCache[cacheKey]) {
      console.log(`[Prediction] Using cached prediction for ${coinId} (${predictionDays} days)`);
      setPrediction(predictionCache[cacheKey]);
      return;
    }
    
    setAnalyzing(true);
    
    try {
      // Extract price and volume data
      const prices = chartData.prices.map((p: [number, number]) => p[1]);
      const volumes = chartData.total_volumes?.map((v: [number, number]) => v[1]) || [];
      const currentPrice = coinDetails.market_data.current_price.usd;
      
      // Perform technical analysis
      const technical = performTechnicalAnalysis(prices, volumes);
      
      // Fetch all data sources in parallel
      const [sentimentData, newsData, fundingData, marketData] = await Promise.allSettled([
        // Fear & Greed Index
        analyzeMarketSentiment().catch(() => null),
        // News Sentiment
        fetch(`/api/news-sentiment/${coinId}`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null),
        // Funding Rate
        fetch(`/api/funding-rate/${coinId}`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null),
        // Market Metrics
        fetch(`/api/market-metrics/${coinId}`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null),
      ]);
      
      // Extract results (handle Promise.allSettled format)
      const sentiment = sentimentData.status === 'fulfilled' ? sentimentData.value : null;
      const news = newsData.status === 'fulfilled' ? newsData.value : null;
      const funding = fundingData.status === 'fulfilled' ? fundingData.value : null;
      const market = marketData.status === 'fulfilled' ? marketData.value : null;
      
      // Calculate enhanced prediction with timeframe
      const enhancedPrediction = calculateEnhancedPrediction(
        currentPrice, 
        {
          technical,
          fearGreed: sentiment?.fearGreed,
          newsSentiment: news,
          fundingRate: funding,
          marketMetrics: market,
        },
        predictionDays // Pass the timeframe!
      );
      
      const fullPrediction: PredictionDisplay = {
        ...enhancedPrediction,
        technicalAnalysis: technical,
        sentimentData: sentiment || undefined,
      };
      
      // Cache the prediction for this timeframe
      setPredictionCache(prev => ({
        ...prev,
        [cacheKey]: fullPrediction
      }));
      
      setPrediction(fullPrediction);
      
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
  
  // Map prediction signal to technical signal format for UI compatibility
  const signalMapping: Record<string, string> = {
    'STRONG_BUY': 'STRONG_BUY',
    'BUY': 'BUY',
    'HOLD': 'NEUTRAL',
    'SELL': 'SELL',
    'STRONG_SELL': 'STRONG_SELL',
  };
  const mappedSignal = prediction ? signalMapping[prediction.prediction] : 'NEUTRAL';

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
                    ${prediction.targetPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{prediction.timeframe}</p>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-900 mb-1 font-medium">Expected Change</p>
                  <p
                    className={`text-3xl font-bold ${
                      prediction.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {prediction.priceChange >= 0 ? '+' : ''}
                    {prediction.priceChange.toFixed(2)}%
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
                mappedSignal === 'STRONG_BUY' ? 'bg-green-50 border-green-500' :
                mappedSignal === 'BUY' ? 'bg-green-50 border-green-300' :
                mappedSignal === 'NEUTRAL' ? 'bg-gray-50 border-gray-300' :
                mappedSignal === 'SELL' ? 'bg-red-50 border-red-300' :
                'bg-red-50 border-red-500'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Trading Signal</p>
                    <p className={`text-2xl font-bold ${
                      prediction.prediction === 'STRONG_BUY' || prediction.prediction === 'BUY' ? 'text-green-700' :
                      prediction.prediction === 'HOLD' ? 'text-gray-700' :
                      'text-red-700'
                    }`}>
                      {prediction.prediction.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-700 font-medium">Total Score</p>
                    <p className="text-2xl font-bold text-gray-900">{prediction.totalScore}/100</p>
                  </div>
                </div>
              </div>
              
              {/* Data Sources & Breakdown */}
              <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-bold text-gray-900 mb-3">📊 Multi-Source Analysis ({prediction.dataSourcesUsed.length} sources):</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className={`p-3 rounded ${prediction.breakdown.technical.weight > 0 ? 'bg-white' : 'bg-gray-100 opacity-50'}`}>
                    <p className="text-xs text-gray-600">Technical</p>
                    <p className="text-lg font-bold text-gray-900">{prediction.breakdown.technical.score}</p>
                    <p className="text-xs text-gray-600">Weight: {prediction.breakdown.technical.weight.toFixed(0)}%</p>
                  </div>
                  <div className={`p-3 rounded ${prediction.breakdown.news.weight > 0 ? 'bg-white' : 'bg-gray-100 opacity-50'}`}>
                    <p className="text-xs text-gray-600">News</p>
                    <p className="text-lg font-bold text-gray-900">{prediction.breakdown.news.score}</p>
                    <p className="text-xs text-gray-600">Weight: {prediction.breakdown.news.weight.toFixed(0)}%</p>
                  </div>
                  <div className={`p-3 rounded ${prediction.breakdown.funding.weight > 0 ? 'bg-white' : 'bg-gray-100 opacity-50'}`}>
                    <p className="text-xs text-gray-600">Funding</p>
                    <p className="text-lg font-bold text-gray-900">{prediction.breakdown.funding.score}</p>
                    <p className="text-xs text-gray-600">Weight: {prediction.breakdown.funding.weight.toFixed(0)}%</p>
                  </div>
                  <div className={`p-3 rounded ${prediction.breakdown.market.weight > 0 ? 'bg-white' : 'bg-gray-100 opacity-50'}`}>
                    <p className="text-xs text-gray-600">Market</p>
                    <p className="text-lg font-bold text-gray-900">{prediction.breakdown.market.score}</p>
                    <p className="text-xs text-gray-600">Weight: {prediction.breakdown.market.weight.toFixed(0)}%</p>
                  </div>
                  <div className={`p-3 rounded ${prediction.breakdown.sentiment.weight > 0 ? 'bg-white' : 'bg-gray-100 opacity-50'}`}>
                    <p className="text-xs text-gray-600">Sentiment</p>
                    <p className="text-lg font-bold text-gray-900">{prediction.breakdown.sentiment.score}</p>
                    <p className="text-xs text-gray-600">Weight: {prediction.breakdown.sentiment.weight.toFixed(0)}%</p>
                  </div>
                </div>
              </div>
              
              {/* AI Analysis */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-bold text-gray-900 mb-2">🤖 AI Analysis:</p>
                <p className="text-sm text-gray-800 leading-relaxed">{prediction.analysis}</p>
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
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-900">
                ⚠️ <strong>Prediction Disclaimer:</strong> Our enhanced prediction system analyzes data from up to 5 
                sources: technical indicators (RSI, MACD, Moving Averages, Bollinger Bands), real-time news sentiment, 
                futures funding rates, market long/short ratios, and Fear & Greed Index. We provide probability-based 
                predictions based on all available trends, news analysis, and algorithmic signals. However, cryptocurrency 
                markets are inherently unpredictable and can be influenced by sudden events that no algorithm can foresee. 
                This analysis is not financial advice. Always conduct thorough research and never invest more than you can afford to lose.
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
