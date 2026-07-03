import CommodityRadarChart from '@/components/commodity-reports/CommodityRadarChart';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Stack from '@/components/ui/containers/Stack';
import InlineCard from '@/components/ui/sections/InlineCard';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import Prose from '@/components/ui/sections/Prose';
import ReportSection from '@/components/ui/sections/ReportSection';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import {
  CommodityAnalysisCategory,
  CommodityKeyFactsFlag,
  CommodityKeyFactsProducer,
  CommodityKeyFactsWayToInvest,
  COMMODITY_CATEGORY_NAMES,
  COMMODITY_CATEGORY_TO_PATH,
} from '@/types/commodity/commodity-analysis-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { fetchCommodityWithAllData } from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';
import { parseMarkdown } from '@/util/parse-markdown';
import { prisma } from '@/prisma';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type RouteParams = Promise<Readonly<{ slug: string }>>;

const CATEGORY_ORDER: CommodityAnalysisCategory[] = [
  CommodityAnalysisCategory.SupplyAndDemand,
  CommodityAnalysisCategory.PriceAndValue,
  CommodityAnalysisCategory.VolatilityAndRisk,
  CommodityAnalysisCategory.FutureOutlook,
];

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

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const commodities = await prisma.commodity.findMany({ where: { spaceId: KoalaGainsSpaceId }, select: { slug: true } });
  return commodities.map((c) => ({ slug: c.slug }));
}

function FlagCard({ flag }: { flag: CommodityKeyFactsFlag }): JSX.Element {
  return (
    <InlineCard as="li" padding="factor">
      <Stack gap="sm">
        <Stack direction="row" align="center" gap="sm">
          {flag.result === 'Pass' ? (
            <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
          ) : (
            <XCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
          )}
          <Heading as="h3" size="inherit" weight="semibold" tone="inherit">
            {flag.flag}
          </Heading>
        </Stack>
        <Text size="sm" tone="muted">
          {flag.explanation}
        </Text>
      </Stack>
    </InlineCard>
  );
}

export default async function CommodityDetailPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const { slug } = await params;
  const commodity = await loadCommodity(slug);
  if (!commodity) notFound();

  const keyFacts = commodity.keyFactsReport;
  const greenFlags = (keyFacts?.greenFlags as unknown as CommodityKeyFactsFlag[] | null) ?? [];
  const redFlags = (keyFacts?.redFlags as unknown as CommodityKeyFactsFlag[] | null) ?? [];
  const mainUses = (keyFacts?.mainUses as unknown as string[] | null) ?? [];
  const topProducers = (keyFacts?.topProducers as unknown as CommodityKeyFactsProducer[] | null) ?? [];
  const waysToInvest = (keyFacts?.waysToInvest as unknown as CommodityKeyFactsWayToInvest[] | null) ?? [];

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'Commodities', href: '/commodities', current: false },
    { name: commodity.name, href: `/commodities/${slug}`, current: true },
  ];

  const scoreByCategory: Record<CommodityAnalysisCategory, { pass: number; total: number } | null> = {
    [CommodityAnalysisCategory.SupplyAndDemand]: null,
    [CommodityAnalysisCategory.PriceAndValue]: null,
    [CommodityAnalysisCategory.VolatilityAndRisk]: null,
    [CommodityAnalysisCategory.FutureOutlook]: null,
  };
  for (const result of commodity.categoryAnalysisResults) {
    scoreByCategory[result.categoryKey as CommodityAnalysisCategory] = {
      pass: result.factorResults.filter((fr) => fr.result === 'Pass').length,
      total: result.factorResults.length,
    };
  }

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} mobileBackOnly={true} />

      <ReportSection>
        <Heading as="h1" size="2xl" weight="bold">
          {commodity.name}
        </Heading>
        <Stack direction="row" gap="sm" align="center" mt="sm" wrap>
          <span className="inline-flex items-center rounded-full bg-sky-500/15 border border-sky-500/40 px-2.5 py-0.5 text-xs font-medium text-sky-300">
            {commodity.commodityGroup}
          </span>
          {commodity.priceSymbol && (
            <Text size="sm" tone="muted">
              {commodity.priceSymbol}
            </Text>
          )}
          {commodity.unit && (
            <Text size="sm" tone="muted">
              per {commodity.unit}
            </Text>
          )}
          {commodity.exchange && (
            <Text size="sm" tone="muted">
              {commodity.exchange}
            </Text>
          )}
        </Stack>
      </ReportSection>

      <div className="flex flex-col lg:flex-row gap-6">
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

      {keyFacts?.keyFacts && (
        <ReportSection>
          <Prose>
            <SectionHeading>Key Facts</SectionHeading>
            <MarkdownContent variant="body" html={parseMarkdown(keyFacts.keyFacts)} />
          </Prose>
        </ReportSection>
      )}

      <ReportSection>
        <SectionHeading>Detailed Analysis</SectionHeading>
        <Stack as="ul" gap="md" mt="sm">
          {CATEGORY_ORDER.map((cat) => {
            const score = scoreByCategory[cat];
            const generated = score !== null;
            return (
              <InlineCard as="li" key={cat} padding="factor">
                <Stack direction="row" align="center" justify="between">
                  <Heading as="h3" size="inherit" weight="semibold" tone="inherit">
                    {COMMODITY_CATEGORY_NAMES[cat]}
                  </Heading>
                  {generated ? (
                    <Link href={`/commodities/${slug}/${COMMODITY_CATEGORY_TO_PATH[cat]}`} className="link-color hover:underline text-sm">
                      View analysis ({score.pass}/{score.total}) →
                    </Link>
                  ) : (
                    <Text size="sm" tone="muted">
                      Not generated yet
                    </Text>
                  )}
                </Stack>
              </InlineCard>
            );
          })}
        </Stack>
      </ReportSection>

      {(greenFlags.length > 0 || redFlags.length > 0) && (
        <ReportSection>
          <SectionHeading>Green &amp; Red Flags</SectionHeading>
          <Stack as="ul" gap="md" mt="sm">
            {greenFlags.map((flag, i) => (
              <FlagCard key={`green-${i}`} flag={flag} />
            ))}
            {redFlags.map((flag, i) => (
              <FlagCard key={`red-${i}`} flag={flag} />
            ))}
          </Stack>
        </ReportSection>
      )}

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
    </PageWrapper>
  );
}
