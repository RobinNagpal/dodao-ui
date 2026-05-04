// app/robots.ts
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
        disallow: ['/public-equities', '/api'],
      },
    ],
    sitemap: 'https://koalagains.com/sitemap_index.xml',
  };
}
