import { Space } from '@prisma/client';
import React from 'react';
import SpaceCollectionsCard from '../SpaceCollectionsCard/SpaceCollectionsCard';

interface SpaceCollectionsListProps {
  spaceCollections: Space[];
  title: string;
  noSpaceText: string;
}

export default function SpaceCollectionsList({ spaceCollections, title, noSpaceText }: SpaceCollectionsListProps) {
  return (
    <div className="py-2">
      <h3 className="text-sm font-semibold leading-5 mt-4 border-b border-color pb-2">{title}</h3>
      {spaceCollections.length != 0 ? (
        <ul role="list" className="max-w-md">
          {spaceCollections.map((spaceCollection, i) => (
            <SpaceCollectionsCard key={i} spaceCollection={spaceCollection} />
          ))}
        </ul>
      ) : (
        <div className="text-sm flex justify-center my-3">{noSpaceText}</div>
      )}
    </div>
  );
}
