'use client';

import dynamic from 'next/dynamic';

import React from 'react';
import FileUploader from '@/components/app/FileUploader';
import ArrowUpTrayIcon from '@heroicons/react/24/solid/ArrowUpTrayIcon';
import PhotoIcon from '@heroicons/react/24/solid/PhotoIcon';
import styled from 'styled-components';
import { v4 as uuidV4 } from 'uuid';
import FullPageModal from '../core/modals/FullPageModal';

import Button from '../core/buttons/Button';
import GenerateImage from '../spaces/Image/GenerateImage';

const UnsplashReact: React.ComponentType<any> = dynamic(() => import('unsplash-react'), {
  ssr: false, // Disable server-side rendering for this component
});

const InsertIntoApplicationUploader = dynamic(() => import('unsplash-react').then((mod) => ({ default: mod.InsertIntoApplicationUploader })));

const UploadWrapper = styled.div`
  background-color: var(--bg-color);
  color: var(--text-color);
`;

const StyledInput = styled.input`
  background-color: var(--bg-color);
  border-color: var(--primary-color) !important;
  color: var(--text-color);
  &:focus {
    box-shadow: 0 0 0 2px var(--primary-color) !important;
  }
`;

interface UploadInputProps {
  label?: string;
  modelValue?: string | null;
  imageType: string;
  objectId: string;
  spaceId: string;
  onInput: (url: string) => void;
  onLoading?: (value: ((prevState: boolean) => boolean) | boolean) => void;
  placeholder?: string;
  allowedFileTypes?: string[];
  error?: any;
  helpText?: string;
  imageUploaded?: (url: string) => void;
}

export default function UploadInput({
  label,
  modelValue,
  imageType,
  objectId,
  spaceId,
  onInput,
  onLoading,
  placeholder = 'e.g. https://example.com/guide.png',
  allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/svg+xml'],
  error,
  helpText,
  imageUploaded,
}: UploadInputProps) {
  const inputId = uuidV4();
  const [uploadFromUnsplash, setUploadFromUnsplash] = React.useState(false);
  const [unsplashImage, setUnsplashImage] = React.useState<boolean>(false);
  const [generateFromDALLE, setGenerateFromDALLE] = React.useState(false);

  function handleFinishedUploading(imageUrl: string): void {
    onInput(imageUrl);
    setUnsplashImage(true);
  }

  return (
    <UploadWrapper className="mt-2">
      <label htmlFor={inputId} className="block text-sm font-medium leading-6">
        {label || 'Image URL'}
      </label>
      <div className="flex flex-col sm:flex-row mt-2 rounded-md shadow-sm">
        <div className="relative flex flex-grow items-stretch focus-within:z-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <PhotoIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <StyledInput
            id={inputId}
            className="block w-full rounded-none rounded-l-md border-0 py-1.5 pl-10 ring-1 ring-inset placeholder:text-gray-400 ring-gray-400 shadow-sm focus:ring-2 focus:ring-inset  sm:text-sm sm:leading-6"
            placeholder={placeholder}
            aria-invalid="true"
            aria-describedby="email-error"
            value={modelValue || ''}
            onChange={(e) => onInput(e.target.value)}
          />
        </div>
        <FileUploader
          className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 ml-2"
          spaceId={spaceId}
          onInput={onInput}
          imageType={imageType}
          objectId={objectId}
          onLoading={onLoading}
          allowedFileTypes={allowedFileTypes}
        >
          <div className="flex">
            <ArrowUpTrayIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            <span className="mx-2">Upload from Device</span>
          </div>
        </FileUploader>
        <div
          className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer ml-2"
          onClick={() => setUploadFromUnsplash(true)}
        >
          <PhotoIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
          <span className="mx-2">Upload from Unsplash</span>
        </div>
        <div
          className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer ml-2"
          onClick={() => setGenerateFromDALLE(true)}
        >
          <PhotoIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
          <span className="mx-2">Generate using DALL·E</span>
        </div>
      </div>
      {helpText && <p className="ml-1 mt-2 mb-2 text-sm">{helpText}</p>}
      {typeof error === 'string' && <p className="mt-2 text-sm text-left text-red-600">{error}</p>}
      {uploadFromUnsplash && (
        <FullPageModal open={uploadFromUnsplash} onClose={() => setUploadFromUnsplash(false)} title={'Upload Image from Unsplash'}>
          <div className="h-[80vh] p-4">
            <div className="flex justify-end">
              <Button
                disabled={!unsplashImage}
                variant="contained"
                primary
                onClick={() => {
                  setUploadFromUnsplash(false);
                  setUnsplashImage(false);
                  imageUploaded!(modelValue as string);
                }}
                className="mr-4 mt-2"
              >
                Done
              </Button>
            </div>
            <UnsplashReact
              accessKey={process.env.NEXT_PUBLIC_UNSPLASH_API_KEY as string}
              Uploader={InsertIntoApplicationUploader}
              onFinishedUploading={handleFinishedUploading}
            />
          </div>
        </FullPageModal>
      )}
      {generateFromDALLE && (
        <FullPageModal open={generateFromDALLE} onClose={() => setGenerateFromDALLE(false)} title={'Generate Image using DALL·E'}>
          <div className="h-[80vh] p-4 overflow-y-scroll">
            <GenerateImage imageUploaded={imageUploaded} />
          </div>
        </FullPageModal>
      )}
    </UploadWrapper>
  );
}
