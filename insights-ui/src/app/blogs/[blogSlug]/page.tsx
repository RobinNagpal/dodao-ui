import { BlogInterface } from '@/types/blog';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import remarkGfm from 'remark-gfm';
import Markdown from 'react-markdown';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';

export default async function PostPage({ params }: { params: Promise<{ blogSlug: string }> }) {
  const slug = (await params).blogSlug as string;
  const filePath = path.join(process.cwd(), 'blogs', `${slug}.mdx`);
  const fileContents = fs.readFileSync(filePath, 'utf8');

  // Extract front matter and markdown content separately
  const { content, data: meta } = matter(fileContents); // ✅ This correctly extracts only the markdown content
  const data = meta as BlogInterface;
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: data.title,
      href: `/blogs/${slug}`,
      current: true,
    },
  ];
  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <article className="mx-auto text-color">
        <h1 className="text-3xl font-bold">{data.title}</h1>
        {/* <img src={data.image} alt={data.title} className="w-full my-4 rounded-md" /> */}

        {/* Pass only the markdown content, not front matter */}
        <Markdown className="markdown" remarkPlugins={[remarkGfm]}>
          {content}
        </Markdown>
      </article>
    </PageWrapper>
  );
}
