/**
 * Utility functions for handling score display and styling
 */

/**
 * Analysis result types
 */
export enum AnalysisResult {
  POOR = 'poor',
  FAIR = 'fair',
  GOOD = 'good',
  EXCELLENT = 'excellent',
}

/**
 * Get color classes and label for an analysis result
 * @param result - The analysis result enum value
 * @returns Object containing text color class, background color class, and display label
 */
export function getAnalysisResultColorClasses(result: string | null | undefined) {
  let textColorClass = 'text-gray-500';
  let bgColorClass = 'bg-gray-500';
  let displayLabel = 'N/A';

  switch (result) {
    case AnalysisResult.POOR:
      textColorClass = 'text-red-500';
      bgColorClass = 'bg-red-500';
      displayLabel = 'Poor';
      break;
    case AnalysisResult.FAIR:
      textColorClass = 'text-orange-500';
      bgColorClass = 'bg-orange-500';
      displayLabel = 'Fair';
      break;
    case AnalysisResult.GOOD:
      textColorClass = 'text-yellow-500';
      bgColorClass = 'bg-yellow-500';
      displayLabel = 'Good';
      break;
    case AnalysisResult.EXCELLENT:
      textColorClass = 'text-green-500';
      bgColorClass = 'bg-green-500';
      displayLabel = 'Excellent';
      break;
  }

  return { textColorClass, bgColorClass, displayLabel };
}

/**
 * Get color classes and label for a score
 * @param score - The score value (out of 25)
 * @returns Object containing text color class, background color class, and score label
 */
export function getScoreColorClasses(score: number) {
  let textColorClass = 'text-green-500'; // Default: Green for 20+
  let bgColorClass = 'bg-green-500'; // Default: Green for 20+
  let scoreLabel = 'Excellent';

  if (score < 8) {
    textColorClass = 'text-red-500'; // Red for < 8
    bgColorClass = 'bg-red-500'; // Red for < 8
    scoreLabel = 'Poor';
  } else if (score < 14) {
    textColorClass = 'text-orange-500'; // Orange for 8-14
    bgColorClass = 'bg-orange-500'; // Orange for 8-14
    scoreLabel = 'Fair';
  } else if (score < 20) {
    textColorClass = 'text-yellow-500'; // Yellow for 14-19
    bgColorClass = 'bg-yellow-500'; // Yellow for 14-19
    scoreLabel = 'Good';
  }

  return { textColorClass, bgColorClass, scoreLabel };
}
