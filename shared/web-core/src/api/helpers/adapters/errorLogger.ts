import { DiscordPostResult, postToDiscordWebhook } from '@dodao/web-core/api/helpers/adapters/discordWebhook';
import { capLogText, MAX_LOGGED_INPUT_CHARS } from '@dodao/web-core/api/helpers/adapters/capLogText';
import { NextRequest } from 'next/server';

const staticPageGenerationError = 'rendered statically ';

// Transient client-side fetch failures (e.g. NextAuth polling /api/auth/session
// while the tab is backgrounded, offline, or navigating away). These are benign
// network blips, so we still console-log them but skip the Discord webhook to
// avoid alert noise.
const transientClientFetchErrors = ['CLIENT_FETCH_ERROR', 'Load failed', 'Failed to fetch', 'NetworkError when attempting to fetch resource'];

export function isTransientClientFetchError(value: string): boolean {
  return transientClientFetchErrors.some((pattern) => value.includes(pattern));
}

const MAX_LOGGED_MESSAGE_CHARS = 1500; // the message is often a composed summary of already-capped parts
const MAX_LOGGED_DETAILS_CHARS = 1000;
const MAX_LOGGED_STACK_CHARS = 4000;

/** Stack without the leading `Name: message` header (the message is already on the line), capped. */
function formatStack(e: Error): string {
  let stack = e.stack || '';
  const header = `${e.name || 'Error'}: ${e.message}`;
  if (e.message && stack.startsWith(header)) {
    stack = stack.slice(header.length).replace(/^\n/, '');
  } else if (e.message && e.message.length > MAX_LOGGED_INPUT_CHARS) {
    stack = stack.split(e.message).join(capLogText(e.message));
  }
  return capLogText(stack, MAX_LOGGED_STACK_CHARS);
}

function formatLogErrorLine(message: string, params: Record<string, any>, e: Error | null, spaceId: string | null, blockchain: string | null): string {
  // Message, params and error text can carry request input (scanner payloads), so each is capped. The line is never dropped.
  const text = capLogText(typeof message === 'string' ? message : safeStringify(message), MAX_LOGGED_MESSAGE_CHARS);
  const parts = [`[errorLogger] ${text}`];
  if (e instanceof Error) {
    // Avoid repeating the error message when it is already part of the log message (callers may have capped it).
    const errMessage = e.message ? capLogText(e.message) : '';
    if (errMessage && !text.includes(errMessage) && !text.includes(e.message)) parts.push(`error=${e.name || 'Error'}: ${errMessage}`);
    // `cause` (e.g. undici's "fetch failed" → ECONNREFUSED) and own props (Prisma `code`/`meta`) carry the real reason.
    const details = errorDetails(e);
    if (details) parts.push(`details=${capLogText(details, MAX_LOGGED_DETAILS_CHARS)}`);
  } else if (e) {
    parts.push(`error=${capLogText(safeStringify(e))}`);
  }
  if (spaceId) parts.push(`spaceId=${capLogText(spaceId)}`);
  if (blockchain) parts.push(`blockchain=${capLogText(blockchain)}`);
  if (params && Object.keys(params).length > 0) parts.push(`params=${capLogText(safeStringify(params))}`);
  let line = parts.join(' | ');
  if (e instanceof Error && e.stack) {
    const stack = formatStack(e);
    if (stack) line += `\n${stack}`;
  }
  return line;
}

function errorDetails(e: Error): string | null {
  const details: Record<string, unknown> = {};
  for (const key of Object.keys(e)) {
    if (key !== 'stack' && key !== 'message') details[key] = (e as unknown as Record<string, unknown>)[key];
  }
  const cause = (e as { cause?: unknown }).cause;
  if (cause !== undefined) {
    details.cause = cause instanceof Error ? { name: cause.name, message: cause.message, ...(cause as unknown as Record<string, unknown>) } : cause;
  }
  return Object.keys(details).length > 0 ? safeStringify(details) : null;
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

export async function logError(
  message: string,
  params: Record<string, any> = {},
  e: Error | null = null,
  spaceId: string | null = null,
  blockchain: string | null = null
) {
  // Always log the error to console (one concise line), even if it's going to be ignored for Discord
  console.error(formatLogErrorLine(message, params, e, spaceId, blockchain));

  // Only skip posting to Discord if the error should be ignored
  if (shouldIgnoreError(e || message)) {
    console.log('[errorLogger] Error ignored for Discord posting due to shouldIgnoreError check');
    return;
  }

  console.log('[errorLogger] Posting error to Discord');
  const result = await postErrorOnDiscord(e, spaceId, blockchain, message, params);
  if (result === 'posted') console.log('[errorLogger] Error posted to Discord successfully');
}

export async function logErrorRequest(e: Error | string | null, req: NextRequest) {
  if (!e) {
    console.log('[errorLogger] logErrorRequest called with null error, returning');
    return;
  }

  // Always log the error to console (one line). Headers are intentionally not logged (they carry cookies/tokens).
  // URL and message can carry request input, so both are capped (the line is never dropped).
  const errorText = typeof e === 'string' ? capLogText(e) : `${e.name || 'Error'}: ${capLogText(e.message ?? '')}`;
  const stack = typeof e === 'object' && e.stack ? `\n${formatStack(e)}` : '';
  console.error(`[errorLogger] Request error: ${req.method} ${capLogText(req.url)} | ${errorText}${stack}`);

  // Skip posting to Discord if the error should be ignored
  if (shouldIgnoreError(e)) {
    console.log('[errorLogger] Error ignored for Discord posting due to shouldIgnoreError check');
    return;
  }

  const embeds = [
    {
      title: 'Request Info',
      fields: [
        {
          name: 'Url',
          value: req.url || '----',
          inline: true,
        },
        {
          name: 'Method',
          value: req.method || '----',
          inline: true,
        },
      ],
    },
  ];
  const data = {
    content: `Got an error for ${req.url}`,
    embeds,
  };

  console.log('[errorLogger] Posting request error to Discord');
  // Fire-and-forget (as before). postToDiscordWebhook never throws, truncates to Discord limits and honours 429 pauses.
  void postToDiscordWebhook(process.env.SERVER_ERRORS_WEBHOOK, data);
}

function shouldIgnoreError(e: Error | string) {
  console.log('[errorLogger] shouldIgnoreError checking error:', {
    type: typeof e,
    value: typeof e === 'string' ? e.substring(0, 100) : (e as Error).message?.substring(0, 100),
  });

  if (typeof e === 'string' && e.includes(staticPageGenerationError)) {
    console.log('[errorLogger] Ignoring error: string contains staticPageGenerationError');
    return true;
  }

  if (typeof e === 'string' && isTransientClientFetchError(e)) {
    console.log('[errorLogger] Ignoring error: transient client fetch error');
    return true;
  }

  const error = e as Error;

  if (error?.message?.includes(staticPageGenerationError)) {
    console.log('[errorLogger] Ignoring error: error.message contains staticPageGenerationError');
    return true;
  }

  if (error?.message && isTransientClientFetchError(error.message)) {
    console.log('[errorLogger] Ignoring error: transient client fetch error');
    return true;
  }

  if (error?.stack?.includes(staticPageGenerationError)) {
    console.log('[errorLogger] Ignoring error: error.stack contains staticPageGenerationError');
    return true;
  }

  console.log('[errorLogger] Error will not be ignored');
  return false;
}

async function postErrorOnDiscord(
  e: Error | null,
  spaceId: string | null,
  blockchain: string | null,
  message: string,
  params: Record<string, any> = {}
): Promise<DiscordPostResult> {
  console.log('[errorLogger] postErrorOnDiscord called with:', {
    errorName: e?.name,
    errorMessage: e?.message?.substring(0, 100),
    spaceId,
    blockchain,
    messagePreview: message?.substring(0, 100) + (message?.length > 100 ? '...' : ''),
  });

  console.log('[errorLogger] Preparing Discord embed data');
  const embeds = [
    {
      title: 'Request Info',
      fields: [
        {
          name: 'SpaceId',
          value: spaceId || '----',
          inline: true,
        },
        {
          name: 'Blockchain',
          value: blockchain || '----',
          inline: true,
        },
        {
          name: 'Message',
          value: message || '----',
          inline: false,
        },
        {
          name: 'Params',
          value: JSON.stringify(params || {}),
          inline: false,
        },
      ],
    },
  ];

  if (e) {
    console.log('[errorLogger] Adding error stack to Discord embed');
    embeds.push({
      title: 'Error',
      fields: [
        {
          name: 'Name',
          value: e.name || '----',
          inline: true,
        },
        {
          name: 'Message',
          value: e.message || '----',
          inline: true,
        },
        {
          name: 'Stack',
          value: e.stack || '----',
          inline: false,
        },
      ],
    });
  } else {
    console.log('[errorLogger] No error object provided, skipping error stack in Discord embed');
  }

  const data = {
    content: `Got an error on ${spaceId || 'unknown space'}`,
    embeds,
  };

  // Field values are truncated to Discord's limits inside postToDiscordWebhook (the full error is already in the console/Loki line).
  // On a 429 Discord delivery is paused for `retry_after` and skipped alerts are counted, never thrown or logged one-by-one.
  return postToDiscordWebhook(process.env.SERVER_ERRORS_WEBHOOK, data);
}
