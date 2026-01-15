import { parseMarkdown } from '@/util/parse-markdown';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { notFound } from 'next/navigation';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { TickerAnalysisData } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/[analysisTemplateId]/route';

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
                  {categoryAnalyses.map((analysis) => (
                    <div key={analysis.id} className="bg-gray-800 p-4 rounded-md">
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold mb-2">{analysis.analysisType.name}</h4>
                        <p className="text-xs text-gray-500">Generated on {new Date(analysis.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(analysis.output) }} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
