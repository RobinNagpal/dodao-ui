'use client';

import DefaultSpaceAvatar from '@/images/background-features.jpg';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import getSubdomainUrl from '@dodao/web-core/utils/api/getSubdomainUrl';
import { Contexts } from '@dodao/web-core/utils/constants/constants';
import { getCDNImageUrl } from '@dodao/web-core/utils/images/getCDNImageUrl';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

interface SpaceCollectionCardProps {
  space: SpaceWithIntegrationsDto;
}

export default function SpaceCollectionsCard({ space }: SpaceCollectionCardProps) {
  const router = useRouter();
  const { postData } = usePostData<{ token: string }, void>(
    {
      errorMessage: 'Failed to create token for space',
    },
    {}
  );

  const handleCardClick = async () => {
    const spaceSubdomainUrl = getSubdomainUrl(space.id);

    const tokenResponse = await postData(`${getBaseUrl()}/api/${space.id}/verification-tokens`);
    const tokenParam = new URLSearchParams({
      token: tokenResponse!.token,
    });
    router.push(`${spaceSubdomainUrl}/auth/email/verify?${tokenParam}&context=${Contexts.verifyToken}`);
  };

  return (
    <li onClick={handleCardClick} className="cursor-pointer block-bg-color border-b border-color h-28">
      <div className="group relative flex items-center space-x-6 h-full px-4">
        <div className="flex-shrink-0">
          <Image src={space.avatar ? getCDNImageUrl(space.avatar) : DefaultSpaceAvatar} alt={space.name} width={100} height={100} className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-md font-medium">{space.name}</div>
        </div>
        <div className="flex-shrink-0">
          <ChevronRightIcon aria-hidden="true" className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
        </div>
      </div>
    </li>
  );
}
