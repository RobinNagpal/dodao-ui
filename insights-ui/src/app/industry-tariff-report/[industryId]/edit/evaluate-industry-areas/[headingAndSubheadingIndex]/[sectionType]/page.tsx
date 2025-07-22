import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { TariffIndustryId, getNumberOfSubHeadings } from '@/scripts/industry-tariff-reports/tariff-industries';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import EditEvaluateIndustryAreaClient from './EditEvaluateIndustryAreaClient';
import EditEstablishedPlayersClient from './EditEstablishedPlayersClient';
import EditNewChallengersClient from './EditNewChallengersClient';

interface EditEvaluateIndustryAreaPageProps {
  params: Promise<{
    industryId: TariffIndustryId;
    headingAndSubheadingIndex: string;
    sectionType: string;
  }>;
}

export default async function EditEvaluateIndustryAreaPage({ params }: EditEvaluateIndustryAreaPageProps) {
  const { industryId, headingAndSubheadingIndex, sectionType } = await params;
  const [headingString, subHeadingString] = headingAndSubheadingIndex.split('-');

  const headingIndex = Number.parseInt(headingString, 10);
  const subHeadingIndex = Number.parseInt(subHeadingString, 10);

  // For established-players and new-challengers, use specialized editors
  if (sectionType === 'established-players' || sectionType === 'new-challengers') {
    const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, { cache: 'no-cache' });

    if (!reportResponse.ok) {
      return <div className="text-red-500 p-4">Error: Failed to fetch report data</div>;
    }

    const report: IndustryTariffReport = await reportResponse.json();
    const indexInArray = headingIndex * getNumberOfSubHeadings(industryId) + subHeadingIndex;
    const evaluateIndustryArea = report?.evaluateIndustryAreas?.[indexInArray];

    if (!evaluateIndustryArea) {
      return <div className="text-red-500 p-4">Error: Evaluate industry area not found</div>;
    }

    if (sectionType === 'established-players') {
      return (
        <EditEstablishedPlayersClient
          industryId={industryId}
          headingAndSubheadingIndex={headingAndSubheadingIndex}
          initialPlayers={evaluateIndustryArea.establishedPlayerDetails || []}
        />
      );
    } else if (sectionType === 'new-challengers') {
      return (
        <EditNewChallengersClient
          industryId={industryId}
          headingAndSubheadingIndex={headingAndSubheadingIndex}
          initialChallengers={evaluateIndustryArea.newChallengersDetails || []}
        />
      );
    }
  }

  // For other sections, fetch the report data and convert to markdown
  let content = '';
  let error: string | null = null;

  try {
    const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, { cache: 'no-cache' });

    if (!reportResponse.ok) {
      throw new Error('Failed to fetch report data');
    }

    const report: IndustryTariffReport = await reportResponse.json();

    // Find the evaluate industry area using the correct calculation
    const indexInArray = headingIndex * getNumberOfSubHeadings(industryId) + subHeadingIndex;
    const evaluateIndustryArea = report?.evaluateIndustryAreas?.[indexInArray];

    if (!evaluateIndustryArea) {
      throw new Error('Evaluate industry area not found');
    }

    // Get content based on section type
    switch (sectionType) {
      case 'all':
        throw new Error('Editing the entire industry area is not supported. Please edit individual sections.');
      case 'about':
        content = evaluateIndustryArea.aboutParagraphs || '';
        break;
      case 'headwinds-and-tailwinds':
        content = convertHeadwindsAndTailwindsToMarkdown(evaluateIndustryArea.headwindsAndTailwinds);
        break;
      case 'tariff-impact-by-company-type':
        content = convertTariffImpactByCompanyTypeToMarkdown(
          evaluateIndustryArea.positiveTariffImpactOnCompanyType || [],
          evaluateIndustryArea.negativeTariffImpactOnCompanyType || []
        );
        break;
      case 'tariff-impact-summary':
        content = evaluateIndustryArea.tariffImpactSummary || '';
        break;
      default:
        if (sectionType.startsWith('established-player-')) {
          const ticker = sectionType.replace('established-player-', '');
          const player = evaluateIndustryArea.establishedPlayerDetails?.find((p) => p.companyTicker === ticker);
          content = player ? convertSingleEstablishedPlayerToMarkdown(player) : '';
        } else if (sectionType.startsWith('new-challenger-')) {
          const ticker = sectionType.replace('new-challenger-', '');
          const challenger = evaluateIndustryArea.newChallengersDetails?.find((c) => c.companyTicker === ticker);
          content = challenger ? convertSingleNewChallengerToMarkdown(challenger) : '';
        } else {
          throw new Error(`Unknown section type: ${sectionType}`);
        }
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to process content';
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <EditEvaluateIndustryAreaClient
      industryId={industryId}
      headingAndSubheadingIndex={headingAndSubheadingIndex}
      sectionType={sectionType}
      initialContent={content}
    />
  );
}

// Helper functions to convert data structures to markdown (kept for other sections)

function convertSingleEstablishedPlayerToMarkdown(player: any): string {
  const sections = [];

  if (player.companyDescription) {
    sections.push('**Description:**', player.companyDescription);
  }

  if (player.aboutManagement) {
    sections.push('**About Management:**', player.aboutManagement);
  }

  if (player.uniqueAdvantage) {
    sections.push('**Unique Advantage:**', player.uniqueAdvantage);
  }

  if (player.impactOfTariffs) {
    sections.push('**Impact of Tariffs:**', player.impactOfTariffs);
  }

  return sections.join('\n\n');
}

function convertSingleNewChallengerToMarkdown(challenger: any): string {
  const sections = [];

  if (challenger.companyDescription) {
    sections.push('**Description:**', challenger.companyDescription);
  }

  if (challenger.aboutManagement) {
    sections.push('**About Management:**', challenger.aboutManagement);
  }

  if (challenger.uniqueAdvantage) {
    sections.push('**Unique Advantage:**', challenger.uniqueAdvantage);
  }

  if (challenger.impactOfTariffs) {
    sections.push('**Impact of Tariffs:**', challenger.impactOfTariffs);
  }

  return sections.join('\n\n');
}

function convertHeadwindsAndTailwindsToMarkdown(headwindsAndTailwinds: any): string {
  const sections = [];

  if (headwindsAndTailwinds?.headwinds?.length) {
    sections.push('### Headwinds');
    headwindsAndTailwinds.headwinds.forEach((item: string) => {
      sections.push(`${item}`);
    });
  }

  if (headwindsAndTailwinds?.tailwinds?.length) {
    sections.push('### Tailwinds');
    headwindsAndTailwinds.tailwinds.forEach((item: string) => {
      sections.push(`${item}`);
    });
  }

  return sections.join('\n\n');
}

function convertTariffImpactByCompanyTypeToMarkdown(positive: any[], negative: any[]): string {
  const sections = [];

  if (positive?.length) {
    sections.push('### Positive Impact');
    positive.forEach((impact: any) => {
      sections.push(`#### ${impact.companyType}`);
      sections.push(`- Impact: ${impact.impact}`);
      sections.push(`- Reasoning: ${impact.reasoning}`);
    });
  }

  if (negative?.length) {
    sections.push('### Negative Impact');
    negative.forEach((impact: any) => {
      sections.push(`#### ${impact.companyType}`);
      sections.push(`- Impact: ${impact.impact}`);
      sections.push(`- Reasoning: ${impact.reasoning}`);
    });
  }

  return sections.join('\n\n');
}
