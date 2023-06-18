// Replace with your actual uploadImageToS3 import
import LoadingSpinner from '@/components/core/loaders/LoadingSpinner';
import { CreateSignedUrlInput, useCreateSignedUrlMutation } from '@/graphql/generated/generated-types';
import { getUploadedImageUrlFromSingedUrl } from '@/utils/upload/getUploadedImageUrlFromSingedUrl';
import axios from 'axios';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';

interface Props {
  spaceId: string;
  objectId: string;
  imageType: string;
  onLoading?: (loading: boolean) => void;
  onInput?: (imageUrl: string) => void;
  children: React.ReactNode;
  className?: string;
}

const FileSelect = styled.label`
  input[type='file'] {
    display: none;
    font-weight: normal;
  }
  &:hover {
    cursor: pointer;
  }
`;

function ImageUploader({ spaceId, objectId, imageType, onLoading, onInput, children, className }: Props) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [createSignedUrlMutation] = useCreateSignedUrlMutation();

  async function uploadToS3AndReturnImgUrl(imageType: string, file: File, objectId: string) {
    const input: CreateSignedUrlInput = {
      imageType,
      contentType: file.type,
      objectId,
      name: file.name.replace(' ', '_').toLowerCase(),
    };

    const response = await createSignedUrlMutation({ variables: { spaceId, input } });

    const signedUrl = response?.data?.payload!;
    await axios.put(signedUrl, file, {
      headers: { 'Content-Type': file.type },
    });

    const imageUrl = getUploadedImageUrlFromSingedUrl(signedUrl);
    return imageUrl;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    onLoading && onLoading(true);
    const file = e.target.files![0];
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      console.log('File type not supported');
      setLoading(false);
      return;
    }

    try {
      const imageUrl = await uploadToS3AndReturnImgUrl(imageType, file, objectId.replace(/[^a-z0-9]/gi, '_'));

      onInput && onInput(imageUrl);
      setLoading(false);
      onLoading && onLoading(false);
    } catch (error) {
      setLoading(false);
      onLoading && onLoading(false);
      console.log(error);
    }
  };

  return (
    <div className={className}>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <FileSelect>
          <input type="file" ref={inputRef} onChange={handleFileChange} accept="image/jpg, image/jpeg, image/png" />
          {children}
        </FileSelect>
      )}
    </div>
  );
}

export default ImageUploader;
