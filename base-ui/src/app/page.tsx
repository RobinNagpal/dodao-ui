import React from 'react';
import { GetStartedButton } from '@dodao/web-core/components/home/common/GetStartedButton';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

async function Home() {
  const session = await getServerSession();

  if (session) {
    redirect('/');
  }
  return (
    <div>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <GetStartedButton href={`/login`}>
          Get started <span aria-hidden="true">→</span>
        </GetStartedButton>
      </div>
    </div>
  );
}

export default Home;
