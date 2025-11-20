'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PortfoliosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Portfolios</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your investment portfolios and track your holdings.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Portfolio Management Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We're working on building a comprehensive portfolio management system.
              You'll be able to create, manage, and track your investment portfolios here.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              Features coming:
              <ul className="mt-2 space-y-1">
                <li>• Create multiple portfolios</li>
                <li>• Add holdings with allocations</li>
                <li>• Track performance</li>
                <li>• Compare portfolios</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
