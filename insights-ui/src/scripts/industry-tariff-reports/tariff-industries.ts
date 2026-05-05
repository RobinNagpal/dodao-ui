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

export interface HtsChapterRef {
  number: number;
  shortName: string;
  slug: string;
}

export interface TariffIndustryDefinition {
  name: string;
  industryId: TariffIndustryId;
  reportTitle: string;
  reportOneLiner: string;
  headingsCount: number;
  subHeadingsCount: number;
  establishedPlayersCount: number;
  newChallengersCount: number;
  companiesToIgnore: string[];
  relatedIndustryIds: TariffIndustryId[];
  // Chapters of the HTS (https://hts.usitc.gov/) that this industry canonically covers,
  // ordered. Empty for secondary industries that share a chapter with a canonical owner —
  // those set primaryChapterNumber instead.
  htsChapters?: HtsChapterRef[];
  // Chapter shown on the industry's existing URLs after the chapter content swap.
  // Defaults to htsChapters[0] when omitted; required for secondary industries with no htsChapters.
  primaryChapterNumber?: number;
}

// Source: https://hts.usitc.gov/. Slugs are URL-safe versions of the chapter names; once shipped
// they are part of public URLs and must not be renamed without a redirect.
export const HTS_CHAPTERS: Record<number, HtsChapterRef> = {
  1: { number: 1, shortName: 'Live animals', slug: 'live-animals' },
  2: { number: 2, shortName: 'Meat & offal', slug: 'meat-and-offal' },
  3: { number: 3, shortName: 'Fish & crustaceans', slug: 'fish-and-crustaceans' },
  4: { number: 4, shortName: 'Dairy, eggs, honey', slug: 'dairy-eggs-honey' },
  5: { number: 5, shortName: 'Animal products NES', slug: 'animal-products-nes' },
  6: { number: 6, shortName: 'Live plants & bulbs', slug: 'live-plants-and-bulbs' },
  7: { number: 7, shortName: 'Vegetables & roots', slug: 'vegetables-and-roots' },
  8: { number: 8, shortName: 'Fruit & nuts', slug: 'fruit-and-nuts' },
  9: { number: 9, shortName: 'Coffee, tea, spices', slug: 'coffee-tea-spices' },
  10: { number: 10, shortName: 'Cereals', slug: 'cereals' },
  11: { number: 11, shortName: 'Milling products', slug: 'milling-products' },
  12: { number: 12, shortName: 'Oil seeds & grains', slug: 'oil-seeds-and-grains' },
  13: { number: 13, shortName: 'Lac, gums, resins', slug: 'lac-gums-resins' },
  14: { number: 14, shortName: 'Plaiting materials NES', slug: 'plaiting-materials-nes' },
  15: { number: 15, shortName: 'Fats & oils', slug: 'fats-and-oils' },
  16: { number: 16, shortName: 'Prepared meat & fish', slug: 'prepared-meat-and-fish' },
  17: { number: 17, shortName: 'Sugars & confectionery', slug: 'sugars-and-confectionery' },
  18: { number: 18, shortName: 'Cocoa & preparations', slug: 'cocoa-and-preparations' },
  19: { number: 19, shortName: "Cereal & baker's goods", slug: 'cereal-and-bakers-goods' },
  20: { number: 20, shortName: 'Veg/fruit preparations', slug: 'veg-fruit-preparations' },
  21: { number: 21, shortName: 'Misc edible preparations', slug: 'misc-edible-preparations' },
  22: { number: 22, shortName: 'Beverages, spirits, vinegar', slug: 'beverages-spirits-vinegar' },
  23: { number: 23, shortName: 'Food industry residues & feed', slug: 'food-industry-residues-and-feed' },
  24: { number: 24, shortName: 'Tobacco & substitutes', slug: 'tobacco-and-substitutes' },
  25: { number: 25, shortName: 'Salt, sulfur & cements', slug: 'salt-sulfur-and-cements' },
  26: { number: 26, shortName: 'Ores, slag & ash', slug: 'ores-slag-and-ash' },
  27: { number: 27, shortName: 'Mineral fuels & oils', slug: 'mineral-fuels-and-oils' },
  28: { number: 28, shortName: 'Inorganic & metal compounds', slug: 'inorganic-and-metal-compounds' },
  29: { number: 29, shortName: 'Organic chemicals', slug: 'organic-chemicals' },
  30: { number: 30, shortName: 'Pharmaceutical products', slug: 'pharmaceutical-products' },
  31: { number: 31, shortName: 'Fertilizers', slug: 'fertilizers' },
  32: { number: 32, shortName: 'Dyes, pigments & paints', slug: 'dyes-pigments-and-paints' },
  33: { number: 33, shortName: 'Essential oils & cosmetics', slug: 'essential-oils-and-cosmetics' },
  34: { number: 34, shortName: 'Soaps, waxes & preparations', slug: 'soaps-waxes-and-preparations' },
  35: { number: 35, shortName: 'Albuminoidal substances & glues', slug: 'albuminoidal-substances-and-glues' },
  36: { number: 36, shortName: 'Explosives & pyrotechnics', slug: 'explosives-and-pyrotechnics' },
  37: { number: 37, shortName: 'Photographic goods', slug: 'photographic-goods' },
  38: { number: 38, shortName: 'Misc chemical products', slug: 'misc-chemical-products' },
  39: { number: 39, shortName: 'Plastics & articles', slug: 'plastics-and-articles' },
  40: { number: 40, shortName: 'Rubber & articles', slug: 'rubber-and-articles' },
  41: { number: 41, shortName: 'Raw hides & leather', slug: 'raw-hides-and-leather' },
  42: { number: 42, shortName: 'Leather articles & saddlery', slug: 'leather-articles-and-saddlery' },
  43: { number: 43, shortName: 'Furskins & furs', slug: 'furskins-and-furs' },
  44: { number: 44, shortName: 'Wood & charcoal', slug: 'wood-and-charcoal' },
  45: { number: 45, shortName: 'Cork & articles', slug: 'cork-and-articles' },
  46: { number: 46, shortName: 'Straw & wickerwork', slug: 'straw-and-wickerwork' },
  47: { number: 47, shortName: 'Wood pulp & scrap', slug: 'wood-pulp-and-scrap' },
  48: { number: 48, shortName: 'Paper & paperboard', slug: 'paper-and-paperboard' },
  49: { number: 49, shortName: 'Printing industry products', slug: 'printing-industry-products' },
  50: { number: 50, shortName: 'Silk', slug: 'silk' },
  51: { number: 51, shortName: 'Wool & horsehair', slug: 'wool-and-horsehair' },
  52: { number: 52, shortName: 'Cotton', slug: 'cotton' },
  53: { number: 53, shortName: 'Other veg textile fibers', slug: 'other-veg-textile-fibers' },
  54: { number: 54, shortName: 'Man-made filaments', slug: 'man-made-filaments' },
  55: { number: 55, shortName: 'Man-made staple fibers', slug: 'man-made-staple-fibers' },
  56: { number: 56, shortName: 'Wadding, felt & twine', slug: 'wadding-felt-and-twine' },
  57: { number: 57, shortName: 'Carpets & floor coverings', slug: 'carpets-and-floor-coverings' },
  58: { number: 58, shortName: 'Special woven fabrics', slug: 'special-woven-fabrics' },
  59: { number: 59, shortName: 'Coated textile fabrics', slug: 'coated-textile-fabrics' },
  60: { number: 60, shortName: 'Knitted fabrics', slug: 'knitted-fabrics' },
  61: { number: 61, shortName: 'Apparel & accessories (knit)', slug: 'apparel-and-accessories-knit' },
  62: { number: 62, shortName: 'Apparel & accessories (woven)', slug: 'apparel-and-accessories-woven' },
  63: { number: 63, shortName: 'Made-up textile articles', slug: 'made-up-textile-articles' },
  64: { number: 64, shortName: 'Footwear & gaiters', slug: 'footwear-and-gaiters' },
  65: { number: 65, shortName: 'Headgear', slug: 'headgear' },
  66: { number: 66, shortName: 'Umbrellas & accessories', slug: 'umbrellas-and-accessories' },
  67: { number: 67, shortName: 'Feathers & artificial flowers', slug: 'feathers-and-artificial-flowers' },
  68: { number: 68, shortName: 'Stone, cement & similar', slug: 'stone-cement-and-similar' },
  69: { number: 69, shortName: 'Ceramic products', slug: 'ceramic-products' },
  70: { number: 70, shortName: 'Glass & glassware', slug: 'glass-and-glassware' },
  71: { number: 71, shortName: 'Pearls, stones & jewelry', slug: 'pearls-stones-and-jewelry' },
  72: { number: 72, shortName: 'Iron & steel', slug: 'iron-and-steel' },
  73: { number: 73, shortName: 'Articles of iron/steel', slug: 'articles-of-iron-steel' },
  74: { number: 74, shortName: 'Copper & articles', slug: 'copper-and-articles' },
  75: { number: 75, shortName: 'Nickel & articles', slug: 'nickel-and-articles' },
  76: { number: 76, shortName: 'Aluminum & articles', slug: 'aluminum-and-articles' },
  77: { number: 77, shortName: '(Reserved)', slug: 'reserved' },
  78: { number: 78, shortName: 'Lead & articles', slug: 'lead-and-articles' },
  79: { number: 79, shortName: 'Zinc & articles', slug: 'zinc-and-articles' },
  80: { number: 80, shortName: 'Tin & articles', slug: 'tin-and-articles' },
  81: { number: 81, shortName: 'Other base metals & cermets', slug: 'other-base-metals-and-cermets' },
  82: { number: 82, shortName: 'Base metal tools & implements', slug: 'base-metal-tools-and-implements' },
  83: { number: 83, shortName: 'Misc articles of base metal', slug: 'misc-articles-of-base-metal' },
  84: { number: 84, shortName: 'Nuclear reactors & machinery', slug: 'nuclear-reactors-and-machinery' },
  85: { number: 85, shortName: 'Electrical machinery & recorders', slug: 'electrical-machinery-and-recorders' },
  86: { number: 86, shortName: 'Railway locomotives & fixtures', slug: 'railway-locomotives-and-fixtures' },
  87: { number: 87, shortName: 'Motor vehicles & parts', slug: 'motor-vehicles-and-parts' },
  88: { number: 88, shortName: 'Aircraft & spacecraft', slug: 'aircraft-and-spacecraft' },
  89: { number: 89, shortName: 'Ships & floating structures', slug: 'ships-and-floating-structures' },
  90: { number: 90, shortName: 'Optical & precision instruments', slug: 'optical-and-precision-instruments' },
  91: { number: 91, shortName: 'Clocks & watches', slug: 'clocks-and-watches' },
  92: { number: 92, shortName: 'Musical instruments', slug: 'musical-instruments' },
  93: { number: 93, shortName: 'Arms & ammunition', slug: 'arms-and-ammunition' },
  94: { number: 94, shortName: 'Furniture & lighting fittings', slug: 'furniture-and-lighting-fittings' },
  95: { number: 95, shortName: 'Toys, games & sports requisites', slug: 'toys-games-and-sports-requisites' },
  96: { number: 96, shortName: 'Misc manufactured articles', slug: 'misc-manufactured-articles' },
  97: { number: 97, shortName: 'Works of art & antiques', slug: 'works-of-art-and-antiques' },
  98: { number: 98, shortName: 'Special classification provisions', slug: 'special-classification-provisions' },
  99: { number: 99, shortName: 'Temporary legislation & modifications', slug: 'temporary-legislation-and-modifications' },
};

// Chapters with no canonical industry owner — surfaced under /tariff-reports directly.
export const ORPHAN_HTS_CHAPTER_NUMBERS: number[] = [96, 97, 98, 99];

function chapters(...numbers: number[]): HtsChapterRef[] {
  return numbers.map((n) => HTS_CHAPTERS[n]);
}

export const TariffIndustries: Record<string, TariffIndustryDefinition> = {
  Plastics: {
    name: 'Plastics',
    industryId: TariffIndustryId.plastic,
    reportTitle: 'Impact of Tariffs on Plastic Industry',
    reportOneLiner: 'A comprehensive analysis of how tariffs affect the plastic industry, including supply chain disruptions and cost implications.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: ['Pactiv Evergreen Inc', 'Danimer Scientific(DNMR)', 'Zymergen Inc (ZY)', 'Amyris, Inc.'],
    relatedIndustryIds: [TariffIndustryId.metalGlassPlasticContainers, TariffIndustryId.diversifiedChemicals],
    htsChapters: chapters(39),
  },
  Aluminium: {
    name: 'Aluminium',
    industryId: TariffIndustryId.aluminium,
    reportTitle: 'Impact of Tariffs on Aluminium Industry',
    reportOneLiner: 'An in-depth analysis of how tariffs affect the aluminium industry, including market dynamics and competitive landscape.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.ironandsteel, TariffIndustryId.diversifiedMetalsAndMining],
    htsChapters: chapters(76),
  },
  Automobiles: {
    name: 'Automobiles',
    industryId: TariffIndustryId.automobiles,
    reportTitle: 'Impact of Tariffs on Automobile Industry',
    reportOneLiner: 'A comprehensive overview of how tariffs impact the automobile industry, focusing on supply chain changes and cost structures.',
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
    relatedIndustryIds: [TariffIndustryId.industrialMachineryAndSupplies, TariffIndustryId.constructionMachineryAndHeavyTransportationEquipment],
    htsChapters: chapters(87),
  },
  ApparelAndAccessories: {
    name: 'Apparel & Accessories',
    industryId: TariffIndustryId.apparelandaccessories,
    reportTitle: 'Impact of Tariffs on Apparel & Accessories',
    reportOneLiner: 'Analysis of tariff changes affecting apparel & accessories trade.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.textiles, TariffIndustryId.footwear],
    htsChapters: chapters(41, 42, 43, 61, 62, 63, 65, 66, 67, 71, 91),
  },
  IronAndSteel: {
    name: 'Iron & Steel',
    industryId: TariffIndustryId.ironandsteel,
    reportTitle: 'Impact of Tariffs on Iron & Steel Industry',
    reportOneLiner: 'An in-depth look at how tariffs are reshaping the iron & steel industry supply chains, costs, and competitiveness.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.diversifiedMetalsAndMining, TariffIndustryId.aluminium],
    htsChapters: chapters(72, 73),
  },
  Copper: {
    name: 'Copper',
    industryId: TariffIndustryId.copper,
    reportTitle: 'Impact of Tariffs on Copper',
    reportOneLiner: 'An analysis of the newly announced 50% Section 232 tariffs on copper imports and their effects on supply chains and pricing.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.electricalcomponentsandequipment, TariffIndustryId.diversifiedMetalsAndMining],
    htsChapters: chapters(74),
  },
  ElectricalComponentsAndEquipment: {
    name: 'Electrical Components & Equipment',
    industryId: TariffIndustryId.electricalcomponentsandequipment,
    reportTitle: 'Impact of Tariffs on Electrical Components & Equipment',
    reportOneLiner: 'Analysis of how U.S. tariffs on imported electrical components and equipment affect supply chains, costs, and competitiveness.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.consumerElectronics, TariffIndustryId.industrialMachineryAndSupplies],
    htsChapters: chapters(85),
  },
  HomeFurnishings: {
    name: 'Home Furnishings',
    industryId: TariffIndustryId.homefurnishings,
    reportTitle: 'Impact of Tariffs on Home Furnishings',
    reportOneLiner: 'A detailed look at the effects of import duties on home furniture, bedding, and related goods in the U.S. market.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.textiles, TariffIndustryId.householdAppliances],
    htsChapters: chapters(94),
  },
  Pharmaceuticals: {
    name: 'Pharmaceuticals',
    industryId: TariffIndustryId.pharmaceuticals,
    reportTitle: 'Impact of Tariffs on Pharmaceuticals',
    reportOneLiner: 'Analysis of how U.S. tariffs on imported pharmaceutical products and APIs affect drug pricing and supply chains.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.consumerElectronics, TariffIndustryId.industrialMachineryAndSupplies],
    htsChapters: chapters(30),
  },
  Semiconductors: {
    name: 'Semiconductors & Equipment',
    industryId: TariffIndustryId.semiconductors,
    reportTitle: 'Impact of Tariffs on Semiconductors & Equipment',
    reportOneLiner:
      'Analysis of Section 301 duties on semiconductor imports especially Chinese-made chips and their ripple effects on global supply chains and domestic manufacturing incentives.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.consumerElectronics, TariffIndustryId.electricalcomponentsandequipment],
    // Semiconductors share chapter 85 with electricalcomponentsandequipment (the canonical owner).
    primaryChapterNumber: 85,
  },
  AgriculturalProductsAndServices: {
    name: 'Agricultural Products & Services',
    industryId: TariffIndustryId.agriculturalProductsAndServices,
    reportTitle: 'Tariff Impact on Agricultural Products & Services',
    reportOneLiner: 'Includes live animals, oilseeds, cereals, and waste products affected by import duties.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.packagedFoodsAndMeats, TariffIndustryId.fertilizersAndAgriculturalChemicals],
    htsChapters: chapters(1, 4, 5, 6, 7, 8, 9, 10, 12, 14, 23),
  },
  PackagedFoodsAndMeats: {
    name: 'Packaged Foods & Meats',
    industryId: TariffIndustryId.packagedFoodsAndMeats,
    reportTitle: 'Tariff Effects on the Packaged Foods & Meats Industry',
    reportOneLiner: 'Covers dairy, meats, beverages, cereals, oils, cocoa, and processed foods.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.agriculturalProductsAndServices, TariffIndustryId.brewers],
    htsChapters: chapters(2, 3, 11, 15, 16, 17, 18, 19, 20, 21),
  },
  ForestProducts: {
    name: 'Forest Products',
    industryId: TariffIndustryId.forestProducts,
    reportTitle: 'Impact of U.S. Tariffs on Forestry and Plant-Based Goods',
    reportOneLiner: 'Examines duties on live plants, cut flowers, wood-based and plaited materials.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.paperProducts, TariffIndustryId.constructionMaterials],
    htsChapters: chapters(44, 45, 46, 47),
  },
  Tobacco: {
    name: 'Tobacco',
    industryId: TariffIndustryId.tobacco,
    reportTitle: 'Trade Restrictions on Tobacco and Alternatives',
    reportOneLiner: 'Analyzes tariffs impacting cigarettes, cigars, and smokeless substitutes.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.packagedFoodsAndMeats, TariffIndustryId.commercialPrinting],
    htsChapters: chapters(24),
  },
  ConstructionMaterials: {
    name: 'Construction Materials',
    industryId: TariffIndustryId.constructionMaterials,
    reportTitle: 'U.S. Import Duties on Cement, Salt, and Lime',
    reportOneLiner: 'Impact of tariffs on mineral inputs essential for construction and infrastructure.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.diversifiedMetalsAndMining, TariffIndustryId.ironandsteel],
    htsChapters: chapters(25, 68, 69),
  },
  DiversifiedMetalsAndMining: {
    name: 'Diversified Metals & Mining',
    industryId: TariffIndustryId.diversifiedMetalsAndMining,
    reportTitle: 'Tariff Environment for Ores, Ashes, and Raw Metal Inputs',
    reportOneLiner: 'Covers U.S. duties on raw materials critical to base metals and extractive industries.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.ironandsteel, TariffIndustryId.aluminium],
    htsChapters: chapters(26, 75, 77, 78, 79, 80, 81, 83),
  },
  OilAndGasRefiningAndMarketing: {
    name: 'Oil & Gas Refining & Marketing',
    industryId: TariffIndustryId.oilAndGasRefiningAndMarketing,
    reportTitle: 'Tariff Overview of Oil, Fuels, and Refined Petroleum Products',
    reportOneLiner: 'Evaluates duties on crude oil, diesel, gasoline, and other refined fuel imports.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.commodityChemicals, TariffIndustryId.industrialGases],
    htsChapters: chapters(27),
  },
  CommodityChemicals: {
    name: 'Commodity Chemicals',
    industryId: TariffIndustryId.commodityChemicals,
    reportTitle: 'Tariffs on Inorganic and Bulk Chemical Inputs',
    reportOneLiner: 'Explores duties on foundational industrial chemicals including salts, acids, and fertilizers.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.specialtyChemicals, TariffIndustryId.diversifiedChemicals],
    htsChapters: chapters(28, 29),
  },
  SpecialtyChemicals: {
    name: 'Specialty Chemicals',
    industryId: TariffIndustryId.specialtyChemicals,
    reportTitle: 'U.S. Tariff Impact on Organic and Niche Chemical Products',
    reportOneLiner: 'Focuses on organic compounds, resins, and chemical derivatives under current tariff schedules.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.commodityChemicals, TariffIndustryId.plastic],
    htsChapters: chapters(13, 32, 33, 34, 35, 36),
  },
  FertilizersAndAgriculturalChemicals: {
    name: 'Fertilizers & Agricultural Chemicals',
    industryId: TariffIndustryId.fertilizersAndAgriculturalChemicals,
    reportTitle: 'Tariff Impact on Fertilizers and Agricultural Chemicals',
    reportOneLiner: 'Evaluates U.S. duties on fertilizer products and agricultural chemical imports.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.agriculturalProductsAndServices, TariffIndustryId.commodityChemicals],
    htsChapters: chapters(31),
  },
  IndustrialGases: {
    name: 'Industrial Gases',
    industryId: TariffIndustryId.industrialGases,
    reportTitle: 'Tariffs on Industrial Gases',
    reportOneLiner: 'Analysis of import duties on gases like oxygen, nitrogen, and argon.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.commodityChemicals, TariffIndustryId.industrialMachineryAndSupplies],
    // Industrial gases are not the canonical owner of any chapter — share chapter 28 with commodityChemicals.
    primaryChapterNumber: 28,
  },
  DiversifiedChemicals: {
    name: 'Diversified Chemicals',
    industryId: TariffIndustryId.diversifiedChemicals,
    reportTitle: 'Tariff Environment for Diversified Chemical Products',
    reportOneLiner: 'Covers duties on a broad range of chemical compounds beyond basic commodity chemicals.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.commodityChemicals, TariffIndustryId.plastic],
    htsChapters: chapters(38),
  },
  MetalGlassPlasticContainers: {
    name: 'Metal, Glass & Plastic Containers',
    industryId: TariffIndustryId.metalGlassPlasticContainers,
    reportTitle: 'Tariffs on Packaging Containers',
    reportOneLiner: 'Impact of duties on containers used in food, beverage, and industrial packaging.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.plastic, TariffIndustryId.packagedFoodsAndMeats],
    htsChapters: chapters(70),
  },
  PaperPlasticPackagingProductsAndMaterials: {
    name: 'Paper & Plastic Packaging Products & Materials',
    industryId: TariffIndustryId.paperPlasticPackagingProductsAndMaterials,
    reportTitle: 'Tariff Effects on Paper and Plastic Packaging',
    reportOneLiner: 'Examines import duties on packaging materials for consumer and industrial goods.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.plastic, TariffIndustryId.metalGlassPlasticContainers],
    // Not in the CSV chapter mapping and not in the user-listed secondary industries — leaves existing
    // industry content in place (no primary chapter to swap to).
  },
  PaperProducts: {
    name: 'Paper Products',
    industryId: TariffIndustryId.paperProducts,
    reportTitle: 'Import Duties on Paper and Board Products',
    reportOneLiner: 'Analysis of tariffs on paper, board, and printing materials.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.forestProducts, TariffIndustryId.commercialPrinting],
    htsChapters: chapters(48),
  },
  ConsumerElectronics: {
    name: 'Consumer Electronics',
    industryId: TariffIndustryId.consumerElectronics,
    reportTitle: 'Tariff Impact on Consumer Electronic Goods',
    reportOneLiner: 'Evaluates duties on smartphones, TVs, and personal electronic devices.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.semiconductors, TariffIndustryId.electricalcomponentsandequipment],
    htsChapters: chapters(37),
  },
  HouseholdAppliances: {
    name: 'Household Appliances',
    industryId: TariffIndustryId.householdAppliances,
    reportTitle: 'Import Duties on Household Appliances',
    reportOneLiner: 'Covers tariffs on refrigerators, washing machines, and kitchen appliances.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.consumerElectronics, TariffIndustryId.electricalcomponentsandequipment],
    // Household appliances are split across HTS chapters 84 (refrigerators, washers) and 85 (small
    // electric appliances). Chapter 84's name is dominated by "Nuclear reactors" so we surface
    // chapter 85 here for a cleaner reader experience; canonical owner of chapter 85 is
    // electricalcomponentsandequipment.
    primaryChapterNumber: 85,
  },
  LeisureProducts: {
    name: 'Leisure Products',
    industryId: TariffIndustryId.leisureProducts,
    reportTitle: 'Tariff Effects on Sports and Leisure Goods',
    reportOneLiner: 'Analysis of duties on sporting equipment, toys, and recreational products.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.textiles, TariffIndustryId.footwear],
    htsChapters: chapters(92, 95),
  },
  Footwear: {
    name: 'Footwear',
    industryId: TariffIndustryId.footwear,
    reportTitle: 'Import Duties on Footwear and Related Products',
    reportOneLiner: 'Evaluates tariffs on shoes, boots, and related footwear.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.apparelandaccessories, TariffIndustryId.textiles],
    htsChapters: chapters(64),
  },
  Textiles: {
    name: 'Textiles',
    industryId: TariffIndustryId.textiles,
    reportTitle: 'Tariffs on Textile Fabrics and Yarns',
    reportOneLiner: 'Covers duties on textile fibers, fabrics, and woven materials.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.apparelandaccessories, TariffIndustryId.footwear],
    htsChapters: chapters(50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60),
  },
  Brewers: {
    name: 'Brewers',
    industryId: TariffIndustryId.brewers,
    reportTitle: 'Tariff Impact on Brewing Industry',
    reportOneLiner: 'Examines duties on beer, malt, and brewing ingredients.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.packagedFoodsAndMeats, TariffIndustryId.distillersAndVintners],
    // Brewers are not the canonical owner of any chapter — share chapter 22 with distillersAndVintners.
    primaryChapterNumber: 22,
  },
  DistillersAndVintners: {
    name: 'Distillers & Vintners',
    industryId: TariffIndustryId.distillersAndVintners,
    reportTitle: 'Tariff Effects on Distilled Spirits and Wines',
    reportOneLiner: 'Analyzes import duties on spirits, wines, and related beverages.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.brewers, TariffIndustryId.softDrinksAndNonAlcoholicBeverages],
    htsChapters: chapters(22),
  },
  SoftDrinksAndNonAlcoholicBeverages: {
    name: 'Soft Drinks & Non-Alcoholic Beverages',
    industryId: TariffIndustryId.softDrinksAndNonAlcoholicBeverages,
    reportTitle: 'Tariffs on Non-Alcoholic Beverages',
    reportOneLiner: 'Evaluates duties on carbonated drinks, juices, and other non-alcoholic beverages.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.packagedFoodsAndMeats, TariffIndustryId.brewers],
    // Soft drinks share chapter 22 with distillersAndVintners (canonical owner).
    primaryChapterNumber: 22,
  },
  CommercialPrinting: {
    name: 'Commercial Printing',
    industryId: TariffIndustryId.commercialPrinting,
    reportTitle: 'Tariffs on Printed Materials',
    reportOneLiner: 'Examines duties on printed books, magazines, and publication services.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.paperProducts, TariffIndustryId.paperPlasticPackagingProductsAndMaterials],
    htsChapters: chapters(49),
  },
  HeavyElectricalEquipment: {
    name: 'Heavy Electrical Equipment',
    industryId: TariffIndustryId.heavyElectricalEquipment,
    reportTitle: 'Import Duties on Heavy Electrical Machinery',
    reportOneLiner: 'Covers tariffs on generators, transformers, and large electrical apparatus.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.electricalcomponentsandequipment, TariffIndustryId.industrialMachineryAndSupplies],
    // Heavy electrical equipment shares chapter 85 with electricalcomponentsandequipment (canonical owner).
    primaryChapterNumber: 85,
  },
  IndustrialMachineryAndSupplies: {
    name: 'Industrial Machinery & Supplies',
    industryId: TariffIndustryId.industrialMachineryAndSupplies,
    reportTitle: 'Tariffs on Industrial Machinery and Components',
    reportOneLiner: 'Analysis of duties on industrial equipment and machine parts.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.heavyElectricalEquipment, TariffIndustryId.constructionMachineryAndHeavyTransportationEquipment],
    htsChapters: chapters(84),
  },
  AerospaceAndDefense: {
    name: 'Aerospace & Defense',
    industryId: TariffIndustryId.aerospaceAndDefense,
    reportTitle: 'Tariff Effects on Aerospace Products',
    reportOneLiner: 'Evaluates import duties on aircraft, spacecraft, and defense equipment.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.industrialMachineryAndSupplies, TariffIndustryId.semiconductors],
    htsChapters: chapters(88, 93),
  },
  ConstructionMachineryAndHeavyTransportationEquipment: {
    name: 'Construction Machinery & Heavy Transportation Equipment',
    industryId: TariffIndustryId.constructionMachineryAndHeavyTransportationEquipment,
    reportTitle: 'Tariffs on Construction and Heavy Transport Machinery',
    reportOneLiner: 'Covers duties on excavators, bulldozers, and heavy transport vehicles.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.automobiles, TariffIndustryId.industrialMachineryAndSupplies],
    htsChapters: chapters(86, 89),
  },
  HealthCareEquipment: {
    name: 'Health Care Equipment',
    industryId: TariffIndustryId.healthCareEquipment,
    reportTitle: 'Impact of Tariffs on Health Care Equipment',
    reportOneLiner: 'Analysis of how import duties affect medical devices and health care equipment supply chains.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.pharmaceuticals, TariffIndustryId.industrialMachineryAndSupplies],
    htsChapters: chapters(90),
  },
  HousewaresAndSpecialties: {
    name: 'Housewares & Specialties',
    industryId: TariffIndustryId.housewaresAndSpecialties,
    reportTitle: 'Impact of Tariffs on Housewares & Specialties',
    reportOneLiner: 'A look at how U.S. tariffs on home goods and specialty housewares affect costs and market access.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.homefurnishings, TariffIndustryId.householdAppliances],
    htsChapters: chapters(82),
  },
  TiresAndRubber: {
    name: 'Tires & Rubber',
    industryId: TariffIndustryId.tiresAndRubber,
    reportTitle: 'Impact of Tariffs on Tires & Rubber',
    reportOneLiner: 'Analysis of how import duties affect tire manufacturing and rubber products supply chains.',
    headingsCount: 3,
    subHeadingsCount: 2,
    establishedPlayersCount: 3,
    newChallengersCount: 3,
    companiesToIgnore: [],
    relatedIndustryIds: [TariffIndustryId.automobiles, TariffIndustryId.industrialMachineryAndSupplies],
    htsChapters: chapters(40),
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

// Returns the chapter rendered on this industry's existing URLs after the chapter content swap.
// undefined when the industry has no chapter assigned (no swap; existing content is preserved).
export function getPrimaryChapterForIndustry(industry: TariffIndustryDefinition): HtsChapterRef | undefined {
  if (industry.primaryChapterNumber !== undefined) {
    return HTS_CHAPTERS[industry.primaryChapterNumber];
  }
  return industry.htsChapters?.[0];
}

// Returns the canonical-owner industry for a given HTS chapter (the one that has the chapter in
// its htsChapters list). Secondary industries that share the chapter via primaryChapterNumber do
// not "own" it. Used to route a chapter URL back to its industry context (breadcrumbs, nav).
export function getCanonicalIndustryForChapter(chapterNumber: number): TariffIndustryDefinition | undefined {
  return Object.values(TariffIndustries).find((industry) => industry.htsChapters?.some((chapter) => chapter.number === chapterNumber));
}

// `52-cotton` -> 52. Returns undefined if the leading segment is not a 1-2 digit number, so route
// handlers can call notFound() on malformed slugs.
export function parseChapterNumberFromSlug(chapterSlug: string): number | undefined {
  const match = chapterSlug.match(/^(\d{1,2})(?:-|$)/);
  if (!match) return undefined;
  const n = Number.parseInt(match[1], 10);
  return n >= 1 && n <= 99 ? n : undefined;
}

// Canonical chapter slug used in URLs: `{number}-{slug}`. Always derived from HTS_CHAPTERS so
// renames flow through one place and the same chapter never has two URL forms.
export function chapterUrlSlug(chapter: HtsChapterRef): string {
  return `${chapter.number}-${chapter.slug}`;
}

// True when the chapter is the primary chapter of some industry, i.e. its content lives at the
// industry's URL. Non-primary chapters get their own /industry-tariff-report/chapter/<slug> URL.
export function isPrimaryChapter(chapterNumber: number): boolean {
  return Object.values(TariffIndustries).some((industry) => getPrimaryChapterForIndustry(industry)?.number === chapterNumber);
}

// Returns the industry whose URL represents this chapter (chapter is its primary). Used to redirect
// a /chapter/<slug> URL to the industry URL when a primary owner exists.
export function getIndustryForPrimaryChapter(chapterNumber: number): TariffIndustryDefinition | undefined {
  return Object.values(TariffIndustries).find((industry) => getPrimaryChapterForIndustry(industry)?.number === chapterNumber);
}

// All chapters covered by an industry — both primary (htsChapters[0] / primaryChapterNumber) and
// non-primary. Used to render the "Related HTS Chapters" cross-link block on the industry page.
export function getAllChaptersForIndustry(industry: TariffIndustryDefinition): HtsChapterRef[] {
  if (industry.htsChapters && industry.htsChapters.length > 0) return industry.htsChapters;
  if (industry.primaryChapterNumber !== undefined) {
    const c = HTS_CHAPTERS[industry.primaryChapterNumber];
    return c ? [c] : [];
  }
  return [];
}

// Chapter numbers that need their own /chapter/<slug> URL — every chapter that isn't already
// represented by some industry's URL via `isPrimaryChapter`.
export function chapterNumbersWithoutPrimaryIndustry(): number[] {
  return Object.keys(HTS_CHAPTERS)
    .map(Number)
    .filter((n) => !isPrimaryChapter(n));
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
