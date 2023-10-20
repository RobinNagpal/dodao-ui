'use client';

import { TOP_CRYPTO_PROJECTS_SPACE_ID } from '@/chatbot/utils/app/constants';
import PageWrapper from '@/components/core/page/PageWrapper';
import { Table, TableActions, TableRow } from '@/components/core/table/Table';
import TabsWithUnderline, { TabItem } from '@/components/core/tabs/TabsWithUnderline';
import UpsertProjectModal from '@/components/projects/Edit/UpsertProjectModal';
import TopCryptoTopNav from '@/components/projects/Nav/TopCryptoTopNav';
import { ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import { ProjectFragment, SpaceWithIntegrationsFragment, useProjectsQuery } from '@/graphql/generated/generated-types';
import { ProjectTypes } from '@/types/deprecated/models/enums';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

export default function ProjectsHome({ space }: { space: SpaceWithIntegrationsFragment }) {
  const [selectedTabId, setSelectedTabId] = useState(ProjectTypes.DeFi);

  const { data } = useProjectsQuery({
    variables: {
      type: selectedTabId.toString(),
    },
  });
  const [showProjectAddModal, setShowProjectAddModal] = useState(false);
  const router = useRouter();

  function getProjectTableRows(projectList?: ProjectFragment[]): TableRow[] {
    return (projectList || []).map(
      (project): TableRow => ({
        id: project.id,
        columns: [project.name, project.id, project.admins.join(', ')],
        item: project,
      })
    );
  }

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
    <div>
      <TopCryptoTopNav space={space} />
      <PageWrapper>
        <div className="flex justify-between">
          <h1 className="text-3xl"> Projects List</h1>
        </div>
        <Table
          data={getProjectTableRows(data?.projects || [])}
          columnsHeadings={['Name', 'Id', 'Admins']}
          columnsWidthPercents={[30, 30, 30]}
          actions={tableActions}
        />
        {showProjectAddModal && (
          <UpsertProjectModal spaceId={TOP_CRYPTO_PROJECTS_SPACE_ID} open={showProjectAddModal} onClose={() => setShowProjectAddModal(false)} />
        )}
      </PageWrapper>
    </div>
  );
}
