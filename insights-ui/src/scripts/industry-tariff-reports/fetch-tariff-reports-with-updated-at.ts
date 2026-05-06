import { unstable_cache } from 'next/cache';
import { getTariffIndustryDefinitionById, TariffIndustryDefinition, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import {
  getS3KeyForIndustryTariffs,
  readLastModifiedDatesFromS3,
  writeLastModifiedDatesToS3,
} from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { TariffUpdatesForIndustry } from '@/scripts/industry-tariff-reports/tariff-types';
import { getJsonWithLastModifiedFromS3 } from '@/scripts/report-file-utils';

// Cache wrapper: caches the centralized S3 read for 1 day
const readLastModifiedDatesCached = unstable_cache(
  async () => {
    return (await readLastModifiedDatesFromS3()) ?? {};
  },
  ['tariff:last-modified-dates:v1'],
  {
    revalidate: 60 * 60 * 24, // 1 day
  }
);

/**
 * Get last modified dates for all tariff industries from centralized file
 * This is used by sitemap generation for better performance
 */
export async function getTariffReportsLastModifiedDates(): Promise<Record<string, string>> {
  // Try to read from centralized file first
  let lastModifiedDates = await readLastModifiedDatesCached();

  if (!lastModifiedDates || Object.keys(lastModifiedDates).length === 0) {
    console.log('Centralized last modified dates file not found or empty. Creating it from tariff-updates files...');
    // Fallback to reading from individual tariff-updates files and create centralized file
    lastModifiedDates = {};

    const ids = Object.values(TariffIndustryId);
    for (const industryId of ids) {
      const key = getS3KeyForIndustryTariffs(industryId, 'tariff-updates.json');
      const lastModified = (await getJsonWithLastModifiedFromS3<TariffUpdatesForIndustry>(key))?.lastModified || new Date().toISOString();
      lastModifiedDates[industryId] = lastModified;
    }

    // Create the centralized file
    await writeLastModifiedDatesToS3(lastModifiedDates);
    console.log('Created centralized last modified dates file.');

    return lastModifiedDates;
  }

  return lastModifiedDates;
}

export async function fetchTariffReportsWithUpdatedAt(): Promise<
  (TariffIndustryDefinition & {
    lastModified: string;
  })[]
> {
  console.warn('fetchTariffReportsWithUpdatedAt is called. Using centralized last modified dates file.');

  // Get last modified dates (this will use/create the centralized file and cache)
  const lastModifiedDates = await getTariffReportsLastModifiedDates();

  return Object.values(TariffIndustryId).map((industryId) => ({
    ...getTariffIndustryDefinitionById(industryId),
    lastModified: lastModifiedDates[industryId] || new Date().toISOString(),
  }));
}

/**
 * Get last modified date for a specific industry
 */
export async function getLastModifiedDateForIndustry(industryId: TariffIndustryId): Promise<string> {
  const lastModifiedDates = await getTariffReportsLastModifiedDates();
  return lastModifiedDates[industryId] || new Date().toISOString();
}
