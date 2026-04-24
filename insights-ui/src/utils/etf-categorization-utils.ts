import etfCategoriesRaw from '@/etf-analysis-data/etf-analysis-categories.json';
import { EtfCategoriesConfig } from '@/types/etf/etf-analysis-types';

const categoriesConfig = etfCategoriesRaw as EtfCategoriesConfig;

export function getEtfGroupKey(category: string | null | undefined): string | undefined {
  if (!category) return undefined;
  return categoriesConfig.categories.find((c) => c.name === category)?.group;
}

export function getEtfGroupName(category: string | null | undefined): string | undefined {
  const groupKey = getEtfGroupKey(category);
  if (!groupKey) return undefined;
  return categoriesConfig.groups.find((g) => g.key === groupKey)?.name;
}
