import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import EditPageClient from './EditPageClient';

interface EditPageProps {
  params: Promise<{ industryId: string; section: string }>;
}

export default async function EditPage({ params }: EditPageProps) {
  const { industryId, section } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, { cache: 'no-cache' });

  if (!reportResponse.ok) {
    return <div className="text-red-500 p-4">Error: Failed to fetch report data</div>;
  }

  const report: IndustryTariffReport = await reportResponse.json();
  let content = '';
  let error: string | null = null;

  try {
    // Get content based on section
    switch (section) {
      case 'executive-summary':
        content = report.executiveSummary?.executiveSummary || '';
        break;
      case 'report-cover':
        content = report.reportCover?.reportCoverContent || '';
        break;
      case 'understand-industry':
        // Convert sections array to markdown format
        if (report.understandIndustry?.sections) {
          content = report.understandIndustry.sections
            .map((industrySection) => `## ${industrySection.title}\n\n${industrySection.paragraphs.join('\n\n')}`)
            .join('\n\n');
        }
        break;
      case 'tariff-updates':
        // Convert tariff updates to markdown format
        if (report.tariffUpdates?.countrySpecificTariffs) {
          content = report.tariffUpdates.countrySpecificTariffs
            .map((tariff) => {
              const sections = [
                `# ${tariff.countryName}`,
                '',
                '## Tariff Details',
                tariff.tariffDetails,
                '',
                '## Existing Trade Amount and Agreement',
                tariff.existingTradeAmountAndAgreement,
                '',
                '## New Changes',
                tariff.newChanges,
                '',
              ];

              // Add industry sub-area changes if they exist
              if (tariff.tariffChangesForIndustrySubArea && tariff.tariffChangesForIndustrySubArea.length > 0) {
                sections.push(
                  '## Industry Sub-Area Changes',
                  '',
                  // Don't add bullet prefixes - preserve original formatting
                  tariff.tariffChangesForIndustrySubArea.join('\n\n'),
                  ''
                );
              }

              sections.push(
                '## Trade Impacted by New Tariff',
                tariff.tradeImpactedByNewTariff,
                '',
                '## Trade Exempted by New Tariff',
                tariff.tradeExemptedByNewTariff,
                ''
              );

              return sections.join('\n');
            })
            .join('\n---\n\n');
        }
        break;
      case 'industry-areas':
        // Convert industry areas to markdown format
        if (report.industryAreasSections) {
          content = [`# ${report.industryAreasSections.title}`, '', report.industryAreasSections.industryAreas].join('\n');
        }
        break;
      case 'final-conclusion':
        // Convert final conclusion to markdown format
        if (report.finalConclusion) {
          const fc = report.finalConclusion;
          content = [
            '# Final Conclusion',
            '',
            `## ${fc.title}`,
            fc.conclusionBrief,
            '',
            `## ${fc.positiveImpacts.title}`,
            fc.positiveImpacts.positiveImpacts,
            '',
            `## ${fc.negativeImpacts.title}`,
            fc.negativeImpacts.negativeImpacts,
            '',
            '## Final Statements',
            fc.finalStatements,
          ].join('\n');
        }
        break;
      case 'all-countries-tariff-updates':
        // Import the read function for all countries tariff updates
        const { readAllCountriesTariffUpdatesFromFile } = await import('@/scripts/industry-tariff-reports/tariff-report-read-write');
        const allCountriesData = await readAllCountriesTariffUpdatesFromFile(industryId);
        if (allCountriesData) {
          // Use the existing render function to convert to markdown
          const { getMarkdownContentForAllCountriesIndustryTariffs } = await import('@/scripts/industry-tariff-reports/render-tariff-markdown');
          content = getMarkdownContentForAllCountriesIndustryTariffs(industryId, allCountriesData);
        }
        break;
      default:
        error = `Unknown section: ${section}`;
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to process content';
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return <EditPageClient industryId={industryId} section={section} initialContent={content} />;
}
