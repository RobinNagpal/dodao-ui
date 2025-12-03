// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Let Google crawl but we ALSO noindex via meta/header as above
        disallow: ['/public-equities', '/api', '/_next/'],
      },
    ],
    sitemap: 'https://koalagains.com/sitemap_index.xml',
  };
}
