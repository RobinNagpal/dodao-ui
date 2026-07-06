'use client';

import { KoalaGainsSession } from '@/types/auth';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { FavouriteEtfResponse, FavouriteEtfsResponse } from '@/types/etf-user';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

// Modal only opens after the user clicks Favourite — defer its chunk.
const AddEditEtfFavouriteModal = dynamic(() => import('@/app/etfs/[exchange]/[etf]/AddEditEtfFavouriteModal'), { ssr: false });
const LoginPopup = dynamic(() => import('@/components/login/login-popup').then((m) => ({ default: m.LoginPopup })), { ssr: false });

export interface EtfFavouriteButtonProps {
  etfId: string;
  etfSymbol: string;
  etfName: string;
}

export default function EtfFavouriteButton({ etfId, etfSymbol, etfName }: EtfFavouriteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasMountedModal, setHasMountedModal] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const { data: koalaSession } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;

  // Fetch favourite ETFs
  const { data: favouritesData, reFetchData: refetchFavourites } = useFetchData<FavouriteEtfsResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-etfs`,
    { skipInitialFetch: !session },
    'Failed to fetch favourites'
  );

  const favouriteEtf: FavouriteEtfResponse | null = favouritesData?.favouriteEtfs.find((f) => f.etfId === etfId) || null;

  const handleFavouriteClick = () => {
    if (!session) {
      setIsLoginPopupOpen(true);
      return;
    }
    setHasMountedModal(true);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
  };

  const handleUpsert = async () => {
    await refetchFavourites();
  };

  return (
    <div className="flex-shrink-0 relative z-10">
      <button
        onClick={handleFavouriteClick}
        className={`inline-flex items-center px-4 py-2 text-sm font-medium text-heading ${
          favouriteEtf ? 'bg-primary hover:opacity-90 border-primary' : 'bg-surface-2 hover:bg-surface-3 border-border'
        } border rounded-lg shadow-md relative z-10`}
        title={!session ? 'Login to add to favourites' : favouriteEtf ? 'Edit favourite' : 'Add to favourites'}
      >
        {favouriteEtf ? <HeartSolid className="w-5 h-5 mr-2 text-red-400" aria-hidden="true" /> : <HeartOutline className="w-5 h-5 mr-2" aria-hidden="true" />}
        <span>Favourite</span>
      </button>
      {session && hasMountedModal && (
        <AddEditEtfFavouriteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          etfId={etfId}
          etfSymbol={etfSymbol}
          etfName={etfName}
          onSuccess={handleSuccess}
          favouriteEtf={favouriteEtf}
          onUpsert={handleUpsert}
        />
      )}
      {!session && <LoginPopup open={isLoginPopupOpen} onClose={() => setIsLoginPopupOpen(false)} />}
    </div>
  );
}
