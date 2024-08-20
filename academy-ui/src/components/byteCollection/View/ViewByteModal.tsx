'use client';

import ShareBytePage from '@/components/bytes/Share/ShareBytePage';
import ByteStepper from '@/components/bytes/View/ByteStepper';
import ContinuousStepIndicatorProgress from '@/components/bytes/View/ByteStepperItem/Progress/ContinuousStepIndicatorProgress';
import FullScreenByteModal from '@/components/bytes/View/FullScreenByteModal';
import RatingByteView from '@/components/bytes/View/RatingByteView';
import { useViewByteInModal } from '@/components/bytes/View/useViewByteInModal';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { ByteDetailsFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import TidbitDetailsLoader from '@dodao/web-core/components/core/loaders/TidbitDetailsLoader';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import styles from './ViewByteModal.module.scss';

const EditByteView: React.ComponentType<any> = dynamic(() => import('@/components/bytes/Edit/EditByteView'), {
  ssr: false, // Disable server-side rendering for this component
});

export interface ViewByteModalProps {
  space: SpaceWithIntegrationsFragment;
  selectedByteId: string;
  viewByteModalClosedUrl: string;
  afterUpsertByteModalClosedUrl: string;
}

export default function ViewByteModal({ space, selectedByteId, viewByteModalClosedUrl, afterUpsertByteModalClosedUrl }: ViewByteModalProps) {
  const fetchByteFn = async (byteId: string): Promise<ByteDetailsFragment> => {
    const response = await axios.get(`${getBaseUrl()}/api/byte/byte`, {
      params: {
        byteId: byteId,
        spaceId: space.id,
      },
    });
    const byteDetails = response.data.byte;
    return byteDetails;
  };

  const viewByteHelper = useViewByteInModal({ space: space, byteId: selectedByteId, stepOrder: 0, fetchByteFn: fetchByteFn });

  useEffect(() => {
    viewByteHelper.initialize();
  }, [selectedByteId]);

  const [editByteModalOpen, setEditByteModalOpen] = React.useState(false);
  const [shareByteModalOpen, setShareByteModalOpen] = React.useState(false);
  const [ratingByteModalOpen, setRatingByteModalOpen] = React.useState(false);

  const { activeStepOrder } = viewByteHelper;

  const router = useRouter();

  function onClose() {
    router.push(viewByteModalClosedUrl);
  }

  const threeDotItems: EllipsisDropdownItem[] = [
    { label: 'Edit', key: 'edit' },
    { label: 'Generate Pdf', key: 'generate-pdf' },
    { label: 'Rating', key: 'rating' },
  ];

  if (editByteModalOpen && viewByteHelper.byteRef) {
    return (
      <FullScreenModal open={true} onClose={onClose} title={viewByteHelper.byteRef?.name || 'Tidbit Details'}>
        <div className="text-left">
          <EditByteView
            space={space}
            byteId={viewByteHelper.byteRef.id}
            onUpsert={async () => {
              setEditByteModalOpen(false);
              router.push(`${afterUpsertByteModalClosedUrl}/${viewByteHelper.byteRef.id}`);
            }}
          />
        </div>
      </FullScreenModal>
    );
  }

  if (shareByteModalOpen && viewByteHelper.byteRef) {
    return (
      <FullScreenModal open={true} onClose={onClose} title={viewByteHelper.byteRef?.name || 'Tidbit Details'}>
        <div className="text-left">
          <ShareBytePage byteId={viewByteHelper.byteRef.id} space={space} />
        </div>
      </FullScreenModal>
    );
  }

  if (ratingByteModalOpen && viewByteHelper.byteRef) {
    return (
      <FullScreenModal open={true} onClose={onClose} title={'Ratings'}>
        <div className="text-left">
          <RatingByteView byteId={viewByteHelper.byteRef.id} space={space} />
        </div>
      </FullScreenModal>
    );
  }

  return (
    <FullScreenByteModal open={true} onClose={onClose} title={viewByteHelper.byteRef?.name || 'Tidbit Details'}>
      <div id="byte-container" className={`flex flex-col items-center w-full relative inset-0`}>
        <ContinuousStepIndicatorProgress steps={viewByteHelper.byteRef?.steps?.length || 0} currentStep={activeStepOrder + 1} />
        <div className={`${styles.styledByteCard} overflow-x-hidden h-full overflow-y-auto w-full`}>
          {viewByteHelper.byteRef ? (
            <>
              <div className="absolute my-2 top-4 right-4">
                <PrivateEllipsisDropdown
                  items={threeDotItems}
                  onSelect={(key) => {
                    if (key === 'edit') {
                      setEditByteModalOpen(true);
                    } else if (key === 'generate-pdf') {
                      setShareByteModalOpen(true);
                    } else if (key === 'rating') {
                      setRatingByteModalOpen(true);
                    }
                  }}
                />
              </div>
              <ByteStepper viewByteHelper={viewByteHelper} byte={viewByteHelper.byteRef} space={space} />
            </>
          ) : (
            <TidbitDetailsLoader />
          )}
        </div>
      </div>
    </FullScreenByteModal>
  );
}
