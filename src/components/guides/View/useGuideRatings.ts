import { TempGuideSubmission } from '@/components/guides/View/TempGuideSubmission';
import { GuideFragment, GuideRating, GuideFeedback, Space, useUpsertGuideRatingsMutation } from '@/graphql/generated/generated-types';
import { UserIdKey } from '@/types/auth/User';
import { useState, useEffect } from 'react';
import { v4 } from 'uuid';

export type GuideRatingsHelper = {
  skipStartRating: () => void;
  skipEndRating: () => void;
  showStartRatingsModal: boolean;
  showEndRatingsModal: boolean;
  guideRatings: GuideRating | undefined;
  upsertRating: () => void;
  initialize: () => void;
  setStartRating: (rating: number) => void;
  setEndRating: (rating: number) => void;
  setGuideFeedback: (feedback: GuideFeedback) => void;
};

export function useGuideRatings(space: Space, guide: GuideFragment, guideSubmission: TempGuideSubmission): GuideRatingsHelper {
  const [showStartRatingsModal, setShowStartRatingsModal] = useState(false);
  const [showEndRatingsModal, setShowEndRatingsModal] = useState(false);
  const [guideRatings, setGuideRatings] = useState<GuideRating>();
  const [upsertGuideRatingsMutation] = useUpsertGuideRatingsMutation();

  useEffect(() => {
    if (guideRatings) {
      localStorage.setItem(guideRatingsKey, JSON.stringify(guideRatings));
    }
  }, [guideRatings]);

  const guideRatingsKey = `${space.id}-${guide.id}-guide-ratings`;

  useEffect(() => {
    if (guideSubmission.isSubmitted) {
      if (!guideRatings?.skipEndRating && !guideRatings?.endRating) {
        setShowEndRatingsModal(true);
      }
    }
  }, [guideSubmission]);

  function createNewRating(): GuideRating {
    return {
      guideUuid: guide.uuid,
      ratingUuid: v4(),
      createdAt: new Date().toISOString(),
      spaceId: space.id,
      userId: localStorage.getItem(UserIdKey)!,
      updatedAt: new Date().toISOString(),
    };
  }

  function getRatings(): GuideRating {
    return guideRatings || createNewRating();
  }

  const initialize = () => {
    if (space.guideSettings.captureBeforeAndAfterRating) {
      const guideRatingsString = localStorage.getItem(guideRatingsKey);
      if (guideRatingsString) {
        const ratings = JSON.parse(guideRatingsString) as GuideRating;
        setGuideRatings(ratings);
        if (!ratings.skipStartRating && !ratings.startRating) {
          setShowStartRatingsModal(true);
        }
      } else {
        const newGuideRating: GuideRating = createNewRating();

        setGuideRatings(newGuideRating);
        setShowStartRatingsModal(true);
      }
    }
  };

  const setStartRating = (rating: number) => {
    const updatedGuideRatings = {
      ...guideRatings!,
      startRating: rating,
    };
    setGuideRatings(updatedGuideRatings);
    localStorage.setItem(guideRatingsKey, JSON.stringify(updatedGuideRatings));
    setShowStartRatingsModal(false);
    upsertRating();
  };

  const setEndRating = (rating: number) => {
    const updatedGuideRatings = {
      ...guideRatings!,
      endRating: rating,
    };
    setGuideRatings(updatedGuideRatings);
    localStorage.setItem(guideRatingsKey, JSON.stringify(updatedGuideRatings));
    upsertRating();
  };

  const skipStartRating = () => {
    const rating: GuideRating = { ...getRatings(), skipStartRating: true };
    setGuideRatings(rating);
    localStorage.setItem(guideRatingsKey, JSON.stringify(rating));
    setShowStartRatingsModal(false);
    upsertRating();
  };

  const skipEndRating = () => {
    const rating: GuideRating = { ...getRatings(), skipEndRating: true };
    setGuideRatings(rating);
    localStorage.setItem(guideRatingsKey, JSON.stringify(rating));
    setShowStartRatingsModal(false);
    upsertRating();
  };

  const setGuideFeedback = (feedback: GuideFeedback) => {
    const existingGuideRatings = getRatings();
    if ((guideRatings?.endRating || 5) < 3) {
      existingGuideRatings.negativeFeedback = feedback;
      existingGuideRatings.positiveFeedback = null;
    } else {
      existingGuideRatings.negativeFeedback = null;
      existingGuideRatings.positiveFeedback = feedback;
    }
    setGuideRatings(existingGuideRatings);
    localStorage.setItem(guideRatingsKey, JSON.stringify(existingGuideRatings));
    setShowEndRatingsModal(false);
    upsertRating();
  };

  const upsertRating = () => {
    if (!guideRatings) {
      throw new Error('Guide ratings not set');
    }
    upsertGuideRatingsMutation({
      variables: {
        spaceId: space.id,
        upsertGuideRatingInput: {
          endRating: guideRatings.endRating,
          guideUuid: guideRatings.guideUuid,
          negativeFeedback: guideRatings.negativeFeedback,
          positiveFeedback: guideRatings.positiveFeedback,
          ratingUuid: guideRatings.ratingUuid,
          skipEndRating: guideRatings.skipEndRating,
          skipStartRating: guideRatings.skipStartRating,
          spaceId: guideRatings.spaceId,
          startRating: guideRatings.startRating,
          userId: guideRatings.userId,
        },
      },
    });
  };

  return {
    showStartRatingsModal,
    showEndRatingsModal,
    guideRatings,
    initialize,
    setStartRating,
    setEndRating,
    skipStartRating,
    skipEndRating,
    upsertRating,
    setGuideFeedback: setGuideFeedback,
  };
}
