import PrivateWrapper from '@/components/auth/PrivateWrapper';
import UnderstandIndustryActions from '@/components/industry-tariff/section-actions/UnderstandIndustryActions';

import { getMarkdownContentForUnderstandIndustry } from '@/scripts/industry-tariff-reports/render-tariff-markdown';
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
      title: 'Understand Industry | Tariff Report',
      description: 'Comprehensive overview and explanation of the industry structure and operations',
    };
  }

  // Get the SEO details specific to understand industry
  const seoDetails = report.reportSeoDetails?.understandIndustrySeoDetails;

  // Create a title that includes the industry name
  const industryName = report.executiveSummary?.title || 'Industry';
  const seoTitle = seoDetails?.title || `Understanding the ${industryName} | Industry Overview`;
  const seoDescription =
    seoDetails?.shortDescription || `Comprehensive explanation of the ${industryName} industry, including key operations, value chain, and market dynamics.`;
  const canonicalUrl = `https://koalagains.com/industry-tariff-report/${industryId}/understand-industry`;

  // Create keywords from SEO details or fallback to generic ones
  const keywords = seoDetails?.keywords || [
    industryName,
    'industry overview',
    'value chain',
    'market dynamics',
    'business operations',
    'industry primer',
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

export default async function UnderstandIndustryPage({ params }: { params: Promise<{ industryId: string }> }) {
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
  const seoDetails = report.reportSeoDetails?.understandIndustrySeoDetails;
  const isSeoMissing = !seoDetails || !seoDetails.title || !seoDetails.shortDescription || !seoDetails.keywords?.length;

  const content = report.understandIndustry ? parseMarkdown(getMarkdownContentForUnderstandIndustry(report.understandIndustry)) : 'No content available';

  // Function to render section with header and actions
  const renderSection = (title: string, content: JSX.Element) => (
    <div className="mb-12">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-2 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold heading-color">{title}</h2>
        </div>
      </div>
      {content}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl py-2">
      {/* Title and Actions */}
      <div className="mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold heading-color">Understand Industry</h1>
          <PrivateWrapper>
            <UnderstandIndustryActions industryId={industryId} />
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
        {renderSection(
          'Industry Overview',
          <div className="bg-white dark:bg-gray-900 rounded-lg py-2 shadow-sm">
            <div className="markdown-body prose max-w-none px-2">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
