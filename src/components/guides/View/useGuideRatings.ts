import { GuideFragment, GuideRating, Space, useUpsertGuideRatingsMutation } from '@/graphql/generated/generated-types';
import { UserIdKey } from '@/types/auth/User';
import { useState } from 'react';
import { v4 } from 'uuid';

export type GuideRatingsHelper = {
  skipInitialRating: () => void;
  showRatingsModal: boolean;
  guideRatings: GuideRating | undefined;
  upsertRating: () => void;
  initialize: () => void;
  setStartRating: (rating: number) => void;
};

export function useGuideRatings(space: Space, guide: GuideFragment): GuideRatingsHelper {
  const [showRatingsModal, setShowRatingsModal] = useState(false);
  const [guideRatings, setGuideRatings] = useState<GuideRating>();
  const [upsertGuideRatingsMutation] = useUpsertGuideRatingsMutation();

  const guideRatingsKey = `${space.id}-${guide.id}-guide-ratings`;
  const initialize = () => {
    if (space.guideSettings.captureBeforeAndAfterRating) {
      const guideRatingsString = localStorage.getItem(guideRatingsKey);
      if (guideRatingsString) {
        setGuideRatings(JSON.parse(guideRatingsString));
      } else {
        const newGuideRating: GuideRating = {
          guideUuid: guide.uuid,
          ratingUuid: v4(),
          createdAt: new Date().toISOString(),
          spaceId: space.id,
          userId: localStorage.getItem(UserIdKey)!,
        };

        setGuideRatings(newGuideRating);
        setShowRatingsModal(true);
      }
    }
  };

  const setStartRating = (rating: number) => {
    setGuideRatings({
      ...guideRatings!,
      startRating: rating,
    });
    localStorage.setItem(guideRatingsKey, JSON.stringify(guideRatings));
    setShowRatingsModal(false);
  };
  const skipInitialRating = () => {
    localStorage.setItem(guideRatingsKey, JSON.stringify(guideRatings));
    setShowRatingsModal(false);
  };

  const upsertRating = () => {
    upsertGuideRatingsMutation({
      variables: {
        spaceId: space.id,
        upsertGuideRatingInput: {
          ...guideRatings!,
        },
      },
    });
  };
  return {
    showRatingsModal,
    guideRatings,
    initialize,
    setStartRating,
    skipInitialRating,
    upsertRating,
  };
}
