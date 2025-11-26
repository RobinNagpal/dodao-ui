'use server';

import { revalidateStocksPageTag, revalidateIndustryPageTag, revalidatePortfolioManagersByTypeTag } from '@/utils/ticker-v1-cache-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { PortfolioManagerType } from '@/types/portfolio-manager';

export async function revalidateStocksPageCache(country: string) {
  revalidateStocksPageTag(country as SupportedCountries);
  return { success: true, message: `Revalidated stocks page cache for ${country}` };
}

export async function revalidateIndustryPageCache(country: string, industryKey: string) {
  revalidateIndustryPageTag(country as SupportedCountries, industryKey);
  return { success: true, message: `Revalidated industry page cache for ${country}/${industryKey}` };
}

export async function revalidatePortfolioManagersByTypeCache(type: PortfolioManagerType) {
  revalidatePortfolioManagersByTypeTag(type);
  return { success: true, message: `Revalidated portfolio managers cache for type ${type}` };
}
