import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import TidbitsSiteTabs from '@/components/home/TidbitsSite/TidbitsSiteTabs';
import { ByteCollectionFragment, ByteSummaryFragment, CategoryWithByteCollection, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';
import TidbitsSiteHomepage from './TidbitsSiteHomepage';
import { Session } from '@dodao/web-core/types/auth/Session';

export interface TidbitsSiteHomeProps {
  space: SpaceWithIntegrationsFragment;
  byteCollections: ByteCollectionFragment[];
  bytes: ByteSummaryFragment[];
  categoriesArray: CategoryWithByteCollection[];
  selectedTabId?: string;
  session?: Session;
}

function SelectedTab(props: TidbitsSiteHomeProps) {
  if (props.categoriesArray.length > 0) {
    return <TidbitsSiteHomepage space={props.space} categoriesArray={props.categoriesArray} session={props.session!} />;
  } else {
    return (
      <ByteCollectionsGrid
        byteCollections={props.byteCollections}
        space={props.space}
        byteCollectionType={'byteCollection'}
        byteCollectionsBaseUrl={`/tidbit-collections`}
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
          session={props.session}
        />
      </PageWrapper>
    )
  );
}
