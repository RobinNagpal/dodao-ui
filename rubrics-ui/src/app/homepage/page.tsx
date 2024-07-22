import { getServerSession } from 'next-auth';
import React from 'react';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { Session } from '@dodao/web-core/types/auth/Session';

async function Home() {
  return (
    <div>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <h1 className="text-center text-3xl">HomePage</h1>
      </div>
    </div>
  );
}

export default Home;
