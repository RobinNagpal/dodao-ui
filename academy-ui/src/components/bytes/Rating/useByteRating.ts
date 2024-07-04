import { Space, ByteFeedback, useUpsertByteRatingsMutation, ByteRating, ByteDetailsFragment } from '@/graphql/generated/generated-types';
import { UserIdKey } from '@dodao/web-core/types/auth/User';
import { useEffect, useState } from 'react';
import { v4 } from 'uuid';

export type ByteRatingsHelper = {
  skipByteRating: () => void;
  showRatingsModal: boolean;
  setShowRatingsModal: (show: boolean) => void;
  setByteRating: (rating: number, feedback?: ByteFeedback, suggestion?: string) => Promise<void>;
};

export function useByteRatings(space: Space, byte: ByteDetailsFragment, byteSubmitted: boolean): ByteRatingsHelper {
  const [showRatingsModal, setShowRatingsModal] = useState(false);
  const [upsertByteRatingsMutation] = useUpsertByteRatingsMutation();
  const [shownByteRatingsModal, setShownByteRatingsModal] = useState(false);

  useEffect(() => {
    if (byteSubmitted && !shownByteRatingsModal) {
      setShownByteRatingsModal(true);
      showRatingsModalIfNotShownRecently(true);
    }
  }, [byteSubmitted]);

  const showRatingsModalIfNotShownRecently = (showModal: boolean) => {
    const lastShownString = localStorage.getItem('lastRatingModalShown');
    const lastShown = lastShownString ? new Date(parseInt(lastShownString)) : null;
    const now = new Date().getTime();
    const oneHour = 60 * 60 * 1000; // One hour in milliseconds

    const shownInLastOneHour = lastShown && now - lastShown.getTime() < oneHour;

    if (showModal && !shownInLastOneHour) {
      setShownByteRatingsModal(true);
      setShowRatingsModal(true);
      localStorage.setItem('lastRatingModalShown', now.toString());
    } else if (showModal && shownInLastOneHour) {
      // no need to do anything as the ratings modal was recently shown
      setShowRatingsModal(false);
      setShownByteRatingsModal(true);
    } else {
      setShowRatingsModal(showModal);
    }
  };

  const setByteRating = async (rating: number, feedback?: ByteFeedback, suggestion?: string) => {
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
      suggestion: suggestion,
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
          suggestion: byteRating.suggestion,
        },
      },
      refetchQueries: ['ByteRatings', 'ConsolidatedByteRating'],
    });
    showRatingsModalIfNotShownRecently(false);
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
    setShowRatingsModal: showRatingsModalIfNotShownRecently,
    setByteRating,
    skipByteRating,
  };
}
