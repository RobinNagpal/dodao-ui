import ChapterEditForm from '@/components/industry-tariff/chapter/edit/ChapterEditForm';
import { getReportContextBySlug, readIndustryTariffReportBySlug } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { CHAPTER_EDIT_FIELDS, EMPTY_EDIT_CONTENT, type EditableReportContent } from '@/utils/tariff-reports/chapter-edit-fields';
import { CHAPTER_REPORT_SECTIONS, chapterCoverHref, chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const chapterEditMetadata: Metadata = {
  title: 'Edit Tariff Report | KoalaGains',
  robots: { index: false, follow: false },
};

// Shared body of every `/industry-tariff-report/chapters/<slug>[/<section>]/edit` route. Reads
// straight from the DB (not the cached API) so admins always edit the latest content.
export async function renderChapterEditPage(chapterSlug: string, pageSlug: string): Promise<JSX.Element> {
  const fields = CHAPTER_EDIT_FIELDS[pageSlug];
  if (!fields) notFound();
  const context = await getReportContextBySlug(chapterSlug).catch(() => null);
  if (!context) notFound();

  const report = await readIndustryTariffReportBySlug(chapterSlug);
  const initialContent: EditableReportContent = Object.fromEntries(fields.map((field) => [field, report[field] ?? EMPTY_EDIT_CONTENT[field]]));
  const sectionLabel = CHAPTER_REPORT_SECTIONS.find((s) => s.slug === pageSlug)?.label ?? 'Overview';
  const backHref = pageSlug === 'overview' ? chapterCoverHref(chapterSlug) : chapterSectionHref(chapterSlug, pageSlug);

  return <ChapterEditForm chapterSlug={chapterSlug} pageSlug={pageSlug} pageTitle={sectionLabel} backHref={backHref} initialContent={initialContent} />;
}
