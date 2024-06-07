'use client';

import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import { ByteSummaryType } from '@/components/bytes/Summary/ByteSummaryCard';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { ProjectByteFragment, ProjectFragment, useUpdateArchivedStatusOfProjectByteMutation } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React from 'react';
import UpdateProjectByteSEOModal from '../Edit/UpdateProjectByteSEOModal';

interface ByteCardAdminDropdownProps {
  byte: ByteSummaryType | ProjectByteFragment;
  byteType: 'byte' | 'projectByte';
  project?: ProjectFragment;
}
export default function ByteCardAdminDropdown({ byte, byteType, project }: ByteCardAdminDropdownProps) {
  const router = useRouter();
  const { showNotification } = useNotificationContext();
  const [showDeleteModal, setShowDeleteModal] = React.useState<boolean>(false);
  const [editProjecByteSeo, setEditProjectByteSeo] = React.useState<boolean>(false);
  const baseBytesEditUrl = byteType === 'projectByte' ? `/projects/edit/${project?.id}/tidbits` : '/tidbits/edit';
  const getThreeDotItems = (byte: ByteSummaryType | ProjectByteFragment) => {
    if (byte.hasOwnProperty('archived')) {
      if ((byte as ProjectByteFragment).archived) {
        return [
          { label: 'Edit', key: 'edit' },
          { label: 'Edit SEO', key: 'editSeo' },
          { label: 'Unarchive', key: 'unarchive' },
        ];
      }
      return [
        { label: 'Edit', key: 'edit' },
        { label: 'Edit SEO', key: 'editSeo' },
        { label: 'Archive', key: 'archive' },
      ];
    }

    return [
      { label: 'Edit', key: 'edit' },
      { label: 'Edit SEO', key: 'editSeo' },
    ];
  };

  const [updateArchivedStatusOfProjectByteMutation] = useUpdateArchivedStatusOfProjectByteMutation();

  const onArchivedStatusChange = async (archived: boolean) => {
    try {
      await updateArchivedStatusOfProjectByteMutation({
        variables: {
          projectId: project!.id,
          projectByteId: byte.id,
          archived: archived,
        },
        refetchQueries: ['ProjectBytes'],
      });
      if (archived) {
        showNotification({ message: 'Byte archived successfully', type: 'success' });
      } else {
        showNotification({ message: 'Byte un-archived successfully', type: 'success' });
      }
    } catch (error) {
      showNotification({ message: 'Something went wrong', type: 'error' });
    }
  };

  return (
    <>
      <PrivateEllipsisDropdown
        items={getThreeDotItems(byte)}
        onSelect={async (key, e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          e.stopPropagation();
          if (key === 'edit') {
            router.push(`${baseBytesEditUrl}/${byte.id}`);
          } else if (key === 'archive') {
            setShowDeleteModal(true);
          } else if (key === 'unarchive') {
            onArchivedStatusChange(false);
          } else if (key === 'editSeo') {
            setEditProjectByteSeo(true);
          }
        }}
      />
      {showDeleteModal && (
        <DeleteConfirmationModal
          title={'Delete Byte '}
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => {
            onArchivedStatusChange(true);
            setShowDeleteModal(false);
          }}
        />
      )}

      {editProjecByteSeo && (
        <UpdateProjectByteSEOModal
          projectByte={byte}
          open={!!editProjecByteSeo}
          projectId={project?.id}
          onClose={() => {
            setEditProjectByteSeo(false);
          }}
        />
      )}
    </>
  );
}
