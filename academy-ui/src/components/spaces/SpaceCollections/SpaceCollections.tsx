'use client';

import SpaceCollectionsGrid from '@/components/spaces/SpaceCollections/View/SpaceCollectionsGrid';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import SpaceCollectionPageLoading from '@dodao/web-core/components/core/loaders/SpaceCollectionPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Session } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useFetchUtils } from '@dodao/web-core/src/ui/hooks/useFetchUtils';
import { Space } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import NoSpaceCollections from './NoSpaceCollections';

interface SpaceCollectionsClientProps {
  space: SpaceWithIntegrationsFragment;
}

export default function SpaceCollections({ space }: SpaceCollectionsClientProps) {
  const { data: session } = useSession() as { data: Session | null };
  const { fetchData } = useFetchUtils();
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpaces = async () => {
      if (session) {
        const fetchedSpaces = await fetchData<Space[]>(`${getBaseUrl()}/api/${space.id}/queries/spaces/by-creator`, 'Error while fetching spaces');
        setSpaces(fetchedSpaces || []);
        setIsLoading(false);
      }
    };

    fetchSpaces();
  }, [session, space.id, router, fetchData]);

  return (
    <PageWrapper>
      {isLoading ? (
        <SpaceCollectionPageLoading />
      ) : spaces.length === 0 ? (
        <NoSpaceCollections />
      ) : (
        <SpaceCollectionsGrid spaceCollections={spaces} space={space} />
      )}
    </PageWrapper>
  );
}
