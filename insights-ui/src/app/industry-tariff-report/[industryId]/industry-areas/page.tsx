import PrivateWrapper from '@/components/auth/PrivateWrapper';
import IndustryAreasActions from '@/components/industry-tariff/section-actions/IndustryAreasActions';

import { getMarkdownContentForIndustryAreas } from '@/scripts/industry-tariff-reports/render-tariff-markdown';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { fetchIndustryAreasMetadata } from '@/utils/tariff-reports/industry-metadata';
import { tariffReportTag } from '@/utils/tariff-report-tags';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ industryId: string }> }): Promise<Metadata> {
  const { industryId } = await params;
  return fetchIndustryAreasMetadata(industryId);
}

export default async function IndustryAreasPage({ params }: { params: Promise<{ industryId: string }> }) {
  const { industryId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrlForServerSidePages()}/api/industry-tariff-reports/${industryId}`, {
    next: { tags: [tariffReportTag(industryId)] },
  });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  console.log('report', report);

  if (!report) {
    return <div>Report not found</div>;
  }

  // Check if SEO data exists for this page
  const seoDetails = report.reportSeoDetails?.industryAreasSeoDetails;
  const isSeoMissing = !seoDetails || !seoDetails.title || !seoDetails.shortDescription || !seoDetails.keywords?.length;

  const markdown = report.industryAreasSections ? getMarkdownContentForIndustryAreas(report.industryAreasSections) : '';
  const content = markdown ? parseMarkdown(markdown) : '';

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
            {content ? (
              <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <p className="text-gray-500 italic p-4">No content available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
