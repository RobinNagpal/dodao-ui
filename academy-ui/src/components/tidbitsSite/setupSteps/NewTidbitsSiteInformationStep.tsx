'use client';

import { PredefinedSpaces } from '@/chatbot/utils/app/constants';
import UploadInput from '@/components/app/UploadInput';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import LoadingSpinner from '@dodao/web-core/components/core/loaders/LoadingSpinner';
import useCreateNewTidbitSpace from '@/components/tidbitsSite/setupSteps/useCreateNewTidbitSpace';
import { ImageType } from '@/graphql/generated/generated-types';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';

interface NewSiteInformationProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

export default function NewTidbitsSiteInformationStep({ goToNextStep, goToPreviousStep }: NewSiteInformationProps) {
  const { tidbitSpace, setSpaceField, createNewTidbitSpace, upserting, existingSpace, loading, updateTidbitSpace } = useCreateNewTidbitSpace();

  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false);

  const handleNextButtonClick = async () => {
    if (existingSpace) {
      await updateTidbitSpace({
        successCallback: () => {
          goToNextStep();
        },
      });
    } else {
      await createNewTidbitSpace({
        successCallback: () => {
          goToNextStep();
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="sm:px-0 px-4">
      <div className="space-y-12 text-left mt-8">
        <div className="pb-12">
          <h2 className="text-lg font-bold leading-7">Create Tidbits Site</h2>
          <p className="mt-1 text-sm leading-6">Add the details of Tidbits Site</p>
          <Input
            label="Name"
            id={'name'}
            modelValue={tidbitSpace.name}
            onUpdate={(value) => {
              setSpaceField('name', value?.toString() || '');
            }}
          />

          <Input
            label="Id"
            id={'id'}
            modelValue={tidbitSpace.id}
            disabled={true}
            onUpdate={() => {
              // do nothing
            }}
          />
          <UploadInput
            label="Logo"
            imageType={ImageType.Space}
            spaceId={PredefinedSpaces.TIDBITS_HUB}
            modelValue={tidbitSpace.avatar}
            objectId={'new-space'}
            onInput={(value) => setSpaceField('avatar', value)}
            onLoading={setUploadThumbnailLoading}
          />
        </div>
      </div>

      <div className="flex items-center justify-start gap-x-4">
        <Button onClick={goToPreviousStep} variant="outlined">
          <span className="font-bold mr-1">&#8592;</span>
          Previous
        </Button>

        <Button
          variant="contained"
          primary
          removeBorder={true}
          disabled={upserting || uploadThumbnailLoading || isEmpty(tidbitSpace.name) || isEmpty(tidbitSpace.avatar)}
          onClick={handleNextButtonClick}
          loading={upserting || uploadThumbnailLoading}
        >
          Next
          <span className="ml-2 font-bold">&#8594;</span>
        </Button>
      </div>
    </div>
  );
}
