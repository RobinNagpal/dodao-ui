import PrivateWrapper from '@/components/auth/PrivateWrapper';
import IndustryAreasActions from '@/components/industry-tariff/section-actions/IndustryAreasActions';

import { getMarkdownContentForIndustryAreas } from '@/scripts/industry-tariff-reports/render-tariff-markdown';
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
      title: 'Industry Areas | Tariff Report',
      description: 'Overview of industry areas and their structure',
    };
  }

  // Get the SEO details specific to industry areas
  const seoDetails = report.reportSeoDetails?.industryAreasSeoDetails;

  // Create a title that includes the industry name
  const industryName = report.executiveSummary?.title || 'Industry';
  const seoTitle = seoDetails?.title || `${industryName} Structure | Industry Segments Analysis`;
  const seoDescription =
    seoDetails?.shortDescription || `Detailed breakdown of ${industryName} industry structure, major segments, and how they interact with each other.`;
  const canonicalUrl = `https://koalagains.com/industry-tariff-report/${industryId}/industry-areas`;

  // Create keywords from SEO details or fallback to generic ones
  const keywords = seoDetails?.keywords || [
    industryName,
    'industry structure',
    'market segments',
    'industry breakdown',
    'sector analysis',
    'industry overview',
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

export default async function IndustryAreasPage({ params }: { params: Promise<{ industryId: string }> }) {
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
  const seoDetails = report.reportSeoDetails?.industryAreasSeoDetails;
  const isSeoMissing = !seoDetails || !seoDetails.title || !seoDetails.shortDescription || !seoDetails.keywords?.length;

  const content = report.industryAreasSections ? parseMarkdown(getMarkdownContentForIndustryAreas(report.industryAreasSections)) : 'No content available';

  return (
    <div className="mx-auto max-w-7xl py-2">
      {/* Title and Actions */}
      <div className="mb-8 pb-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold heading-color">Industry Areas</h1>
          <PrivateWrapper>
            <IndustryAreasActions industryId={industryId} />
          </PrivateWrapper>
        </div>
      </div>

      {/* SEO Warning Banner for Admins */}
      {isSeoMissing && (
        <PrivateWrapper>
          <div className="mb-8 p-4 bg-amber-100 border border-amber-300 rounded-md text-amber-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center">
                <span className="font-medium">SEO metadata is missing for this page</span>
              </div>
            </div>
          </div>
        </PrivateWrapper>
      )}

      <div className="space-y-12">
        <div className="bg-gray-900 rounded-lg p-2 shadow-sm">
          <div className="markdown-body prose max-w-none px-2">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
      </div>
    </div>
  );
}
