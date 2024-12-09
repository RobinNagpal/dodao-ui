import Loginpage from '@/components/auth/login/Login';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

export default async function Login() {
  return (
    <PageWrapper>
      <div className="w-full flex justify-center break-all">
        <Loginpage />
      </div>
    </PageWrapper>
  );
}
