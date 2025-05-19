'use client';
import Home from '@/components/home-page/home';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  // useEffect(() => {
  //   redirect('/login');
  // }, []);

  // return null;
  return <Home />;
}
