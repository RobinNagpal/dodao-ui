import { TidbitSiteTabIds } from '@/components/home/TidbitsSite/TidbitSiteTabIds';
import TidbitsSiteHome from '@/components/home/TidbitsSite/TidbitsSiteHome';
import {
  ByteCollectionCategory,
  ByteCollectionFragment,
  ByteSummaryFragment,
  CategoryWithByteCollection,
  SpaceWithIntegrationsFragment,
} from '@/graphql/generated/generated-types';
import { Session } from '@dodao/web-core/types/auth/Session';
import getApiResponse from '@/utils/api/getApiResponse';
import React from 'react';
import axios from 'axios';
import getBaseUrl from '@/utils/api/getBaseURL';

export async function getTidbitsSiteHomepageContents(
  props: {
    searchParams: { [p: string]: string | string[] | undefined };
  },
  space: SpaceWithIntegrationsFragment,
  session?: Session
) {
  if (props.searchParams.selectedTabId === TidbitSiteTabIds.Tidbits) {
    const byteCollections = await getApiResponse<ByteCollectionFragment[]>(space, 'byte-collections');
    const response = await axios.get(getBaseUrl() + '/api/byte/bytes', {
      params: {
        spaceId: space.id,
      },
    });
    const bytes: ByteSummaryFragment[] = response.data.bytes;

    return (
      <TidbitsSiteHome byteCollections={byteCollections} space={space} bytes={bytes} selectedTabId={props.searchParams.selectedTabId} categoriesArray={[]} />
    );
  } else if (props.searchParams.selectedTabId === TidbitSiteTabIds.TidbitCollections) {
    const byteCollections = await getApiResponse<ByteCollectionFragment[]>(space, 'byte-collections');

    return <TidbitsSiteHome byteCollections={byteCollections} space={space} bytes={[]} categoriesArray={[]} selectedTabId={props.searchParams.selectedTabId} />;
  } else if (props.searchParams.selectedTabId === TidbitSiteTabIds.TidbitCollectionCategories) {
    const byteCollectionCategories = await getApiResponse<ByteCollectionCategory[]>(space, 'byte-collection-categories');
    const categoriesArray = [];

    for (const category of byteCollectionCategories) {
      const categoryWithByteCollection = await getApiResponse<CategoryWithByteCollection>(space, `byte-collection-categories/${category.id}`);
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
    const byteCollections = await getApiResponse<ByteCollectionFragment[]>(space, 'byte-collections');

    const categoriesArray = [];
    const byteCollectionCategories = await getApiResponse<ByteCollectionCategory[]>(space, 'byte-collection-categories');
    for (const category of byteCollectionCategories) {
      const categoryWithByteCollection = await getApiResponse<CategoryWithByteCollection>(space, `byte-collection-categories/${category.id}`);
      categoriesArray.push(categoryWithByteCollection);
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
