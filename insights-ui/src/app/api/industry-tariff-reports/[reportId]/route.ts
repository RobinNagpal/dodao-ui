import { prisma } from '@/prisma';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Ticker } from '@prisma/client';

// Sample data for demonstration
const sampleReport: IndustryTariffReport = {
  industryAreaHeadings: {
    headings: [
      {
        title: 'Automotive Industry',
        oneLineSummary: 'Overview of the automotive manufacturing sector',
        subHeadings: [
          {
            title: 'Electric Vehicles',
            oneLineSummary: 'The growing EV market segment',
            companies: [
              { name: 'Tesla', ticker: 'TSLA' },
              { name: 'Rivian', ticker: 'RIVN' },
            ],
          },
          {
            title: 'Traditional Vehicles',
            oneLineSummary: 'Established automotive manufacturers',
            companies: [
              { name: 'Ford', ticker: 'F' },
              { name: 'General Motors', ticker: 'GM' },
            ],
          },
        ],
      },
    ],
  },
  executiveSummary: {
    title: 'Executive Summary',
    executiveSummary:
      'This report provides a comprehensive analysis of the automotive industry, focusing on tariff impacts across various segments including electric vehicles and traditional manufacturers.',
  },
  introduction: {
    aboutSector: {
      title: 'About the Automotive Sector',
      aboutSector: 'The automotive sector is a global industry involved in the design, development, manufacturing, marketing, and selling of motor vehicles.',
    },
    aboutConsumption: {
      title: 'Consumption Patterns',
      aboutConsumption: 'Global automotive consumption has shifted toward electric vehicles and more fuel-efficient options in recent years.',
    },
    pastGrowth: {
      title: 'Historical Growth',
      aboutGrowth: 'The automotive industry has seen steady growth over the past decade with emerging markets driving much of the expansion.',
    },
    futureGrowth: {
      title: 'Future Growth Projections',
      aboutGrowth: 'Future growth is expected to be driven by electric vehicles, autonomous driving technology, and connected car services.',
    },
    usProduction: {
      title: 'US Production',
      aboutProduction: 'US automotive production remains significant globally, with major manufacturing centers in Michigan, Tennessee, and Alabama.',
    },
    countrySpecificImports: [
      {
        title: 'Imports from China',
        aboutImport: 'Chinese automotive imports to the US have increased, particularly in parts and components.',
      },
      {
        title: 'Imports from Mexico',
        aboutImport: 'Mexico is a major source of automotive imports to the US due to USMCA trade agreements.',
      },
    ],
  },
  tariffUpdates: {
    countrySpecificTariffs: [
      {
        countryName: 'China',
        tariffDetails: '25% tariff on automotive parts and components',
        changes: 'Increased from 10% in 2023',
      },
      {
        countryName: 'European Union',
        tariffDetails: '15% tariff on luxury vehicles',
        changes: 'New tariff implemented in 2024',
      },
    ],
  },
  understandIndustry: {
    title: 'Understanding the Automotive Industry',
    sections: [
      {
        title: 'Market Structure',
        paragraphs: [
          'The automotive industry is highly consolidated with a few major players dominating global production.',
          'Emerging electric vehicle manufacturers are disrupting traditional market structures.',
        ],
      },
      {
        title: 'Supply Chain',
        paragraphs: [
          'Automotive supply chains are complex and global, with components sourced from dozens of countries.',
          'Recent disruptions have highlighted vulnerabilities in just-in-time manufacturing models.',
        ],
      },
    ],
  },
  industryAreas: [
    {
      title: 'Electric Vehicles',
      industryAreas: 'The electric vehicle segment is growing rapidly, with increasing consumer adoption and government incentives driving expansion.',
    },
    {
      title: 'Autonomous Driving',
      industryAreas: 'Self-driving technology is advancing quickly, with major investments from traditional automakers and tech companies.',
    },
  ],
  evaluateIndustryAreas: [
    {
      title: 'Electric Vehicles Segment',
      aboutParagraphs: [
        'The electric vehicle market has seen exponential growth over the past five years.',
        'Government incentives and environmental concerns are primary drivers of adoption.',
      ],
      newChallengers: [
        {
          companyName: 'Rivian',
          companyDescription: 'American electric vehicle manufacturer focused on trucks and SUVs',
          companyWebsite: 'rivian.com',
          companyTicker: 'RIVN',
          products: [
            {
              productName: 'R1T',
              productDescription: 'Electric pickup truck',
              percentageOfRevenue: '60%',
              competitors: ['Tesla Cybertruck', 'Ford F-150 Lightning'],
            },
          ],
          aboutManagement: 'Led by RJ Scaringe, focused on sustainable transportation',
          uniqueAdvantage: 'Purpose-built electric platform for trucks and SUVs',
          pastPerformance: {
            revenueGrowth: '150% YoY',
            costOfRevenue: 'High due to scaling production',
            profitabilityGrowth: 'Not yet profitable',
            rocGrowth: 'Negative but improving',
          },
          futureGrowth: {
            revenueGrowth: 'Expected 200% over next 3 years',
            costOfRevenue: 'Projected to decrease with scale',
            profitabilityGrowth: 'Profitability expected by 2026',
            rocGrowth: 'Positive by 2027',
          },
          competitors: 'Tesla, Ford, GM',
          impactOfTariffs: 'Moderate negative impact due to component sourcing from China',
        },
      ],
      establishedPlayers: [
        {
          companyName: 'Tesla',
          companyDescription: 'Leading electric vehicle manufacturer',
          companyWebsite: 'tesla.com',
          companyTicker: 'TSLA',
          products: [
            {
              productName: 'Model 3',
              productDescription: 'Mass-market electric sedan',
              percentageOfRevenue: '40%',
              competitors: ['Polestar 2', 'BMW i4'],
            },
          ],
          aboutManagement: 'Led by Elon Musk, focused on accelerating sustainable transportation',
          uniqueAdvantage: 'Vertical integration and proprietary battery technology',
          pastPerformance: {
            revenueGrowth: '50% YoY',
            costOfRevenue: 'Decreasing with scale',
            profitabilityGrowth: 'Positive and increasing',
            rocGrowth: 'Strong positive trend',
          },
          futureGrowth: {
            revenueGrowth: 'Projected 30% annually',
            costOfRevenue: 'Expected to continue decreasing',
            profitabilityGrowth: 'Continued improvement',
            rocGrowth: 'Stable positive growth',
          },
          competitors: 'Traditional automakers entering EV space',
          impactOfTariffs: 'Mixed impact - some negative from component tariffs, positive from competing import tariffs',
        },
      ],
      headwindsAndTailwinds: {
        headwinds: ['Battery material supply constraints', 'Charging infrastructure limitations', 'Increasing competition'],
        tailwinds: ['Government incentives', 'Decreasing battery costs', 'Growing consumer demand for sustainable transportation'],
      },
      positiveTariffImpactOnCompanyType: [
        {
          companyType: 'Domestic manufacturers',
          impact: 'Positive',
          reasoning: 'Tariffs on imported vehicles provide competitive advantage for domestic production',
        },
      ],
      negativeTariffImpactOnCompanyType: [
        {
          companyType: 'Companies reliant on Chinese components',
          impact: 'Negative',
          reasoning: 'Increased costs for battery components and electronics sourced from China',
        },
      ],
      tariffImpactSummary:
        'Overall, tariffs have mixed impacts on the EV segment, with domestic manufacturers gaining advantages while those dependent on global supply chains facing increased costs.',
    },
  ],
  finalConclusion: {
    title: 'Final Conclusion',
    conclusionBrief:
      'The automotive industry is undergoing significant transformation driven by electrification, with tariffs playing an important role in shaping competitive dynamics.',
    positiveImpacts: {
      title: 'Positive Tariff Impacts',
      positiveImpacts: 'Tariffs have encouraged domestic manufacturing investment and reshoring of production, particularly in the electric vehicle segment.',
    },
    negativeImpacts: {
      title: 'Negative Tariff Impacts',
      negativeImpacts:
        'Higher component costs have increased vehicle prices for consumers and squeezed margins for manufacturers dependent on global supply chains.',
    },
    finalStatements:
      'Companies that can adapt to the changing tariff environment while navigating the transition to electric vehicles will be best positioned for long-term success in the automotive industry.',
  },
};
async function getHandler(): Promise<IndustryTariffReport> {
  console.log('Fetching industry tariff report...');
  return sampleReport;
}

export const GET = withErrorHandlingV2<IndustryTariffReport>(getHandler);
