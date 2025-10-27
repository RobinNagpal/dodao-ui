import FloatingNavigation, { NavigationSection } from '@/components/ticker-reportsv1/FloatingNavigation';
import { CATEGORY_MAPPINGS, TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { TickerV1FastResponse } from '@/utils/ticker-v1-model-utils';
import { use } from 'react';

export function FloatingNavFromData({ data }: { data: Promise<TickerV1FastResponse> }): JSX.Element {
  const d: TickerV1FastResponse = use(data);
  // Generate navigation sections based on available content
  const sections: NavigationSection[] = [
    {
      id: 'summary-analysis',
      title: 'Summary Analysis',
      hasContent: true,
    },
    {
      id: 'future-risks',
      title: 'Future Risks',
      hasContent: d.futureRisks.length > 0,
    },
    {
      id: 'investor-summaries',
      title: 'Investor Reports Summaries',
      hasContent: d.investorAnalysisResults.length > 0,
    },
    {
      id: 'competition',
      title: 'Competition',
      hasContent: true,
    },
    {
      id: 'similar-tickers',
      title: 'Similar Tickers',
      hasContent: true,
    },
    {
      id: 'detailed-analysis',
      title: 'Detailed Analysis',
      hasContent: d.categoryAnalysisResults && d.categoryAnalysisResults.length > 0,
      subsections: Object.values(TickerAnalysisCategory)
        .map((categoryKey) => {
          const categoryResult = d.categoryAnalysisResults?.find((r) => r.categoryKey === categoryKey);
          return categoryResult
            ? {
                id: `detailed-${categoryKey}`,
                title: CATEGORY_MAPPINGS[categoryKey],
              }
            : null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    },
    {
      id: 'detailed-future-risks',
      title: 'Detailed Future Risks',
      hasContent: d.futureRisks.length > 0,
    },
  ];

  return <FloatingNavigation sections={sections} />;
}
