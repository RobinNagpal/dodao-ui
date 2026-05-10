import EtfAssetClassesIndex from '@/components/etfs/EtfAssetClassesIndex';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'US ETFs by Asset Class | KoalaGains',
  description:
    'Browse US ETFs by asset class — Equity, Fixed Income, Commodity, Alternatives, and more. Each card highlights the top-rated ETFs in that class.',
};

export default async function EtfsAssetClassesIndexPage() {
  return EtfAssetClassesIndex({ country: SupportedCountries.US });
}
