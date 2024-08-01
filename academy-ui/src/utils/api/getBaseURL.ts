export default function getBaseUrl() {
  const nextHost = process.env.NEXT_PUBLIC_VERCEL_URL;
  const protocol = nextHost?.includes('localhost') ? 'http' : 'https';

  const baseUrl = nextHost ? `${protocol}://${process.env.NEXT_PUBLIC_VERCEL_URL}` : '';

  return baseUrl;
}
