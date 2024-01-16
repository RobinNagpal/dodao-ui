'use client';

import ToggleWithIcon from '@/components/core/toggles/ToggleWithIcon';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { Session } from '@/types/auth/Session';
import { isAdmin } from '@/utils/auth/isAdmin';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function PrivateArchivedToggle(props: { space: SpaceWithIntegrationsFragment; showArchived: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session } = useSession();

  const isUserAdmin = session && isAdmin(session as Session, props.space);

  return isUserAdmin ? (
    <ToggleWithIcon label={'Show Archived'} enabled={props.showArchived} setEnabled={(value) => router.push(`${pathname}?showArchived=${value}`)} />
  ) : null;
}
