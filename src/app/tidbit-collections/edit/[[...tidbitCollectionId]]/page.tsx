'use client';

import withSpace from '@/app/withSpace';
import ByteCollectionEditor from '@/components/byteCollection/ByteCollections/ByteCollectionEditor';
import PageWrapper from '@/components/core/page/PageWrapper';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';

function EditTidbitCollectionSpace(props: { space: SpaceWithIntegrationsFragment; params: { tidbitCollectionId?: string[] } }) {
  return (
    <PageWrapper>
      <ByteCollectionEditor space={props.space} byteCollectionId={props.params.tidbitCollectionId?.[0]} />
    </PageWrapper>
  );
}

export default withSpace(EditTidbitCollectionSpace);
