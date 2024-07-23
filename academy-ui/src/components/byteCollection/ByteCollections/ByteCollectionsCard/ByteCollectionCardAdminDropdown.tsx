import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import {
  ByteCollectionFragment,
  ProjectByteCollectionFragment,
  ProjectFragment,
  SpaceWithIntegrationsFragment,
  useUpdateArchivedStatusOfProjectByteCollectionMutation,
} from '@/graphql/generated/generated-types';
import React from 'react';
import UpdateProjectByteCollectionSEOModal from '../../Edit/UpdateProjectByteCollectionSEOModal';
import ByteCollectionEditor from '@/components/byteCollection/ByteCollections/ByteCollectionEditor';
import { EditByteCollection } from '@/components/byteCollection/ByteCollections/useEditByteCollection';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { useRouter } from 'next/navigation';

interface ByteCollectionCardAdminDropdownProps {
  byteCollection: ByteCollectionFragment | ProjectByteCollectionFragment;
  byteCollectionType: 'byteCollection' | 'projectByteCollection';
  project?: ProjectFragment;
  space: SpaceWithIntegrationsFragment;
}
export default function ByteCollectionCardAdminDropdown({ byteCollection, byteCollectionType, project, space }: ByteCollectionCardAdminDropdownProps) {
  const { showNotification } = useNotificationContext();
  const [showDeleteModal, setShowDeleteModal] = React.useState<boolean>(false);
  const [editProjecByteCollectionSeo, setEditProjectByteCollectionSeo] = React.useState<boolean>(false);
  const [showEditCollectionModal, setShowEditCollectionModal] = React.useState<boolean>(false);
  const router = useRouter();

  function onClose() {
    setShowEditCollectionModal(false);
    router.push(`/tidbit-collections`);
  }

  async function upsertByteCollectionFn(byteCollectionn: EditByteCollection) {
    try {
      const result = await fetch('/api/byte-collection/update-byte-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            byteCollectionId: byteCollectionn.id,
            name: byteCollectionn.name,
            description: byteCollectionn.description,
            byteIds: byteCollectionn.bytes.map((byte) => byte.byteId),
            status: byteCollectionn.status,
            spaceId: space.id,
            priority: byteCollectionn.priority,
            videoUrl: byteCollectionn.videoUrl,
          },
        }),
      });

      if (result.ok) {
        showNotification({ message: 'Values Updated Successfully', type: 'success' });
      }
    } catch (error) {
      showNotification({ message: 'Something went wrong', type: 'error' });
    }
  }

  const getThreeDotItems = (byteCollection: ByteCollectionFragment | ProjectByteCollectionFragment) => {
    if (byteCollection.hasOwnProperty('archived')) {
      if ((byteCollection as ProjectByteCollectionFragment).archived) {
        return [
          { label: 'Edit', key: 'edit' },
          { label: 'Edit Seo', key: 'editSeo' },
          { label: 'Unarchive', key: 'unarchive' },
        ];
      }
      return [
        { label: 'Edit', key: 'edit' },
        { label: 'Edit Seo', key: 'editSeo' },
        { label: 'Archive', key: 'archive' },
      ];
    }

    return [
      { label: 'Edit', key: 'edit' },
      { label: 'Edit Seo', key: 'editSeo' },
    ];
  };

  const [updateArchivedStatusOfProjectByteCollectionMutation] = useUpdateArchivedStatusOfProjectByteCollectionMutation();

  const onArchivedStatusChange = async (archived: boolean) => {
    try {
      await updateArchivedStatusOfProjectByteCollectionMutation({
        variables: {
          projectId: project!.id,
          byteCollectionId: byteCollection.id,
          archived: archived,
        },
        refetchQueries: ['ProjectByteCollections'],
      });
      if (archived) {
        showNotification({ message: 'ByteCollection archived successfully', type: 'success' });
      } else {
        showNotification({ message: 'ByteCollection un-archived successfully', type: 'success' });
      }
    } catch (error) {
      showNotification({ message: 'Something went wrong', type: 'error' });
    }
  };

  return (
    <>
      <PrivateEllipsisDropdown
        items={getThreeDotItems(byteCollection)}
        onSelect={async (key) => {
          if (key === 'edit') {
            setShowEditCollectionModal(true);
          }
          if (key === 'archive') {
            setShowDeleteModal(true);
          }
          if (key === 'unarchive') {
            onArchivedStatusChange(false);
          }
          if (key === 'editSeo') {
            setEditProjectByteCollectionSeo(true);
          }
        }}
      />
      {showDeleteModal && (
        <DeleteConfirmationModal
          title={'Delete Byte Collection'}
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => {
            onArchivedStatusChange(true);
            setShowDeleteModal(false);
          }}
        />
      )}

      {editProjecByteCollectionSeo && (
        <UpdateProjectByteCollectionSEOModal
          projectByteCollection={byteCollection}
          projectId={project?.id}
          open={!!editProjecByteCollectionSeo}
          onClose={() => {
            setEditProjectByteCollectionSeo(false);
          }}
        />
      )}

      {showEditCollectionModal && (
        <FullScreenModal open={true} onClose={onClose} title={'Edit Tidbit Collection'}>
          <div className="text-left">
            <PageWrapper>
              <SingleCardLayout>
                <ByteCollectionEditor
                  space={space}
                  byteCollection={byteCollection}
                  viewByteCollectionsUrl={'/tidbit-collections'}
                  upsertByteCollectionFn={upsertByteCollectionFn}
                />
              </SingleCardLayout>
            </PageWrapper>
          </div>
        </FullScreenModal>
      )}
    </>
  );
}
