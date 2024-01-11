import ProjectSummaryCard from '@/components/projects/List/ProjectSummaryCard';
import { ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import groupBy from 'lodash/groupBy';
import React from 'react';
import 'react-loading-skeleton/dist/skeleton.css';

type ListProjectsHelperProps = {
  space: SpaceWithIntegrationsFragment;
  projects: ProjectFragment[];
};

const ListProjectsHelper: React.FC<ListProjectsHelperProps> = ({ projects, space }) => {
  const groupedProjects = groupBy(projects, 'type');

  return (
    <div className="my-5">
      {Object.keys(groupedProjects).map((type) => (
        <div key={type}>
          <h2 className="text-lg font-semibold my-2">{type} Projects</h2>
          <div className="grid grid-cols-1 xs:grid-cols-1 s:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {groupedProjects[type].map((proj) => (
              <ProjectSummaryCard key={proj.id} space={space} project={proj} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListProjectsHelper;
