'use client';

import { parseMarkdown } from '@/util/parse-markdown';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { notFound } from 'next/navigation';
import { use } from 'react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import { AnalysisTemplateReportWithRelations } from '../../../api/analysis-template-reports/route';
import { getAnalysisResultColorClasses } from '@/utils/score-utils';
import { SourceLink } from '@/types/prismaTypes';
import { AnalysisTemplateParameterReport, AnalysisTemplateParameter, AnalysisTemplateCategory } from '@prisma/client';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';

type ParameterReportWithRelations = AnalysisTemplateParameterReport & {
  analysisTemplateParameter: AnalysisTemplateParameter & {
    category: AnalysisTemplateCategory;
  };
};

interface AnalysisTemplateReportPageProps {
  params: Promise<{ analysisTemplateReportId: string }>;
}

function groupParameterReportsByCategory(parameterReports: ParameterReportWithRelations[]) {
  const grouped = new Map<string, typeof parameterReports>();

  parameterReports.forEach((report) => {
    const categoryName = report.analysisTemplateParameter.category.name;
    if (!grouped.has(categoryName)) {
      grouped.set(categoryName, []);
    }
    grouped.get(categoryName)!.push(report);
  });

  return Array.from(grouped.entries()).map(([categoryName, reports]) => ({
    categoryName,
    reports,
  }));
}

export default function AnalysisTemplateReportPage({ params }: AnalysisTemplateReportPageProps) {
  const { analysisTemplateReportId } = use(params);

  const {
    data: report,
    loading,
    error,
  } = useFetchData<AnalysisTemplateReportWithRelations>(
    `${getBaseUrl()}/api/analysis-template-reports/${analysisTemplateReportId}`,
    { cache: 'no-cache' },
    'Failed to fetch analysis template report'
  );

  if (loading) {
    return <FullPageLoader />;
  }

  if (error || !report) {
    return (
      <PageWrapper>
        <div className="text-red-500">{error}</div>
      </PageWrapper>
    );
  }

  const isTickerAnalysis = report.promptKey === 'US/ticker-analysis-template';
  const isCompanyAnalysis = report.promptKey === 'US/company-analysis-template';
  const inputObj = report.inputObj as any;

  const groupedReports = groupParameterReportsByCategory(report.parameterReports as ParameterReportWithRelations[]);

  return (
    <PageWrapper>
      <div>
        <div className="mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl heading-color mb-4">{report.analysisTemplate.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                {(() => {
                  const inputObj = report.inputObj as any;
                  if (isTickerAnalysis && inputObj?.tickerSymbol) {
                    return (
                      <>
                        <span className="text-lg font-semibold text-white">{inputObj.tickerSymbol}</span>
                        <span>•</span>
                        <span>{inputObj.tickerName || 'Unknown'}</span>
                        <span>•</span>
                        <span>Exchange: {inputObj.exchange || 'Unknown'}</span>
                      </>
                    );
                  }
                  if (isCompanyAnalysis && inputObj?.companyName) {
                    return (
                      <>
                        <span className="text-lg font-semibold text-white">{inputObj.companyName}</span>
                        <span>•</span>
                        <span>Company Analysis</span>
                      </>
                    );
                  }
                  return <span className="text-gray-500">No details available</span>;
                })()}
              </div>
            </div>
            <div className="flex gap-4">
              <Link
                href={`/admin-v1/analysis-template-report/${analysisTemplateReportId}/generate`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate More Analysis
              </Link>
              <Link href="/admin-v1/analysis-template-report" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Back to Reports
              </Link>
            </div>
          </div>
        </div>

        {report.parameterReports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No analysis results found</p>
            <p className="text-sm text-gray-400 mb-6">Generate analysis using the admin panel</p>
            <Link
              href={`/admin-v1/analysis-template-report/${analysisTemplateReportId}/generate`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Generate Analysis
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedReports.map(({ categoryName, reports }) => (
              <section key={categoryName} className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">{categoryName}</h3>
                <div className="space-y-6">
                  {reports.map((report) => {
                    const { textColorClass, bgColorClass, displayLabel } = getAnalysisResultColorClasses(report.result);

                    return (
                      <div key={report.id} className="bg-gray-800 p-4 rounded-md">
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold">{report.analysisTemplateParameter.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${bgColorClass} bg-opacity-20 ${textColorClass}`}>
                              {displayLabel}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(report.output) }} />

                        {/* Source Links from Grounding */}
                        {report.sourceLinks && report.sourceLinks.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-600">
                            <h5 className="text-sm font-semibold text-gray-300 mb-3">Sources:</h5>
                            <div className="space-y-2">
                              {(report.sourceLinks as SourceLink[]).map((source: SourceLink, index: number) => (
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
