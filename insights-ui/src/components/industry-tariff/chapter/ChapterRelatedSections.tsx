import { CHAPTER_REPORT_SECTIONS, chapterCoverHref, chapterSectionHref, type ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';
import Link from 'next/link';

interface ChapterRelatedSectionsProps {
  chapter: ChapterRouteInfo;
  // Slug of the current sub-section, or 'overview' on the chapter cover page. The matching link is
  // excluded from the related grid so the user only sees pages they aren't already on.
  currentSlug: string;
}

// Bottom-of-card "More HTS Chapter X sections" navigation. Replaces the left sidebar from the
// previous layout — same set of links, just moved to the end of the article in the stock-page
// style (cf. TickerRelatedSections / "More OMC analyses").
export default function ChapterRelatedSections({ chapter, currentSlug }: ChapterRelatedSectionsProps): JSX.Element | null {
  const padded = chapter.number.toString().padStart(2, '0');
  const chapterLabel = `HTS Chapter ${padded} — ${chapter.title}`;

  const items: Array<{ href: string; label: string }> = [];

  if (currentSlug !== 'overview') {
    items.push({ href: chapterCoverHref(chapter.slug), label: 'Overview' });
  }

  for (const section of CHAPTER_REPORT_SECTIONS) {
    if (section.slug === currentSlug) continue;
    items.push({ href: chapterSectionHref(chapter.slug, section.slug), label: section.label });
  }

  if (items.length === 0) return null;

  return (
    <nav aria-label={`More ${chapterLabel} sections`} className="mt-10 pt-6 border-t border-color">
      <h2 className="text-lg font-semibold mb-3">More {chapterLabel} sections</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {items.map((item) => (
          <li key={item.href} className="h-full">
            <Link
              href={item.href}
              className="flex h-full items-center rounded-md px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white transition-colors"
            >
              {chapterLabel} {item.label} &rarr;
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
