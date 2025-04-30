export interface TariffIndustryDefinition {
  name: string;
  industryId: string;
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
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: ['Pactiv Evergreen Inc', 'Danimer Scientific(DNMR)', 'Zymergen Inc (ZY)', 'Amyris, Inc.'],
  },
  Toys: {
    name: 'Toys',
    industryId: 'toys',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
  },
  Aluminium: {
    name: 'Aluminium',
    industryId: 'aluminium',
    headingsCount: 4,
    subHeadingsCount: 3,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
  },
  Automobiles: {
    name: 'Automobiles',
    industryId: 'automobiles',
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
