import Button from '@dodao/web-core/components/core/buttons/Button';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import { Loader2, ArrowRight } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

interface MoveSubIndustryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface MoveSubIndustryRequest {
  oldIndustryKey: string;
  newIndustryKey: string;
  subIndustryKey: string;
}

interface MoveSubIndustryResponse {
  success: boolean;
  message: string;
  affectedTickersCount?: number;
  affectedFactorsCount?: number;
}

export default function MoveSubIndustryModal({ isOpen, onClose, onSuccess }: MoveSubIndustryModalProps): JSX.Element {
  // Source selection
  const [sourceIndustryKey, setSourceIndustryKey] = useState<string | null>(null);
  const [sourceSubIndustryKey, setSourceSubIndustryKey] = useState<string | null>(null);
  
  // Target selection
  const [targetIndustryKey, setTargetIndustryKey] = useState<string | null>(null);
  
  const [formError, setFormError] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  // Fetch industries
  const { data: industries, loading: loadingIndustries } = useFetchData<TickerV1Industry[]>(
    `${getBaseUrl()}/api/industries`, 
    {}, 
    'Failed to load industries'
  );

  // Fetch sub-industries for source industry
  const { data: sourceSubIndustries = [], loading: loadingSourceSubIndustries } = useFetchData<TickerV1SubIndustry[]>(
    `${getBaseUrl()}/api/sub-industries?industryKey=${sourceIndustryKey}`,
    { skipInitialFetch: !sourceIndustryKey, cache: 'no-cache' },
    'Failed to fetch sub-industries'
  );

  // Move operation
  const { postData, loading: movingSubIndustry } = usePostData<MoveSubIndustryResponse, MoveSubIndustryRequest>({
    successMessage: 'Sub-industry moved successfully!',
    errorMessage: 'Failed to move sub-industry',
  });

  const loading: boolean = loadingIndustries || loadingSourceSubIndustries || movingSubIndustry;

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = (): void => {
    setSourceIndustryKey(null);
    setSourceSubIndustryKey(null);
    setTargetIndustryKey(null);
    setFormError('');
    setShowConfirmation(false);
  };

  const handleSourceIndustryChange = (industryKey: string | null): void => {
    setSourceIndustryKey(industryKey);
    setSourceSubIndustryKey(null); // Reset sub-industry when industry changes
  };

  const handlePreMove = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setFormError('');

    if (!sourceIndustryKey || !sourceSubIndustryKey || !targetIndustryKey) {
      setFormError('Please select source industry, sub-industry, and target industry.');
      return;
    }

    if (sourceIndustryKey === targetIndustryKey) {
      setFormError('Source and target industries cannot be the same.');
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmMove = async (): Promise<void> => {
    try {
      await postData('/api/sub-industries/move', {
        oldIndustryKey: sourceIndustryKey!,
        newIndustryKey: targetIndustryKey!,
        subIndustryKey: sourceSubIndustryKey!,
      });

      onSuccess();
      resetForm();
      onClose();
    } catch {
      setFormError('Failed to move sub-industry');
      setShowConfirmation(false);
    }
  };

  const industryItems: StyledSelectItem[] = useMemo<StyledSelectItem[]>(
    () => (industries ?? [])
      .filter((ind: TickerV1Industry) => !ind.archived)
      .map((ind: TickerV1Industry) => ({
        id: ind.industryKey,
        label: ind.name,
      })),
    [industries]
  );

  const sourceSubIndustryItems: StyledSelectItem[] = useMemo<StyledSelectItem[]>(
    () => sourceSubIndustries
      .filter((sub) => !sub.archived)
      .map((sub) => ({
        id: sub.subIndustryKey,
        label: sub.name,
      })),
    [sourceSubIndustries]
  );

  // Filter target industries (exclude source industry)
  const targetIndustryItems: StyledSelectItem[] = useMemo<StyledSelectItem[]>(
    () => industryItems.filter((item) => item.id !== sourceIndustryKey),
    [industryItems, sourceIndustryKey]
  );

  const selectedSourceIndustry = industries?.find((ind) => ind.industryKey === sourceIndustryKey);
  const selectedSourceSubIndustry = sourceSubIndustries.find((sub) => sub.subIndustryKey === sourceSubIndustryKey);
  const selectedTargetIndustry = industries?.find((ind) => ind.industryKey === targetIndustryKey);

  if (showConfirmation) {
    return (
      <SingleSectionModal open={isOpen} onClose={onClose} title="Confirm Move Operation">
        <div className="space-y-4 text-left mt-3">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Important: This action will affect existing data
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              Moving a sub-industry will automatically update all related tickers and analysis factors to point to the new industry.
              This operation uses database cascading updates and cannot be undone.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Move Summary:</h4>
            <div className="flex items-center justify-between text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-900 dark:text-gray-100">{selectedSourceIndustry?.name}</div>
                <div className="text-gray-600 dark:text-gray-400">{selectedSourceSubIndustry?.name}</div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 mx-4" />
              <div className="text-center">
                <div className="font-medium text-gray-900 dark:text-gray-100">{selectedTargetIndustry?.name}</div>
                <div className="text-gray-600 dark:text-gray-400">{selectedSourceSubIndustry?.name}</div>
              </div>
            </div>
          </div>

          {formError && <p className="text-red-500 text-sm">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outlined" onClick={() => setShowConfirmation(false)}>
              Back
            </Button>
            <Button type="button" variant="contained" className="bg-red-600 hover:bg-red-700" onClick={handleConfirmMove} disabled={movingSubIndustry}>
              {movingSubIndustry ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Moving...
                </>
              ) : (
                'Confirm Move'
              )}
            </Button>
          </div>
        </div>
      </SingleSectionModal>
    );
  }

  return (
    <SingleSectionModal open={isOpen} onClose={onClose} title="Move Sub-Industry">
      <form onSubmit={handlePreMove} className="space-y-4 text-left mt-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Select the sub-industry you want to move and its new parent industry.
          </p>
        </div>

        {/* Source Industry Selection */}
        <div>
          <StyledSelect
            label="From Industry (Source)"
            showPleaseSelect
            selectedItemId={sourceIndustryKey}
            items={industryItems}
            setSelectedItemId={handleSourceIndustryChange}
            helpText={loadingIndustries ? 'Loading industries…' : undefined}
          />
        </div>

        {/* Source Sub-Industry Selection */}
        <div>
          <StyledSelect
            label="Sub-Industry to Move"
            showPleaseSelect
            selectedItemId={sourceSubIndustryKey}
            items={sourceSubIndustryItems}
            setSelectedItemId={setSourceSubIndustryKey}
            disabled={!sourceIndustryKey}
            helpText={
              loadingSourceSubIndustries
                ? 'Loading sub-industries…'
                : !sourceIndustryKey
                ? 'Please select a source industry first'
                : sourceSubIndustryItems.length === 0
                ? 'No sub-industries found for selected industry'
                : undefined
            }
          />
        </div>

        {/* Target Industry Selection */}
        <div>
          <StyledSelect
            label="To Industry (Target)"
            showPleaseSelect
            selectedItemId={targetIndustryKey}
            items={targetIndustryItems}
            setSelectedItemId={setTargetIndustryKey}
            disabled={!sourceIndustryKey}
            helpText={
              !sourceIndustryKey
                ? 'Please select a source industry first'
                : targetIndustryItems.length === 0
                ? 'No other industries available'
                : undefined
            }
          />
        </div>

        {/* Preview */}
        {sourceIndustryKey && sourceSubIndustryKey && targetIndustryKey && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Preview:</h4>
            <div className="flex items-center justify-between text-xs">
              <div className="text-center">
                <div className="font-medium">{selectedSourceIndustry?.name}</div>
                <div className="text-gray-600 dark:text-gray-400">{selectedSourceSubIndustry?.name}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
              <div className="text-center">
                <div className="font-medium">{selectedTargetIndustry?.name}</div>
                <div className="text-gray-600 dark:text-gray-400">{selectedSourceSubIndustry?.name}</div>
              </div>
            </div>
          </div>
        )}

        {formError && <p className="text-red-500 text-sm">{formError}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !sourceIndustryKey || !sourceSubIndustryKey || !targetIndustryKey}
          >
            Next: Review Move
          </Button>
        </div>
      </form>
    </SingleSectionModal>
  );
}
