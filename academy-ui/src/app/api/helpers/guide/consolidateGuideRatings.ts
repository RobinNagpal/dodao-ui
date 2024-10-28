import { ConsolidatedGuideRatingDto } from '@/types/bytes/ConsolidatedGuideRatingDto';
import { GuideRating } from '@prisma/client';

export function consolidateGuideRatings(
  ratings: Pick<GuideRating, 'endRating' | 'positiveFeedback' | 'negativeFeedback'>[]
): ConsolidatedGuideRatingDto | undefined {
  if (ratings.length > 0) {
    const totalRatings = ratings.length;
    let totalRatingSum = 0;

    const positiveCount = { ux: 0, content: 0, questions: 0 };
    const negativeCount = { ux: 0, content: 0, questions: 0 };

    let positiveFeedbackCount = 0;
    let negativeFeedbackCount = 0;
    let endRatingFeedbackCount = 0;

    for (const rating of ratings) {
      if (rating.endRating !== null) {
        totalRatingSum += rating.endRating;
        endRatingFeedbackCount++;
      }

      if (rating.positiveFeedback?.ux) positiveCount.ux += 1;
      if (rating.positiveFeedback?.content) positiveCount.content += 1;
      if (rating.positiveFeedback?.questions) positiveCount.questions += 1;

      // Counting positive feedbacks (at least one true value)
      if (rating.positiveFeedback?.ux || rating.positiveFeedback?.content || rating.positiveFeedback?.questions) {
        positiveFeedbackCount++;
      }

      if (rating.negativeFeedback?.ux) negativeCount.ux += 1;
      if (rating.negativeFeedback?.content) negativeCount.content += 1;
      if (rating.negativeFeedback?.questions) negativeCount.questions += 1;

      // Counting negative feedbacks (at least one true value)
      if (rating.negativeFeedback?.ux || rating.negativeFeedback?.content || rating.negativeFeedback?.questions) {
        negativeFeedbackCount++;
      }
    }

    const avgRating = totalRatingSum / totalRatings;

    const consolidatedRatings: ConsolidatedGuideRatingDto = {
      avgRating,
      positiveRatingDistribution: {
        ux: (positiveCount.ux / positiveFeedbackCount) * 100,
        content: (positiveCount.content / positiveFeedbackCount) * 100,
        questions: (positiveCount.questions / positiveFeedbackCount) * 100,
      },
      negativeRatingDistribution: {
        ux: negativeFeedbackCount > 0 ? (negativeCount.ux / negativeFeedbackCount) * 100 : 0,
        content: negativeFeedbackCount > 0 ? (negativeCount.content / negativeFeedbackCount) * 100 : 0,
        questions: negativeFeedbackCount > 0 ? (negativeCount.questions / negativeFeedbackCount) * 100 : 0,
      },
      positiveFeedbackCount: positiveFeedbackCount || 0,
      negativeFeedbackCount: negativeFeedbackCount || 0,
      endRatingFeedbackCount: endRatingFeedbackCount || 0,
    };
    return consolidatedRatings;
  } else {
    return {
      avgRating: 0,
      positiveRatingDistribution: {
        ux: 0,
        content: 0,
        questions: 0,
      },
      negativeRatingDistribution: {
        ux: 0,
        content: 0,
        questions: 0,
      },
      positiveFeedbackCount: 0,
      negativeFeedbackCount: 0,
      endRatingFeedbackCount: 0,
    };
  }
}
