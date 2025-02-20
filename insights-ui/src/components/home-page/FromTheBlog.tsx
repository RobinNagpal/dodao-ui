// app/components/FromTheBlog.tsx
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface PostData {
  id: string;
  title: string;
  href: string;
  description: string;
  date: string;
  datetime: string;
  category: { title: string; href: string };
  image: string;
}

// ✅ Helper function to read all MDX files from the blogs directory
async function getPostsData(): Promise<PostData[]> {
  const postsDirectory = path.join(process.cwd(), 'blogs');
  const fileNames = fs.readdirSync(postsDirectory);

  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.mdx?$/, '');
    const filePath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);

    return {
      id: slug, // using the slug as a unique id
      title: data.title || 'Untitled Post',
      href: `/blogs/${slug}`,
      description: data.description || 'No description available.',
      date: data.date || 'Unknown Date',
      datetime: data.datetime || data.date || 'Unknown Date',
      category: {
        title: data.category.title || 'General',
        href: '#',
      },
      image: data.image || '/images/default-thumbnail.jpg',
    };
  });

  return posts;
}

// ✅ Async Server Component using Next.js App Router
export default async function FromTheBlog() {
  // Fetch posts data from MDX files
  const posts = await getPostsData();

  return (
    <div className="bg-gray-800 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">From Our Blog</h2>
          <p className="mt-2 text-lg text-gray-400">Dive deeper into how KoalaGains is changing the investment landscape.</p>
        </div>

        {/* Posts grid */}
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-700 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="flex max-w-xl flex-col items-start justify-between">
              <div className="flex items-center gap-x-4 text-xs">
                <time dateTime={post.datetime} className="text-gray-500">
                  {post.date}
                </time>
                <a href={post.category.href} className="relative z-10 rounded-full bg-gray-700 px-3 py-1.5 font-medium text-gray-300 hover:bg-gray-600">
                  {post.category.title}
                </a>
              </div>
              <div className="group relative">
                <h3 className="mt-3 text-lg font-semibold text-white group-hover:text-indigo-400">
                  <a href={post.href}>
                    <span className="absolute inset-0" />
                    {post.title}
                  </a>
                </h3>
                <p className="mt-5 line-clamp-3 text-sm text-gray-400">{post.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
