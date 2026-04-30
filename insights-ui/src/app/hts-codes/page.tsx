import type { TariffSectionListItem } from '@/app/api/tariff-calculator/sections/route';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { chapterDetailHref } from '@/utils/tariff-calculator/chapter-slug';
import { TARIFF_SECTIONS_LISTING_TAG } from '@/utils/tariff-calculator/cache-tags';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ChevronRight } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24h

export const metadata: Metadata = {
  title: 'HTS Code Sections & Chapters | KoalaGains',
  description:
    'Browse every section and chapter of the Harmonized Tariff Schedule of the United States (HTSUS). Drill into any chapter to view duty rates, units of measure, and official chapter notes for every HTS code.',
  alternates: { canonical: 'https://koalagains.com/hts-codes' },
  openGraph: {
    title: 'HTS Code Sections & Chapters | KoalaGains',
    description: 'Browse HTSUS sections and chapters with official duty rates.',
    url: 'https://koalagains.com/hts-codes',
    siteName: 'KoalaGains',
    type: 'website',
  },
  keywords: ['HTS codes', 'HTSUS', 'HTS sections', 'HTS chapters', 'harmonized tariff schedule', 'US tariffs', 'duty rates', 'tariff calculator'],
};

async function fetchSections(): Promise<TariffSectionListItem[]> {
  // Falls back to [] when the API is unreachable (e.g. `next build` without
  // DATABASE_URL). The page renders the empty state in that case and
  // re-fetches at request time once the live API is reachable.
  const url = `${getBaseUrlForServerSidePages()}/api/tariff-calculator/sections`;
  try {
    const res = await fetch(url, { next: { revalidate: 86400, tags: [TARIFF_SECTIONS_LISTING_TAG] } });
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

function chapterRange(chapters: TariffSectionListItem['chapters']): string | null {
  if (chapters.length === 0) return null;
  const numbers = chapters.map((c) => c.number);
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  return min === max ? `Chapter ${min}` : `Chapters ${min} – ${max}`;
}

export default async function HtsCodesIndexPage() {
  const sections = await fetchSections();

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'Reports', href: '/reports', current: false },
    { name: 'HTS Codes', href: '/hts-codes', current: true },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-color">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">HTS Code Sections &amp; Chapters</h1>
          <p className="text-muted-foreground max-w-3xl">
            The Harmonized Tariff Schedule of the United States (HTSUS) groups every imported good into 22 sections, each split into chapters. Pick a chapter to
            view its full HTS code list with duty rates, units of measure, and official notes.
          </p>
        </header>

        {sections.length === 0 ? (
          <div className="text-center py-16 background-color rounded-lg border border-color">
            <h2 className="text-lg font-medium">No HTS sections available yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Check back soon — the section and chapter index will appear here once it&apos;s loaded.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {sections.map((section) => {
              const range = chapterRange(section.chapters);
              return (
                <section key={section.id}>
                  <div className="border-b border-color pb-2 mb-4">
                    <h2 className="text-xl font-semibold text-indigo-400">
                      <span className="font-mono tabular-nums mr-3">Section {section.romanNumeral}</span>
                      {section.title}
                    </h2>
                    {range && <p className="mt-1 text-sm text-muted-foreground">{range}</p>}
                  </div>
                  {section.chapters.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No chapters loaded for this section yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {section.chapters.map((chapter) => (
                        <li key={chapter.id}>
                          <Link
                            href={chapterDetailHref(section.number, chapter.number, chapter.title)}
                            className="group flex items-center gap-3 rounded-lg border border-color background-color px-4 py-3 transition hover:border-indigo-400 hover:bg-block-bg-color hover:shadow-md"
                          >
                            <span className="font-mono text-sm text-muted-foreground tabular-nums w-8 shrink-0 group-hover:text-indigo-300">
                              {chapter.number.toString().padStart(2, '0')}
                            </span>
                            <span className="font-medium flex-1 group-hover:text-indigo-300">{chapter.title}</span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-indigo-300" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
