import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import FinishSpaceSetup from '@/components/spaces/finishSetup/FinishSpaceSetup';

export default async function CreateSpacePage() {
  const space = await getSpaceServerSide();
  return <FinishSpaceSetup space={space!} />;
}
