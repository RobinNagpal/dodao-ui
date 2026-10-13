import ChapterExportRules from '@/components/industry-tariff/chapter/exports/ChapterExportRules';
import { buildExportPageMetadata, renderExportPage } from '@/components/industry-tariff/chapter/exports/export-page';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ chapterSlug: string }> }): Promise<Metadata> {
  const { chapterSlug } = await params;
  return buildExportPageMetadata(chapterSlug, 'rules');
}

export default async function Page({ params }: { params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;
  return renderExportPage(chapterSlug, 'rules', (rules) => <ChapterExportRules rules={rules} />);
}
