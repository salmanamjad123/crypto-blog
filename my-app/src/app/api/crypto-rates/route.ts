import { NextResponse } from 'next/server';
import { getCryptoRates } from '@/lib/crypto';

/**
 * API endpoint to serve cryptocurrency rates.
 * It uses the shared getCryptoRates function which has built-in caching.
 */
export async function GET() {
  const rates = await getCryptoRates();
  
  if (rates) {
    return NextResponse.json(rates);
  } else {
    return new NextResponse('Failed to fetch crypto rates.', { status: 500 });
  }
}
