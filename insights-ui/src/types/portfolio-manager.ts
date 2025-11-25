export enum PortfolioManagerType {
  MostFamous = 'MostFamous',
  CollegeAmbassador = 'CollegeAmbassador',
}

export const PORTFOLIO_MANAGER_TYPE_LABELS: Record<PortfolioManagerType, string> = {
  [PortfolioManagerType.MostFamous]: 'Most Famous',
  [PortfolioManagerType.CollegeAmbassador]: 'College Ambassador',
};
