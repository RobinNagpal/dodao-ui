import { EtfInvestor, EtfInvestorGoal, EtfInvestorTaxonomyConfig } from '@/types/etf/etf-analysis-types';
import data from './etf-target-investor-groups.json';

const taxonomy = data as EtfInvestorTaxonomyConfig;

export function getInvestorTaxonomy(): EtfInvestorTaxonomyConfig {
  return taxonomy;
}

export function getAllInvestors(): EtfInvestor[] {
  return taxonomy.investors;
}

export function getInvestorByKey(key: string): EtfInvestor | undefined {
  return taxonomy.investors.find((inv) => inv.key === key);
}

export interface InvestorGoalLookup {
  investor: EtfInvestor;
  goal: EtfInvestorGoal;
}

export function getInvestorGoal(investorKey: string, goalKey: string): InvestorGoalLookup | undefined {
  const investor = getInvestorByKey(investorKey);
  if (!investor) return undefined;
  const goal = investor.etfInvestorGoals.find((g) => g.key === goalKey);
  if (!goal) return undefined;
  return { investor, goal };
}
