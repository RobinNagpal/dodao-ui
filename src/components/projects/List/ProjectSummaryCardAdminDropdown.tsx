'use client';

import DeleteConfirmationModal from '@/components/app/Modal/DeleteConfirmationModal';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import UpsertProjectModal from '@/components/projects/Edit/UpsertProjectModal';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { ProjectFragment, SpaceWithIntegrationsFragment, useUpdateArchivedStatusOfProjectMutation } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';
import UpdateProjectSEOModal from '../Edit/UpdateProjectSEOModal';

export interface ProjectSummaryCardProps {
  space: SpaceWithIntegrationsFragment;
  project: ProjectFragment;
}

export default function ProjectSummaryCardAdminDropdown({ space, project }: ProjectSummaryCardProps) {
  const [editProject, setEditProject] = useState<ProjectFragment | null>(null);
  const [editProjectSeo, setEditProjectSeo] = useState<ProjectFragment | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [updateArchivedStatusOfProjectMutation] = useUpdateArchivedStatusOfProjectMutation();
  const { showNotification } = useNotificationContext();

  const getThreeDotItems = (project: ProjectFragment) => {
    if (project.archived) {
      return [
        { label: 'Edit', key: 'edit' },
        { label: 'Unarchive', key: 'unarchive' },
        { label: 'Edit SEO', key: 'editSeo' },
      ];
    }
    return [
      { label: 'Edit', key: 'edit' },
      { label: 'Archive', key: 'archive' },
      { label: 'Edit SEO', key: 'editSeo' },
    ];
  };

  const updateArchiveStatus = async (projectId: string, archived: boolean) => {
    try {
      await updateArchivedStatusOfProjectMutation({
        variables: {
          projectId: projectId,
          archived: archived,
        },
        refetchQueries: ['Projects'],
      });
      if (archived) {
        showNotification({ message: 'Project archived successfully', type: 'success' });
      } else {
        showNotification({ message: 'Project un-archived successfully', type: 'success' });
      }
    } catch (error) {
      showNotification({ message: 'Something went wrong', type: 'error' });
    }
  };

  return (
    <>
      <PrivateEllipsisDropdown
        items={getThreeDotItems(project)}
        onSelect={async (key, e: React.MouseEvent<HTMLAnchorElement>) => {
          if (key === 'edit') {
            setEditProject(project);
          } else if (key === 'archive') {
            setDeleteProjectId(project.id);
            setDeleteProjectId(project.id);
          } else if (key === 'unarchive') {
            updateArchiveStatus(project.id, false);
          } else if (key === 'editSeo') {
            setEditProjectSeo(project);
          }
          e.preventDefault();
          e.stopPropagation();
        }}
      />
      {deleteProjectId && (
        <DeleteConfirmationModal
          title={'Delete Project'}
          open={!!deleteProjectId}
          onClose={() => setDeleteProjectId(null)}
          onDelete={() => {
            updateArchiveStatus(deleteProjectId, true);
            setDeleteProjectId(null);
          }}
        />
      )}
      {editProject && (
        <UpsertProjectModal
          spaceId={space.id}
          project={project || undefined}
          open={!!editProject}
          onClose={() => {
            setEditProject(null);
          }}
        />
      )}

      {editProjectSeo && (
        <UpdateProjectSEOModal
          project={project}
          open={!!editProjectSeo}
          onClose={() => {
            setEditProjectSeo(null);
          }}
        />
      )}
    </>
  );
}
