import { Space, ByteFeedback, useUpsertByteRatingsMutation, ByteRating, ByteDetailsFragment } from '@/graphql/generated/generated-types';
import { UserIdKey } from '@dodao/web-core/types/auth/User';
import { useEffect, useState } from 'react';
import { v4 } from 'uuid';

export type ByteRatingsHelper = {
  skipByteRating: () => void;
  showRatingsModal: boolean;
  setShowRatingsModal: (show: boolean) => void;
  setByteRating: (rating: number, feedback?: ByteFeedback) => Promise<void>;
};

export function useByteRatings(space: Space, byte: ByteDetailsFragment, byteSubmission: boolean): ByteRatingsHelper {
  const [showRatingsModal, setShowRatingsModal] = useState(false);
  const [upsertByteRatingsMutation] = useUpsertByteRatingsMutation();
  const [shownByteRatingsModal, setShownByteRatingsModal] = useState(false);

  useEffect(() => {
    const lastShownString = localStorage.getItem('lastRatingModalShown');
    const lastShown = lastShownString ? new Date(parseInt(lastShownString)) : null;
    const now = new Date().getTime();
    const oneDay = 60 * 60 * 1000; // One hour in milliseconds

    function showRatingModalIfDue() {
      if (!lastShown || now - lastShown.getTime() > oneDay) {
        setShownByteRatingsModal(true);
        setShowRatingsModal(true);
        localStorage.setItem('lastRatingModalShown', now.toString());
      }
    }

    if (byteSubmission && !shownByteRatingsModal) {
      showRatingModalIfDue();
    }
  }, [byteSubmission, shownByteRatingsModal]);

  const setByteRating = async (rating: number, feedback?: ByteFeedback) => {
    const byteRating: ByteRating = {
      byteId: byte.id,
      negativeFeedback: null,
      positiveFeedback: null,
      ratingUuid: v4(),
      skipRating: false,
      spaceId: space.id,
      userId: localStorage.getItem(UserIdKey)!,
      rating: rating,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (feedback) {
      if ((rating || 5) < 3) {
        byteRating.negativeFeedback = feedback;
        byteRating.positiveFeedback = null;
      } else {
        byteRating.negativeFeedback = null;
        byteRating.positiveFeedback = feedback;
      }
    }

    await upsertByteRatingsMutation({
      variables: {
        spaceId: space.id,
        upsertByteRatingInput: {
          rating: byteRating.rating,
          byteId: byteRating.byteId,
          negativeFeedback: byteRating.negativeFeedback,
          positiveFeedback: byteRating.positiveFeedback,
          ratingUuid: byteRating.ratingUuid,
          skipRating: byteRating.skipRating,
          spaceId: byteRating.spaceId,
          userId: byteRating.userId,
        },
      },
      refetchQueries: ['ByteRatings', 'ConsolidatedByteRating'],
    });
  };

  const skipByteRating = async () => {
    await upsertByteRatingsMutation({
      variables: {
        spaceId: space.id,
        upsertByteRatingInput: {
          rating: null,
          byteId: byte.id,
          negativeFeedback: null,
          positiveFeedback: null,
          ratingUuid: v4(),
          skipRating: true,
          spaceId: space.id,
          userId: localStorage.getItem(UserIdKey)!,
        },
      },
      refetchQueries: ['ByteRatings', 'ConsolidatedByteRating'],
    });
    setShowRatingsModal(false);
  };

  return {
    showRatingsModal,
    setShowRatingsModal,
    setByteRating,
    skipByteRating,
  };
}
