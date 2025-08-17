import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';

const renderer = getMarkedRenderer();

export function parseMarkdown(text: string): string {
  return marked.parse(text, { renderer });
}
