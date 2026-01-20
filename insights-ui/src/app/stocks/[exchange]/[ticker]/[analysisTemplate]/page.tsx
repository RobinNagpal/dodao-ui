import { parseMarkdown } from '@/util/parse-markdown';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { notFound } from 'next/navigation';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { TickerAnalysisData } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/[analysisTemplateId]/route';
import { getAnalysisResultColorClasses } from '@/utils/score-utils';
import { SourceLink } from '@/types/prismaTypes';

interface TickerAnalysisPageProps {
  params: Promise<{
    exchange: string;
    ticker: string;
    analysisTemplate: string;
  }>;
}

function groupAnalysesByCategory(analyses: TickerAnalysisData['analyses']) {
  const grouped = new Map<string, typeof analyses>();

  analyses.forEach((analysis) => {
    const categoryName = analysis.analysisType.category.name;
    if (!grouped.has(categoryName)) {
      grouped.set(categoryName, []);
    }
    grouped.get(categoryName)!.push(analysis);
  });

  return Array.from(grouped.entries()).map(([categoryName, categoryAnalyses]) => ({
    categoryName,
    analyses: categoryAnalyses,
  }));
}

async function fetchTickerAnalysisData(exchange: string, tickerSymbol: string, analysisTemplateId: string): Promise<TickerAnalysisData> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${tickerSymbol.toUpperCase()}/${analysisTemplateId}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error(`fetchTickerAnalysisData failed (${response.status}): ${url}`);
    (error as any).status = response.status; // Attach status for error handling
    throw error;
  }

  const data: TickerAnalysisData = await response.json();
  return data;
}

export default async function TickerAnalysisPage({ params }: TickerAnalysisPageProps) {
  const { exchange, ticker: tickerSymbol, analysisTemplate: analysisTemplateId } = await params;

  let data: TickerAnalysisData;
  try {
    data = await fetchTickerAnalysisData(exchange, tickerSymbol, analysisTemplateId);
  } catch (error) {
    const status = (error as any)?.status;

    // Only call notFound() for 404 (analysis genuinely doesn't exist)
    // For 500/503 (DB down, server errors), throw to show error.tsx
    if (status === 404) {
      notFound(); // Safe - analysis doesn't exist, won't change later
    }

    // For server errors, throw - will show error.tsx, not cached
    throw new Error(`Service temporarily unavailable for ${tickerSymbol} analysis`);
  }

  const { ticker, analysisTemplate, analyses } = data;
  const groupedAnalyses = groupAnalysesByCategory(analyses);

  return (
    <PageWrapper>
      <div>
        <div className="mb-4">
          <h1 className="text-3xl heading-color mb-4">{analysisTemplate.name}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="text-lg font-semibold text-white">{ticker.symbol}</span>
            <span>•</span>
            <span>{ticker.name}</span>
            <span>•</span>
            <span>Exchange: {ticker.exchange}</span>
          </div>
        </div>

        {analyses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No analysis results found</p>
            <p className="text-sm text-gray-400">Generate analysis for this ticker using the admin panel</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedAnalyses.map(({ categoryName, analyses: categoryAnalyses }) => (
              <section key={categoryName} className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">{categoryName}</h3>
                <div className="space-y-6">
                  {categoryAnalyses.map((analysis) => {
                    const { textColorClass, bgColorClass, displayLabel } = getAnalysisResultColorClasses(analysis.result);

                    return (
                      <div key={analysis.id} className="bg-gray-800 p-4 rounded-md">
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold">{analysis.analysisType.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${bgColorClass} bg-opacity-20 ${textColorClass}`}>
                              {displayLabel}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">Generated on {new Date(analysis.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(analysis.output) }} />

                        {/* Source Links from Grounding */}
                        {analysis.sourceLinks && analysis.sourceLinks.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-600">
                            <h5 className="text-sm font-semibold text-gray-300 mb-3">Sources:</h5>
                            <div className="space-y-2">
                              {analysis.sourceLinks.map((source: SourceLink, index: number) => (
                                <div key={index} className="flex items-start gap-2">
                                  <span className="text-xs text-gray-500 mt-0.5">{index + 1}.</span>
                                  <a
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-400 hover:text-blue-300 underline hover:no-underline break-all"
                                    title={source.uri}
                                  >
                                    {source.title || source.uri}
                                  </a>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 italic">Information sourced from web search results</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
