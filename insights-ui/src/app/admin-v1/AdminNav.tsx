import Link from 'next/link';

function AdminNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md">
      {label}
    </Link>
  );
}
export default function AdminNav() {
  return (
    <div className="flex flex-col mb-6 gap-4 py-4 px-4 bg-white shadow-lg rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between gap-4">
        <AdminNavLink href="/admin-v1/create-reports" label="Create Reports" />
        <AdminNavLink href="/admin-v1/generation-requests" label="Generation Requests" />
        <AdminNavLink href="/admin-v1/missing-reports" label="Missing Reports" />
        <AdminNavLink href="/admin-v1/analysis-factors" label="Analysis Factors" />
        <AdminNavLink href="/admin-v1/industry-management" label="Industry Management" />
        <AdminNavLink href="/admin-v1/ticker-management" label="Ticker Management" />
        <AdminNavLink href="/admin-v1/users" label="Users" />
      </div>
    </div>
  );
}
