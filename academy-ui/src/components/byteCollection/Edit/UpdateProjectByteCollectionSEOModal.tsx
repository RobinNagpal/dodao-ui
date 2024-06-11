import UpdateSEOModal from '@/components/app/Common/UpdateSEOModal';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import {
  ByteCollectionFragment,
  ProjectByteCollectionFragment,
  useProjectByteCollectionQuery,
  useUpdateSeoOfProjectByteCollectionMutation,
} from '@/graphql/generated/generated-types';
import React from 'react';

export default function UpdateProjectByteCollectionSEOModal(props: {
  projectByteCollection: ByteCollectionFragment | ProjectByteCollectionFragment;
  open: boolean;
  onClose: () => void;
  projectId: string | undefined;
}) {
  const [updateSeoOfProjectByteCollection] = useUpdateSeoOfProjectByteCollectionMutation();
  const { showNotification } = useNotificationContext();

  const result = useProjectByteCollectionQuery({
    variables: {
      id: props.projectByteCollection.id,
      projectId: props.projectId!,
    },
    fetchPolicy: 'no-cache',
  });

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
      seoMeta={result.data?.projectByteCollection.seoMeta}
      onSeoMetaUpdate={async (seoMeta) => {
        await updateSEOOfProjectByteCollection(seoMeta.title, seoMeta.description, seoMeta.keywords);
      }}
    />
  );
}
