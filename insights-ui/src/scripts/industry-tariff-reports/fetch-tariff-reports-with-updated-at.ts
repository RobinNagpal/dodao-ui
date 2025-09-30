import { getTariffIndustryDefinitionById, TariffIndustryDefinition, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import { getS3KeyForIndustryTariffs } from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { TariffUpdatesForIndustry } from '@/scripts/industry-tariff-reports/tariff-types';
import { getJsonWithLastModifiedFromS3 } from '@/scripts/report-file-utils';

const reportLastModifiedAtMap: Record<string, string> = {};

export async function fetchTariffReportsWithUpdatedAt(): Promise<
  (TariffIndustryDefinition & {
    lastModified: string;
  })[]
> {
  console.warn('fetchTariffReportsWithUpdatedAt is called which is quite expensive. Keep an eye.');
  if (Object.values(reportLastModifiedAtMap).length === 0) {
    const ids = Object.values(TariffIndustryId);
    for (const industryId of ids) {
      const key = getS3KeyForIndustryTariffs(industryId, 'tariff-updates.json');
      const lastModified = (await getJsonWithLastModifiedFromS3<TariffUpdatesForIndustry>(key))?.lastModified || new Date().toISOString();
      reportLastModifiedAtMap[industryId] = lastModified;
    }
  }

  return Object.values(TariffIndustryId).map((industryId) => ({
    ...getTariffIndustryDefinitionById(industryId),
    lastModified: reportLastModifiedAtMap[industryId],
  }));
}
