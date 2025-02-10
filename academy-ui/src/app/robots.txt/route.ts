import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') as String;

  let robotsText = `
User-agent: *
Allow: /
`;

  robotsText += `Sitemap: https://${host}/sitemap.xml\n`;

  return new NextResponse(robotsText.trim(), {
    headers: { 'Content-Type': 'text/plain' },
  });
}
