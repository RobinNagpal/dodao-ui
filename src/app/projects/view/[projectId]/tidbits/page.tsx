import BytesGrid from '@/components/bytes/List/BytesGrid';
import ShowArchivedToggle from '@/components/bytes/List/ShowArchivedToggle';
import { ProjectByteFragment, ProjectFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

async function ProjectHomePage(props: { params: { projectId: string; viewType: string }; searchParams: { [key: string]: string | string[] | undefined } }) {
  const space = (await getSpaceServerSide())!;
  const showArchived = props.searchParams?.['showArchived'] === 'true';
  const project = await getApiResponse<ProjectFragment>(space, `projects/${props.params.projectId}`);
  const bytes = await getApiResponse<ProjectByteFragment[]>(space, `projects/${props.params.projectId}/bytes`);
  const tidbitsToShow = bytes.filter((byte) => byte.archived === showArchived);

  return (
    <>
      <ShowArchivedToggle space={space} showArchived={showArchived} />
      <BytesGrid bytes={tidbitsToShow} baseByteViewUrl={`/projects/view/${project.id}/tidbits`} byteType={'projectByte'} project={project} space={space} />
    </>
  );
}

export default ProjectHomePage;
