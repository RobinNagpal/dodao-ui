import { getAlertsSpaceServerSide } from '@/utils/getAlertsSpaceIdServerSide';
import LoginTokenVerificationPage from '@dodao/web-core/components/auth/LoginTokenVerificationPage';

export default async function VerifyTokenPage() {
  const space = await getAlertsSpaceServerSide();
  return <LoginTokenVerificationPage space={space!} />;
}
