import CommodityKeyFactsFlags from '@/components/commodity-reports/CommodityKeyFactsFlags';
import CommodityPriceChart from '@/components/commodity-reports/CommodityPriceChart';
import CommodityRadarChart from '@/components/commodity-reports/CommodityRadarChart';
import CommoditySummaryAnalysis from '@/components/commodity-reports/CommoditySummaryAnalysis';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Stack from '@/components/ui/containers/Stack';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import Prose from '@/components/ui/sections/Prose';
import ReportSection from '@/components/ui/sections/ReportSection';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import { CommodityKeyFactsFlag, CommodityKeyFactsProducer, CommodityKeyFactsWayToInvest } from '@/types/commodity/commodity-analysis-types';
import { fetchCommodityWithAllData } from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';
import { loadCommodityPriceHistory } from '@/utils/commodity-price-history-utils';
import { parseMarkdown } from '@/util/parse-markdown';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

type RouteParams = Promise<Readonly<{ slug: string }>>;

async function loadCommodity(slug: string) {
  try {
    return await fetchCommodityWithAllData(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { slug } = await params;
  const commodity = await loadCommodity(slug);
  const name = commodity?.name ?? slug;
  const title = `${name} — Commodity Analysis | KoalaGains`;
  const description = commodity?.metaDescription || `Supply & demand, price & value, volatility & risk, and future outlook analysis for ${name}.`;
  return {
    title,
    description,
    alternates: { canonical: `/commodities/${slug}` },
    openGraph: { title, description, url: `/commodities/${slug}` },
  };
}

export default async function CommodityDetailPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const { slug } = await params;
  const commodity = await loadCommodity(slug);
  if (!commodity) notFound();

  const keyFacts = commodity.keyFactsReport;
  const greenFlags = (keyFacts?.greenFlags as unknown as CommodityKeyFactsFlag[] | null) ?? [];
  const redFlags = (keyFacts?.redFlags as unknown as CommodityKeyFactsFlag[] | null) ?? [];
  const allFlags = [...greenFlags, ...redFlags];
  const mainUses = (keyFacts?.mainUses as unknown as string[] | null) ?? [];
  const topProducers = (keyFacts?.topProducers as unknown as CommodityKeyFactsProducer[] | null) ?? [];
  const waysToInvest = (keyFacts?.waysToInvest as unknown as CommodityKeyFactsWayToInvest[] | null) ?? [];

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'Commodities', href: '/commodities', current: false },
    { name: commodity.name, href: `/commodities/${slug}`, current: true },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} mobileBackOnly={true} />

      <ReportSection>
        <Stack direction="row" justify="between" align="center" gap="md" wrap>
          <Heading as="h1" size="display" weight="semibold">
            {commodity.name}
          </Heading>
          <Stack direction="row" align="center" gap="sm">
            <span className="inline-flex items-center rounded-full bg-sky-500/15 border border-sky-500/40 px-2.5 py-0.5 text-xs font-medium text-sky-300">
              {commodity.commodityGroup}
            </span>
            {commodity.exchange && (
              <Text as="span" size="sm" tone="muted" weight="medium">
                {commodity.exchange}
              </Text>
            )}
          </Stack>
        </Stack>
      </ReportSection>

      <ReportSection spacing="lg">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start">
          <div className="lg:w-1/2">
            <Prose>
              <SectionHeading>Summary</SectionHeading>
              {commodity.summary ? (
                <MarkdownContent variant="summary" html={parseMarkdown(commodity.summary)} />
              ) : (
                <Text tone="muted">The summary for this commodity has not been generated yet.</Text>
              )}
            </Prose>
          </div>
          <div className="lg:w-1/2 flex justify-center">
            <CommodityRadarChart categoryResults={commodity.categoryAnalysisResults} />
          </div>
        </div>

        <Suspense fallback={null}>
          <CommodityPriceChart promise={loadCommodityPriceHistory(commodity)} />
        </Suspense>
      </ReportSection>

      {(mainUses.length > 0 || topProducers.length > 0 || waysToInvest.length > 0) && (
        <ReportSection>
          <SectionHeading>Overview</SectionHeading>
          <Stack gap="md" mt="sm">
            {mainUses.length > 0 && (
              <Text size="sm">
                <strong>Main uses:</strong> {mainUses.join(', ')}
              </Text>
            )}
            {topProducers.length > 0 && (
              <Text size="sm">
                <strong>Top producers:</strong> {topProducers.map((p) => (p.share ? `${p.country} (${p.share})` : p.country)).join(', ')}
              </Text>
            )}
            {waysToInvest.length > 0 && (
              <Text size="sm">
                <strong>Ways to invest:</strong> {waysToInvest.map((w) => `${w.name} (${w.type})`).join(', ')}
              </Text>
            )}
          </Stack>
        </ReportSection>
      )}

      {keyFacts?.keyFacts && (
        <ReportSection>
          <Prose>
            <SectionHeading>Key Facts</SectionHeading>
            <MarkdownContent variant="body" html={parseMarkdown(keyFacts.keyFacts)} />
          </Prose>
        </ReportSection>
      )}

      {allFlags.length > 0 && <CommodityKeyFactsFlags flags={allFlags} />}

      <CommoditySummaryAnalysis slug={slug} categoryResults={commodity.categoryAnalysisResults} />
    </PageWrapper>
  );
}
