'use client';

import withSpace, { SpaceProps } from '@/contexts/withSpace';
import EmailLoginModal from '@dodao/web-core/ui/auth/login/components/EmailLoginModal';

const EmailAuthPage = ({ space }: SpaceProps) => {
  return (
    <EmailLoginModal
      open={true}
      onClose={() => {
        // do nothing
      }}
      space={space}
    />
  );
};

export default withSpace(EmailAuthPage);
