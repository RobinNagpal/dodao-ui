import Button from '@dodao/web-core/components/core/buttons/Button';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import { BasicTickerInfo } from '@/types/ticker-typesv1';
import { Loader2, ArrowRight, AlertTriangle } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

interface MoveTickersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedTickers: BasicTickerInfo[]; // The tickers to move
  currentIndustryKey: string;
  currentSubIndustryKey: string;
}

interface MoveTickersRequest {
  tickerIds: string[];
  targetIndustryKey: string;
  targetSubIndustryKey: string;
}

interface MoveTickersResponse {
  success: boolean;
  message: string;
  movedTickersCount: number;
  deletedAnalysisResultsCount: number;
  deletedFactorResultsCount: number;
}

export default function MoveTickersModal({
  isOpen,
  onClose,
  onSuccess,
  selectedTickers,
  currentIndustryKey,
  currentSubIndustryKey,
}: MoveTickersModalProps): JSX.Element {
  // Target selection
  const [targetIndustryKey, setTargetIndustryKey] = useState<string | null>(null);
  const [targetSubIndustryKey, setTargetSubIndustryKey] = useState<string | null>(null);

  const [formError, setFormError] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  // Fetch industries
  const { data: industries, loading: loadingIndustries } = useFetchData<TickerV1Industry[]>(`${getBaseUrl()}/api/industries`, {}, 'Failed to load industries');

  // Fetch sub-industries for target industry
  const { data: targetSubIndustries = [], loading: loadingTargetSubIndustries } = useFetchData<TickerV1SubIndustry[]>(
    `${getBaseUrl()}/api/sub-industries?industryKey=${targetIndustryKey}`,
    { skipInitialFetch: !targetIndustryKey, cache: 'no-cache' },
    'Failed to fetch sub-industries'
  );

  // Move operation
  const { postData, loading: movingTickers } = usePostData<MoveTickersResponse, MoveTickersRequest>({
    successMessage: 'Tickers moved successfully!',
    errorMessage: 'Failed to move tickers',
  });

  const loading: boolean = loadingIndustries || loadingTargetSubIndustries || movingTickers;

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = (): void => {
    setTargetIndustryKey(null);
    setTargetSubIndustryKey(null);
    setFormError('');
    setShowConfirmation(false);
  };

  const handleTargetIndustryChange = (industryKey: string | null): void => {
    setTargetIndustryKey(industryKey);
    setTargetSubIndustryKey(null); // Reset sub-industry when industry changes
  };

  const handlePreMove = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setFormError('');

    if (!targetIndustryKey || !targetSubIndustryKey) {
      setFormError('Please select target industry and sub-industry.');
      return;
    }

    if (targetIndustryKey === currentIndustryKey && targetSubIndustryKey === currentSubIndustryKey) {
      setFormError('Target location cannot be the same as current location.');
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmMove = async (): Promise<void> => {
    try {
      await postData(`/api/${KoalaGainsSpaceId}/tickers-v1/move`, {
        tickerIds: selectedTickers.map((t) => t.id),
        targetIndustryKey: targetIndustryKey!,
        targetSubIndustryKey: targetSubIndustryKey!,
      });

      onSuccess();
      resetForm();
      onClose();
    } catch {
      setFormError('Failed to move tickers');
      setShowConfirmation(false);
    }
  };

  const industryItems: StyledSelectItem[] = useMemo<StyledSelectItem[]>(
    () =>
      (industries ?? [])
        .filter((ind: TickerV1Industry) => !ind.archived)
        .map((ind: TickerV1Industry) => ({
          id: ind.industryKey,
          label: ind.name,
        })),
    [industries]
  );

  const targetSubIndustryItems: StyledSelectItem[] = useMemo<StyledSelectItem[]>(
    () =>
      targetSubIndustries
        .filter((sub) => !sub.archived)
        .map((sub) => ({
          id: sub.subIndustryKey,
          label: sub.name,
        })),
    [targetSubIndustries]
  );

  const selectedTargetIndustry = industries?.find((ind) => ind.industryKey === targetIndustryKey);
  const selectedTargetSubIndustry = targetSubIndustries.find((sub) => sub.subIndustryKey === targetSubIndustryKey);
  const currentIndustry = industries?.find((ind) => ind.industryKey === currentIndustryKey);
  const currentSubIndustry = targetSubIndustries.find((sub) => sub.subIndustryKey === currentSubIndustryKey);

  if (showConfirmation) {
    return (
      <SingleSectionModal open={isOpen} onClose={onClose} title="Confirm Ticker Move Operation">
        <div className="space-y-4 text-left mt-3">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Critical: This will delete analysis data</h3>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  Moving tickers to a different sub-industry will <strong>permanently delete</strong> all existing analysis results (category analysis and
                  factor results). This is necessary because analysis factors are specific to industry/sub-industry combinations. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Move Summary:</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Moving {selectedTickers.length} ticker(s):</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTickers.map((ticker) => (
                    <span key={ticker.id} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                      {ticker.symbol}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm border-t pt-3">
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{currentIndustry?.name || currentIndustryKey}</div>
                  <div className="text-gray-600 dark:text-gray-400">{currentSubIndustry?.name || currentSubIndustryKey}</div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 mx-4" />
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{selectedTargetIndustry?.name}</div>
                  <div className="text-gray-600 dark:text-gray-400">{selectedTargetSubIndustry?.name}</div>
                </div>
              </div>
            </div>
          </div>

          {formError && <p className="text-red-500 text-sm">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outlined" onClick={() => setShowConfirmation(false)}>
              Back
            </Button>
            <Button type="button" variant="contained" className="bg-red-600 hover:bg-red-700" onClick={handleConfirmMove} disabled={movingTickers}>
              {movingTickers ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Moving...
                </>
              ) : (
                'Confirm Move & Delete Analysis Data'
              )}
            </Button>
          </div>
        </div>
      </SingleSectionModal>
    );
  }

  return (
    <SingleSectionModal open={isOpen} onClose={onClose} title="Move Tickers">
      <form onSubmit={handlePreMove} className="space-y-4 text-left mt-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-blue-700 dark:text-blue-300 text-sm">Select the target industry and sub-industry where you want to move the selected ticker(s).</p>
        </div>

        {/* Selected Tickers Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Moving {selectedTickers.length} ticker(s):</h4>
          <div className="flex flex-wrap gap-1">
            {selectedTickers.map((ticker) => (
              <span key={ticker.id} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                {ticker.symbol} - {ticker.name}
              </span>
            ))}
          </div>
        </div>

        {/* Target Industry Selection */}
        <div>
          <StyledSelect
            label="Target Industry"
            showPleaseSelect
            selectedItemId={targetIndustryKey}
            items={industryItems}
            setSelectedItemId={handleTargetIndustryChange}
            helpText={loadingIndustries ? 'Loading industries…' : undefined}
          />
        </div>

        {/* Target Sub-Industry Selection */}
        <div>
          <StyledSelect
            label="Target Sub-Industry"
            showPleaseSelect
            selectedItemId={targetSubIndustryKey}
            items={targetSubIndustryItems}
            setSelectedItemId={setTargetSubIndustryKey}
            helpText={
              loadingTargetSubIndustries
                ? 'Loading sub-industries…'
                : !targetIndustryKey
                ? 'Please select a target industry first'
                : targetSubIndustryItems.length === 0
                ? 'No sub-industries found for selected industry'
                : undefined
            }
          />
        </div>

        {/* Preview */}
        {targetIndustryKey && targetSubIndustryKey && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Preview:</h4>
            <div className="flex items-center justify-between text-xs">
              <div className="text-center">
                <div className="font-medium">{currentIndustry?.name || currentIndustryKey}</div>
                <div className="text-gray-600 dark:text-gray-400">{currentSubIndustry?.name || currentSubIndustryKey}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
              <div className="text-center">
                <div className="font-medium">{selectedTargetIndustry?.name}</div>
                <div className="text-gray-600 dark:text-gray-400">{selectedTargetSubIndustry?.name}</div>
              </div>
            </div>
          </div>
        )}

        {formError && <p className="text-red-500 text-sm">{formError}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !targetIndustryKey || !targetSubIndustryKey}>
            Next: Review Move
          </Button>
        </div>
      </form>
    </SingleSectionModal>
  );
}
