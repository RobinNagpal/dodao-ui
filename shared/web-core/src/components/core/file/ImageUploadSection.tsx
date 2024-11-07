import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/20/solid';
import PhotoIcon from '@heroicons/react/24/solid/PhotoIcon';
import React, { useState } from 'react';
import styles from './InputUploadSection.module.scss';
import FullScreenModal from '../modals/FullScreenModal';

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
  allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp', 'text/html', 'image/gif'],
  error,
  helpText,
  loading,
  uploadToS3AndReturnImgUrl,
  clearSelectedImage,
}: ImageUploadSectionProps) {
  const inputId = spaceId + '-' + slugify(label || imageType || objectId);
  const [showFullScreenModal, setShowFullScreenModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

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
    clearSelectedImage();
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
    <div className={`my-4 ${styles.uploadWrapper}`}>
      <div
        className="mt-2 flex justify-center rounded-lg border border-dashed border-color px-6 py-10"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onPaste={handlePaste}
      >
        {modelValue ? (
          <div className="relative w-full flex justify-center items-center">
            <div className="relative max-h-4/5 max-w-4/5 group">
              <img
                src={modelValue}
                alt="Uploaded file"
                title="Click image to view full screen"
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => setShowFullScreenModal(true)}
                onLoad={() => setImageLoaded(true)}
              />
              {imageLoaded && (
                <div className={`absolute -top-5 -right-3 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <div className="flex justify-center items-center gap-3">
                    <label htmlFor={inputId} className={`relative cursor-pointer rounded-full p-2 ${styles.buttonColorToggle}`}>
                      <PencilSquareIcon title="Change Image" className="h-8 w-8" />
                      <input id={inputId} name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept={allowedFileTypes.join(', ')} />
                    </label>
                    <button
                      type="button"
                      title="Remove Image"
                      className={`inline-flex items-center p-2 rounded-full ${styles.buttonColorToggle}`}
                      onClick={() => {
                        clearSelectedImage();
                        setImageLoaded(false);
                      }}
                    >
                      <span className="sr-only">Remove Image</span>
                      <TrashIcon className="h-8 w-8" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <PhotoIcon aria-hidden="true" className="mx-auto h-12 w-12" />
            {loading ? (
              <p className="mt-2 text-sm">Uploading...</p>
            ) : (
              <>
                <div className="mt-4 flex text-md leading-6">
                  <label htmlFor={inputId} className={`relative cursor-pointer rounded-md font-semibold ${styles.buttonColorToggle}`}>
                    <span className="px-2">Upload a file</span>
                    <input id={inputId} name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept={allowedFileTypes.join(', ')} />
                  </label>
                  <p className="pl-1 font-semibold">or drag and drop or paste from clipboard</p>
                </div>
                <p className="text-xs leading-5 mt-2">PNG, JPEG, JPG, SVG, WEBP, HTML, GIF up to 10MB</p>
              </>
            )}
          </div>
        )}
      </div>
      {helpText && <p className="ml-1 mt-2 mb-2 text-sm">{helpText}</p>}
      {typeof error === 'string' && <p className="mt-2 text-sm text-left text-red-600">{error}</p>}
      {showFullScreenModal && modelValue && (
        <FullScreenModal open={true} onClose={() => setShowFullScreenModal(false)} title={''} showTitleBg={false}>
          <img src={modelValue} alt="Uploaded file" className="w-full h-[90vh] px-5 object-contain" />
        </FullScreenModal>
      )}
    </div>
  );
}
