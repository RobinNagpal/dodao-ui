import { TidbitSiteTabIds } from '@/components/home/TidbitsSite/TidbitSiteTabIds';
import TidbitsSiteHome from '@/components/home/TidbitsSite/TidbitsSiteHome';
import { ByteCollectionFragment, ByteSummaryFragment, CategoryWithByteCollection, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { Session } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import axios from 'axios';
import React from 'react';

export async function getTidbitsSiteHomepageContents(
  props: {
    searchParams: { [p: string]: string | string[] | undefined };
  },
  space: SpaceWithIntegrationsFragment,
  session?: Session
) {
  if (props.searchParams.selectedTabId === TidbitSiteTabIds.Tidbits) {
    let response = await axios.get(`${getBaseUrl()}/api/byte-collection/byte-collections`, {
      params: {
        spaceId: space.id,
      },
    });
    const byteCollections: ByteCollectionFragment[] = response.data.byteCollections;

    response = await axios.get(getBaseUrl() + '/api/byte/bytes', {
      params: {
        spaceId: space.id,
      },
    });
    const bytes: ByteSummaryFragment[] = response.data.bytes;

    return (
      <TidbitsSiteHome byteCollections={byteCollections} space={space} bytes={bytes} selectedTabId={props.searchParams.selectedTabId} categoriesArray={[]} />
    );
  } else if (props.searchParams.selectedTabId === TidbitSiteTabIds.TidbitCollections) {
    const response = await axios.get(`${getBaseUrl()}/api/byte-collection/byte-collections`, {
      params: {
        spaceId: space.id,
      },
    });
    const byteCollections: ByteCollectionFragment[] = response.data.byteCollections;

    return <TidbitsSiteHome byteCollections={byteCollections} space={space} bytes={[]} categoriesArray={[]} selectedTabId={props.searchParams.selectedTabId} />;
  } else if (props.searchParams.selectedTabId === TidbitSiteTabIds.TidbitCollectionCategories) {
    const response = await axios.get(`${getBaseUrl()}/api/byte-collection-categories?spaceId=${space.id}`);
    const byteCollectionCategories = response.data.byteCollectionCategories;

    const categoriesArray = [];

    for (const category of byteCollectionCategories) {
      const categoryWithByteCollection = await axios.get(`${getBaseUrl()}/api/byte-collection-categories/${category.id}?spaceId=${space.id}`);
      categoriesArray.push(categoryWithByteCollection);
    }
    return (
      <TidbitsSiteHome
        byteCollections={[]}
        space={space}
        bytes={[]}
        categoriesArray={categoriesArray}
        selectedTabId={props.searchParams.selectedTabId}
        session={session}
      />
    );
  } else {
    const response = await axios.get(`${getBaseUrl()}/api/byte-collection/byte-collections`, {
      params: {
        spaceId: space.id,
      },
    });

    const byteCollections: ByteCollectionFragment[] = response.data.byteCollections;

    const categoriesArray = [];
    const responseCategories = await axios.get(`${getBaseUrl()}/api/byte-collection-categories?spaceId=${space.id}`);
    const byteCollectionCategories = responseCategories.data.byteCollectionCategories;

    for (const category of byteCollectionCategories) {
      const categoryResponse = await axios.get(`${getBaseUrl()}/api/byte-collection-categories/${category.id}?spaceId=${space.id}`);
      categoriesArray.push(categoryResponse.data.byteCollectionCategoryWithByteCollections);
    }
    return (
      <TidbitsSiteHome
        byteCollections={byteCollectionCategories.length ? [] : byteCollections}
        space={space}
        bytes={[]}
        categoriesArray={byteCollectionCategories.length ? categoriesArray : []}
        selectedTabId={byteCollectionCategories.length ? TidbitSiteTabIds.TidbitCollectionCategories : TidbitSiteTabIds.TidbitCollections}
        session={session}
      />
    );
  }
}
