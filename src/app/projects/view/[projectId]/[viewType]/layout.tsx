import PageWrapper from '@/components/core/page/PageWrapper';
import { ViewProjectHeader } from '@/components/projects/View/ViewProjectHeader';
import { ProjectFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

async function ProjectViewHome(props: { params: { projectId: string; viewType: string }; children: React.ReactNode }) {
  const space = await getSpaceServerSide();
  const project = await getApiResponse<ProjectFragment>(space!, `projects/${props.params.projectId}`);

  return (
    <PageWrapper>
      <ViewProjectHeader project={project} selectedViewType={props.params.viewType} />
      <div className="mt-8">{props.children}</div>
    </PageWrapper>
  );
}

export default ProjectViewHome;
