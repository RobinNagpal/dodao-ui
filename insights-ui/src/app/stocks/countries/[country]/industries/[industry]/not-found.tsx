import StocksNotFound from '@/components/stocks/StocksNotFound';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'No Stocks Found | KoalaGains',
  description: 'This industry has no stocks in this country. Browse US stocks by industry on KoalaGains.',
  robots: { index: false, follow: true },
};

/**
 * 404 for a country industry listing (`/stocks/countries/<country>/industries/<industry>`). The page
 * calls `notFound()` when the industry is unknown or has no stocks in that country, so Google gets a
 * real 404 instead of a soft 404.
 */
export default async function CountryIndustryStocksNotFound() {
  return await StocksNotFound({
    title: 'No stocks found in this industry',
    description:
      "We don't cover any stocks in this industry for this country yet. Browse our list of US stocks by industry below to find what you're looking for.",
  });
}
