'use client';

import Button from '@/components/core/buttons/Button';
import UpsertProjectModal from '@/components/projects/Edit/UpsertProjectModal';
import { ProjectFragment, SpaceWithIntegrationsFragment, useProjectsQuery } from '@/graphql/generated/generated-types';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import ShowArchivedToggle from '@/components/projects/List/PrivateArchivedToggle';
import ListProjectsHelper from './ListProjectsHelper';

const MainDiv = styled.div`
  background-color: var(--bg-color);
  color: var(--text-color);
`;
export default function ListProjects(props: { space: SpaceWithIntegrationsFragment; type?: string; showArchived?: boolean }) {
  const variables: any = {};
  if (props.type && props.type !== 'All') {
    variables['type'] = props.type;
  }
  const { data, refetch } = useProjectsQuery({
    variables: variables,
  });

  console.log('data:', data);
  const [showProjectAddModal, setShowProjectAddModal] = useState(false);
  const [project, setProject] = useState<ProjectFragment | null>(null);

  const filteredProjects = (data?.projects || []).filter((project) => (props.showArchived ? project.archived : !project.archived));

  const hasArchivedProjects = !!data?.projects?.find((project) => project.archived === true);
  return (
    <MainDiv className="px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between">
        <div>
          <h1 className="font-semibold leading-6 text-2xl">Projects</h1>
          <p className="mt-2 text-sm">A list of all the projects.</p>
        </div>
        <div className="flex gap-2 sm:gap-7 justify-between items-center">
          {hasArchivedProjects && <ShowArchivedToggle space={props.space} showArchived={props.showArchived} />}
          <div className="mt-4 flex-none">
            <Button variant="contained" primary onClick={() => setShowProjectAddModal(true)}>
              Add Project
            </Button>
          </div>
        </div>
      </div>
      <ListProjectsHelper
        projects={filteredProjects}
        onShowEditModal={(project) => {
          setShowProjectAddModal(true);
          setProject(project);
        }}
      />
      {showProjectAddModal && (
        <UpsertProjectModal
          spaceId={props.space.id}
          project={project || undefined}
          open={showProjectAddModal}
          onClose={() => {
            setShowProjectAddModal(false);
            setProject(null);
          }}
        />
      )}
    </MainDiv>
  );
}
