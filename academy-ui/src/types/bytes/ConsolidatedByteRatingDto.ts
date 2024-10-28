export interface ByteRatingDistribution {
  content: number;
  ux: number;
}

export interface ConsolidatedByteRatingDto {
  avgRating: number;
  negativeFeedbackCount: number;
  negativeRatingDistribution: ByteRatingDistribution;
  positiveFeedbackCount: number;
  positiveRatingDistribution: ByteRatingDistribution;
  ratingFeedbackCount: number;
}
