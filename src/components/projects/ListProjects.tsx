'use client';

import Button from '@/components/core/buttons/Button';
import UpsertProjectModal from '@/components/projects/Edit/UpsertProjectModal';
import { ProjectFragment, SpaceWithIntegrationsFragment, useProjectsQuery } from '@/graphql/generated/generated-types';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import ToggleWithIcon from '../core/toggles/ToggleWithIcon';
import ListProjectsHelper from './ListProjectsHelper';

const MainDiv = styled.div`
  background-color: var(--bg-color);
  color: var(--text-color);
`;
export default function ListProjects(props: { space: SpaceWithIntegrationsFragment; type?: string }) {
  const variables: any = {};
  if (props.type && props.type !== 'All') {
    variables['type'] = props.type;
  }
  const { data, refetch } = useProjectsQuery({
    variables: variables,
  });

  console.log('data:', data);
  const [showProjectAddModal, setShowProjectAddModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [project, setProject] = useState<ProjectFragment | null>(null);

  const filteredProjects = useMemo(() => {
    return (data?.projects || []).filter((project) => (showArchived ? project.archived : !project.archived));
  }, [data, showArchived]);

  return (
    <MainDiv className="px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between">
        <div>
          <h1 className="font-semibold leading-6 text-2xl">Projects</h1>
          <p className="mt-2 text-sm">A list of all the projects.</p>
        </div>
        <div className="flex gap-2 sm:gap-7 justify-between items-center">
          <ToggleWithIcon label={'Show Archived'} enabled={showArchived} setEnabled={setShowArchived} />
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
