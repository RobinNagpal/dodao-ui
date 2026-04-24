import { revalidateTag } from 'next/cache';

const STOCK_SCENARIO_TAG_PREFIX = 'stock_scenario:' as const;

export const stockScenarioBySlugTag = (slug: string): `${typeof STOCK_SCENARIO_TAG_PREFIX}${string}` =>
  `${STOCK_SCENARIO_TAG_PREFIX}_${slug.toLowerCase()}`;

export const revalidateStockScenarioBySlugTag = (slug: string) => revalidateTag(stockScenarioBySlugTag(slug));

export const STOCK_SCENARIO_LISTING_TAG = 'stock_scenario_listing' as const;

export const getStockScenarioListingTag = (): string => STOCK_SCENARIO_LISTING_TAG;

export const revalidateStockScenarioListingTag = () => revalidateTag(STOCK_SCENARIO_LISTING_TAG);
