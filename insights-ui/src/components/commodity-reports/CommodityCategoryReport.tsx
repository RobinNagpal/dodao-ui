import Heading from '@/components/ui/Heading';
import PassFailBadge from '@/components/ui/PassFailBadge';
import Text from '@/components/ui/Text';
import Stack from '@/components/ui/containers/Stack';
import InlineCard from '@/components/ui/sections/InlineCard';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import Prose from '@/components/ui/sections/Prose';
import ReportArticleShell from '@/components/ui/sections/ReportArticleShell';
import ReportFooter from '@/components/ui/sections/ReportFooter';
import RelatedSectionsNav from '@/components/ui/sections/RelatedSectionsNav';
import ReportSection from '@/components/ui/sections/ReportSection';
import ReportSectionHeader from '@/components/ui/sections/ReportSectionHeader';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import { CommodityAnalysisCategory, COMMODITY_CATEGORY_NAMES, COMMODITY_CATEGORY_TO_PATH } from '@/types/commodity/commodity-analysis-types';
import { getCommodityFactorTitle } from '@/utils/commodity-analysis-reports/commodity-analysis-factor-utils';
import { CommodityCategoryResultWithFactors } from '@/utils/commodity-analysis-reports/commodity-spider-graph';
import { parseMarkdown } from '@/util/parse-markdown';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const PASS_RESULT = 'Pass';

const ALL_CATEGORIES: CommodityAnalysisCategory[] = [
  CommodityAnalysisCategory.SupplyAndDemand,
  CommodityAnalysisCategory.PriceAndValue,
  CommodityAnalysisCategory.VolatilityAndRisk,
  CommodityAnalysisCategory.FutureOutlook,
];

export interface CommodityCategoryReportProps {
  commodityName: string;
  slug: string;
  commodityGroup: string;
  categoryKey: CommodityAnalysisCategory;
  categoryResult: CommodityCategoryResultWithFactors;
  analysisTitle: string;
  categoryBadgeText: string;
  categoryBadgeClassName: string;
  updatedAt?: string;
}

/**
 * Renders one scored-category report for a commodity, reusing the same leaf
 * layout components as the ETF/stock category reports (all Tailwind lives in the
 * leaf layer). Factors render as Pass/Fail cards; a related-sections nav links to
 * the sibling category pages.
 */
export default function CommodityCategoryReport({
  commodityName,
  slug,
  commodityGroup,
  categoryKey,
  categoryResult,
  analysisTitle,
  categoryBadgeText,
  categoryBadgeClassName,
  updatedAt,
}: CommodityCategoryReportProps): JSX.Element {
  const modifiedDate = new Date(updatedAt || new Date());
  const formattedModifiedDate = modifiedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const passCount = categoryResult.factorResults?.filter((fr) => fr.result === PASS_RESULT).length || 0;
  const totalCount = categoryResult.factorResults?.length || 0;

  return (
    <ReportArticleShell datePublished={modifiedDate}>
      <ReportSectionHeader
        title={commodityName}
        exchange={commodityGroup}
        score={{ pass: passCount, total: totalCount }}
        modifiedDate={modifiedDate}
        formattedModifiedDate={formattedModifiedDate}
        actionHref={`/commodities/${slug}`}
      />

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
                          {getCommodityFactorTitle(categoryKey, factor.factorKey)}
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

      <RelatedSectionsNav
        ariaLabel={`More ${commodityName} analyses`}
        heading={<>More {commodityName} analyses</>}
        items={ALL_CATEGORIES.filter((c) => c !== categoryKey).map((c) => ({
          href: `/commodities/${slug}/${COMMODITY_CATEGORY_TO_PATH[c]}`,
          label: `${COMMODITY_CATEGORY_NAMES[c]} →`,
        }))}
      />

      <ReportFooter
        modifiedDate={modifiedDate}
        formattedModifiedDate={formattedModifiedDate}
        tags={[
          { label: 'Commodity Analysis', tone: 'family' },
          { label: categoryBadgeText, className: categoryBadgeClassName },
        ]}
      />
    </ReportArticleShell>
  );
}
