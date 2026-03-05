import getProtocol from './getProtocol';

export default function getBaseUrl() {
  const nextHost = process.env.NEXT_PUBLIC_VERCEL_URL;

  // NEXT_PUBLIC_VERCEL_ENV requires manual configuration in Vercel project settings.
  // VERCEL_ENV is automatically set by Vercel for every deployment but is only available server-side.
  const nextEnv = process.env.NEXT_PUBLIC_VERCEL_ENV || (typeof window === 'undefined' ? process.env.VERCEL_ENV : undefined);

  if (nextEnv === 'production' || nextEnv === 'preview') {
    if (typeof window !== 'undefined') {
      return ''; // We don't want the same host since we use cookies for session management
    } else {
      // VERCEL_URL is automatically set by Vercel for every deployment (server-side only).
      // NEXT_PUBLIC_VERCEL_URL requires manual configuration but is available on both client and server.
      const host = nextHost || process.env.VERCEL_URL;
      return host ? `https://${host}` : '';
    }
  }

  // If the host includes localhost, we use http, otherwise we use https
  const protocol = getProtocol();

  const baseUrl = nextHost ? `${protocol}://${nextHost}` : '';
  return baseUrl;
}
