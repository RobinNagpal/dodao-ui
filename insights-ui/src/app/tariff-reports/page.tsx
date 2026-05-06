import Breadcrumbs from '@/components/ui/Breadcrumbs';
import TariffReportsPageActions from '@/components/industry-tariff/TariffReportsPageActions';
import { findIndustryByLegacyUrl, TariffIndustryDefinition } from '@/scripts/industry-tariff-reports/tariff-industries';
import { getTariffReportsListing } from '@/utils/tariff-reports/tariff-reports-listing';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ArrowRight, FileText, Layers } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

// Render at request time; the build environment does not provision DATABASE_URL for the Prisma listing query.
// The listing data itself is cached via unstable_cache in getTariffReportsListing.
export const dynamic = 'force-dynamic';

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

interface ChapterCardProps {
  chapterNumber: number;
  chapterTitle: string;
  chapterSlug: string;
  industry: TariffIndustryDefinition | undefined;
  lastModified?: string;
}

function ChapterCard({ chapterNumber, chapterTitle, chapterSlug, industry, lastModified }: ChapterCardProps) {
  const padded = chapterNumber.toString().padStart(2, '0');
  const href = industry ? `/industry-tariff-report/${industry.industryId}` : `/industry-tariff-report/chapters/${chapterSlug}`;
  const title = industry?.reportTitle ?? `HTS Chapter ${padded} — ${chapterTitle}`;
  const description =
    industry?.reportOneLiner ??
    `Tariff and trade-policy analysis for HTS Chapter ${padded} (${chapterTitle}). Browse tariff updates, country-level breakdowns, industry structure, and forward-looking conclusions.`;

  return (
    <article className="group flex flex-col rounded-2xl bg-gray-900 border border-gray-800 transition-all hover:border-blue-500 p-6">
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
          <Layers className="h-3 w-3" />
          HTS Chapter {padded}
        </span>
        {lastModified && <span className="text-gray-400">Updated {formatDate(lastModified)}</span>}
      </div>

      <h3 className="mb-2 text-xl font-semibold leading-snug text-white">
        <Link href={href} className="transition-colors group-hover:text-blue-400 focus-visible:text-blue-400 focus-visible:outline-none">
          {title}
        </Link>
      </h3>

      {industry && <p className="mb-2 text-xs uppercase tracking-wide text-gray-400">{chapterTitle}</p>}

      <p className="mb-5 line-clamp-3 flex-1 text-sm text-gray-300">{description}</p>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {REPORT_SECTIONS.map((section) => (
          <Link
            key={section.slug}
            href={`${href}/${section.slug}`}
            className="inline-flex items-center rounded-md border border-gray-800 px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:border-blue-500 hover:bg-blue-500/5 hover:text-blue-400"
          >
            {section.label}
          </Link>
        ))}
      </div>

      <Link href={href} className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 transition-colors group-hover:text-blue-300">
        Open report
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

export default async function TariffReportsPage() {
  const rows = await getTariffReportsListing();

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'Reports', href: '/reports', current: false },
    { name: 'Tariff Reports', href: '/tariff-reports', current: true },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-color">
        <header className="mb-10">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tariff Reports by HTS Chapter</h1>
            <TariffReportsPageActions />
          </div>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Tariff and trade-policy analysis for chapters of the U.S. Harmonized Tariff Schedule (HTS). Each report covers tariff updates, country breakdowns,
            industry structure, sub-areas, and forward-looking conclusions.
          </p>
        </header>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-4 text-lg font-medium text-white">No tariff reports available</h3>
            <p className="mt-2 text-sm text-gray-400">Tariff reports will appear here once they are created.</p>
          </div>
        ) : (
          <section className="mb-14">
            <div className="mb-6 flex items-baseline justify-between border-b border-gray-800 pb-2">
              <h2 className="text-2xl font-semibold text-white">All Chapters</h2>
              <span className="text-sm text-gray-400">{rows.length} chapters</span>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((row) => {
                const industry = findIndustryByLegacyUrl(row.oldUrl);
                return (
                  <ChapterCard
                    key={row.slug}
                    chapterNumber={row.chapter.number}
                    chapterTitle={row.chapter.title}
                    chapterSlug={row.slug}
                    industry={industry}
                    lastModified={row.updatedAt}
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>
    </PageWrapper>
  );
}
