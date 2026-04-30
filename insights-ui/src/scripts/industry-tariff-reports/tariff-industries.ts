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
  agriculturalProductsAndServices = 'agriculturalProductsAndServices',
  packagedFoodsAndMeats = 'packagedFoodsAndMeats',
  forestProducts = 'forestProducts',
  tobacco = 'tobacco',
  constructionMaterials = 'constructionMaterials',
  diversifiedMetalsAndMining = 'diversifiedMetalsAndMining',
  oilAndGasRefiningAndMarketing = 'oilAndGasRefiningAndMarketing',
  commodityChemicals = 'commodity-chemicals',
  specialtyChemicals = 'specialtyChemicals',
  fertilizersAndAgriculturalChemicals = 'fertilizers-and-agricultural-chemicals',
  industrialGases = 'industrial-gases',
  diversifiedChemicals = 'diversified-chemicals',
  metalGlassPlasticContainers = 'metal-glass-plastic-containers',
  paperPlasticPackagingProductsAndMaterials = 'paper-plastic-packaging-products-and-materials',
  paperProducts = 'paper-products',
  consumerElectronics = 'consumerElectronics',
  householdAppliances = 'household-appliances',
  leisureProducts = 'leisureProducts',
  footwear = 'footwear',
  textiles = 'textiles',
  brewers = 'brewers',
  distillersAndVintners = 'distillers-and-vintners',
  softDrinksAndNonAlcoholicBeverages = 'soft-drinks-and-non-alcoholic-beverages',
  commercialPrinting = 'commercial-printing',
  heavyElectricalEquipment = 'heavy-electrical-equipment',
  industrialMachineryAndSupplies = 'industrial-machinery-and-supplies',
  aerospaceAndDefense = 'aerospace-and-defense',
  constructionMachineryAndHeavyTransportationEquipment = 'construction-machinery-and-heavy-transportation-equipment',
  healthCareEquipment = 'health-care-equipment',
  housewaresAndSpecialties = 'housewares-and-specialties',
  tiresAndRubber = 'tires-and-rubber',
}

export const DEFAULT_HEADINGS_COUNT = 3;
export const DEFAULT_SUB_HEADINGS_COUNT = 2;

export interface TariffIndustryDefinition {
  name: string;
  industryId: TariffIndustryId;
  reportTitle: string;
  reportOneLiner: string;
  headingsCount?: number;
  subHeadingsCount?: number;
  companiesToIgnore?: string[];
  relatedIndustryIds: TariffIndustryId[];
}

export const TariffIndustries: Record<string, TariffIndustryDefinition> = {
  Plastics: {
    name: 'Plastics',
    industryId: TariffIndustryId.plastic,
    reportTitle: 'Impact of Tariffs on Plastic Industry',
    reportOneLiner: 'A comprehensive analysis of how tariffs affect the plastic industry, including supply chain disruptions and cost implications.',
    companiesToIgnore: ['Pactiv Evergreen Inc', 'Danimer Scientific(DNMR)', 'Zymergen Inc (ZY)', 'Amyris, Inc.'],
    relatedIndustryIds: [TariffIndustryId.metalGlassPlasticContainers, TariffIndustryId.diversifiedChemicals],
  },
  Aluminium: {
    name: 'Aluminium',
    industryId: TariffIndustryId.aluminium,
    reportTitle: 'Impact of Tariffs on Aluminium Industry',
    reportOneLiner: 'An in-depth analysis of how tariffs affect the aluminium industry, including market dynamics and competitive landscape.',
    relatedIndustryIds: [TariffIndustryId.ironandsteel, TariffIndustryId.diversifiedMetalsAndMining],
  },
  Automobiles: {
    name: 'Automobiles',
    industryId: TariffIndustryId.automobiles,
    reportTitle: 'Impact of Tariffs on Automobile Industry',
    reportOneLiner: 'A comprehensive overview of how tariffs impact the automobile industry, focusing on supply chain changes and cost structures.',
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
    relatedIndustryIds: [TariffIndustryId.industrialMachineryAndSupplies, TariffIndustryId.constructionMachineryAndHeavyTransportationEquipment],
  },
  ApparelAndAccessories: {
    name: 'Apparel & Accessories',
    industryId: TariffIndustryId.apparelandaccessories,
    reportTitle: 'Impact of Tariffs on Apparel & Accessories',
    reportOneLiner: 'Analysis of tariff changes affecting apparel & accessories trade.',
    relatedIndustryIds: [TariffIndustryId.textiles, TariffIndustryId.footwear],
  },
  IronAndSteel: {
    name: 'Iron & Steel',
    industryId: TariffIndustryId.ironandsteel,
    reportTitle: 'Impact of Tariffs on Iron & Steel Industry',
    reportOneLiner: 'An in-depth look at how tariffs are reshaping the iron & steel industry supply chains, costs, and competitiveness.',
    relatedIndustryIds: [TariffIndustryId.diversifiedMetalsAndMining, TariffIndustryId.aluminium],
  },
  Copper: {
    name: 'Copper',
    industryId: TariffIndustryId.copper,
    reportTitle: 'Impact of Tariffs on Copper',
    reportOneLiner: 'An analysis of the newly announced 50% Section 232 tariffs on copper imports and their effects on supply chains and pricing.',
    relatedIndustryIds: [TariffIndustryId.electricalcomponentsandequipment, TariffIndustryId.diversifiedMetalsAndMining],
  },
  ElectricalComponentsAndEquipment: {
    name: 'Electrical Components & Equipment',
    industryId: TariffIndustryId.electricalcomponentsandequipment,
    reportTitle: 'Impact of Tariffs on Electrical Components & Equipment',
    reportOneLiner: 'Analysis of how U.S. tariffs on imported electrical components and equipment affect supply chains, costs, and competitiveness.',
    relatedIndustryIds: [TariffIndustryId.consumerElectronics, TariffIndustryId.industrialMachineryAndSupplies],
  },
  HomeFurnishings: {
    name: 'Home Furnishings',
    industryId: TariffIndustryId.homefurnishings,
    reportTitle: 'Impact of Tariffs on Home Furnishings',
    reportOneLiner: 'A detailed look at the effects of import duties on home furniture, bedding, and related goods in the U.S. market.',
    relatedIndustryIds: [TariffIndustryId.textiles, TariffIndustryId.householdAppliances],
  },
  Pharmaceuticals: {
    name: 'Pharmaceuticals',
    industryId: TariffIndustryId.pharmaceuticals,
    reportTitle: 'Impact of Tariffs on Pharmaceuticals',
    reportOneLiner: 'Analysis of how U.S. tariffs on imported pharmaceutical products and APIs affect drug pricing and supply chains.',
    relatedIndustryIds: [TariffIndustryId.consumerElectronics, TariffIndustryId.industrialMachineryAndSupplies],
  },
  Semiconductors: {
    name: 'Semiconductors & Equipment',
    industryId: TariffIndustryId.semiconductors,
    reportTitle: 'Impact of Tariffs on Semiconductors & Equipment',
    reportOneLiner:
      'Analysis of Section 301 duties on semiconductor imports especially Chinese-made chips and their ripple effects on global supply chains and domestic manufacturing incentives.',
    relatedIndustryIds: [TariffIndustryId.consumerElectronics, TariffIndustryId.electricalcomponentsandequipment],
  },
  AgriculturalProductsAndServices: {
    name: 'Agricultural Products & Services',
    industryId: TariffIndustryId.agriculturalProductsAndServices,
    reportTitle: 'Tariff Impact on Agricultural Products & Services',
    reportOneLiner: 'Includes live animals, oilseeds, cereals, and waste products affected by import duties.',
    relatedIndustryIds: [TariffIndustryId.packagedFoodsAndMeats, TariffIndustryId.fertilizersAndAgriculturalChemicals],
  },
  PackagedFoodsAndMeats: {
    name: 'Packaged Foods & Meats',
    industryId: TariffIndustryId.packagedFoodsAndMeats,
    reportTitle: 'Tariff Effects on the Packaged Foods & Meats Industry',
    reportOneLiner: 'Covers dairy, meats, beverages, cereals, oils, cocoa, and processed foods.',
    relatedIndustryIds: [TariffIndustryId.agriculturalProductsAndServices, TariffIndustryId.brewers],
  },
  ForestProducts: {
    name: 'Forest Products',
    industryId: TariffIndustryId.forestProducts,
    reportTitle: 'Impact of U.S. Tariffs on Forestry and Plant-Based Goods',
    reportOneLiner: 'Examines duties on live plants, cut flowers, wood-based and plaited materials.',
    relatedIndustryIds: [TariffIndustryId.paperProducts, TariffIndustryId.constructionMaterials],
  },
  Tobacco: {
    name: 'Tobacco',
    industryId: TariffIndustryId.tobacco,
    reportTitle: 'Trade Restrictions on Tobacco and Alternatives',
    reportOneLiner: 'Analyzes tariffs impacting cigarettes, cigars, and smokeless substitutes.',
    relatedIndustryIds: [TariffIndustryId.packagedFoodsAndMeats, TariffIndustryId.commercialPrinting],
  },
  ConstructionMaterials: {
    name: 'Construction Materials',
    industryId: TariffIndustryId.constructionMaterials,
    reportTitle: 'U.S. Import Duties on Cement, Salt, and Lime',
    reportOneLiner: 'Impact of tariffs on mineral inputs essential for construction and infrastructure.',
    relatedIndustryIds: [TariffIndustryId.diversifiedMetalsAndMining, TariffIndustryId.ironandsteel],
  },
  DiversifiedMetalsAndMining: {
    name: 'Diversified Metals & Mining',
    industryId: TariffIndustryId.diversifiedMetalsAndMining,
    reportTitle: 'Tariff Environment for Ores, Ashes, and Raw Metal Inputs',
    reportOneLiner: 'Covers U.S. duties on raw materials critical to base metals and extractive industries.',
    relatedIndustryIds: [TariffIndustryId.ironandsteel, TariffIndustryId.aluminium],
  },
  OilAndGasRefiningAndMarketing: {
    name: 'Oil & Gas Refining & Marketing',
    industryId: TariffIndustryId.oilAndGasRefiningAndMarketing,
    reportTitle: 'Tariff Overview of Oil, Fuels, and Refined Petroleum Products',
    reportOneLiner: 'Evaluates duties on crude oil, diesel, gasoline, and other refined fuel imports.',
    relatedIndustryIds: [TariffIndustryId.commodityChemicals, TariffIndustryId.industrialGases],
  },
  CommodityChemicals: {
    name: 'Commodity Chemicals',
    industryId: TariffIndustryId.commodityChemicals,
    reportTitle: 'Tariffs on Inorganic and Bulk Chemical Inputs',
    reportOneLiner: 'Explores duties on foundational industrial chemicals including salts, acids, and fertilizers.',
    relatedIndustryIds: [TariffIndustryId.specialtyChemicals, TariffIndustryId.diversifiedChemicals],
  },
  SpecialtyChemicals: {
    name: 'Specialty Chemicals',
    industryId: TariffIndustryId.specialtyChemicals,
    reportTitle: 'U.S. Tariff Impact on Organic and Niche Chemical Products',
    reportOneLiner: 'Focuses on organic compounds, resins, and chemical derivatives under current tariff schedules.',
    relatedIndustryIds: [TariffIndustryId.commodityChemicals, TariffIndustryId.plastic],
  },
  FertilizersAndAgriculturalChemicals: {
    name: 'Fertilizers & Agricultural Chemicals',
    industryId: TariffIndustryId.fertilizersAndAgriculturalChemicals,
    reportTitle: 'Tariff Impact on Fertilizers and Agricultural Chemicals',
    reportOneLiner: 'Evaluates U.S. duties on fertilizer products and agricultural chemical imports.',
    relatedIndustryIds: [TariffIndustryId.agriculturalProductsAndServices, TariffIndustryId.commodityChemicals],
  },
  IndustrialGases: {
    name: 'Industrial Gases',
    industryId: TariffIndustryId.industrialGases,
    reportTitle: 'Tariffs on Industrial Gases',
    reportOneLiner: 'Analysis of import duties on gases like oxygen, nitrogen, and argon.',
    relatedIndustryIds: [TariffIndustryId.commodityChemicals, TariffIndustryId.industrialMachineryAndSupplies],
  },
  DiversifiedChemicals: {
    name: 'Diversified Chemicals',
    industryId: TariffIndustryId.diversifiedChemicals,
    reportTitle: 'Tariff Environment for Diversified Chemical Products',
    reportOneLiner: 'Covers duties on a broad range of chemical compounds beyond basic commodity chemicals.',
    relatedIndustryIds: [TariffIndustryId.commodityChemicals, TariffIndustryId.plastic],
  },
  MetalGlassPlasticContainers: {
    name: 'Metal, Glass & Plastic Containers',
    industryId: TariffIndustryId.metalGlassPlasticContainers,
    reportTitle: 'Tariffs on Packaging Containers',
    reportOneLiner: 'Impact of duties on containers used in food, beverage, and industrial packaging.',
    relatedIndustryIds: [TariffIndustryId.plastic, TariffIndustryId.packagedFoodsAndMeats],
  },
  PaperPlasticPackagingProductsAndMaterials: {
    name: 'Paper & Plastic Packaging Products & Materials',
    industryId: TariffIndustryId.paperPlasticPackagingProductsAndMaterials,
    reportTitle: 'Tariff Effects on Paper and Plastic Packaging',
    reportOneLiner: 'Examines import duties on packaging materials for consumer and industrial goods.',
    relatedIndustryIds: [TariffIndustryId.plastic, TariffIndustryId.metalGlassPlasticContainers],
  },
  PaperProducts: {
    name: 'Paper Products',
    industryId: TariffIndustryId.paperProducts,
    reportTitle: 'Import Duties on Paper and Board Products',
    reportOneLiner: 'Analysis of tariffs on paper, board, and printing materials.',
    relatedIndustryIds: [TariffIndustryId.forestProducts, TariffIndustryId.commercialPrinting],
  },
  ConsumerElectronics: {
    name: 'Consumer Electronics',
    industryId: TariffIndustryId.consumerElectronics,
    reportTitle: 'Tariff Impact on Consumer Electronic Goods',
    reportOneLiner: 'Evaluates duties on smartphones, TVs, and personal electronic devices.',
    relatedIndustryIds: [TariffIndustryId.semiconductors, TariffIndustryId.electricalcomponentsandequipment],
  },
  HouseholdAppliances: {
    name: 'Household Appliances',
    industryId: TariffIndustryId.householdAppliances,
    reportTitle: 'Import Duties on Household Appliances',
    reportOneLiner: 'Covers tariffs on refrigerators, washing machines, and kitchen appliances.',
    relatedIndustryIds: [TariffIndustryId.consumerElectronics, TariffIndustryId.electricalcomponentsandequipment],
  },
  LeisureProducts: {
    name: 'Leisure Products',
    industryId: TariffIndustryId.leisureProducts,
    reportTitle: 'Tariff Effects on Sports and Leisure Goods',
    reportOneLiner: 'Analysis of duties on sporting equipment, toys, and recreational products.',
    relatedIndustryIds: [TariffIndustryId.textiles, TariffIndustryId.footwear],
  },
  Footwear: {
    name: 'Footwear',
    industryId: TariffIndustryId.footwear,
    reportTitle: 'Import Duties on Footwear and Related Products',
    reportOneLiner: 'Evaluates tariffs on shoes, boots, and related footwear.',
    relatedIndustryIds: [TariffIndustryId.apparelandaccessories, TariffIndustryId.textiles],
  },
  Textiles: {
    name: 'Textiles',
    industryId: TariffIndustryId.textiles,
    reportTitle: 'Tariffs on Textile Fabrics and Yarns',
    reportOneLiner: 'Covers duties on textile fibers, fabrics, and woven materials.',
    relatedIndustryIds: [TariffIndustryId.apparelandaccessories, TariffIndustryId.footwear],
  },
  Brewers: {
    name: 'Brewers',
    industryId: TariffIndustryId.brewers,
    reportTitle: 'Tariff Impact on Brewing Industry',
    reportOneLiner: 'Examines duties on beer, malt, and brewing ingredients.',
    relatedIndustryIds: [TariffIndustryId.packagedFoodsAndMeats, TariffIndustryId.distillersAndVintners],
  },
  DistillersAndVintners: {
    name: 'Distillers & Vintners',
    industryId: TariffIndustryId.distillersAndVintners,
    reportTitle: 'Tariff Effects on Distilled Spirits and Wines',
    reportOneLiner: 'Analyzes import duties on spirits, wines, and related beverages.',
    relatedIndustryIds: [TariffIndustryId.brewers, TariffIndustryId.softDrinksAndNonAlcoholicBeverages],
  },
  SoftDrinksAndNonAlcoholicBeverages: {
    name: 'Soft Drinks & Non-Alcoholic Beverages',
    industryId: TariffIndustryId.softDrinksAndNonAlcoholicBeverages,
    reportTitle: 'Tariffs on Non-Alcoholic Beverages',
    reportOneLiner: 'Evaluates duties on carbonated drinks, juices, and other non-alcoholic beverages.',
    relatedIndustryIds: [TariffIndustryId.packagedFoodsAndMeats, TariffIndustryId.brewers],
  },
  CommercialPrinting: {
    name: 'Commercial Printing',
    industryId: TariffIndustryId.commercialPrinting,
    reportTitle: 'Tariffs on Printed Materials',
    reportOneLiner: 'Examines duties on printed books, magazines, and publication services.',
    relatedIndustryIds: [TariffIndustryId.paperProducts, TariffIndustryId.paperPlasticPackagingProductsAndMaterials],
  },
  HeavyElectricalEquipment: {
    name: 'Heavy Electrical Equipment',
    industryId: TariffIndustryId.heavyElectricalEquipment,
    reportTitle: 'Import Duties on Heavy Electrical Machinery',
    reportOneLiner: 'Covers tariffs on generators, transformers, and large electrical apparatus.',
    relatedIndustryIds: [TariffIndustryId.electricalcomponentsandequipment, TariffIndustryId.industrialMachineryAndSupplies],
  },
  IndustrialMachineryAndSupplies: {
    name: 'Industrial Machinery & Supplies',
    industryId: TariffIndustryId.industrialMachineryAndSupplies,
    reportTitle: 'Tariffs on Industrial Machinery and Components',
    reportOneLiner: 'Analysis of duties on industrial equipment and machine parts.',
    relatedIndustryIds: [TariffIndustryId.heavyElectricalEquipment, TariffIndustryId.constructionMachineryAndHeavyTransportationEquipment],
  },
  AerospaceAndDefense: {
    name: 'Aerospace & Defense',
    industryId: TariffIndustryId.aerospaceAndDefense,
    reportTitle: 'Tariff Effects on Aerospace Products',
    reportOneLiner: 'Evaluates import duties on aircraft, spacecraft, and defense equipment.',
    relatedIndustryIds: [TariffIndustryId.industrialMachineryAndSupplies, TariffIndustryId.semiconductors],
  },
  ConstructionMachineryAndHeavyTransportationEquipment: {
    name: 'Construction Machinery & Heavy Transportation Equipment',
    industryId: TariffIndustryId.constructionMachineryAndHeavyTransportationEquipment,
    reportTitle: 'Tariffs on Construction and Heavy Transport Machinery',
    reportOneLiner: 'Covers duties on excavators, bulldozers, and heavy transport vehicles.',
    relatedIndustryIds: [TariffIndustryId.automobiles, TariffIndustryId.industrialMachineryAndSupplies],
  },
  HealthCareEquipment: {
    name: 'Health Care Equipment',
    industryId: TariffIndustryId.healthCareEquipment,
    reportTitle: 'Impact of Tariffs on Health Care Equipment',
    reportOneLiner: 'Analysis of how import duties affect medical devices and health care equipment supply chains.',
    relatedIndustryIds: [TariffIndustryId.pharmaceuticals, TariffIndustryId.industrialMachineryAndSupplies],
  },
  HousewaresAndSpecialties: {
    name: 'Housewares & Specialties',
    industryId: TariffIndustryId.housewaresAndSpecialties,
    reportTitle: 'Impact of Tariffs on Housewares & Specialties',
    reportOneLiner: 'A look at how U.S. tariffs on home goods and specialty housewares affect costs and market access.',
    relatedIndustryIds: [TariffIndustryId.homefurnishings, TariffIndustryId.householdAppliances],
  },
  TiresAndRubber: {
    name: 'Tires & Rubber',
    industryId: TariffIndustryId.tiresAndRubber,
    reportTitle: 'Impact of Tariffs on Tires & Rubber',
    reportOneLiner: 'Analysis of how import duties affect tire manufacturing and rubber products supply chains.',
    relatedIndustryIds: [TariffIndustryId.automobiles, TariffIndustryId.industrialMachineryAndSupplies],
  },
};

export function getNumberOfHeadings(industryId: TariffIndustryId): number {
  return getTariffIndustryDefinitionById(industryId).headingsCount ?? DEFAULT_HEADINGS_COUNT;
}

export function getNumberOfSubHeadings(industryId: TariffIndustryId): number {
  return getTariffIndustryDefinitionById(industryId).subHeadingsCount ?? DEFAULT_SUB_HEADINGS_COUNT;
}

export function getCompaniesToIgnore(industryId: TariffIndustryId): string[] {
  return getTariffIndustryDefinitionById(industryId).companiesToIgnore ?? [];
}

export function getTariffIndustryDefinitionById(industryId: TariffIndustryId): TariffIndustryDefinition {
  const industryDefinition = Object.entries(TariffIndustries).find((k, v) => {
    return k[1].industryId === industryId;
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
  const headingsCount = getNumberOfHeadings(industryId);
  const subHeadingsCount = getNumberOfSubHeadings(industryId);
  const combinations: HeadingSubheadingCombination[] = [];

  for (let headingIndex = 0; headingIndex < headingsCount; headingIndex++) {
    for (let subHeadingIndex = 0; subHeadingIndex < subHeadingsCount; subHeadingIndex++) {
      combinations.push({
        headingIndex,
        subHeadingIndex,
        displayName: `Evaluate Industry Area ${headingIndex}_${subHeadingIndex}`,
      });
    }
  }

  return combinations;
}
