import { GuideFragment, GuideRating, GuideFeedback, Space, useUpsertGuideRatingsMutation } from '@/graphql/generated/generated-types';
import { UserIdKey } from '@/types/auth/User';
import { useState, useEffect } from 'react';
import { v4 } from 'uuid';

export type GuideRatingsHelper = {
  skipInitialRating: () => void;
  skipFinalRating: () => void;
  showRatingsModal: boolean;
  guideRatings: GuideRating | undefined;
  upsertRating: () => void;
  initialize: () => void;
  setStartRating: (rating: number) => void;
  setFinalRating: (rating: number) => void;
  setFeedback: (feedback: GuideFeedback) => void; // New function to set feedback
  guideSuccess: boolean | null;
  showFeedBackModal: boolean;
  feedbackSubmitted: boolean;
};

export function useGuideRatings(space: Space, guide: GuideFragment): GuideRatingsHelper {
  const [showRatingsModal, setShowRatingsModal] = useState(false);
  const [guideRatings, setGuideRatings] = useState<GuideRating>();
  const [upsertGuideRatingsMutation] = useUpsertGuideRatingsMutation();

  const [showFeedBackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    calculateSuccess();
  }, [guideRatings]);

  useEffect(() => {
    if (guideRatings) {
      localStorage.setItem(guideRatingsKey, JSON.stringify(guideRatings));
    }
  }, [guideRatings]);

  const guideRatingsKey = `${space.id}-${guide.id}-guide-ratings`;

  const initialize = () => {
    if (space.guideSettings.captureBeforeAndAfterRating) {
      const guideRatingsString = localStorage.getItem(guideRatingsKey);
      if (guideRatingsString) {
        setGuideRatings(JSON.parse(guideRatingsString));

        setShowRatingsModal(true);
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
  const [guideSuccess, setGuideSuccess] = useState<boolean | null>(null);

  const setStartRating = (rating: number) => {
    const updatedGuideRatings = {
      ...guideRatings!,
      startRating: rating,
    };
    setGuideRatings(updatedGuideRatings);
    localStorage.setItem(guideRatingsKey, JSON.stringify(updatedGuideRatings));

    setShowRatingsModal(false);
  };

  const calculateSuccess = () => {
    if (
      guideRatings &&
      guideRatings.startRating !== null &&
      guideRatings.endRating !== null &&
      guideRatings.startRating !== undefined &&
      guideRatings.endRating !== undefined
    ) {
      if (guideRatings.endRating - guideRatings.startRating > 0) {
        setGuideSuccess(true);
      } else {
        setGuideSuccess(false);
      }
    } else {
      setGuideSuccess(false);
    }
  };

  const setFinalRating = (rating: number) => {
    const updatedGuideRatings = {
      ...guideRatings!,
      endRating: rating,
    };
    setGuideRatings(updatedGuideRatings);
    localStorage.setItem(guideRatingsKey, JSON.stringify(updatedGuideRatings));
    calculateSuccess();
    setShowFeedbackModal(true);
  };

  const skipInitialRating = () => {
    localStorage.setItem(guideRatingsKey, JSON.stringify(guideRatings));
    setGuideRatings(undefined);
    setShowRatingsModal(false);
  };

  const skipFinalRating = () => {
    localStorage.setItem(guideRatingsKey, JSON.stringify(guideRatings));
    setShowRatingsModal(false);
  };

  const setFeedback = (feedback: GuideFeedback) => {
    if (guideSuccess) {
      const updatedGuideRatings: GuideRating = {
        ...guideRatings!,
        positiveFeedback: feedback,
        negativeFeedback: null,
        submitted: true,
      };
      setGuideRatings(updatedGuideRatings);
      localStorage.setItem(guideRatingsKey, JSON.stringify(updatedGuideRatings));
    } else {
      const updatedGuideRatings = {
        ...guideRatings!,
        negativeFeedback: feedback,
        positiveFeedback: null,
        submitted: true,
      };

      setGuideRatings(updatedGuideRatings);
      localStorage.setItem(guideRatingsKey, JSON.stringify(updatedGuideRatings));
      console.log(updatedGuideRatings, '\n');
    }
    setShowFeedbackModal(false);
    setFeedbackSubmitted(true);
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
    setFinalRating,
    skipInitialRating,
    skipFinalRating,
    upsertRating,
    setFeedback,
    guideSuccess,
    feedbackSubmitted,
    showFeedBackModal: showFeedBackModal && !feedbackSubmitted, // Hide feedback modal after submission
  };
}
