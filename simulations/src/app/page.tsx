'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const userType = localStorage.getItem('user_type');
    const userEmail = localStorage.getItem('user_email');

    if (userType && userEmail) {
      // Redirect to appropriate dashboard
      if (userType === 'student') {
        router.push('/student');
      } else if (userType === 'professor') {
        router.push('/professor');
      } else {
        router.push('/login');
      }
    } else {
      // No user logged in, redirect to login
      router.push('/login');
    }
  }, [router]);

  // Show loading while checking localStorage and redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  );
}
