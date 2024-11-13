'use client';

import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { isAdmin } from '@/utils/auth/isAdmin';
import ToggleWithIcon from '@dodao/web-core/components/core/toggles/ToggleWithIcon';
import { Session } from '@dodao/web-core/types/auth/Session';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';

export interface ShowDraftsToggleProps {
  space: SpaceWithIntegrationsDto;
  showDrafts: boolean;
}
export default function ShowDraftsToggle({ showDrafts, space }: ShowDraftsToggleProps) {
  const router = useRouter();

  const { data: session } = useSession();

  const isUserAdmin = session && isAdmin(session as Session, space);

  return isUserAdmin ? (
    <div className="w-full mb-4 flex justify-end">
      <div className="w-52">
        <ToggleWithIcon label={'Show Draft'} enabled={showDrafts} setEnabled={(value) => router.push(`/guides?showDrafts=${value}`)} />
      </div>
    </div>
  ) : null;
}
