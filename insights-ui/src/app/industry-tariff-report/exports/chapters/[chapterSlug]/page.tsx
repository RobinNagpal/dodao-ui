import ChapterExportOverview from '@/components/industry-tariff/chapter/exports/ChapterExportOverview';
import { buildExportPageMetadata, renderExportPage } from '@/components/industry-tariff/chapter/exports/export-page';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ chapterSlug: string }> }): Promise<Metadata> {
  const { chapterSlug } = await params;
  return buildExportPageMetadata(chapterSlug, 'overview');
}

export default async function Page({ params }: { params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;
  return renderExportPage(chapterSlug, 'overview', (overview) => <ChapterExportOverview overview={overview} />);
}
