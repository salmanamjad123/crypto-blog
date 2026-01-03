'use client';

import React from 'react';

export const HomePage = () => {
  return (
    <div className="w-full">
      <div className="w-full bg-zinc-900 text-white py-20 px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">Crypto News Central</h1>
        <p className="text-xl text-zinc-400">Your one-stop shop for all things crypto.</p>
      </div>
      
      <div className="p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder for news articles */}
          <div className="border border-zinc-200 rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-2">Bitcoin Hits New All-Time High</h3>
            <p className="text-zinc-600">Bitcoin surged past $70,000, driven by institutional investment and market optimism.</p>
          </div>
          <div className="border border-zinc-200 rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-2">Ethereum's Next Upgrade Announced</h3>
            <p className="text-zinc-600">The Ethereum Foundation has detailed the upcoming "Prague" upgrade, focusing on scalability.</p>
          </div>
          <div className="border border-zinc-200 rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-2">DeFi Protocols See Record Inflow</h3>
            <p className="text-zinc-600">Decentralized finance platforms have attracted billions in new capital this quarter.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
