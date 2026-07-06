import type { TariffReportListingItem } from '@/app/api/tariff-reports/listing/route';
import BreadcrumbsWithJsonLd from '@/components/ui/BreadcrumbsWithJsonLd';
import TariffReportsPageActions from '@/components/industry-tariff/TariffReportsPageActions';
import ToolPills from '@/components/tariff-cross-links/ToolPills';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { CHAPTER_REPORT_SECTIONS, chapterCoverHref, chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import { TARIFF_REPORTS_LISTING_TAG } from '@/utils/tariff-report-tags';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ArrowRight, Calculator, FileText, Layers, ListTree } from 'lucide-react';
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
}

// Card-only ordering: shorter labels first so the 5 section pills fit in two rows
// instead of three. The canonical reading order lives in CHAPTER_REPORT_SECTIONS.
const CARD_SECTION_DISPLAY_ORDER = ['tariff-updates', 'industry-areas', 'tariff-engineering', 'understand-industry', 'final-conclusion'];

function ChapterCard({ chapterNumber, chapterTitle, chapterSlug, lastModified }: ChapterCardProps) {
  const padded = chapterNumber.toString().padStart(2, '0');
  const href = chapterCoverHref(chapterSlug);
  const title = `${chapterTitle}`;
  const description = `Tariff and trade-policy analysis for HTS Chapter ${padded} (${chapterTitle}). Browse tariff updates, country-level breakdowns, industry structure, and forward-looking conclusions.`;
  const orderedSections = CARD_SECTION_DISPLAY_ORDER.map((slug) => CHAPTER_REPORT_SECTIONS.find((s) => s.slug === slug)).filter(
    (s): s is (typeof CHAPTER_REPORT_SECTIONS)[number] => Boolean(s)
  );

  return (
    <article className="group flex flex-col rounded-2xl bg-bg border border-surface transition-all hover:border-blue-500 p-6">
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
          <Layers className="h-3 w-3" />
          HTS Chapter {padded}
        </span>
        {lastModified && <span className="text-muted-2">Updated {formatDate(lastModified)}</span>}
      </div>

      <h3 className="mb-2 text-xl font-semibold leading-snug text-heading">
        <Link href={href} className="transition-colors group-hover:text-blue-400 focus-visible:text-blue-400 focus-visible:outline-none">
          {title}
        </Link>
      </h3>

      <p className="mb-5 line-clamp-3 flex-1 text-sm text-muted-1">{description}</p>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {orderedSections.map((section) => (
          <Link
            key={section.slug}
            href={chapterSectionHref(chapterSlug, section.slug)}
            className="inline-flex items-center rounded-md border border-surface px-2 py-1 text-xs font-medium text-muted-2 transition-colors hover:border-blue-500 hover:bg-blue-500/5 hover:text-blue-400"
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
          <div className="rounded-2xl border border-surface bg-bg py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-3" />
            <h3 className="mt-4 text-lg font-medium text-heading">No tariff reports available</h3>
            <p className="mt-2 text-sm text-muted-2">Tariff reports will appear here once they are created.</p>
          </div>
        ) : (
          <section className="mb-14">
            <div className="mb-6 flex items-baseline justify-between border-b border-surface pb-2">
              <h2 className="text-2xl font-semibold text-heading">All Chapters</h2>
              <span className="text-sm text-muted-2">{rows.length} chapters</span>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((row) => (
                <ChapterCard
                  key={row.slug}
                  chapterNumber={row.chapter.number}
                  chapterTitle={row.chapter.title}
                  chapterSlug={row.slug}
                  lastModified={row.updatedAt}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </PageWrapper>
  );
}
