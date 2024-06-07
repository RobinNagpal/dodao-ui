'use client';

import PrivateComponent from '@/components/core/PrivateComponent';
import ToggleWithIcon from '@/components/core/toggles/ToggleWithIcon';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function PrivateArchivedToggle(props: { space: SpaceWithIntegrationsFragment; showArchived: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <PrivateComponent>
      <ToggleWithIcon label={'Show Archived'} enabled={props.showArchived} setEnabled={(value) => router.push(`${pathname}?showArchived=${value}`)} />
    </PrivateComponent>
  );
}
