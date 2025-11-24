import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export function getBaseUrlForServerSidePages() {
  const nextEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
  const baseUrl = getBaseUrl();
  if (!baseUrl.includes('localhost') && (nextEnv === 'production' || nextEnv === 'preview' || baseUrl.includes('vercel.app') || !nextEnv)) {
    return 'https://koalagains.com';
  }
  return baseUrl;
}
