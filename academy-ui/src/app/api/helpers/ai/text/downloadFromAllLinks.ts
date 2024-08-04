import { getTokenCount } from '@/app/api/helpers/ai/getTokenCount';
import { cleanupContent } from '@/app/api/helpers/ai/text/cleanupContent';
// import getContentsUsingPuppeteer from '@/app/api/helpers/ai/text/getContentsUsingPuppeteer';
// import { getImportantContentUsingCheerio } from '@/app/api/helpers/ai/text/getImportantContentUsingCheerio';

import { formatAxiosError } from '@//app/api/helpers/adapters/formatAxiosError';

export interface LinkInfo {
  link: string;
  downloadStatus: 'success' | 'failed';
  tokenCount: number;
}
export interface DownloadFromAllLinksResponse {
  content: string;
  links: LinkInfo[];
}
export default async function downloadFromAllLinks(content: string): Promise<DownloadFromAllLinksResponse> {
  const withoutUrls = extractStringContentWithoutUrls(content);
  const urls = extractUrls(content);
  const contents = [];
  const links: LinkInfo[] = [];
  for (const url of urls) {
    let importantContent = '';
    const linkInfo: LinkInfo = { link: url, downloadStatus: 'success', tokenCount: 0 };
    try {
      try {
        // importantContent = await getImportantContentUsingCheerio(url, { timeout: 10000 });
      } catch (e) {
        const formattedAxiosError = formatAxiosError(e);
        console.log('Error while getting content from url', url, formattedAxiosError);
      }
      if ((importantContent?.length || 0) < 2000) {
        console.log('Cheerio failed, trying puppeteer :', url);
        // importantContent = await getContentsUsingPuppeteer(url);
      }
    } catch (e) {
      console.log('Error while getting content from url', url, e);
      linkInfo.downloadStatus = 'failed';
    }
    linkInfo.tokenCount = getTokenCount(importantContent);
    links.push(linkInfo);
    contents.push(importantContent);
  }
  const combinedContent = [withoutUrls, ...contents].join('\n');
  const cleanedContent = getTokenCount(combinedContent) > 4000 ? cleanupContent(combinedContent) : combinedContent;
  return { content: cleanedContent, links };
}
export function extractStringContentWithoutUrls(content: string): string {
  // Regex to match URLs
  const urlPattern = /https?:\/\/[^\s]+/g;

  // Replacing URLs with an empty string
  return content.replace(urlPattern, '').trim();
}

export function extractUrls(content: string): string[] {
  const urlPattern = /https?:\/\/[^\s]+/g;
  const matches: RegExpMatchArray | null = content.match(urlPattern);
  return matches ? matches.map((m) => m.trim()) : [];
}
