import UploadInput from '@/components/app/UploadInput';
import UpsertBadgeInput from '@/components/core/badge/UpsertBadgeInput';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import FullPageModal from '@/components/core/modals/FullPageModal';
import StyledSelect from '@/components/core/select/StyledSelect';
import { Project } from '@/graphql/generated/generated-types';
import { ProjectTypes } from '@/types/deprecated/models/enums';
import { slugify } from '@/utils/auth/slugify';
import { projectTypeSelect } from '@/utils/ui/statuses';
import union from 'lodash/union';
import React, { useEffect, useState } from 'react';
import useEditProject from './useEditProject';
import UpsertKeyValueBadgeInput from '@/components/core/badge/UpsertKeyValueBadgeInput';

export default function UpsertProjectModal(props: { spaceId: string; project?: Project; open: boolean; onClose: () => void }) {
  const editProjectHelper = useEditProject(props.project?.id);
  const [uploadLogoThumbnailLoading, setUploadLogoThumbnailLoading] = useState(false);
  const [uploadCardThumbnailLoading, setUploadCardThumbnailLoading] = useState(false);

  const { project, setProjectField, upsertProject, upserting } = editProjectHelper;

  function inputError(avatar: string) {
    return null;
  }

  useEffect(() => {
    editProjectHelper.initialize();
  }, [project?.id]);

  return (
    <FullPageModal open={props.open} onClose={props.onClose} title="Basic Project Settings">
      <div className="project-y-12 text-left p-6">
        <div className="border-b pb-12">
          <h2 className="text-base font-semibold leading-7">Edit Project</h2>
          <p className="mt-1 text-sm leading-6">Update the details of Project</p>

          <Input label="Id" modelValue={project?.id} onUpdate={(value) => setProjectField('id', value?.toString() || '')} />
          <Input label="Name" modelValue={project?.name} onUpdate={(value) => setProjectField('name', value?.toString() || '')} />
          <UploadInput
            label="Logo"
            error={inputError('logo')}
            imageType="AcademyLogo"
            spaceId={project?.id || 'new-project'}
            modelValue={project?.logo}
            objectId={(project?.name && slugify(project?.name)) || project?.id || 'new-project'}
            onInput={(value) => setProjectField('logo', value)}
            onLoading={setUploadLogoThumbnailLoading}
          />
          <UploadInput
            label="Thumbnail"
            error={inputError('cardThumbnail')}
            imageType="CryptoGelatoProjectThumbnail"
            spaceId={props.spaceId}
            modelValue={project?.cardThumbnail}
            objectId={(project?.name && slugify(project?.name)) || project?.id || 'new-project'}
            onInput={(value) => setProjectField('cardThumbnail', value)}
            onLoading={setUploadCardThumbnailLoading}
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

          <UpsertKeyValueBadgeInput
            label={'Admins By Usernames & Names'}
            badges={project.adminUsernamesV1.map((d) => ({ key: d.username, value: d.nameOfTheUser }))}
            onAdd={(admin) => {
              const string = admin.split(',');
              const username = string[0].trim();
              const nameOfTheUser = string.length > 1 ? string[1].trim() : '';
              const newAdmin = { username, nameOfTheUser };
              setProjectField('adminUsernamesV1', union(project.adminUsernamesV1, [newAdmin]));
            }}
            labelFn={(badge) => `${badge.key} - ${badge.value}`}
            onRemove={(d) => {
              setProjectField(
                'adminUsernamesV1',
                project.adminUsernamesV1.filter((domain) => domain.username !== d)
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
          disabled={uploadLogoThumbnailLoading || uploadCardThumbnailLoading || upserting}
          onClick={async () => {
            await upsertProject();
            props.onClose();
          }}
        >
          Save
        </Button>
      </div>
    </FullPageModal>
  );
}
