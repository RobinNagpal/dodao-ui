import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import BytesGrid from '@/components/bytes/List/BytesGrid';
import ListTidbitsTopBar from '@/components/bytes/List/ListTidbitsTopbar';
import ProjectShortVideosGrid from '@/components/projects/projectShortVideo/List/ProjectShortVideosGrid';
import { ProjectByteCollectionFragment, ProjectByteFragment, ProjectFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

async function ProjectHomePage(props: { params: { projectId: string; viewType: string }; searchParams: { [key: string]: string | string[] | undefined } }) {
  const space = (await getSpaceServerSide())!;
  const showArchived = props.searchParams?.['showArchived'] === 'true';
  const project = await getApiResponse<ProjectFragment>(space, `projects/${props.params.projectId}`);

  const byteCollections = await getApiResponse<ProjectByteCollectionFragment[]>(space, `projects/${props.params.projectId}/byte-collections`);

  const bytes = await getApiResponse<ProjectByteFragment[]>(space, `projects/${props.params.projectId}/bytes`);

  const tidbitsToShow = bytes.filter((byte) => byte.archived === showArchived);
  const tidbitsCollectionsToShow = byteCollections.filter((bytecollection) => bytecollection.archived === showArchived);
  if (props.params.viewType === 'tidbits') {
    return (
      <>
        <ListTidbitsTopBar space={space} showArchived={showArchived} />
        <BytesGrid bytes={tidbitsToShow} baseByteViewUrl={`/projects/view/${project.id}/tidbits`} byteType={'projectByte'} project={project} space={space} />
      </>
    );
  }

  if (props.params.viewType === 'shorts') {
    return <ProjectShortVideosGrid space={space} project={project} />;
  }

  return (
    <>
      <ListTidbitsTopBar space={space} showArchived={showArchived} />
      <ByteCollectionsGrid space={space} project={project} byteCollections={tidbitsCollectionsToShow} byteCollectionType={'projectByteCollection'} />
    </>
  );
}

export default ProjectHomePage;
