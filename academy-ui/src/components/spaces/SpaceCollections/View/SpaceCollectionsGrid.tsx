import React from 'react';
import { Space } from '@prisma/client';
import Link from 'next/link';
import SpaceCollectionsList from '../SpaceCollectionsList/SpaceCollectionsList';

interface SpaceCollectionGridProps {
  spacesByCreator: Space[];
  spacesByAdmin: Space[];
}

export default function SpaceCollectionsGrid({ spacesByCreator, spacesByAdmin }: SpaceCollectionGridProps) {
  return (
    <div className="mx-auto max-w-lg px-4">
      <h2 className="text-base font-bold leading-6">Select Your Space</h2>
      <p className="my-1 text-sm">Get started by selecting a space or create a new space.</p>
      <div className="py-4">
        <SpaceCollectionsList spaceCollections={spacesByCreator} title="Creator of Spaces" noSpaceText="No Space Created" />
        <SpaceCollectionsList spaceCollections={spacesByAdmin} title="Admin of Spaces" noSpaceText="No Space" />
      </div>
      <div className="my-2">
        <Link href="/spaces/create" className="text-sm font-medium link-color">
          Or create a new space
          <span aria-hidden="true"> &rarr;</span>
        </Link>
      </div>
    </div>
  );
}
