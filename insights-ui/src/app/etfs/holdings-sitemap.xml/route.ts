import { buildEtfHoldingsSitemap } from '@/utils/etfSitemapUtils';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function GET(): Promise<NextResponse> {
  try {
    return await buildEtfHoldingsSitemap();
  } catch (error) {
    console.error('Error generating ETF holdings sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export { GET };
