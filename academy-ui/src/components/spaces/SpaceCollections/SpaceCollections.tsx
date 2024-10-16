'use client';

import { useRouter } from 'next/navigation';
import { Space } from '@prisma/client';
import { Suspense, useEffect, useState } from 'react';
import { useFetchUtils } from '@dodao/web-core/utils/api/useFetchUtils';
import SpaceCollectionsGrid from '@/components/spaces/SpaceCollections/View/SpaceCollectionsGrid';
import { Session } from '@dodao/web-core/types/auth/Session';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import CollectionPageLoading from '@dodao/web-core/components/core/loaders/CollectionPageLoading';
import { useSession } from 'next-auth/react';

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
        const fetchedSpaces = await fetchData<Space[]>(
          `/api/${space.id}/queries/spaces/by-creator?username=${session.username}`,
          'Error while fetching spaces'
        );

        if (fetchedSpaces && fetchedSpaces.length === 0) {
          router.push('/spaces/create');
        } else {
          setSpaces(fetchedSpaces || []);
        }
      }
    };

    fetchSpaces();
  }, [session, space.id, fetchData, router]);

  return (
    <PageWrapper>
      <Suspense fallback={<CollectionPageLoading />}>
        <SpaceCollectionsGrid spaceCollections={spaces} space={space} spaceCollectionsBaseUrl={`/spaces`} isAdmin={session?.isAdminOfSpace} />
      </Suspense>
    </PageWrapper>
  );
}
