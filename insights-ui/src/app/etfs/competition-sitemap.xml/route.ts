import { buildEtfCompetitionSitemap } from '@/utils/etfSitemapUtils';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function GET(): Promise<NextResponse> {
  try {
    return await buildEtfCompetitionSitemap();
  } catch (error) {
    console.error('Error generating ETF competition sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export { GET };
