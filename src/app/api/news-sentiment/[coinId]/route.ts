import { NextResponse } from 'next/server';
import { trackApiCall } from '@/utils/apiMonitor';

// ============================================
// NEWS SENTIMENT API - CryptoPanic Integration
// ============================================
// Free Tier: 500 calls/day (~20 calls/hour)
// Strategy: 10-minute cache per coin
// Expected Usage: ~50 unique coins/day × 6 calls/hour = ~300 calls/day (60% capacity)
// ============================================

interface CryptoPanicNews {
  kind: string;
  domain: string;
  title: string;
  published_at: string;
  slug: string;
  url: string;
  created_at: string;
  votes: {
    negative: number;
    positive: number;
    important: number;
    liked: number;
    disliked: number;
    lol: number;
    toxic: number;
    saved: number;
    comments: number;
  };
  currencies?: Array<{
    code: string;
    title: string;
  }>;
}

interface CryptoPanicResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CryptoPanicNews[];
}

export interface NewsSentiment {
  score: number; // 0-100 (bearish to bullish)
  signal: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  confidence: number; // Based on news volume
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  totalNews: number;
  recentNews: Array<{
    title: string;
    url: string;
    publishedAt: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    votes: { positive: number; negative: number };
  }>;
  cached: boolean;
  cachedAt: string;
}

// In-memory cache: { coinId: { data, timestamp } }
const newsCache = new Map<string, { data: NewsSentiment; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET(
  request: Request,
  { params }: { params: Promise<{ coinId: string }> }
) {
  try {
    const { coinId } = await params;
    const now = Date.now();

    // Check cache first
    const cached = newsCache.get(coinId);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(`[News Sentiment] Cache hit for ${coinId}`);
      return NextResponse.json({
        ...cached.data,
        cached: true,
      });
    }

    // Clean old cache entries (keep only last 50 coins)
    if (newsCache.size > 50) {
      const oldestKey = Array.from(newsCache.keys())[0];
      newsCache.delete(oldestKey);
    }

    // Fetch fresh data from CryptoPanic
    const apiKey = process.env.CRYPTOPANIC_API_KEY;
    
    if (!apiKey) {
      console.warn('[News Sentiment] CryptoPanic API key not configured');
      // Return neutral sentiment without API key
      const neutralData: NewsSentiment = {
        score: 50,
        signal: 'NEUTRAL',
        confidence: 0,
        bullishCount: 0,
        bearishCount: 0,
        neutralCount: 0,
        totalNews: 0,
        recentNews: [],
        cached: false,
        cachedAt: new Date().toISOString(),
      };
      return NextResponse.json(neutralData);
    }

    console.log(`[News Sentiment] Fetching fresh data for ${coinId}...`);
    trackApiCall(`news-sentiment/${coinId}`);

    // Convert coinId to symbol (e.g., 'bitcoin' -> 'BTC')
    const symbolMap: Record<string, string> = {
      bitcoin: 'BTC',
      ethereum: 'ETH',
      'binancecoin': 'BNB',
      'ripple': 'XRP',
      'cardano': 'ADA',
      'solana': 'SOL',
      'dogecoin': 'DOGE',
      'polkadot': 'DOT',
      'polygon': 'MATIC',
      'shiba-inu': 'SHIB',
      'avalanche': 'AVAX',
      'chainlink': 'LINK',
      'uniswap': 'UNI',
      'litecoin': 'LTC',
      'monero': 'XMR',
    };
    
    const symbol = symbolMap[coinId] || coinId.toUpperCase().slice(0, 5);

    const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}&currencies=${symbol}&filter=hot&limit=50`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 600 }, // 10 minutes
    });

    if (!response.ok) {
      throw new Error(`CryptoPanic API error: ${response.status}`);
    }

    const data: CryptoPanicResponse = await response.json();

    // Analyze sentiment from news
    let bullishCount = 0;
    let bearishCount = 0;
    let neutralCount = 0;

    const recentNews = data.results.slice(0, 10).map(news => {
      const posVotes = news.votes.positive + news.votes.liked;
      const negVotes = news.votes.negative + news.votes.disliked;
      
      let sentiment: 'positive' | 'negative' | 'neutral';
      
      // Sentiment logic based on vote ratios
      if (posVotes > negVotes * 1.5) {
        sentiment = 'positive';
        bullishCount++;
      } else if (negVotes > posVotes * 1.5) {
        sentiment = 'negative';
        bearishCount++;
      } else {
        sentiment = 'neutral';
        neutralCount++;
      }

      return {
        title: news.title,
        url: news.url,
        publishedAt: news.published_at,
        sentiment,
        votes: { positive: posVotes, negative: negVotes },
      };
    });

    const totalNews = bullishCount + bearishCount + neutralCount;
    
    // Calculate sentiment score (0-100)
    let score = 50; // Default neutral
    if (totalNews > 0) {
      score = Math.round(((bullishCount - bearishCount) / totalNews) * 50 + 50);
      score = Math.max(0, Math.min(100, score)); // Clamp 0-100
    }

    // Determine signal
    let signal: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
    if (score >= 60) signal = 'BULLISH';
    else if (score <= 40) signal = 'BEARISH';
    else signal = 'NEUTRAL';

    // Confidence based on news volume (more news = higher confidence)
    let confidence = Math.min(totalNews * 10, 100); // 10 news = 100% confidence
    
    const sentimentData: NewsSentiment = {
      score,
      signal,
      confidence,
      bullishCount,
      bearishCount,
      neutralCount,
      totalNews,
      recentNews,
      cached: false,
      cachedAt: new Date().toISOString(),
    };

    // Cache the result
    newsCache.set(coinId, { data: sentimentData, timestamp: now });

    return NextResponse.json(sentimentData);

  } catch (error) {
    console.error('[News Sentiment] Error:', error);
    
    // Return neutral sentiment on error
    return NextResponse.json({
      score: 50,
      signal: 'NEUTRAL',
      confidence: 0,
      bullishCount: 0,
      bearishCount: 0,
      neutralCount: 0,
      totalNews: 0,
      recentNews: [],
      cached: false,
      cachedAt: new Date().toISOString(),
      error: 'Failed to fetch news sentiment',
    }, { status: 500 });
  }
}
