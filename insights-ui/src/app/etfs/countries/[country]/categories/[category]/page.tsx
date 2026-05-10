import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import WithSuspenseEtfListingGrid from '@/components/etfs/WithSuspenseEtfListingGrid';
import { fetchEtfListingData } from '@/utils/etf-data-utils';
import { EtfFilterParamKey, EtfSearchParams } from '@/utils/etf-filter-utils';
import { getEtfGroupName, getEtfCategoryByName } from '@/utils/etf-categorization-utils';
import { isEtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { notFound, redirect } from 'next/navigation';
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
  const decodedCountry = decodeURIComponent(country);
  const decodedCategory = decodeURIComponent(category);
  if (decodedCountry === SupportedCountries.US) redirect(`/etfs/categories/${encodeURIComponent(decodedCategory)}`);
  if (!isEtfSupportedCountry(decodedCountry)) notFound();

  const searchParams = await searchParamsPromise;
  const knownCategory = getEtfCategoryByName(decodedCategory);
  const groupName = getEtfGroupName(decodedCategory);

  const dataPromise = fetchEtfListingData(
    {
      ...searchParams,
      [EtfFilterParamKey.CATEGORY]: decodedCategory,
    },
    decodedCountry
  );

  const description = groupName
    ? `Explore ${decodedCountry} ETFs in the ${decodedCategory} category (${groupName}) with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`
    : `Explore ${decodedCountry} ETFs in the ${decodedCategory} category with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`;

  const encodedCountry = encodeURIComponent(decodedCountry);

  return (
    <EtfPageLayout
      title={`${decodedCategory} ${decodedCountry} ETFs`}
      description={description}
      currentCountry={decodedCountry}
      switcherSection="categories"
      extraBreadcrumbs={[
        { name: 'All Categories', href: `/etfs/countries/${encodedCountry}/categories`, current: false },
        { name: decodedCategory, href: `/etfs/countries/${encodedCountry}/categories/${encodeURIComponent(decodedCategory)}`, current: true },
      ]}
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
