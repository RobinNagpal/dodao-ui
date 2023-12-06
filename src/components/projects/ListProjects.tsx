'use client';

import Button from '@/components/core/buttons/Button';
import { Table, TableActions, TableRow } from '@/components/core/table/Table';
import UpsertProjectModal from '@/components/projects/Edit/UpsertProjectModal';
import { ProjectFragment, SpaceWithIntegrationsFragment, useProjectsQuery } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';

const MainDiv = styled.div`
  background-color: var(--bg-color);
  color: var(--text-color);
`;

function getProjectTableRows(projectList?: ProjectFragment[]): TableRow[] {
  return (projectList || []).map(
    (project): TableRow => ({
      id: project.id,
      columns: [project.name, project.id, project.admins.join(', ')],
      item: project,
    })
  );
}

export default function ListProjects(props: { space: SpaceWithIntegrationsFragment; type?: string }) {
  const variables: any = {};
  if (props.type) {
    variables['type'] = props.type;
  }
  const { data } = useProjectsQuery({
    variables: variables,
  });
  const [showProjectAddModal, setShowProjectAddModal] = useState(false);
  const router = useRouter();
  const tableActions: TableActions = useMemo(() => {
    return {
      items: [
        {
          key: 'view',
          label: 'View',
        },
      ],
      onSelect: async (key: string, project: ProjectFragment) => {
        if (key === 'view') {
          router.push(`/projects/view/${project.id}/tidbit-collections`);
        }
      },
    };
  }, []);

  return (
    <MainDiv className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="font-semibold leading-6 text-2xl">Projects</h1>
          <p className="mt-2 text-sm">A list of all the projects.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button variant="contained" primary onClick={() => setShowProjectAddModal(true)}>
            Add Project
          </Button>
        </div>
      </div>
      <Table
        data={getProjectTableRows(data?.projects || [])}
        columnsHeadings={['Name', 'Id', 'Skin', 'Admins']}
        columnsWidthPercents={[20, 20, 20, 20]}
        actions={tableActions}
      />
      {showProjectAddModal && <UpsertProjectModal spaceId={props.space.id} open={showProjectAddModal} onClose={() => setShowProjectAddModal(false)} />}
    </MainDiv>
  );
}
