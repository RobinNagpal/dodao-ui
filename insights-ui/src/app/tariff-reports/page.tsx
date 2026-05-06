import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { prisma } from '@/prisma';
import { TariffIndustries, TariffIndustryDefinition } from '@/scripts/industry-tariff-reports/tariff-industries';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
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

function findIndustryByOldUrl(oldUrl: string | null): TariffIndustryDefinition | undefined {
  if (!oldUrl) return undefined;
  return Object.values(TariffIndustries).find((industry) => industry.industryId === oldUrl);
}

interface ChapterCardProps {
  chapterNumber: number;
  chapterTitle: string;
  chapterSlug: string;
  // Set when the row's `oldUrl` matches a known industry — clicks land on the industry URL.
  industry: TariffIndustryDefinition | undefined;
  lastModified: string;
}

function ChapterCard({ chapterNumber, chapterTitle, chapterSlug, industry, lastModified }: ChapterCardProps) {
  const padded = chapterNumber.toString().padStart(2, '0');
  const href = industry ? `/industry-tariff-report/${industry.industryId}` : `/industry-tariff-report/chapters/${chapterSlug}`;
  const title = industry?.reportTitle ?? `HTS Chapter ${padded} — ${chapterTitle}`;
  const description =
    industry?.reportOneLiner ??
    `Tariff and trade-policy analysis for HTS Chapter ${padded} (${chapterTitle}). Browse tariff updates, country-level breakdowns, industry structure, and forward-looking conclusions.`;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-color background-color transition-all duration-200 hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/5">
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500" />

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/20">
            <Layers className="h-3 w-3" />
            HTS Chapter {padded}
          </span>
          <span className="text-muted-foreground">Updated {formatDate(lastModified)}</span>
        </div>

        <h3 className="mb-2 text-xl font-semibold leading-snug">
          <Link href={href} className="transition-colors hover:text-indigo-400 focus-visible:text-indigo-400 focus-visible:outline-none">
            {title}
          </Link>
        </h3>

        {industry && <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">{chapterTitle}</p>}

        <p className="mb-5 line-clamp-3 flex-1 text-sm text-muted-foreground">{description}</p>

        <div className="mb-5 flex flex-wrap gap-1.5">
          {REPORT_SECTIONS.map((section) => (
            <Link
              key={section.slug}
              href={`${href}/${section.slug}`}
              className="inline-flex items-center rounded-md border border-color px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-indigo-500/60 hover:bg-indigo-500/5 hover:text-indigo-300"
            >
              {section.label}
            </Link>
          ))}
        </div>

        <Link href={href} className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 transition-transform hover:translate-x-0.5">
          Open report
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export default async function TariffReportsPage() {
  // List every seeded chapter row. `oldUrl` decides whether the card links to an industry URL or a
  // bare chapter URL — chapters with `oldUrl` are surfaced only at `/industry-tariff-report/<oldUrl>`.
  const rows = await prisma.tariffChapterReport.findMany({
    where: { spaceId: KoalaGainsSpaceId },
    select: { slug: true, oldUrl: true, updatedAt: true, chapter: { select: { number: true, title: true } } },
    orderBy: { chapter: { number: 'asc' } },
  });

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'Reports', href: '/reports', current: false },
    { name: 'Tariff Reports', href: '/tariff-reports', current: true },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-color">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tariff Reports by HTS Chapter</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Tariff and trade-policy analysis for chapters of the U.S. Harmonized Tariff Schedule (HTS). Each report covers tariff updates, country breakdowns,
            industry structure, sub-areas, and forward-looking conclusions.
          </p>
        </header>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-color background-color py-12 text-center shadow-sm">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No tariff reports available</h3>
            <p className="mt-2 text-sm text-muted-foreground">Tariff reports will appear here once they are created.</p>
          </div>
        ) : (
          <section className="mb-14">
            <div className="mb-6 flex items-baseline justify-between border-b border-color pb-2">
              <h2 className="text-2xl font-semibold">All Chapters</h2>
              <span className="text-sm text-muted-foreground">{rows.length} chapters</span>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((row) => (
                <ChapterCard
                  key={row.chapter.number}
                  chapterNumber={row.chapter.number}
                  chapterTitle={row.chapter.title}
                  chapterSlug={row.slug}
                  industry={findIndustryByOldUrl(row.oldUrl)}
                  lastModified={row.updatedAt.toISOString()}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </PageWrapper>
  );
}
