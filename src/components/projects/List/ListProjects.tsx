import PageWrapper from '@/components/core/page/PageWrapper';
import ListProjectsTopBar from '@/components/projects/List/ListProjectsTopBar';
import { ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';
import ListProjectsHelper from './ListProjectsHelper';

export default function ListProjects(props: { space: SpaceWithIntegrationsFragment; projects: ProjectFragment[]; showArchived: boolean }) {
  const projectsToShow = props.projects.filter((project) => project.archived === props.showArchived);
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-end">
        <ListProjectsTopBar space={props.space} showArchived={props.showArchived} />
      </div>
      <ListProjectsHelper space={props.space} projects={projectsToShow} />
    </div>
  );
}
