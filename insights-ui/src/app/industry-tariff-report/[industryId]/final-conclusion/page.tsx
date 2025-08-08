import PrivateWrapper from '@/components/auth/PrivateWrapper';
import FinalConclusionActions from '@/components/industry-tariff/section-actions/FinalConclusionActions';

import { getMarkdownContentForFinalConclusion } from '@/scripts/industry-tariff-reports/render-tariff-markdown';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ industryId: string }> }): Promise<Metadata> {
  const { industryId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`);
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return {
      title: 'Final Conclusion | Tariff Report',
      description: 'Final conclusion and summary of the industry tariff report',
    };
  }

  // Get the SEO details specific to the final conclusion
  const seoDetails = report.reportSeoDetails?.finalConclusionSeoDetails;

  // Create a title that includes the industry name
  const industryName = report.executiveSummary?.title || 'Industry';
  const seoTitle = seoDetails?.title || `${industryName} Final Conclusion | Tariff Impact Summary`;
  const seoDescription =
    seoDetails?.shortDescription ||
    `Final conclusion of the ${industryName} tariff report, summarizing key findings, positive and negative impacts, and future outlook.`;
  const canonicalUrl = `https://koalagains.com/industry-tariff-report/${industryId}/final-conclusion`;

  // Create keywords from SEO details or fallback to generic ones
  const keywords = seoDetails?.keywords || [
    industryName,
    'final conclusion',
    'tariff impact summary',
    'industry outlook',
    'market forecast',
    'tariff analysis',
    'KoalaGains',
  ];

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

export default async function FinalConclusionPage({ params }: { params: Promise<{ industryId: string }> }) {
  const { industryId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`);
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  // Check if SEO data exists for this page
  const seoDetails = report.reportSeoDetails?.finalConclusionSeoDetails;
  const isSeoMissing = !seoDetails || !seoDetails.title || !seoDetails.shortDescription || !seoDetails.keywords?.length;

  const content = report.finalConclusion ? parseMarkdown(getMarkdownContentForFinalConclusion(report.finalConclusion)) : 'No content available';
  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <FinalConclusionActions industryId={industryId} />
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
