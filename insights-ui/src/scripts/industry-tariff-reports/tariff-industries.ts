export enum TariffIndustryId {
  plastic = 'plastic',
  automobiles = 'automobiles',
  aluminium = 'aluminium',
  apparelandaccessories = 'apparelandaccessories',
  ironandsteel = 'ironandsteel',
  copper = 'copper',
  electricalcomponentsandequipment = 'electricalcomponentsandequipment',
  homefurnishings = 'homefurnishings',
  pharmaceuticals = 'pharmaceuticals',
  semiconductors = 'semiconductors',
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
  Aluminium: {
    name: 'Aluminium',
    industryId: TariffIndustryId.aluminium,
    reportTitle: 'Impact of Tariffs on Aluminium Industry',
    reportOneLiner: 'An in-depth analysis of how tariffs affect the aluminium industry, including market dynamics and competitive landscape.',
    updatedAt: 'June 18, 2025',
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
  IronAndSteel: {
    name: 'Iron & Steel',
    industryId: TariffIndustryId.ironandsteel,
    reportTitle: 'Impact of Tariffs on Iron & Steel Industry',
    reportOneLiner: 'An in-depth look at how tariffs are reshaping the iron & steel industry supply chains, costs, and competitiveness.',
    updatedAt: 'July 19, 2025',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
  },
  Copper: {
    name: 'Copper',
    industryId: TariffIndustryId.copper,
    reportTitle: 'Impact of Tariffs on Copper',
    reportOneLiner: 'An analysis of the newly announced 50% Section 232 tariffs on copper imports and their effects on supply chains and pricing.',
    updatedAt: 'July 22, 2025',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
  },
  ElectricalComponentsAndEquipment: {
    name: 'Electrical Components & Equipment',
    industryId: TariffIndustryId.electricalcomponentsandequipment,
    reportTitle: 'Impact of Tariffs on Electrical Components & Equipment',
    reportOneLiner: 'Analysis of how U.S. tariffs on imported electrical components and equipment affect supply chains, costs, and competitiveness.',
    updatedAt: 'July 23, 2025',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
  },
  HomeFurnishings: {
    name: 'Home Furnishings',
    industryId: TariffIndustryId.homefurnishings,
    reportTitle: 'Impact of Tariffs on Home Furnishings',
    reportOneLiner: 'A detailed look at the effects of import duties on home furniture, bedding, and related goods in the U.S. market.',
    updatedAt: 'July 24, 2025',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
  },
  Pharmaceuticals: {
    name: 'Pharmaceuticals',
    industryId: TariffIndustryId.pharmaceuticals,
    reportTitle: 'Impact of Tariffs on Pharmaceuticals',
    reportOneLiner: 'Analysis of how U.S. tariffs on imported pharmaceutical products and APIs affect drug pricing and supply chains.',
    updatedAt: 'July 25, 2025',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
  },
  Semiconductors: {
    name: 'Semiconductors & Equipment',
    industryId: TariffIndustryId.semiconductors,
    reportTitle: 'Impact of Tariffs on Semiconductors & Equipment',
    reportOneLiner:
      'Analysis of Section 301 duties on semiconductor imports especially Chinese-made chips and their ripple effects on global supply chains and domestic manufacturing incentives.',
    updatedAt: 'August 1, 2025',
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
  return Object.values(TariffIndustryId).map((industryId) => getTariffIndustryDefinitionById(industryId));
}

export interface HeadingSubheadingCombination {
  headingIndex: number;
  subHeadingIndex: number;
  displayName: string;
}

export function getAllHeadingSubheadingCombinations(industryId: TariffIndustryId): HeadingSubheadingCombination[] {
  const industry = getTariffIndustryDefinitionById(industryId);
  const combinations: HeadingSubheadingCombination[] = [];

  for (let headingIndex = 0; headingIndex < industry.headingsCount; headingIndex++) {
    for (let subHeadingIndex = 0; subHeadingIndex < industry.subHeadingsCount; subHeadingIndex++) {
      combinations.push({
        headingIndex,
        subHeadingIndex,
        displayName: `Evaluate Industry Area ${headingIndex}_${subHeadingIndex}`,
      });
    }
  }

  return combinations;
}
