import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import BytesGrid from '@/components/bytes/List/BytesGrid';
import PrivateArchivedToggle from '@/components/projects/List/PrivateArchivedToggle';
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
      <div className="flex justify-end mb-4">
        <PrivateArchivedToggle space={space} showArchived={showArchived} />
      </div>
      <BytesGrid bytes={tidbitsToShow} baseByteViewUrl={`/projects/view/${project.id}/tidbits`} byteType={'projectByte'} project={project} space={space} />
    </>
  );
}

export default ProjectHomePage;
