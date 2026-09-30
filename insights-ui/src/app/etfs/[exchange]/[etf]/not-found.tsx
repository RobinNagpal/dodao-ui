import EtfsNotFound from '@/components/etfs/EtfsNotFound';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ETF Not Found | KoalaGains',
  description: 'The ETF you are looking for could not be found. Browse US ETFs by asset class to discover other funds.',
  robots: { index: false, follow: true },
};

export default async function EtfNotFound() {
  return await EtfsNotFound({
    title: 'ETF not found',
    description:
      "We couldn't find an ETF matching this URL. It may have been delisted, the symbol may have changed, or the link may be mistyped. Browse US ETFs by asset class below to find what you're looking for.",
  });
}
