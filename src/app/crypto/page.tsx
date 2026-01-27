'use client';

import React, { useState, useMemo } from 'react';
import { useCryptoData } from '@/hooks/useCryptoData';
import { CoinData } from '@/utils/coingecko';
import Link from 'next/link';
import { CoinChart } from '@/components/crypto/CoinChart';

export default function CryptoPage() {
  const { coins, loading, error, lastUpdated, refresh } = useCryptoData();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'gainers' | 'losers'>('all');

  // Filter and search coins
  const filteredCoins = useMemo(() => {
    let filtered = coins;

    // Apply filter type
    if (filterType === 'gainers') {
      filtered = filtered.filter(coin => coin.price_change_percentage_24h > 0);
    } else if (filterType === 'losers') {
      filtered = filtered.filter(coin => coin.price_change_percentage_24h < 0);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        coin =>
          coin.name.toLowerCase().includes(query) ||
          coin.symbol.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [coins, searchQuery, filterType]);

  const toggleChart = (coinId: string) => {
    setExpandedChart(expandedChart === coinId ? null : coinId);
  };

  if (loading && coins.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cryptocurrency data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
          <p>{error}</p>
          <button
            onClick={refresh}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Cryptocurrency Prices</h1>
        <p className="text-gray-600">
          Real-time data for top 250 cryptocurrencies by market cap
        </p>
        {lastUpdated && (
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search Bitcoin, Ethereum, BNB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={refresh}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Coins
          </button>
          <button
            onClick={() => setFilterType('gainers')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'gainers'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🟢 Gainers
          </button>
          <button
            onClick={() => setFilterType('losers')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'losers'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🔴 Losers
          </button>
          <div className="ml-auto text-gray-600 self-center">
            Showing {filteredCoins.length} coins
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-4 text-left">#</th>
                <th className="px-6 py-4 text-left">Coin</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">24h %</th>
                <th className="px-6 py-4 text-right">Market Cap</th>
                <th className="px-6 py-4 text-right">Volume(24h)</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoins.map((coin) => (
                <React.Fragment key={coin.id}>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-medium">{coin.market_cap_rank}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{coin.name}</div>
                          <div className="text-sm text-gray-500 uppercase">{coin.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      ${coin.current_price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-semibold ${
                        coin.price_change_percentage_24h >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {coin.price_change_percentage_24h >= 0 ? '▲' : '▼'}{' '}
                      {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900 font-medium">
                      ${(coin.market_cap / 1e9).toFixed(2)}B
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900 font-medium">
                      ${(coin.total_volume / 1e9).toFixed(2)}B
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => toggleChart(coin.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                        >
                          📊 {expandedChart === coin.id ? 'Hide' : 'Chart'}
                        </button>
                        <Link
                          href={`/crypto/prediction/${coin.id}`}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-sm"
                        >
                          🔮 Predict
                        </Link>
                      </div>
                    </td>
                  </tr>
                  {expandedChart === coin.id && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <CoinChart coinId={coin.id} coinName={coin.name} days={7} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCoins.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No coins found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
