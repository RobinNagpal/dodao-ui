export enum TariffIndustryId {
  plastic = 'plastic',
  toys = 'toys',
  aluminium = 'aluminium',
  automobiles = 'automobiles',
  apparelandaccessories = 'apparelandaccessories',
}

export interface TariffIndustryDefinition {
  name: string;
  industryId: TariffIndustryId;
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
    industryId: TariffIndustryId.plastic,
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
    industryId: TariffIndustryId.toys,
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
    industryId: TariffIndustryId.aluminium,
    reportTitle: 'Impact of Tariffs on Aluminium Industry',
    reportOneLiner: 'An in-depth analysis of how tariffs affect the aluminium industry, including market dynamics and competitive landscape.',
    updatedAt: 'May 1, 2025',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
  },
  Automobiles: {
    name: 'Automobiles',
    industryId: TariffIndustryId.automobiles,
    reportTitle: 'Impact of Tariffs on Automobile Industry',
    reportOneLiner: 'A comprehensive overview of how tariffs impact the automobile industry, focusing on supply chain changes and cost structures.',
    updatedAt: 'May 1, 2025',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [
      'Canoo Inc. (GOEVQ)',
      'Arrival SA (ARVL)',
      'Lordstown Motors Corp. (RIDE)',
      'Faraday Future Intelligent Electric Inc. (FFAI)',
      'Fisker Inc. (FSR)',
      'Workhorse Group Inc. (Ticker: WKHS)',
      'Hyzon Motors Inc. (Ticker: HYZN)',
      'Nikola Corporation (Ticker: NKLA)',
      'Proterra Inc. (Ticker: PTRA)',
      'Lightning eMotors, Inc. (Ticker: ZEV)',
      'ElectraMeccanica Vehicles Corp. (Ticker: SOLO)',
      'Slate Auto (Ticker: SLTE)',
    ],
  },
  ApparelAndAccessories: {
    name: 'Apparel & Accessories',
    industryId: TariffIndustryId.apparelandaccessories,
    reportTitle: 'Impact of Tariffs on Apparel & Accessories',
    reportOneLiner: 'Analysis of tariff changes affecting apparel & accessories trade.',
    updatedAt: 'July 14, 2025',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
  },
};

export function getNumberOfHeadings(industryId: TariffIndustryId): number {
  return getTariffIndustryDefinitionById(industryId).headingsCount;
}

export function getNumberOfSubHeadings(industryId: TariffIndustryId): number {
  return getTariffIndustryDefinitionById(industryId).subHeadingsCount;
}

export function getTariffIndustryDefinitionById(industryId: TariffIndustryId): TariffIndustryDefinition {
  const industryDefinition = Object.entries(TariffIndustries).find((k, v) => {
    return k[1].industryId === industryId.toLowerCase();
  });
  if (!industryDefinition) {
    throw new Error(`Industry ${industryId} not found`);
  }

  return industryDefinition[1];
}

export function fetchTariffReports(): TariffIndustryDefinition[] {
  return [getTariffIndustryDefinitionById(TariffIndustryId.plastic), getTariffIndustryDefinitionById(TariffIndustryId.automobiles)];
}
