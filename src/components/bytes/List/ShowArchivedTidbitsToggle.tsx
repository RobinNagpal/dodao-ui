'use client';

import ToggleWithIcon from '@/components/core/toggles/ToggleWithIcon';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React from 'react';
import { usePathname } from 'next/navigation';

export default function ShowArchivedTidbitsToggle(props: { space: SpaceWithIntegrationsFragment; showArchived: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex justify-end mb-4">
      <ToggleWithIcon label={'Show Archived'} enabled={props.showArchived} setEnabled={(value) => router.push(`${pathname}?showArchived=${value}`)} />
    </div>
  );
}
