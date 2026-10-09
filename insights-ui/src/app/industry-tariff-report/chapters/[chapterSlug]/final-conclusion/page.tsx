import { ChapterArticle, buildChapterSectionMetadata, renderChapterSection } from '@/components/industry-tariff/chapter/chapter-section-page';
import ChapterFaqApproach2 from '@/components/industry-tariff/chapter/faq/ChapterFaqApproach2';
import PrototypeChapterToolLinks from '@/components/industry-tariff/chapter/PrototypeChapterToolLinks';
import { buildPrototypeMetadata, getChapterPrototype, prototypeChapterInfo } from '@/utils/tariff-reports/chapter-prototype';
import { chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import type { Metadata } from 'next';

const SECTION_SLUG = 'final-conclusion';

export async function generateMetadata({ params }: { params: Promise<{ chapterSlug: string }> }): Promise<Metadata> {
  const { chapterSlug } = await params;
  // Approach-2 chapters (issue #1770) carry their own SEO copy in the content file.
  const conclusion = getChapterPrototype(chapterSlug)?.finalConclusion;
  if (conclusion) return buildPrototypeMetadata(conclusion.seo, chapterSectionHref(chapterSlug, SECTION_SLUG));
  return buildChapterSectionMetadata(chapterSlug, SECTION_SLUG);
}

export default async function Page({ params }: { params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;

  // Approach-2 chapters render from their content file (issue #1770); every
  // other chapter keeps the DB-backed section.
  const prototype = getChapterPrototype(chapterSlug);
  if (prototype?.finalConclusion) {
    const chapterInfo = prototypeChapterInfo(prototype);
    return (
      <ChapterArticle
        chapter={chapterInfo}
        pageTitle={prototype.finalConclusion.h1}
        toolsCrossLinks={<PrototypeChapterToolLinks chapter={prototype.chapter} />}
        ratesAsOf={prototype.asOf}
        currentSlug={SECTION_SLUG}
        updatedAt={prototype.finalConclusion.lastCheckedAt}
        sectionLabel="FAQ"
      >
        <ChapterFaqApproach2 content={prototype} conclusion={prototype.finalConclusion} />
      </ChapterArticle>
    );
  }

  return renderChapterSection(chapterSlug, SECTION_SLUG);
}
