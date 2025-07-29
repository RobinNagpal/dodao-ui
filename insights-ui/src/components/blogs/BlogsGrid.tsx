import { BlogInterfaceWithId } from '@/types/blog';
import Link from 'next/link';
import React from 'react';

export default function BlogsGrid({ posts, showViewAllButton = false }: { posts: BlogInterfaceWithId[]; length?: number; showViewAllButton?: boolean }) {
  const HeadingTag = showViewAllButton ? 'h2' : 'h1';
  return (
    <section className="bg-gray-800 pt-16 pb-12 sm:pt-20 sm:pb-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <HeadingTag className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">From Our Blog</HeadingTag>

            <p className="mt-2 text-lg text-gray-400">
              Explore expert articles on REIT fundamentals, value‑investing techniques, crowdfunding analysis, and GenAI capabilities.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-2 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 pt-10 sm:mt-2 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
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
        {showViewAllButton && (
          <div className="mt-12 text-center">
            <Link
              href="/blogs"
              className="inline-flex items-center rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors duration-200"
            >
              View All Blogs
              <svg className="ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
