import { getTariffReportsListing, TariffReportListingItem } from '@/utils/tariff-reports/tariff-reports-listing';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

export type { TariffReportListingItem };

export const GET = withErrorHandlingV2<TariffReportListingItem[]>(async () => getTariffReportsListing());
