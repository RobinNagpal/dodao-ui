import { revalidateTag } from 'next/cache';

const ETF_SCENARIO_TAG_PREFIX = 'etf_scenario:' as const;

export const etfScenarioBySlugTag = (slug: string): `${typeof ETF_SCENARIO_TAG_PREFIX}${string}` => `${ETF_SCENARIO_TAG_PREFIX}_${slug.toLowerCase()}`;

export const revalidateEtfScenarioBySlugTag = (slug: string) => revalidateTag(etfScenarioBySlugTag(slug));

export const ETF_SCENARIO_LISTING_TAG = 'etf_scenario_listing' as const;

export const getEtfScenarioListingTag = (): string => ETF_SCENARIO_LISTING_TAG;

export const revalidateEtfScenarioListingTag = () => revalidateTag(ETF_SCENARIO_LISTING_TAG);
