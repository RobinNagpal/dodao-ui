import { TariffIndustryId, getNumberOfHeadings, getNumberOfSubHeadings } from '@/scripts/industry-tariff-reports/tariff-industries';

export interface NavigationIndices {
  hasPrevious: boolean;
  hasNext: boolean;
  prevHeadingIndex?: number;
  prevSubHeadingIndex?: number;
  nextHeadingIndex?: number;
  nextSubHeadingIndex?: number;
  currentPosition: number;
  totalPositions: number;
}

export function getPreviousNextIndices(industryId: TariffIndustryId, headingIndex: number, subHeadingIndex: number): NavigationIndices {
  const totalHeadings = getNumberOfHeadings(industryId);
  const totalSubHeadings = getNumberOfSubHeadings(industryId);
  const currentPosition = headingIndex * totalSubHeadings + subHeadingIndex;
  const totalPositions = totalHeadings * totalSubHeadings;

  // Calculate previous position
  const hasPrevious = currentPosition > 0;
  let prevHeadingIndex, prevSubHeadingIndex;
  if (hasPrevious) {
    const prevPosition = currentPosition - 1;
    prevHeadingIndex = Math.floor(prevPosition / totalSubHeadings);
    prevSubHeadingIndex = prevPosition % totalSubHeadings;
  }

  // Calculate next position
  const hasNext = currentPosition < totalPositions - 1;
  let nextHeadingIndex, nextSubHeadingIndex;
  if (hasNext) {
    const nextPosition = currentPosition + 1;
    nextHeadingIndex = Math.floor(nextPosition / totalSubHeadings);
    nextSubHeadingIndex = nextPosition % totalSubHeadings;
  }

  return {
    hasPrevious,
    hasNext,
    prevHeadingIndex,
    prevSubHeadingIndex,
    nextHeadingIndex,
    nextSubHeadingIndex,
    currentPosition,
    totalPositions,
  };
}
