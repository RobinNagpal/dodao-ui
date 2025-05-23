import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';
import { getServerSession } from 'next-auth';
import CreateCompareCompoundAlertPage from './CreateCompareCompoundAlertPage';

export default async function CompareCompoundPageWrapper() {
  const session = (await getServerSession(authOptions)) as DoDAOSession | null;

  if (!session) {
    return <div>Please log in to create a compare compound alert.</div>;
  }

  return <CreateCompareCompoundAlertPage session={session} />;
}
