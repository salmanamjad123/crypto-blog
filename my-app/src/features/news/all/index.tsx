'use client';

import React from 'react';

// Placeholder data for news articles
const allNews = [
  { id: 1, category: 'Bitcoin', title: 'Bitcoin Surges Past $70,000 Amidst Market Frenzy', excerpt: 'Institutional buying and positive market sentiment have pushed Bitcoin to a new all-time high.' },
  { id: 2, category: 'Ethereum', title: "Ethereum Devs Announce Details for 'Prague' Upgrade", excerpt: 'The next major upgrade for Ethereum will focus on scalability and security enhancements.' },
  { id: 3, category: 'DeFi', title: 'Total Value Locked in DeFi Reaches a New Milestone', excerpt: 'Over $100 billion is now locked in decentralized finance protocols, signaling massive growth.' },
  { id: 4, category: 'Regulation', title: "SEC Chairman Comments on Cryptocurrency Regulation", excerpt: "Gary Gensler outlined the SEC's stance on digital assets in a recent public address." },
  { id: 5, category: 'NFTs', title: 'NFT Marketplace Sees Record Trading Volume', excerpt: 'The market for non-fungible tokens continues to heat up with record sales this month.' },
  { id: 6, category: 'Altcoins', title: 'Solana Ecosystem Expands with New dApps', excerpt: 'A new wave of decentralized applications is launching on the Solana blockchain.' },
];

export const AllNewsPage = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">All News</h1>
      <div className="space-y-6">
        {allNews.map((article) => (
          <div key={article.id} className="border-b border-zinc-200 pb-6">
            <p className="text-sm text-blue-500 font-semibold">{article.category}</p>
            <h2 className="text-2xl font-bold mt-1 hover:text-blue-600 cursor-pointer">{article.title}</h2>
            <p className="text-zinc-600 mt-2">{article.excerpt}</p>
            <p className="text-xs text-zinc-500 mt-2">Published 2 hours ago</p>
          </div>
        ))}
      </div>
    </div>
  );
};
