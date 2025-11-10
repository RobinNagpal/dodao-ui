'use client';

import AddEditFavouriteModal from '@/app/stocks/[exchange]/[ticker]/AddEditFavouriteModal';
import { FavouriteTickerResponse } from '@/types/ticker-user';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { KoalaGainsSession } from '@/types/auth';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useRouter } from 'next/navigation';

export interface FavouriteButtonProps {
  tickerId: string;
  tickerSymbol: string;
  tickerName: string;
  session?: KoalaGainsSession | null;
}

export default function FavouriteButton({ tickerId, tickerSymbol, tickerName, session }: FavouriteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [existingFavourite, setExistingFavourite] = useState<FavouriteTickerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // console.log('session', session);

  useEffect(() => {
    if (session) {
      checkIfFavourite();
    } else {
      setLoading(false);
    }
  }, [session, tickerId]);

  const checkIfFavourite = async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-tickers`);
      if (res.ok) {
        const data = await res.json();
        const favourite = data.favouriteTickers.find((f: FavouriteTickerResponse) => f.tickerId === tickerId);
        setExistingFavourite(favourite || null);
      }
    } catch (err) {
      console.error('Error checking favourite status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavouriteClick = () => {
    if (!session) {
      // Redirect to login if user is not authenticated
      router.push('/login');
      return;
    }
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    checkIfFavourite();
  };

  return (
    <div className="flex-shrink-0 relative z-10">
      <button
        onClick={handleFavouriteClick}
        disabled={loading}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg shadow-md disabled:opacity-50 relative z-10"
        title={
          !session 
            ? 'Login to add to favourites' 
            : existingFavourite 
            ? 'Edit favourite' 
            : 'Add to favourites'
        }
      >
        {loading ? (
          <div className="" />
        ) : session && existingFavourite ? (
          <>
            <HeartSolid className="w-5 h-5 text-red-500 mr-2" aria-hidden="true" />
            <span>Favourited</span>
          </>
        ) : (
          <>
            <HeartOutline className="w-5 h-5 mr-2" aria-hidden="true" />
            <span>Favourite</span>
          </>
        )}
      </button>
      {session && (
        <AddEditFavouriteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          tickerId={tickerId}
          tickerSymbol={tickerSymbol}
          tickerName={tickerName}
          existingFavourite={existingFavourite}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

