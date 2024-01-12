'use client';

import UploadInput from '@/components/app/UploadInput';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import PageWrapper from '@/components/core/page/PageWrapper';
import StyledSelect from '@/components/core/select/StyledSelect';
import { Space } from '@/graphql/generated/generated-types';
import { slugify } from '@/utils/auth/slugify';
import { themeSelect } from '@/utils/ui/statuses';
import React, { useState } from 'react';
import { CssTheme } from '../themes';

function NewSpaceSignUp(props: { space?: Space }) {
  function inputError(avatar: string) {
    return null;
  }
  return (
    <PageWrapper>
      <div className="space-y-12 text-left p-6">
        <div>
          <h1 className="text-base font-semibold leading-7">Create New Space</h1>
          <p className="mt-1 text-sm leading-6">You can create your new Space here</p>
          <Input className="mt-4" label="Id" />
          <Input label="Name" />
          <Input
            label="Academy Repo"
            modelValue={props.space?.spaceIntegrations?.academyRepository}
            placeholder={'https://github.com/DoDAO-io/dodao-academy'}
          />
          <UploadInput
            label="Logo"
            error={inputError('avatar')}
            imageType="AcademyLogo"
            spaceId={props.space?.id || 'new-space'}
            modelValue={props.space?.avatar}
            objectId={(props.space?.name && slugify(props.space?.name)) || props.space?.id || 'new-space'}
            onInput={() => {}}
          />
          <StyledSelect
            label="Theme"
            items={themeSelect}
            selectedItemId={Object.keys(CssTheme).includes(props.space?.skin || '') ? props.space?.skin : CssTheme.GlobalTheme}
            setSelectedItemId={() => {}}
          />
        </div>
        <div className="flex items-center justify-start gap-x-6">
          <Button variant="contained" primary>
            Save
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}

export default NewSpaceSignUp;
