import ClientSideHomePage from '@/components/client-side-home-page';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

async function getToken() {
  const response = await fetch(`${getBaseUrl()}/api/temp-token`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch token');
  }

  const data = await response.json();
  return data.token;
}

export default async function BookmarksPage() {
  const token = await getToken();

  return <ClientSideHomePage token={token} />;
}
