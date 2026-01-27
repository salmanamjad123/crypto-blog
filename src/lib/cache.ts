import { CoinRate } from './types';

/**
 * A simple in-memory cache to store cryptocurrency data.
 * This object will persist across requests in a single server instance.
 */
interface Cache {
  data: CoinRate[] | null;
  timestamp: number;
}

export const cryptoCache: Cache = {
  data: null,
  timestamp: 0,
};
