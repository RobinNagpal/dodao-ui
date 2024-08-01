import { getServerSession } from 'next-auth';
import React from 'react';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { Session } from '@dodao/web-core/types/auth/Session';

import HomePage from '@/components/HomePage/HomePage';
async function Home() {
  return <HomePage />;
}

export default Home;
