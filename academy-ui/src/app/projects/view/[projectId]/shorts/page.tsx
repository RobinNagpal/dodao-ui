import ProjectShortVideosGrid from '@/components/projects/projectShortVideo/List/ProjectShortVideosGrid';
import { ProjectFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@dodao/web-core/api/auth/getSpaceServerSide';
import React from 'react';

async function ProjectHomePage(props: { params: { projectId: string; viewType: string }; searchParams: { [key: string]: string | string[] | undefined } }) {
  const space = (await getSpaceServerSide())!;

  const project = await getApiResponse<ProjectFragment>(space, `projects/${props.params.projectId}`);

  return <ProjectShortVideosGrid space={space} project={project} />;
}

export default ProjectHomePage;
