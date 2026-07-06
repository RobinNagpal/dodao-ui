'use client';

import { KoalaGainsSession } from '@/types/auth';
import { FavouriteEtfResponse, FavouriteEtfsResponse } from '@/types/etf-user';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

// Same dynamic chunks used by the desktop buttons — Next.js dedupes the
// chunk, so loading them here adds no bundle cost when desktop buttons render.
const AddEditEtfFavouriteModal = dynamic(() => import('@/app/etfs/[exchange]/[etf]/AddEditEtfFavouriteModal'), { ssr: false });
const LoginPopup = dynamic(() => import('@/components/login/login-popup').then((m) => ({ default: m.LoginPopup })), { ssr: false });

export interface MobileEtfActionsMenuProps {
  etfId: string;
  etfSymbol: string;
  etfName: string;
}

export default function MobileEtfActionsMenu({ etfId, etfSymbol, etfName }: MobileEtfActionsMenuProps): JSX.Element {
  const { data: koalaSession } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;

  const [isFavouriteOpen, setIsFavouriteOpen] = useState(false);
  const [favouriteMounted, setFavouriteMounted] = useState(false);

  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);

  const { data: favouritesData, reFetchData: refetchFavourites } = useFetchData<FavouriteEtfsResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-etfs`,
    { skipInitialFetch: !session },
    'Failed to fetch favourites'
  );

  const favouriteEtf: FavouriteEtfResponse | null = favouritesData?.favouriteEtfs.find((f) => f.etfId === etfId) || null;

  const handleSelect = (key: string) => {
    if (!session) {
      setIsLoginPopupOpen(true);
      return;
    }
    if (key === 'favourite') {
      setFavouriteMounted(true);
      setIsFavouriteOpen(true);
    }
  };

  return (
    <div className="relative z-10">
      {/* Inline icon actions (mobile) — surfaced directly instead of hidden in a
          3-dot menu so logged-out visitors are more likely to tap and hit the
          login prompt. Same handlers/modals as the desktop buttons. */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleSelect('favourite')}
          aria-label={favouriteEtf ? 'Edit favourite' : 'Add to favourites'}
          title={!session ? 'Login to add to favourites' : favouriteEtf ? 'Edit favourite' : 'Add to favourites'}
          className={`inline-flex items-center justify-center p-2 text-heading border rounded-lg shadow-md ${
            favouriteEtf ? 'bg-primary hover:opacity-90 border-primary' : 'bg-surface-2 hover:bg-surface-3 border-border'
          }`}
        >
          {favouriteEtf ? <HeartSolid className="w-5 h-5 text-red-400" aria-hidden="true" /> : <HeartOutline className="w-5 h-5" aria-hidden="true" />}
        </button>
      </div>

      {session && favouriteMounted && (
        <AddEditEtfFavouriteModal
          isOpen={isFavouriteOpen}
          onClose={() => setIsFavouriteOpen(false)}
          etfId={etfId}
          etfSymbol={etfSymbol}
          etfName={etfName}
          onSuccess={() => setIsFavouriteOpen(false)}
          favouriteEtf={favouriteEtf}
          onUpsert={refetchFavourites}
        />
      )}

      {!session && <LoginPopup open={isLoginPopupOpen} onClose={() => setIsLoginPopupOpen(false)} />}
    </div>
  );
}
