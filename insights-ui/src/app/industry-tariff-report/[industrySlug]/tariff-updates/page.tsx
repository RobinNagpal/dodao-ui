import { getMarkdownContentForIntroduction } from '@/scripts/industry-tariff-reports/02-introduction';
import { getMarkdownContentForIndustryTariffs } from '@/scripts/industry-tariff-reports/03-industry-tariffs';
import { parseMarkdown } from '@/util/parse-markdown';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import TariffUpdatesActions from '@/components/industry-tariff/section-actions/TariffUpdatesActions';
import Link from 'next/link';

export default async function TariffUpdatesPage({ params }: { params: Promise<{ industrySlug: string }> }) {
  const { industrySlug } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industrySlug}`, { cache: 'no-cache' });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  const content = report.tariffUpdates ? parseMarkdown(getMarkdownContentForIndustryTariffs('Plastics', report.tariffUpdates)) : 'No content available';

  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <TariffUpdatesActions industrySlug={industrySlug} />
        </PrivateWrapper>
      </div>

      <div dangerouslySetInnerHTML={{ __html: content }} className="markdown-body" />
    </div>
  );
}
