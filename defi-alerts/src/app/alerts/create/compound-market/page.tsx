import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { DoDaoJwtTokenPayload, DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { getServerSession } from 'next-auth';
import CreateCompoundMarketPage from './CreateCompoundMarketPage';

export default async function CreateCompoundMarketPageWrapper() {
  const session = (await getServerSession(authOptions)) as DoDAOSession | null;

  if (!session) {
    return <div>Please log in to create a compound market alert.</div>;
  }

  return <CreateCompoundMarketPage session={session} />;
}
