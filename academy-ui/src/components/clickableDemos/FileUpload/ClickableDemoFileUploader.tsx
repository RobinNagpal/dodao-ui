import LoadingSpinner from '@dodao/web-core/components/core/loaders/LoadingSpinner';
import { CreateSignedUrlInput, ImageType } from '@/graphql/generated/generated-types';
import { getUploadedImageUrlFromSingedUrl } from '@dodao/web-core/utils/upload/getUploadedImageUrlFromSingedUrl';
import axios from 'axios';
import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import styles from './ClickableDemoFileUploader.module.scss';

interface Props {
  spaceId: string;
  objectId: string;
  imageType: ImageType;
  onLoading?: (loading: boolean) => void;
  onInput: (url: string, captureUrl: string) => void;
  children: React.ReactNode;
  className?: string;
  allowedFileTypes: string[];
}

export default function ClickableDemoFileUploader({ spaceId, objectId, imageType, onLoading, onInput, children, className, allowedFileTypes }: Props) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  async function uploadToS3AndReturnImgUrl(imageType: string, file: File, objectId: string) {
    const input: CreateSignedUrlInput = {
      imageType,
      contentType: file.type,
      objectId,
      name: file.name.replace(' ', '_').toLowerCase(),
    };

    const response = await axios.post('/api/s3-signed-urls', { spaceId, input });

    const signedUrl = response?.data?.url!;
    await axios.put(signedUrl, file, {
      headers: { 'Content-Type': file.type },
    });

    const imageUrl = getUploadedImageUrlFromSingedUrl(signedUrl);
    return imageUrl;
  }

  async function uploadScreenshotToS3AndReturnImgUrl(file: File, objectId: string) {
    const input: CreateSignedUrlInput = {
      imageType: 'ClickableDemos/SCREENSHOT_CAPTURE', // Change as necessary
      contentType: file.type,
      objectId,
      name: file.name.replace(' ', '_').toLowerCase(),
    };

    const response = await axios.post('/api/s3-signed-urls', { spaceId, input });

    const signedUrl = response?.data?.url!;
    await axios.put(signedUrl, file, {
      headers: { 'Content-Type': file.type },
    });

    const screenshotUrl = getUploadedImageUrlFromSingedUrl(signedUrl);
    return screenshotUrl;
  }

  function injectScriptLinkTags(htmlContent: string): string {
    // Regular expression for matching the opening style tag
    const closingHeadRegex = /<style>/i;

    // Find the position to insert the tags (before the opening style tag)
    const headEndTagIndex = closingHeadRegex.exec(htmlContent)?.index;

    if (headEndTagIndex) {
      // Construct the script and link tags with a timestamp
      const timestamp = new Date().getTime();
      const linkTag2 = `<link rel="stylesheet" href="https://unpkg.com/tippy.js@6/animations/shift-toward.css" />`;
      const linkTag3 = `<link rel="stylesheet" href="https://unpkg.com/tippy.js@6/themes/material.css" />`;
      const scriptTag1 = `<script src="https://unpkg.com/@popperjs/core@2"></script>`;
      const scriptTag2 = `<script src="https://unpkg.com/tippy.js@6"></script>`;
      const html2CanvasScript = ` <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>`;
      const customLinkTag = `<link rel="stylesheet" href="https://dodao-prod-public-assets.s3.amazonaws.com/clickable-demos-prod-files/clickableDemoTooltipStyles.css" />`;
      const customScriptTag = `<script src="https://dodao-prod-public-assets.s3.amazonaws.com/clickable-demos-prod-files/clickableDemoTooltipScript.js"></script>`;
      const scriptTagCustom = `<script>
      console.log("Injecting event listener for clickable demo tooltip");
      window.addEventListener("message", (event) => {
        console.log("Received message from parent", event.data);
        if (typeof window.handleDoDAOParentWindowEvent === "function") {
          window.handleDoDAOParentWindowEvent(event);
        } else {
          console.error("handleDoDAOParentWindowEvent is not defined");
        }
      });
      
      if ("serviceWorker" in navigator) {
          navigator.serviceWorker.register("/clickable-demos-prod-files/clickableDemoServiceWorker.js")
          .then(registration => {
              console.log("Service Worker registered with scope:", registration.scope);
      
              // After registration, send URLs to cache to the Service Worker
              window.addEventListener("load", () => {
                  const urlsToCache = Array.from(document.querySelectorAll("link[rel=\'stylesheet\'], script[src]"))
                      .map(tag => tag.href || tag.src);
      
                  const filteredUrls = urlsToCache.filter(url => !url.includes("dodao-prod-public-assets"));
                  
                  console.log("Sending URLs to cache to Service Worker:", filteredUrls);
                  if (navigator.serviceWorker.controller) {
                      navigator.serviceWorker.controller.postMessage({ type: "CACHE_URLS", payload: filteredUrls });
                  }
              });
          }).catch(error => {
              console.log("Service Worker registration failed:", error);
          });
      }
    </script>`;

      // Insert the tags before the opening style tag
      const modifiedHtml = [
        htmlContent.slice(0, headEndTagIndex),
        linkTag2,
        linkTag3,
        scriptTag1,
        scriptTag2,
        customLinkTag,
        customScriptTag,
        scriptTagCustom,
        html2CanvasScript,
        htmlContent.slice(headEndTagIndex),
      ].join('');

      return modifiedHtml;
    } else {
      console.warn('Unable to find opening style tag in HTML content');
      return htmlContent; // Return unmodified content if the style tag is not found
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

      const iframe = iframeRef.current;
      if (iframe) {
        iframe.onload = async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust the timeout as necessary

          const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDocument) {
            const canvas = await html2canvas(iframeDocument.documentElement, {
              useCORS: true,
              width: 1920,
              height: 1080,
            });

            if (canvas.width > 0 && canvas.height > 0) {
              canvas.toBlob(async (blob) => {
                if (blob) {
                  const screenshotFile = new File([blob], `${file.name}_screenshot.png`, { type: 'image/png' });
                  const screenshotUrl = await uploadScreenshotToS3AndReturnImgUrl(screenshotFile, objectId.replace(/[^a-z0-9]/gi, '_'));

                  const imageUrl = await uploadToS3AndReturnImgUrl(imageType, editedFile, objectId.replace(/[^a-z0-9]/gi, '_'));
                  onInput && onInput(imageUrl, screenshotUrl);
                  setLoading(false);
                  onLoading && onLoading(false);
                } else {
                  console.error('Blob generation failed');
                  setLoading(false);
                  onLoading && onLoading(false);
                }
              });
            } else {
              console.error('Canvas has zero width or height');
              setLoading(false);
              onLoading && onLoading(false);
            }
          } else {
            console.error('Failed to get iframe document');
            setLoading(false);
            onLoading && onLoading(false);
          }
        };

        iframe.src = URL.createObjectURL(editedFile);
        iframe.style.display = 'block'; // Ensure iframe is displayed before capturing
      } else {
        setLoading(false);
        onLoading && onLoading(false);
        console.error('Iframe not found');
      }
    };

    reader.readAsText(file);
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
      <iframe
        ref={iframeRef}
        style={{
          width: '1920px',
          height: '1080px',
          border: 'none',
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
        }}
      />
    </div>
  );
}
