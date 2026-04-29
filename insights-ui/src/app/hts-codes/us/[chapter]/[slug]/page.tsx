import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { chapterDetailHref, chapterNumberSlug, chapterTitleSlug } from '@/utils/tariff-calculator/chapter-slug';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400; // 24h

interface RouteParams {
  chapter: string;
  slug: string;
}

interface HtsRow {
  id: string;
  htsNumber: string | null;
  htsCode10: string | null;
  indent: number;
  description: string;
  unitOfQuantity: string[];
  generalRateOfDuty: string | null;
  specialRateOfDuty: string | null;
  column2RateOfDuty: string | null;
  quotaQuantity: string | null;
  additionalDuties: string | null;
}

function parseChapterNumber(raw: string): number | null {
  if (!/^\d{1,2}$/.test(raw)) return null;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1 || n > 99) return null;
  return n;
}

async function loadChapter(chapterNumber: number) {
  return prisma.tariffChapter.findUnique({
    where: { spaceId_number: { spaceId: KoalaGainsSpaceId, number: chapterNumber } },
    include: { section: { select: { number: true, romanNumeral: true, title: true } } },
  });
}

export async function generateStaticParams(): Promise<RouteParams[]> {
  const chapters = await prisma.tariffChapter.findMany({
    where: { spaceId: KoalaGainsSpaceId },
    select: { number: true, title: true },
  });
  return chapters.map((c) => ({ chapter: chapterNumberSlug(c.number), slug: chapterTitleSlug(c.title) }));
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { chapter: chapterRaw } = await params;
  const chapterNumber = parseChapterNumber(chapterRaw);
  if (chapterNumber === null) return { title: 'HTS Codes | KoalaGains' };

  const chapter = await loadChapter(chapterNumber);
  if (!chapter) return { title: 'HTS Codes | KoalaGains' };

  const padded = chapterNumberSlug(chapter.number);
  const title = `Chapter ${padded} — ${chapter.title} | HTS Codes | KoalaGains`;
  const description = `HTSUS Chapter ${padded}: ${chapter.title}. Browse every HTS code in this chapter with general rate, special rate, column 2 rate, units of measure, and applicable additional duties.`;
  const canonical = `https://koalagains.com${chapterDetailHref(chapter.number, chapter.title)}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: 'KoalaGains', type: 'article' },
  };
}

function RateCell({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return <span className="whitespace-pre-wrap">{value}</span>;
}

function UnitCell({ units }: { units: string[] }) {
  if (units.length === 0) return <span className="text-muted-foreground">—</span>;
  return <span>{units.join(', ')}</span>;
}

export default async function HtsChapterDetailPage({ params }: { params: Promise<RouteParams> }) {
  const { chapter: chapterRaw, slug } = await params;
  const chapterNumber = parseChapterNumber(chapterRaw);
  if (chapterNumber === null) notFound();

  const chapter = await loadChapter(chapterNumber);
  if (!chapter) notFound();

  // Canonicalize the URL: if the slug doesn't match the chapter title's slug,
  // redirect so search engines see only one URL per chapter.
  const canonicalSlug = chapterTitleSlug(chapter.title);
  if (slug !== canonicalSlug) {
    redirect(chapterDetailHref(chapter.number, chapter.title));
  }

  const rows: HtsRow[] = await prisma.htsCode.findMany({
    where: { chapterId: chapter.id },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      htsNumber: true,
      htsCode10: true,
      indent: true,
      description: true,
      unitOfQuantity: true,
      generalRateOfDuty: true,
      specialRateOfDuty: true,
      column2RateOfDuty: true,
      quotaQuantity: true,
      additionalDuties: true,
    },
  });

  const padded = chapterNumberSlug(chapter.number);
  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'Reports', href: '/reports', current: false },
    { name: 'HTS Codes', href: '/hts-codes', current: false },
    { name: `Chapter ${padded}`, href: chapterDetailHref(chapter.number, chapter.title), current: true },
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
            <span className="font-mono tabular-nums text-muted-foreground mr-3">Ch. {padded}</span>
            {chapter.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {rows.length.toLocaleString()} {rows.length === 1 ? 'row' : 'rows'} from the HTSUS CSV — leaf rows have a 10-digit code; intermediate rows are
            descriptive headers used to nest the codes below them.
          </p>
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

        {rows.length === 0 ? (
          <div className="text-center py-16 background-color rounded-lg border border-color">
            <h2 className="text-lg font-medium">No rows ingested for this chapter</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Run <code className="font-mono">yarn hts:import-chapter</code> with this chapter&apos;s CSV.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-color">
            <table className="w-full text-sm">
              <thead className="bg-block-bg-color text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                    HTS Number
                  </th>
                  <th scope="col" className="text-left font-semibold px-4 py-3">
                    Description
                  </th>
                  <th scope="col" className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                    Unit
                  </th>
                  <th scope="col" className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                    General Rate
                  </th>
                  <th scope="col" className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                    Special Rate
                  </th>
                  <th scope="col" className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                    Column 2 Rate
                  </th>
                  <th scope="col" className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                    Quota
                  </th>
                  <th scope="col" className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                    Additional Duties
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isHeaderRow = row.htsNumber === null;
                  return (
                    <tr key={row.id} className={`border-t border-color ${isHeaderRow ? 'bg-block-bg-color/40' : ''}`}>
                      <td className="px-4 py-3 align-top font-mono tabular-nums text-xs whitespace-nowrap">
                        {row.htsCode10 ? (
                          <Link href={`#${row.htsCode10}`} id={row.htsCode10} className="hover:underline">
                            {row.htsNumber}
                          </Link>
                        ) : (
                          row.htsNumber ?? <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className={`block ${isHeaderRow ? 'font-semibold' : ''}`} style={{ paddingLeft: `${row.indent * 1.25}rem` }}>
                          {row.description}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <UnitCell units={row.unitOfQuantity} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <RateCell value={row.generalRateOfDuty} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <RateCell value={row.specialRateOfDuty} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <RateCell value={row.column2RateOfDuty} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <RateCell value={row.quotaQuantity} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <RateCell value={row.additionalDuties} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
