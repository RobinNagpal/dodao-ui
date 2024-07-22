import { ConsolidatedByteRating } from '@/graphql/generated/generated-types';
import { ByteRating } from '@prisma/client';

export function consolidateByteRatings(ratings: Array<Pick<ByteRating, 'rating' | 'positiveFeedback' | 'negativeFeedback'>>) {
  if (ratings.length > 0) {
    const totalRatings = ratings.length;
    let totalRatingSum = 0;

    const positiveCount = { ux: 0, content: 0 };
    const negativeCount = { ux: 0, content: 0 };

    let positiveFeedbackCount = 0;
    let negativeFeedbackCount = 0;
    let ratingFeedbackCount = 0;

    for (const rating of ratings) {
      if (rating.rating !== null) {
        totalRatingSum += rating.rating;
        ratingFeedbackCount++;
      }

      if (rating.positiveFeedback?.ux) positiveCount.ux += 1;
      if (rating.positiveFeedback?.content) positiveCount.content += 1;

      // Counting positive feedbacks (at least one true value)
      if (rating.positiveFeedback?.ux || rating.positiveFeedback?.content) {
        positiveFeedbackCount++;
      }

      if (rating.negativeFeedback?.ux) negativeCount.ux += 1;
      if (rating.negativeFeedback?.content) negativeCount.content += 1;

      // Counting negative feedbacks (at least one true value)
      if (rating.negativeFeedback?.ux || rating.negativeFeedback?.content) {
        negativeFeedbackCount++;
      }
    }

    const avgRating = totalRatingSum / totalRatings;

    const consolidatedByteRating: ConsolidatedByteRating = {
      avgRating,
      positiveRatingDistribution: {
        ux: (positiveCount.ux / positiveFeedbackCount) * 100,
        content: (positiveCount.content / positiveFeedbackCount) * 100,
      },
      negativeRatingDistribution: {
        ux: negativeFeedbackCount > 0 ? (negativeCount.ux / negativeFeedbackCount) * 100 : 0,
        content: negativeFeedbackCount > 0 ? (negativeCount.content / negativeFeedbackCount) * 100 : 0,
      },
      positiveFeedbackCount: positiveFeedbackCount || 0,
      negativeFeedbackCount: negativeFeedbackCount || 0,
      ratingFeedbackCount: ratingFeedbackCount || 0,
    };
    return consolidatedByteRating;
  } else {
    return undefined;
  }
}
