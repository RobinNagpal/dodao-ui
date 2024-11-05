'use client';

import withSpace, { SpaceProps } from '@/contexts/withSpace';
import { useSearchParams } from 'next/navigation';
import EmailVerificationCallbackPage from '@dodao/web-core/components/auth/EmailVerificationCallbackPage';
import { Contexts } from '@dodao/web-core/utils/constants/constants';

const contextToUrlMapping: { [key in Contexts]: string } = {
  [Contexts.login]: '/spaces/space-collections',
  [Contexts.setupNewSpace]: '/spaces/create',
  [Contexts.verifyToken]: '/',
};

const CallbackPage = ({ space }: SpaceProps) => {
  const searchParams = useSearchParams();
  const context = searchParams.get('context');

  // Conditionally set the callback URL based on the context
  const callbackUrl = contextToUrlMapping[context as Contexts];

  const full = location.protocol + '//' + location.host;
  const fullCallbackUrl = full + callbackUrl;

  return <EmailVerificationCallbackPage space={space} callbackUrl={fullCallbackUrl} />;
};

export default withSpace(CallbackPage);
