import { buildChapterSectionMetadata, renderChapterSection } from '@/components/industry-tariff/chapter/chapter-section-page';
import type { Metadata } from 'next';

const SECTION_SLUG = 'all-countries-tariff-updates';

export async function generateMetadata({ params }: { params: Promise<{ chapterSlug: string }> }): Promise<Metadata> {
  const { chapterSlug } = await params;
  return buildChapterSectionMetadata(chapterSlug, SECTION_SLUG);
}

export default async function Page({ params }: { params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;
  return renderChapterSection(chapterSlug, SECTION_SLUG);
}
