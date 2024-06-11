'use client';

import EmailLoginModal from '@dodao/web-core/ui/auth/login/components/EmailLoginModal';

const EmailAuthPage = () => {
  return (
    <EmailLoginModal
      open={true}
      onClose={() => {
        // do nothing
      }}
    />
  );
};

export default EmailAuthPage;
