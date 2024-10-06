import getProtocol from "./getProtocol";

export default function getBaseUrl() {
  const nextHost = process.env.NEXT_PUBLIC_VERCEL_URL;

  const nextEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;

  if (nextEnv === 'production' || nextEnv === 'preview') {
    if (typeof window !== 'undefined') {
      return ''; // We don't want the same host since we use cookies for session management
    } else {
      return nextHost ? `https://${nextHost}` : '';
    }
  }

  // If the host includes localhost, we use http, otherwise we use https
  const protocol = getProtocol();

  const baseUrl = nextHost ? `${protocol}://${nextHost}` : '';
  return baseUrl;
}
