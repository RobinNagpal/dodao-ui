import StocksNotFound from '@/components/stocks/StocksNotFound';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stock Not Found | KoalaGains',
  description: 'The stock you are looking for could not be found. Browse US stocks by industry to discover other companies.',
  robots: { index: false, follow: true },
};

export default async function StockTickerNotFound() {
  return await StocksNotFound({
    title: 'Stock not found',
    description:
      "We couldn't find a stock matching this URL. It may have been delisted, the ticker may have changed, or the link may be mistyped. Browse our list of US stocks by industry below to find what you're looking for.",
  });
}
