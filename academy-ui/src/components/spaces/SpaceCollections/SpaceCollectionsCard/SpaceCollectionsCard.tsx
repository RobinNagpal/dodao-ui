'use client';

import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import getProtocol from '@dodao/web-core/utils/api/getProtocol';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { Space } from '@prisma/client';
import React from 'react';

interface SpaceCollectionCardProps {
  spaceCollection: Space;
  viewSpaceBaseUrl: string;
  space: SpaceWithIntegrationsFragment;
  isAdmin: boolean | undefined;
}

export default function SpaceCollectionsCard({ spaceCollection }: SpaceCollectionCardProps) {
  const handleCardClick = () => {
    const projectSlug = slugify(spaceCollection.name);
    const protocol = getProtocol();
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';

    const url = `${protocol}://${projectSlug}.${hostname}${port}`;
    window.location.href = url;
  };
  return (
    <div className="border p-4 rounded-md shadow-sm" onClick={handleCardClick}>
      <h2 className="text-lg font-semibold">{spaceCollection.name}</h2>
    </div>
  );
}
