import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import PageWrapper from '@/components/core/page/PageWrapper';
import { ByteCollectionFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export interface TidbitsSiteHomeProps {
  space: SpaceWithIntegrationsFragment;
  byteCollections: ByteCollectionFragment[];
}
export default function TidbitsSiteHome(props: TidbitsSiteHomeProps) {
  const { space, byteCollections } = props;
  return (
    space && (
      <PageWrapper>
        <ByteCollectionsGrid byteCollections={byteCollections} space={space} byteCollectionType={'byteCollection'} />
      </PageWrapper>
    )
  );
}
