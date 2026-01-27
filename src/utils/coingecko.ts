// CoinGecko API utility with smart caching
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface ChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface CoinDetails {
  id: string;
  symbol: string;
  name: string;
  description: {
    en: string;
  };
  image: {
    large: string;
  };
  market_data: {
    current_price: {
      usd: number;
      pkr: number;
    };
    market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
  };
}

// Fetch top coins with market data
export const fetchCoins = async (
  page: number = 1,
  perPage: number = 250,
  vsCurrency: string = 'usd'
): Promise<CoinData[]> => {
  const url = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=${vsCurrency}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch coins');
  }
  
  return response.json();
};

// Fetch chart data for a specific coin
export const fetchCoinChart = async (
  coinId: string,
  days: number = 7,
  vsCurrency: string = 'usd'
): Promise<ChartData> => {
  const url = `${COINGECKO_BASE_URL}/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch chart data');
  }
  
  return response.json();
};

// Fetch detailed coin information
export const fetchCoinDetails = async (coinId: string): Promise<CoinDetails> => {
  const url = `${COINGECKO_BASE_URL}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch coin details');
  }
  
  return response.json();
};

// Simple price update (lighter endpoint)
export const fetchSimplePrice = async (
  coinIds: string[],
  vsCurrencies: string[] = ['usd', 'pkr']
): Promise<Record<string, Record<string, number>>> => {
  const url = `${COINGECKO_BASE_URL}/simple/price?ids=${coinIds.join(',')}&vs_currencies=${vsCurrencies.join(',')}&include_24hr_change=true`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch prices');
  }
  
  return response.json();
};
