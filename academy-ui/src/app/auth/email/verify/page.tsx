'use client';

import withSpace, { SpaceProps } from '@/contexts/withSpace';
import EmailVerificationCallbackPage from '@dodao/web-core/components/auth/EmailVerificationCallbackPage';

const CallbackPage = ({ space }: SpaceProps) => {
  return <EmailVerificationCallbackPage space={space} callbackUrl="/" />;
};

export default withSpace(CallbackPage);
