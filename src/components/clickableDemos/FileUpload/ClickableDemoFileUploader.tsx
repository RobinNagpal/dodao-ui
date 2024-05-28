// Replace with your actual uploadImageToS3 import
import LoadingSpinner from '@/components/core/loaders/LoadingSpinner';
import { CreateSignedUrlInput, ImageType, useCreateSignedUrlMutation } from '@/graphql/generated/generated-types';
import { getUploadedImageUrlFromSingedUrl } from '@/utils/upload/getUploadedImageUrlFromSingedUrl';
import axios from 'axios';
import React, { useRef, useState } from 'react';
import styles from './ClickableDemoFileUploader.module.scss';

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

export default function ClickableDemoFileUploader({ spaceId, objectId, imageType, onLoading, onInput, children, className, allowedFileTypes }: Props) {
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

  function injectScriptLinkTags(htmlContent: string): string {
    // Regular expression for matching the closing head tag
    const closingHeadRegex = /<style>/i;

    // Find the position to insert the tags (after the opening head tag)
    const headEndTagIndex = closingHeadRegex.exec(htmlContent)?.index;

    if (headEndTagIndex) {
      // Construct the script and link tags

      const linkTag2 = `<link rel="stylesheet" href="https://unpkg.com/tippy.js@6/animations/shift-toward.css" />`;
      const linkTag3 = `<link rel="stylesheet" href="https://unpkg.com/tippy.js@6/themes/material.css" />`;
      const scriptTag1 = `<script src="https://unpkg.com/@popperjs/core@2"></script>`;
      const scriptTag2 = `<script src="https://unpkg.com/tippy.js@6"></script>`;
      const linkTagCustom = `<link rel="stylesheet" href="https://raw.githubusercontent.com/RobinNagpal/dodao-ui/main/src/components/clickableDemos/clickableDemoTooltipStyles.css">`;
      const scriptTagCustom = `<script src="https://raw.githubusercontent.com/RobinNagpal/dodao-ui/main/src/components/clickableDemos/clickableDemoTooltipStyles.js"></script>`;

      // Insert the tags after the opening head tag
      const modifiedHtml = [
        htmlContent.slice(0, headEndTagIndex),

        linkTag2,
        linkTag3,
        linkTagCustom,
        scriptTag1,
        scriptTag2,
        scriptTagCustom,
        htmlContent.slice(headEndTagIndex),
      ].join('');

      return modifiedHtml;
    } else {
      console.warn('Unable to find closing head tag in HTML content');
      return htmlContent; // Return unmodified content if head tag not found
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    onLoading && onLoading(true);
    const file = e.target.files![0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      const htmlContent = e.target!.result as string; // Cast the result to string

      // // Manipulate the HTML
      const modifiedHtml = injectScriptLinkTags(htmlContent);

      const blob = new Blob([modifiedHtml], { type: 'text/html' });
      const editedFile = new File([blob], file.name, { type: 'text/html' });

      if (!allowedFileTypes.includes(editedFile.type)) {
        console.log('File type not supported');
        setLoading(false);
        return;
      }

      try {
        const imageUrl = await uploadToS3AndReturnImgUrl(imageType, editedFile, objectId.replace(/[^a-z0-9]/gi, '_'));

        onInput && onInput(imageUrl);
        setLoading(false);
        onLoading && onLoading(false);
      } catch (error) {
        setLoading(false);
        onLoading && onLoading(false);
        console.log(error);
      }
    };

    reader.readAsText(file); // Read the file content as text
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
