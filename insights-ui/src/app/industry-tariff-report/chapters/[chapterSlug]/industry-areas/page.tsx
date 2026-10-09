import { ChapterArticle, buildChapterSectionMetadata, renderChapterSection } from '@/components/industry-tariff/chapter/chapter-section-page';
import ChapterIndustryAreasApproach2 from '@/components/industry-tariff/chapter/areas/ChapterIndustryAreasApproach2';
import PrototypeChapterToolLinks from '@/components/industry-tariff/chapter/PrototypeChapterToolLinks';
import { buildPrototypeMetadata, getChapterPrototype, prototypeChapterInfo } from '@/utils/tariff-reports/chapter-prototype';
import { approach2SectionLabel, chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import type { Metadata } from 'next';

const SECTION_SLUG = 'industry-areas';

export async function generateMetadata({ params }: { params: Promise<{ chapterSlug: string }> }): Promise<Metadata> {
  const { chapterSlug } = await params;
  // Approach-2 chapters (issue #1770) carry their own SEO copy in the content file.
  const areas = getChapterPrototype(chapterSlug)?.industryAreas;
  if (areas) return buildPrototypeMetadata(areas.seo, chapterSectionHref(chapterSlug, SECTION_SLUG));
  return buildChapterSectionMetadata(chapterSlug, SECTION_SLUG);
}

export default async function Page({ params }: { params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;

  // Approach-2 chapters render from their content file (issue #1770); every
  // other chapter keeps the DB-backed section.
  const prototype = getChapterPrototype(chapterSlug);
  if (prototype?.industryAreas) {
    const chapterInfo = prototypeChapterInfo(prototype);
    return (
      <ChapterArticle
        chapter={chapterInfo}
        pageTitle={prototype.industryAreas.h1}
        toolsCrossLinks={<PrototypeChapterToolLinks chapter={prototype.chapter} />}
        ratesAsOf={prototype.asOf}
        currentSlug={SECTION_SLUG}
        updatedAt={prototype.industryAreas.lastCheckedAt}
        sectionLabel={approach2SectionLabel(SECTION_SLUG)}
      >
        <ChapterIndustryAreasApproach2 content={prototype} areas={prototype.industryAreas} />
      </ChapterArticle>
    );
  }

  return renderChapterSection(chapterSlug, SECTION_SLUG);
}
