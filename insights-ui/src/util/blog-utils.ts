import { BlogInterface, BlogInterfaceWithId } from '@/types/blog';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const DEFAULT_BLOG_AUTHOR = 'KoalaGains Team';

export function formatBlogDate(datetime: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(datetime);
  if (!match) return datetime;
  const [, yearStr, monthStr, dayStr] = match;
  const monthIdx = Number(monthStr) - 1;
  if (monthIdx < 0 || monthIdx > 11) return datetime;
  return `${MONTH_NAMES[monthIdx]} ${Number(dayStr)}, ${yearStr}`;
}

export async function getPostsData(length?: number): Promise<BlogInterfaceWithId[]> {
  const postsDirectory = path.join(process.cwd(), 'blogs');
  const fileNames = fs.readdirSync(postsDirectory);

  // Ingnore README.md file

  const blogFiles = fileNames.filter((fileName) => fileName !== 'README.md' && fileName !== 'images');
  const posts = blogFiles.map((fileName): BlogInterfaceWithId => {
    const id = fileName.replace(/\.mdx?$/, '');
    const filePath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);
    const postMetadata = data as BlogInterface;

    const datetime = postMetadata.datetime || postMetadata.date || 'Unknown Date';

    return {
      id: id, // using the slug as a unique id
      title: postMetadata.title || 'Untitled Post',
      abstract: postMetadata.abstract || 'No description available.',
      date: formatBlogDate(datetime),
      datetime,
      category: {
        title: postMetadata.category.title || 'General',
        slug: postMetadata.category.slug || 'general',
      },
      seoImage: postMetadata.seoImage,
      bannerImage: postMetadata.bannerImage,
      seoKeywords: postMetadata.seoKeywords || [],
      author: postMetadata.author,
    };
  });

  // Sorty by datetime which is in YYYY-MM-DD format
  posts.sort((a, b) => (a.datetime > b.datetime ? -1 : 1));

  if (length) {
    return posts.slice(0, length);
  }

  return posts;
}

export async function getRelatedPosts(categorySlug: string, currentPostId: string, limit: number = 3): Promise<BlogInterfaceWithId[]> {
  const allPosts = await getPostsData();

  const relatedPosts = allPosts.filter((post) => post.category.slug === categorySlug && post.id !== currentPostId);

  return relatedPosts.slice(0, limit);
}
