import { hasChapterExports } from '@/utils/tariff-reports/chapter-exports';
import { chapterCoverHref, chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import { permanentRedirect } from 'next/navigation';

// The single "Tariffs on U.S. exports" page was replaced by the three-page export section
// (`/exports`). Keep the old URL working: send it to the export overview, or to the chapter
// cover for chapters without export content.
export default async function Page({ params }: { params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;
  permanentRedirect(hasChapterExports(chapterSlug) ? chapterSectionHref(chapterSlug, 'exports') : chapterCoverHref(chapterSlug));
}
