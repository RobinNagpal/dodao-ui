import { Prisma } from '@prisma/client';

/**
 * Tickers whose pages are live. Deleted tickers 404 and moved tickers (movedExchange/movedSymbol set)
 * 308 to their new listing, so neither belongs in a sitemap. Used by the main stock sitemap and, as
 * `ticker: { is: LIVE_TICKER_WHERE }`, by every stock report sub-page sitemap.
 */
export const LIVE_TICKER_WHERE: Prisma.TickerV1WhereInput = {
  isDeleted: false,
  movedExchange: null,
  movedSymbol: null,
};
