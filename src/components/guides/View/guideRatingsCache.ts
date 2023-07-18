import { GuideRating } from '@/graphql/generated/generated-types';

const GUIDE_RATINGS = 'GUIDE-RATINGS-V1';
function getGuideRatings(guideUuid: string): GuideRating | undefined {
  const guideRatingsString = localStorage.getItem(GUIDE_RATINGS);
  if (guideRatingsString) {
    const guideRatings = JSON.parse(guideRatingsString);
    return guideRatings[guideUuid];
  }
}

function saveGuideRatings(guideUuid: string, guideRatings: GuideRating) {
  const guideRatingsString = localStorage.getItem(GUIDE_RATINGS);
  if (guideRatingsString) {
    const guideRatingsMap = JSON.parse(guideRatingsString);
    guideRatingsMap[guideUuid] = guideRatings;
    localStorage.setItem(GUIDE_RATINGS, JSON.stringify(guideRatingsMap));
  } else {
    const guideRatingsMap = {
      [guideUuid]: guideRatings,
    };
    localStorage.setItem(GUIDE_RATINGS, JSON.stringify(guideRatingsMap));
  }
}

export const guideRatingsCache = {
  getGuideRatings,
  saveGuideRatings,
};
