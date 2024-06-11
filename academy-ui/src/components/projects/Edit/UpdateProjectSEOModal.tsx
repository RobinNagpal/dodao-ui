import UpdateSEOModal from '@/components/app/Common/UpdateSEOModal';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { Project, useProjectQuery, useUpdateSeoOfProjectMutation } from '@/graphql/generated/generated-types';
import React from 'react';

export default function UpdateProjectSEOModal(props: { project: Project; open: boolean; onClose: () => void }) {
  const [updateSeoOfProject] = useUpdateSeoOfProjectMutation();
  const { showNotification } = useNotificationContext();

  // reload the project here since the projects fetched earlier were on the server side
  // and when we update the seo, we need to refetch the project to get the updated seo
  const result = useProjectQuery({
    variables: {
      id: props.project.id,
    },
    fetchPolicy: 'no-cache',
  });

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
        refetchQueries: ['Project'],
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
      seoMeta={result.data?.project?.seoMeta}
      onSeoMetaUpdate={async (seoMeta) => {
        await updateSEOOfProject(seoMeta.title, seoMeta.description, seoMeta.keywords);
      }}
    />
  );
}
