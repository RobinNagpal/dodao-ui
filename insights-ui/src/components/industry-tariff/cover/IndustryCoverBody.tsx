import PrivateWrapper from '@/components/auth/PrivateWrapper';
import ReportCoverActions from '@/components/industry-tariff/section-actions/ReportCoverActions';
import { renderSection } from '@/components/industry-tariff/renderers/SectionRenderer';
import {
  getAllChaptersForIndustry,
  getPrimaryChapterForIndustry,
  getTariffIndustryDefinitionById,
  TariffIndustryId,
} from '@/scripts/industry-tariff-reports/tariff-industries';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import { chapterCoverHref } from '@/utils/tariff-reports/chapter-route-helpers';
import { tariffReportTag } from '@/utils/tariff-report-tags';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ChevronRight, Layers } from 'lucide-react';
import Link from 'next/link';

// Shared async render for the industry cover body. Used by the cover route
// itself and by the legacy `/evaluate-industry-areas` and `/all-countries-tariff-updates`
// URLs, which now mirror the cover content with `<link rel="canonical">`
// pointing back at the cover instead of 301-redirecting away.
export async function renderIndustryCoverBody(industryId: string): Promise<JSX.Element> {
  const definition = getTariffIndustryDefinitionById(industryId as TariffIndustryId);

  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, {
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

  const primaryChapter = getPrimaryChapterForIndustry(definition);
  const relatedChapters = getAllChaptersForIndustry(definition).filter((chapter) => chapter.number !== primaryChapter?.number);

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

      <div className="space-y-12">
        {renderSection(
          'Overview',
          report.reportCover ? (
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

        {report.executiveSummary &&
          renderSection(
            'Executive Summary',
            <div
              className="prose max-w-none markdown markdown-body"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(report.executiveSummary.executiveSummary) }}
            />
          )}

        {relatedChapters.length > 0 &&
          renderSection(
            'Related HTS Chapters',
            <div>
              <p className="text-muted-foreground mb-6">
                Additional Harmonized Tariff Schedule chapters covered by this industry. Each chapter has its own dedicated page with tariff updates, country
                breakdowns, and analysis.
              </p>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {relatedChapters.map((chapter) => {
                  const padded = chapter.number.toString().padStart(2, '0');
                  return (
                    <li key={chapter.number}>
                      <Link
                        href={chapterCoverHref(chapter)}
                        className="group flex items-center justify-between rounded-lg border border-color background-color px-4 py-3 transition hover:border-emerald-500/60 hover:bg-emerald-500/5"
                      >
                        <span className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/20">
                            <Layers className="h-4 w-4" />
                          </span>
                          <span>
                            <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">HTS Chapter {padded}</span>
                            <span className="block font-medium group-hover:text-emerald-400">{chapter.shortName}</span>
                          </span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-emerald-400" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
      </div>
    </div>
  );
}
