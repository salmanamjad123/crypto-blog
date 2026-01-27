/**
 * Enhanced Prediction System - Multi-Source Algorithm
 * 
 * Combines multiple data sources with weighted scoring:
 * - Technical Analysis (35%)
 * - News Sentiment (25%)
 * - Funding Rates (15%)
 * - Market Metrics (15%)
 * - Fear & Greed Index (10%)
 */

import { TechnicalAnalysis } from './technicalIndicators';

export interface EnhancedPredictionInput {
  technical: TechnicalAnalysis;
  fearGreed?: {
    value: number;
    classification: string;
  };
  newsSentiment?: {
    score: number;
    signal: string;
    confidence: number;
    totalNews: number;
  };
  fundingRate?: {
    rate: number;
    signal: string;
    score: number;
  };
  marketMetrics?: {
    longShortRatio: number;
    signal: string;
    score: number;
    sentiment: string;
  };
}

export interface EnhancedPrediction {
  prediction: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidence: number; // 0-100
  targetPrice: number;
  priceChange: number;
  timeframe: string;
  breakdown: {
    technical: { score: number; weight: number; signal: string };
    news: { score: number; weight: number; signal: string };
    funding: { score: number; weight: number; signal: string };
    market: { score: number; weight: number; signal: string };
    sentiment: { score: number; weight: number; signal: string };
  };
  totalScore: number; // Weighted average 0-100
  dataSourcesUsed: string[];
  analysis: string;
}

/**
 * Calculate enhanced prediction using all available data sources
 */
export function calculateEnhancedPrediction(
  currentPrice: number,
  input: EnhancedPredictionInput,
  days: number = 7
): EnhancedPrediction {
  const dataSourcesUsed: string[] = ['Technical Analysis'];
  
  // ==============================================
  // 1. Technical Analysis Score (35% weight)
  // ==============================================
  const technicalScore = calculateTechnicalScore(input.technical);
  const technicalWeight = 0.35;
  
  // ==============================================
  // 2. News Sentiment Score (25% weight)
  // ==============================================
  let newsScore = 50; // Default neutral
  let newsWeight = 0;
  let newsSignal = 'NEUTRAL';
  
  if (input.newsSentiment && input.newsSentiment.totalNews > 0) {
    newsScore = input.newsSentiment.score;
    newsWeight = 0.25;
    newsSignal = input.newsSentiment.signal;
    dataSourcesUsed.push('News Sentiment');
    
    // Adjust weight based on confidence (news volume)
    const confidenceFactor = Math.min(input.newsSentiment.confidence / 100, 1);
    newsWeight = 0.25 * (0.5 + 0.5 * confidenceFactor); // 50-100% of max weight
  }
  
  // ==============================================
  // 3. Funding Rate Score (15% weight)
  // ==============================================
  let fundingScore = 50; // Default neutral
  let fundingWeight = 0;
  let fundingSignal = 'NEUTRAL';
  
  if (input.fundingRate) {
    fundingScore = input.fundingRate.score;
    fundingWeight = 0.15;
    fundingSignal = input.fundingRate.signal;
    dataSourcesUsed.push('Funding Rates');
  }
  
  // ==============================================
  // 4. Market Metrics Score (15% weight)
  // ==============================================
  let marketScore = 50; // Default neutral
  let marketWeight = 0;
  let marketSignal = 'NEUTRAL';
  
  if (input.marketMetrics) {
    marketScore = input.marketMetrics.score;
    marketWeight = 0.15;
    marketSignal = input.marketMetrics.signal;
    dataSourcesUsed.push('Market Metrics');
  }
  
  // ==============================================
  // 5. Fear & Greed Index Score (10% weight)
  // ==============================================
  let sentimentScore = 50; // Default neutral
  let sentimentWeight = 0;
  let sentimentSignal = 'NEUTRAL';
  
  if (input.fearGreed) {
    // Fear & Greed is inverted (fear = buy opportunity, greed = sell opportunity)
    sentimentScore = 100 - input.fearGreed.value;
    sentimentWeight = 0.10;
    sentimentSignal = input.fearGreed.value < 30 ? 'BULLISH' : 
                     input.fearGreed.value > 70 ? 'BEARISH' : 'NEUTRAL';
    dataSourcesUsed.push('Fear & Greed Index');
  }
  
  // ==============================================
  // Calculate Weighted Total Score
  // ==============================================
  const totalWeight = technicalWeight + newsWeight + fundingWeight + marketWeight + sentimentWeight;
  
  const totalScore = (
    (technicalScore * technicalWeight) +
    (newsScore * newsWeight) +
    (fundingScore * fundingWeight) +
    (marketScore * marketWeight) +
    (sentimentScore * sentimentWeight)
  ) / totalWeight;
  
  // ==============================================
  // Determine Prediction Signal
  // ==============================================
  let prediction: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  
  if (totalScore >= 70) {
    prediction = 'STRONG_BUY';
  } else if (totalScore >= 60) {
    prediction = 'BUY';
  } else if (totalScore >= 40) {
    prediction = 'HOLD';
  } else if (totalScore >= 30) {
    prediction = 'SELL';
  } else {
    prediction = 'STRONG_SELL';
  }
  
  // ==============================================
  // Calculate Confidence Level
  // ==============================================
  // Base confidence starts at 40%
  let confidence = 40;
  
  // Add confidence for each data source used (up to +40%)
  confidence += (dataSourcesUsed.length - 1) * 10; // -1 because technical is always there
  
  // Add confidence based on signal agreement
  const signals = [
    technicalScore > 50 ? 'BULL' : technicalScore < 50 ? 'BEAR' : 'NEUTRAL',
    newsScore > 50 ? 'BULL' : newsScore < 50 ? 'BEAR' : 'NEUTRAL',
    fundingScore > 50 ? 'BULL' : fundingScore < 50 ? 'BEAR' : 'NEUTRAL',
    marketScore > 50 ? 'BULL' : marketScore < 50 ? 'BEAR' : 'NEUTRAL',
    sentimentScore > 50 ? 'BULL' : sentimentScore < 50 ? 'BEAR' : 'NEUTRAL',
  ].filter(s => s !== 'NEUTRAL');
  
  const bullSignals = signals.filter(s => s === 'BULL').length;
  const bearSignals = signals.filter(s => s === 'BEAR').length;
  const maxSignals = Math.max(bullSignals, bearSignals);
  
  if (maxSignals >= 4) {
    confidence += 20; // Very strong agreement
  } else if (maxSignals >= 3) {
    confidence += 15; // Strong agreement
  } else if (maxSignals >= 2) {
    confidence += 10; // Moderate agreement
  }
  
  // Add confidence based on extremity (stronger signals = higher confidence)
  const extremity = Math.abs(totalScore - 50) / 50; // 0-1
  confidence += extremity * 10;
  
  // Cap confidence at 95%
  confidence = Math.min(95, Math.round(confidence));
  
  // ==============================================
  // Calculate Target Price
  // ==============================================
  const priceChange = calculatePriceChange(totalScore, confidence, input.technical, days);
  const targetPrice = currentPrice * (1 + priceChange / 100);
  
  // ==============================================
  // Generate Analysis Text
  // ==============================================
  const analysis = generateAnalysis(
    prediction,
    totalScore,
    confidence,
    dataSourcesUsed.length,
    input
  );
  
  // Generate dynamic timeframe text
  const timeframe = days === 1 ? '24 hours' :
                   days <= 3 ? '24-72 hours' :
                   days === 7 ? '1 week' :
                   days === 30 ? '1 month' :
                   `${days} days`;
  
  return {
    prediction,
    confidence,
    targetPrice,
    priceChange,
    timeframe,
    breakdown: {
      technical: { 
        score: Math.round(technicalScore), 
        weight: technicalWeight * 100, 
        signal: input.technical.signals.overall 
      },
      news: { 
        score: Math.round(newsScore), 
        weight: newsWeight * 100, 
        signal: newsSignal 
      },
      funding: { 
        score: Math.round(fundingScore), 
        weight: fundingWeight * 100, 
        signal: fundingSignal 
      },
      market: { 
        score: Math.round(marketScore), 
        weight: marketWeight * 100, 
        signal: marketSignal 
      },
      sentiment: { 
        score: Math.round(sentimentScore), 
        weight: sentimentWeight * 100, 
        signal: sentimentSignal 
      },
    },
    totalScore: Math.round(totalScore),
    dataSourcesUsed,
    analysis,
  };
}

/**
 * Calculate technical analysis score (0-100)
 */
function calculateTechnicalScore(technical: TechnicalAnalysis): number {
  let score = 50; // Start neutral
  
  // RSI contribution (±20 points)
  if (technical.rsi > 70) {
    score -= (technical.rsi - 70) / 30 * 20; // Overbought penalty
  } else if (technical.rsi < 30) {
    score += (30 - technical.rsi) / 30 * 20; // Oversold bonus
  } else {
    // Neutral RSI slightly bullish or bearish
    score += ((technical.rsi - 50) / 20) * 10;
  }
  
  // Signal strength contribution (±25 points)
  const signalMultiplier = technical.signals.strength / 100;
  if (technical.signals.overall === 'STRONG_BUY') {
    score += 25 * signalMultiplier;
  } else if (technical.signals.overall === 'BUY') {
    score += 15 * signalMultiplier;
  } else if (technical.signals.overall === 'SELL') {
    score -= 15 * signalMultiplier;
  } else if (technical.signals.overall === 'STRONG_SELL') {
    score -= 25 * signalMultiplier;
  }
  
  // MACD contribution (±10 points)
  if (technical.macd.trend === 'BULLISH') {
    score += 10;
  } else {
    score -= 10;
  }
  
  // Moving averages contribution (±10 points)
  if (technical.movingAverages.trend === 'BULLISH') {
    score += 10;
  } else {
    score -= 10;
  }
  
  // Bollinger Bands contribution (±5 points)
  if (technical.bollingerBands.position < 0.2) {
    score += 5; // Near lower band = potential bounce
  } else if (technical.bollingerBands.position > 0.8) {
    score -= 5; // Near upper band = potential pullback
  }
  
  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate expected price change based on prediction score and timeframe
 */
function calculatePriceChange(
  score: number,
  confidence: number,
  technical: TechnicalAnalysis,
  days: number
): number {
  // Base change percentage based on score deviation from neutral (50)
  const scoreDeviation = (score - 50) / 50; // -1 to +1
  
  // Adjust by confidence (higher confidence = larger moves)
  const confidenceMultiplier = confidence / 100;
  
  // Consider volatility from Bollinger Bands
  const bbWidth = technical.bollingerBands.upper - technical.bollingerBands.lower;
  const bbWidthPercent = (bbWidth / technical.bollingerBands.middle) * 100;
  const volatilityMultiplier = Math.min(bbWidthPercent / 10, 2); // Cap at 2x
  
  // Timeframe multiplier: longer timeframes = bigger potential moves
  // 1 day: 1x, 7 days: 2x, 30 days: 4x
  const timeframeMultiplier = days === 1 ? 1.0 :
                              days <= 7 ? 1.0 + (days - 1) * 0.15 : // Gradual increase to 1.9x at 7 days
                              days <= 30 ? 2.0 + (days - 7) * 0.08 : // Further increase to 3.84x at 30 days
                              4.0; // Cap at 4x for longer predictions
  
  // Base move: 2.5% per day (scaled by timeframe)
  let priceChange = scoreDeviation * 2.5 * confidenceMultiplier * volatilityMultiplier * timeframeMultiplier;
  
  // Dynamic caps based on timeframe
  const maxChange = days === 1 ? 8 :     // ±8% for 1 day
                   days <= 7 ? 15 :      // ±15% for up to 1 week
                   days <= 30 ? 35 :     // ±35% for up to 1 month
                   50;                   // ±50% for longer periods
  
  priceChange = Math.max(-maxChange, Math.min(maxChange, priceChange));
  
  return parseFloat(priceChange.toFixed(2));
}

/**
 * Generate human-readable analysis
 */
function generateAnalysis(
  prediction: string,
  score: number,
  confidence: number,
  dataSourceCount: number,
  input: EnhancedPredictionInput
): string {
  const parts: string[] = [];
  
  // Overall prediction
  parts.push(`Our ${dataSourceCount}-source analysis indicates a ${prediction.replace('_', ' ')} signal with ${confidence}% confidence.`);
  
  // Technical analysis
  const techSignal = input.technical.signals.overall.replace('_', ' ');
  parts.push(`Technical indicators show ${techSignal} with RSI at ${input.technical.rsi.toFixed(1)}.`);
  
  // News sentiment
  if (input.newsSentiment && input.newsSentiment.totalNews > 0) {
    const sentiment = input.newsSentiment.score > 60 ? 'positive' : 
                     input.newsSentiment.score < 40 ? 'negative' : 'mixed';
    parts.push(`Recent news sentiment is ${sentiment} based on ${input.newsSentiment.totalNews} articles.`);
  }
  
  // Funding rates
  if (input.fundingRate) {
    if (input.fundingRate.signal === 'BEARISH') {
      parts.push(`High funding rates suggest overleveraged longs, creating downside risk.`);
    } else if (input.fundingRate.signal === 'BULLISH') {
      parts.push(`Negative funding rates indicate potential for short squeeze upward.`);
    }
  }
  
  // Market metrics
  if (input.marketMetrics) {
    if (input.marketMetrics.sentiment === 'EXTREME_LONG') {
      parts.push(`Long/short ratio shows extreme long positioning (${input.marketMetrics.longShortRatio.toFixed(2)}), creating liquidation risk.`);
    } else if (input.marketMetrics.sentiment === 'EXTREME_SHORT') {
      parts.push(`Long/short ratio shows extreme short positioning (${input.marketMetrics.longShortRatio.toFixed(2)}), creating squeeze potential.`);
    }
  }
  
  // Fear & Greed
  if (input.fearGreed) {
    const fg = input.fearGreed.value;
    if (fg < 25) {
      parts.push(`Market is in extreme fear (${fg}), which historically presents buying opportunities.`);
    } else if (fg > 75) {
      parts.push(`Market is in extreme greed (${fg}), suggesting potential for correction.`);
    }
  }
  
  return parts.join(' ');
}
