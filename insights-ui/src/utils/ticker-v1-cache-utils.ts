import { revalidateTag } from 'next/cache';

/** Cache tag helpers for per-ticker revalidation */
const TICKER_EXCHANGE_TAG_PREFIX = 'ticker_exchange:' as const;

export const TICKERS_TAG = 'tickers' as const;

export const tickerAndExchangeTag = (t: string, exchange: string): `${typeof TICKER_EXCHANGE_TAG_PREFIX}${string}` =>
  `${TICKER_EXCHANGE_TAG_PREFIX}_${t.toUpperCase()}_${exchange.toUpperCase()}`;

export const revalidateTickerAndExchangeTag = (ticker: string, exchange: string) => revalidateTag(tickerAndExchangeTag(ticker, exchange));

export const revalidateTickersTag = () => revalidateTag(TICKERS_TAG);

export const revalidateIndustry = (industryKey: string) => revalidateTag(`TICKERS_TAG:${industryKey}`);
