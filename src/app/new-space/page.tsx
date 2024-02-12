'use client';

import UploadInput from '@/components/app/UploadInput';
import Input from '@/components/core/input/Input';
import PageWrapper from '@/components/core/page/PageWrapper';
import StyledSelect from '@/components/core/select/StyledSelect';
import { CssTheme } from '../themes';
import { themeSelect } from '@/utils/ui/statuses';
import UpsertBadgeInput from '@/components/core/badge/UpsertBadgeInput';
import UpsertKeyValueBadgeInput from '@/components/core/badge/UpsertKeyValueBadgeInput';

export default function SpaceInformation() {
  return (
    <PageWrapper>
      <div className="space-y-12 text-left p-6">
        <div className="border-b pb-12">
          <h2 className="text-base font-semibold leading-7">Edit Space</h2>
          <p className="mt-1 text-sm leading-6">Update the details of Space</p>

          <Input label="Id" />
          <Input label="Name" />
          <UploadInput
            label="Logo"
            // error={inputError('avatar')}
            imageType="AcademyLogo"
            spaceId={'new-space'}
            // modelValue={space?.avatar}
            objectId={'new-space'}
            onInput={(value) => {}}
            // onLoading={setUploadThumbnailLoading}
          />
          <Input
            label="Academy Repo"
            // modelValue={space?.spaceIntegrations?.academyRepository}
            placeholder={'https://github.com/DoDAO-io/dodao-academy'}
            // onUpdate={(value) => setSpaceIntegrationField('academyRepository', value?.toString() || '')}
          />
          <StyledSelect label="Theme" selectedItemId={CssTheme.GlobalTheme} items={themeSelect} setSelectedItemId={() => {}} />
          <UpsertBadgeInput label={'Domains'} badges={[]} onAdd={(d) => {}} onRemove={(d) => {}} />
          <UpsertBadgeInput label={'Bot Domains'} badges={[]} onAdd={(d) => {}} onRemove={(d) => {}} />
          <UpsertBadgeInput label={'Admins By Usernames'} badges={[]} onAdd={(admin) => {}} onRemove={(d) => {}} />
          <UpsertKeyValueBadgeInput
            label={'Admins By Usernames & Names'}
            badges={[]}
            onAdd={(admin) => {
              const string = admin.split(',');
              const username = string[0].trim();
              const nameOfTheUser = string.length > 1 ? string[1].trim() : '';
              const newAdmin = { username, nameOfTheUser };
              //   setSpaceField('adminUsernamesV1', union(space.adminUsernamesV1, [newAdmin]));
            }}
            labelFn={(badge) => `${badge.key} - ${badge.value}`}
            onRemove={(d) => {
              //   setSpaceField(
              //     'adminUsernamesV1',
              //     space.adminUsernamesV1.filter((domain) => domain.username !== d)
              //   );
            }}
          />
        </div>
      </div>
    </PageWrapper>
  );
}
