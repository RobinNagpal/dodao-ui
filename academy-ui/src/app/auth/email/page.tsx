import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import EmailLoginModal from '@dodao/web-core/ui/auth/login/components/EmailLoginModal';

const EmailAuthPage = async () => {
  const space = await getSpaceServerSide();
  return (
    <EmailLoginModal
      open={true}
      onClose={() => {
        // do nothing
      }}
      space={space!}
    />
  );
};

export default EmailAuthPage;
