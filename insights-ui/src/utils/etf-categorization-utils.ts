import etfCategoriesRaw from '@/etf-analysis-data/etf-analysis-categories.json';
import { canonicalizeCategory, getCategoryAliasMap } from '@/utils/etf-category-aliases';
import { EtfCategoriesConfig, EtfCategoryToGroup, EtfGroup } from '@/types/etf/etf-analysis-types';

const categoriesConfig = etfCategoriesRaw as EtfCategoriesConfig;

function validateEtfCategoriesConfig(): void {
  const groupKeys = new Set<string>();
  for (const g of categoriesConfig.groups) {
    if (groupKeys.has(g.key)) {
      throw new Error(`etf-analysis-categories.json: duplicate group key "${g.key}"`);
    }
    groupKeys.add(g.key);
  }

  const categoryNames = new Set<string>();
  for (const c of categoriesConfig.categories) {
    if (categoryNames.has(c.name)) {
      throw new Error(`etf-analysis-categories.json: duplicate category "${c.name}"`);
    }
    categoryNames.add(c.name);
    if (!groupKeys.has(c.group)) {
      throw new Error(`etf-analysis-categories.json: category "${c.name}" references unknown group "${c.group}"`);
    }
  }

  const aliasMap = getCategoryAliasMap();
  for (const [raw, canonical] of Object.entries(aliasMap)) {
    if (!categoryNames.has(canonical)) {
      throw new Error(`etf-category-aliases.json: "${raw}" aliases to unknown canonical category "${canonical}"`);
    }
    if (categoryNames.has(raw)) {
      throw new Error(`etf-category-aliases.json: "${raw}" is both an alias source and a canonical category — remove one`);
    }
    if (aliasMap[canonical] !== undefined) {
      throw new Error(`etf-category-aliases.json: "${canonical}" is both an alias target and an alias source — chains are not allowed`);
    }
  }
}

validateEtfCategoriesConfig();

// Synthetic group for ETFs whose source data has no EtfStockAnalyzerInfo.category
// value (either the relation is missing entirely or category is null). Not
// stored in etf-analysis-categories.json — it isn't an analysis target, just a
// browse bucket so users can still find these funds.
export const ETF_OTHERS_GROUP_KEY = 'others';

export const ETF_OTHERS_GROUP: EtfGroup = {
  key: ETF_OTHERS_GROUP_KEY,
  name: 'Others',
  description:
    'ETFs that are not yet assigned an analysis category in our source data. Shown so they remain discoverable; they are not part of the group-based analysis pipeline.',
};

export function getEtfGroupKey(category: string | null | undefined): string | undefined {
  if (!category) return undefined;
  const canonical = canonicalizeCategory(category);
  return categoriesConfig.categories.find((c) => c.name === canonical)?.group;
}

export function getEtfGroupName(category: string | null | undefined): string | undefined {
  const groupKey = getEtfGroupKey(category);
  if (!groupKey) return undefined;
  return categoriesConfig.groups.find((g) => g.key === groupKey)?.name;
}

export function getEtfGroupByKey(key: string | null | undefined): EtfGroup | undefined {
  if (!key) return undefined;
  if (key === ETF_OTHERS_GROUP_KEY) return ETF_OTHERS_GROUP;
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
  const canonical = canonicalizeCategory(name);
  return categoriesConfig.categories.find((c) => c.name === canonical);
}
