import { CHAPTER_REPORT_SECTIONS, chapterCoverHref, chapterSectionHref, type ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';
import Link from 'next/link';

interface ChapterRelatedSectionsProps {
  chapter: ChapterRouteInfo;
  // Slug of the current sub-section, or 'overview' on the chapter cover page. The matching link is
  // highlighted (link color + aria-current) so the user can see which page they're on.
  currentSlug: string;
}

// Section nav rendered between the chapter tools bar and the article body. Always lists every page
// of the chapter report (Overview + each section) in a stable order so the buttons don't shift as the
// user moves between pages. No heading — the link grid alone is enough context next to the tools row.
// Card labels intentionally omit the chapter title because the HTS chapter titles ("Dairy produce;
// birds eggs; natural honey; edible products of animal origin, not elsewhere specified or included")
// are long enough to drown out the per-section labels.
export default function ChapterRelatedSections({ chapter, currentSlug }: ChapterRelatedSectionsProps): JSX.Element {
  const items: Array<{ slug: string; href: string; label: string }> = [
    { slug: 'overview', href: chapterCoverHref(chapter.slug), label: 'Overview' },
    ...CHAPTER_REPORT_SECTIONS.map((section) => ({ slug: section.slug, href: chapterSectionHref(chapter.slug, section.slug), label: section.label })),
  ];

  return (
    <nav aria-label="Chapter report sections" className="mb-6">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {items.map((item) => {
          const isCurrent = item.slug === currentSlug;
          return (
            <li key={item.href} className="h-full">
              <Link
                href={item.href}
                aria-current={isCurrent ? 'page' : undefined}
                className={
                  isCurrent
                    ? 'flex h-full items-center rounded-md px-3 py-2 text-sm font-semibold border border-link bg-surface-2 text-link'
                    : 'flex h-full items-center rounded-md px-3 py-2 text-sm border border-transparent bg-surface-2 hover:bg-surface-3 text-body hover:text-heading transition-colors'
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
