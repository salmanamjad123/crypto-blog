'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { CoinData } from '@/utils/coingecko';

type CryptoContextType = {
  coins: CoinData[];
  setCoins: (coins: CoinData[]) => void;
  lastUpdated: Date | null;
  setLastUpdated: (date: Date) => void;
  isCached: boolean;
  setIsCached: (cached: boolean) => void;
};

const CryptoContext = createContext<CryptoContextType | null>(null);

/**
 * CryptoProvider - Maintains crypto data across page navigation
 * Prevents unnecessary re-fetching when navigating between pages
 */
export function CryptoProvider({ children }: { children: ReactNode }) {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);

  return (
    <CryptoContext.Provider 
      value={{ 
        coins, 
        setCoins, 
        lastUpdated, 
        setLastUpdated,
        isCached,
        setIsCached,
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
}

/**
 * Hook to access crypto context
 * Must be used within CryptoProvider
 */
export const useCryptoContext = () => {
  const context = useContext(CryptoContext);
  if (!context) {
    throw new Error('useCryptoContext must be used within CryptoProvider');
  }
  return context;
};
