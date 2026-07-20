import TariffReportsAdminTable from '@/app/admin-v1/tariff-reports/TariffReportsAdminTable';

export const dynamic = 'force-dynamic';

export default function TariffReportsAdminPage(): JSX.Element {
  return (
    <>
      <div className="space-y-4">
        <div className="text-3xl font-bold">Tariff Chapter Reports</div>
        <p className="text-sm text-muted">
          One row per `tariff_chapter_reports` entry. Each column shows whether that JSONB section is populated. &quot;Generate all&quot; runs every section
          generator in order — headings first, every other section, then SEO last.
        </p>
        <TariffReportsAdminTable />
      </div>
    </>
  );
}
