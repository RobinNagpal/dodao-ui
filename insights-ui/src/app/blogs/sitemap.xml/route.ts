import { getPostsData } from '@/util/blog-utils';
import { getCanonicalUrl } from '@/utils/getBaseUrlForServerSidePages';
import { NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';

export const dynamic = 'force-dynamic';

interface SiteMapUrl {
  url: string;
  changefreq: string;
  priority?: number;
  lastmod?: string;
}

async function generateBlogUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];

  urls.push({
    url: '/blogs',
    changefreq: 'daily',
    priority: 0.8,
  });

  const posts = await getPostsData();

  posts.forEach((post) => {
    urls.push({
      url: `/blogs/${post.id}`,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: post.datetime && post.datetime !== 'Unknown Date' ? post.datetime : undefined,
    });
  });

  return urls;
}

async function GET(): Promise<NextResponse<Buffer>> {
  try {
    const urls = await generateBlogUrls();
    const smStream = new SitemapStream({ hostname: getCanonicalUrl() });

    for (const url of urls) {
      smStream.write(url);
    }

    smStream.end();
    const response: Buffer = await streamToPromise(smStream);

    return new NextResponse(response as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating blogs sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export { GET };
