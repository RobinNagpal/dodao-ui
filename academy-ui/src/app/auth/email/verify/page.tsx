'use client';

import withSpace, { SpaceProps } from '@/contexts/withSpace';
import { useSearchParams } from 'next/navigation';
import EmailVerificationCallbackPage from '@dodao/web-core/components/auth/EmailVerificationCallbackPage';

const CallbackPage = ({ space }: SpaceProps) => {
  const searchParams = useSearchParams();
  const context = searchParams.get('context');

  // Conditionally set the callback URL based on the context (setupNewSpace or login)
  const callbackUrl = context === 'setupNewSpace' ? '/spaces/create' : '/spaces/space-collections';
  return <EmailVerificationCallbackPage space={space} callbackUrl={callbackUrl} />;
};

export default withSpace(CallbackPage);
