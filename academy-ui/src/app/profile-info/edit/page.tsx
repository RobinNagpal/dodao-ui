import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import ProfileEdit from '@/components/user/Edit/ProfileEdit';

export default async function ProfileEditPage() {
  const space = await getSpaceServerSide();
  return <ProfileEdit space={space!} />;
}
