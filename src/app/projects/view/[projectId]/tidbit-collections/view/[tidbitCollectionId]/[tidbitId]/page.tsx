import ViewByteModal from '@/components/byteCollection/View/ViewByteModal';
import { ProjectFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

export default async function ByteDetails(props: { params: { projectId: string; tidbitCollectionId?: string; tidbitId?: string } }) {
  const space = (await getSpaceServerSide())!;
  const project = await getApiResponse<ProjectFragment>(space, `projects/${props.params.projectId}`);
  return (
    <ViewByteModal
      space={space}
      byteCollectionType={'projectByteCollection'}
      selectedByteId={props.params.tidbitId!}
      onByteModalCloseUrl={`/projects/view/${project?.id}/tidbit-collections`}
    />
  );
}
