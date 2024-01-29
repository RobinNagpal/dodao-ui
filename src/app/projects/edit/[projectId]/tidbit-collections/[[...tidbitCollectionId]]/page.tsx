'use client';

import withSpace from '@/app/withSpace';
import ByteCollectionEditor from '@/components/byteCollection/ByteCollections/ByteCollectionEditor';
import { EditByteCollection } from '@/components/byteCollection/ByteCollections/useEditByteCollection';
import PageWrapper from '@/components/core/page/PageWrapper';
import { SpaceWithIntegrationsFragment, useProjectBytesQuery, useUpsertProjectByteCollectionMutation } from '@/graphql/generated/generated-types';
import { v4 } from 'uuid';

function EditTidbitCollectionSpace(props: { space: SpaceWithIntegrationsFragment; params: { projectId: string; tidbitCollectionId?: string[] } }) {
  const { data: bytesResponse } = useProjectBytesQuery({
    variables: {
      projectId: props.params.projectId,
    },
  });
  const [upsertProjectByteCollectionMutation] = useUpsertProjectByteCollectionMutation();

  async function upsertByteCollectionFn(byteCollection: EditByteCollection, byteCollectionId: string | null) {
    await upsertProjectByteCollectionMutation({
      variables: {
        projectId: props.params.projectId,
        input: {
          id: byteCollectionId || v4(),
          projectId: props.params.projectId,
          name: byteCollection.name,
          description: byteCollection.description,
          byteIds: byteCollection.bytes.map((byte) => byte.byteId),
          status: byteCollection.status,
          priority: byteCollection.priority,
        },
      },
    });
  }
  return (
    <PageWrapper>
      {bytesResponse?.projectBytes ? (
        <ByteCollectionEditor
          space={props.space}
          byteCollectionId={props.params.tidbitCollectionId?.[0]}
          viewByteCollectionsUrl={`/projects/view/${props.params.projectId}/tidbit-collections`}
          byteSummaries={bytesResponse?.projectBytes}
          upsertByteCollectionFn={upsertByteCollectionFn}
        />
      ) : null}
    </PageWrapper>
  );
}

export default withSpace(EditTidbitCollectionSpace);
