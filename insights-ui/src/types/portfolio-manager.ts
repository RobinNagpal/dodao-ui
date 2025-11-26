export enum PortfolioManagerType {
  TopRanked = 'TopRanked',
  ProfessionalManager = 'ProfessionalManager',
  CollegeAmbassador = 'CollegeAmbassador',
}

export const PORTFOLIO_MANAGER_TYPE_LABELS: Record<PortfolioManagerType, string> = {
  [PortfolioManagerType.TopRanked]: 'Top Famous',
  [PortfolioManagerType.ProfessionalManager]: 'Professional Manager',
  [PortfolioManagerType.CollegeAmbassador]: 'College Ambassador',
};
