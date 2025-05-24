import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { AlertPageWrapper } from '@/components/alerts';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { getServerSession } from 'next-auth';
import CreateCompoundMarketPage from './CreateCompoundMarketPage';

export default async function CreateCompoundMarketPageWrapper() {
  const session = (await getServerSession(authOptions)) as DoDAOSession | null;
  return (
    <AlertPageWrapper loginMessage="Please log in to create a compound market alert." session={session}>
      {(session) => <CreateCompoundMarketPage session={session} />}
    </AlertPageWrapper>
  );
}
