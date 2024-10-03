import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import FinishSetup from '@/components/spaces/finish-space-setup/finish-space-setup';

export default async function CreateSpacePage() {
  const space = await getSpaceServerSide();
  return <FinishSetup space={space!} />;
}
