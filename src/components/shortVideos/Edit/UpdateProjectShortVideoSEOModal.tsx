import UpdateSEOModal from '@/components/app/Common/UpdateSEOModal';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { ProjectShortVideo, ShortVideo, useUpdateSeoOfProjectShortVideoMutation } from '@/graphql/generated/generated-types';
import React from 'react';

export default function UpdateProjectShortVideoSEOModal(props: { projectShortVideo: ShortVideo | ProjectShortVideo; open: boolean; onClose: () => void }) {
  const [updateSeoOfProjectShortVideo] = useUpdateSeoOfProjectShortVideoMutation();
  const { showNotification } = useNotificationContext();

  const updateSEOOfProjectShortVideo = async (title: string, description: string, keywords: string[]) => {
    try {
      const result = await updateSeoOfProjectShortVideo({
        variables: {
          projectId: props.projectShortVideo.id,
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
        await updateSEOOfProjectShortVideo(seoMeta.title, seoMeta.description, seoMeta.keywords);
      }}
    />
  );
}
