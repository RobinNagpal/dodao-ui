import EtfCategoriesIndex from '@/components/etfs/EtfCategoriesIndex';
import { resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { country } = await props.params;
  const decoded = decodeURIComponent(country);
  return {
    title: `${decoded} ETFs by Category | KoalaGains`,
    description: `Browse ${decoded} ETFs by Morningstar-style category — Large Blend, Technology, High Yield Bond, and more. Each card highlights the top-rated ETFs in that category.`,
  };
}

export default async function CountryEtfsCategoriesIndexPage({ params }: PageProps) {
  const { country } = await params;
  const decoded = resolveEtfCountryParam(country, '/etfs/categories');
  return EtfCategoriesIndex({ country: decoded });
}
