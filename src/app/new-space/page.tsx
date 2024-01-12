'use client';

import UploadInput from '@/components/app/UploadInput';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import PageWrapper from '@/components/core/page/PageWrapper';
import StyledSelect from '@/components/core/select/StyledSelect';
import React, { useState } from 'react';

function NewSpaceSignUp() {
  function inputError(avatar: string) {
    return null;
  }

  return (
    <PageWrapper>
      <div className="space-y-12 text-left p-6">
        <div>
          <h1 className="text-base font-semibold leading-7">Basic Login Credentials</h1>
          <p className="mt-1 text-sm leading-6">Please provide login data to proceed!</p>
          <Input className="mt-4" label="Id" />
          <Input label="Name" />
          <Input label="Academy Repo" />
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
