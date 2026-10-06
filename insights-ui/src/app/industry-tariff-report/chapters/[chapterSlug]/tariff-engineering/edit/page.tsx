import { chapterEditMetadata, renderChapterEditPage } from '@/components/industry-tariff/chapter/edit/chapter-edit-page';

export const dynamic = 'force-dynamic';
export const metadata = chapterEditMetadata;

export default async function Page({ params }: { params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;
  return renderChapterEditPage(chapterSlug, 'tariff-engineering');
}
