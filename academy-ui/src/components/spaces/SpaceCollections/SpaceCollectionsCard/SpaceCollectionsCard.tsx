'use client';

import DefaultSpaceAvatar from '@/images/background-features.jpg';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import getSubdomainUrl from '@dodao/web-core/utils/api/getSubdomainUrl';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { Contexts } from '@dodao/web-core/utils/constants/constants';
import { getCDNImageUrl } from '@dodao/web-core/utils/images/getCDNImageUrl';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

interface SpaceCollectionCardProps {
  spaceCollection: SpaceWithIntegrationsDto;
}

export default function SpaceCollectionsCard({ spaceCollection }: SpaceCollectionCardProps) {
  const router = useRouter();
  const { postData } = usePostData(
    {
      errorMessage: 'Failed to create token for space',
    },
    {}
  );

  const handleCardClick = async () => {
    const projectSlug = slugify(spaceCollection.name);
    const url = getSubdomainUrl(projectSlug);

    const verificationPath = await postData(`${getBaseUrl()}/api/${spaceCollection.id}/verification-tokens`);
    router.push(`${url}${verificationPath}&context=${Contexts.verifyToken}`);
  };

  return (
    <li onClick={handleCardClick} className="cursor-pointer block-bg-color border-b border-color h-28">
      <div className="group relative flex items-center space-x-6 h-full px-4">
        <div className="flex-shrink-0">
          <Image
            src={spaceCollection.avatar ? getCDNImageUrl(spaceCollection.avatar) : DefaultSpaceAvatar}
            alt={spaceCollection.name}
            width={100}
            height={100}
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-md font-medium">{spaceCollection.name}</div>
        </div>
        <div className="flex-shrink-0">
          <ChevronRightIcon aria-hidden="true" className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
        </div>
      </div>
    </li>
  );
}
