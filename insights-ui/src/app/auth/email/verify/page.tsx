import LoginTokenVerificationPage from '@dodao/web-core/components/auth/LoginTokenVerificationPage';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { Suspense } from 'react';

export default async function VerifyTokenPage() {
  const space: WebCoreSpace = {
    id: KoalaGainsSpaceId,
    creator: 'some_creator',
    features: [],
    name: 'KoalaGains Simulations',
    domains: [],
    adminUsernamesV1: [],
    authSettings: {},
  };
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginTokenVerificationPage space={space} />
    </Suspense>
  );
}
