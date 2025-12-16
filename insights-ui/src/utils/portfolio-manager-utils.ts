import { PortfolioManagerType } from '@/types/portfolio-manager';

export function getListingPageByManagerType(managerType: string) {
  if (managerType === PortfolioManagerType.ProfessionalManager) {
    return { name: 'Professional Portfolio Managers', href: '/portfolio-managers/professional-managers', current: false };
  } else if (managerType === PortfolioManagerType.CollegeAmbassador) {
    return { name: 'College Ambassadors', href: '/portfolio-managers/college-ambassadors', current: false };
  } else if (managerType === PortfolioManagerType.TopRanked) {
    return { name: 'Top Ranked Portfolio Managers', href: '/portfolio-managers/top-ranked', current: false };
  }
  return { name: 'Portfolio Managers', href: '/portfolio-managers', current: false };
}
