import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import FinishSpaceSetup from '@/components/spaces/finishSetup/FinishSpaceSetup';
import { Session } from '@dodao/web-core/types/auth/Session';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export default async function FinishSpaceSetupPage() {
  const space = await getSpaceServerSide();
  const session = (await getServerSession(authOptions)) as Session;

  return <FinishSpaceSetup space={space!} session={session!} />;
}
