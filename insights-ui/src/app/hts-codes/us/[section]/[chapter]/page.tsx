import type { TariffChapterDetail } from '@/app/api/tariff-calculator/chapters/[number]/route';
import type { TariffChapterListItem } from '@/app/api/tariff-calculator/chapters/route';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { chapterDetailHref, chapterUrlSegment, parseChapterSegment, parseSectionSegment, sectionUrlSegment } from '@/utils/tariff-calculator/chapter-slug';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { HtsCode } from '@prisma/client';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400; // 24h

interface RouteParams {
  section: string;
  chapter: string;
}

async function fetchChapterDetail(chapterNumber: number): Promise<TariffChapterDetail | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/tariff-calculator/chapters/${chapterNumber.toString().padStart(2, '0')}`;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) {
      if (res.status !== 404) console.error(`Failed to fetch chapter ${chapterNumber}: HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as TariffChapterDetail | null;
  } catch (e) {
    console.error(`Failed to fetch chapter ${chapterNumber}:`, e);
    return null;
  }
}

async function fetchChapterList(): Promise<TariffChapterListItem[]> {
  const url = `${getBaseUrlForServerSidePages()}/api/tariff-calculator/chapters`;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) {
      console.error(`Failed to fetch chapter list: HTTP ${res.status}`);
      return [];
    }
    return (await res.json()) as TariffChapterListItem[];
  } catch (e) {
    console.error('Failed to fetch chapter list:', e);
    return [];
  }
}

export async function generateStaticParams(): Promise<RouteParams[]> {
  const chapters = await fetchChapterList();
  return chapters.map((c) => ({
    section: sectionUrlSegment(c.sectionNumber),
    chapter: chapterUrlSegment(c.number, c.title),
  }));
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { section: sectionRaw, chapter: chapterRaw } = await params;
  const sectionNumber = parseSectionSegment(sectionRaw);
  const chapterNumber = parseChapterSegment(chapterRaw);
  if (sectionNumber === null || chapterNumber === null) return { title: 'HTS Codes | KoalaGains' };

  const chapter = await fetchChapterDetail(chapterNumber);
  if (!chapter || chapter.section.number !== sectionNumber) return { title: 'HTS Codes | KoalaGains' };

  const padded = chapter.number.toString().padStart(2, '0');
  const title = `Chapter ${padded} — ${chapter.title} | HTS Codes | KoalaGains`;
  const description = `HTSUS Chapter ${padded}: ${chapter.title}. Browse every HTS code in this chapter with general rate, special rate, column 2 rate, units of measure, and applicable additional duties.`;
  const canonical = `https://koalagains.com${chapterDetailHref(chapter.section.number, chapter.number, chapter.title)}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: 'KoalaGains', type: 'article' },
  };
}

interface HtsGroup {
  header: HtsCode;
  rows: HtsCode[];
}

function groupRowsByHeading(allRows: HtsCode[]): HtsGroup[] {
  const groups: HtsGroup[] = [];
  let current: HtsGroup | null = null;
  for (const row of allRows) {
    if (row.indent === 0) {
      if (current) groups.push(current);
      current = { header: row, rows: [] };
    } else if (current) {
      current.rows.push(row);
    }
  }
  if (current) groups.push(current);
  return groups;
}

function RateCell({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return <span className="whitespace-pre-wrap">{value}</span>;
}

function UnitCell({ units }: { units: string[] }) {
  if (units.length === 0) return <span className="text-muted-foreground">—</span>;
  return <span>{units.join(', ')}</span>;
}

function indentPaddingRem(indent: number): number {
  if (indent <= 1) return 0;
  // indent=2 is the first visible nested level (shows dots), keep it tighter.
  if (indent === 2) return 0.25;
  return 0.25 + (indent - 2) * 1;
}

function HtsGroupSection({ group }: { group: HtsGroup }) {
  return (
    <section>
      <h2 className="text-base font-semibold mb-3">
        {group.header.htsNumber && <span className="font-mono text-indigo-400 mr-2">{group.header.htsNumber}:</span>}
        <span>{group.header.description}</span>
      </h2>

      {group.rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-color">
          <table className="w-full text-sm">
            <thead className="bg-block-bg-color text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="text-left font-semibold px-3 py-3 whitespace-nowrap">
                  HTS Code
                </th>
                <th scope="col" className="text-left font-semibold px-4 py-3 min-w-[280px]">
                  Description
                </th>
                <th scope="col" className="text-left font-semibold px-3 py-3 whitespace-nowrap">
                  General Rate
                </th>
                <th scope="col" className="text-left font-semibold px-3 py-3 whitespace-nowrap">
                  Column 2 Rate
                </th>
                <th scope="col" className="text-left font-semibold px-2 py-3 whitespace-nowrap max-w-[170px]">
                  Special Rate
                </th>
                <th scope="col" className="text-left font-semibold px-3 py-3 whitespace-nowrap">
                  Units of Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {group.rows.map((row) => (
                <tr key={row.id} className="border-t border-color">
                  <td className="px-3 py-2.5 align-top font-mono tabular-nums text-xs whitespace-nowrap">
                    {row.htsCode10 ? (
                      <Link href={`#${row.htsCode10}`} id={row.htsCode10} className="text-indigo-400 hover:underline">
                        {row.htsNumber}
                      </Link>
                    ) : row.htsNumber ? (
                      <span className="text-indigo-400">{row.htsNumber}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-2.5 align-top">
                    <span className="flex items-start" style={{ paddingLeft: `${indentPaddingRem(row.indent)}rem` }}>
                      {row.indent >= 2 && (
                        <span className="text-gray-400 mr-1 shrink-0">{Array.from({ length: Math.min(row.indent - 1, 3) }, () => '·').join(' ')}</span>
                      )}
                      <span>{row.description}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <RateCell value={row.generalRateOfDuty} />
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <RateCell value={row.column2RateOfDuty} />
                  </td>
                  <td className="px-2 py-2.5 align-top max-w-[170px] text-xs break-words">
                    <RateCell value={row.specialRateOfDuty} />
                  </td>
                  <td className="px-3 py-2.5 align-top whitespace-nowrap">
                    <UnitCell units={row.unitOfQuantity} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function HtsChapterDetailPage({ params }: { params: Promise<RouteParams> }) {
  const { section: sectionRaw, chapter: chapterRaw } = await params;
  const sectionNumber = parseSectionSegment(sectionRaw);
  const chapterNumber = parseChapterSegment(chapterRaw);
  if (sectionNumber === null || chapterNumber === null) notFound();

  const chapter = await fetchChapterDetail(chapterNumber);
  if (!chapter) notFound();

  const canonicalHref = chapterDetailHref(chapter.section.number, chapter.number, chapter.title);
  const currentHref = `/hts-codes/us/${sectionRaw}/${chapterRaw}`;
  if (currentHref !== canonicalHref) {
    redirect(canonicalHref);
  }

  const padded = chapter.number.toString().padStart(2, '0');
  const groups = groupRowsByHeading(chapter.rows as HtsCode[]);
  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'Reports', href: '/reports', current: false },
    { name: 'HTS Codes', href: '/hts-codes', current: false },
    { name: `Chapter ${padded}`, href: canonicalHref, current: true },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-color">
        <header className="mb-6">
          <div className="text-sm text-muted-foreground mb-1">
            <span className="font-mono tabular-nums mr-2">Section {chapter.section.romanNumeral}</span>
            {chapter.section.title}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="font-mono tabular-nums text-muted-foreground mr-3">Chapter {padded}</span>
            {chapter.title}
          </h1>
        </header>

        {(chapter.notes || chapter.additionalUsNotes) && (
          <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {chapter.notes && (
              <div className="rounded-lg border border-color background-color p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Notes</h2>
                <p className="text-sm whitespace-pre-wrap">{chapter.notes}</p>
              </div>
            )}
            {chapter.additionalUsNotes && (
              <div className="rounded-lg border border-color background-color p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Additional U.S. Notes</h2>
                <p className="text-sm whitespace-pre-wrap">{chapter.additionalUsNotes}</p>
              </div>
            )}
          </section>
        )}

        {chapter.rows.length === 0 ? (
          <div className="text-center py-16 background-color rounded-lg border border-color">
            <h2 className="text-lg font-medium">No rows ingested for this chapter</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Run <code className="font-mono">yarn hts:generate-sql</code> and apply the generated SQL file to load this chapter&apos;s rows.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {groups.map((group) => (
              <HtsGroupSection key={group.header.id} group={group} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
