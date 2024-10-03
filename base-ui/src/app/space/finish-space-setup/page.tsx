import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import FinishSpaceSetup from '@/components/spaces/FinishSpaceSetup';

export default async function CreateSpacePage() {
  const space = await getSpaceServerSide();
  return <FinishSpaceSetup space={space!} />;
}
