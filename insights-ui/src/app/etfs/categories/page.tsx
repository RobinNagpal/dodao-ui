import EtfCategoriesIndex from '@/components/etfs/EtfCategoriesIndex';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'US ETFs by Category | KoalaGains',
  description:
    'Browse US ETFs by Morningstar-style category — Large Blend, Technology, High Yield Bond, and more. Each card highlights the top-rated ETFs in that category.',
};

export default async function EtfsCategoriesIndexPage() {
  return EtfCategoriesIndex({ country: SupportedCountries.US });
}
