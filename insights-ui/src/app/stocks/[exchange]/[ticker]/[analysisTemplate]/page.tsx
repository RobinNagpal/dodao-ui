import { prisma } from '@/prisma';
import { parseMarkdown } from '@/util/parse-markdown';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Link from 'next/link';
import { notFound } from 'next/navigation';

/** ---------- Types ---------- */

interface TickerAnalysisPageProps {
  params: Promise<{
    exchange: string;
    ticker: string;
    analysisTemplate: string;
  }>;
}

interface TickerAnalysisData {
  ticker: {
    id: string;
    name: string;
    symbol: string;
    exchange: string;
    summary: string | null;
    websiteUrl: string | null;
  };
  analysisTemplate: {
    id: string;
    name: string;
    description: string | null;
  };
  analyses: Array<{
    id: string;
    analysisType: {
      id: string;
      name: string;
      oneLineSummary: string;
      description: string;
      category: {
        name: string;
      };
    };
    output: string;
    createdAt: string;
  }>;
}

/** ---------- Helper Functions ---------- */

async function getTickerAnalysisData(exchange: string, tickerSymbol: string, analysisTemplateId: string): Promise<TickerAnalysisData | null> {
  try {
    // Find the ticker by symbol and exchange
    const ticker = await prisma.tickerV1.findFirst({
      where: {
        symbol: tickerSymbol.toUpperCase(),
        exchange: exchange.toUpperCase(),
      },
      select: {
        id: true,
        name: true,
        symbol: true,
        exchange: true,
        summary: true,
        websiteUrl: true,
      },
    });

    if (!ticker) {
      return null;
    }

    // Get the analysis template
    const analysisTemplate = await prisma.analysisTemplate.findFirst({
      where: {
        id: analysisTemplateId,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    if (!analysisTemplate) {
      return null;
    }

    // Get all analysis results for this ticker and template
    const analysisResults = await prisma.tickerV1DetailedReport.findMany({
      where: {
        tickerId: ticker.id,
        analysisTemplateId: analysisTemplateId,
      },
      include: {
        analysisType: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          analysisType: {
            category: {
              name: 'asc',
            },
          },
        },
        {
          analysisType: {
            name: 'asc',
          },
        },
      ],
    });

    const analyses = analysisResults.map((result) => ({
      id: result.id,
      analysisType: {
        id: result.analysisType.id,
        name: result.analysisType.name,
        oneLineSummary: result.analysisType.oneLineSummary,
        description: result.analysisType.description,
        category: {
          name: result.analysisType.category.name,
        },
      },
      output: result.output,
      createdAt: result.createdAt.toISOString(),
    }));

    return {
      ticker,
      analysisTemplate,
      analyses,
    };
  } catch (error) {
    console.error('Error fetching ticker analysis data:', error);
    return null;
  }
}

function formatAnalysisOutput(output: string): JSX.Element {
  try {
    // Try to parse as JSON for structured output
    const parsed = JSON.parse(output);
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <pre className="whitespace-pre-wrap text-sm overflow-x-auto">{JSON.stringify(parsed, null, 2)}</pre>
      </div>
    );
  } catch {
    // If not JSON, treat as plain text
    return (
      <div className="prose max-w-none">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{output}</div>
      </div>
    );
  }
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

/** ---------- Main Component ---------- */

export default async function TickerAnalysisPage({ params }: TickerAnalysisPageProps) {
  const { exchange, ticker: tickerSymbol, analysisTemplate: analysisTemplateId } = await params;

  const data = await getTickerAnalysisData(exchange, tickerSymbol, analysisTemplateId);

  if (!data) {
    notFound();
  }

  const { ticker, analysisTemplate, analyses } = data;
  const groupedAnalyses = groupAnalysesByCategory(analyses);

  return (
    <PageWrapper>
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/admin-v1/generate-ticker-analysis-templates" className="hover:underline">
              Admin
            </Link>
            <span>→</span>
            <Link href="/admin-v1/generate-ticker-analysis-templates" className="hover:underline">
              Ticker Analysis
            </Link>
            <span>→</span>
            <span>{ticker.symbol}</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl heading-color mb-2">
                {ticker.symbol} - {ticker.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span>Exchange: {ticker.exchange}</span>
                {ticker.websiteUrl && (
                  <>
                    <span>•</span>
                    <a href={ticker.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Website
                    </a>
                  </>
                )}
              </div>
              {ticker.summary && <p className="text-gray-400 max-w-3xl">{ticker.summary}</p>}
            </div>
          </div>
        </div>

        {/* Analysis Template Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Analysis Template: {analysisTemplate.name}</h2>
          {analysisTemplate.description && <p className="text-blue-800">{analysisTemplate.description}</p>}
        </div>

        {/* Analysis Results */}
        {analyses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No analysis results found</p>
            <p className="text-sm text-gray-400">Generate analysis for this ticker using the admin panel</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedAnalyses.map(({ categoryName, analyses: categoryAnalyses }) => (
              <div key={categoryName} className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-400">{categoryName}</h3>
                </div>

                <div className="divide-y divide-gray-200">
                  {categoryAnalyses.map((analysis) => (
                    <div key={analysis.id} className="p-6">
                      <div className="mb-4">
                        <h4 className="text-lg font-medium text-gray-400 mb-2">{analysis.analysisType.name}</h4>
                        <p className="text-sm text-gray-400 mb-1">{analysis.analysisType.oneLineSummary}</p>
                        <p className="text-xs text-gray-400 mb-4">
                          Generated on {new Date(analysis.createdAt).toLocaleDateString()} at {new Date(analysis.createdAt).toLocaleTimeString()}
                        </p>
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <h5 className="text-sm font-medium text-gray-400 mb-3">Analysis Result:</h5>
                        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(analysis.output) }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
