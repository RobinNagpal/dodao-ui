'use client';

import EmailLoginModal from '@/app/login/components/EmailLoginModal';

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
