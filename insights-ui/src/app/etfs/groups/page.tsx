import EtfGroupsIndex from '@/components/etfs/EtfGroupsIndex';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'US ETFs by Group | KoalaGains',
  description: 'Browse US ETFs organized by analysis group. Each group highlights top-rated ETFs by report score and AUM.',
};

export default async function EtfsGroupsIndexPage() {
  return EtfGroupsIndex({ country: SupportedCountries.US });
}
