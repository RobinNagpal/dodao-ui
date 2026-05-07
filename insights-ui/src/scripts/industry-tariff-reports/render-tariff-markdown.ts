import { IndustryAreaSection } from '@/scripts/industry-tariff-reports/tariff-types';

export function getMarkdownContentForIndustryAreas(industryAreaSection: IndustryAreaSection) {
  const markdownContent = `# ${industryAreaSection.title}\n\n${industryAreaSection.industryAreas}`;
  return markdownContent;
}
