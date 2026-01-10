'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Grid4Cols } from '@dodao/web-core/components/core/grids/Grid4Cols';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import PresentationCard from '@/components/presentations/PresentationCard';
import CreatePresentationModal from '@/components/presentations/CreatePresentationModal';
import { PresentationSummary } from '@/types/presentation/presentation-types';

interface PresentationsResponse {
  presentations: PresentationSummary[];
}

export default function PresentationsListPage() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, loading, error, reFetchData } = useFetchData<PresentationsResponse>(`${getBaseUrl()}/api/presentations`, {}, 'Failed to fetch presentations');

  const presentations = data?.presentations || [];

  const handleCreateSuccess = (presentationId: string) => {
    setShowCreateModal(false);
    router.push(`/generate-ppt/${presentationId}`);
  };

  return (
    <PageWrapper>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-color">Presentations</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Create and manage video presentations with AI</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} primary variant="contained">
            + New Presentation
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
            <button onClick={() => reFetchData()} className="ml-4 underline">
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && presentations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold mb-2">No Presentations Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first presentation to get started</p>
            <Button onClick={() => setShowCreateModal(true)} primary variant="contained">
              Create Presentation
            </Button>
          </div>
        )}

        {/* Presentations Grid */}
        {!loading && presentations.length > 0 && (
          <Grid4Cols>
            {presentations.map((presentation) => (
              <PresentationCard key={presentation.presentationId} presentation={presentation} />
            ))}
          </Grid4Cols>
        )}

        {/* Create Modal */}
        <CreatePresentationModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={handleCreateSuccess} />
      </div>
    </PageWrapper>
  );
}
