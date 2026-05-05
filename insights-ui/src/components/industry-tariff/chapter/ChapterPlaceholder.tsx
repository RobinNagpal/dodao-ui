import { chapterUrlSlug, getAllChaptersForIndustry, HtsChapterRef, TariffIndustryDefinition } from '@/scripts/industry-tariff-reports/tariff-industries';
import { CHAPTER_REPORT_SECTIONS, chapterCoverHref, chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import { ArrowRight, Layers } from 'lucide-react';
import Link from 'next/link';

interface ChapterPlaceholderProps {
  chapter: HtsChapterRef;
  ownerIndustry: TariffIndustryDefinition | undefined;
  // Title shown above the placeholder, e.g. "Tariff Updates" for a section page or chapter name for the cover.
  pageTitle: string;
  // Optional sub-section the user is currently looking at — exclude it from the section nav block.
  currentSectionSlug?: string;
  description: string;
}

export default function ChapterPlaceholder({ chapter, ownerIndustry, pageTitle, currentSectionSlug, description }: ChapterPlaceholderProps) {
  const padded = chapter.number.toString().padStart(2, '0');
  const otherSections = CHAPTER_REPORT_SECTIONS.filter((s) => s.slug !== currentSectionSlug);
  const siblingChapters = ownerIndustry ? getAllChaptersForIndustry(ownerIndustry).filter((c) => c.number !== chapter.number) : [];

  return (
    <div className="py-6">
      <header className="mb-8 border-b border-color pb-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Layers className="h-4 w-4 text-emerald-400" />
          <span className="font-medium text-emerald-400">HTS Chapter {padded}</span>
          <span aria-hidden>·</span>
          <span>{chapter.shortName}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">{description}</p>
      </header>

      <section className="mb-10 rounded-2xl border border-color background-color p-6">
        <h2 className="text-lg font-semibold">Detailed analysis is being prepared</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;re building out the full tariff analysis for HTS Chapter {padded} ({chapter.shortName}). Use the navigation below to explore the sections of
          this chapter as content rolls out.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Sections in this chapter</h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <li>
            <Link
              href={chapterCoverHref(chapter)}
              className="group flex items-center justify-between rounded-lg border border-color background-color px-4 py-3 transition hover:border-emerald-500/60 hover:bg-emerald-500/5"
            >
              <span className="font-medium">Chapter overview</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-emerald-400" />
            </Link>
          </li>
          {otherSections.map((section) => (
            <li key={section.slug}>
              <Link
                href={chapterSectionHref(chapter, section.slug)}
                className="group flex items-center justify-between rounded-lg border border-color background-color px-4 py-3 transition hover:border-emerald-500/60 hover:bg-emerald-500/5"
              >
                <span className="font-medium">{section.label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-emerald-400" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {ownerIndustry && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">Related industry report</h2>
          <Link
            href={`/industry-tariff-report/${ownerIndustry.industryId}`}
            className="group flex items-start justify-between gap-4 rounded-2xl border border-color background-color p-5 transition hover:border-indigo-500/60 hover:shadow-lg"
          >
            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-400">Industry</div>
              <div className="text-lg font-semibold group-hover:text-indigo-400">{ownerIndustry.name}</div>
              <p className="mt-2 text-sm text-muted-foreground">{ownerIndustry.reportOneLiner}</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-indigo-400" />
          </Link>
        </section>
      )}

      {siblingChapters.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">Other chapters in {ownerIndustry?.name ?? 'this industry'}</h2>
          <ul className="flex flex-wrap gap-2">
            {siblingChapters.map((sibling) => (
              <li key={sibling.number}>
                <Link
                  href={`/industry-tariff-report/chapter/${chapterUrlSlug(sibling)}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-color px-3 py-1.5 text-sm text-muted-foreground transition hover:border-emerald-500/60 hover:text-emerald-400"
                >
                  <span className="font-mono text-xs tabular-nums">{sibling.number.toString().padStart(2, '0')}</span>
                  {sibling.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
