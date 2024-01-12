import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import BytesGrid from '@/components/bytes/List/BytesGrid';
import ProjectShortVideosGrid from '@/components/projects/projectShortVideo/List/ProjectShortVideosGrid';
import { ProjectByteCollectionFragment, ProjectByteFragment, ProjectFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

async function ProjectHomePage(props: { params: { projectId: string; viewType: string } }) {
  const space = (await getSpaceServerSide())!;

  const project = await getApiResponse<ProjectFragment>(space, `projects/${props.params.projectId}`);

  const byteCollections = await getApiResponse<ProjectByteCollectionFragment[]>(space, `projects/${props.params.projectId}/byte-collections`);

  const bytes = await getApiResponse<ProjectByteFragment[]>(space, `projects/${props.params.projectId}/bytes`);

  if (props.params.viewType === 'tidbits') {
    return (
      <BytesGrid
        bytes={bytes?.filter((byte) => !byte?.archived)}
        baseByteViewUrl={`/projects/view/${project.id}/tidbits`}
        byteType={'projectByte'}
        project={project}
        space={space}
      />
    );
  }

  if (props.params.viewType === 'shorts') {
    return <ProjectShortVideosGrid space={space} project={project} />;
  }

  return (
    <ByteCollectionsGrid
      loadingData={false}
      space={space}
      project={project}
      byteCollections={byteCollections?.filter((byteCollection) => !byteCollection?.archived)}
      byteCollectionType={'projectByteCollection'}
    />
  );
}

export default ProjectHomePage;
