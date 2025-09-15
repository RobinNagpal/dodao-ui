import { prisma } from '@/prisma';

export interface IndustryMappings {
  industryMap: Map<string, string>;
  subIndustryMap: Map<string, string>;
}

/**
 * Fetches industry and sub-industry mappings from the database
 * and returns Maps for quick lookup of names by keys
 */
export async function getIndustryMappings(): Promise<IndustryMappings> {
  const industries = await prisma.tickerV1Industry.findMany({
    include: {
      subIndustries: true,
    },
  });

  // Create mappings for quick lookup
  const industryMap = new Map(industries.map((industry) => [industry.industryKey, industry.name]));
  const subIndustryMap = new Map<string, string>();
  industries.forEach((industry) => {
    industry.subIndustries.forEach((subIndustry) => {
      subIndustryMap.set(subIndustry.subIndustryKey, subIndustry.name);
    });
  });

  return { industryMap, subIndustryMap };
}

/**
 * Gets the industry name for a given industry key, with fallback to the key itself
 */
export function getIndustryName(industryKey: string, mappings: IndustryMappings): string {
  return mappings.industryMap.get(industryKey) || industryKey;
}

/**
 * Gets the sub-industry name for a given sub-industry key, with fallback to the key itself
 */
export function getSubIndustryName(subIndustryKey: string, mappings: IndustryMappings): string {
  return mappings.subIndustryMap.get(subIndustryKey) || subIndustryKey;
}

/**
 * Enhances a ticker object with industry and sub-industry names
 */
export function enhanceTickerWithIndustryNames<T extends { industryKey: string; subIndustryKey: string }>(
  ticker: T,
  mappings: IndustryMappings
): T & { industryName: string; subIndustryName: string } {
  return {
    ...ticker,
    industryName: getIndustryName(ticker.industryKey, mappings),
    subIndustryName: getSubIndustryName(ticker.subIndustryKey, mappings),
  };
}
