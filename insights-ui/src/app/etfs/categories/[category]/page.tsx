import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import WithSuspenseEtfListingGrid from '@/components/etfs/WithSuspenseEtfListingGrid';
import { fetchEtfListingData } from '@/utils/etf-data-utils';
import { EtfFilterParamKey, EtfSearchParams } from '@/utils/etf-filter-utils';
import { getEtfGroupName, getEtfCategoryByName } from '@/utils/etf-categorization-utils';
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
  const decodedCategory = decodeURIComponent(category);

  // If we recognize the category, surface its parent group in the layout context.
  const knownCategory = getEtfCategoryByName(decodedCategory);
  const groupName = getEtfGroupName(decodedCategory);

  const dataPromise = fetchEtfListingData({
    ...searchParams,
    [EtfFilterParamKey.CATEGORY]: decodedCategory,
  });

  const description = groupName
    ? `Explore US ETFs in the ${decodedCategory} category (${groupName}) with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`
    : `Explore US ETFs in the ${decodedCategory} category with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`;

  return (
    <EtfPageLayout
      title={`${decodedCategory} ETFs`}
      description={description}
      extraBreadcrumbs={[{ name: decodedCategory, href: `/etfs/categories/${encodeURIComponent(decodedCategory)}`, current: true }]}
    >
      {knownCategory && groupName && (
        <p className="text-sm text-gray-400 -mt-4 mb-4">
          Part of <span className="text-white">{groupName}</span>
        </p>
      )}
      <WithSuspenseEtfListingGrid dataPromise={dataPromise} />
    </EtfPageLayout>
  );
}
