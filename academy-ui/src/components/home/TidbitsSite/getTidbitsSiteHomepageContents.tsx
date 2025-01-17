import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import onboardingByteCollection from '@/onboardingByteCollection/onboarding.json';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import fetchDataServerSide from '@/utils/api/fetchDataServerSide';
import CollectionPageLoading from '@dodao/web-core/components/core/loaders/CollectionPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Session } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React, { Suspense } from 'react';

/**
 * @param props
 * @param space
 * @param session
 */
export async function getTidbitsSiteHomepageContents(space: SpaceWithIntegrationsDto, session?: Session) {
  const byteCollections = await fetchDataServerSide<ByteCollectionSummary[]>(`${getBaseUrl()}/api/${space.id}/byte-collections`);

  const isAdmin = session?.isAdminOfSpace || session?.isSuperAdminOfDoDAO;
  const onboardingCollection: ByteCollectionSummary[] = isAdmin ? [onboardingByteCollection as ByteCollectionSummary] : [];
  const tidbitsHomepage = space?.tidbitsHomepage;

  return (
    <PageWrapper>
      {tidbitsHomepage && (
        <div className="text-center">
          {tidbitsHomepage.heading && <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-2xl primary-color">{tidbitsHomepage.heading}</h1>}
          {tidbitsHomepage.shortDescription && <p className="mt-2 mb-6 text-lg leading-8">{tidbitsHomepage.shortDescription}</p>}
        </div>
      )}
      <Suspense fallback={<CollectionPageLoading />}>
        <ByteCollectionsGrid
          byteCollections={byteCollections.length > 2 ? byteCollections : [...onboardingCollection, ...byteCollections]}
          space={space}
          byteCollectionsBaseUrl={`/tidbit-collections`}
          isAdmin={isAdmin}
        />
      </Suspense>
    </PageWrapper>
  );
}
