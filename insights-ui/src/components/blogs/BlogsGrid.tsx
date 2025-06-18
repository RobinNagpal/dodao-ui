import { BlogInterfaceWithId } from '@/types/blog';
import Link from 'next/link';
import React from 'react';

export default function BlogsGrid({ posts }: { posts: BlogInterfaceWithId[]; length?: number }) {
  return (
    <div className="bg-gray-800 py-12 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">From Our Blog</h2>

            <p className="mt-2 text-lg text-gray-400">Dive deeper into how KoalaGains is changing the investment landscape.</p>
          </div>
        </div>
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-700 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="flex max-w-xl flex-col justify-between">
              <div className="flex-col items-start">
                <div className="flex items-center gap-x-4 text-xs">
                  <time dateTime={post.datetime} className="text-gray-500">
                    {post.date}
                  </time>
                  <a
                    href={'category/' + post.category.slug}
                    className="relative z-10 rounded-full bg-gray-700 px-3 py-1.5 font-medium text-gray-300 hover:bg-gray-600"
                  >
                    {post.category.title}
                  </a>
                </div>
                <div className="group relative">
                  <h3 className="mt-3 text-lg font-semibold text-white group-hover:text-indigo-400">
                    <a href={'/blogs/' + post.id} className="group">
                      <span className="absolute inset-0" />
                      {post.title}
                    </a>
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
    </div>
  );
}
