'use client';

import Button from '@/components/core/buttons/Button';
import ToggleWithIcon from '@/components/core/toggles/ToggleWithIcon';
import UpsertProjectModal from '@/components/projects/Edit/UpsertProjectModal';
import { ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

export default function ListProjectsTopBar(props: { space: SpaceWithIntegrationsFragment }) {
  const [showProjectAddModal, setShowProjectAddModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [project, setProject] = useState<ProjectFragment | null>(null);

  return (
    <div className="flex gap-2 sm:gap-7 justify-between items-center">
      <ToggleWithIcon label={'Show Archived'} enabled={showArchived} setEnabled={setShowArchived} />
      <div className="mt-4 flex-none">
        <Button variant="contained" primary onClick={() => setShowProjectAddModal(true)}>
          Add Project
        </Button>
      </div>
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
