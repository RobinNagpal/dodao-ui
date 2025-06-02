'use client';

import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import { ChevronRight, Home, Bell, Edit } from 'lucide-react';
import PersonalizedMarketEditForm from '@/components/alerts/PersonalizedMarketEditForm';
import CompoundMarketEditForm from '@/components/alerts/CompoundMarketEditForm';
import PersonalizedComparisonEditForm from '@/components/alerts/PersonalizedComparisonEditForm';
import CompoundComparisonEditForm from '@/components/alerts/CompoundComparisonEditForm';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { type Alert } from '@/types/alerts';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { useParams } from 'next/navigation';

export default function AlertEditPage() {
  const { id } = useParams<{ id: string }>();

  const baseUrl = getBaseUrl();

  // Use useFetchData hook to fetch alert
  const {
    data: alert,
    loading: isLoading,
    error: fetchError,
  } = useFetchData<Alert>(`${baseUrl}/api/alerts/${id}`, {}, 'Failed to load alert. Please try again later.');

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

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center">
          <FullPageLoader />
        </div>
      )}

      {/* Error state */}
      {fetchError && (
        <div className="flex justify-center items-center h-40">
          <div className="text-red-500">{fetchError}</div>
        </div>
      )}

      {/* Render the appropriate component based on alert category and comparison flag */}
      {!isLoading && !fetchError && alert && (
        <>
          {alert.category === 'PERSONALIZED' ? (
            alert.isComparison ? (
              <PersonalizedComparisonEditForm alert={alert} alertId={id} />
            ) : (
              <PersonalizedMarketEditForm alert={alert} alertId={id} />
            )
          ) : alert.category === 'GENERAL' ? (
            alert.isComparison ? (
              <CompoundComparisonEditForm alert={alert} alertId={id} />
            ) : (
              <CompoundMarketEditForm alert={alert} alertId={id} />
            )
          ) : (
            <div className="text-theme-primary">Invalid alert data</div>
          )}
        </>
      )}
    </div>
  );
}
