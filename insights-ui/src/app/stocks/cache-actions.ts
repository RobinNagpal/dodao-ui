'use server';

import { revalidateStocksPageTag, revalidateIndustryPageTag } from '@/utils/ticker-v1-cache-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';

export async function revalidateStocksPageCache(country: string) {
  revalidateStocksPageTag(country as SupportedCountries);
  return { success: true, message: `Revalidated stocks page cache for ${country}` };
}

export async function revalidateIndustryPageCache(country: string, industryKey: string) {
  revalidateIndustryPageTag(country as SupportedCountries, industryKey);
  return { success: true, message: `Revalidated industry page cache for ${country}/${industryKey}` };
}
