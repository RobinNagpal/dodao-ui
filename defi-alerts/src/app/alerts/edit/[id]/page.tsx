import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import { ChevronRight, Home, Bell, Edit } from 'lucide-react';
import PersonalizedMarketEditForm from '@/components/alerts/PersonalizedMarketEditForm';
import CompoundMarketEditForm from '@/components/alerts/CompoundMarketEditForm';
import PersonalizedComparisonEditForm from '@/components/alerts/PersonalizedComparisonEditForm';
import CompoundComparisonEditForm from '@/components/alerts/CompoundComparisonEditForm';

export default async function AlertEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/api/alerts/${id}`);
  const alert = await response.json();

  // Basic layout that will be present for both form types
  return (
    <div className="container max-w-6xl mx-auto px-2 py-8">
      {/* Breadcrumb */}
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
        <span className="text-primary-color font-medium flex items-center gap-1">
          <Edit size={14} />
          <span>Edit Alert</span>
        </span>
      </nav>

      {/* Render the appropriate component based on alert category and comparison flag */}
      {alert && alert.category === 'PERSONALIZED' ? (
        alert.isComparison ? (
          <PersonalizedComparisonEditForm alert={alert} alertId={id} />
        ) : (
          <PersonalizedMarketEditForm alert={alert} alertId={id} />
        )
      ) : alert && alert.category === 'GENERAL' ? (
        alert.isComparison ? (
          <CompoundComparisonEditForm alert={alert} alertId={id} />
        ) : (
          <CompoundMarketEditForm alert={alert} alertId={id} />
        )
      ) : (
        <div className="text-theme-primary">Loading alert data...</div>
      )}
    </div>
  );
}
