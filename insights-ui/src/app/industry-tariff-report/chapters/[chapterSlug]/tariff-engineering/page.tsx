import { ChapterArticle, buildChapterSectionMetadata, renderChapterSection } from '@/components/industry-tariff/chapter/chapter-section-page';
import ChapterTariffEngineeringApproach2 from '@/components/industry-tariff/chapter/engineering/ChapterTariffEngineeringApproach2';
import PrototypeChapterToolsBar from '@/components/industry-tariff/chapter/PrototypeChapterToolsBar';
import { buildPrototypeMetadata, getChapterPrototype } from '@/utils/tariff-reports/chapter-prototype';
import { chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import type { Metadata } from 'next';

const SECTION_SLUG = 'tariff-engineering';

export async function generateMetadata({ params }: { params: Promise<{ chapterSlug: string }> }): Promise<Metadata> {
  const { chapterSlug } = await params;
  // Approach-2 chapters (issue #1770) carry their own SEO copy in the content file.
  const engineering = getChapterPrototype(chapterSlug)?.tariffEngineering;
  if (engineering) return buildPrototypeMetadata(engineering.seo, chapterSectionHref(chapterSlug, SECTION_SLUG));
  return buildChapterSectionMetadata(chapterSlug, SECTION_SLUG);
}

export default async function Page({ params }: { params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;

  // Approach-2 chapters render from their content file (issue #1770); every
  // other chapter keeps the DB-backed section.
  const prototype = getChapterPrototype(chapterSlug);
  if (prototype?.tariffEngineering) {
    const chapterInfo = { number: prototype.chapter.number, title: prototype.chapter.title, slug: prototype.chapter.slug };
    return (
      <ChapterArticle
        chapter={chapterInfo}
        pageTitle={prototype.tariffEngineering.h1}
        toolsCrossLinks={<PrototypeChapterToolsBar chapter={prototype.chapter} />}
        currentSlug={SECTION_SLUG}
        updatedAt={prototype.tariffEngineering.lastCheckedAt}
        sectionLabel="Documents & Levers"
      >
        <ChapterTariffEngineeringApproach2 content={prototype} engineering={prototype.tariffEngineering} />
      </ChapterArticle>
    );
  }

  return renderChapterSection(chapterSlug, SECTION_SLUG);
}
