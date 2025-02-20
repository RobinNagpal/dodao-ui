import fs from 'fs';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import path from 'path';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import MDXRenderer from '@/components/mdx/MdxRenderer'; // Import Client Component

interface BlogInterface {
  title: string;
  seoKeywords: string;
  image: string;
}

export default async function PostPage({ params }: { params: Promise<{ blogSlug: string }> }) {
  const slug = (await params).blogSlug as string;
  const filePath = path.join(process.cwd(), 'blogs', `${slug}.mdx`);
  const fileContents = fs.readFileSync(filePath, 'utf8');

  const { content, data } = matter(fileContents);

  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug],
    },
  });

  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold">{data.title}</h1>
      <img src={data.image} alt={data.title} className="w-full my-4 rounded-md" />
      <MDXRenderer source={mdxSource} />
    </article>
  );
}
