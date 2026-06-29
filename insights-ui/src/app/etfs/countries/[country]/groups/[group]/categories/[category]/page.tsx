import EtfGroupCategoryDetail from '@/components/etfs/EtfGroupCategoryDetail';
import { EtfSearchParams } from '@/utils/etf-filter-utils';
import { getEtfCategoryByName, getEtfCategoryBySlug, getEtfGroupByKey, slugifyEtfCategory } from '@/utils/etf-categorization-utils';
import { etfGroupCategoryPath, resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { fetchEtfGroupDetail } from '@/utils/etf-listing-fetchers';
import { groupCategoryDetailRobots } from '@/utils/etf-listing-noindex';
import { generateEtfGroupCategoryListingBreadcrumbJsonLd, generateEtfGroupCategoryListingMetadata } from '@/utils/etf-metadata-generators';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string; group: string; category: string }>;
  searchParams: Promise<EtfSearchParams>;
};

export async function generateMetadata(props: { params: Promise<{ country: string; group: string; category: string }> }): Promise<Metadata> {
  const { country, group, category } = await props.params;
  const decodedGroup = decodeURIComponent(group);
  const decodedCategory = decodeURIComponent(category);
  const cat = getEtfCategoryBySlug(decodedCategory) ?? getEtfCategoryByName(decodedCategory);
  const decodedCountry = resolveEtfCountryParam(country, etfGroupCategoryPath(SupportedCountries.US, cat?.group ?? decodedGroup, cat?.name ?? decodedCategory));
  const groupObj = getEtfGroupByKey(decodedGroup);
  const base = generateEtfGroupCategoryListingMetadata({
    country: decodedCountry,
    groupKey: cat?.group ?? decodedGroup,
    groupName: groupObj?.name ?? decodedGroup,
    categoryName: cat?.name ?? decodedCategory,
  });
  // Unknown category → the page 404s, so there's nothing to index either way.
  if (!cat) return base;
  const groupData = await fetchEtfGroupDetail(decodedCountry, cat.group);
  return { ...base, ...groupCategoryDetailRobots(groupData, cat.name) };
}

export default async function CountryEtfsByGroupCategoryPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { country, group, category } = await params;
  const decodedGroupKey = decodeURIComponent(group);
  const decodedCategory = decodeURIComponent(category);

  const resolved = getEtfCategoryBySlug(decodedCategory) ?? getEtfCategoryByName(decodedCategory);
  if (!resolved) notFound();

  const decodedCountry = resolveEtfCountryParam(country, etfGroupCategoryPath(SupportedCountries.US, resolved.group, resolved.name));
  if (decodedCategory !== slugifyEtfCategory(resolved.name)) {
    permanentRedirect(etfGroupCategoryPath(decodedCountry, resolved.group, resolved.name));
  }

  const searchParams = await searchParamsPromise;
  const groupObj = getEtfGroupByKey(decodedGroupKey);
  const breadcrumb = generateEtfGroupCategoryListingBreadcrumbJsonLd({
    country: decodedCountry,
    groupKey: decodedGroupKey,
    groupName: groupObj?.name ?? decodedGroupKey,
    categoryName: resolved.name,
  });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {await EtfGroupCategoryDetail({ country: decodedCountry, groupKey: decodedGroupKey, category: resolved.name, searchParams })}
    </>
  );
}
