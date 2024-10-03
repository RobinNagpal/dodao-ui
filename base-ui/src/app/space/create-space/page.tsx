import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import CreateSpace from '@/components/spaces/CreateSpace';

export default async function CreateSpacePage() {
  const space = await getSpaceServerSide();
  return <CreateSpace space={space!} />;
}
