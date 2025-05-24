import Link from 'next/link';
import { ChevronRight, Home, Bell, TrendingUp } from 'lucide-react';

interface AlertBreadcrumbProps {
  currentPage: string;
}

export default function AlertBreadcrumb({ currentPage }: AlertBreadcrumbProps) {
  return (
    <nav className="flex items-center text-sm mb-6">
      <Link href="/" className="text-theme-muted hover-text-primary flex items-center gap-1">
        <Home size={14} />
        <span>Home</span>
      </Link>
      <ChevronRight size={14} className="mx-2 text-theme-muted" />
      <Link href="/alerts" className="text-theme-muted hover-text-primary flex items-center gap-1">
        <Bell size={14} />
        <span>Alerts</span>
      </Link>
      <ChevronRight size={14} className="mx-2 text-theme-muted" />
      <Link href="/alerts/create" className="text-theme-muted hover-text-primary flex items-center gap-1">
        <TrendingUp size={14} />
        <span>Create Alert</span>
      </Link>
      <ChevronRight size={14} className="mx-2 text-theme-muted" />
      <span className="text-primary-color font-medium">{currentPage}</span>
    </nav>
  );
}
