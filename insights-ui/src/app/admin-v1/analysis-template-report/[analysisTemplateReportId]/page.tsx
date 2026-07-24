import { notFound } from 'next/navigation';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { AnalysisTemplateReportWithRelations } from '../../../api/analysis-template-reports/route';
import { AnalysisTemplateParameterReport, AnalysisTemplateParameter, AnalysisTemplateCategory } from '@prisma/client';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import AnalysisResultsTable from '@/components/analysis-templates/AnalysisResultsTable';

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

async function fetchAnalysisTemplateReport(analysisTemplateReportId: string): Promise<AnalysisTemplateReportWithRelations> {
  const url = `${getBaseUrlForServerSidePages()}/api/analysis-template-reports/${analysisTemplateReportId}`;
  const res = await fetch(url, { cache: 'no-cache' });

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error(`Failed to fetch analysis template report: ${res.status}`);
  }

  const data = (await res.json()) as AnalysisTemplateReportWithRelations;
  if (!data) {
    throw new Error('Failed to fetch analysis template report: empty response');
  }

  return data;
}

export default async function AnalysisTemplateReportPage({ params }: AnalysisTemplateReportPageProps) {
  const { analysisTemplateReportId } = await params;

  const report = await fetchAnalysisTemplateReport(analysisTemplateReportId);

  const isTickerAnalysis = report.promptKey === 'US/ticker-analysis-template';
  const isCompanyAnalysis = report.promptKey === 'US/company-analysis-template';

  const groupedReports = groupParameterReportsByCategory(report.parameterReports as ParameterReportWithRelations[]);

  return (
    <>
      <div className="pt-2 pb-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-bold text-heading">{report.analysisTemplate.name}</h1>
            <div className="ml-auto flex gap-4">
              <Link href="/admin-v1/analysis-template-report">
                <span className="text-link hover:text-link transition-colors">Back to Reports →</span>
              </Link>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-4 text-sm text-muted">
              {(() => {
                const inputObj = report.inputObj as any;
                if (isTickerAnalysis && inputObj?.tickerSymbol) {
                  return (
                    <>
                      <span className="text-sm text-link font-medium">{inputObj.tickerSymbol}</span>
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
                      <span className="text-sm text-link font-medium">{inputObj.companyName}</span>
                      <span>•</span>
                      <span>Company Analysis</span>
                    </>
                  );
                }
                return <span className="text-muted">No details available</span>;
              })()}
            </div>
            <p className="text-muted text-sm mt-2">
              Analysis results with {report.parameterReports.length} parameter{report.parameterReports.length !== 1 ? 's' : ''} across {groupedReports.length}{' '}
              categor{groupedReports.length !== 1 ? 'ies' : 'y'}
            </p>
          </div>
        </div>

        {report.parameterReports.length === 0 ? (
          <div className="bg-surface rounded-lg p-8 text-center">
            <ChartBarIcon className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No analysis results found</h3>
            <p className="text-muted mb-6">Generate analysis using the admin panel to see results here.</p>
            <Link href={`/admin-v1/analysis-template-report/${analysisTemplateReportId}/generate`}>
              <span className="px-6 py-3 bg-primary text-primary-text rounded-lg inline-block transition-colors">Generate Analysis →</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedReports.map(({ categoryName, reports }) => (
              <AnalysisResultsTable key={categoryName} categoryName={categoryName} reports={reports} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
