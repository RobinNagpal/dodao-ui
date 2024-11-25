'use client';

import RatingModal, { FeedbackOptions } from '@/components/app/Modal/Rating/RatingModal';
import { useByteRatings } from '@/components/bytes/Rating/useByteRating';
import ShareBytePage from '@/components/bytes/Share/ShareBytePage';
import NormalByteStepperItemView from '@/components/bytes/View/ByteStepperItem/ByteStepperItemView';
import ContinuousStepIndicatorProgress from '@/components/bytes/View/ByteStepperItem/Progress/ContinuousStepIndicatorProgress';
import FullScreenByteModal from '@/components/bytes/View/FullScreenByteModal';
import RatingByteView from '@/components/bytes/View/RatingByteView';
import SwiperByteStepperItemView from '@/components/bytes/View/SwiperByteView/SwiperByteStepperItemView';
import { useViewByteHelper } from '@/components/bytes/View/useViewByteHelper';
import { ByteDetailsFragment, ByteFeedback } from '@/graphql/generated/generated-types';
import { ByteDto, ByteViewMode } from '@/types/bytes/ByteDto';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import TidbitDetailsLoader from '@dodao/web-core/components/core/loaders/TidbitDetailsLoader';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ClipboardDocumentListIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import whatIsClickableDemo from '@/onboardingByteCollection/0001-demo-byte-what-is-clickable-demo.json';
import whatIsShortVideo from '@/onboardingByteCollection/0001-demo-byte-what-is-short-video.json';
import whatIsTidbit from '@/onboardingByteCollection/0001-demo-byte-what-is-tidbit.json';

const EditByteView: React.ComponentType<any> = dynamic(() => import('@/components/bytes/Edit/EditByteView'), {
  ssr: false, // Disable server-side rendering for this component
});

export interface ViewByteModalProps {
  space: SpaceWithIntegrationsDto;
  byteCollectionId: string;
  selectedByteId: string;
  viewByteModalClosedUrl: string;
  afterUpsertByteModalClosedUrl: string;
}

export default function ViewByteModal({ space, selectedByteId, viewByteModalClosedUrl, afterUpsertByteModalClosedUrl, byteCollectionId }: ViewByteModalProps) {
  const fetchByteFn = async (byteId: string): Promise<ByteDto> => {
    if (byteId.startsWith('0001-demo-byte')) {
      switch (byteId) {
        case '0001-demo-byte-what-is-tidbit':
          return whatIsTidbit as ByteDto;
        case '0001-demo-byte-what-is-clickable-demo':
          return whatIsClickableDemo as ByteDto;
        case '0001-demo-byte-what-is-short-video':
          return whatIsShortVideo as ByteDto;
      }
    }
    const response = await axios.get(`${getBaseUrl()}/api/${space.id}/byte-collections/${byteCollectionId}/bytes/${byteId}`);
    console.log('response.data: ', response.data);
    return response.data;
  };

  const viewByteHelper = useViewByteHelper({ space: space, byteId: selectedByteId, stepOrder: 0, fetchByteFn: fetchByteFn });

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
    router.push(`${viewByteModalClosedUrl}?updated=${Date.now()}`);
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
  const showSwiper = space.byteSettings?.byteViewMode === ByteViewMode.FullScreenSwiper;

  if (showSwiper) {
    return (
      <FullScreenModal open={true} onClose={onClose} title={viewByteHelper.byteRef?.name || 'Tidbit Details'}>
        {isLoading ? (
          <div className="flex justify-center align-center w-full">
            <div className="w-2/3">
              <TidbitDetailsLoader />
            </div>
          </div>
        ) : (
          <SwiperByteStepperItemView
            viewByteHelper={viewByteHelper}
            byte={byte}
            step={activeStep}
            space={space}
            setByteSubmitted={setByteSubmitted}
            onClose={onClose}
          />
        )}
        <RatingModal
          ratingType="Byte"
          open={showRatingsModal && (space.byteSettings.captureRating as boolean)}
          onClose={() => setShowRatingsModal(false)}
          skipRating={skipByteRating}
          setRating={setByteRating as (rating: number, feedback?: ByteFeedback) => Promise<void>}
          feedbackOptions={feedbackOptions}
        />
      </FullScreenModal>
    );
  }
  return (
    <FullScreenByteModal open={true} onClose={onClose} title={viewByteHelper.byteRef?.name || 'Tidbit Details'}>
      <ContinuousStepIndicatorProgress steps={viewByteHelper.byteRef?.steps?.length || 0} currentStep={activeStepOrder + 1} />
      {isLoading ? (
        <TidbitDetailsLoader />
      ) : (
        <NormalByteStepperItemView
          viewByteHelper={viewByteHelper}
          byte={byte}
          step={activeStep}
          space={space}
          setByteSubmitted={setByteSubmitted}
          onClose={onClose}
        />
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
