'use client';

import Button from '@/components/core/buttons/Button';
import ToggleWithIcon from '@/components/core/toggles/ToggleWithIcon';
import UpsertProjectModal from '@/components/projects/Edit/UpsertProjectModal';
import { ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { isAdmin } from '@/utils/auth/isAdmin';
import { useSession } from 'next-auth/react';
import { Session } from '@/types/auth/Session';

export default function ListProjectsTopBar(props: { space: SpaceWithIntegrationsFragment; showArchived: boolean }) {
  const [showProjectAddModal, setShowProjectAddModal] = useState(false);
  const [project, setProject] = useState<ProjectFragment | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdminUser = isAdmin(session as Session, props.space);

  return (
    <div className="flex gap-2 sm:gap-7 justify-between items-center">
      {isAdminUser && (
        <ToggleWithIcon label={'Show Archived'} enabled={props.showArchived} setEnabled={(value) => router.push(`${pathname}?showArchived=${value}`)} />
      )}

      {isAdminUser && (
        <div className="mt-4 flex-none">
          <Button variant="contained" primary onClick={() => setShowProjectAddModal(true)}>
            Add Project
          </Button>
        </div>
      )}

      {showProjectAddModal && (
        <UpsertProjectModal
          spaceId={props.space.id}
          project={project || undefined}
          open={showProjectAddModal}
          onClose={() => {
            setShowProjectAddModal(false);
            setProject(null);
          }}
        />
      )}
    </div>
  );
}
