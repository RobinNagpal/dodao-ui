import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import ByteCollectionCategoryCard from '@/components/byteCollectionCategory/ByteCollectionCategoryCard';
import { Grid3Cols } from '@/components/core/grids/Grid3Cols';
import PageWrapper from '@/components/core/page/PageWrapper';
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
  if (props.categoriesArray.length > 0) {
    return (
      <Grid3Cols>
        {props.categoriesArray.map((category) => (
          <ByteCollectionCategoryCard space={props.space} category={category} key={category.id} />
        ))}
      </Grid3Cols>
    );
  } else {
    return (
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
        <TidbitsSiteTabs />
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
