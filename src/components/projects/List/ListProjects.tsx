import ListProjectsTopBar from '@/components/projects/List/ListProjectsTopBar';
import ProjectSummaryCard from '@/components/projects/List/ProjectSummaryCard';
import { ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import groupBy from 'lodash/groupBy';
import React from 'react';

export default function ListProjects(props: { space: SpaceWithIntegrationsFragment; projects: ProjectFragment[]; showArchived: boolean }) {
  const projectsToShow = props.projects.filter((project) => project.archived === props.showArchived);
  const groupedProjects = groupBy(projectsToShow, 'type');

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-end">
        <ListProjectsTopBar space={props.space} showArchived={props.showArchived} />
      </div>
      <div className="my-5">
        {Object.keys(groupedProjects).map((type) => (
          <div key={type} className="mb-16">
            <h2 className="text-lg font-semibold my-2">{type} Projects</h2>
            <div className="grid grid-cols-1 xs:grid-cols-1 s:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {groupedProjects[type].map((proj) => (
                <ProjectSummaryCard key={proj.id} space={props.space} project={proj} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
