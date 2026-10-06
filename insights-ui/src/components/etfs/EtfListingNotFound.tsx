import EtfsNotFound from '@/components/etfs/EtfsNotFound';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'No ETFs Found | KoalaGains',
  description: 'This ETF listing has no ETFs. Browse US ETFs by asset class on KoalaGains.',
  robots: { index: false, follow: true },
};

/**
 * Generic 404 for ETF listing pages (provider / asset class / group / category, US or per-country).
 * Those pages call `notFound()` when the listing is confirmed empty, so Google gets a real 404
 * instead of a soft 404. Re-exported as `not-found.tsx` from each listing route folder.
 */
export default async function EtfListingNotFound() {
  return await EtfsNotFound({
    title: 'No ETFs found for this listing',
    description:
      "This ETF listing doesn't have any ETFs right now. It may be a provider, category, or asset class we don't cover in this country yet. Browse US ETFs by asset class below to find what you're looking for.",
  });
}
