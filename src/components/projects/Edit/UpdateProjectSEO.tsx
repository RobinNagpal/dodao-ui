import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import FullPageModal from '@/components/core/modals/FullPageModal';
import { Project, useUpdateSeoOfProjectMutation } from '@/graphql/generated/generated-types';
import React, { useEffect, useState } from 'react';
import useEditProject from './useEditProject';
import { useNotificationContext } from '@/contexts/NotificationContext';

export default function UpdateProjectSEO(props: { spaceId: string; project?: Project; open: boolean; onClose: () => void }) {
  const editProjectHelper = useEditProject(props.project?.id);
  const { project, upserting } = editProjectHelper;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [updateSeoOfProject] = useUpdateSeoOfProjectMutation();
  const { showNotification } = useNotificationContext();

  const updateSEOOfProject = async (projectId: string, title: string, description: string, keywords: string[]) => {
    try {
      const result = await updateSeoOfProject({
        variables: {
          projectId: projectId,
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

  useEffect(
    function () {
      editProjectHelper.initialize();
    },
    [project?.id]
  );

  useEffect(() => {
    if (project?.seoMeta) {
      const { title: seoTitle, description: seoDescription, keywords: seoKeywords } = project.seoMeta;
      setTitle(seoTitle || '');
      setDescription(seoDescription || '');
      setKeywords(seoKeywords || []);
    }
  }, [project?.seoMeta]);

  return (
    <FullPageModal open={props.open} onClose={props.onClose} title="Basic Project SEO Settings">
      <div className="project-y-12 text-left p-6">
        <div className="border-b pb-12">
          <h2 className="text-base font-semibold leading-7">Edit Project SEO</h2>
          <p className="mt-1 text-sm leading-6">Update SEO of the Project</p>
          <Input label="Title" modelValue={title} onUpdate={(value) => setTitle(value?.toString() ?? '')} />
          <Input label="Description" modelValue={description} onUpdate={(value) => setDescription(value?.toString() ?? '')} />
          <Input
            modelValue={keywords.join(', ')}
            label={'Keywords'}
            onUpdate={(value) =>
              setKeywords(
                value
                  ?.toString()
                  .split(',')
                  .map((k) => k.trim()) || []
              )
            }
          />
        </div>
      </div>

      <div className="p-6 flex items-center justify-end gap-x-6">
        <Button
          variant="contained"
          primary
          loading={upserting}
          onClick={async () => {
            await updateSEOOfProject(project?.id!, title, description, keywords);
            props.onClose();
          }}
        >
          Save
        </Button>
      </div>
    </FullPageModal>
  );
}
