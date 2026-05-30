import {
  EtfAnalysisCategory,
  EtfAnalysisFactorDefinition,
  EtfCategoriesConfig,
  EtfGroupBasedFactorsConfig,
  EtfGroupFactorDefinition,
} from '@/types/etf/etf-analysis-types';
import etfCategoriesRaw from '@/etf-analysis/etf-analysis-categories.json';
import performanceAndReturnsRaw from '@/etf-analysis/etf-analysis-factors-performance-and-returns.json';
import costEfficiencyAndTeamRaw from '@/etf-analysis/etf-analysis-factors-cost-efficiency-and-team.json';
import riskAnalysisRaw from '@/etf-analysis/etf-analysis-factors-risk-analysis.json';
import futurePerformanceOutlookRaw from '@/etf-analysis/etf-analysis-factors-future-performance-outlook.json';
import { canonicalizeCategory } from '@/utils/etf-category-aliases';

/**
 * Category/factor resolution helpers shared by the (client-rendered) ETF report
 * components and the (server-only) prompt-input builders. This module is kept
 * free of Node-only imports (`fs`/`path`) on purpose: ETF report components such
 * as `EtfRadarChart` import `findFactorDefinition` from here, so anything pulled
 * in must be safe to bundle for the browser. The `fs`-backed category-flag
 * loading lives in `etf-report-input-json-utils.ts`, which is server-only.
 */

export const DEFAULT_GROUP_KEY = 'broad-equity';

const categoriesConfig = etfCategoriesRaw as EtfCategoriesConfig;
const performanceAndReturnsConfig = performanceAndReturnsRaw as EtfGroupBasedFactorsConfig;
const costEfficiencyAndTeamConfig = costEfficiencyAndTeamRaw as EtfGroupBasedFactorsConfig;
const riskAnalysisConfig = riskAnalysisRaw as EtfGroupBasedFactorsConfig;
const futurePerformanceOutlookConfig = futurePerformanceOutlookRaw as EtfGroupBasedFactorsConfig;

const CATEGORY_CONFIGS: Record<EtfAnalysisCategory, EtfGroupBasedFactorsConfig> = {
  [EtfAnalysisCategory.PerformanceAndReturns]: performanceAndReturnsConfig,
  [EtfAnalysisCategory.CostEfficiencyAndTeam]: costEfficiencyAndTeamConfig,
  [EtfAnalysisCategory.RiskAnalysis]: riskAnalysisConfig,
  [EtfAnalysisCategory.FuturePerformanceOutlook]: futurePerformanceOutlookConfig,
};

function normalizeGroupFactor(f: EtfGroupFactorDefinition, groupKey?: string): EtfAnalysisFactorDefinition {
  return {
    factorAnalysisKey: f.factorKey,
    factorAnalysisTitle: f.factorTitle,
    factorAnalysisDescription: f.factorDescription,
    factorAnalysisMetrics: f.factorMetrics,
    factorAnalysisGroupInstructions: groupKey ? f.groupInstructions?.[groupKey] : undefined,
  };
}

/**
 * Resolve the ETF group key (e.g. "broad-equity") from the fund's category string
 * (e.g. "Large Blend") as stored in EtfStockAnalyzerInfo.category. The stored value
 * is the raw, per-country category label (US Morningstar names, Canada Stock-Analysis
 * / GICS sector labels, etc.), so we canonicalize it through the shared alias map
 * before matching — otherwise a Canada-listed fund tagged e.g. "Financials" would
 * never resolve to the canonical "Financial" category. Returns undefined when the
 * category is unknown so callers can decide how to fall back.
 */
export function getEtfGroupKeyForCategory(category: string | null | undefined): string | undefined {
  if (!category) return undefined;
  const canonical = canonicalizeCategory(category);
  const match = categoriesConfig.categories.find((c) => c.name === canonical);
  return match?.group;
}

export function getGroupNameForGroupKey(groupKey: string): string {
  return categoriesConfig.groups.find((g) => g.key === groupKey)?.name ?? groupKey;
}

export function getCategoriesForGroupKey(groupKey: string): string[] {
  return categoriesConfig.categories.filter((c) => c.group === groupKey).map((c) => c.name);
}

function factorAppliesToGroup(f: EtfGroupFactorDefinition, groupKey: string): boolean {
  if (f.groups === 'all') return true;
  return f.groups.includes(groupKey);
}

function getGroupFactors(config: EtfGroupBasedFactorsConfig, groupKey: string): EtfAnalysisFactorDefinition[] {
  return config.factors.filter((f) => factorAppliesToGroup(f, groupKey)).map((f) => normalizeGroupFactor(f, groupKey));
}

/**
 * Get analysis factors for a given category. All three categories now use
 * group-based selection: the fund's EtfStockAnalyzerInfo.category is mapped
 * to a group (via etf-analysis-categories.json), then factors whose `groups`
 * includes that group are selected.
 */
export function getEtfAnalysisFactorsForCategory(categoryKey: EtfAnalysisCategory, params: { fundCategory?: string } = {}): EtfAnalysisFactorDefinition[] {
  const config = CATEGORY_CONFIGS[categoryKey];
  const groupKey = getEtfGroupKeyForCategory(params.fundCategory) || DEFAULT_GROUP_KEY;
  const factors = getGroupFactors(config, groupKey);
  if (factors.length > 0) return factors;
  return getGroupFactors(config, DEFAULT_GROUP_KEY);
}

/**
 * Find a factor definition by key for a given category. Searches across every
 * group definition in that category. Falls back to a case-insensitive title
 * match when the key lookup misses, since the LLM occasionally returns the
 * factor's bolded title in the `factorAnalysisKey` slot instead of the
 * snake_case key — without this fallback every factor in such a response
 * gets silently dropped by `saveEtfFactorAnalysisResponse`.
 */
export function findFactorDefinition(categoryKey: EtfAnalysisCategory, factorKey: string): EtfAnalysisFactorDefinition | undefined {
  const config = CATEGORY_CONFIGS[categoryKey];
  const byKey = config.factors.find((f) => f.factorKey === factorKey);
  if (byKey) return normalizeGroupFactor(byKey);
  const normalized = factorKey.trim().toLowerCase();
  const byTitle = config.factors.find((f) => f.factorTitle.trim().toLowerCase() === normalized);
  return byTitle ? normalizeGroupFactor(byTitle) : undefined;
}
