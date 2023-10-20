'use client';

import TabsWithUnderline, { TabItem } from '@/components/core/tabs/TabsWithUnderline';
import { ProjectFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export function ViewProjectHeader({ project, selectedViewType }: { project: ProjectFragment; selectedViewType: string }) {
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
      <TabsWithUnderline selectedTabId={selectedViewType} setSelectedTabId={(id) => ``} tabs={tabs} className="w-96" />
    </div>
  );
}
