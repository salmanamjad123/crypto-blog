'use client';

import React, { useEffect, useState } from 'react';
import { CoinRate } from '@/lib/types';

interface HeaderProps {
  initialData: CoinRate[] | null; // Accept pre-fetched data
}

export const Header = ({ initialData }: HeaderProps) => {
  const [marketData, setMarketData] = useState<CoinRate[] | null>(initialData);
  const [error, setError] = useState<string | null>(initialData ? null : 'Failed to load initial rates.');
  const [justRefreshed, setJustRefreshed] = useState(false);

  useEffect(() => {
    // If there was no initial data, try fetching on the client once.
    if (!initialData) {
      fetchCoinRates();
    }

    const interval = setInterval(fetchCoinRates, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [initialData]);

  const fetchCoinRates = async () => {
    setError(null);
    try {
      const response = await fetch('/api/crypto-rates');
      if (response.ok) {
        const data = await response.json();
        setMarketData(data);
        setJustRefreshed(true);
        setTimeout(() => setJustRefreshed(false), 500);
      } else {
        console.error('Error fetching coin rates from local proxy');
        setError('Failed to load rates.'); 
      }
    } catch (error) {
      console.error('Error fetching coin rates:', error);
      setError('Could not fetch rates.'); 
    }
  };

  return (
    <header className="bg-zinc-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold">CryptoNews</h1>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          {!marketData && !error && <p>Loading rates...</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {marketData && (
            <>
              <div className="flex items-center space-x-2 text-sm">
                <span className={`h-2 w-2 rounded-full transition-colors duration-500 ${justRefreshed ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                <span>Live</span>
              </div>
              {marketData.map((coin) => (
                <div key={coin.symbol} className="text-sm">
                  <span className="font-semibold">{coin.symbol}</span>
                  <span className={`ml-2 ${coin.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${coin.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
