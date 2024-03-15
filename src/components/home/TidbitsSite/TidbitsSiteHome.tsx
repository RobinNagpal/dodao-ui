import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import BytesGrid from '@/components/bytes/List/BytesGrid';
import PageWrapper from '@/components/core/page/PageWrapper';
import TidbitsSiteTabs from '@/components/home/TidbitsSite/TidbitsSiteTabs';
import { ByteCollectionFragment, ByteSummaryFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
// import { useRouter } from 'next/navigation';
import React from 'react';

export interface TidbitsSiteHomeProps {
  space: SpaceWithIntegrationsFragment;
  byteCollections: ByteCollectionFragment[];
  bytes: ByteSummaryFragment[];
  selectedTabId?: string;
}
export default function TidbitsSiteHome(props: TidbitsSiteHomeProps) {
  const { space, byteCollections } = props;

  return (
    space && (
      <PageWrapper>
        <TidbitsSiteTabs selectedTabId={props.selectedTabId!} />
        {props.selectedTabId === 'Tidbits' ? (
          <BytesGrid space={props.space} byteType={'byte'} bytes={props.bytes} baseByteViewUrl={`/tidbits/view`} />
        ) : (
          <ByteCollectionsGrid
            byteCollections={byteCollections}
            space={space}
            byteCollectionType={'byteCollection'}
            byteCollectionsPageUrl={`/tidbit-collections`}
          />
        )}
      </PageWrapper>
    )
  );
}
