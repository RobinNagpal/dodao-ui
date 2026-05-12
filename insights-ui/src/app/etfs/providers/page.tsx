import EtfProvidersIndex from '@/components/etfs/EtfProvidersIndex';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'US ETFs by Provider | KoalaGains',
  description: 'Browse US ETFs grouped by issuer. Each card highlights the top-rated ETFs from that provider.',
};

export default async function EtfsProvidersIndexPage() {
  return EtfProvidersIndex({ country: SupportedCountries.US });
}
