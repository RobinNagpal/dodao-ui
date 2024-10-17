'use client';

import SpaceCollectionsGrid from '@/components/spaces/SpaceCollections/View/SpaceCollectionsGrid';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import Button from '@dodao/web-core/components/core/buttons/Button';
import CollectionPageLoading from '@dodao/web-core/components/core/loaders/CollectionPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Session } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useFetchUtils } from '@dodao/web-core/utils/api/useFetchUtils';
import { Space } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

interface SpaceCollectionsClientProps {
  space: SpaceWithIntegrationsFragment;
}

export default function SpaceCollections({ space }: SpaceCollectionsClientProps) {
  const { data: session } = useSession() as { data: Session | null };
  const { fetchData } = useFetchUtils();
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>([]);

  useEffect(() => {
    const fetchSpaces = async () => {
      if (session) {
        const fetchedSpaces = await fetchData<Space[]>(`${getBaseUrl()}/api/${space.id}/queries/spaces/by-creator`, 'Error while fetching spaces');

        if (fetchedSpaces && fetchedSpaces.length === 0) {
          router.push('/spaces/create');
        } else {
          setSpaces(fetchedSpaces || []);
        }
      }
    };

    fetchSpaces();
  }, [session, space.id, fetchData, router]);

  const handleCreateSpaceClick = () => {
    router.push('/spaces/create');
  };

  return (
    <PageWrapper>
      <Suspense fallback={<CollectionPageLoading />}>
        <SpaceCollectionsGrid spaceCollections={spaces} space={space} spaceCollectionsBaseUrl={`/spaces`} isAdmin={session?.isAdminOfSpace} />
      </Suspense>
      <div className="p-6 flex items-center justify-end gap-x-6">
        <Button variant="contained" primary onClick={handleCreateSpaceClick}>
          Create New Space
        </Button>
      </div>
    </PageWrapper>
  );
}
