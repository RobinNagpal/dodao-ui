import EtfGroupCategoryDetail from '@/components/etfs/EtfGroupCategoryDetail';
import { EtfSearchParams } from '@/utils/etf-filter-utils';
import { getEtfCategoryByName, getEtfCategoryBySlug, getEtfGroupByKey, slugifyEtfCategory } from '@/utils/etf-categorization-utils';
import { etfGroupCategoryPath } from '@/utils/etf-country-route-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ group: string; category: string }>;
  searchParams: Promise<EtfSearchParams>;
};

export async function generateMetadata(props: { params: Promise<{ group: string; category: string }> }): Promise<Metadata> {
  const { group, category } = await props.params;
  const decodedGroup = decodeURIComponent(group);
  const decodedCategory = decodeURIComponent(category);
  const groupObj = getEtfGroupByKey(decodedGroup);
  const cat = getEtfCategoryBySlug(decodedCategory) ?? getEtfCategoryByName(decodedCategory);
  const categoryName = cat?.name ?? decodedCategory;
  const groupName = groupObj?.name ?? decodedGroup;
  return {
    title: `${categoryName} ETFs | KoalaGains`,
    description: `Browse US ETFs in the ${categoryName} category (part of ${groupName}) with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
  };
}

export default async function EtfGroupCategoryPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { group, category } = await params;
  const decodedGroup = decodeURIComponent(group);
  const decodedCategory = decodeURIComponent(category);

  const resolved = getEtfCategoryBySlug(decodedCategory) ?? getEtfCategoryByName(decodedCategory);
  if (!resolved) notFound();
  if (decodedCategory !== slugifyEtfCategory(resolved.name)) {
    permanentRedirect(etfGroupCategoryPath(SupportedCountries.US, resolved.group, resolved.name));
  }

  const searchParams = await searchParamsPromise;
  return EtfGroupCategoryDetail({
    country: SupportedCountries.US,
    groupKey: decodedGroup,
    category: resolved.name,
    searchParams,
  });
}
