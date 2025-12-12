import 'server-only';
import { revalidateTag } from 'next/cache';
import { tariffReportTag } from './tariff-report-tags';

/** Server-only revalidation helper */
export const revalidateTariffReport = (industryId: string) => revalidateTag(tariffReportTag(industryId));

// Re-export tag builder for server usage when convenient
export { tariffReportTag };
