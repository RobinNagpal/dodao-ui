'use client';

import withSpace, { SpaceProps } from '@/contexts/withSpace';
import LoginTokenVerificationPage from '@dodao/web-core/components/auth/LoginTokenVerificationPage';

const CallbackPage = ({ space }: SpaceProps) => {
  return <LoginTokenVerificationPage space={space} callbackUrl="/space/create-space" />;
};

export default withSpace(CallbackPage);
