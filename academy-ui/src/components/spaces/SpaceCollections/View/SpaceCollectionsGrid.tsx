import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';
import { Space } from '@prisma/client';
import SpaceCollectionsCard from '../SpaceCollectionsCard/SpaceCollectionsCard';

interface SpaceCollectionGridProps {
  spaceCollections: Space[];
  space: SpaceWithIntegrationsFragment;
}

export default function SpaceCollectionsGrid({ spaceCollections, space }: SpaceCollectionGridProps) {
  return (
    <div className="mx-auto max-w-md">
      <h2 className="text-base font-semibold leading-6 text-gray-900">Select Your Space</h2>
      <p className="mt-1 text-sm text-gray-500">Get started by selecting a space or create a new space.</p>
      <ul role="list" className="mt-6 max-w-md divide-y divide-gray-200 border-b border-t border-gray-200">
        {spaceCollections.map((byteCollection, i) => (
          <SpaceCollectionsCard key={i} spaceCollection={byteCollection} space={space} />
        ))}
      </ul>
      <div className="mt-6 flex">
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          Or create a new space
          <span aria-hidden="true"> &rarr;</span>
        </button>
      </div>
    </div>
  );
}
