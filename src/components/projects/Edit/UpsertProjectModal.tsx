import UploadInput from '@/components/app/UploadInput';
import UpsertBadgeInput from '@/components/core/badge/UpsertBadgeInput';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import StyledSelect from '@/components/core/select/StyledSelect';
import { Project } from '@/graphql/generated/generated-types';
import { ProjectTypes } from '@/types/deprecated/models/enums';
import { slugify } from '@/utils/auth/slugify';
import { projectTypeSelect } from '@/utils/ui/statuses';
import union from 'lodash/union';
import React, { useEffect, useState } from 'react';
import useEditProject from './useEditProject';

export default function UpsertProjectModal(props: { spaceId: String; project?: Project; open: boolean; onClose: () => void }) {
  const editProjectHelper = useEditProject(props.project?.id);
  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false);

  const { project, setProjectField, upsertProject, upserting } = editProjectHelper;

  function inputError(avatar: string) {
    return null;
  }

  useEffect(() => {
    editProjectHelper.initialize();
  }, [project?.id]);

  return (
    <FullScreenModal open={props.open} onClose={props.onClose} title="Basic Project Settings">
      <div className="project-y-12 text-left p-6">
        <div className="border-b pb-12">
          <h2 className="text-base font-semibold leading-7">Edit Project</h2>
          <p className="mt-1 text-sm leading-6">Update the details of Project</p>

          <Input label="Id" modelValue={project?.id} onUpdate={(value) => setProjectField('id', value?.toString() || '')} />
          <Input label="Name" modelValue={project?.name} onUpdate={(value) => setProjectField('name', value?.toString() || '')} />
          <UploadInput
            label="Logo"
            error={inputError('logo')}
            onUpdate={(newValue) => setProjectField('logo', newValue)}
            imageType="AcademyLogo"
            spaceId={project?.id || 'new-project'}
            modelValue={project?.logo}
            objectId={(project?.name && slugify(project?.name)) || project?.id || 'new-project'}
            onInput={(value) => setProjectField('logo', value)}
            onLoading={setUploadThumbnailLoading}
          />

          <StyledSelect
            label="Theme"
            selectedItemId={project?.type || ProjectTypes.DeFi}
            items={projectTypeSelect}
            setSelectedItemId={(value) => setProjectField('type', value)}
          />

          <UpsertBadgeInput
            label={'Admins By Usernames'}
            badges={project.adminUsernames.map((d) => ({ id: d, label: d }))}
            onAdd={(admin) => {
              setProjectField('adminUsernames', union(project.adminUsernames, [admin]));
            }}
            onRemove={(d) => {
              setProjectField(
                'adminUsernames',
                project.adminUsernames.filter((domain) => domain !== d)
              );
            }}
          />
        </div>
      </div>

      <div className="p-6 flex items-center justify-end gap-x-6">
        <Button
          variant="contained"
          primary
          loading={upserting}
          disabled={uploadThumbnailLoading || upserting}
          onClick={async () => {
            await upsertProject();
            props.onClose();
          }}
        >
          Save
        </Button>
      </div>
    </FullScreenModal>
  );
}
