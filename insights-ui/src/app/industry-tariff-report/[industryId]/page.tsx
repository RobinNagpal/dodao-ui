import PrivateWrapper from '@/components/auth/PrivateWrapper';
import ReportCoverActions from '@/components/industry-tariff/section-actions/ReportCoverActions';
import { getMarkdownContentForReportCover, getMarkdownContentForExecutiveSummary } from '@/scripts/industry-tariff-reports/render-tariff-markdown';
import type { IndustryTariffReport, ReportCover } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ industryId: string }> }): Promise<Metadata> {
  const { industryId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, { cache: 'no-cache' });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return {
      title: 'Industry Tariff Report',
      description: 'Comprehensive analysis of tariff impacts on industry',
    };
  }

  // Get the SEO details specific to the report cover
  const seoDetails = report.reportSeoDetails?.reportCoverSeoDetails;

  // Create a title that includes the industry name
  const industryName = report.executiveSummary?.title || 'Industry';
  const seoTitle = seoDetails?.title || `${industryName} Tariff Report | Comprehensive Analysis`;
  const seoDescription =
    seoDetails?.shortDescription ||
    `Comprehensive analysis of tariff impacts on the ${industryName} industry, including market trends, company impacts, and strategic implications.`;
  const canonicalUrl = `https://koalagains.com/industry-tariff-report/${industryId}`;

  // Create keywords from SEO details or fallback to generic ones
  const keywords = seoDetails?.keywords || [industryName, 'tariff report', 'tariff impact', 'industry analysis', 'market trends', 'trade policy', 'KoalaGains'];

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
    },
    keywords: keywords,
  };
}

export default async function IndustryTariffReportPage({ params }: { params: Promise<{ industryId: string }> }) {
  const { industryId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, { cache: 'no-cache' });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Report not found</h1>
        <p className="mt-4">The requested industry tariff report could not be found.</p>
      </div>
    );
  }

  // Check if SEO data exists for this page
  const seoDetails = report.reportSeoDetails?.reportCoverSeoDetails;
  const isSeoMissing = !seoDetails || !seoDetails.title || !seoDetails.shortDescription || !seoDetails.keywords?.length;

  const reportCover: ReportCover | undefined = report?.reportCover;
  const markdownContent = reportCover && getMarkdownContentForReportCover(reportCover);

  // Get executive summary content for better SEO
  const executiveSummaryContent = report.executiveSummary ? parseMarkdown(getMarkdownContentForExecutiveSummary(report.executiveSummary)) : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">{report?.reportCover?.title || 'Tariff report for ' + industryId}</h1>
        <PrivateWrapper>
          <ReportCoverActions industryId={industryId} />
        </PrivateWrapper>
      </div>

      {/* SEO Warning Banner for Admins */}
      {isSeoMissing && (
        <PrivateWrapper>
          <div className="my-6 sm:my-8 p-3 bg-amber-100 border border-amber-300 rounded-md text-amber-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center">
                <span className="font-medium">SEO metadata is missing for this page</span>
              </div>
            </div>
          </div>
        </PrivateWrapper>
      )}

      {/* Report Cover Content */}
      <div
        dangerouslySetInnerHTML={{
          __html: (markdownContent && parseMarkdown(markdownContent)) || 'No content available',
        }}
        className="markdown-body"
      />

      {/* Executive Summary Content for SEO */}
      {executiveSummaryContent && (
        <div className="mt-8">
          <div
            dangerouslySetInnerHTML={{
              __html: executiveSummaryContent,
            }}
            className="markdown-body"
          />
        </div>
      )}
    </div>
  );
}
