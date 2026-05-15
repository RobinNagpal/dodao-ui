import EtfGroupCategoryDetail from '@/components/etfs/EtfGroupCategoryDetail';
import { EtfSearchParams } from '@/utils/etf-filter-utils';
import { getEtfCategoryByName, getEtfGroupByKey } from '@/utils/etf-categorization-utils';
import { etfGroupCategoryPath, resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string; group: string; category: string }>;
  searchParams: Promise<EtfSearchParams>;
};

export async function generateMetadata(props: { params: Promise<{ country: string; group: string; category: string }> }): Promise<Metadata> {
  const { country, group, category } = await props.params;
  const decodedCountry = decodeURIComponent(country);
  const decodedGroup = decodeURIComponent(group);
  const decodedCategory = decodeURIComponent(category);
  const groupObj = getEtfGroupByKey(decodedGroup);
  const cat = getEtfCategoryByName(decodedCategory);
  const categoryName = cat?.name ?? decodedCategory;
  const groupName = groupObj?.name ?? decodedGroup;
  return {
    title: `${categoryName} ${decodedCountry} ETFs | KoalaGains`,
    description: `Browse ${decodedCountry} ETFs in the ${categoryName} category (part of ${groupName}) with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
  };
}

export default async function CountryEtfsByGroupCategoryPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { country, group, category } = await params;
  const decodedGroupKey = decodeURIComponent(group);
  const decodedCategory = decodeURIComponent(category);
  const decodedCountry = resolveEtfCountryParam(country, etfGroupCategoryPath(SupportedCountries.US, decodedGroupKey, decodedCategory));

  const searchParams = await searchParamsPromise;
  return EtfGroupCategoryDetail({
    country: decodedCountry,
    groupKey: decodedGroupKey,
    category: decodedCategory,
    searchParams,
  });
}
