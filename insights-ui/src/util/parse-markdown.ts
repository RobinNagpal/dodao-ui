import { recursivelyCleanOpenAiUrls } from '@/scripts/llm-utils';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';

// KaTeX is intentionally disabled across insights-ui. Report text is full of plain
// dollar amounts ("$24.60B revenue backlog ... $1.1B cash reserve"), and any
// registered `$...$` math extension turns the text between two amounts into italic
// MathML garbage. marked is a module-level singleton, so a math extension registered
// by ANY page in the app leaks into every other marked.parse call in the process —
// passing an empty extension here keeps getMarkedRenderer from registering one.
const renderer = getMarkedRenderer({});
// Some stored reports contain literal "\n" two-character sequences instead of real
// newlines (the string was JSON-escaped somewhere in an older generation/save path,
// e.g. NYSE/AMCR's summary). Markdown assigns no meaning to a literal backslash-n,
// so "\n\n" renders as visible text inside one paragraph instead of a paragraph
// break. Convert them to real newlines before parsing.
function unescapeLiteralNewlines(text: string): string {
  return text.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n');
}

// GFM treats ~text~ / ~~text~~ as strikethrough. Tildes show up in our content
// (math approximations like ~$5B, file paths, etc.) and shouldn't be struck
// through. Swap them for the numeric HTML entity before parsing so marked
// leaves them alone but the rendered output still shows a literal "~".
function escapeTildes(text: string): string {
  return text.replace(/~/g, '&#126;');
}

// Some LLM-generated reports label paragraphs inline with literal
// "Paragraph 1:", "Paragraph 2:", … but forget to insert real paragraph
// breaks between them. Marked then renders the whole thing as one giant <p>.
// Strip those labels and replace them with `\n\n` so we get distinct blocks.
function normalizeParagraphLabels(text: string): string {
  return text.replace(/^\s*Paragraph\s*\d+\s*:\s*/i, '').replace(/\s*Paragraph\s*\d+\s*:\s*/gi, '\n\n');
}

// The tariff renderers wrap every section in their own `<h2>` (or `<h3>`), so any markdown headings
// the LLM emits inside a body field break SEO hierarchy and — when written without proper blank
// lines around them — leak through as literal "### Heading" text instead of being parsed as a
// heading. Demote any `# … ###### ` heading lines to `**bold**` so the content keeps the visual
// emphasis without competing with the React-rendered section headings.
function demoteInlineHeadings(text: string): string {
  return text.replace(/^[ \t]{0,3}#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$/gm, '**$1**');
}

// Section JSON occasionally lands with a missing or non-string leaf (LLM
// structured output isn't always strictly Zod-validated, partial Generate All
// runs leave gaps). Returning '' here keeps a single bad field from throwing
// out of a Server Component and tripping the production error boundary.
export function parseMarkdown(text: string | null | undefined) {
  if (typeof text !== 'string' || text.length === 0) return '';
  return marked.parse(normalizeParagraphLabels(escapeTildes(unescapeLiteralNewlines(recursivelyCleanOpenAiUrls(text)))), { renderer });
}

// Tariff chapter body fields render under a React-controlled section heading,
// so any `#`/`##`/`###` the LLM slips into the body would duplicate the page
// hierarchy or leak as literal `### Heading` text. Use this variant for those
// fields only — other markdown consumers (ETF reports, etc.) need to keep
// inner headings intact.
export function parseChapterBodyMarkdown(text: string | null | undefined) {
  if (typeof text !== 'string' || text.length === 0) return '';
  return marked.parse(demoteInlineHeadings(normalizeParagraphLabels(escapeTildes(unescapeLiteralNewlines(recursivelyCleanOpenAiUrls(text))))), { renderer });
}
