'use client';

import ProjectSummaryCard from '@/components/projects/List/ProjectSummaryCard';
import Button from '@/components/core/buttons/Button';
import { ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import groupBy from 'lodash/groupBy';
import React, { useState } from 'react';
import 'react-loading-skeleton/dist/skeleton.css';

type ListProjectsHelperProps = {
  space: SpaceWithIntegrationsFragment;
  projects: ProjectFragment[];
};

const ListProjectsHelper: React.FC<ListProjectsHelperProps> = ({ projects, space }) => {
  const [visibleProjectsCount, setVisibleProjectsCount] = useState<{ [key: string]: number }>({});
  const groupedProjects = groupBy(projects, 'type');
  Object.keys(groupedProjects).forEach((type) => {
    if (!visibleProjectsCount[type]) {
      visibleProjectsCount[type] = 5;
    }
  });
  const handleShowMoreClick = (type: string) => {
    setVisibleProjectsCount((prevCount) => ({
      ...prevCount,
      [type]: (prevCount[type] || 0) + 5,
    }));
  };

  return (
    <div className="my-5">
      {Object.keys(groupedProjects).map((type) => (
        <div key={type} className="mb-16">
          <h2 className="text-lg font-semibold my-2">{type} Projects</h2>
          <div className="grid grid-cols-1 xs:grid-cols-1 s:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {groupedProjects[type].slice(0, visibleProjectsCount[type] || 5).map((proj) => (
              <ProjectSummaryCard key={proj.id} space={space} project={proj} />
            ))}
          </div>
          {groupedProjects[type].length > (visibleProjectsCount[type] || 5) && (
            <div className="text-center mt-4">
              <Button variant="contained" primary onClick={() => handleShowMoreClick(type)}>
                Show More
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ListProjectsHelper;
