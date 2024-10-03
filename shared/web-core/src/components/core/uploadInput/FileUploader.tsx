// Replace with your actual uploadImageToS3 import
import LoadingSpinner from '@dodao/web-core/components/core/loaders/LoadingSpinner';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';

interface Props {
  onLoading?: (loading: boolean) => void;
  onInput?: (imageUrl: string) => void;
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

export default function FileUploader({ onLoading, children, className, allowedFileTypes, uploadFile }: Props) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      await uploadFile(file);

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
        <div className="pl-4">
          <LoadingSpinner />
        </div>
      ) : (
        <FileSelect>
          <input type="file" ref={inputRef} onChange={handleFileChange} accept={allowedFileTypes.join(', ')} />
          {children}
        </FileSelect>
      )}
    </div>
  );
}
