/**
 * Supplies a valid Claude **subscription OAuth access token** to the Claude
 * callers (`callClaudeWithOAuth`, `getClaudeSubscriptionUsage`).
 *
 * Access tokens (`sk-ant-oat...`) are short-lived (~a few hours). Baking a static
 * one into the deployment means Claude stops working the moment it expires. This
 * provider instead holds the long-lived **refresh token** (`sk-ant-ort...`) and
 * exchanges it for a fresh access token on demand — the same thing the Claude
 * Code CLI does — so the server is self-sustaining.
 *
 * Token sources, in priority order (first one that yields a token wins):
 *   1. In-memory cached access token, if still valid (no network call).
 *   2. Refresh flow: exchange a refresh token at the OAuth token endpoint. The
 *      refresh token itself is resolved from (a) the in-memory rotated value,
 *      (b) the persisted S3 copy, then (c) the `ANTHROPIC_OAUTH_REFRESH_TOKEN`
 *      env var (the bootstrap value injected from Secrets Manager).
 *   3. Fallback: a static `ANTHROPIC_OAUTH_TOKEN` access token env var (local
 *      dev / tests / backward compatibility). Returned as-is, unmanaged.
 *
 * Refresh-token ROTATION: the token endpoint returns a NEW refresh token on each
 * exchange and invalidates the old one. We therefore persist the rotated token
 * to a PRIVATE S3 object so it survives container restarts/redeploys (the env
 * bootstrap is only good for the very first exchange after a fresh rotation
 * lineage). The bucket has no public bucket policy and we write with a private
 * ACL, so the credential is not anonymously readable.
 *
 * Single-node only (service_scale = 1): the in-memory cache is the coherence
 * point. If this is ever scaled out, move the cache to a shared store.
 */

import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

/** Public OAuth client id the Claude Code CLI uses; required on the token exchange. */
const CLAUDE_OAUTH_CLIENT_ID = '9d1c250a-e61b-44d9-88ed-5944d1962f5e';

/** Claude Code OAuth token endpoint. Overridable for tests via env. */
const TOKEN_ENDPOINT = process.env.ANTHROPIC_OAUTH_TOKEN_URL ?? 'https://console.anthropic.com/v1/oauth/token';

/** Refresh a bit BEFORE the real expiry so an in-flight request never races the cutover. */
const EXPIRY_SKEW_MS = 5 * 60 * 1000;

/** S3 location of the rotated refresh token (private object). */
const REFRESH_TOKEN_S3_BUCKET = process.env.S3_BUCKET_NAME || 'dodao-ai-insights-agent';
const REFRESH_TOKEN_S3_KEY = process.env.CLAUDE_OAUTH_REFRESH_S3_KEY || 'internal/claude-oauth/refresh-token.json';
const S3_REGION = process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1';

interface CachedAccessToken {
  token: string;
  /** Epoch ms after which the token must be re-fetched (already includes the skew). */
  expiresAtMs: number;
}

interface PersistedRefreshToken {
  refreshToken: string;
  updatedAt: string;
}

interface TokenEndpointResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

// ---- Module state (single-node coherence point) -----------------------------
let cachedAccessToken: CachedAccessToken | null = null;
/** Most recent refresh token this process has seen (after any rotation). */
let currentRefreshToken: string | null = null;
/** De-dupes concurrent refreshes so a burst of requests triggers a single exchange. */
let inFlightRefresh: Promise<string> | null = null;

let s3Client: S3Client | null = null;
function getS3Client(): S3Client | null {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) return null;
  if (!s3Client) {
    s3Client = new S3Client({ region: S3_REGION, credentials: { accessKeyId, secretAccessKey } });
  }
  return s3Client;
}

async function streamToString(stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}

/** Best-effort read of the persisted (rotated) refresh token from S3. Returns null if absent/unavailable. */
async function loadPersistedRefreshToken(): Promise<string | null> {
  const client = getS3Client();
  if (!client) return null;
  try {
    const res = await client.send(new GetObjectCommand({ Bucket: REFRESH_TOKEN_S3_BUCKET, Key: REFRESH_TOKEN_S3_KEY }));
    const body = await streamToString(res.Body as Readable);
    const parsed = JSON.parse(body) as PersistedRefreshToken;
    return parsed.refreshToken?.trim() || null;
  } catch (err: unknown) {
    const name = (err as { name?: string })?.name;
    if (name !== 'NoSuchKey' && name !== 'NotFound') {
      console.warn('[claude-token-provider] could not read persisted refresh token from S3:', name ?? err);
    }
    return null;
  }
}

/** Best-effort write of the rotated refresh token to a PRIVATE S3 object so it survives restarts. */
async function persistRefreshToken(refreshToken: string): Promise<void> {
  const client = getS3Client();
  if (!client) {
    console.warn('[claude-token-provider] no AWS creds; rotated refresh token kept in memory only (will not survive a restart).');
    return;
  }
  try {
    const payload: PersistedRefreshToken = { refreshToken, updatedAt: new Date().toISOString() };
    await client.send(
      new PutObjectCommand({
        Bucket: REFRESH_TOKEN_S3_BUCKET,
        Key: REFRESH_TOKEN_S3_KEY,
        Body: JSON.stringify(payload),
        ContentType: 'application/json',
        // Explicitly private + encrypted — this is a credential, never public-read.
        ACL: 'private',
        ServerSideEncryption: 'AES256',
      })
    );
  } catch (err) {
    // Non-fatal: the token still works in-memory for this process's lifetime.
    console.error('[claude-token-provider] failed to persist rotated refresh token to S3:', err);
  }
}

/** Resolves the refresh token to use: in-memory rotated value → persisted S3 copy → env bootstrap. */
async function resolveRefreshToken(): Promise<string | null> {
  if (currentRefreshToken) return currentRefreshToken;

  const persisted = await loadPersistedRefreshToken();
  if (persisted) {
    currentRefreshToken = persisted;
    return persisted;
  }

  const envToken = process.env.ANTHROPIC_OAUTH_REFRESH_TOKEN?.trim();
  if (envToken) {
    currentRefreshToken = envToken;
    return envToken;
  }

  return null;
}

/** Exchanges the refresh token for a fresh access token, caches it, and persists any rotation. */
async function refreshAccessToken(refreshToken: string): Promise<string> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLAUDE_OAUTH_CLIENT_ID,
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Claude OAuth token refresh failed: ${response.status} ${response.statusText}: ${text}`);
  }

  const json = JSON.parse(text) as TokenEndpointResponse;
  const accessToken = json.access_token?.trim();
  if (!accessToken) {
    throw new Error('Claude OAuth token refresh returned no access_token.');
  }

  const expiresInMs = (json.expires_in ?? 3600) * 1000;
  cachedAccessToken = { token: accessToken, expiresAtMs: Date.now() + expiresInMs - EXPIRY_SKEW_MS };

  // Rotation: if a new refresh token came back, adopt and persist it. The old one is now invalid.
  const rotated = json.refresh_token?.trim();
  if (rotated && rotated !== refreshToken) {
    currentRefreshToken = rotated;
    await persistRefreshToken(rotated);
  }

  return accessToken;
}

/**
 * Returns a valid Claude access token, refreshing (and rotating) as needed.
 *
 * @param forceRefresh Skip the in-memory cache and force a new exchange — used to
 *   recover from a 401 where the cached token was rejected mid-flight.
 */
export async function getClaudeAccessToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedAccessToken && cachedAccessToken.expiresAtMs > Date.now()) {
    return cachedAccessToken.token;
  }

  const refreshToken = await resolveRefreshToken();

  if (!refreshToken) {
    // No refresh token anywhere — fall back to a static access token (local dev / tests).
    const staticToken = process.env.ANTHROPIC_OAUTH_TOKEN?.trim();
    if (staticToken) return staticToken;
    throw new Error(
      'No Claude OAuth credentials found. Set ANTHROPIC_OAUTH_REFRESH_TOKEN (preferred, self-refreshing) ' + 'or a static ANTHROPIC_OAUTH_TOKEN access token.'
    );
  }

  if (forceRefresh) {
    cachedAccessToken = null;
  }

  // Collapse concurrent refreshes into one exchange.
  if (!inFlightRefresh) {
    inFlightRefresh = refreshAccessToken(refreshToken).finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
}

/** Clears the cached access token so the next call re-exchanges. Call this on a 401. */
export function invalidateClaudeAccessToken(): void {
  cachedAccessToken = null;
}
