'use client';
import React from 'react';
import { useByteCollectionCategoriesQuery } from '@/graphql/generated/generated-types';

export default function tidbitCollection() {
  const { data } = useByteCollectionCategoriesQuery({
    variables: {
      //   categoryId: '7ad99aa9-f22b-4096-911e-e97de513862e',
      spaceId: 'test-academy-eth',
    },
  });

  console.log('data:', data);
  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.byteCollectionCategories.map((category) => (
            <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-start">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 16h-1v-4h1m0 0h-1V9h1m2 3v2a2 2 0 01-2 2h-1a2 2 0 01-2-2v-1a2 2 0 012-2h1a2 2 0 012 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{category.excerpt}</p>
              <a href="#" className="mt-auto text-indigo-600 hover:text-indigo-800 transition duration-300">
                See more
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
