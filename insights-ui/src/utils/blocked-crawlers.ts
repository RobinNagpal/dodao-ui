/**
 * Crawlers that are denied site-wide. Shared by `app/robots.ts` (polite bots honour it) and
 * `middleware.ts` (403 for bots that ignore robots.txt).
 *
 * Every uncached stock/ETF page fans out into ~10 internal API calls and may scrape
 * the upstream fundamentals site, so a single aggressive crawler can pin the single-node server's CPU and
 * fail Lightsail health checks (site-wide 502s). These bots bring no search traffic, so
 * blocking them is free.
 *
 * Deliberately NOT blocked: search engines (Googlebot, Bingbot, DuckDuckBot, Applebot,
 * YandexBot) and AI *search / user-fetch* agents (OAI-SearchBot, ChatGPT-User,
 * PerplexityBot, Claude-SearchBot, Claude-User) — those drive visitors and citations.
 */
export const BLOCKED_CRAWLER_USER_AGENTS: readonly string[] = [
  // SEO / backlink tools
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',
  'DotBot',
  'BLEXBot',
  'DataForSeoBot',
  'serpstatbot',
  'Barkrowler',
  'MegaIndex',
  'PetalBot',
  'SeekportBot',
  // AI training / bulk scrapers
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'CCBot',
  'Bytespider',
  'Amazonbot',
  'Meta-ExternalAgent',
  'cohere-ai',
  'Diffbot',
  'ImagesiftBot',
  'Timpibot',
  'omgili',
];

/**
 * robots.txt-only opt-out tokens. These never appear in a request's User-Agent (Google and
 * Apple crawl with their normal bots), so they only make sense in robots.txt.
 */
export const ROBOTS_ONLY_OPT_OUT_TOKENS: readonly string[] = ['Google-Extended', 'Applebot-Extended'];

const BLOCKED_UA_PATTERN = new RegExp(BLOCKED_CRAWLER_USER_AGENTS.join('|'), 'i');

export function isBlockedCrawler(userAgent: string | null): boolean {
  return !!userAgent && BLOCKED_UA_PATTERN.test(userAgent);
}
