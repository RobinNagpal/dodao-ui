import PrivateWrapper from '@/components/auth/PrivateWrapper';
import ReportCoverActions from '@/components/industry-tariff/section-actions/ReportCoverActions';
import { renderSection } from '@/components/industry-tariff/renderers/SectionRenderer';
import TariffCrossLinks from '@/components/tariff-cross-links/TariffCrossLinks';
import { getTariffIndustryDefinitionById, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { getHtsChapterRefByIndustryId } from '@/utils/tariff-cross-links/hts-chapter-ref';
import { tariffReportTag } from '@/utils/tariff-report-tags';
import { Calculator, ListTree } from 'lucide-react';

// Shared async render for the industry cover body. Used by the cover route
// itself and by the legacy `/evaluate-industry-areas` and `/all-countries-tariff-updates`
// URLs, which now mirror the cover content with `<link rel="canonical">`
// pointing back at the cover instead of 301-redirecting away.
export async function renderIndustryCoverBody(industryId: string): Promise<JSX.Element> {
  const definition = getTariffIndustryDefinitionById(industryId as TariffIndustryId);

  const reportResponse = await fetch(`${getBaseUrlForServerSidePages()}/api/industry-tariff-reports/${industryId}`, {
    next: { tags: [tariffReportTag(industryId)] },
  });
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

  const seoDetails = report.reportSeoDetails?.reportCoverSeoDetails;
  const isSeoMissing = !seoDetails || !seoDetails.title || !seoDetails.shortDescription || !seoDetails.keywords?.length;

  const tariffUpdatesSummary =
    report.tariffUpdates?.countrySpecificTariffs?.map((tariff) => ({
      countryName: tariff.countryName,
      newChangesFirstSentence: tariff.newChanges,
    })) || [];

  const htsChapter = await getHtsChapterRefByIndustryId(industryId);
  const crossLinks = [
    {
      href: '/tariff-calculator',
      title: 'Tariff Calculator',
      description: `Estimate landed US duty for goods covered by this report — base HTS rate plus Section 232, 301, IEEPA fees.`,
      icon: <Calculator className="h-5 w-5" />,
    },
    htsChapter
      ? {
          href: htsChapter.href,
          title: `HTS Chapter ${htsChapter.chapterNumber.toString().padStart(2, '0')} — ${htsChapter.chapterTitle}`,
          description: 'Browse every HTS code in the chapter that covers this industry, with duty rates and units.',
          icon: <ListTree className="h-5 w-5" />,
        }
      : null,
  ].filter((link): link is NonNullable<typeof link> => link !== null);

  return (
    <div className="mx-auto max-w-7xl py-2">
      <div className="mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold heading-color">{report?.reportCover?.title || 'Tariff report for ' + industryId}</h1>
          <PrivateWrapper>
            <ReportCoverActions industryId={industryId} />
          </PrivateWrapper>
        </div>
      </div>

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

      <TariffCrossLinks heading="Tools for this industry" links={crossLinks} />

      <div className="space-y-12">
        {renderSection(
          'Overview',
          report.reportCover?.reportCoverContent ? (
            <div
              className="prose max-w-none markdown markdown-body"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(report.reportCover.reportCoverContent) }}
            />
          ) : (
            <p className="text-gray-500 italic">No content available</p>
          )
        )}

        {tariffUpdatesSummary.length > 0 &&
          renderSection(
            `Latest ${definition.name} Tariff Actions`,
            <div>
              <div className="space-y-4 mb-4">
                {tariffUpdatesSummary.map((tariff, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="font-bold text-lg mb-2">{tariff.countryName}</h3>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: parseMarkdown(tariff.newChangesFirstSentence),
                      }}
                      className="markdown markdown-body"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <a href={`/industry-tariff-report/${industryId}/tariff-updates`} className="link-color underline font-medium">
                  See full country breakdown
                </a>
              </div>
            </div>
          )}

        {report.executiveSummary?.executiveSummary &&
          renderSection(
            'Executive Summary',
            <div
              className="prose max-w-none markdown markdown-body"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(report.executiveSummary.executiveSummary) }}
            />
          )}
      </div>
    </div>
  );
}
