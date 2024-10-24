'use client';

import PrivateComponent from '@/components/core/PrivateComponent';
import TabsWithUnderline, { TabItem } from '@dodao/web-core/components/core/tabs/TabsWithUnderline';
import { useRouter } from 'next/navigation';
import React from 'react';

export enum TidbitSiteTabIds {
  Tidbits = 'Tidbits',
  TidbitCollections = 'TidbitCollections',
  TidbitCollectionCategories = 'TidbitCollectionCategories',
}

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
      <div className="w-full flex justify-end mb-6 md:mb-8 ">
        <TabsWithUnderline
          selectedTabId={selectedTabId}
          setSelectedTabId={(id) => {
            if (id === TidbitSiteTabIds.Tidbits) {
              router.push('/tidbits');
            } else if (id === TidbitSiteTabIds.TidbitCollections) {
              router.push('/tidbit-collections');
            } else {
              router.push('/tidbit-collection-categories');
            }
          }}
          tabs={tabs}
          className="w-[26]"
        />
      </div>
    </PrivateComponent>
  );
}
