import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import ViewByteCollectionCategory from '@/components/byteCollectionCategory/ViewByteCollectionCategory';
import BytesGrid from '@/components/bytes/List/BytesGrid';
import PageWrapper from '@/components/core/page/PageWrapper';
import { TidbitSiteTabIds } from '@/components/home/TidbitsSite/TidbitSiteTabIds';
import TidbitsSiteTabs from '@/components/home/TidbitsSite/TidbitsSiteTabs';
import { ByteCollectionFragment, ByteSummaryFragment, CategoryWithByteCollection, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export interface TidbitsSiteHomeProps {
  space: SpaceWithIntegrationsFragment;
  byteCollections: ByteCollectionFragment[];
  bytes: ByteSummaryFragment[];
  categoriesArray: CategoryWithByteCollection[];
  selectedTabId?: string;
}

function SelectedTab(props: TidbitsSiteHomeProps) {
  if (props.selectedTabId === TidbitSiteTabIds.Tidbits) {
    return <BytesGrid space={props.space} byteType={'byte'} bytes={props.bytes} baseByteViewUrl={`/tidbits/view`} />;
  } else if (props.selectedTabId === TidbitSiteTabIds.TidbitCollectionCategories) {
    return (
      <div>
        {props.categoriesArray.map((category) => (
          <ViewByteCollectionCategory space={props.space} categoryWithByteCollection={category} key={category.id} />
        ))}
      </div>
    );
  } else {
    return props.categoriesArray.length > 0 ? (
      <div>
        {props.categoriesArray.map((category) => (
          <ViewByteCollectionCategory space={props.space} categoryWithByteCollection={category} key={category.id} />
        ))}
      </div>
    ) : (
      <ByteCollectionsGrid
        byteCollections={props.byteCollections}
        space={props.space}
        byteCollectionType={'byteCollection'}
        byteCollectionsPageUrl={`/tidbit-collections`}
      />
    );
  }
}

export default function TidbitsSiteHome(props: TidbitsSiteHomeProps) {
  const { space, byteCollections } = props;

  return (
    space && (
      <PageWrapper>
        <TidbitsSiteTabs selectedTabId={props.selectedTabId} />
        <SelectedTab
          selectedTabId={props.selectedTabId}
          space={props.space}
          bytes={props.bytes}
          byteCollections={byteCollections}
          categoriesArray={props.categoriesArray}
        />
      </PageWrapper>
    )
  );
}
