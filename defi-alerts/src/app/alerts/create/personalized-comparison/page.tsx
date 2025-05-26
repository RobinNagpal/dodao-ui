import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { AlertPageWrapper } from '@/components/alerts';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { getServerSession } from 'next-auth';
import CreatePersonalizedCompareAlertPage from './CreatePersonalizedCompareMarketPage';

export default async function CompareCompoundPageWrapper() {
  const session = (await getServerSession(authOptions)) as DoDAOSession | null;
  return (
    <AlertPageWrapper loginMessage="Please log in to create a compare compound alert." session={session}>
      {(session) => <CreatePersonalizedCompareAlertPage session={session} />}
    </AlertPageWrapper>
  );
}
