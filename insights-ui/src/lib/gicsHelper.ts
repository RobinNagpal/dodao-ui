// src/lib/gicsHelpers.ts
import gicsData from '@/gicsData/gicsData.json';
import { GicsIndustryGroup, GicsSector } from '@/types/public-equity/gicsSector';

/**
 * Retrieves the names of the sector and industry group based on their IDs.
 * @param sectorId - The numeric ID for the sector.
 * @param industryGroupId - The numeric ID for the industry group.
 * @returns An object containing `sectorName` and `industryGroupName`.
 * @throws Error if either the sector or industry group is not found.
 */
export function getGicsNames(sectorId: number, industryGroupId: number): { sectorName: string; industryGroupName: string } {
  const sectors: GicsSector[] = Object.values(gicsData);
  const sector = sectors.find((s) => s.id === sectorId);
  if (!sector) {
    throw new Error(`Sector with id ${sectorId} not found.`);
  }

  const industryGroups: GicsIndustryGroup[] = Object.values(sector.industryGroups);
  const industryGroup = industryGroups.find((ig) => ig.id === industryGroupId);
  if (!industryGroup) {
    throw new Error(`Industry group with id ${industryGroupId} not found in sector ${sector.name}.`);
  }

  return { sectorName: sector.name, industryGroupName: industryGroup.name };
}
