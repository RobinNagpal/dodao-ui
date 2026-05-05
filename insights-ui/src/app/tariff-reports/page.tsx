import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { fetchTariffReportsWithUpdatedAt } from '@/scripts/industry-tariff-reports/fetch-tariff-reports-with-updated-at';
import {
  chapterUrlSlug,
  getCanonicalIndustryForChapter,
  HTS_CHAPTERS,
  ORPHAN_HTS_CHAPTER_NUMBERS,
  TariffIndustryDefinition,
} from '@/scripts/industry-tariff-reports/tariff-industries';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ArrowRight, FileText, Layers } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Tariff Reports | KoalaGains';
  const description = 'Comprehensive collection of tariff reports. Explore industry insights and tariff impacts across various sectors.';
  const canonicalUrl = 'https://koalagains.com/tariff-reports';

  const keywords = [
    'tariff reports',
    'industry analysis',
    'tariff impacts',
    'trade policy',
    'industry evaluation',
    'sector analysis',
    'KoalaGains',
    'tariff updates',
  ];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    keywords,
  };
}

const REPORT_SECTIONS = [
  { slug: 'tariff-updates', label: 'Tariff Updates' },
  { slug: 'understand-industry', label: 'Understand Industry' },
  { slug: 'industry-areas', label: 'Industry Areas' },
  { slug: 'final-conclusion', label: 'Final Conclusion' },
] as const;

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function IndustryReportCard({ report }: { report: TariffIndustryDefinition & { lastModified: string } }) {
  const reportHref = `/industry-tariff-report/${report.industryId}`;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-color background-color transition-all duration-200 hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/5">
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500" />

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/20">
            <FileText className="h-3 w-3" />
            Tariff Report
          </span>
          {report.lastModified && <span className="text-muted-foreground">Updated {formatDate(report.lastModified)}</span>}
        </div>

        <h3 className="mb-2 text-xl font-semibold leading-snug">
          <Link href={reportHref} className="transition-colors hover:text-indigo-400 focus-visible:text-indigo-400 focus-visible:outline-none">
            {report.reportTitle}
          </Link>
        </h3>

        <p className="mb-5 line-clamp-3 flex-1 text-sm text-muted-foreground">{report.reportOneLiner}</p>

        <div className="mb-5 flex flex-wrap gap-1.5">
          {REPORT_SECTIONS.map((section) => (
            <Link
              key={section.slug}
              href={`${reportHref}/${section.slug}`}
              className="inline-flex items-center rounded-md border border-color px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-indigo-500/60 hover:bg-indigo-500/5 hover:text-indigo-300"
            >
              {section.label}
            </Link>
          ))}
        </div>

        <Link
          href={reportHref}
          className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 transition-transform hover:translate-x-0.5"
        >
          Open report
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function OrphanChapterCard({ chapterNumber }: { chapterNumber: number }) {
  const chapter = HTS_CHAPTERS[chapterNumber];
  if (!chapter) return null;
  const href = `/industry-tariff-report/chapter/${chapterUrlSlug(chapter)}`;
  const padded = chapterNumber.toString().padStart(2, '0');
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-color background-color transition-all duration-200 hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-500/5">
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/20">
            <Layers className="h-3 w-3" />
            HTS Chapter {padded}
          </span>
        </div>

        <h3 className="mb-2 text-xl font-semibold leading-snug">
          <Link href={href} className="transition-colors hover:text-emerald-400 focus-visible:text-emerald-400 focus-visible:outline-none">
            {chapter.shortName}
          </Link>
        </h3>

        <p className="mb-5 line-clamp-3 flex-1 text-sm text-muted-foreground">
          Tariff analysis for HTS Chapter {padded} ({chapter.shortName}). Browse trade flows, country-level changes, and policy impacts for this chapter of the
          Harmonized Tariff Schedule.
        </p>

        <div className="mb-5 flex flex-wrap gap-1.5">
          {REPORT_SECTIONS.map((section) => (
            <Link
              key={section.slug}
              href={`${href}/${section.slug}`}
              className="inline-flex items-center rounded-md border border-color px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-emerald-500/60 hover:bg-emerald-500/5 hover:text-emerald-300"
            >
              {section.label}
            </Link>
          ))}
        </div>

        <Link href={href} className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 transition-transform hover:translate-x-0.5">
          Open chapter report
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export default async function TariffReportsPage() {
  const tariffReports: (TariffIndustryDefinition & { lastModified: string })[] = await fetchTariffReportsWithUpdatedAt();

  const sortedTariffReports = tariffReports.sort((a, b) => {
    if (!a.lastModified && !b.lastModified) return 0;
    if (!a.lastModified) return 1;
    if (!b.lastModified) return -1;
    return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
  });

  // Chapters that have no canonical industry owner — surfaced as standalone chapter reports.
  const orphanChapters = ORPHAN_HTS_CHAPTER_NUMBERS.filter((n) => !getCanonicalIndustryForChapter(n));

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'Reports', href: '/reports', current: false },
    { name: 'Tariff Reports', href: '/tariff-reports', current: true },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-color">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Industry Tariff Reports</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Deep tariff and trade-policy analyses across industries and Harmonized Tariff Schedule (HTS) chapters. Each report covers tariff updates, country
            breakdowns, industry structure, established players and challengers, and forward-looking conclusions.
          </p>
        </header>

        <section className="mb-14">
          <div className="mb-6 flex items-baseline justify-between border-b border-color pb-2">
            <h2 className="text-2xl font-semibold">Industry Reports</h2>
            <span className="text-sm text-muted-foreground">{sortedTariffReports.length} industries</span>
          </div>

          {tariffReports.length === 0 ? (
            <div className="rounded-2xl border border-color background-color py-12 text-center shadow-sm">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No tariff reports available</h3>
              <p className="mt-2 text-sm text-muted-foreground">Tariff reports will appear here once they are created.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedTariffReports.map((report) => (
                <IndustryReportCard key={report.industryId} report={report} />
              ))}
            </div>
          )}
        </section>

        {orphanChapters.length > 0 && (
          <section className="mb-14">
            <div className="mb-6 flex items-baseline justify-between border-b border-color pb-2">
              <h2 className="text-2xl font-semibold">HTS Chapter Reports</h2>
              <span className="text-sm text-muted-foreground">{orphanChapters.length} chapters</span>
            </div>
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              Standalone tariff analyses for HTS chapters that don&apos;t map directly to one of the industry reports above. Each chapter covers the same five
              sections: tariff updates, country breakdowns, industry structure, industry areas, and final conclusion.
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {orphanChapters.map((chapterNumber) => (
                <OrphanChapterCard key={chapterNumber} chapterNumber={chapterNumber} />
              ))}
            </div>
          </section>
        )}
      </div>
    </PageWrapper>
  );
}
