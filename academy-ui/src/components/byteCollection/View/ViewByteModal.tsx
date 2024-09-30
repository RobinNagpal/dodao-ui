'use client';

import RatingModal, { FeedbackOptions } from '@/components/app/Modal/Rating/RatingModal';
import { useByteRatings } from '@/components/bytes/Rating/useByteRating';
import ShareBytePage from '@/components/bytes/Share/ShareBytePage';
import FullScreenByteModal from '@/components/bytes/View/FullScreenByteModal';
import NormalByteStepperItemView from '@/components/bytes/View/ByteStepperItem/ByteStepperItemView';
import SwiperByteStepperItemView from '@/components/bytes/View/SwiperByteView/SwiperByteStepperItemView';
import ContinuousStepIndicatorProgress from '@/components/bytes/View/ByteStepperItem/Progress/ContinuousStepIndicatorProgress';
import RatingByteView from '@/components/bytes/View/RatingByteView';
import { useViewByteInModal } from '@/components/bytes/View/useViewByteInModal';
import { ByteDetailsFragment, ByteFeedback, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { ByteDto } from '@/types/bytes/ByteDto';
import TidbitDetailsLoader from '@dodao/web-core/components/core/loaders/TidbitDetailsLoader';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { ClipboardDocumentListIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const EditByteView: React.ComponentType<any> = dynamic(() => import('@/components/bytes/Edit/EditByteView'), {
  ssr: false, // Disable server-side rendering for this component
});

export interface ViewByteModalProps {
  space: SpaceWithIntegrationsFragment;
  byteCollectionId: string;
  selectedByteId: string;
  viewByteModalClosedUrl: string;
  afterUpsertByteModalClosedUrl: string;
}

export default function ViewByteModal({ space, selectedByteId, viewByteModalClosedUrl, afterUpsertByteModalClosedUrl, byteCollectionId }: ViewByteModalProps) {
  const fetchByteFn = async (byteId: string): Promise<ByteDto> => {
    const response = await axios.get(`${getBaseUrl()}/api/${space.id}/byte-collections/${byteCollectionId}/bytes/${byteId}`);
    return response.data;
  };

  const viewByteHelper = useViewByteInModal({ space: space, byteId: selectedByteId, stepOrder: 0, fetchByteFn: fetchByteFn });

  useEffect(() => {
    viewByteHelper.initialize();
  }, [selectedByteId]);

  const [editByteModalOpen, setEditByteModalOpen] = React.useState(false);
  const [shareByteModalOpen, setShareByteModalOpen] = React.useState(false);
  const [ratingByteModalOpen, setRatingByteModalOpen] = React.useState(false);

  const { activeStepOrder } = viewByteHelper || 0;

  const byte = viewByteHelper.byteRef;

  const activeStep = byte?.steps?.[activeStepOrder];

  const router = useRouter();

  function onClose() {
    router.push(viewByteModalClosedUrl);
  }

  const [byteSubmitted, setByteSubmitted] = useState<boolean>(false);

  const { showRatingsModal, setShowRatingsModal, setByteRating, skipByteRating } = useByteRatings(space, byte as ByteDetailsFragment, byteSubmitted);
  const feedbackOptions: FeedbackOptions[] = [
    { name: 'content', label: 'Content', image: ClipboardDocumentListIcon },
    { name: 'ux', label: 'User Experience', image: RocketLaunchIcon },
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

  const isLoading = !viewByteHelper.byteRef;
  const showSwiper = true;

  if (showSwiper) {
    return (
      <div>
        <div className="absolute right-2 top-2">
          <button
            type="button"
            className="inline-flex rounded-md hover:text-gray-500 focus:outline-none"
            onClick={() => {
              onClose();
            }}
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-10 w-10" aria-hidden="true" />
          </button>
        </div>

        <div className="text-center">
          <h3 id="topBar" className="text-xl font-semibold h-14 pt-4 ">
            {viewByteHelper.byteRef?.name || 'Tidbit Details'}
          </h3>
          <div>
            {isLoading ? (
              <TidbitDetailsLoader />
            ) : (
              <SwiperByteStepperItemView viewByteHelper={viewByteHelper} byte={byte} step={activeStep} space={space} setByteSubmitted={setByteSubmitted} />
            )}
          </div>
        </div>

        <RatingModal
          ratingType="Byte"
          open={showRatingsModal && (space.byteSettings.captureRating as boolean)}
          onClose={() => setShowRatingsModal(false)}
          skipRating={skipByteRating}
          setRating={setByteRating as (rating: number, feedback?: ByteFeedback) => Promise<void>}
          feedbackOptions={feedbackOptions}
        />
      </div>
    );
  }
  return (
    <FullScreenByteModal open={true} onClose={onClose} title={viewByteHelper.byteRef?.name || 'Tidbit Details'}>
      <ContinuousStepIndicatorProgress steps={viewByteHelper.byteRef?.steps?.length || 0} currentStep={activeStepOrder + 1} />
      {isLoading ? (
        <TidbitDetailsLoader />
      ) : (
        <NormalByteStepperItemView viewByteHelper={viewByteHelper} byte={byte} step={activeStep} space={space} setByteSubmitted={setByteSubmitted} />
      )}

      <RatingModal
        ratingType="Byte"
        open={showRatingsModal && (space.byteSettings.captureRating as boolean)}
        onClose={() => setShowRatingsModal(false)}
        skipRating={skipByteRating}
        setRating={setByteRating as (rating: number, feedback?: ByteFeedback) => Promise<void>}
        feedbackOptions={feedbackOptions}
      />
    </FullScreenByteModal>
  );
}
