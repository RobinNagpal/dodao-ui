export interface GoogleDriveUrlInfo {
  id: string;
  type: 'document' | 'file' | 'presentation' | 'spreadsheets';
  url: string;
}

export const parseGoogleDriveViewUrl = (src: string): GoogleDriveUrlInfo | null => {
  const r =
    /(?:https?:\/\/)?(?:drive|docs)\.google\.com\/(?:a\/[^/]+\/)?(file|document|presentation|spreadsheets)\/d\/([^/]+)(?:\/(?:view|edit|preview))?[^ "'<>]*/i.exec(
      src
    );
  if (r) {
    const type = r[1];
    const id = r[2];
    if (type === 'document' || type === 'file' || type === 'presentation' || type === 'spreadsheets') {
      const url = new URL([type, 'd', id, 'preview'].join('/'), `https://${type === 'file' ? 'drive' : 'docs'}.google.com/`);
      return { id, type, url: url.toString() };
    }
  }

  // Google seems to have added a sort of "short code" link that doesn't include the type
  // of file/document and just does a 301 redirect to the actual document when you open it
  // However, when testing I have found that if we treat docs/sheets/presentations as a "file"
  // google will redirect to the appropriate docs URL anyway.
  const redirectMatch = /(?:https?:\/\/)?(?:drive|docs)\.google\.com\/open\?id=([^ "'<>&]+)/i.exec(src);
  if (redirectMatch) {
    const id = redirectMatch[1];
    const url = new URL(['file', 'd', id, 'preview'].join('/'), `https://drive.google.com/`);

    return { id, type: 'file', url: url.toString() };
  }

  return null;
};

export default parseGoogleDriveViewUrl;
