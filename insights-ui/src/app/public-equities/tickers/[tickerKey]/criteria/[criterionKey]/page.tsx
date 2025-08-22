import ImportantMetricsReport from '@/components/ticker-reports/ImportantMetricsReport';
import PerformanceChecklistEvaluation from '@/components/ticker-reports/PerformanceChecklistEvaluation';
import { ReportSection } from '@/components/ticker-reports/ReportSection';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { CriterionDefinition, IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { FullNestedTickerReport } from '@/types/public-equity/ticker-report-types';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { headers } from 'next/headers';
import CriterionActionsDropdown from './CriterionActionsDropdown';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCriterionName } from '@/util/criterion-name-by-key';
import { formatKey } from '@/util/format-key';

export async function generateMetadata({ params }: { params: Promise<{ tickerKey: string; criterionKey: string }> }): Promise<Metadata> {
  const { tickerKey, criterionKey } = await params;

  const referer = (await headers())?.get('referer') ?? ''; // previous URL, if the browser sent it
  const qs = new URLSearchParams({ page: 'criteriaDetailsPage' });
  if (referer) qs.set('from', referer);

  const tickerResponse = await fetch(`${getBaseUrl()}/api/tickers/${tickerKey}?${qs.toString()}`, { cache: 'no-cache' });

  let tickerData: FullNestedTickerReport | null = null;

  if (tickerResponse.ok) {
    tickerData = await tickerResponse.json();
  }

  const companyName = tickerData?.companyName ?? tickerKey;
  const criterionName = getCriterionName(criterionKey);

  const shortDescription = `In-depth analysis of ${criterionName} for ${companyName} (${tickerKey}). Explore performance checklists, AI-driven insights, and more.`;

  const canonicalUrl = `https://koalagains.com/public-equities/tickers/${tickerKey}/criteria/${criterionKey}`;

  const dynamicKeywords = [
    companyName,
    criterionName,
    `${companyName} ${criterionName}`,
    `Analysis on ${companyName}`,
    `Financial Analysis on ${companyName}`,
    `Reports on ${companyName}`,
    `${companyName} ${criterionName} Analysis`,
    'REIT analysis',
    'investment insights',
    'public equities',
    'KoalaGains',
  ];

  return {
    title: `${companyName} (${tickerKey}) – ${criterionName} | KoalaGains`,
    description: shortDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${companyName} (${tickerKey}) – ${criterionName} | KoalaGains`,
      description: shortDescription,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} (${tickerKey}) – ${criterionName} | KoalaGains`,
      description: shortDescription,
    },
    keywords: dynamicKeywords,
  };
}

export default async function CriterionDetailsPage({ params }: { params: Promise<{ tickerKey: string; criterionKey: string }> }) {
  const { tickerKey, criterionKey } = await params;

  const referer = (await headers())?.get('referer') ?? ''; // previous URL, if the browser sent it
  const qs = new URLSearchParams({ page: 'criteriaDetailsPage' });
  if (referer) qs.set('from', referer);

  // Decode the URL parameters and check if they contain '}' character
  const decodedTickerKey = decodeURIComponent(tickerKey);
  const decodedCriterionKey = decodeURIComponent(criterionKey);

  if (decodedTickerKey.includes('}') || decodedCriterionKey.includes('}')) {
    // Remove all '}' characters from the URL parameters and redirect
    const cleanedTickerKey = decodedTickerKey.replace(/\}/g, '');
    const cleanedCriterionKey = decodedCriterionKey.replace(/\}/g, '');
    redirect(`/public-equities/tickers/${cleanedTickerKey}/criteria/${cleanedCriterionKey}`);
  }

  const response = await fetch(`${getBaseUrl()}/api/tickers/${tickerKey}?${qs.toString()}`, { cache: 'no-cache' });
  const tickerReport = (await response.json()) as FullNestedTickerReport;

  const criteriaResponse = await fetch(
    `https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/real-estate/equity-real-estate-investment-trusts-reits/custom-criteria.json`,
    { cache: 'no-cache' }
  );
  const industryGroupCriteria: IndustryGroupCriteriaDefinition = (await criteriaResponse.json()) as IndustryGroupCriteriaDefinition;
  const selectedCriterion: CriterionDefinition = industryGroupCriteria.criteria.find((c) => c.key === criterionKey)!;
  if (!tickerReport.evaluationsOfLatest10Q) {
    return <div>No data available</div>;
  }

  const criterionEvaluation = tickerReport.evaluationsOfLatest10Q.find((item) => item.criterionKey === criterionKey)!;

  // Breadcrumb structure
  const breadcrumbs = [
    { label: `${tickerReport.tickerKey}`, href: `/public-equities/tickers/${tickerKey}`, name: `${tickerKey}`, current: false },
    {
      label: `Criterion: ${criterionKey}`,
      href: `/public-equities/tickers/${tickerKey}/criteria/${criterionKey}`,
      name: `Criterion: ${selectedCriterion.name}`,
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="mx-auto text-color">
        <div className="flex justify-end">
          <PrivateWrapper>
            <CriterionActionsDropdown tickerKey={tickerKey} criterionKey={criterionKey} />
          </PrivateWrapper>
        </div>
        {criterionEvaluation ? (
          <>
            <div className="text-center text-color my-5">
              <h1 className="font-semibold leading-6 text-2xl">Ticker: {tickerKey}</h1>
              <div className="my-5">Criterion: {formatKey(criterionEvaluation.criterionKey)}</div>
            </div>

            <div className="block-bg-color p-8">
              <div className="overflow-x-auto">
                {/* Performance Checklist Section */}
                <h3 className="text-lg font-semibold mt-6 mb-4">Performance Checklist</h3>
                <PerformanceChecklistEvaluation criterionEvaluation={criterionEvaluation} />

                <h3 className="text-lg font-semibold mt-6 mb-4">Important Metrics</h3>
                <ImportantMetricsReport criterionEvaluation={criterionEvaluation} />
                {/* Reports Section */}
                {criterionEvaluation.reports.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mt-6 mb-4">Reports</h3>
                    {selectedCriterion.reports.map((reportDefinition) => {
                      const report = criterionEvaluation.reports.find((report) => report.reportKey === reportDefinition.key);
                      return (
                        <ReportSection
                          key={reportDefinition.key}
                          reportDefinition={reportDefinition}
                          report={report}
                          criterionKey={criterionKey}
                          industryGroupCriteria={industryGroupCriteria}
                        />
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <div>
            <h1 className="text-2xl heading-color">No data available</h1>
            <p className="text-lg text-color">The selected criterion does not have any evaluations or reports available.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
