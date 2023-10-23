'use client';

import Button from '@/components/core/buttons/Button';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import TabsWithUnderline, { TabItem } from '@/components/core/tabs/TabsWithUnderline';
import CreateProjectContentModalContents from '@/components/projects/Nav/CreateProjectContentModalContents';
import { ProjectFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export function ViewProjectHeader({ project, selectedViewType }: { project: ProjectFragment; selectedViewType: string }) {
  const [showCreateContentsModal, setShowCreateContentsModal] = React.useState(false);
  const tabs: TabItem[] = [
    {
      id: 'tidbits',
      label: 'Tidbits',
      href: `/projects/view/${project.id}/tidbits`,
    },
    {
      id: 'tidbit-collections',
      label: 'Tidbits Collections',
      href: `/projects/view/${project.id}/tidbit-collections`,
    },
  ];
  return (
    <div className="flex justify-end">
      <div className="flex">
        <Button variant="contained" primary className="mr-2" onClick={() => setShowCreateContentsModal(true)}>
          New +
        </Button>
        <TabsWithUnderline selectedTabId={selectedViewType} setSelectedTabId={(id) => ``} tabs={tabs} className="w-96" />
      </div>
      {showCreateContentsModal && (
        <FullScreenModal open={showCreateContentsModal} onClose={() => setShowCreateContentsModal(false)} title={'Create'} showCloseButton={false}>
          <CreateProjectContentModalContents projectId={project.id} hideModal={() => setShowCreateContentsModal(false)} />
        </FullScreenModal>
      )}
    </div>
  );
}
