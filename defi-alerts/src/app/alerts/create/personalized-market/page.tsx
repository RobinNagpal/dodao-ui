import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { AlertPageWrapper } from '@/components/alerts';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { getServerSession } from 'next-auth';
import CreatePersonalizedMarketPage from './CreatePersonalizedMarketPage';

export default async function CreatePersonalizedMarketPageWrapper() {
  const session = (await getServerSession(authOptions)) as DoDAOSession | null;
  return (
    <AlertPageWrapper loginMessage="Please log in to create a personalized market alert." session={session}>
      {(session) => <CreatePersonalizedMarketPage session={session} />}
    </AlertPageWrapper>
  );
}
