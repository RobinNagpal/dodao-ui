'use client';

import AddEditFavouriteModal from '@/app/stocks/[exchange]/[ticker]/AddEditFavouriteModal';
import { KoalaGainsSession } from '@/types/auth';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export interface FavouriteButtonProps {
  tickerId: string;
  tickerSymbol: string;
  tickerName: string;
}

export default function FavouriteButton({ tickerId, tickerSymbol, tickerName }: FavouriteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: koalaSession } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;
  const router = useRouter();

  const handleFavouriteClick = () => {
    if (!session) {
      // Redirect to login if user is not authenticated
      router.push('/login');
      return;
    }
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    // Modal will handle the success feedback
    setIsModalOpen(false);
  };

  return (
    <div className="flex-shrink-0 relative z-10">
      <button
        onClick={handleFavouriteClick}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg shadow-md relative z-10"
        title={!session ? 'Login to add to favourites' : 'Manage favourite'}
      >
        <HeartOutline className="w-5 h-5 mr-2" aria-hidden="true" />
        <span>Favourite</span>
      </button>
      {session && (
        <AddEditFavouriteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          tickerId={tickerId}
          tickerSymbol={tickerSymbol}
          tickerName={tickerName}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
