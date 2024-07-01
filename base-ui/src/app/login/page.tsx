import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';

import LoginForm from '@/components/login/loginForm';

export default async function RegisterPage() {
  const session = await getServerSession();
  const space = await getSpaceServerSide();

  if (session) {
    redirect('/');
  }

  return (
    <section className="h-full flex items-center justify-center pt-36" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="w-[600px]">
        <LoginForm space={space!} />
      </div>
    </section>
  );
}
