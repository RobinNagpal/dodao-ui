import ChapterExportFaq from '@/components/industry-tariff/chapter/exports/ChapterExportFaq';
import { buildExportPageMetadata, renderExportPage } from '@/components/industry-tariff/chapter/exports/export-page';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ chapterSlug: string }> }): Promise<Metadata> {
  const { chapterSlug } = await params;
  return buildExportPageMetadata(chapterSlug, 'faq');
}

export default async function Page({ params }: { params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;
  return renderExportPage(chapterSlug, 'faq', (faq) => <ChapterExportFaq faq={faq} />);
}
