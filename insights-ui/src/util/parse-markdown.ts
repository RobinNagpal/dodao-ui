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

// Section JSON occasionally lands with a missing or non-string leaf (LLM
// structured output isn't always strictly Zod-validated, partial Generate All
// runs leave gaps). Returning '' here keeps a single bad field from throwing
// out of a Server Component and tripping the production error boundary.
export function parseMarkdown(text: string | null | undefined) {
  if (typeof text !== 'string' || text.length === 0) return '';
  return marked.parse(escapeTildes(recursivelyCleanOpenAiUrls(text)), { renderer });
}
