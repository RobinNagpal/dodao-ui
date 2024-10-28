import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { XMarkIcon } from '@heroicons/react/20/solid';
import PhotoIcon from '@heroicons/react/24/solid/PhotoIcon';
import React from 'react';
import styles from './InputUploadSection.module.scss';

interface ImageUploadSectionProps {
  label?: string;
  modelValue?: string | null;
  imageType: string;
  objectId: string;
  spaceId: string;
  placeholder?: string;
  allowedFileTypes?: string[];
  error?: any;
  helpText?: string;
  loading: boolean;
  uploadToS3AndReturnImgUrl: (file: File) => Promise<void>;
  clearSelectedImage: () => void;
}

export default function ImageUploadSection({
  label,
  modelValue,
  imageType,
  objectId,
  spaceId,
  allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp', 'text/html'],
  error,
  helpText,
  loading,
  uploadToS3AndReturnImgUrl,
  clearSelectedImage,
}: ImageUploadSectionProps) {
  const inputId = spaceId + '-' + slugify(label || imageType || objectId);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!allowedFileTypes.includes(file.type)) {
        console.log('File type not supported');
        return;
      }
      await uploadToS3AndReturnImgUrl(file);
      e.dataTransfer.clearData();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];
    if (!allowedFileTypes.includes(file.type)) {
      console.log('File type not supported');
      return;
    }
    await uploadToS3AndReturnImgUrl(file);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            if (!allowedFileTypes.includes(blob.type)) {
              console.log('File type not supported');
              return;
            }
            await uploadToS3AndReturnImgUrl(blob);
          }
        }
      }
    }
  };

  return (
    <div className={`my-4  ${styles.uploadWrapper}`}>
      <div
        className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onPaste={handlePaste}
      >
        {modelValue ? (
          <div className="relative w-full flex justify-center items-center">
            <div className="relative max-h-4/5 max-w-4/5">
              <img src={modelValue} alt="Uploaded file" className="w-full h-full object-cover" />

              <div className="absolute top-0 right-0 m-2">
                <button
                  type="button"
                  className="inline-flex items-center p-2 rounded-md bg-gray-500 hover:bg-gray-600 text-white"
                  onClick={() => {
                    clearSelectedImage();
                  }}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-8 w-8" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <PhotoIcon aria-hidden="true" className="mx-auto h-12 w-12 text-gray-300" />
            {loading ? (
              <p className="mt-2 text-sm text-gray-600">Uploading...</p>
            ) : (
              <>
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <label
                    htmlFor={inputId}
                    className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none
                      focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input id={inputId} name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept={allowedFileTypes.join(', ')} />
                  </label>
                  <p className="pl-1">or drag and drop or paste from clipboard</p>
                </div>
                <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
              </>
            )}
          </div>
        )}
      </div>
      {helpText && <p className="ml-1 mt-2 mb-2 text-sm">{helpText}</p>}
      {typeof error === 'string' && <p className="mt-2 text-sm text-left text-red-600">{error}</p>}
    </div>
  );
}
