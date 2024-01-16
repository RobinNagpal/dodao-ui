import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import ShowArchivedToggle from '@/components/bytes/List/ShowArchivedToggle';
import { ProjectByteCollectionFragment, ProjectFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

async function ProjectHomePage(props: { params: { projectId: string; viewType: string }; searchParams: { [key: string]: string | string[] | undefined } }) {
  const space = (await getSpaceServerSide())!;
  const showArchived = props.searchParams?.['showArchived'] === 'true';
  const project = await getApiResponse<ProjectFragment>(space, `projects/${props.params.projectId}`);

  const byteCollections = await getApiResponse<ProjectByteCollectionFragment[]>(space, `projects/${props.params.projectId}/byte-collections`);

  const tidbitsCollectionsToShow = byteCollections.filter((bytecollection) => bytecollection.archived === showArchived);

  return (
    <>
      <ShowArchivedToggle space={space} showArchived={showArchived} />
      <ByteCollectionsGrid space={space} project={project} byteCollections={tidbitsCollectionsToShow} byteCollectionType={'projectByteCollection'} />
    </>
  );
}

export default ProjectHomePage;
