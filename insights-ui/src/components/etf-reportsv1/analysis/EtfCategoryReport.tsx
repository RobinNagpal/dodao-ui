import { EtfCategoryAnalysisResultResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis/route';
import EtfMetadataBadges from '@/components/etf-reportsv1/EtfMetadataBadges';
import EtfRelatedSections from '@/components/etf-reportsv1/EtfRelatedSections';
import SimilarEtfs from '@/components/etf-reportsv1/SimilarEtfs';
import Heading from '@/components/ui/Heading';
import PassFailBadge from '@/components/ui/PassFailBadge';
import Text from '@/components/ui/Text';
import Stack from '@/components/ui/containers/Stack';
import InlineCard from '@/components/ui/sections/InlineCard';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import Prose from '@/components/ui/sections/Prose';
import ReportArticleShell from '@/components/ui/sections/ReportArticleShell';
import ReportFooter from '@/components/ui/sections/ReportFooter';
import ReportSection from '@/components/ui/sections/ReportSection';
import ReportSectionHeader from '@/components/ui/sections/ReportSectionHeader';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import type { SimilarEtf } from '@/types/etf/etf-detail-response-types';
import { findFactorDefinition } from '@/utils/etf-analysis-reports/etf-analysis-factor-utils';
import { parseMarkdown } from '@/util/parse-markdown';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { ReactNode, Suspense } from 'react';

const PASS_RESULT = 'Pass';

function getFactorTitle(categoryKey: string, factorKey: string): string {
  const category = categoryKey as EtfAnalysisCategory;
  const factor = findFactorDefinition(category, factorKey);
  return factor?.factorAnalysisTitle || factorKey;
}

export interface EtfCategoryReportProps {
  etfName: string;
  symbol: string;
  exchange: string;
  categoryResult: EtfCategoryAnalysisResultResponse;
  analysisTitle: string;
  categoryBadgeText: string;
  categoryBadgeClassName: string;
  updatedAt?: string;
  assetClass?: string | null;
  fundCategory?: string | null;
  issuer?: string | null;
  indexName?: string | null;
  /** Slug of the current sibling page (e.g. "performance-returns"). When set, renders a related-sections nav before the footer. */
  currentSlug?: string;
  /** Promise of sibling-page slugs with publishable content. Unwrapped via Suspense so first paint isn't blocked on it. */
  availableSlugsPromise?: Promise<string[]>;
  /** Optional content rendered immediately after the Executive Summary section. */
  afterSummaryContent?: ReactNode;
  /**
   * Peer ETFs (from the `/similar-etfs` endpoint). When non-empty, a "Similar ETFs"
   * comparison table renders after the report body. Fetched alongside the category
   * data on the page — no Suspense here, since the page already awaits its primary
   * data as a unit (unlike the main detail page, which streams `/full-render`).
   */
  similarEtfs?: ReadonlyArray<SimilarEtf>;
}

export default function EtfCategoryReport({
  etfName,
  symbol,
  exchange,
  categoryResult,
  analysisTitle,
  categoryBadgeText,
  categoryBadgeClassName,
  updatedAt,
  assetClass,
  fundCategory,
  issuer,
  indexName,
  currentSlug,
  availableSlugsPromise,
  afterSummaryContent,
  similarEtfs,
}: EtfCategoryReportProps): JSX.Element | null {
  if (!categoryResult) return null;

  const modifiedDate = new Date(updatedAt || new Date());
  const formattedModifiedDate = modifiedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const passCount = categoryResult.factorResults?.filter((fr) => fr.result === PASS_RESULT).length || 0;
  const totalCount = categoryResult.factorResults?.length || 0;

  return (
    <>
      <ReportArticleShell datePublished={modifiedDate}>
        <ReportSectionHeader
          title={etfName}
          symbol={symbol}
          exchange={exchange}
          score={{ pass: passCount, total: totalCount }}
          modifiedDate={modifiedDate}
          formattedModifiedDate={formattedModifiedDate}
          actionHref={`/etfs/${exchange}/${symbol}`}
        >
          <EtfMetadataBadges exchange={exchange} assetClass={assetClass} category={fundCategory} issuer={issuer} indexName={indexName} className="mt-3" />
        </ReportSectionHeader>

        <Prose>
          <ReportSection>
            <SectionHeading>Analysis Title</SectionHeading>
            <Text as="p" size="inherit" tone="theme" itemProp="description">
              {analysisTitle}
            </Text>
          </ReportSection>

          <ReportSection>
            <SectionHeading>Executive Summary</SectionHeading>
            <MarkdownContent variant="summary" itemProp="abstract" html={categoryResult.summary ? parseMarkdown(categoryResult.summary) : ''} />
          </ReportSection>

          {afterSummaryContent}

          {categoryResult.overallAnalysisDetails && (
            <ReportSection itemProp="articleBody">
              <SectionHeading>Comprehensive Analysis</SectionHeading>
              <MarkdownContent variant="body" html={parseMarkdown(categoryResult.overallAnalysisDetails)} />
            </ReportSection>
          )}

          {categoryResult.factorResults && categoryResult.factorResults.length > 0 && (
            <ReportSection>
              <SectionHeading>Factor Analysis</SectionHeading>
              <Stack as="ul" gap="md" mt="sm">
                {categoryResult.factorResults.map((factor) => (
                  <InlineCard as="li" key={factor.factorKey} padding="factor">
                    <Stack gap="sm">
                      <Stack direction="row" align="center" justify="between">
                        <Stack direction="row" align="center" gap="sm">
                          {factor.result === PASS_RESULT ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                          )}
                          <Heading as="h3" size="inherit" weight="semibold" tone="inherit">
                            {getFactorTitle(categoryResult.categoryKey, factor.factorKey)}
                          </Heading>
                        </Stack>
                        <PassFailBadge passed={factor.result === PASS_RESULT} className="font-medium" passLabel={factor.result} failLabel={factor.result} />
                      </Stack>
                      <Text size="sm" tone="muted">
                        {factor.oneLineExplanation}
                      </Text>
                      <MarkdownContent variant="plain" html={parseMarkdown(factor.detailedExplanation)} />
                    </Stack>
                  </InlineCard>
                ))}
              </Stack>
            </ReportSection>
          )}
        </Prose>

        {currentSlug && availableSlugsPromise && (
          <Suspense fallback={null}>
            <EtfRelatedSections availableSlugsPromise={availableSlugsPromise} exchange={exchange} symbol={symbol} etfName={etfName} currentSlug={currentSlug} />
          </Suspense>
        )}

        <ReportFooter
          modifiedDate={modifiedDate}
          formattedModifiedDate={formattedModifiedDate}
          tags={[
            { label: 'ETF Analysis', tone: 'family' },
            { label: categoryBadgeText, className: categoryBadgeClassName },
          ]}
        />
      </ReportArticleShell>

      {similarEtfs && similarEtfs.length > 0 && (
        <div className="py-4">
          <SimilarEtfs data={similarEtfs} linkSlug={currentSlug} />
        </div>
      )}
    </>
  );
}
