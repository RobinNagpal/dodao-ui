export interface TariffIndustryDefinition {
  name: string;
  industryId: string;
  reportTitle: string;
  reportOneLiner: string;
  updatedAt: string;
  headingsCount: number;
  subHeadingsCount: number;
  establishedPlayersCount: number;
  newChallengersCount: number;
  companiesToIgnore: string[];
}

export const TariffIndustries: Record<string, TariffIndustryDefinition> = {
  Plastics: {
    name: 'Plastics',
    industryId: 'plastic',
    reportTitle: 'Impact of Tariffs on Plastic Industry',
    reportOneLiner: 'A comprehensive analysis of how tariffs affect the plastic industry, including supply chain disruptions and cost implications.',
    updatedAt: 'May 1, 2025',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: ['Pactiv Evergreen Inc', 'Danimer Scientific(DNMR)', 'Zymergen Inc (ZY)', 'Amyris, Inc.'],
  },
  Toys: {
    name: 'Toys',
    industryId: 'toys',
    reportTitle: 'Impact of Tariffs on Toy Industry',
    reportOneLiner: 'A detailed examination of how tariffs influence the toy industry, including shifts in manufacturing and pricing strategies.',
    updatedAt: 'May 1, 2025',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
  },
  Aluminium: {
    name: 'Aluminium',
    industryId: 'aluminium',
    reportTitle: 'Impact of Tariffs on Aluminium Industry',
    reportOneLiner: 'An in-depth analysis of how tariffs affect the aluminium industry, including market dynamics and competitive landscape.',
    updatedAt: 'May 1, 2025',
    headingsCount: 4,
    subHeadingsCount: 3,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
  },
  Automobiles: {
    name: 'Automobiles',
    industryId: 'automobiles',
    reportTitle: 'Impact of Tariffs on Automobile Industry',
    reportOneLiner: 'A comprehensive overview of how tariffs impact the automobile industry, focusing on supply chain changes and cost structures.',
    updatedAt: 'May 1, 2025',
    headingsCount: 4,
    subHeadingsCount: 3,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
  },
};

export function getNumberOfHeadings(industryId: string): number {
  return getDefinitionByIndustryId(industryId).headingsCount;
}

export function getNumberOfSubHeadings(industryId: string): number {
  return getDefinitionByIndustryId(industryId).subHeadingsCount;
}

export function getDefinitionByIndustryId(industryId: string): TariffIndustryDefinition {
  const industryDefinition = Object.entries(TariffIndustries).find((k, v) => {
    return k[1].industryId === industryId.toLowerCase();
  });
  if (!industryDefinition) {
    throw new Error(`Industry ${industryId} not found`);
  }

  return industryDefinition[1];
}

export interface TariffReport {
  industryId: string;
  title: string;
  oneLiner: string;
  updatedAt: string;
}

export function fetchTariffReports(): TariffIndustryDefinition[] {
  return [getDefinitionByIndustryId('plastic')];
}
