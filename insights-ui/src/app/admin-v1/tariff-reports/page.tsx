import AdminNav from '@/app/admin-v1/AdminNav';
import TariffReportsAdminTable from '@/app/admin-v1/tariff-reports/TariffReportsAdminTable';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

export const dynamic = 'force-dynamic';

export default function TariffReportsAdminPage(): JSX.Element {
  return (
    <PageWrapper>
      <AdminNav />
      <div className="space-y-4">
        <div className="text-3xl font-bold">Tariff Chapter Reports</div>
        <p className="text-sm text-muted">
          One row per `tariff_chapter_reports` entry. Each column shows whether that JSONB section is populated. &quot;Generate all&quot; runs every section
          generator in order — same pipeline as `run-tariff-report.ts`, ending with SEO.
        </p>
        <TariffReportsAdminTable />
      </div>
    </PageWrapper>
  );
}
