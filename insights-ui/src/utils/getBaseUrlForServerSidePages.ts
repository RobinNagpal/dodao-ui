import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export function getBaseUrlForServerSidePages() {
  const nextEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
  const baseUrl = getBaseUrl();
  if (nextEnv === 'production' || nextEnv === 'preview' || baseUrl.includes('vercel.app')) {
    return 'https://koalagains.com';
  }
  return baseUrl;
}
