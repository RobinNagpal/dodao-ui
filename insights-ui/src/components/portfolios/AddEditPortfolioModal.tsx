'use client';

import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import { useState, useEffect } from 'react';
import { Portfolio, CreatePortfolioRequest, UpdatePortfolioRequest } from '@/types/portfolio';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

interface AddEditPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio?: Portfolio | null;
  onSuccess?: () => void;
  portfolioManagerId?: string; // Optional for creating new portfolios
}

export default function AddEditPortfolioModal({ isOpen, onClose, portfolio, onSuccess, portfolioManagerId }: AddEditPortfolioModalProps) {
  // Form state
  const [name, setName] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [detailedDescription, setDetailedDescription] = useState<string>('');

  // Post and Put hooks for portfolios
  const { postData: createPortfolio, loading: creating } = usePostData<Portfolio, CreatePortfolioRequest>({
    successMessage: 'Portfolio created successfully!',
    errorMessage: 'Failed to create portfolio.',
  });

  const { putData: updatePortfolio, loading: updating } = usePutData<Portfolio, UpdatePortfolioRequest>({
    successMessage: 'Portfolio updated successfully!',
    errorMessage: 'Failed to update portfolio.',
  });

  const loading = creating || updating;

  // Load existing data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (portfolio) {
        setName(portfolio.name);
        setSummary(portfolio.summary);
        setDetailedDescription(portfolio.detailedDescription);
      } else {
        // Reset form for new portfolio
        setName('');
        setSummary('');
        setDetailedDescription('');
      }
    }
  }, [isOpen, portfolio]);

  const handleSave = async (): Promise<void> => {
    if (!name.trim() || !summary.trim() || !detailedDescription.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (portfolio) {
      // Update existing portfolio - need portfolioManagerId
      if (!portfolioManagerId) {
        alert('Portfolio manager ID is required for updating');
        return;
      }

      const updateData: UpdatePortfolioRequest = {
        name: name.trim(),
        summary: summary.trim(),
        detailedDescription: detailedDescription.trim(),
      };

      const result = await updatePortfolio(
        `${getBaseUrl()}/api/${KoalaGainsSpaceId}/portfolio-managers/${portfolioManagerId}/portfolios/${portfolio.id}`,
        updateData
      );
      if (result) {
        onSuccess?.();
        onClose();
      }
    } else {
      // Create new portfolio
      if (!portfolioManagerId) {
        alert('Portfolio manager ID is required for creating');
        return;
      }

      const createData: CreatePortfolioRequest = {
        name: name.trim(),
        summary: summary.trim(),
        detailedDescription: detailedDescription.trim(),
      };

      const result = await createPortfolio(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/portfolio-managers/${portfolioManagerId}/portfolios/create`, createData);
      if (result) {
        onSuccess?.();
        onClose();
      }
    }
  };

  return (
    <FullPageModal open={isOpen} onClose={onClose} title={portfolio ? 'Edit Portfolio' : 'Create New Portfolio'} className="w-full max-w-2xl">
      <div className="px-6 py-4 space-y-6 text-left">
        {/* Portfolio Name */}
        <div className="space-y-2">
          <label htmlFor="portfolio-name" className="block text-sm font-medium text-left">
            Portfolio Name *
          </label>
          <Input
            id="portfolio-name"
            modelValue={name}
            onUpdate={(value) => setName(value?.toString() || '')}
            placeholder="Enter portfolio name"
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        {/* Portfolio Summary */}
        <div className="space-y-2">
          <label htmlFor="portfolio-summary" className="block text-sm font-medium text-left">
            Portfolio Summary *
          </label>
          <textarea
            id="portfolio-summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your investment strategy and objectives..."
          />
        </div>

        {/* Detailed Description */}
        <div className="space-y-2">
          <label htmlFor="portfolio-description" className="block text-sm font-medium text-left">
            Detailed Description *
          </label>
          <textarea
            id="portfolio-description"
            value={detailedDescription}
            onChange={(e) => setDetailedDescription(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide detailed information about your portfolio, holdings, and investment approach..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-5 mt-2 border-t border-gray-700">
          <Button onClick={onClose} disabled={loading} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !name.trim() || !summary.trim() || !detailedDescription.trim()}
            loading={loading}
            variant="contained"
            primary
          >
            {portfolio ? 'Update Portfolio' : 'Create Portfolio'}
          </Button>
        </div>
      </div>
    </FullPageModal>
  );
}
