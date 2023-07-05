import { GuideFragment, GuideRating, Space } from '@/graphql/generated/generated-types';
import { UserIdKey } from '@/types/auth/User';
import { useState } from 'react';
import { v4 } from 'uuid';

export type GuideRatingsHelper = {
  showRatingsModal: boolean;
  guideRatings: GuideRating | undefined;
  initialize: () => void;
};

export function useGuideRatings(space: Space, guide: GuideFragment): GuideRatingsHelper {
  const [showRatingsModal, setShowRatingsModal] = useState(false);
  const [guideRatings, setGuideRatings] = useState<GuideRating>();

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
        localStorage.setItem(guideRatingsKey, JSON.stringify(newGuideRating));

        setShowRatingsModal(true);
      }
    }
  };

  return {
    showRatingsModal,
    guideRatings,
    initialize,
  };
}
