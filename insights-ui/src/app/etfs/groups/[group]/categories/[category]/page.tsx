import EtfGroupCategoryDetail from '@/components/etfs/EtfGroupCategoryDetail';
import { EtfSearchParams } from '@/utils/etf-filter-utils';
import { getEtfCategoryByName, getEtfCategoryBySlug, getEtfGroupByKey, slugifyEtfCategory } from '@/utils/etf-categorization-utils';
import { etfGroupCategoryPath } from '@/utils/etf-country-route-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { fetchEtfGroupDetail } from '@/utils/etf-listing-fetchers';
import { groupCategoryDetailRobots } from '@/utils/etf-listing-noindex';
import { generateEtfGroupCategoryListingBreadcrumbJsonLd, generateEtfGroupCategoryListingMetadata } from '@/utils/etf-metadata-generators';
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
  const base = generateEtfGroupCategoryListingMetadata({
    country: SupportedCountries.US,
    groupKey: cat?.group ?? decodedGroup,
    groupName: groupObj?.name ?? decodedGroup,
    categoryName: cat?.name ?? decodedCategory,
  });
  // Unknown category → the page 404s, so there's nothing to index either way.
  if (!cat) return base;
  const groupData = await fetchEtfGroupDetail(SupportedCountries.US, cat.group);
  return { ...base, ...groupCategoryDetailRobots(groupData, cat.name) };
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
  const groupObj = getEtfGroupByKey(decodedGroup);
  const breadcrumb = generateEtfGroupCategoryListingBreadcrumbJsonLd({
    country: SupportedCountries.US,
    groupKey: decodedGroup,
    groupName: groupObj?.name ?? decodedGroup,
    categoryName: resolved.name,
  });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {await EtfGroupCategoryDetail({ country: SupportedCountries.US, groupKey: decodedGroup, category: resolved.name, searchParams })}
    </>
  );
}
