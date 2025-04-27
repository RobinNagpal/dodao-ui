export interface TariffIndustryDefinition {
  name: string;
  industryId: string;
  headingsCount: number;
  subHeadingsCount: number;
  establishedPlayersCount: number;
  newChallengersCount: number;
}

export const TariffIndustries: Record<string, TariffIndustryDefinition> = {
  Plastics: {
    name: 'Plastics',
    industryId: 'plastic',
    headingsCount: 4,
    subHeadingsCount: 3,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
  },
  Toys: {
    name: 'Toys',
    industryId: 'toys',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
  },
  Aluminium: {
    name: 'Aluminium',
    industryId: 'aluminium',
    headingsCount: 4,
    subHeadingsCount: 3,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
  },
};

export function getNumberOfHeadings(industryId: string): number {
  const industryDefinition = Object.entries(TariffIndustries).find((k, v) => {
    return k[1].industryId === industryId;
  });
  if (!industryDefinition) {
    throw new Error(`Industry ${industryId} not found`);
  }

  return industryDefinition[1].headingsCount;
}

export function getNumberOfSubHeadings(industryId: string): number {
  const industryDefinition = Object.entries(TariffIndustries).find((k, v) => {
    return k[1].industryId === industryId;
  });
  if (!industryDefinition) {
    throw new Error(`Industry ${industryId} not found`);
  }

  return industryDefinition[1].subHeadingsCount;
}
