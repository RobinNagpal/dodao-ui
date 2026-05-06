import 'server-only';
import { revalidateTag } from 'next/cache';
import { tariffReportTag, TARIFF_REPORTS_LISTING_TAG } from './tariff-report-tags';

/** Server-only revalidation helper */
export const revalidateTariffReport = (industryId: string) => revalidateTag(tariffReportTag(industryId));

export const revalidateTariffReportsListing = () => revalidateTag(TARIFF_REPORTS_LISTING_TAG);

// Re-export tag builder for server usage when convenient
export { tariffReportTag, TARIFF_REPORTS_LISTING_TAG };
