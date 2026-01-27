import { NextResponse } from 'next/server';
import { getApiStats } from '@/utils/apiMonitor';

/**
 * API Monitoring Endpoint
 * Access at: /api/monitor
 * Returns current API usage statistics
 */
export async function GET() {
  const stats = getApiStats();
  
  // Calculate projections
  const hoursRunning = stats.hoursSinceReset || 1;
  const callsPerHour = stats.totalCalls / hoursRunning;
  const projectedDaily = Math.round(callsPerHour * 24);
  const projectedMonthly = Math.round(projectedDaily * 30);
  
  // CoinGecko free tier limit
  const monthlyLimit = 10000;
  const dailyTarget = 330; // ~10,000 / 30 days
  
  return NextResponse.json({
    current: {
      totalCalls: stats.totalCalls,
      byEndpoint: stats.callsByEndpoint,
      hoursSinceReset: stats.hoursSinceReset,
      lastReset: new Date(stats.lastReset).toISOString(),
    },
    projections: {
      callsPerHour: Math.round(callsPerHour * 10) / 10,
      projectedDaily,
      projectedMonthly,
      withinDailyTarget: projectedDaily <= dailyTarget,
      withinMonthlyLimit: projectedMonthly <= monthlyLimit,
    },
    limits: {
      dailyTarget,
      monthlyLimit,
      remainingDaily: Math.max(0, dailyTarget - projectedDaily),
      remainingMonthly: Math.max(0, monthlyLimit - projectedMonthly),
    },
    status: projectedMonthly > monthlyLimit ? '🚨 OVER LIMIT' : 
            projectedMonthly > monthlyLimit * 0.9 ? '⚠️ WARNING' : 
            '✅ HEALTHY',
  });
}
