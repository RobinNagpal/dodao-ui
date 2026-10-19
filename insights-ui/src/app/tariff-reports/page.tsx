import type { TariffSectionListItem } from '@/app/api/tariff-calculator/sections/route';
import type { TariffReportListingItem } from '@/app/api/tariff-reports/listing/route';
import { chapterReportNavItems } from '@/components/industry-tariff/chapter/ChapterRelatedSections';
import BreadcrumbsWithJsonLd from '@/components/ui/BreadcrumbsWithJsonLd';
import TariffChapterList, { type TariffChapterListGroup, type TariffChapterListItem } from '@/components/industry-tariff/TariffChapterList';
import TariffReportsPageActions from '@/components/industry-tariff/TariffReportsPageActions';
import ToolPills from '@/components/tariff-cross-links/ToolPills';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { hasChapterExports } from '@/utils/tariff-reports/chapter-exports';
import { type ChapterPrototypeCard, getChapterPrototypeCard, hasChapterPrototype } from '@/utils/tariff-reports/chapter-prototype';
import { IndexListRow, type IndexListLink, type IndexListLinkGroup } from '@/components/ui/sections/IndexList';
import { TARIFF_SECTIONS_LISTING_TAG } from '@/utils/tariff-calculator/cache-tags';
import { chapterCoverHref } from '@/utils/tariff-reports/chapter-route-helpers';
import { TARIFF_REPORTS_LISTING_TAG } from '@/utils/tariff-report-tags';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Calculator, FileText, ListTree } from 'lucide-react';
import { Metadata } from 'next';

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

// `utc` for date-only ISO strings ("2026-10-09"), which parse as UTC midnight and would otherwise
// show the previous day in U.S. time zones.
function formatDate(value: string, utc = false): string {
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', ...(utc ? { timeZone: 'UTC' } : {}) });
}

// Same section index as the HTS code browser, so the two pages group chapters the same way.
async function fetchSections(): Promise<TariffSectionListItem[]> {
  const url = `${getBaseUrlForServerSidePages()}/api/tariff-calculator/sections`;
  try {
    const res = await fetch(url, { next: { tags: [TARIFF_SECTIONS_LISTING_TAG] } });
    if (!res.ok) {
      console.error(`Failed to fetch tariff sections: HTTP ${res.status}`);
      return [];
    }
    return (await res.json()) as TariffSectionListItem[];
  } catch (e) {
    console.error('Failed to fetch tariff sections:', e);
    return [];
  }
}

function chapterRange(chapters: TariffSectionListItem['chapters']): string | undefined {
  if (chapters.length === 0) return undefined;
  const numbers = chapters.map((c) => c.number);
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  return min === max ? `Chapter ${min}` : `Chapters ${min} – ${max}`;
}

// One chapter as a list row: number, title, updated date, summary, then a link per report page
// (same pages and order as the report's tabs); chapters with export pages add their export pages
// as a second, named group.
// Approach-2 chapters (content file) name their pages like their tabs and take their date and
// summary from the file; DB-backed chapters show no summary rather than boilerplate.
function chapterListItem(row: TariffReportListingItem, sectionTitle: string, approach2: ChapterPrototypeCard | null): TariffChapterListItem {
  const { number, title } = row.chapter;
  const padded = number.toString().padStart(2, '0');
  const hasExports = hasChapterExports(row.slug);
  const updatedLabel = approach2 ? formatDate(approach2.asOf, true) : row.updatedAt ? formatDate(row.updatedAt) : null;
  const chapter = { number, title, slug: row.slug };
  const toLinks = (items: Array<{ href: string; label: string }>): IndexListLink[] => items.map((item) => ({ href: item.href, label: item.label }));
  const importLinks = toLinks(chapterReportNavItems(chapter, 'import', Boolean(approach2)));
  // Chapters with export pages list both halves, each under its own name, like the report's own switch.
  const linkGroups: IndexListLinkGroup[] = hasExports
    ? [
        { label: 'U.S. imports', links: importLinks },
        { label: 'U.S. exports', links: toLinks(chapterReportNavItems(chapter, 'export', true)) },
      ]
    : [{ links: importLinks }];

  return {
    key: row.slug,
    chapterNumber: number,
    searchText: [`chapter ${padded} ${number}`, title, approach2?.summary ?? '', sectionTitle].join(' ').toLowerCase(),
    hasExports,
    row: (
      <IndexListRow
        number={padded}
        title={title}
        href={chapterCoverHref(row.slug)}
        meta={updatedLabel ? `Updated ${updatedLabel}` : undefined}
        summary={approach2?.summary}
        linkGroups={linkGroups}
        linksLabel={`Chapter ${padded} report pages`}
      />
    ),
  };
}

// Groups the chapters under their HTS sections, in section order; chapters the section index does
// not list (or every chapter, if it failed to load) go in a final ungrouped list.
function groupChapters(
  rows: TariffReportListingItem[],
  sections: TariffSectionListItem[],
  approach2Cards: Map<string, ChapterPrototypeCard | null>
): TariffChapterListGroup[] {
  const byNumber = new Map(rows.map((row) => [row.chapter.number, row]));
  const placed = new Set<number>();
  const groups: TariffChapterListGroup[] = [];

  for (const section of sections) {
    const sectionRows = section.chapters
      .map((c) => byNumber.get(c.number))
      .filter((row): row is TariffReportListingItem => Boolean(row))
      .sort((a, b) => a.chapter.number - b.chapter.number);
    if (sectionRows.length === 0) continue;
    sectionRows.forEach((row) => placed.add(row.chapter.number));
    groups.push({
      key: `section-${section.number}`,
      label: `Section ${section.romanNumeral}`,
      title: section.title,
      subtitle: chapterRange(section.chapters),
      items: sectionRows.map((row) => chapterListItem(row, section.title, approach2Cards.get(row.slug) ?? null)),
    });
  }

  const rest = rows.filter((row) => !placed.has(row.chapter.number)).sort((a, b) => a.chapter.number - b.chapter.number);
  if (rest.length > 0) {
    groups.push({
      key: 'other',
      title: groups.length > 0 ? 'Other chapters' : 'All chapters',
      items: rest.map((row) => chapterListItem(row, '', approach2Cards.get(row.slug) ?? null)),
    });
  }
  return groups;
}

export default async function TariffReportsPage() {
  const [rows, sections] = await Promise.all([fetchTariffReportsListing(), fetchSections()]);
  // Approach-2 chapters' card facts come from their content files (one lazily loaded chunk each).
  const approach2Cards = new Map(
    await Promise.all(rows.filter((row) => hasChapterPrototype(row.slug)).map(async (row) => [row.slug, await getChapterPrototypeCard(row.slug)] as const))
  );

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
            What the U.S. charges on each chapter of the Harmonized Tariff Schedule (HTS): today&apos;s rates, recent changes, rates by country and ways to
            lower the duty. Search by chapter number or product, or browse by section below.
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
            <TariffChapterList groups={groupChapters(rows, sections, approach2Cards)} />
          </section>
        )}
      </div>
    </PageWrapper>
  );
}
