import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import PageWrapper from '@/components/core/page/PageWrapper';
import { ProjectByteCollectionFragment, ProjectFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import { useRouter } from 'next/navigation';
import React from 'react';

export default async function ByteDetails(props: { params: { projectId: string; tidbitCollectionId?: string; tidbitId?: string } }) {
  const space = (await getSpaceServerSide())!;
  const byteCollections = await getApiResponse<ProjectByteCollectionFragment[]>(space, `projects/${props.params.projectId}/byte-collections`);
  const project = await getApiResponse<ProjectFragment>(space, `projects/${props.params.projectId}`);
  const router = useRouter();
  const onClose = () => {
    const byteCollectionsViewUrl = `/projects/view/${project?.id}/tidbits-collections`;
    router.push(byteCollectionsViewUrl);
  };

  return (
    <PageWrapper>
      <ByteCollectionsGrid
        space={space}
        byteCollections={byteCollections}
        byteCollectionType={'projectByteCollection'}
        project={project}
        selectedByteId={props.params.tidbitId}
        selectedByteCollectionId={props.params.tidbitCollectionId}
        onViewByteModalClosed={onClose}
      />
    </PageWrapper>
  );
}
