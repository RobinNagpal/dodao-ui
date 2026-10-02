// app/robots.ts
import { BLOCKED_CRAWLER_USER_AGENTS, ROBOTS_ONLY_OPT_OUT_TOKENS } from '@/utils/blocked-crawlers';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Do NOT block /_next/ — Googlebot needs to fetch /_next/static/* (CSS/JS) and
        // /_next/image (optimized images, including the logo) to render pages correctly.
        // Blocking it strips styling and breaks images in Search Console's URL Inspection.
        disallow: ['/api'],
      },
      {
        // Heavy SEO-tool / AI-training crawlers — see utils/blocked-crawlers.ts. Bots that ignore
        // this get a 403 from middleware.ts.
        userAgent: [...BLOCKED_CRAWLER_USER_AGENTS, ...ROBOTS_ONLY_OPT_OUT_TOKENS],
        disallow: '/',
      },
    ],
    sitemap: 'https://koalagains.com/sitemap_index.xml',
  };
}
