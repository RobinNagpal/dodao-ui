'use client';

import withSpace from '@dodao/web-core/ui/auth/withSpace';
import ByteCollectionEditor from '@/components/byteCollection/ByteCollections/ByteCollectionEditor';
import { EditByteCollection } from '@/components/byteCollection/ByteCollections/useEditByteCollection';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import {
  SpaceWithIntegrationsFragment,
  useProjectByteCollectionQuery,
  useProjectBytesQuery,
  useUpsertProjectByteCollectionMutation,
} from '@/graphql/generated/generated-types';
import { v4 } from 'uuid';

function EditTidbitCollectionProject(props: { space: SpaceWithIntegrationsFragment; params: { projectId: string; tidbitCollectionId?: string[] } }) {
  const { data: bytesResponse } = useProjectBytesQuery({
    variables: {
      projectId: props.params.projectId,
    },
  });
  const [upsertProjectByteCollectionMutation] = useUpsertProjectByteCollectionMutation();
  const byteCollectionId = props.params.tidbitCollectionId?.[0] || null;
  const { data } = useProjectByteCollectionQuery({
    variables: {
      projectId: props.params.projectId,
      id: byteCollectionId!,
    },
    skip: !byteCollectionId,
  });

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
      {bytesResponse?.projectBytes && (!byteCollectionId || data) ? (
        <ByteCollectionEditor
          space={props.space}
          byteCollection={data?.projectByteCollection}
          viewByteCollectionsUrl={`/projects/view/${props.params.projectId}/tidbit-collections`}
          byteSummaries={bytesResponse?.projectBytes}
          upsertByteCollectionFn={upsertByteCollectionFn}
        />
      ) : null}
    </PageWrapper>
  );
}

export default withSpace(EditTidbitCollectionProject);
