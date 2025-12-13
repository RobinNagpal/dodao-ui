import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { Loader2 } from 'lucide-react';
import { IndustryBuildingBlockAnalysis } from '@prisma/client';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import MarkdownEditor from '@/components/Markdown/MarkdownEditor';
import type { SubIndustryAnalysisUpdateRequest } from '../../api/sub-industry-analysis/[buildingBlockKey]/route';
import type { CreateSubIndustryAnalysisRequest } from '../../api/sub-industry-analysis/route';
import type { IndustryAnalysisWithRelations } from '@/types/ticker-typesv1';

interface UpsertSubIndustryAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subIndustryAnalysis?: IndustryBuildingBlockAnalysis;
  preselectedIndustryAnalysisId?: string;
}

export default function UpsertSubIndustryAnalysisModal({
  isOpen,
  onClose,
  onSuccess,
  subIndustryAnalysis,
  preselectedIndustryAnalysisId,
}: UpsertSubIndustryAnalysisModalProps): JSX.Element {
  const [name, setName] = useState<string>('');
  const [buildingBlockKey, setBuildingBlockKey] = useState<string>('');
  const [industryAnalysisId, setIndustryAnalysisId] = useState<string | null>(preselectedIndustryAnalysisId ?? null);
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const isEditMode: boolean = !!subIndustryAnalysis;

  const { data: industryAnalyses, loading: loadingIndustryAnalyses } = useFetchData<IndustryAnalysisWithRelations[]>(
    `${getBaseUrl()}/api/industry-analysis`,
    {},
    'Failed to load industry analyses'
  );

  const { putData, loading: updatingSubIndustryAnalysis } = usePutData<IndustryBuildingBlockAnalysis, SubIndustryAnalysisUpdateRequest>({
    successMessage: 'Sub-industry analysis updated successfully!',
    errorMessage: 'Failed to update sub-industry analysis',
  });

  const { postData, loading: creatingSubIndustryAnalysis } = usePostData<IndustryBuildingBlockAnalysis, CreateSubIndustryAnalysisRequest>({
    successMessage: 'Sub-industry analysis created successfully!',
    errorMessage: 'Failed to create sub-industry analysis',
  });

  const loading: boolean = updatingSubIndustryAnalysis || creatingSubIndustryAnalysis || loadingIndustryAnalyses;

  useEffect(() => {
    if (subIndustryAnalysis) {
      setName(subIndustryAnalysis.name);
      setBuildingBlockKey(subIndustryAnalysis.buildingBlockKey);
      setIndustryAnalysisId(subIndustryAnalysis.tickerV1IndustryAnalysisId);
      setMetaDescription(subIndustryAnalysis.metaDescription || '');
      setDetails(subIndustryAnalysis.details || '');
    } else {
      resetForm();
      if (preselectedIndustryAnalysisId) {
        setIndustryAnalysisId(preselectedIndustryAnalysisId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subIndustryAnalysis, isOpen, preselectedIndustryAnalysisId]);

  const resetForm = (): void => {
    setName('');
    setBuildingBlockKey('');
    setIndustryAnalysisId(preselectedIndustryAnalysisId ?? null);
    setMetaDescription('');
    setDetails('');
    setFormError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setFormError('');

    if (!industryAnalysisId) {
      setFormError('Industry Analysis is required.');
      return;
    }

    try {
      if (isEditMode) {
        await putData(`/api/sub-industry-analysis/${subIndustryAnalysis!.buildingBlockKey}`, {
          name,
          buildingBlockKey,
          tickerV1IndustryAnalysisId: industryAnalysisId,
          metaDescription: metaDescription || undefined,
          details: details || undefined,
        });
      } else {
        if (!name || !buildingBlockKey) {
          setFormError('Name and Building Block Key are required.');
          return;
        }

        await postData('/api/sub-industry-analysis', {
          name,
          buildingBlockKey,
          tickerV1IndustryAnalysisId: industryAnalysisId,
          metaDescription: metaDescription || undefined,
          details: details || undefined,
        });
      }

      onSuccess();
      if (!isEditMode) resetForm();
      onClose();
    } catch {
      setFormError(`Failed to ${isEditMode ? 'update' : 'create'} sub-industry analysis`);
    }
  };

  const industryAnalysisItems: StyledSelectItem[] = useMemo<StyledSelectItem[]>(
    () =>
      (industryAnalyses ?? []).map((indAnalysis: IndustryAnalysisWithRelations) => ({
        id: indAnalysis.id,
        label: `${indAnalysis.name} (${indAnalysis.industry.name})`,
      })),
    [industryAnalyses]
  );

  return (
    <SingleSectionModal open={isOpen} onClose={onClose} title={isEditMode ? 'Edit Building Block Analysis' : 'Create Building Block Analysis'}>
      <form onSubmit={handleSubmit} className="space-y-3 text-left mt-3">
        <Input
          label="Name"
          modelValue={name}
          onUpdate={(v: unknown): void => {
            if (typeof v === 'string') setName(v);
          }}
          required
        />

        {!isEditMode && (
          <Input
            label="Building Block Key"
            modelValue={buildingBlockKey}
            onUpdate={(v: unknown): void => {
              if (typeof v === 'string') setBuildingBlockKey(v);
            }}
            required
            disabled={isEditMode}
          />
        )}

        <StyledSelect
          label="Industry Analysis"
          showPleaseSelect
          selectedItemId={industryAnalysisId}
          items={industryAnalysisItems}
          setSelectedItemId={(id: string | null): void => setIndustryAnalysisId(id)}
          helpText={loadingIndustryAnalyses ? 'Loading industry analyses…' : undefined}
        />

        <Input
          label="Meta Description (Optional)"
          modelValue={metaDescription}
          onUpdate={(v: unknown): void => {
            if (typeof v === 'string') setMetaDescription(v);
          }}
          required={false}
        />

        <div className="space-y-2">
          <label className="block text-sm font-semibold leading-6">Details (Optional)</label>
          <MarkdownEditor
            label=""
            modelValue={details}
            placeholder="Enter detailed analysis content in markdown..."
            onUpdate={(value) => setDetails(value || '')}
            objectId={`building-block-analysis-${subIndustryAnalysis?.id || 'new'}`}
            maxHeight={200}
            className="border border-gray-300 rounded-md"
          />
        </div>

        {formError && <p className="text-red-500 text-sm">{formError}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Saving…' : 'Creating…'}
              </>
            ) : isEditMode ? (
              'Save Changes'
            ) : (
              'Create Building Block Analysis'
            )}
          </Button>
        </div>
      </form>
    </SingleSectionModal>
  );
}
