'use client';

import GenerateFromDalleModal from '@/components/app/Image/GenerateFromDalleModal';
import UploadFromUnsplashModal from '@/components/app/Image/UploadFromUnsplashModal';
import FullPageModal from '@/components/core/modals/FullPageModal';
import ArrowUpTrayIcon from '@heroicons/react/24/solid/ArrowUpTrayIcon';
import PhotoIcon from '@heroicons/react/24/solid/PhotoIcon';

import React from 'react';
import UploadImageFromDeviceModal from './UploadImageFromDeviceModal';
import styled from 'styled-components';

const UploadWrapper = styled.div`
  background-color: var(--bg-color);
  color: var(--text-color);
`;

interface UploadInputProps {
  imageType: string;
  objectId: string;
  spaceId: string;
  open: boolean;
  onClose: () => void;
  imageUploaded: (url: string) => void;
  generateImagePromptFn?: () => string;
}

type ImageModalSelectionType = 'upload-from-device' | 'upload-from-unsplash' | 'upload-from-dalle';

export default function SelectImageInputModal({ imageType, objectId, spaceId, open, onClose, imageUploaded, generateImagePromptFn }: UploadInputProps) {
  const [imageUploadModalType, setImageUploadModalType] = React.useState<ImageModalSelectionType | null>(null);

  if (imageUploadModalType === 'upload-from-unsplash') {
    return <UploadFromUnsplashModal open={open} onClose={onClose} onInput={imageUploaded} />;
  }

  if (imageUploadModalType === 'upload-from-device') {
    return (
      <UploadImageFromDeviceModal open={open} onClose={onClose} imageType={imageType} objectId={objectId} spaceId={spaceId} imageUploaded={imageUploaded} />
    );
  }

  if (imageUploadModalType === 'upload-from-dalle' && generateImagePromptFn) {
    return <GenerateFromDalleModal open={open} onClose={onClose} generateImagePromptFn={generateImagePromptFn} onInput={imageUploaded} />;
  }

  return (
    <FullPageModal open={open} onClose={onClose} title={'Upload Image'}>
      <UploadWrapper className="mt-2">
        <div className="flex flex-col justify-center sm:flex-row mt-2 rounded-md shadow-sm">
          <div
            className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer ml-2"
            onClick={() => setImageUploadModalType('upload-from-device')}
          >
            <ArrowUpTrayIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            <span className="mx-2">Upload from Device</span>
          </div>
          <div
            className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer ml-2"
            onClick={() => setImageUploadModalType('upload-from-unsplash')}
          >
            <PhotoIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            <span className="mx-2">Upload from Unsplash</span>
          </div>
          <div
            className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer ml-2"
            onClick={() => setImageUploadModalType('upload-from-dalle')}
          >
            <PhotoIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            <span className="mx-2">Generate using DALL·E</span>
          </div>
        </div>
      </UploadWrapper>
    </FullPageModal>
  );
}