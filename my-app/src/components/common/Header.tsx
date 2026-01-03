'use client';

import React from 'react';

const marketData = [
  { symbol: 'BTC', price: '$68,123.45', change: '+2.5%' },
  { symbol: 'ETH', price: '_$3,456.78', change: '-1.2%' },
  { symbol: 'SOL', price: '__$150.99', change: '+5.8%' },
  { symbol: 'BNB', price: '__$580.21', change: '+0.5%' },
  { symbol: 'XRP', price: '___$0.52', change: '-3.1%' },
  { symbol: 'DOGE', price: '__$0.158', change: '+1.5%' },
];

export const Header = () => {
  return (
    <header className="bg-zinc-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold">CryptoNews</h1>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          {marketData.map((coin) => (
            <div key={coin.symbol} className="text-sm">
              <span className="font-semibold">{coin.symbol}</span>
              <span className={`ml-2 ${coin.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {coin.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};
