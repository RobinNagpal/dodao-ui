import { BlogInterface } from '@/types/blog';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { newKatexExtension } from '@dodao/web-core/utils/ui/newKatexMarketExtension';
import fs from 'fs';
import matter from 'gray-matter';
import { marked } from 'marked';
import Image from 'next/image';
import path from 'path';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { Metadata } from 'next';
import { getRelatedPosts } from '@/util/blog-utils';
import RelatedBlogs from '@/components/blogs/RelatedBlogs';

export async function generateMetadata({ params }: { params: Promise<{ blogSlug: string }> }): Promise<Metadata> {
  const blogSlug = (await params).blogSlug as string;
  const filePath = path.join(process.cwd(), 'blogs', `${blogSlug}.mdx`);

  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);
    const blogData = data as BlogInterface;

    const title = blogData.title ?? 'Untitled Blog';
    const description = blogData.abstract ?? 'Explore the latest insights on KoalaGains.';
    const canonicalUrl = `https://koalagains.com/blogs/${blogSlug}`;

    return {
      title: `${title}`,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${title}`,
        description,
        url: canonicalUrl,
        images: ['https://koalagains.com/koalagain_logo.png'],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title}`,
        description,
        images: ['https://koalagains.com/koalagain_logo.png'],
      },
      keywords: blogData.seoKeywords,
    };
  } catch (error) {
    return {
      title: 'KoalaGains Blog',
      description: 'Stay updated with the latest insights on investing, REIT analysis, and more.',
    };
  }
}

export default async function PostPage({ params }: { params: Promise<{ blogSlug: string }> }) {
  const slug = (await params).blogSlug as string;
  const filePath = path.join(process.cwd(), 'blogs', `${slug}.mdx`);
  const fileContents = fs.readFileSync(filePath, 'utf8');

  // Extract front matter and markdown content separately
  const { content, data: meta } = matter(fileContents); // ✅ This correctly extracts only the markdown content
  const data = meta as BlogInterface;
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Blogs',
      href: `/blogs`,
      current: false,
    },
    {
      name: data.title,
      href: `/blogs/${slug}`,
      current: true,
    },
  ];

  const renderer = getMarkedRenderer(newKatexExtension());

  const blogContents = marked.parse(content, { renderer });

  const relatedPosts = await getRelatedPosts(data.category.slug, slug, 3);

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="px-6 pt-16 lg:px-8 text-color">
        <div className="mx-auto max-w-6xl text-base/7">
          <p className="text-base/7 font-semibold">
            <span className="relative z-10 rounded-full py-1.5 font-medium">{data.category.title}</span>
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-pretty  sm:text-3xl">{data.title}</h1>
          <div className="mt-10 max-w-6xl text-md">
            <article className="mx-auto text-color">
              {data.bannerImage && (
                <Image src={'/images/blogs' + data.bannerImage} width={672} height={448} alt={data.title} className="w-full my-4 rounded-md" />
              )}

              <div className="markdown-body text-md" dangerouslySetInnerHTML={{ __html: blogContents }} />
            </article>
          </div>
        </div>
      </div>

      <RelatedBlogs posts={relatedPosts} />
    </PageWrapper>
  );
}
