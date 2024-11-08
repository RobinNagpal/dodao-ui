import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import fetchDataServerSide from '@/utils/api/fetchDataServerSide';
import CollectionPageLoading from '@dodao/web-core/components/core/loaders/CollectionPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Session } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { promises as fs } from 'fs';
import path from 'path';
import React, { Suspense } from 'react';

/**
 * @param props
 * @param space
 * @param session
 */
export async function getTidbitsSiteHomepageContents(space: SpaceWithIntegrationsFragment, session?: Session) {
  const byteCollections = await fetchDataServerSide<ByteCollectionSummary[]>(`${getBaseUrl()}/api/${space.id}/byte-collections`);

  if (session?.isAdminOfSpace && byteCollections.length < 3) {
    try {
      const filePath = path.join(process.cwd(), 'onboardingByteCollection', 'onboarding.json');

      const onboardingByteCollection = JSON.parse(await fs.readFile(filePath, 'utf-8'));

      byteCollections.unshift(onboardingByteCollection);
    } catch (error) {
      console.error('Error reading onboarding byte collection JSON file:', error);
    }
  }

  const tidbitsHomepage = space?.tidbitsHomepage;
  return (
    <PageWrapper>
      {tidbitsHomepage && (
        <div className="text-center">
          {tidbitsHomepage.heading && (
            <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-2xl primary-text-color">{tidbitsHomepage.heading}</h1>
          )}
          {tidbitsHomepage.shortDescription && <p className="mt-2 mb-6 text-lg leading-8">{tidbitsHomepage.shortDescription}</p>}
        </div>
      )}
      <Suspense fallback={<CollectionPageLoading />}>
        <ByteCollectionsGrid
          byteCollections={byteCollections}
          space={space}
          byteCollectionsBaseUrl={`/tidbit-collections`}
          isAdmin={session?.isAdminOfSpace || session?.isSuperAdminOfDoDAO}
        />
      </Suspense>
    </PageWrapper>
  );
}
