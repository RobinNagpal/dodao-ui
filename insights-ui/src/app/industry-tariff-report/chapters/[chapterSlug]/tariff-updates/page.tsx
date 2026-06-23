import { buildChapterSectionMetadata, renderChapterSection } from '@/components/industry-tariff/chapter/chapter-section-page';
import { TariffScrollLoginTrigger } from '@/components/login/tariff-scroll-login-trigger';
import type { Metadata } from 'next';

const SECTION_SLUG = 'tariff-updates';

export async function generateMetadata({ params }: { params: Promise<{ chapterSlug: string }> }): Promise<Metadata> {
  const { chapterSlug } = await params;
  return buildChapterSectionMetadata(chapterSlug, SECTION_SLUG);
}

export default async function Page({ params }: { params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;
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
