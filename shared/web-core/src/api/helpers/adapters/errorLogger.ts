import { formatAxiosError } from '@dodao/web-core/api/helpers/adapters/formatAxiosError';
import axios from 'axios';
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

function formatLogErrorLine(message: string, params: Record<string, any>, e: Error | null, spaceId: string | null, blockchain: string | null): string {
  const text = typeof message === 'string' ? message : safeStringify(message);
  const parts = [`[errorLogger] ${text}`];
  if (e) {
    // Avoid repeating the error message when it is already part of the log message.
    if (e.message && !text.includes(e.message)) parts.push(`error=${e.name || 'Error'}: ${e.message}`);
  }
  if (spaceId) parts.push(`spaceId=${spaceId}`);
  if (blockchain) parts.push(`blockchain=${blockchain}`);
  if (params && Object.keys(params).length > 0) parts.push(`params=${safeStringify(params)}`);
  let line = parts.join(' | ');
  if (e?.stack) line += `\n${e.stack}`;
  return line;
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
  await postErrorOnDiscord(e, spaceId, blockchain, message, params);
  console.log('[errorLogger] Error posted to Discord successfully');
}

export async function logErrorRequest(e: Error | string | null, req: NextRequest) {
  if (!e) {
    console.log('[errorLogger] logErrorRequest called with null error, returning');
    return;
  }

  console.log('[errorLogger] logErrorRequest called with:', {
    errorType: typeof e,
    errorName: typeof e === 'object' ? (e as Error).name : 'N/A',
    errorMessage: typeof e === 'object' ? (e as Error).message : e,
    requestUrl: req.url,
    requestMethod: req.method,
  });

  // Always log the error to console
  console.error('[errorLogger] Request error:', e);
  console.error('[errorLogger] Request URL:', req.url);
  console.error('[errorLogger] Request method:', req.method);
  console.error('[errorLogger] Request headers:', Object.fromEntries([...req.headers.entries()]));

  // Skip posting to Discord if the error should be ignored
  if (shouldIgnoreError(e)) {
    console.log('[errorLogger] Error ignored for Discord posting due to shouldIgnoreError check');
    return;
  }

  console.log('[errorLogger] Preparing request data for Discord');
  let jsonBody = '';
  try {
    jsonBody = JSON.stringify(req.json());
    console.log('[errorLogger] Successfully parsed request body');
  } catch (parseError) {
    console.log('[errorLogger] Failed to parse request body:', parseError);
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
        {
          name: 'JSON',
          value: jsonBody.substring(0, 1000) || '(empty or unparseable body)',
          inline: false,
        },
      ],
    },
  ];
  const data = {
    content: `Got an error for ${req.url}`,
    embeds,
  };

  console.log('[errorLogger] Posting request error to Discord');
  axios.post(process.env.SERVER_ERRORS_WEBHOOK!, data).catch((err) => {
    console.error('[errorLogger] Failed to post to Discord webhook:', formatAxiosError(err));
    console.log('[errorLogger] Discord embed data:', JSON.stringify(embeds, null, 2));
  });
  console.log('[errorLogger] Request error posted to Discord successfully');
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

async function postErrorOnDiscord(e: Error | null, spaceId: string | null, blockchain: string | null, message: string, params: Record<string, any> = {}) {
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
          value: (message || '----').substr(0, 1000),
          inline: false,
        },
        {
          name: 'Params',
          value: JSON.stringify(params || {}).substr(0, 1000),
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
          value: (e.stack || '----').substr(0, 1000),
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

  console.log('[errorLogger] Sending data to Discord webhook');
  try {
    await axios.post(process.env.SERVER_ERRORS_WEBHOOK!, data);
    console.log('[errorLogger] Successfully posted to Discord webhook');
  } catch (err) {
    console.error('[errorLogger] Failed to post to Discord webhook:', formatAxiosError(err as any));
    console.log('[errorLogger] Discord embed data that failed to send:', JSON.stringify(embeds, null, 2));
  }
}
