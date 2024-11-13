'use client';

import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import ToggleWithIcon from '@dodao/web-core/components/core/toggles/ToggleWithIcon';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

export default function ShowArchivedToggle(props: { space: SpaceWithIntegrationsDto; showArchived: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex justify-end mb-4">
      <ToggleWithIcon label={'Show Archived'} enabled={props.showArchived} setEnabled={(value) => router.push(`${pathname}?showArchived=${value}`)} />
    </div>
  );
}
