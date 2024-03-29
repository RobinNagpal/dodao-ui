import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import PrivateArchivedToggle from '@/components/projects/List/PrivateArchivedToggle';
import { ProjectByteCollectionFragment, ProjectFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

async function ProjectTidbitCollectionsPage(props: { params: { projectId: string }; searchParams: { [key: string]: string | string[] | undefined } }) {
  const space = (await getSpaceServerSide())!;
  const showArchived = props.searchParams?.['showArchived'] === 'true';
  const project = await getApiResponse<ProjectFragment>(space, `projects/${props.params.projectId}`);

  const byteCollections = await getApiResponse<ProjectByteCollectionFragment[]>(space, `projects/${props.params.projectId}/byte-collections`);

  const tidbitsCollectionsToShow = byteCollections.filter((bytecollection) => bytecollection.archived === showArchived);

  return (
    <>
      <div className="flex justify-end mb-4">
        <PrivateArchivedToggle space={space} showArchived={showArchived} />
      </div>
      <ByteCollectionsGrid
        space={space}
        project={project}
        byteCollections={tidbitsCollectionsToShow}
        byteCollectionType={'projectByteCollection'}
        byteCollectionsPageUrl={`/projects/view/${project?.id}/tidbit-collections`}
      />
    </>
  );
}

export default ProjectTidbitCollectionsPage;
