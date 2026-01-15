'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import AddEditPortfolioProfileModal from '@/components/portfolios/AddEditPortfolioProfileModal';
import AddEditPortfolioModal from '@/components/portfolios/AddEditPortfolioModal';
import { PortfolioManagerProfilewithPortfoliosAndUser } from '@/types/portfolio';
import { PortfolioManagerProfile } from '@prisma/client';
import { useIsOwner } from '@/hooks/useIsOwner';

interface PortfolioManagerActionsProps {
  profile: PortfolioManagerProfilewithPortfoliosAndUser;
  portfolioManagerId: string;
}

export default function PortfolioManagerActions({ profile, portfolioManagerId }: PortfolioManagerActionsProps) {
  const router = useRouter();
  const isOwner = useIsOwner(profile?.userId);
  const [editingProfile, setEditingProfile] = useState<PortfolioManagerProfilewithPortfoliosAndUser | null>(null);
  const [showCreatePortfolioModal, setShowCreatePortfolioModal] = useState(false);

  if (!isOwner) {
    return null;
  }

  const handleSuccess = () => {
    setEditingProfile(null);
    setShowCreatePortfolioModal(false);
    // Refresh the page with updated timestamp to trigger server-side refetch
    const url = new URL(window.location.href);
    url.searchParams.set('updatedAt', Date.now().toString());
    router.push(url.toString());
  };

  const actions: EllipsisDropdownItem[] = [
    { key: 'edit-profile', label: 'Edit Profile' },
    { key: 'create-portfolio', label: 'Create Portfolio' },
    { key: 'revalidate-profile-tag', label: 'Invalidate Cache' },
  ];

  return (
    <>
      <EllipsisDropdown
        items={actions}
        className="px-2 py-2"
        onSelect={async (key) => {
          if (key === 'edit-profile') {
            setEditingProfile(profile);
            return;
          }

          if (key === 'create-portfolio') {
            setShowCreatePortfolioModal(true);
            return;
          }

          if (key === 'revalidate-profile-tag') {
            // Import the cache action dynamically to avoid server action issues
            const { revalidatePortfolioProfileCache } = await import('@/utils/cache-actions');
            await revalidatePortfolioProfileCache(portfolioManagerId);
            router.refresh();
            return;
          }
        }}
      />

      {/* Edit Profile Modal */}
      {editingProfile && (
        <AddEditPortfolioProfileModal
          isOpen={!!editingProfile}
          onClose={() => setEditingProfile(null)}
          portfolioManagerProfile={editingProfile as PortfolioManagerProfile}
          onSuccess={handleSuccess}
          isAdmin={false}
        />
      )}

      {/* Create Portfolio Modal */}
      {showCreatePortfolioModal && (
        <AddEditPortfolioModal
          isOpen={showCreatePortfolioModal}
          onClose={() => setShowCreatePortfolioModal(false)}
          onSuccess={handleSuccess}
          portfolioManagerId={portfolioManagerId}
        />
      )}
    </>
  );
}
