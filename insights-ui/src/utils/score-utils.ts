/**
 * Utility functions for handling score display and styling
 */

/**
 * Get color classes and label for a score
 * @param score - The score value (out of 25)
 * @returns Object containing text color class, background color class, and score label
 */
export function getScoreColorClasses(score: number) {
  let textColorClass = 'text-green-500'; // Default: Green for 15+
  let bgColorClass = 'bg-green-500'; // Default: Green for 15+
  let scoreLabel = 'Excellent';

  if (score < 8) {
    textColorClass = 'text-red-500'; // Red for < 5
    bgColorClass = 'bg-red-500'; // Red for < 5
    scoreLabel = 'Poor';
  } else if (score < 14) {
    textColorClass = 'text-orange-500'; // Orange for 5-9
    bgColorClass = 'bg-orange-500'; // Orange for 5-9
    scoreLabel = 'Fair';
  } else if (score < 20) {
    textColorClass = 'text-yellow-500'; // Yellow for 10-14
    bgColorClass = 'bg-yellow-500'; // Yellow for 10-14
    scoreLabel = 'Good';
  }

  return { textColorClass, bgColorClass, scoreLabel };
}
