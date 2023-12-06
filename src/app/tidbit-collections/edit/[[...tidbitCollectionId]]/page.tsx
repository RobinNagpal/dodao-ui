'use client';

import withSpace from '@/app/withSpace';
import ByteCollectionEditor from '@/components/byteCollection/ByteCollections/ByteCollectionEditor';
import { EditByteCollection } from '@/components/byteCollection/ByteCollections/useEditByteCollection';
import PageLoading from '@/components/core/loaders/PageLoading';
import PageWrapper from '@/components/core/page/PageWrapper';
import {
  SpaceWithIntegrationsFragment,
  useCreateByteCollectionMutation,
  useQueryBytesQuery,
  useUpdateByteCollectionMutation,
} from '@/graphql/generated/generated-types';

function EditTidbitCollectionSpace(props: { space: SpaceWithIntegrationsFragment; params: { tidbitCollectionId?: string[] } }) {
  const { data: bytesResponse } = useQueryBytesQuery({
    variables: {
      spaceId: props.space.id,
    },
  });

  const [updateByteCollectionMutation] = useUpdateByteCollectionMutation();

  const [createByteCollectionMutation] = useCreateByteCollectionMutation();

  async function upsertByteCollectionFn(byteCollection: EditByteCollection, byteCollectionId: string | null) {
    if (!byteCollectionId) {
      await createByteCollectionMutation({
        variables: {
          input: {
            spaceId: props.space.id,
            name: byteCollection.name,
            description: byteCollection.description,
            byteIds: byteCollection.bytes.map((byte) => byte.byteId),
            status: byteCollection.status,
            order: byteCollection.order,
          },
        },
      });
    } else {
      await updateByteCollectionMutation({
        variables: {
          input: {
            byteCollectionId,
            name: byteCollection.name,
            description: byteCollection.description,
            byteIds: byteCollection.bytes.map((byte) => byte.byteId),
            status: byteCollection.status,
            spaceId: props.space.id,
            order: byteCollection.order,
          },
        },
      });
    }
  }

  return (
    <PageWrapper>
      {bytesResponse?.bytes ? (
        <ByteCollectionEditor
          space={props.space}
          byteCollectionId={props.params.tidbitCollectionId?.[0]}
          viewByteCollectionsUrl={'/tidbit-collections'}
          byteSummaries={bytesResponse?.bytes}
          upsertByteCollectionFn={upsertByteCollectionFn}
        />
      ) : (
        <PageLoading />
      )}
    </PageWrapper>
  );
}

export default withSpace(EditTidbitCollectionSpace);
