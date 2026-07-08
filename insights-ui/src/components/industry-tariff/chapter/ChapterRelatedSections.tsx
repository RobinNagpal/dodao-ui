import { CHAPTER_REPORT_SECTIONS, chapterCoverHref, chapterSectionHref, type ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';
import Link from 'next/link';

interface ChapterRelatedSectionsProps {
  chapter: ChapterRouteInfo;
  // Slug of the current sub-section, or 'overview' on the chapter cover page. The matching link is
  // excluded from the related grid so the user only sees pages they aren't already on.
  currentSlug: string;
}

// Sibling-section nav rendered between the chapter tools bar and the article body. No heading —
// the link grid alone is enough context next to the tools row. Card labels intentionally omit the
// chapter title because the HTS chapter titles ("Dairy produce; birds eggs; natural honey; edible
// products of animal origin, not elsewhere specified or included") are long enough to drown out
// the per-section labels.
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
    <nav aria-label="More related reports" className="mb-6">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {items.map((item) => (
          <li key={item.href} className="h-full">
            <Link
              href={item.href}
              className="flex h-full items-center rounded-md px-3 py-2 text-sm bg-surface hover:bg-surface-2 text-body hover:text-heading transition-colors"
            >
              {item.label} &rarr;
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
