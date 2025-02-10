import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl();

  let robotsText = `
User-agent: *
Allow: /
`;

  robotsText += `Sitemap: ${baseUrl}/sitemap.xml\n`;

  return new NextResponse(robotsText.trim(), {
    headers: { 'Content-Type': 'text/plain' },
  });
}
