import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import { buildEtfCategoryReportSitemap } from '@/utils/etfSitemapUtils';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function GET(): Promise<NextResponse> {
  try {
    return await buildEtfCategoryReportSitemap(EtfAnalysisCategory.FuturePerformanceOutlook);
  } catch (error) {
    console.error('Error generating ETF future-performance-outlook sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export { GET };
