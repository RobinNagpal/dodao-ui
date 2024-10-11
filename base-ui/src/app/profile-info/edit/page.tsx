import ProfileEdit from '@/components/user/Edit/ProfileEdit';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';

export default async function ProfileEditPage() {
  const space = await getSpaceServerSide();
  return <ProfileEdit space={space!} />;
}
