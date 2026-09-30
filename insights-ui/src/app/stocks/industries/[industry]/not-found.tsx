import StocksNotFound from '@/components/stocks/StocksNotFound';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'No Stocks Found | KoalaGains',
  description: 'This industry has no US stocks. Browse US stocks by industry on KoalaGains.',
  robots: { index: false, follow: true },
};

/**
 * 404 for a US industry listing (`/stocks/industries/<industry>`). The page
 * calls `notFound()` when the industry is unknown or has no US stocks, so Google gets a
 * real 404 instead of a soft 404.
 */
export default async function IndustryStocksNotFound() {
  return await StocksNotFound({
    title: 'No stocks found in this industry',
    description: "We don't cover any US stocks in this industry yet. Browse our list of US stocks by industry below to find what you're looking for.",
  });
}
