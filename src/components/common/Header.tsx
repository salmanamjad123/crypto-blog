'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { CoinRate } from '@/lib/types';

interface HeaderProps {
  initialData?: CoinRate[];
}

// Binance symbol mapping
const BINANCE_SYMBOLS = {
  'btcusdt': { id: 'bitcoin', symbol: 'BTC' },
  'ethusdt': { id: 'ethereum', symbol: 'ETH' },
  'solusdt': { id: 'solana', symbol: 'SOL' },
  'bnbusdt': { id: 'binancecoin', symbol: 'BNB' },
  'xrpusdt': { id: 'ripple', symbol: 'XRP' },
  'dogeusdt': { id: 'dogecoin', symbol: 'DOGE' },
};

export const Header = ({ initialData }: HeaderProps) => {
  const [tickerData, setTickerData] = useState<CoinRate[]>(initialData || []);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pricesRef = useRef<{ [key: string]: CoinRate }>({});

  useEffect(() => {
    // Initialize with default data if no initial data
    if (!initialData && tickerData.length === 0) {
      const defaultData: CoinRate[] = Object.values(BINANCE_SYMBOLS).map(coin => ({
        id: coin.id,
        symbol: coin.symbol,
        price: 0,
        change: 0,
      }));
      setTickerData(defaultData);
    }

    // Connect to Binance WebSocket for real-time prices
    const connectWebSocket = () => {
      try {
        const streams = Object.keys(BINANCE_SYMBOLS).map(s => `${s}@ticker`).join('/');
        const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
        
        ws.onopen = () => {
          console.log('📡 WebSocket connected - Real-time prices active');
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.data) {
              const data = message.data;
              const symbolLower = data.s.toLowerCase();
              const coinInfo = BINANCE_SYMBOLS[symbolLower as keyof typeof BINANCE_SYMBOLS];
              
              if (coinInfo) {
                // Update prices ref
                pricesRef.current[coinInfo.id] = {
                  id: coinInfo.id,
                  symbol: coinInfo.symbol,
                  price: parseFloat(data.c), // Current price
                  change: parseFloat(data.P), // 24h price change percentage
                };

                // Update state with all current prices
                setTickerData(Object.values(pricesRef.current));
              }
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('📡 WebSocket disconnected - Attempting to reconnect...');
          // Attempt to reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        // Fallback to REST API if WebSocket fails
        fetchFallbackData();
      }
    };

    // Fallback to REST API if WebSocket fails
    const fetchFallbackData = async () => {
      try {
        const res = await fetch('/api/crypto-rates');
        if (res.ok) {
          const data = await res.json();
          setTickerData(data);
        }
      } catch (error) {
        console.error('Error fetching fallback data:', error);
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [initialData]);

  return (
    <header className="bg-gray-900 text-white shadow-lg">
      {/* Top bar with crypto tickers */}
      <div className="bg-gray-800 py-2 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
            {tickerData.length === 0 ? (
              <p className="text-sm text-gray-400">Loading rates...</p>
            ) : (
              tickerData.map(coin => (
                <div key={coin.id} className="flex-shrink-0 text-sm">
                  <span className="font-bold uppercase">{coin.symbol}</span>
                  <span className={`ml-2 transition-colors duration-300 ${coin.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${coin.price > 0 ? coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '...'}
                  </span>
                  <span className={`ml-1 text-xs ${coin.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {coin.price > 0 && `(${coin.change >= 0 ? '+' : ''}${coin.change.toFixed(2)}%)`}
                  </span>
                </div>
              ))
            )}
            <div className="flex-shrink-0 text-xs text-gray-500">
              🔴 Live
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold">
          <Link href="/">CryptoNews</Link>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
          <Link href="/news" className="hover:text-cyan-400 transition-colors">News</Link>
          <Link href="/blogs" className="hover:text-cyan-400 transition-colors">Blogs</Link>
          <Link href="/crypto" className="hover:text-cyan-400 transition-colors">Crypto + Predictions</Link>
          {/* <Link href="/prediction" className="hover:text-cyan-400 transition-colors">Prediction</Link> */}
        </div>
        <div className="md:hidden">
          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
            </svg>
          </button>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-3">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="hover:text-cyan-400 transition-colors">Home</Link>
            <Link href="/news" onClick={() => setIsMenuOpen(false)} className="hover:text-cyan-400 transition-colors">News</Link>
            <Link href="/blogs" onClick={() => setIsMenuOpen(false)} className="hover:text-cyan-400 transition-colors">Blogs</Link>
            <Link href="/crypto" onClick={() => setIsMenuOpen(false)} className="hover:text-cyan-400 transition-colors">Crypto</Link>
            <Link href="/prediction" onClick={() => setIsMenuOpen(false)} className="hover:text-cyan-400 transition-colors">Prediction</Link>
          </div>
        </div>
      )}
    </header>
  );
};
