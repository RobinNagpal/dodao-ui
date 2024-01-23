import UpdateSEOModal from '@/components/app/Common/UpdateSEOModal';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { Project, useUpdateSeoOfProjectMutation } from '@/graphql/generated/generated-types';
import React from 'react';

export default function UpdateProjectSEOModal(props: { project: Project; open: boolean; onClose: () => void }) {
  const [updateSeoOfProject] = useUpdateSeoOfProjectMutation();
  const { showNotification } = useNotificationContext();

  const updateSEOOfProject = async (title: string, description: string, keywords: string[]) => {
    try {
      const result = await updateSeoOfProject({
        variables: {
          projectId: props.project.id,
          seoMeta: {
            title: title || '',
            description: description || '',
            keywords: keywords,
          },
        },
        refetchQueries: ['Projects'],
      });

      if (result) {
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
        await updateSEOOfProject(seoMeta.title, seoMeta.description, seoMeta.keywords);
      }}
    />
  );
}
