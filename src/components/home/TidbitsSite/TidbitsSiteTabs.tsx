'use client';

import PrivateComponent from '@/components/core/PrivateComponent';
import TabsWithUnderline, { TabItem } from '@/components/core/tabs/TabsWithUnderline';
import { TidbitSiteTabIds } from '@/components/home/TidbitsSite/TidbitSiteTabIds';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function TidbitsSiteTabs({ selectedTabId }: { selectedTabId?: string }) {
  const router = useRouter();

  const tabs: TabItem[] = [
    {
      id: TidbitSiteTabIds.Tidbits,
      label: 'Tidbits',
    },

    {
      id: TidbitSiteTabIds.TidbitCollections,
      label: 'Tidbit Collections',
    },
    {
      id: TidbitSiteTabIds.TidbitCollectionCategories,
      label: 'Collection Categories',
    },
  ];

  return (
    <PrivateComponent>
      <div className="w-full flex justify-end mb-6">
        <TabsWithUnderline
          selectedTabId={selectedTabId || TidbitSiteTabIds.TidbitCollections}
          setSelectedTabId={(id) => router.push('/?selectedTabId=' + id)}
          tabs={tabs}
          className="w-96"
        />
      </div>
    </PrivateComponent>
  );
}
