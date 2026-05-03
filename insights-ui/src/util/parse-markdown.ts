import { recursivelyCleanOpenAiUrls } from '@/scripts/llm-utils';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';

const renderer = getMarkedRenderer();

// GFM treats ~text~ / ~~text~~ as strikethrough. Tildes show up in our content
// (math approximations like ~$5B, file paths, etc.) and shouldn't be struck
// through. Swap them for the numeric HTML entity before parsing so marked
// leaves them alone but the rendered output still shows a literal "~".
function escapeTildes(text: string): string {
  return text.replace(/~/g, '&#126;');
}

export function parseMarkdown(text: string) {
  return marked.parse(escapeTildes(recursivelyCleanOpenAiUrls(text)), { renderer });
}
