import PrivateWrapper from '@/components/auth/PrivateWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Metadata } from 'next';
import Link from 'next/link';
import TickerActionsDropdown from './[tickerKey]/TickerActionsDropdown';

export async function generateMetadata(props: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const { page } = await props.searchParams;
  const currentPage = parseInt(page || '1');
  const base = 'https://koalagains.com/public-equities/tickers';
  return {
    title: 'REIT Tickers | KoalaGains',
    description:
      'Explore all available REIT tickers. Dive into detailed AI-driven financial reports, analyze key metrics, and streamline your public equities research on KoalaGains.',
    alternates: {
      canonical: currentPage === 1 ? base : `${base}?page=${currentPage}`,
    },
    keywords: [
      'REIT tickers',
      'Tickers List',
      'Public Equities',
      'REIT Financial Reports',
      'KoalaGains',
      'REIT Analysis',
      'Real Estate Investment Trusts',
      'REIT list',
      'Public REITs',
      'REIT performance scores',
    ],
  };
}

const breadcrumbs: BreadcrumbsOjbect[] = [
  {
    name: 'Reports',
    href: `/reports`,
    current: false,
  },
  {
    name: 'REIT Reports',
    href: `/public-equities/tickers`,
    current: true,
  },
];

// Add viewport meta tag if not already in your _document.js or layout component
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// Define REIT types and their tickers
interface ReitData {
  ticker: string;
  name: string;
  type: string;
}

// Define the REIT types and their tickers
const reitsByType: Record<string, ReitData[]> = {
  Retail: [
    { ticker: 'SPG', name: 'Simon Property Group, Inc.', type: 'REIT - Retail' },
    { ticker: 'O', name: 'Realty Income Corporation', type: 'REIT - Retail' },
    { ticker: 'KIM', name: 'Kimco Realty Corporation', type: 'REIT - Retail' },
    { ticker: 'REG', name: 'Regency Centers Corporation', type: 'REIT - Retail' },
    { ticker: 'FRT', name: 'Federal Realty Investment Trust', type: 'REIT - Retail' },
    { ticker: 'BRX', name: 'Brixmor Property Group Inc.', type: 'REIT - Retail' },
    { ticker: 'ADC', name: 'Agree Realty Corporation', type: 'REIT - Retail' },
    { ticker: 'NNN', name: 'NNN REIT, Inc.', type: 'REIT - Retail' },
    { ticker: 'EPRT', name: 'Essential Properties Realty Trust, Inc.', type: 'REIT - Retail' },
    { ticker: 'KRG', name: 'Kite Realty Group Trust', type: 'REIT - Retail' },
    { ticker: 'PECO', name: 'Phillips Edison & Company, Inc.', type: 'REIT - Retail' },
    { ticker: 'MAC', name: 'The Macerich Company', type: 'REIT - Retail' },
    { ticker: 'SKT', name: 'Tanger Inc.', type: 'REIT - Retail' },
    { ticker: 'FCPT', name: 'Four Corners Property Trust, Inc.', type: 'REIT - Retail' },
    { ticker: 'AKR', name: 'Acadia Realty Trust', type: 'REIT - Retail' },
    { ticker: 'UE', name: 'Urban Edge Properties', type: 'REIT - Retail' },
    { ticker: 'CURB', name: 'Curbline Properties Corp.', type: 'REIT - Retail' },
    { ticker: 'IVT', name: 'InvenTrust Properties Corp.', type: 'REIT - Retail' },
    { ticker: 'GTY', name: 'Getty Realty Corp.', type: 'REIT - Retail' },
    { ticker: 'NTST', name: 'NETSTREIT Corp.', type: 'REIT - Retail' },
    { ticker: 'ALEX', name: 'Alexander & Baldwin, Inc.', type: 'REIT - Retail' },
    { ticker: 'BFS', name: 'Saul Centers, Inc.', type: 'REIT - Retail' },
    { ticker: 'ALX', name: "Alexander's, Inc.", type: 'REIT - Retail' },
    { ticker: 'CBL', name: 'CBL & Associates Properties, Inc.', type: 'REIT - Retail' },
    { ticker: 'WSR', name: 'Whitestone REIT', type: 'REIT - Retail' },
    { ticker: 'SITC', name: 'SITE Centers Corp.', type: 'REIT - Retail' },
    { ticker: 'PINE', name: 'Alpine Income Property Trust, Inc.', type: 'REIT - Retail' },
    // { ticker: 'WHLR', name: 'Wheeler Real Estate Investment Trust, Inc.', type: 'REIT - Retail' },
  ],
  // Mortgage: [
  //   { ticker: 'NLY', name: 'Annaly Capital Management, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'AGNCM', name: 'AGNC Investment Corp.', type: 'REIT - Mortgage' },
  //   { ticker: 'AGNC', name: 'AGNC Investment Corp.', type: 'REIT - Mortgage' },
  //   { ticker: 'STWD', name: 'Starwood Property Trust, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'RITM', name: 'Rithm Capital Corp.', type: 'REIT - Mortgage' },
  //   { ticker: 'BXMT', name: 'Blackstone Mortgage Trust, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'ABR', name: 'Arbor Realty Trust, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'ARR', name: 'ARMOUR Residential REIT, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'DX', name: 'Dynex Capital, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'LADR', name: 'Ladder Capital Corp', type: 'REIT - Mortgage' },
  //   { ticker: 'ARI', name: 'Apollo Commercial Real Estate Finance, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'EFC', name: 'Ellington Financial Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'CIM', name: 'Chimera Investment Corporation', type: 'REIT - Mortgage' },
  //   { ticker: 'PMT', name: 'PennyMac Mortgage Investment Trust', type: 'REIT - Mortgage' },
  //   { ticker: 'TWO', name: 'Two Harbors Investment Corp.', type: 'REIT - Mortgage' },
  //   { ticker: 'MFA', name: 'MFA Financial, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'ORC', name: 'Orchid Island Capital, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'FBRT', name: 'Franklin BSP Realty Trust, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'RWT', name: 'Redwood Trust, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'BRSP', name: 'BrightSpire Capital, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'TRTX', name: 'TPG RE Finance Trust, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'NYMT', name: 'New York Mortgage Trust, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'RC', name: 'Ready Capital Corporation', type: 'REIT - Mortgage' },
  //   { ticker: 'KREF', name: 'KKR Real Estate Finance Trust Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'IVR', name: 'Invesco Mortgage Capital Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'CMTG', name: 'Claros Mortgage Trust, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'NREF', name: 'NexPoint Real Estate Finance, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'REFI', name: 'Chicago Atlantic Real Estate Finance, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'ACRE', name: 'Ares Commercial Real Estate Corporation', type: 'REIT - Mortgage' },
  //   { ticker: 'AOMR', name: 'Angel Oak Mortgage REIT, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'MITT', name: 'AG Mortgage Investment Trust, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'SEVN', name: 'Seven Hills Realty Trust', type: 'REIT - Mortgage' },
  //   { ticker: 'ACR', name: 'ACRES Commercial Realty Corp.', type: 'REIT - Mortgage' },
  //   { ticker: 'SUNS', name: 'Sunrise Realty Trust, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'GPMT', name: 'Granite Point Mortgage Trust Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'RPT', name: 'Rithm Property Trust Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'LFT', name: 'Lument Finance Trust, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'CHMI', name: 'Cherry Hill Mortgage Investment Corporation', type: 'REIT - Mortgage' },
  //   { ticker: 'AFCG', name: 'Advanced Flower Capital Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'LOAN', name: 'Manhattan Bridge Capital, Inc.', type: 'REIT - Mortgage' },
  //   { ticker: 'SACH', name: 'Sachem Capital Corp.', type: 'REIT - Mortgage' },
  // ],
  Office: [
    { ticker: 'ARE', name: 'Alexandria Real Estate Equities, Inc.', type: 'REIT - Office' },
    { ticker: 'BXP', name: 'BXP, Inc.', type: 'REIT - Office' },
    { ticker: 'VNO', name: 'Vornado Realty Trust', type: 'REIT - Office' },
    { ticker: 'CUZ', name: 'Cousins Properties Incorporated', type: 'REIT - Office' },
    { ticker: 'KRC', name: 'Kilroy Realty Corporation', type: 'REIT - Office' },
    { ticker: 'SLG', name: 'SL Green Realty Corp.', type: 'REIT - Office' },
    { ticker: 'CDP', name: 'COPT Defense Properties', type: 'REIT - Office' },
    { ticker: 'HIW', name: 'Highwoods Properties, Inc.', type: 'REIT - Office' },
    // { ticker: 'DEI', name: 'Douglas Emmett, Inc.', type: 'REIT - Office' },
    // { ticker: 'ESBA', name: 'Empire State Realty OP, L.P.', type: 'REIT - Office' },
    { ticker: 'PGRE', name: 'Paramount Group, Inc.', type: 'REIT - Office' },
    { ticker: 'JBGS', name: 'JBG SMITH Properties', type: 'REIT - Office' },
    { ticker: 'DEA', name: 'Easterly Government Properties, Inc.', type: 'REIT - Office' },
    { ticker: 'HPP', name: 'Hudson Pacific Properties, Inc.', type: 'REIT - Office' },
    { ticker: 'PDM', name: 'Piedmont Realty Trust, Inc.', type: 'REIT - Office' },
    { ticker: 'BDN', name: 'Brandywine Realty Trust', type: 'REIT - Office' },
    { ticker: 'PSTL', name: 'Postal Realty Trust, Inc.', type: 'REIT - Office' },
    { ticker: 'PKST', name: 'Peakstone Realty Trust', type: 'REIT - Office' },
    // { ticker: 'NLOP', name: 'Net Lease Office Properties', type: 'REIT - Office' },
    { ticker: 'CIO', name: 'City Office REIT, Inc.', type: 'REIT - Office' },
    { ticker: 'FSP', name: 'Franklin Street Properties Corp.', type: 'REIT - Office' },
    { ticker: 'ONL', name: 'Orion Properties Inc.', type: 'REIT - Office' },
    { ticker: 'OPI', name: 'Office Properties Income Trust', type: 'REIT - Office' },
    { ticker: 'CMCT', name: 'Creative Media & Community Trust Corporation', type: 'REIT - Office' },
  ],
  Residential: [
    { ticker: 'AVB', name: 'AvalonBay Communities, Inc.', type: 'REIT - Residential' },
    { ticker: 'EQR', name: 'Equity Residential', type: 'REIT - Residential' },
    { ticker: 'INVH', name: 'Invitation Homes Inc.', type: 'REIT - Residential' },
    { ticker: 'ESS', name: 'Essex Property Trust, Inc.', type: 'REIT - Residential' },
    { ticker: 'MAA', name: 'Mid-America Apartment Communities, Inc.', type: 'REIT - Residential' },
    { ticker: 'SUI', name: 'Sun Communities, Inc.', type: 'REIT - Residential' },
    { ticker: 'AMH', name: 'American Homes 4 Rent', type: 'REIT - Residential' },
    { ticker: 'UDR', name: 'UDR, Inc.', type: 'REIT - Residential' },
    { ticker: 'ELS', name: 'Equity LifeStyle Properties, Inc.', type: 'REIT - Residential' },
    { ticker: 'CPT', name: 'Camden Property Trust', type: 'REIT - Residential' },
    // { ticker: 'MRP', name: 'Millrose Properties, Inc.', type: 'REIT - Residential' },
    { ticker: 'IRT', name: 'Independence Realty Trust, Inc.', type: 'REIT - Residential' },
    { ticker: 'ELME', name: 'Elme Communities', type: 'REIT - Residential' },
    { ticker: 'VRE', name: 'Veris Residential, Inc.', type: 'REIT - Residential' },
    // { ticker: 'UMH', name: 'UMH Properties, Inc.', type: 'REIT - Residential' },
    { ticker: 'AIV', name: 'Apartment Investment and Management Company', type: 'REIT - Residential' },
    { ticker: 'CSR', name: 'Centerspace', type: 'REIT - Residential' },
    { ticker: 'NXRT', name: 'NexPoint Residential Trust, Inc.', type: 'REIT - Residential' },
    { ticker: 'BRT', name: 'BRT Apartments Corp.', type: 'REIT - Residential' },
    { ticker: 'CLPR', name: 'Clipper Realty Inc.', type: 'REIT - Residential' },
    { ticker: 'BHM', name: 'Bluerock Homes Trust, Inc.', type: 'REIT - Residential' },
  ],
  Industrial: [
    { ticker: 'PLD', name: 'Prologis, Inc.', type: 'REIT - Industrial' },
    { ticker: 'PSA', name: 'Public Storage', type: 'REIT - Industrial' },
    { ticker: 'EXR', name: 'Extra Space Storage Inc.', type: 'REIT - Industrial' },
    { ticker: 'LINE', name: 'Lineage, Inc.', type: 'REIT - Industrial' },
    // { ticker: 'REXR', name: 'Rexford Industrial Realty, Inc.', type: 'REIT - Industrial' },
    { ticker: 'CUBE', name: 'CubeSmart', type: 'REIT - Industrial' },
    { ticker: 'EGP', name: 'EastGroup Properties, Inc.', type: 'REIT - Industrial' },
    { ticker: 'FR', name: 'First Industrial Realty Trust, Inc.', type: 'REIT - Industrial' },
    { ticker: 'STAG', name: 'STAG Industrial, Inc.', type: 'REIT - Industrial' },
    { ticker: 'TRNO', name: 'Terreno Realty Corporation', type: 'REIT - Industrial' },
    { ticker: 'COLD', name: 'Americold Realty Trust, Inc.', type: 'REIT - Industrial' },
    { ticker: 'NSA', name: 'National Storage Affiliates Trust', type: 'REIT - Industrial' },
    { ticker: 'LXP', name: 'LXP Industrial Trust', type: 'REIT - Industrial' },
    { ticker: 'SMA', name: 'SmartStop Self Storage REIT, Inc.', type: 'REIT - Industrial' },
    // { ticker: 'IIPR', name: 'Innovative Industrial Properties, Inc.', type: 'REIT - Industrial' },
    { ticker: 'PLYM', name: 'Plymouth Industrial REIT, Inc.', type: 'REIT - Industrial' },
    { ticker: 'ILPT', name: 'Industrial Logistics Properties Trust', type: 'REIT - Industrial' },
    { ticker: 'MDV', name: 'Modiv Industrial, Inc.', type: 'REIT - Industrial' },
  ],
  Specialty: [
    { ticker: 'AMT', name: 'American Tower Corporation', type: 'REIT - Specialty' },
    { ticker: 'EQIX', name: 'Equinix, Inc.', type: 'REIT - Specialty' },
    { ticker: 'DLR', name: 'Digital Realty Trust, Inc.', type: 'REIT - Specialty' },
    { ticker: 'CCI', name: 'Crown Castle Inc.', type: 'REIT - Specialty' },
    { ticker: 'IRM', name: 'Iron Mountain Incorporated', type: 'REIT - Specialty' },
    { ticker: 'SBAC', name: 'SBA Communications Corporation', type: 'REIT - Specialty' },
    { ticker: 'WY', name: 'Weyerhaeuser Company', type: 'REIT - Specialty' },
    // { ticker: 'GLPI', name: 'Gaming and Leisure Properties, Inc.', type: 'REIT - Specialty' },
    { ticker: 'LAMR', name: 'Lamar Advertising Company', type: 'REIT - Specialty' },
    { ticker: 'RYN', name: 'Rayonier Inc.', type: 'REIT - Specialty' },
    { ticker: 'EPR', name: 'EPR Properties', type: 'REIT - Specialty' },
    { ticker: 'PCH', name: 'PotlatchDeltic Corporation', type: 'REIT - Specialty' },
    { ticker: 'OUT', name: 'OUTFRONT Media Inc.', type: 'REIT - Specialty' },
    { ticker: 'UNIT', name: 'Unity Group LLC', type: 'REIT - Specialty' },
    // { ticker: 'FPI', name: 'Farmland Partners Inc.', type: 'REIT - Specialty' },
    { ticker: 'LAND', name: 'Gladstone Land Corporation', type: 'REIT - Specialty' },
    { ticker: 'SELF', name: 'Global Self Storage, Inc.', type: 'REIT - Specialty' },
    // { ticker: 'PW', name: 'Power REIT', type: 'REIT - Specialty' },
  ],
  Healthcare: [
    { ticker: 'WELL', name: 'Welltower Inc.', type: 'REIT - Healthcare Facilities' },
    { ticker: 'VTR', name: 'Ventas, Inc.', type: 'REIT - Healthcare Facilities' },
    { ticker: 'OHI', name: 'Omega Healthcare Investors, Inc.', type: 'REIT - Healthcare Facilities' },
    { ticker: 'DOC', name: 'Healthpeak Properties, Inc.', type: 'REIT - Healthcare Facilities' },
    { ticker: 'CTRE', name: 'CareTrust REIT, Inc.', type: 'REIT - Healthcare Facilities' },
    { ticker: 'AHR', name: 'American Healthcare REIT, Inc.', type: 'REIT - Healthcare Facilities' },
    { ticker: 'HR', name: 'Healthcare Realty Trust Incorporated', type: 'REIT - Healthcare Facilities' },
    { ticker: 'SBRA', name: 'Sabra Health Care REIT, Inc.', type: 'REIT - Healthcare Facilities' },
    { ticker: 'NHI', name: 'National Health Investors, Inc.', type: 'REIT - Healthcare Facilities' },
    { ticker: 'MPW', name: 'Medical Properties Trust, Inc.', type: 'REIT - Healthcare Facilities' },
    { ticker: 'LTC', name: 'LTC Properties, Inc.', type: 'REIT - Healthcare Facilities' },
    { ticker: 'SILA', name: 'Sila Realty Trust, Inc.', type: 'REIT - Healthcare Facilities' },
    { ticker: 'DHC', name: 'Diversified Healthcare Trust', type: 'REIT - Healthcare Facilities' },
    { ticker: 'STRW', name: 'Strawberry Fields REIT, Inc.', type: 'REIT - Healthcare Facilities' },
    // { ticker: 'UHT', name: 'Universal Health Realty Income Trust', type: 'REIT - Healthcare Facilities' },
    { ticker: 'GMRE', name: 'Global Medical REIT Inc.', type: 'REIT - Healthcare Facilities' },
    { ticker: 'CHCT', name: 'Community Healthcare Trust Incorporated', type: 'REIT - Healthcare Facilities' },
  ],
  'Hotel and Motel': [
    { ticker: 'HST', name: 'Host Hotels & Resorts, Inc.', type: 'REIT - Hotel & Motel' },
    { ticker: 'RHP', name: 'Ryman Hospitality Properties, Inc.', type: 'REIT - Hotel & Motel' },
    { ticker: 'APLE', name: 'Apple Hospitality REIT, Inc.', type: 'REIT - Hotel & Motel' },
    { ticker: 'PK', name: 'Park Hotels & Resorts Inc.', type: 'REIT - Hotel & Motel' },
    { ticker: 'SHO', name: 'Sunstone Hotel Investors, Inc.', type: 'REIT - Hotel & Motel' },
    { ticker: 'DRH', name: 'DiamondRock Hospitality Company', type: 'REIT - Hotel & Motel' },
    { ticker: 'XHR', name: 'Xenia Hotels & Resorts, Inc.', type: 'REIT - Hotel & Motel' },
    { ticker: 'PEB', name: 'Pebblebrook Hotel Trust', type: 'REIT - Hotel & Motel' },
    { ticker: 'RLJ', name: 'RLJ Lodging Trust', type: 'REIT - Hotel & Motel' },
    { ticker: 'INN', name: 'Summit Hotel Properties, Inc.', type: 'REIT - Hotel & Motel' },
    { ticker: 'SVC', name: 'Service Properties Trust', type: 'REIT - Hotel & Motel' },
    { ticker: 'CLDT', name: 'Chatham Lodging Trust', type: 'REIT - Hotel & Motel' },
    { ticker: 'BHR', name: 'Braemar Hotels & Resorts Inc.', type: 'REIT - Hotel & Motel' },
    { ticker: 'AHT', name: 'Ashford Hospitality Trust, Inc.', type: 'REIT - Hotel & Motel' },
    // { ticker: 'IHT', name: 'InnSuites Hospitality Trust', type: 'REIT - Hotel & Motel' },
    { ticker: 'SOHO', name: 'Sotherly Hotels Inc.', type: 'REIT - Hotel & Motel' },
  ],
  Diversified: [
    { ticker: 'VICI', name: 'VICI Properties Inc.', type: 'REIT - Diversified' },
    { ticker: 'WPC', name: 'W. P. Carey Inc.', type: 'REIT - Diversified' },
    { ticker: 'BNL', name: 'Broadstone Net Lease, Inc.', type: 'REIT - Diversified' },
    { ticker: 'ESRT', name: 'Empire State Realty Trust, Inc.', type: 'REIT - Diversified' },
    { ticker: 'GNL', name: 'Global Net Lease, Inc.', type: 'REIT - Diversified' },
    { ticker: 'AAT', name: 'American Assets Trust, Inc.', type: 'REIT - Diversified' },
    { ticker: 'SAFE', name: 'Safehold Inc.', type: 'REIT - Diversified' },
    { ticker: 'AHH', name: 'Armada Hoffler Properties, Inc.', type: 'REIT - Diversified' },
    { ticker: 'GOOD', name: 'Gladstone Commercial Corporation', type: 'REIT - Diversified' },
    { ticker: 'CTO', name: 'CTO Realty Growth, Inc.', type: 'REIT - Diversified' },
    { ticker: 'OLP', name: 'One Liberty Properties, Inc.', type: 'REIT - Diversified' },
    { ticker: 'FVR', name: 'FrontView REIT, Inc.', type: 'REIT - Diversified' },
    { ticker: 'MDRR', name: 'Medalist Diversified REIT, Inc.', type: 'REIT - Diversified' },
    // { ticker: 'SQFT', name: 'Presidio Property Trust, Inc.', type: 'REIT - Diversified' },
    // { ticker: 'MKZR', name: 'MacKenzie Realty Capital, Inc.', type: 'REIT - Diversified' },
    // { ticker: 'GIPR', name: 'Generation Income Properties, Inc.', type: 'REIT - Diversified' },
  ],
};

export default async function AllTickersPage(props: { searchParams: Promise<{ page?: string }> }) {
  return (
    <Tooltip.Provider delayDuration={300}>
      <PageWrapper className="px-4 sm:px-6">
        <div className="overflow-x-auto">
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
        <PrivateWrapper>
          <div className="flex flex-wrap justify-end gap-2 mb-4">
            <Link href={'/public-equities/analysis-factors'} className="link-color border border-color rounded-xl p-2 text-sm sm:text-base whitespace-nowrap">
              View Analysis Factors V1
            </Link>
            <Link
              href={'/public-equities/industry-group-criteria/real-estate/equity-real-estate-investment-trusts-reits/create'}
              className="link-color border border-color rounded-xl p-2 text-sm sm:text-base whitespace-nowrap"
            >
              View Criteria
            </Link>
            <Link href={'/public-equities/tickers/create'} className="link-color border border-color rounded-xl p-2 text-sm sm:text-base whitespace-nowrap">
              Create Ticker
            </Link>
          </div>
        </PrivateWrapper>
        <div className="flex justify-end mb-4">
          <Link
            href={'/public-equities/tickers/compare-metrics-and-checklist'}
            className="link-color border border-color rounded-xl p-2 text-sm sm:text-base whitespace-nowrap"
          >
            Metrics Comparison
          </Link>
        </div>

        {/* REIT Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 auto-rows-auto grid-flow-row-dense">
          {Object.entries(reitsByType).map(([reitType, reits]) => (
            <div key={reitType} className="bg-block-bg-color rounded-lg shadow-sm border border-color overflow-hidden h-full flex flex-col">
              <div className="px-4 py-5 sm:px-6 border-b border-color flex">
                <h3 className="text-lg font-medium heading-color">{reitType} REITs</h3>
                <p className="mt-1 text-sm text-color ml-1">
                  ({reits.length} {reits.length === 1 ? 'company' : 'companies'})
                </p>
              </div>
              <ul className="divide-color flex-grow">
                {reits.map((reit) => {
                  // Find the ticker in the fetched data if available

                  return (
                    <li key={reit.ticker} className="px-4 py-1 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0 w-full">
                        <div className="flex items-center justify-between">
                          <Link href={`/public-equities/tickers/${reit.ticker}`} className="link-color primary-text-color">
                            <div className="flex gap-2">
                              <p className="whitespace-nowrap rounded-md px-1.5 py-1 text-xs font-medium ring-1 ring-inset ring-border primary-text-color self-center">
                                {reit.ticker}
                              </p>
                              <p className="text-sm font-normal text-break break-all">{reit.name}</p>
                            </div>
                          </Link>
                          <PrivateWrapper>
                            <div className="scale-90 sm:scale-100">
                              <TickerActionsDropdown tickerKey={reit.ticker} />
                            </div>
                          </PrivateWrapper>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </PageWrapper>
    </Tooltip.Provider>
  );
}
