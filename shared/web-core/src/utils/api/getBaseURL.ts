import { headers } from 'next/headers';

export default function getBaseUrl() {
  const reqHeaders = headers();
  const protocol = reqHeaders.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? `${protocol}://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000';

  return baseUrl;
}
