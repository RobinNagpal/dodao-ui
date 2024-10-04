import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import FinishSpaceSetup from '@/components/spaces/finishSetup/FinishSpaceSetup';

export default async function FinishSpaceSetupPage() {
  const space = await getSpaceServerSide();
  return <FinishSpaceSetup space={space!} />;
}
