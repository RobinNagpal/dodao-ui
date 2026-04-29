import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { chapterDetailHref } from '@/utils/tariff-calculator/chapter-slug';
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

interface ChapterRow {
  id: string;
  number: number;
  title: string;
  section: string;
}

interface SectionGroup {
  section: string;
  // Chapter number of the lowest-numbered chapter in the section. Drives the
  // section sort order so sections render in HTSUS canonical order (I..XXII).
  firstChapterNumber: number;
  chapters: ChapterRow[];
}

function groupBySection(chapters: ChapterRow[]): SectionGroup[] {
  const map = new Map<string, SectionGroup>();
  for (const chapter of chapters) {
    let group = map.get(chapter.section);
    if (!group) {
      group = { section: chapter.section, firstChapterNumber: chapter.number, chapters: [] };
      map.set(chapter.section, group);
    }
    group.chapters.push(chapter);
    if (chapter.number < group.firstChapterNumber) {
      group.firstChapterNumber = chapter.number;
    }
  }
  return [...map.values()].sort((a, b) => a.firstChapterNumber - b.firstChapterNumber);
}

export default async function HtsCodesIndexPage() {
  const chapters = await prisma.tariffChapter.findMany({
    where: { spaceId: KoalaGainsSpaceId },
    orderBy: { number: 'asc' },
    select: { id: true, number: true, title: true, section: true },
  });
  const groups = groupBySection(chapters);

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

        {groups.length === 0 ? (
          <div className="text-center py-16 background-color rounded-lg border border-color">
            <h2 className="text-lg font-medium">No HTS chapters loaded yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Run <code className="font-mono">yarn hts:import-chapter</code> to ingest a chapter from the HTSUS CSV.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {groups.map((group) => (
              <section key={group.section}>
                <h2 className="text-xl font-semibold mb-4 border-b border-color pb-2">{group.section}</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.chapters.map((chapter) => (
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
              </section>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
