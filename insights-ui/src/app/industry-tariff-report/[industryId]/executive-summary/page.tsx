import PrivateWrapper from '@/components/auth/PrivateWrapper';
import ExecutiveSummaryActions from '@/components/industry-tariff/section-actions/ExecutiveSummaryActions';

import { getMarkdownContentForExecutiveSummary } from '@/scripts/industry-tariff-reports/render-tariff-markdown';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
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
      title: 'Executive Summary | Tariff Report',
      description: 'Executive summary of the industry tariff report',
    };
  }

  // Get the SEO details specific to the executive summary
  const seoDetails = report.reportSeoDetails?.executiveSummarySeoDetails;

  // Create a title that includes the industry name
  const industryName = report.executiveSummary?.title || 'Industry';
  const seoTitle = seoDetails?.title || `${industryName} Executive Summary | Tariff Impact Analysis`;
  const seoDescription =
    seoDetails?.shortDescription || `Executive summary of the ${industryName} tariff report, including key impacts, market trends, and industry outlook.`;
  const canonicalUrl = `https://koalagains.com/industry-tariff-report/${industryId}/executive-summary`;

  // Create keywords from SEO details or fallback to generic ones
  const keywords = seoDetails?.keywords || [industryName, 'executive summary', 'tariff analysis', 'industry overview', 'market impacts', 'KoalaGains'];

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

export default async function ExecutiveSummaryPage({ params }: { params: Promise<{ industryId: string }> }) {
  const { industryId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, { cache: 'no-cache' });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  // Check if SEO data exists for this page
  const seoDetails = report.reportSeoDetails?.executiveSummarySeoDetails;
  const isSeoMissing = !seoDetails || !seoDetails.title || !seoDetails.shortDescription || !seoDetails.keywords?.length;

  const content = report.executiveSummary ? parseMarkdown(getMarkdownContentForExecutiveSummary(report.executiveSummary)) : 'No content available';
  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <ExecutiveSummaryActions industryId={industryId} />
        </PrivateWrapper>
      </div>

      {/* SEO Warning Banner for Admins */}
      {isSeoMissing && (
        <PrivateWrapper>
          <div className="my-8 p-3 bg-amber-100 border border-amber-300 rounded-md text-amber-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center">
                <span className="font-medium">SEO metadata is missing for this page</span>
              </div>
            </div>
          </div>
        </PrivateWrapper>
      )}

      <div dangerouslySetInnerHTML={{ __html: content }} className="markdown-body" />
    </div>
  );
}
