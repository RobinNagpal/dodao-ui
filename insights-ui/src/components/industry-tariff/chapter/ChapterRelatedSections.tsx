import { CHAPTER_REPORT_SECTIONS, chapterCoverHref, chapterSectionHref, type ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';
import Link from 'next/link';

interface ChapterRelatedSectionsProps {
  chapter: ChapterRouteInfo;
  // Slug of the current sub-section, or 'overview' on the chapter cover page. The matching link is
  // excluded from the related grid so the user only sees pages they aren't already on.
  currentSlug: string;
}

// Top-of-card "More Related Reports" navigation, rendered above the chapter tools bar and the
// article body. Card labels intentionally omit the chapter title because the HTS chapter titles
// ("Dairy produce; birds eggs; natural honey; edible products of animal origin, not elsewhere
// specified or included") are long enough to drown out the per-section labels. The trailing
// border (border-b + pb-6 + mb-6) is the only divider between this block and the tools row that
// follows it.
export default function ChapterRelatedSections({ chapter, currentSlug }: ChapterRelatedSectionsProps): JSX.Element | null {
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
    <nav aria-label="More related reports" className="mb-6 pb-6 border-b border-color">
      <h2 className="text-lg font-semibold mb-3">More Related Reports</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {items.map((item) => (
          <li key={item.href} className="h-full">
            <Link
              href={item.href}
              className="flex h-full items-center rounded-md px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white transition-colors"
            >
              {item.label} &rarr;
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
