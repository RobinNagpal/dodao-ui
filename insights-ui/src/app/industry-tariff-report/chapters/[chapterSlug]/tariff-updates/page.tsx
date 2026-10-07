import { ChapterArticle, buildChapterSectionMetadata, renderChapterSection } from '@/components/industry-tariff/chapter/chapter-section-page';
import PrototypeChapterToolsBar from '@/components/industry-tariff/chapter/PrototypeChapterToolsBar';
import ChapterTariffUpdatesApproach2 from '@/components/industry-tariff/chapter/updates/ChapterTariffUpdatesApproach2';
import { TariffScrollLoginTrigger } from '@/components/login/tariff-scroll-login-trigger';
import { buildPrototypeMetadata, getChapterPrototype, prototypeChapterInfo } from '@/utils/tariff-reports/chapter-prototype';
import { chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import type { Metadata } from 'next';

const SECTION_SLUG = 'tariff-updates';

export async function generateMetadata({ params }: { params: Promise<{ chapterSlug: string }> }): Promise<Metadata> {
  const { chapterSlug } = await params;

  // Approach-2 chapters (issue #1770) carry their own SEO copy in the content file.
  const updates = getChapterPrototype(chapterSlug)?.tariffUpdates;
  if (updates) return buildPrototypeMetadata(updates.seo, chapterSectionHref(chapterSlug, SECTION_SLUG));

  return buildChapterSectionMetadata(chapterSlug, SECTION_SLUG);
}

export default async function Page({ params }: { params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;

  // Approach-2 chapters render from their content file (issue #1770); every
  // other chapter keeps the DB-backed section below.
  const prototype = getChapterPrototype(chapterSlug);
  if (prototype?.tariffUpdates) {
    const chapterInfo = prototypeChapterInfo(prototype);
    return (
      <>
        <ChapterArticle
          chapter={chapterInfo}
          pageTitle={prototype.tariffUpdates.h1}
          toolsCrossLinks={<PrototypeChapterToolsBar chapter={prototype.chapter} />}
          currentSlug={SECTION_SLUG}
          updatedAt={prototype.tariffUpdates.lastCheckedAt}
          sectionLabel="Tariff Updates"
        >
          <ChapterTariffUpdatesApproach2 content={prototype} updates={prototype.tariffUpdates} />
        </ChapterArticle>
        <TariffScrollLoginTrigger />
      </>
    );
  }

  // renderChapterSection() calls notFound() when the chapter is missing, so the trigger only
  // renders alongside real, indexable content. It is appended after the server-rendered article
  // so its sentinel sits at the very end of the page.
  const section = await renderChapterSection(chapterSlug, SECTION_SLUG);
  return (
    <>
      {section}
      <TariffScrollLoginTrigger />
    </>
  );
}
