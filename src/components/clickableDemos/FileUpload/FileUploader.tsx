// Replace with your actual uploadImageToS3 import
import LoadingSpinner from '@/components/core/loaders/LoadingSpinner';
import { CreateSignedUrlInput, ImageType, useCreateSignedUrlMutation } from '@/graphql/generated/generated-types';
import { getUploadedImageUrlFromSingedUrl } from '@/utils/upload/getUploadedImageUrlFromSingedUrl';
import axios from 'axios';
import React, { useRef, useState } from 'react';
import styles from './FileUploader.module.scss';

interface Props {
  spaceId: string;
  objectId: string;
  imageType: ImageType;
  onLoading?: (loading: boolean) => void;
  onInput?: (imageUrl: string) => void;
  children: React.ReactNode;
  className?: string;
  allowedFileTypes: string[];
}

export default function FileUploader({ spaceId, objectId, imageType, onLoading, onInput, children, className, allowedFileTypes }: Props) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [createSignedUrlMutation] = useCreateSignedUrlMutation();

  async function uploadToS3AndReturnFileUrl(imageType: string, file: File, objectId: string) {
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

    if (!allowedFileTypes.includes(file.type)) {
      console.log('File type not supported');
      setLoading(false);
      return;
    }

    try {
      const fileUrl = await uploadToS3AndReturnFileUrl(imageType, file, objectId.replace(/[^a-z0-9]/gi, '_'));

      onInput && onInput(fileUrl);
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
        <label className={styles.file_select}>
          <input type="file" ref={inputRef} onChange={handleFileChange} accept={allowedFileTypes.join(', ')} />
          {children}
        </label>
      )}
    </div>
  );
}
