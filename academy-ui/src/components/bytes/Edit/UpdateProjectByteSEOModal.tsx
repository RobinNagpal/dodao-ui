import UpdateSEOModal from '@/components/app/Common/UpdateSEOModal';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { ProjectByteFragment, useProjectByteQuery, useUpdateSeoOfProjectByteMutation } from '@/graphql/generated/generated-types';
import React from 'react';
import { ByteSummaryType } from '../Summary/ByteSummaryCard';

export default function UpdateProjectByteSEOModal(props: {
  projectByte: ByteSummaryType | ProjectByteFragment;
  open: boolean;
  onClose: () => void;
  projectId: string | undefined;
}) {
  const [updateSeoOfProjectByte] = useUpdateSeoOfProjectByteMutation();
  const { showNotification } = useNotificationContext();

  const result = useProjectByteQuery({
    variables: {
      id: props.projectByte.id,
      projectId: props.projectId!,
    },
    fetchPolicy: 'no-cache',
  });

  const updateSEOOfProjectByte = async (title: string, description: string, keywords: string[]) => {
    try {
      const result = await updateSeoOfProjectByte({
        variables: {
          projectId: props.projectByte.id,
          seoMeta: {
            title: title || '',
            description: description || '',
            keywords: keywords,
          },
        },
        refetchQueries: ['ProjectBytes'],
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
      seoMeta={result.data?.projectByte.seoMeta}
      onSeoMetaUpdate={async (seoMeta) => {
        await updateSEOOfProjectByte(seoMeta.title, seoMeta.description, seoMeta.keywords);
      }}
    />
  );
}
