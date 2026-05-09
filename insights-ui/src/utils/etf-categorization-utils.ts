import etfCategoriesRaw from '@/etf-analysis-data/etf-analysis-categories.json';
import { EtfCategoriesConfig, EtfCategoryToGroup, EtfGroup } from '@/types/etf/etf-analysis-types';

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

export function getEtfGroupByKey(key: string | null | undefined): EtfGroup | undefined {
  if (!key) return undefined;
  return categoriesConfig.groups.find((g) => g.key === key);
}

export function getAllEtfGroups(): ReadonlyArray<EtfGroup> {
  return categoriesConfig.groups;
}

export function getCategoriesForGroupKey(key: string | null | undefined): EtfCategoryToGroup[] {
  if (!key) return [];
  return categoriesConfig.categories.filter((c) => c.group === key);
}

export function getEtfCategoryByName(name: string | null | undefined): EtfCategoryToGroup | undefined {
  if (!name) return undefined;
  return categoriesConfig.categories.find((c) => c.name === name);
}
