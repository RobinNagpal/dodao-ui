'use client';

import Button from '@/components/core/buttons/Button';
import UpsertProjectModal from '@/components/projects/Edit/UpsertProjectModal';
import { ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';
import PrivateArchivedToggle from '@/components/projects/List/PrivateArchivedToggle';
import { isAdmin } from '@/utils/auth/isAdmin';
import { Session } from '@/types/auth/Session';
import { useSession } from 'next-auth/react';

export default function ListProjectsTopBar(props: { space: SpaceWithIntegrationsFragment; showArchived: boolean }) {
  const [showProjectAddModal, setShowProjectAddModal] = useState(false);
  const [project, setProject] = useState<ProjectFragment | null>(null);
  const { data: session } = useSession();
  const isAdminUser = isAdmin(session as Session, props.space);

  return (
    <div className="flex gap-2 sm:gap-7 justify-between items-center">
      <PrivateArchivedToggle space={props.space} showArchived={props.showArchived} />

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
