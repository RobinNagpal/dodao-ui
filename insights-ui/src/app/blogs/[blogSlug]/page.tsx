// pages/posts/[slug].tsx
import fs from 'fs';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import path from 'path';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

interface BlogInterface {
  title: string;
  seoKeywords: string;
  image: string;
}

export default async function PostPage({ params }: { params: Promise<{ blogSlug: string }> }) {
  const slug = (await params).blogSlug as string;
  const filePath = path.join(process.cwd(), 'blogs', `${slug}.mdx`);
  const fileContents = fs.readFileSync(filePath, 'utf8');

  // Parse front matter using gray-matter
  const { content, data } = matter(fileContents);

  // Serialize the markdown content to MDX using next-mdx-remote with plugins
  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug],
    },
  });

  const source = mdxSource;
  const frontMatter = data as BlogInterface;
  return (
    <article>
      <h1>{frontMatter.title}</h1>
      <img src={frontMatter.image} alt={frontMatter.title} />
      <MDXRemote {...source} />
    </article>
  );
}
