import UpdateSEOModal from '@/components/app/Common/UpdateSEOModal';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { ByteCollectionFragment, ProjectByteCollectionFragment, useUpdateSeoOfProjectByteCollectionMutation } from '@/graphql/generated/generated-types';
import React from 'react';

export default function UpdateProjectByteCollectionSEOModal(props: {
  projectByteCollection: ByteCollectionFragment | ProjectByteCollectionFragment;
  open: boolean;
  onClose: () => void;
}) {
  const [updateSeoOfProjectByteCollection] = useUpdateSeoOfProjectByteCollectionMutation();
  const { showNotification } = useNotificationContext();

  const updateSEOOfProjectByteCollection = async (title: string, description: string, keywords: string[]) => {
    try {
      const result = await updateSeoOfProjectByteCollection({
        variables: {
          projectId: props.projectByteCollection.id,
          seoMeta: {
            title: title || '',
            description: description || '',
            keywords: keywords,
          },
        },
        refetchQueries: ['ProjectByteCollections'],
      });

      if (result.data) {
        showNotification({ message: 'Values Updated Successfully', type: 'success' });
      }
    } catch (error) {
      showNotification({ message: 'Something went wrong', type: 'error' });
    }
  };

  return (
    <UpdateSEOModal
      open={props.open}
      onClose={() => {
        props.onClose();
      }}
      onSeoMetaUpdate={async (seoMeta) => {
        await updateSEOOfProjectByteCollection(seoMeta.title, seoMeta.description, seoMeta.keywords);
      }}
    />
  );
}
