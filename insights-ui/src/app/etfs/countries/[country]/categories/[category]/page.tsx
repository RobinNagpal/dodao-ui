import EtfCategoryDetail from '@/components/etfs/EtfCategoryDetail';
import { EtfSearchParams } from '@/utils/etf-filter-utils';
import { resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string; category: string }>;
  searchParams: Promise<EtfSearchParams>;
};

export async function generateMetadata(props: { params: Promise<{ country: string; category: string }> }): Promise<Metadata> {
  const { country, category } = await props.params;
  const decodedCountry = decodeURIComponent(country);
  const decodedCategory = decodeURIComponent(category);
  return {
    title: `${decodedCategory} ${decodedCountry} ETFs | KoalaGains`,
    description: `Browse ${decodedCountry} ETFs in the ${decodedCategory} category with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
  };
}

export default async function CountryEtfsByCategoryPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { country, category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const decodedCountry = resolveEtfCountryParam(country, `/etfs/categories/${encodeURIComponent(decodedCategory)}`);

  const searchParams = await searchParamsPromise;
  return EtfCategoryDetail({ country: decodedCountry, category: decodedCategory, searchParams });
}
