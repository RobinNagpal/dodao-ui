import type { TariffReportListingItem } from '@/app/api/tariff-reports/listing/route';
import BreadcrumbsWithJsonLd from '@/components/ui/BreadcrumbsWithJsonLd';
import TariffChapterCardGrid from '@/components/industry-tariff/TariffChapterCardGrid';
import TariffReportsPageActions from '@/components/industry-tariff/TariffReportsPageActions';
import ToolPills from '@/components/tariff-cross-links/ToolPills';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { hasChapterExports } from '@/utils/tariff-reports/chapter-exports';
import { getChapterPrototype } from '@/utils/tariff-reports/chapter-prototype';
import { approach2SectionLabel, CHAPTER_REPORT_SECTIONS, chapterCoverHref, chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import { TARIFF_REPORTS_LISTING_TAG } from '@/utils/tariff-report-tags';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ArrowRight, Calculator, FileText, Layers, ListTree, Ship } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

async function fetchTariffReportsListing(): Promise<TariffReportListingItem[]> {
  const url = `${getBaseUrlForServerSidePages()}/api/tariff-reports/listing`;
  try {
    const res = await fetch(url, { next: { tags: [TARIFF_REPORTS_LISTING_TAG] } });
    if (!res.ok) {
      console.error(`Failed to fetch tariff reports listing: HTTP ${res.status}`);
      return [];
    }
    return (await res.json()) as TariffReportListingItem[];
  } catch (e) {
    console.error('Failed to fetch tariff reports listing:', e);
    return [];
  }
}

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

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

interface ChapterCardProps {
  chapterNumber: number;
  chapterTitle: string;
  chapterSlug: string;
  lastModified?: string;
  // Chapters with export pages get a second "U.S. exports" link next to "Open report".
  hasExports: boolean;
}

// Card-only ordering: shorter labels first so the 5 section pills fit in two rows
// instead of three. The canonical reading order lives in CHAPTER_REPORT_SECTIONS.
const CARD_SECTION_DISPLAY_ORDER = ['tariff-updates', 'industry-areas', 'tariff-engineering', 'understand-industry', 'final-conclusion'];

function ChapterCard({ chapterNumber, chapterTitle, chapterSlug, lastModified, hasExports }: ChapterCardProps) {
  const padded = chapterNumber.toString().padStart(2, '0');
  const href = chapterCoverHref(chapterSlug);
  const title = `${chapterTitle}`;
  const description = `Tariff and trade-policy analysis for HTS Chapter ${padded} (${chapterTitle}). Browse tariff updates, country-level breakdowns, industry structure, and forward-looking conclusions.`;
  // Approach-2 chapters name their pages differently (see approach2SectionLabel); the pills match their tabs.
  const isApproach2 = Boolean(getChapterPrototype(chapterSlug));
  const orderedSections = CARD_SECTION_DISPLAY_ORDER.map((slug) => CHAPTER_REPORT_SECTIONS.find((s) => s.slug === slug)).filter(
    (s): s is (typeof CHAPTER_REPORT_SECTIONS)[number] => Boolean(s)
  );

  return (
    // The whole card opens the report: the title link stretches over it (::after), and the
    // section pills and "Open report" sit above that overlay (relative z-10) so they keep their own targets.
    <article className="group relative flex flex-col rounded-2xl bg-bg border border-border transition-all hover:border-primary p-6">
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
          <Layers className="h-3 w-3" />
          HTS Chapter {padded}
        </span>
        {lastModified && <span className="text-muted">Updated {formatDate(lastModified)}</span>}
      </div>

      <h3 className="mb-2 text-xl font-semibold leading-snug text-heading">
        <Link
          href={href}
          className="transition-colors after:absolute after:inset-0 after:rounded-2xl after:content-[''] group-hover:text-link focus-visible:text-link focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary"
        >
          {title}
        </Link>
      </h3>

      <p className="mb-5 line-clamp-3 flex-1 text-sm text-muted">{description}</p>

      <div className="relative z-10 mb-5 flex flex-wrap gap-1.5">
        {orderedSections.map((section) => (
          <Link
            key={section.slug}
            href={chapterSectionHref(chapterSlug, section.slug)}
            className="inline-flex items-center rounded-md border border-border px-2 py-1 text-xs font-medium text-muted transition-colors hover:border-primary hover:bg-blue-500/5 hover:text-primary"
          >
            {isApproach2 ? approach2SectionLabel(section.slug) : section.label}
          </Link>
        ))}
      </div>

      <div className="relative z-10 mt-auto flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-medium text-link transition-colors group-hover:text-link">
          Open report
          <ArrowRight className="h-4 w-4" />
        </Link>
        {hasExports && (
          <Link
            href={chapterSectionHref(chapterSlug, 'exports')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-link"
          >
            <Ship className="h-4 w-4" />
            U.S. exports
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </article>
  );
}

export default async function TariffReportsPage() {
  const rows = await fetchTariffReportsListing();

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'Reports', href: '/reports', current: false },
    { name: 'Tariff Reports', href: '/tariff-reports', current: true },
  ];

  return (
    <PageWrapper>
      <BreadcrumbsWithJsonLd breadcrumbs={breadcrumbs} />

      <div className="text-color">
        <header className="mb-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tariff Reports by HTS Chapter</h1>
            <div className="flex flex-wrap items-center gap-2">
              <ToolPills
                links={[
                  {
                    href: '/tariff-calculator',
                    label: 'Tariff Calculator',
                    description: 'Estimate US import duty: base HTS rate plus Section 232, 301, IEEPA, and processing fees.',
                    icon: <Calculator className="h-4 w-4" />,
                    tone: 'indigo',
                  },
                  {
                    href: '/hts-codes',
                    label: 'HTS Code Browser',
                    description: 'Browse every HTSUS section and chapter to find the code you need before you calculate.',
                    icon: <ListTree className="h-4 w-4" />,
                    tone: 'emerald',
                  },
                ]}
              />
              <TariffReportsPageActions />
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Tariff and trade-policy analysis for chapters of the U.S. Harmonized Tariff Schedule (HTS). Each report covers tariff updates, country breakdowns,
            industry structure, sub-areas, and forward-looking conclusions.
          </p>
        </header>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-border bg-bg py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted" />
            <h3 className="mt-4 text-lg font-medium text-heading">No tariff reports available</h3>
            <p className="mt-2 text-sm text-muted">Tariff reports will appear here once they are created.</p>
          </div>
        ) : (
          <section className="mb-14">
            <div className="mb-6 flex items-baseline justify-between border-b border-border pb-2">
              <h2 className="text-2xl font-semibold text-heading">All Chapters</h2>
              <span className="text-sm text-muted">{rows.length} chapters</span>
            </div>
            <TariffChapterCardGrid
              items={rows.map((row) => ({
                key: row.slug,
                hasExports: hasChapterExports(row.slug),
                card: (
                  <ChapterCard
                    chapterNumber={row.chapter.number}
                    chapterTitle={row.chapter.title}
                    chapterSlug={row.slug}
                    lastModified={row.updatedAt}
                    hasExports={hasChapterExports(row.slug)}
                  />
                ),
              }))}
            />
          </section>
        )}
      </div>
    </PageWrapper>
  );
}
