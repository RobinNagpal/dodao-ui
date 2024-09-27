'use client';

import withSpace, { SpaceProps } from '@/contexts/withSpace';
import { useSearchParams } from 'next/navigation';
import EmailVerificationCallbackPage from '@dodao/web-core/components/auth/EmailVerificationCallbackPage';

const CallbackPage = ({ space }: SpaceProps) => {
  const searchParams = useSearchParams();
  const context = searchParams.get('context');

  // Conditionally set the callback URL based on the context (signup or login)
  const callbackUrl = context === 'signup' ? '/spaces/create' : '/';
  return <EmailVerificationCallbackPage space={space} callbackUrl={callbackUrl} />;
};

export default withSpace(CallbackPage);
