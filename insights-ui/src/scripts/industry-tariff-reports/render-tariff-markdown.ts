import { IndustryAreaSection } from '@/scripts/industry-tariff-reports/tariff-types';

export function getMarkdownContentForIndustryAreas(industryAreaSection: IndustryAreaSection): string {
  const title = typeof industryAreaSection?.title === 'string' ? industryAreaSection.title : '';
  const body = typeof industryAreaSection?.industryAreas === 'string' ? industryAreaSection.industryAreas : '';
  if (!title && !body) return '';
  return title ? `# ${title}\n\n${body}` : body;
}
