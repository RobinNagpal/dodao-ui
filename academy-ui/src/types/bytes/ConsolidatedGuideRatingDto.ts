export interface GuideRatingDistribution {
  content: number;
  ux: number;
  questions: number;
}

export interface ConsolidatedGuideRatingDto {
  avgRating: number;
  endRatingFeedbackCount: number;
  negativeFeedbackCount: number;
  negativeRatingDistribution: GuideRatingDistribution;
  positiveFeedbackCount: number;
  positiveRatingDistribution: GuideRatingDistribution;
}
