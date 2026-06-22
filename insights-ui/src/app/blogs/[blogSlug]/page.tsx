import { BlogInterface } from '@/types/blog';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import fs from 'fs';
import matter from 'gray-matter';
import { marked } from 'marked';
import Image from 'next/image';
import path from 'path';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { Metadata } from 'next';
import { DEFAULT_BLOG_AUTHOR, formatBlogDate, getRelatedPosts } from '@/util/blog-utils';
import RelatedBlogs from '@/components/blogs/RelatedBlogs';
import { BlogScrollLoginTrigger } from '@/components/login/blog-scroll-login-trigger';
import { notFound } from 'next/navigation';

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
    const authorName = blogData.author ?? DEFAULT_BLOG_AUTHOR;

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
        publishedTime: blogData.datetime,
        modifiedTime: blogData.datetime,
        authors: [authorName],
        section: blogData.category?.title,
        tags: blogData.seoKeywords,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title}`,
        description,
        images: ['https://koalagains.com/koalagain_logo.png'],
      },
      authors: [{ name: authorName }],
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

  // If the MDX doesn’t exist, render Next’s 404 page
  if (!fs.existsSync(filePath)) {
    notFound();
  }

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

  // No KaTeX: marked is a process-wide singleton, so registering the single-$ math
  // extension here leaked into every other page's markdown (stock summaries with
  // dollar amounts rendered as MathML). See src/util/parse-markdown.ts.
  const renderer = getMarkedRenderer({});

  const blogContents = marked.parse(content, { renderer });

  const relatedPosts = await getRelatedPosts(data.category.slug, slug, 3);

  const canonicalUrl = `https://koalagains.com/blogs/${slug}`;
  const ogImageUrl = 'https://koalagains.com/koalagain_logo.png';
  const authorName = data.author ?? DEFAULT_BLOG_AUTHOR;
  const formattedDate = formatBlogDate(data.datetime);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    description: data.abstract,
    image: ogImageUrl,
    datePublished: data.datetime,
    dateModified: data.datetime,
    author: data.author ? { '@type': 'Person', name: data.author } : { '@type': 'Organization', name: 'KoalaGains', url: 'https://koalagains.com' },
    publisher: {
      '@type': 'Organization',
      name: 'KoalaGains',
      logo: {
        '@type': 'ImageObject',
        url: ogImageUrl,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    articleSection: data.category.title,
    keywords: data.seoKeywords?.join(', '),
  };

  return (
    <PageWrapper>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="px-6 pt-4 lg:px-8 text-color">
        <div className="mx-auto max-w-6xl text-base/7">
          <p className="text-base/7 font-semibold">
            <span className="relative z-10 rounded-full py-1.5 font-medium">{data.category.title}</span>
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-pretty  sm:text-3xl">{data.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-400">
            <span>By {authorName}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={data.datetime}>{formattedDate}</time>
          </div>
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

      <BlogScrollLoginTrigger />
      <RelatedBlogs posts={relatedPosts} />
    </PageWrapper>
  );
}
