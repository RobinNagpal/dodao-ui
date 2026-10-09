import { ChapterArticle, buildChapterSectionMetadata, renderChapterSection } from '@/components/industry-tariff/chapter/chapter-section-page';
import ChapterIndustryStatsApproach2 from '@/components/industry-tariff/chapter/industry/ChapterIndustryStatsApproach2';
import PrototypeChapterToolLinks from '@/components/industry-tariff/chapter/PrototypeChapterToolLinks';
import { buildPrototypeMetadata, getChapterPrototype, prototypeChapterInfo } from '@/utils/tariff-reports/chapter-prototype';
import { chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import type { Metadata } from 'next';

const SECTION_SLUG = 'understand-industry';

export async function generateMetadata({ params }: { params: Promise<{ chapterSlug: string }> }): Promise<Metadata> {
  const { chapterSlug } = await params;
  // Approach-2 chapters (issue #1770) carry their own SEO copy in the content file.
  const industry = getChapterPrototype(chapterSlug)?.understandIndustry;
  if (industry) return buildPrototypeMetadata(industry.seo, chapterSectionHref(chapterSlug, SECTION_SLUG));
  return buildChapterSectionMetadata(chapterSlug, SECTION_SLUG);
}

export default async function Page({ params }: { params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;

  // Approach-2 chapters render from their content file (issue #1770); every
  // other chapter keeps the DB-backed section.
  const prototype = getChapterPrototype(chapterSlug);
  if (prototype?.understandIndustry) {
    const chapterInfo = prototypeChapterInfo(prototype);
    return (
      <ChapterArticle
        chapter={chapterInfo}
        pageTitle={prototype.understandIndustry.h1}
        toolsCrossLinks={<PrototypeChapterToolLinks chapter={prototype.chapter} />}
        ratesAsOf={prototype.asOf}
        currentSlug={SECTION_SLUG}
        updatedAt={prototype.understandIndustry.lastCheckedAt}
        sectionLabel="Import Statistics"
      >
        <ChapterIndustryStatsApproach2 content={prototype} industry={prototype.understandIndustry} />
      </ChapterArticle>
    );
  }

  return renderChapterSection(chapterSlug, SECTION_SLUG);
}
