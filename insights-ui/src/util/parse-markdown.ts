import { recursivelyCleanOpenAiUrls } from '@/scripts/llm-utils';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';

const renderer = getMarkedRenderer();

export function parseMarkdown(text: string) {
  return marked.parse(recursivelyCleanOpenAiUrls(text), { renderer });
}
