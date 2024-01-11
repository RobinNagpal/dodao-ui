'use client';

import ToggleWithIcon from '@/components/core/toggles/ToggleWithIcon';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { Session } from '@/types/auth/Session';
import { isAdmin } from '@/utils/auth/isAdmin';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';

export interface ShowArchivedToggleProps {
  space: SpaceWithIntegrationsFragment;
  showArchived?: boolean;
}
export default function ShowArchivedToggle({ showArchived, space }: ShowArchivedToggleProps) {
  const router = useRouter();

  const { data: session } = useSession();

  const isUserAdmin = session && isAdmin(session as Session, space);

  return isUserAdmin ? (
    <ToggleWithIcon label={'Show Archived'} enabled={showArchived || false} setEnabled={(value) => router.push(`/projects/type/all?showArchived=${value}`)} />
  ) : null;
}
