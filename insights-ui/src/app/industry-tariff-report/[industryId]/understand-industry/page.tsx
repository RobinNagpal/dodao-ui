import PrivateWrapper from '@/components/auth/PrivateWrapper';
import UnderstandIndustryActions from '@/components/industry-tariff/section-actions/UnderstandIndustryActions';
import { UnderstandIndustryRenderer } from '@/components/industry-tariff/renderers/UnderstandIndustryRenderer';

import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { fetchIndustryUnderstandIndustryMetadata } from '@/utils/tariff-reports/industry-metadata';
import { tariffReportTag } from '@/utils/tariff-report-tags';
import { Metadata } from 'next';
import { isValidTariffIndustryId } from '@/utils/tariff-reports/tariff-input-validation';
import { getChapterSlugForOldUrl } from '@/utils/tariff-reports/seeded-chapter-reports';
import { chapterCoverHref } from '@/utils/tariff-reports/chapter-route-helpers';
import Stack from '@/components/ui/containers/Stack';
import NoticeCallout from '@/components/ui/NoticeCallout';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ industryId: string }> }): Promise<Metadata> {
  const { industryId } = await params;
  return fetchIndustryUnderstandIndustryMetadata(industryId);
}

export default async function UnderstandIndustryPage({ params }: { params: Promise<{ industryId: string }> }) {
  const { industryId } = await params;
  // Malformed / unknown industry: the `[industryId]` layout logs the rejection; 404 silently here.
  if (!isValidTariffIndustryId(industryId)) notFound();

  // Fetch the report data, and the chapter this legacy industry maps to (for the link to its tariff pages)
  const [reportResponse, chapterSlug] = await Promise.all([
    fetch(`${getBaseUrlForServerSidePages()}/api/industry-tariff-reports/${industryId}`, {
      next: { tags: [tariffReportTag(industryId)] },
    }),
    getChapterSlugForOldUrl(industryId),
  ]);
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

  return (
    <div className="mx-auto max-w-7xl py-2">
      {/* Title and Actions */}
      <div className="mb-8 pb-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold heading-color">Understand Industry</h1>
          <PrivateWrapper>
            <UnderstandIndustryActions industryId={industryId} />
          </PrivateWrapper>
        </div>
      </div>

      {/* This page is the industry analysis; the chapter pages carry the current tariff rates and import data. */}
      {chapterSlug && (
        <Stack mb="lg">
          <NoticeCallout tone="info">
            <Text as="span" size="inherit" tone="inherit">
              Tariff rates and import data for this industry:{' '}
            </Text>
            <TextLink href={chapterCoverHref(chapterSlug)}>HS Chapter {chapterSlug.split('-')[0]} →</TextLink>
          </NoticeCallout>
        </Stack>
      )}

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
        {report.understandIndustry ? (
          <UnderstandIndustryRenderer understandIndustry={report.understandIndustry} />
        ) : (
          <div className="bg-bg rounded-lg p-6 shadow-sm">
            <p className="text-muted italic">No content available</p>
          </div>
        )}
      </div>
    </div>
  );
}
