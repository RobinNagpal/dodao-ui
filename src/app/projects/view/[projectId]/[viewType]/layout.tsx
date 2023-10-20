import PageWrapper from '@/components/core/page/PageWrapper';
import { ViewProjectHeader } from '@/components/projects/View/ViewProjectHeader';
import { getProjectUsingAPI } from '@/utils/api/getProjectUsingAPI';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

async function ProjectViewHome(props: { params: { projectId: string; viewType: string }; children: React.ReactNode }) {
  const space = await getSpaceServerSide();
  const project = await getProjectUsingAPI(props.params.projectId);
  return (
    <PageWrapper>
      <ViewProjectHeader project={project!} selectedViewType={props.params.viewType} />
      {props.children}
    </PageWrapper>
  );
}

export default ProjectViewHome;
