import type { TariffSectionListItem } from '@/app/api/tariff-calculator/sections/route';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { chapterDetailHref } from '@/utils/tariff-calculator/chapter-slug';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ChevronRight } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24h

export const metadata: Metadata = {
  title: 'HTS Codes | KoalaGains',
  description:
    'Browse the Harmonized Tariff Schedule of the United States (HTSUS) by section and chapter. View duty rates, units of measure, and official chapter notes for every HTS code.',
  alternates: { canonical: 'https://koalagains.com/hts-codes' },
  openGraph: {
    title: 'HTS Codes | KoalaGains',
    description: 'Browse HTSUS sections, chapters, and codes with official duty rates.',
    url: 'https://koalagains.com/hts-codes',
    siteName: 'KoalaGains',
    type: 'website',
  },
  keywords: ['HTS codes', 'HTSUS', 'harmonized tariff schedule', 'US tariffs', 'duty rates', 'tariff calculator'],
};

async function fetchSections(): Promise<TariffSectionListItem[]> {
  // Falls back to [] when the API is unreachable (e.g. `next build` without
  // DATABASE_URL). The page renders the empty state in that case and
  // re-fetches at request time once the live API is reachable.
  const url = `${getBaseUrlForServerSidePages()}/api/tariff-calculator/sections`;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
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
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">HTS Codes</h1>
          <p className="text-muted-foreground max-w-3xl">
            The Harmonized Tariff Schedule of the United States (HTSUS) classifies every imported good with a 10-digit code. Browse chapters by section to look
            up duty rates, units of measure, and official notes.
          </p>
        </header>

        {sections.length === 0 ? (
          <div className="text-center py-16 background-color rounded-lg border border-color">
            <h2 className="text-lg font-medium">No HTS sections loaded yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              POST the section/chapter index to <code className="font-mono">/api/tariff-calculator/sections</code>, then run{' '}
              <code className="font-mono">yarn hts:generate-sql</code> and apply the generated SQL file to the database.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.id}>
                <h2 className="text-xl font-semibold mb-4 border-b border-color pb-2">
                  <span className="font-mono tabular-nums text-muted-foreground mr-3">Section {section.romanNumeral}</span>
                  {section.title}
                </h2>
                {section.chapters.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No chapters loaded for this section yet.</p>
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {section.chapters.map((chapter) => (
                      <li key={chapter.id}>
                        <Link
                          href={chapterDetailHref(chapter.number, chapter.title)}
                          className="group flex items-center justify-between gap-3 rounded-lg border border-color background-color px-4 py-3 transition hover:border-primary-color hover:shadow-sm"
                        >
                          <span className="flex items-baseline gap-3 min-w-0">
                            <span className="font-mono text-sm text-muted-foreground tabular-nums">{chapter.number.toString().padStart(2, '0')}</span>
                            <span className="font-medium truncate">{chapter.title}</span>
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
