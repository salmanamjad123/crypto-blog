'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CoinRate } from '@/lib/types';

interface HeaderProps {
  initialData?: CoinRate[];
}

export const Header = ({ initialData }: HeaderProps) => {
  const [tickerData, setTickerData] = useState<CoinRate[] | null>(initialData || null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!initialData) {
      const fetchTicker = async () => {
        try {
          const res = await fetch('/api/crypto-rates');
          if (!res.ok) throw new Error('Failed to fetch');
          const data = await res.json();
          setTickerData(data);
        } catch (error) {
          console.error("Error fetching ticker data:", error);
          setTickerData([]); // Set to empty array on error to prevent loading state
        }
      };
      fetchTicker();
    }
  }, [initialData]);

  return (
    <header className="bg-gray-900 text-white shadow-lg">
      {/* Top bar with crypto tickers */}
      <div className="bg-gray-800 py-2 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
            {tickerData === null ? (
              <p className="text-sm text-gray-400">Loading rates...</p>
            ) : (
              tickerData.map(coin => (
                <div key={coin.id} className="flex-shrink-0 text-sm">
                  <span className="font-bold uppercase">{coin.symbol}</span>
                  <span className={`ml-2 ${coin.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${coin.price.toLocaleString()}
                  </span>
                </div>
              ))
            )}
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
          <Link href="/prediction" className="hover:text-cyan-400 transition-colors">Prediction</Link>
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
            <Link href="/prediction" onClick={() => setIsMenuOpen(false)} className="hover:text-cyan-400 transition-colors">Prediction</Link>
          </div>
        </div>
      )}
    </header>
  );
};
