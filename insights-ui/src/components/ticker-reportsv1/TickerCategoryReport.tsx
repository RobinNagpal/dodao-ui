import TickerRelatedSections, { getAvailableSiblingSlugs } from '@/components/ticker-reportsv1/TickerRelatedSections';
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
import { parseMarkdown } from '@/util/parse-markdown';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { Suspense } from 'react';

const PASS_RESULT = 'Pass';

type TickerDataLike = {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type FactorResultLike = {
  id: string | number;
  result: unknown;
  oneLineExplanation?: string | null;
  detailedExplanation: string;
  analysisCategoryFactor?: { factorAnalysisTitle?: string | null } | null;
};

type CategoryResultLike = {
  createdAt?: string | Date;
  updatedAt?: string | Date;
  summary?: string | null;
  overallAnalysisDetails?: string | null;
  factorResults?: FactorResultLike[] | null;
};

export interface TickerCategoryReportProps {
  tickerData: TickerDataLike;
  categoryResult: CategoryResultLike;
  analysisTitle: string;
  categoryBadgeText: string;
  categoryBadgeClassName: string;
  /** Sub-page slug for sibling navigation (e.g. "business-and-moat"). */
  pageSlug: string;
}

export default function TickerCategoryReport({
  tickerData,
  categoryResult,
  analysisTitle,
  categoryBadgeText,
  categoryBadgeClassName,
  pageSlug,
}: TickerCategoryReportProps): JSX.Element | null {
  if (!tickerData || !categoryResult) {
    return null;
  }

  const createdAtRaw = categoryResult.createdAt || tickerData.createdAt || new Date();
  const updatedAtRaw = categoryResult.updatedAt || tickerData.updatedAt || new Date();

  const publishedDate = new Date(createdAtRaw);
  const modifiedDate = new Date(updatedAtRaw);

  const formattedModifiedDate = modifiedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const passCount = categoryResult.factorResults?.filter((fr) => String(fr.result) === PASS_RESULT).length || 0;
  const totalCount = categoryResult.factorResults?.length || 0;

  // Kick off the sibling-presence query in parallel with the rest of render.
  // The Promise is unwrapped via `use()` inside <TickerRelatedSections>, suspended by the boundary below.
  const availableSlugsPromise = getAvailableSiblingSlugs(tickerData.id);

  return (
    <ReportArticleShell datePublished={publishedDate}>
      <ReportSectionHeader
        title={analysisTitle}
        exchange={tickerData.exchange}
        score={{ pass: passCount, total: totalCount }}
        modifiedDate={modifiedDate}
        formattedModifiedDate={formattedModifiedDate}
        actionHref={`/stocks/${tickerData.exchange}/${tickerData.symbol}`}
      />

      <Prose>
        <ReportSection>
          <SectionHeading>Executive Summary</SectionHeading>
          <MarkdownContent variant="summary" itemProp="abstract" html={categoryResult.summary ? parseMarkdown(categoryResult.summary) : ''} />
        </ReportSection>

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
                <InlineCard as="li" key={factor.id} padding="factor">
                  <Stack gap="sm">
                    <Stack direction="row" align="center" justify="between">
                      <Stack direction="row" align="center" gap="sm">
                        {String(factor.result) === PASS_RESULT ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                        )}
                        <Heading as="h3" size="inherit" weight="semibold" tone="inherit">
                          {factor.analysisCategoryFactor?.factorAnalysisTitle}
                        </Heading>
                      </Stack>
                      <PassFailBadge
                        passed={String(factor.result) === PASS_RESULT}
                        className="font-medium"
                        passLabel={String(factor.result)}
                        failLabel={String(factor.result)}
                      />
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

      <Suspense fallback={null}>
        <TickerRelatedSections
          availableSlugsPromise={availableSlugsPromise}
          exchange={tickerData.exchange}
          symbol={tickerData.symbol}
          companyName={tickerData.name}
          currentSlug={pageSlug}
        />
      </Suspense>

      <ReportFooter
        modifiedDate={modifiedDate}
        formattedModifiedDate={formattedModifiedDate}
        tags={[
          { label: 'Stock Analysis', tone: 'family' },
          { label: categoryBadgeText, className: categoryBadgeClassName },
        ]}
      />
    </ReportArticleShell>
  );
}
