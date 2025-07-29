import { BlogInterfaceWithId } from '@/types/blog';
import Link from 'next/link';
import React from 'react';

interface RelatedBlogsProps {
  posts: BlogInterfaceWithId[];
}

export default function RelatedBlogs({ posts }: RelatedBlogsProps) {
  // Don't render if no related posts
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-800 pt-12 pb-12 sm:pt-16 sm:pb-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Related Articles</h2>
          <p className="mt-2 text-lg text-gray-400">More insights from the same category</p>
        </div>

        <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:mt-8 sm:pt-4 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="flex max-w-xl flex-col justify-between">
              <div className="flex-col items-start">
                <div className="flex items-center gap-x-4 text-xs">
                  <time dateTime={post.datetime} className="text-gray-500">
                    {post.date}
                  </time>
                  <span className="relative z-10 rounded-full bg-gray-700 px-3 py-1.5 font-medium text-gray-300">{post.category.title}</span>
                </div>
                <div className="group relative">
                  <h3 className="mt-3 text-lg font-semibold text-white group-hover:text-indigo-400">
                    <Link href={'/blogs/' + post.id} className="group">
                      <span className="absolute inset-0" />
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-5 line-clamp-3 text-sm text-gray-400">{post.abstract}</p>
                </div>
              </div>
              <div>
                <Link href={'/blogs/' + post.id} className="link-color text-sm mt-4">
                  Read More &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
