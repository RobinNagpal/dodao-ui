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
  UNKNOWN = 'unknown',
  NOT_APPLICABLE = 'not_applicable',
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
    case AnalysisResult.UNKNOWN:
      textColorClass = 'text-gray-400';
      bgColorClass = 'bg-gray-400';
      displayLabel = 'Unknown';
      break;
    case AnalysisResult.NOT_APPLICABLE:
      textColorClass = 'text-slate-500';
      bgColorClass = 'bg-slate-500';
      displayLabel = 'Not Applicable';
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

/**
 * Get color classes and label for an ETF score.
 *
 * ETF final scores sum four category scores (0–5 each) for a 0–20 range.
 * Thresholds are scaled proportionally to the 0–25 stock thresholds:
 *   stocks <8/<14/<20/>=20  →  etfs <6/<11/<16/>=16.
 *
 * Returns gray for `null` (no report yet) so the badge still renders.
 */
export function getEtfScoreColorClasses(score: number | null) {
  if (score === null) {
    return { textColorClass: 'text-gray-400', bgColorClass: 'bg-gray-500', scoreLabel: 'Unknown' };
  }

  let textColorClass = 'text-green-500';
  let bgColorClass = 'bg-green-500';
  let scoreLabel = 'Excellent';

  if (score < 6) {
    textColorClass = 'text-red-500';
    bgColorClass = 'bg-red-500';
    scoreLabel = 'Poor';
  } else if (score < 11) {
    textColorClass = 'text-orange-500';
    bgColorClass = 'bg-orange-500';
    scoreLabel = 'Fair';
  } else if (score < 16) {
    textColorClass = 'text-yellow-500';
    bgColorClass = 'bg-yellow-500';
    scoreLabel = 'Good';
  }

  return { textColorClass, bgColorClass, scoreLabel };
}
