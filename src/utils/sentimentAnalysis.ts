/**
 * Sentiment Analysis Utilities
 * 
 * Analyzes market sentiment to complement technical analysis
 */

export interface SentimentData {
  fearGreed: {
    value: number;
    classification: string;
    signal: 'BUY' | 'NEUTRAL' | 'SELL';
  };
  marketSentiment: {
    score: number; // -1 to 1
    description: string;
  };
}

/**
 * Fetch Fear & Greed Index
 * Market sentiment indicator (0-100)
 */
export async function getFearGreedIndex(): Promise<SentimentData['fearGreed']> {
  try {
    const response = await fetch('/api/sentiment/fear-greed');
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch sentiment data');
    }
    
    const value = result.data.value;
    const classification = result.data.classification;
    
    // Determine trading signal
    let signal: 'BUY' | 'NEUTRAL' | 'SELL';
    if (value <= 30) {
      signal = 'BUY'; // Extreme Fear = Opportunity
    } else if (value >= 70) {
      signal = 'SELL'; // Extreme Greed = Warning
    } else {
      signal = 'NEUTRAL';
    }
    
    return {
      value,
      classification,
      signal,
    };
  } catch (error) {
    console.error('[Sentiment Analysis Error]:', error);
    // Return neutral sentiment on error
    return {
      value: 50,
      classification: 'Neutral',
      signal: 'NEUTRAL',
    };
  }
}

/**
 * Convert Fear & Greed to sentiment score (-1 to 1)
 * Used for combining with technical analysis
 */
export function fearGreedToSentiment(fearGreedValue: number): number {
  // Invert scale: High fear = positive sentiment for buying
  // High greed = negative sentiment (caution)
  return (50 - fearGreedValue) / 50;
}

/**
 * Analyze overall market sentiment
 */
export async function analyzeMarketSentiment(): Promise<SentimentData> {
  const fearGreed = await getFearGreedIndex();
  const sentimentScore = fearGreedToSentiment(fearGreed.value);
  
  let description: string;
  if (sentimentScore > 0.4) {
    description = 'Extreme Fear - Strong Buy Opportunity';
  } else if (sentimentScore > 0.2) {
    description = 'Fear - Buy Opportunity';
  } else if (sentimentScore > -0.2) {
    description = 'Neutral - Hold Position';
  } else if (sentimentScore > -0.4) {
    description = 'Greed - Consider Taking Profits';
  } else {
    description = 'Extreme Greed - Strong Sell Signal';
  }
  
  return {
    fearGreed,
    marketSentiment: {
      score: sentimentScore,
      description,
    },
  };
}

/**
 * Calculate sentiment-adjusted prediction score
 */
export function applySentimentToScore(
  technicalScore: number,
  sentimentData: SentimentData
): {
  adjustedScore: number;
  sentimentImpact: number;
  reasoning: string;
} {
  // Technical analysis: 70% weight
  // Sentiment: 30% weight
  const technicalWeight = 0.7;
  const sentimentWeight = 0.3;
  
  // Convert sentiment score (-1 to 1) to 0-100 scale
  const sentimentScore = (sentimentData.marketSentiment.score + 1) * 50;
  
  // Combine scores
  const adjustedScore = (technicalScore * technicalWeight) + (sentimentScore * sentimentWeight);
  const sentimentImpact = adjustedScore - technicalScore;
  
  // Generate reasoning
  let reasoning = '';
  if (Math.abs(sentimentImpact) < 3) {
    reasoning = 'Sentiment confirms technical analysis';
  } else if (sentimentImpact > 0) {
    reasoning = `Market fear creating buy opportunity (+${sentimentImpact.toFixed(1)}%)`;
  } else {
    reasoning = `Market greed suggests caution (${sentimentImpact.toFixed(1)}%)`;
  }
  
  return {
    adjustedScore: Math.max(0, Math.min(100, adjustedScore)),
    sentimentImpact,
    reasoning,
  };
}
