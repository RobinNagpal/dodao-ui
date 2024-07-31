import { getServerSession } from 'next-auth';
import React from 'react';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { Session } from '@dodao/web-core/types/auth/Session';
import { Hero } from '@/components/Hero/Hero';
async function Home() {
  return (
    <div>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Hero />
      </div>
    </div>
  );
}

export default Home;
