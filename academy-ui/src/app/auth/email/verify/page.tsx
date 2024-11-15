import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import LoginTokenVerificationPage from '@dodao/web-core/components/auth/LoginTokenVerificationPage';

export default async function VerifyTokenPage() {
  const space = await getSpaceServerSide();
  return <LoginTokenVerificationPage space={space!} />;
}
