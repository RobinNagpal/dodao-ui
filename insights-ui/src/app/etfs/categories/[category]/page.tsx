import EtfCategoryDetail from '@/components/etfs/EtfCategoryDetail';
import { EtfSearchParams } from '@/utils/etf-filter-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<EtfSearchParams>;
};

export async function generateMetadata(props: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await props.params;
  const decoded = decodeURIComponent(category);
  return {
    title: `${decoded} ETFs | KoalaGains`,
    description: `Browse US ETFs in the ${decoded} category with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
  };
}

export default async function EtfsByCategoryPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { category } = await params;
  const searchParams = await searchParamsPromise;
  return EtfCategoryDetail({ country: SupportedCountries.US, category: decodeURIComponent(category), searchParams });
}
