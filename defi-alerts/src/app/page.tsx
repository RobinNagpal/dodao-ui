import AlertsPage from '@/app/alerts/page';
import Home from '@/components/home-page/home';
import { headers } from 'next/headers';

export default async function Page() {
  const reqHeaders = await headers();
  const host = reqHeaders.get('host')?.split(':')?.[0];

  if (host === 'defialerts.xyz' || host === 'www.defialerts.xyz' || host === 'defialerts-localhost.xyz') {
    return <Home />;
  }

  if (host === 'compound.defialerts-localhost.xyz' || host === 'compound.defialerts.xyz') {
    return <AlertsPage />;
  }

  return <Home />;
}
