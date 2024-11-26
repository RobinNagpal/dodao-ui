export function base64ToFile(base64String: string | undefined, filename: string): File | null {
  if (!base64String) {
    console.error('Invalid Base64 string');
    return null;
  }

  const arr = base64String.split(',');
  if (arr.length !== 2) {
    console.error('Invalid Base64 string format');
    return null;
  }

  const mimeTypeMatch = arr[0].match(/:(.*?);/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : '';

  const byteString = atob(arr[1]);
  const byteNumbers = new Uint8Array(byteString.length);

  for (let i = 0; i < byteString.length; i++) {
    byteNumbers[i] = byteString.charCodeAt(i);
  }

  return new File([byteNumbers], filename, { type: mimeType });
}

export function getFileName(url: string): string {
  const segments = url.split('/');
  return segments[segments.length - 1] + '_screenshot.png';
}

export function getScreenshotFromIframe(
  iframe: HTMLIFrameElement,
  message: {
    type: 'capturePageScreenshot' | 'captureElementScreenshot';
    selector?: string;
  }
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // Function to handle the message event
    const handleMessage = (event: MessageEvent) => {
      console.log('Received message:', event.data);
      if (event.data.type === 'pageScreenshotCaptured' || event.data.type === 'elementScreenshotCaptured') {
        resolve(event.data.dataURL);
        window.removeEventListener('message', handleMessage);
      }
    };
    console.log('Sending message:', message);

    window.addEventListener('message', handleMessage, false);

    // Post message to the iframe
    iframe.contentWindow && iframe.contentWindow.postMessage(message, '*');
  });
}
