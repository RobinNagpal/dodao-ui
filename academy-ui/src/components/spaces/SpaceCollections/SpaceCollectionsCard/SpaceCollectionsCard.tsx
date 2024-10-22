'use client';

import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import getSubdomainUrl from '@dodao/web-core/utils/api/getSubdomainUrl';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { Space } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import { getCDNImageUrl } from '@dodao/web-core/utils/images/getCDNImageUrl';
import DefaultSpaceAvatar from '@/images/background-features.jpg';

interface SpaceCollectionCardProps {
  spaceCollection: Space;
  space: SpaceWithIntegrationsFragment;
}

export default function SpaceCollectionsCard({ spaceCollection, space }: SpaceCollectionCardProps) {
  const router = useRouter();

  const handleCardClick = async () => {
    const projectSlug = slugify(spaceCollection.name);
    const url = getSubdomainUrl(projectSlug);
    router.push(url);
  };
  return (
    <li onClick={handleCardClick} className="cursor-pointer block-bg-color">
      <div className="group relative flex space-x-10 py-5">
        <div className="flex-shrink-0">
          <Image src={space?.avatar ? getCDNImageUrl(space.avatar) : DefaultSpaceAvatar} alt={spaceCollection.name} width={100} height={100} />
        </div>
        <div className="min-w-0 flex-1 self-center">
          <div className="text-md font-medium text-gray-900">{spaceCollection.name}</div>
        </div>
        <div className="flex-shrink-0 self-center">
          <ChevronRightIcon aria-hidden="true" className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
        </div>
      </div>
    </li>
  );
}
