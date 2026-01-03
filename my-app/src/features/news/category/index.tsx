'use client';

import React from 'react';
import { useParams } from 'next/navigation';

// Placeholder data - in a real app, this would be fetched based on the category
const categoryNews = {
  bitcoin: [
    { id: 1, title: 'Bitcoin Hits New All-Time High', excerpt: 'Bitcoin soars past previous records, driven by strong institutional interest.' },
    { id: 2, title: 'MicroStrategy Acquires More Bitcoin', excerpt: 'The business intelligence firm continues its bitcoin accumulation strategy.' },
  ],
  altcoins: [
    { id: 1, title: 'Solana Rallies on DeFi Growth', excerpt: 'Solana\'s price has surged following the launch of several new DeFi projects.' },
    { id: 2, title: 'Cardano Releases New Roadmap', excerpt: 'The Cardano team has outlined its development plans for the next year.' },
  ],
  defi: [
      { id: 3, category: 'DeFi', title: 'Total Value Locked in DeFi Reaches a New Milestone', excerpt: 'Over $100 billion is now locked in decentralized finance protocols, signaling massive growth.' },
  ],
  nft: [
      { id: 5, category: 'NFTs', title: 'NFT Marketplace Sees Record Trading Volume', excerpt: 'The market for non-fungible tokens continues to heat up with record sales this month.' },
  ]
};

export const NewsCategoryPage = () => {
  const params = useParams();
  const category = params.category as keyof typeof categoryNews;
  const articles = categoryNews[category] || [];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 capitalize">{category} News</h1>
      <div className="space-y-6">
        {articles.length > 0 ? (
          articles.map((article) => (
            <div key={article.id} className="border-b border-zinc-200 pb-6">
              <h2 className="text-2xl font-bold mt-1 hover:text-blue-600 cursor-pointer">{article.title}</h2>
              <p className="text-zinc-600 mt-2">{article.excerpt}</p>
              <p className="text-xs text-zinc-500 mt-2">Published 1 hour ago</p>
            </div>
          ))
        ) : (
          <p>No news found for this category.</p>
        )}
      </div>
    </div>
  );
};
