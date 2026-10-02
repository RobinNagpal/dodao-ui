# Crawler blocking (insights-ui)

**Why:** the AWS deployment is a single Lightsail node. Every uncached `/stocks/*` or `/etfs/*`
page fans out into ~10 internal API calls and may scrape stockanalysis.com, so one aggressive
crawler sweeping long-tail tickers can pin the Node process's CPU. `/api/health` then misses
Lightsail's 5 s health-check timeout, the container is marked unhealthy, and **every** request
(search included) gets an instant 502 until it recovers. This happened on 2026-10-01 (CPU
7–15% → 54% avg / 91% max; 205 distinct tickers rendered in ~2 min).

**What we do (zero-cost — no WAF):**

| Layer | File | Effect |
| --- | --- | --- |
| robots.txt | `src/app/robots.ts` | `Disallow: /` for every bot in the list; polite bots stop. |
| Middleware | `src/middleware.ts` | 403 (`Cache-Control: no-store`) for matching User-Agents that ignore robots.txt. Skips `_next/static`, `_next/image`, `favicon.ico`, `robots.txt`. |
| List | `src/utils/blocked-crawlers.ts` | Single source of truth for both. |

Blocked: SEO/backlink tools (Ahrefs, Semrush, MJ12, DotBot, …) and AI-training/bulk scrapers
(GPTBot, ClaudeBot, CCBot, Bytespider, Amazonbot, Meta-ExternalAgent, …).
**Not** blocked: search engines (Googlebot, Bingbot, …) and AI search/user-fetch agents
(OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot, Claude-User).

CloudFront forwards the viewer User-Agent (AllViewer origin request policy) but does not key the
cache on it, which is why the 403 is `no-store`. Pages already in CloudFront's cache are still
served to blocked bots — that's fine, it costs the origin nothing.

## Diagnosing an overload

1. `curl -w '%{http_code} %{time_total}\n' -o /dev/null https://prod.koalagains.com/api/health`
   — 502s, or 200s that take >5 s, mean the container is saturated.
2. Lightsail CPU metric (`GetContainerServiceMetricData`, `CPUUtilization`): ~50% avg on the
   2-vCPU node = one core pinned.
3. Container log (`aws lightsail get-container-log --service-name insights-ui --container-name app`):
   many distinct `params: { exchange, ticker }` in a short window = a crawl.
4. To name the bot, use CloudFront access logs (see
   [cloudfront-error-caching.md](cloudfront-error-caching.md)) and add its UA token to the list.
