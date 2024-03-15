import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import BytesGrid from '@/components/bytes/List/BytesGrid';
import PageWrapper from '@/components/core/page/PageWrapper';
import TidbitsSiteTabs from '@/components/home/TidbitsSite/TidbitsSiteTabs';
import { ByteCollectionFragment, ByteSummaryFragment, CategoryWithByteCollection } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

async function TidbitCollection(props: { params: { categoryId?: any }; searchParams: { [key: string]: string | string[] | undefined } }) {
  const space = (await getSpaceServerSide())!;
  const categoryWithByteCollection = await getApiResponse<CategoryWithByteCollection>(space, `byte-collection-categories/${props.params.categoryId}`);
  const bytes = await getApiResponse<ByteSummaryFragment[]>(space, 'bytes');

  return (
    <PageWrapper>
      <TidbitsSiteTabs selectedTabId={props.searchParams.selectedTabId as string} />
      <h1 className="mb-8 text-3xl">{categoryWithByteCollection.name}</h1>
      <p className="mb-8 text-xl">{categoryWithByteCollection.excerpt}</p>
      {categoryWithByteCollection && (
        <>
          {props.searchParams.selectedTabId === 'Tidbits' ? (
            <BytesGrid space={space} byteType={'byte'} bytes={bytes} baseByteViewUrl={`/tidbits/view`} />
          ) : (
            <ByteCollectionsGrid
              byteCollections={categoryWithByteCollection.byteCollections as ByteCollectionFragment[]}
              space={space}
              byteCollectionType={'byteCollection'}
              byteCollectionsPageUrl={`/tidbit-collections`}
            />
          )}
        </>
      )}
    </PageWrapper>
  );
}

export default TidbitCollection;
