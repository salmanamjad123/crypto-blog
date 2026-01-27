import { NextResponse } from 'next/server';
import { getApiStats } from '@/utils/apiMonitor';

/**
 * API Monitoring Endpoint
 * Access at: /api/monitor
 * Returns current API usage statistics across all services
 */
export async function GET() {
  const stats = getApiStats();
  
  // Calculate service-specific usage
  const coingeckoEndpoints = ['coins', 'chart', 'details'];
  const cryptoPanicEndpoints = Object.keys(stats.callsByEndpoint).filter(key => key.startsWith('news-sentiment'));
  const binanceEndpoints = Object.keys(stats.callsByEndpoint).filter(key => 
    key.startsWith('funding-rate') || key.startsWith('market-metrics')
  );
  
  const coingeckoCalls = coingeckoEndpoints.reduce((sum, key) => sum + (stats.callsByEndpoint[key] || 0), 0);
  const cryptoPanicCalls = cryptoPanicEndpoints.reduce((sum, key) => sum + (stats.callsByEndpoint[key] || 0), 0);
  const binanceCalls = binanceEndpoints.reduce((sum, key) => sum + (stats.callsByEndpoint[key] || 0), 0);
  const otherCalls = stats.totalCalls - coingeckoCalls - cryptoPanicCalls - binanceCalls;
  
  // Calculate projections
  const hoursRunning = stats.hoursSinceReset || 1;
  const callsPerHour = stats.totalCalls / hoursRunning;
  const projectedDaily = Math.round(callsPerHour * 24);
  const projectedMonthly = Math.round(projectedDaily * 30);
  
  // Service limits
  const coingeckoMonthlyLimit = 10000;
  const coingeckoDailyTarget = 330;
  const cryptoPanicDailyLimit = 500;
  
  // CoinGecko projections
  const coingeckoPerHour = coingeckoCalls / hoursRunning;
  const coingeckoProjectedDaily = Math.round(coingeckoPerHour * 24);
  const coingeckoProjectedMonthly = Math.round(coingeckoProjectedDaily * 30);
  
  // CryptoPanic projections
  const cryptoPanicPerHour = cryptoPanicCalls / hoursRunning;
  const cryptoPanicProjectedDaily = Math.round(cryptoPanicPerHour * 24);
  
  return NextResponse.json({
    summary: {
      totalCalls: stats.totalCalls,
      hoursSinceReset: stats.hoursSinceReset,
      lastReset: new Date(stats.lastReset).toISOString(),
      callsPerHour: Math.round(callsPerHour * 10) / 10,
    },
    byService: {
      coingecko: {
        calls: coingeckoCalls,
        projectedDaily: coingeckoProjectedDaily,
        projectedMonthly: coingeckoProjectedMonthly,
        dailyTarget: coingeckoDailyTarget,
        monthlyLimit: coingeckoMonthlyLimit,
        status: coingeckoProjectedMonthly > coingeckoMonthlyLimit ? '🚨 OVER LIMIT' :
                coingeckoProjectedDaily > coingeckoDailyTarget ? '⚠️ HIGH' : '✅ OK',
      },
      cryptopanic: {
        calls: cryptoPanicCalls,
        projectedDaily: cryptoPanicProjectedDaily,
        dailyLimit: cryptoPanicDailyLimit,
        remaining: Math.max(0, cryptoPanicDailyLimit - cryptoPanicProjectedDaily),
        status: cryptoPanicProjectedDaily > cryptoPanicDailyLimit ? '🚨 OVER LIMIT' :
                cryptoPanicProjectedDaily > cryptoPanicDailyLimit * 0.8 ? '⚠️ HIGH' : '✅ OK',
      },
      binance: {
        calls: binanceCalls,
        limit: 'Unlimited (with rate limits)',
        status: '✅ OK',
      },
      other: {
        calls: otherCalls,
        note: 'Alternative.me (Fear & Greed) and other free services',
      },
    },
    endpoints: stats.callsByEndpoint,
    overallStatus: 
      coingeckoProjectedMonthly > coingeckoMonthlyLimit || cryptoPanicProjectedDaily > cryptoPanicDailyLimit
        ? '🚨 CRITICAL - Over Limit'
        : coingeckoProjectedDaily > coingeckoDailyTarget * 0.9 || cryptoPanicProjectedDaily > cryptoPanicDailyLimit * 0.8
        ? '⚠️ WARNING - High Usage'
        : '✅ HEALTHY',
  });
}
