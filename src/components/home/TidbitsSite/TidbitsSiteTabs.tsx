'use client';

import PrivateComponent from '@/components/core/PrivateComponent';
import TabsWithUnderline, { TabItem } from '@/components/core/tabs/TabsWithUnderline';
import { useRouter, usePathname } from 'next/navigation';
import React from 'react';

export enum TabIds {
  Tidbits = 'Tidbits',
  TidbitCollections = 'TidbitCollections',
}
export default function TidbitsSiteTabs({ selectedTabId }: { selectedTabId: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs: TabItem[] = [
    {
      id: TabIds.Tidbits,
      label: 'Tidbits',
    },

    {
      id: TabIds.TidbitCollections,
      label: 'Tidbit Collections',
    },
  ];

  return (
    <PrivateComponent>
      <div className="w-full flex justify-end mb-6">
        <TabsWithUnderline
          selectedTabId={selectedTabId || TabIds.TidbitCollections}
          setSelectedTabId={(id) => router.push(`${pathname}/?selectedTabId=` + id)}
          tabs={tabs}
          className="w-96"
        />
      </div>
    </PrivateComponent>
  );
}
