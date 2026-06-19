'use client';

import { EtfNotesResponse } from '@/app/api/[spaceId]/users/etf-notes/route';
import { KoalaGainsSession } from '@/types/auth';
import { FavouriteEtfResponse, FavouriteEtfsResponse } from '@/types/etf-user';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { EtfNote } from '@prisma/client';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Same dynamic chunks used by the desktop buttons — Next.js dedupes the
// chunk, so loading them here adds no bundle cost when desktop buttons render.
const AddEditEtfFavouriteModal = dynamic(() => import('@/app/etfs/[exchange]/[etf]/AddEditEtfFavouriteModal'), { ssr: false });
const AddEditEtfNotesModal = dynamic(() => import('@/app/etfs/[exchange]/[etf]/AddEditEtfNotesModal'), { ssr: false });

export interface MobileEtfActionsMenuProps {
  etfId: string;
  etfSymbol: string;
  etfName: string;
}

export default function MobileEtfActionsMenu({ etfId, etfSymbol, etfName }: MobileEtfActionsMenuProps): JSX.Element {
  const router = useRouter();
  const { data: koalaSession } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;

  const [isFavouriteOpen, setIsFavouriteOpen] = useState(false);
  const [favouriteMounted, setFavouriteMounted] = useState(false);

  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesMounted, setNotesMounted] = useState(false);

  const { data: favouritesData, reFetchData: refetchFavourites } = useFetchData<FavouriteEtfsResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-etfs`,
    { skipInitialFetch: !session },
    'Failed to fetch favourites'
  );

  const { data: notesData, reFetchData: refetchNotes } = useFetchData<EtfNotesResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/etf-notes`,
    { skipInitialFetch: !session },
    'Failed to fetch notes'
  );

  const favouriteEtf: FavouriteEtfResponse | null = favouritesData?.favouriteEtfs.find((f) => f.etfId === etfId) || null;
  const existingNote: EtfNote | null = notesData?.etfNotes.find((n) => n.etfId === etfId) || null;

  const items: EllipsisDropdownItem[] = [
    { key: 'favourite', label: favouriteEtf ? 'Edit favourite' : 'Add to favourites' },
    { key: 'notes', label: existingNote ? 'Edit note' : 'Add note' },
  ];

  const handleSelect = (key: string) => {
    if (!session) {
      router.push('/login');
      return;
    }
    if (key === 'favourite') {
      setFavouriteMounted(true);
      setIsFavouriteOpen(true);
    } else if (key === 'notes') {
      setNotesMounted(true);
      setIsNotesOpen(true);
    }
  };

  return (
    <div className="relative z-10">
      <EllipsisDropdown items={items} onSelect={handleSelect} className="px-2 py-2" />

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

      {session && notesMounted && (
        <AddEditEtfNotesModal
          isOpen={isNotesOpen}
          onClose={() => setIsNotesOpen(false)}
          etfId={etfId}
          etfSymbol={etfSymbol}
          etfName={etfName}
          onSuccess={() => setIsNotesOpen(false)}
          existingNote={existingNote}
          onUpsert={refetchNotes}
        />
      )}
    </div>
  );
}
