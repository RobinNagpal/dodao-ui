import introduction from '@/../reports-out/plastic/02-introduction/introduction.json';
import tariffUpdates from '@/../reports-out/plastic/03-tariff-updates/tariff-updates.json';
import understandIndustry from '@/../reports-out/plastic/04-understand-industry/understand-industry.json';
import industryAreas from '@/../reports-out/plastic/05-industry-areas/industry-area.json';
import finalConclusion from '@/../reports-out/plastic/07-final-conclusion/final-conclusion.json';
import industryAreaHeadings from '@/../reports-out/plastic/industry-headings.json';
import { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
// Sample data for demonstration
const sampleReport: IndustryTariffReport = {
  industryAreaHeadings: industryAreaHeadings,
  executiveSummary: {
    title: 'Executive Summary',
    executiveSummary:
      'This report provides a comprehensive analysis of the automotive industry, focusing on tariff impacts across various segments including electric vehicles and traditional manufacturers.',
  },
  introduction,
  tariffUpdates: tariffUpdates,
  understandIndustry: understandIndustry,
  industryAreas: industryAreas,
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
  finalConclusion,
};
async function getHandler(): Promise<IndustryTariffReport> {
  console.log('Fetching industry tariff report...');
  return sampleReport;
}

export const GET = withErrorHandlingV2<IndustryTariffReport>(getHandler);
