// Replace with your actual uploadImageToS3 import
import LoadingSpinner from '@dodao/web-core/components/core/loaders/LoadingSpinner';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';

interface Props {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  allowedFileTypes: string[];
  uploadFile: (file: File) => Promise<void>;
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

export default function FileUploader({ loading, children, className, allowedFileTypes, uploadFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];
    if (!allowedFileTypes.includes(file.type)) {
      console.log('File type not supported');
      return;
    }

    await uploadFile(file);
  };

  return (
    <div className={className}>
      {loading ? (
        <div className="pl-4">
          <LoadingSpinner />
        </div>
      ) : (
        <FileSelect>
          <div>
            <input type="file" ref={inputRef} onChange={handleFileChange} accept={allowedFileTypes.join(', ')} />
            {children}
          </div>
        </FileSelect>
      )}
    </div>
  );
}
