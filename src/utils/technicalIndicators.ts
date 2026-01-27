/**
 * Technical Indicators for Crypto Price Analysis
 * 
 * This module provides professional-grade technical analysis indicators
 * used by traders worldwide to analyze price trends and momentum.
 */

export interface TechnicalAnalysis {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
    trend: 'BULLISH' | 'BEARISH';
  };
  movingAverages: {
    sma7: number;
    sma30: number;
    ema12: number;
    ema26: number;
    trend: 'BULLISH' | 'BEARISH';
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    position: number; // 0-1, where price sits in the bands
  };
  volumeTrend: {
    currentVolume: number;
    averageVolume: number;
    trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  };
  signals: {
    overall: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
    strength: number; // 0-100
  };
}

/**
 * Calculate Simple Moving Average (SMA)
 * Smooths out price data to identify trends
 */
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  
  const slice = prices.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / period;
}

/**
 * Calculate Exponential Moving Average (EMA)
 * Gives more weight to recent prices than SMA
 */
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(prices.slice(0, period), period);
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 * Measures momentum and identifies overbought/oversold conditions
 * 
 * RSI > 70: Overbought (potential sell signal)
 * RSI < 30: Oversold (potential buy signal)
 * RSI 50: Neutral
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  // Calculate initial average gains and losses
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return rsi;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * Shows relationship between two moving averages
 * 
 * MACD > Signal: Bullish (buy signal)
 * MACD < Signal: Bearish (sell signal)
 */
export function calculateMACD(prices: number[]) {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;
  
  // Calculate signal line (9-period EMA of MACD)
  const macdHistory: number[] = [];
  for (let i = Math.max(0, prices.length - 35); i < prices.length; i++) {
    const slicePrices = prices.slice(0, i + 1);
    const e12 = calculateEMA(slicePrices, 12);
    const e26 = calculateEMA(slicePrices, 26);
    macdHistory.push(e12 - e26);
  }
  
  const signalLine = calculateEMA(macdHistory, 9);
  const histogram = macdLine - signalLine;
  
  return {
    value: macdLine,
    signal: signalLine,
    histogram: histogram,
    trend: macdLine > signalLine ? 'BULLISH' as const : 'BEARISH' as const,
  };
}

/**
 * Calculate Bollinger Bands
 * Shows volatility and potential price extremes
 * 
 * Price near upper band: Potentially overbought
 * Price near lower band: Potentially oversold
 */
export function calculateBollingerBands(prices: number[], period: number = 20, stdDevMultiplier: number = 2) {
  const sma = calculateSMA(prices, period);
  const slice = prices.slice(-period);
  
  // Calculate standard deviation
  const squaredDiffs = slice.map(price => Math.pow(price - sma, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  const stdDev = Math.sqrt(variance);
  
  const currentPrice = prices[prices.length - 1];
  const upper = sma + (stdDev * stdDevMultiplier);
  const lower = sma - (stdDev * stdDevMultiplier);
  
  // Calculate where current price sits in the bands (0 = lower, 1 = upper)
  const position = (currentPrice - lower) / (upper - lower);
  
  return {
    upper,
    middle: sma,
    lower,
    position: Math.max(0, Math.min(1, position)),
  };
}

/**
 * Analyze volume trends
 * High volume confirms price movements
 */
export function analyzeVolume(volumes: number[]) {
  if (volumes.length < 7) {
    return {
      currentVolume: volumes[volumes.length - 1] || 0,
      averageVolume: volumes[volumes.length - 1] || 0,
      trend: 'STABLE' as const,
    };
  }
  
  const currentVolume = volumes[volumes.length - 1];
  const averageVolume = calculateSMA(volumes, 7);
  
  let trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  const ratio = currentVolume / averageVolume;
  
  if (ratio > 1.2) {
    trend = 'INCREASING';
  } else if (ratio < 0.8) {
    trend = 'DECREASING';
  } else {
    trend = 'STABLE';
  }
  
  return {
    currentVolume,
    averageVolume,
    trend,
  };
}

/**
 * Comprehensive technical analysis
 * Combines all indicators for a complete market view
 */
export function performTechnicalAnalysis(
  prices: number[],
  volumes?: number[]
): TechnicalAnalysis {
  // Calculate all indicators
  const rsi = calculateRSI(prices);
  const macd = calculateMACD(prices);
  const sma7 = calculateSMA(prices, 7);
  const sma30 = calculateSMA(prices, 30);
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const bollinger = calculateBollingerBands(prices);
  const volumeTrend = volumes ? analyzeVolume(volumes) : {
    currentVolume: 0,
    averageVolume: 0,
    trend: 'STABLE' as const,
  };
  
  // Scoring system (0-100)
  let bullishScore = 0;
  let signals: string[] = [];
  
  // 1. RSI Analysis (25 points)
  if (rsi < 30) {
    bullishScore += 25;
    signals.push('RSI: Oversold - Strong Buy Signal');
  } else if (rsi > 70) {
    bullishScore += 0;
    signals.push('RSI: Overbought - Sell Signal');
  } else {
    const rsiScore = 50 - Math.abs(rsi - 50);
    bullishScore += (rsiScore / 50) * 25;
    signals.push('RSI: Neutral');
  }
  
  // 2. MACD Analysis (25 points)
  if (macd.trend === 'BULLISH') {
    bullishScore += 25;
    signals.push('MACD: Bullish Crossover');
  } else {
    signals.push('MACD: Bearish Crossover');
  }
  
  // 3. Moving Average Analysis (25 points)
  const maTrend = sma7 > sma30 ? 'BULLISH' : 'BEARISH';
  if (maTrend === 'BULLISH') {
    bullishScore += 25;
    signals.push('MA: Golden Cross - Uptrend');
  } else {
    signals.push('MA: Death Cross - Downtrend');
  }
  
  // 4. Bollinger Bands (25 points)
  if (bollinger.position < 0.2) {
    bullishScore += 25;
    signals.push('Bollinger: Near Lower Band - Buy Signal');
  } else if (bollinger.position > 0.8) {
    bullishScore += 0;
    signals.push('Bollinger: Near Upper Band - Sell Signal');
  } else {
    bullishScore += 12.5;
    signals.push('Bollinger: Mid-range - Neutral');
  }
  
  // 5. Volume confirmation (bonus points)
  if (volumeTrend.trend === 'INCREASING' && bullishScore > 50) {
    bullishScore += 10;
    signals.push('Volume: Confirming Uptrend');
  } else if (volumeTrend.trend === 'INCREASING' && bullishScore < 50) {
    bullishScore -= 10;
    signals.push('Volume: Confirming Downtrend');
  }
  
  // Normalize score to 0-100
  bullishScore = Math.max(0, Math.min(100, bullishScore));
  
  // Determine overall signal
  let overall: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  if (bullishScore >= 80) overall = 'STRONG_BUY';
  else if (bullishScore >= 60) overall = 'BUY';
  else if (bullishScore >= 40) overall = 'NEUTRAL';
  else if (bullishScore >= 20) overall = 'SELL';
  else overall = 'STRONG_SELL';
  
  return {
    rsi,
    macd,
    movingAverages: {
      sma7,
      sma30,
      ema12,
      ema26,
      trend: maTrend,
    },
    bollingerBands: bollinger,
    volumeTrend,
    signals: {
      overall,
      strength: Math.round(bullishScore),
    },
  };
}

/**
 * Generate price prediction based on technical analysis
 */
export function predictPrice(
  currentPrice: number,
  technicalAnalysis: TechnicalAnalysis,
  days: number
): {
  predictedPrice: number;
  predictedChange: number;
  confidence: number;
  signals: string[];
} {
  const { signals, rsi, macd, movingAverages, bollingerBands } = technicalAnalysis;
  
  // Base prediction on bullish score
  const baseChange = ((signals.strength - 50) / 50) * 8; // ±8% base
  
  // Adjust for timeframe
  const timeMultiplier = Math.sqrt(days / 7); // Scale with square root of days
  let predictedChange = baseChange * timeMultiplier;
  
  // Add momentum factor from RSI
  if (rsi < 30) {
    predictedChange += 2; // Oversold bounce
  } else if (rsi > 70) {
    predictedChange -= 2; // Overbought correction
  }
  
  // Add MACD momentum
  if (macd.histogram > 0 && macd.histogram > Math.abs(macd.value) * 0.1) {
    predictedChange += 1; // Strong bullish momentum
  } else if (macd.histogram < 0 && Math.abs(macd.histogram) > Math.abs(macd.value) * 0.1) {
    predictedChange -= 1; // Strong bearish momentum
  }
  
  // Limit extreme predictions
  predictedChange = Math.max(-15, Math.min(15, predictedChange));
  
  const predictedPrice = currentPrice * (1 + predictedChange / 100);
  
  // Calculate confidence based on indicator agreement
  const indicatorAgreement = [
    signals.strength > 60 || signals.strength < 40, // Strong signal
    Math.abs(rsi - 50) > 20, // Clear RSI signal
    macd.trend === movingAverages.trend, // MACD and MA agree
    (bollingerBands.position < 0.3 && signals.strength > 50) || // BB confirms
    (bollingerBands.position > 0.7 && signals.strength < 50),
  ].filter(Boolean).length;
  
  const confidence = Math.round((indicatorAgreement / 4) * 100);
  
  // Generate detailed signals
  const detailedSignals: string[] = [];
  detailedSignals.push(`Overall Signal: ${signals.overall} (${signals.strength}% bullish)`);
  detailedSignals.push(`RSI: ${rsi.toFixed(1)} - ${rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral'}`);
  detailedSignals.push(`MACD: ${macd.trend} - ${macd.histogram > 0 ? 'Gaining' : 'Losing'} momentum`);
  detailedSignals.push(`Trend: ${movingAverages.trend} (7-day vs 30-day MA)`);
  detailedSignals.push(`Bollinger: ${(bollingerBands.position * 100).toFixed(0)}% position`);
  
  return {
    predictedPrice,
    predictedChange,
    confidence,
    signals: detailedSignals,
  };
}
