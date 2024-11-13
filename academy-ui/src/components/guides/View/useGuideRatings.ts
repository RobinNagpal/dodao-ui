import { TempGuideSubmission } from '@/components/guides/View/TempGuideSubmission';
import { GuideFeedback, GuideFragment, GuideRating, useUpsertGuideRatingsMutation } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { UserIdKey } from '@dodao/web-core/types/auth/User';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useEffect, useState } from 'react';
import { v4 } from 'uuid';

export type GuideRatingsHelper = {
  skipGuideRating: () => void;
  showEndRatingsModal: boolean;
  setShowEndRatingsModal: (show: boolean) => void;
  setGuideRating: (rating: number, feedback?: GuideFeedback) => Promise<void>;
};

export function useGuideRatings(space: SpaceWithIntegrationsDto, guide: GuideFragment, guideSubmission: TempGuideSubmission): GuideRatingsHelper {
  const [showEndRatingsModal, setShowEndRatingsModal] = useState(false);
  const [upsertGuideRatingsMutation] = useUpsertGuideRatingsMutation();
  const [shownGuideRatingsModal, setShownGuideRatingsModal] = useState(false);

  useEffect(() => {
    if (guideSubmission.isSubmitted && !shownGuideRatingsModal) {
      setShownGuideRatingsModal(true);
      setShowEndRatingsModal(true);
    }
  }, [guideSubmission]);

  const setGuideRating = async (rating: number, feedback?: GuideFeedback) => {
    const guideRating: GuideRating = {
      guideUuid: guide.uuid,
      negativeFeedback: null,
      positiveFeedback: null,
      ratingUuid: v4(),
      skipEndRating: false,
      skipStartRating: true,
      spaceId: space.id,
      startRating: null,
      userId: localStorage.getItem(UserIdKey)!,
      endRating: rating,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (feedback) {
      if ((rating || 5) < 3) {
        guideRating.negativeFeedback = feedback;
        guideRating.positiveFeedback = null;
      } else {
        guideRating.negativeFeedback = null;
        guideRating.positiveFeedback = feedback;
      }
    }

    await fetch(`${getBaseUrl()}/api/guide/upsert-guide-rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spaceId: space.id,
        upsertGuideRatingInput: {
          endRating: guideRating.endRating,
          guideUuid: guideRating.guideUuid,
          negativeFeedback: guideRating.negativeFeedback,
          positiveFeedback: guideRating.positiveFeedback,
          ratingUuid: guideRating.ratingUuid,
          skipEndRating: guideRating.skipEndRating,
          skipStartRating: guideRating.skipStartRating,
          spaceId: guideRating.spaceId,
          startRating: guideRating.startRating,
          userId: guideRating.userId,
        },
      }),
    });
  };

  const skipGuideRating = async () => {
    await fetch('/api/guide/upsert-guide-rating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spaceId: space.id,
        upsertGuideRatingInput: {
          endRating: null,
          guideUuid: guide.uuid,
          negativeFeedback: null,
          positiveFeedback: null,
          ratingUuid: v4(),
          skipEndRating: true,
          skipStartRating: true,
          spaceId: space.id,
          startRating: null,
          userId: localStorage.getItem(UserIdKey)!,
        },
      }),
    });
    setShowEndRatingsModal(false);
  };

  return {
    showEndRatingsModal,
    setShowEndRatingsModal,
    setGuideRating,
    skipGuideRating,
  };
}
