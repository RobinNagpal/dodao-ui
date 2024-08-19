'use client';

import GenerateFromDalleModal from '@/components/app/Image/GenerateFromDalleModal';
import UploadFromUnsplashModal from '@/components/app/Image/UploadFromUnsplashModal';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { ImageSource, ImageType } from '@/graphql/generated/generated-types';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ArrowUpTrayIcon from '@heroicons/react/24/solid/ArrowUpTrayIcon';
import PhotoIcon from '@heroicons/react/24/solid/PhotoIcon';

import React from 'react';
import styled from 'styled-components';
import styles from './SelectImageInputModal.module.scss';
import UploadImageFromDeviceModal from './UploadImageFromDeviceModal';
import axios from 'axios';

const UploadWrapper = styled.div`
  background-color: var(--bg-color);
  color: var(--text-color);
`;

interface UploadInputProps {
  imageType: ImageType;
  objectId: string;
  spaceId: string;
  open: boolean;
  onClose: () => void;
  imageUploaded: (url: string) => void;
  generateImagePromptFn?: () => string;
}

enum ImageModalSelectionType {
  UploadFromDevice = 'upload-from-device',
  UploadFromUnsplash = 'upload-from-unsplash',
  UploadFromDalle = 'upload-from-dalle',
}

export default function SelectImageInputModal({ imageType, objectId, spaceId, open, onClose, imageUploaded, generateImagePromptFn }: UploadInputProps) {
  const [imageUploadModalType, setImageUploadModalType] = React.useState<ImageModalSelectionType | null>(null);

  if (imageUploadModalType === ImageModalSelectionType.UploadFromUnsplash) {
    return (
      <UploadFromUnsplashModal
        open={imageUploadModalType === ImageModalSelectionType.UploadFromUnsplash}
        onClose={onClose}
        onInput={async (imageUrl) => {
          const payload = await axios.post(`${getBaseUrl()}/api/s3-files`, {
            spaceId,
            input: { imageUrl, imageType, objectId, name: imageUrl.split('/').pop()!, imageSource: ImageSource.Unsplash },
          });
          imageUploaded(payload?.data?.imageUrl || 'empty');
        }}
      />
    );
  }

  if (imageUploadModalType === ImageModalSelectionType.UploadFromDevice) {
    return (
      <UploadImageFromDeviceModal
        open={imageUploadModalType === ImageModalSelectionType.UploadFromDevice}
        onClose={onClose}
        imageType={imageType}
        objectId={objectId}
        spaceId={spaceId}
        imageUploaded={imageUploaded}
      />
    );
  }

  return (
    <div>
      {/* The reason we include it here is because an extra call was */}
      <GenerateFromDalleModal
        open={imageUploadModalType === ImageModalSelectionType.UploadFromDalle}
        onClose={onClose}
        generateImagePromptFn={generateImagePromptFn!}
        onInput={async (imageUrl) => {
          const payload = await axios.post('/api/s3-files', {
            spaceId,
            input: { imageUrl, imageType, objectId, name: imageUrl.split('/').pop()!, imageSource: ImageSource.Dalle },
          });
          // const s3Url = await uploadToS3AndReturnImgUrl(imageUrl);
          imageUploaded(payload?.data?.imageUrl || 'empty');
          // const s3Url = await uploadToS3AndReturnImgUrl(imageUrl);
          imageUploaded(payload?.data?.imageUrl || 'empty');
        }}
      />
      <FullPageModal open={!imageUploadModalType && open} onClose={onClose} title={'Upload Image'}>
        <UploadWrapper className="mt-2">
          <div className="flex flex-col justify-center sm:flex-row mt-2 rounded-md shadow-sm">
            <div
              className={
                'relative inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer ml-2 ' +
                styles.styledHover
              }
              onClick={() => setImageUploadModalType(ImageModalSelectionType.UploadFromDevice)}
            >
              <ArrowUpTrayIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              <span className="mx-2">Upload from Device</span>
            </div>
            <div
              className={
                'relative inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 cursor-pointer ml-2 ' +
                styles.styledHover
              }
              onClick={() => setImageUploadModalType(ImageModalSelectionType.UploadFromUnsplash)}
            >
              <PhotoIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              <span className="mx-2">Upload from Unsplash</span>
            </div>
            <div
              className={
                'relative inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 cursor-pointer ml-2 ' +
                styles.styledHover
              }
              onClick={() => setImageUploadModalType(ImageModalSelectionType.UploadFromDalle)}
            >
              <PhotoIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              <span className="mx-2">Generate using DALL·E</span>
            </div>
          </div>
        </UploadWrapper>
      </FullPageModal>
    </div>
  );
}
