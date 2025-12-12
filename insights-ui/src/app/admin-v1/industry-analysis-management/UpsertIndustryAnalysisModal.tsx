import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { Loader2 } from 'lucide-react';
import { TickerV1IndustryAnalysis, TickerV1Industry } from '@prisma/client';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import MarkdownEditor from '@/components/Markdown/MarkdownEditor';
import type { IndustryAnalysisUpdateRequest } from '../../api/industry-analysis/[industryKey]/route';
import type { CreateIndustryAnalysisRequest } from '../../api/industry-analysis/route';
import type { IndustryAnalysisWithRelations } from '@/types/ticker-typesv1';

interface UpsertIndustryAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  industryAnalysis?: IndustryAnalysisWithRelations;
}

export default function UpsertIndustryAnalysisModal({ isOpen, onClose, onSuccess, industryAnalysis }: UpsertIndustryAnalysisModalProps): JSX.Element {
  const [name, setName] = useState<string>('');
  const [industryKey, setIndustryKey] = useState<string | null>(null);
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const isEditMode: boolean = !!industryAnalysis;

  const { data: industries, loading: loadingIndustries } = useFetchData<TickerV1Industry[]>(`${getBaseUrl()}/api/industries`, {}, 'Failed to load industries');

  const { putData, loading: updatingIndustryAnalysis } = usePutData<TickerV1IndustryAnalysis, IndustryAnalysisUpdateRequest>({
    successMessage: 'Industry analysis updated successfully!',
    errorMessage: 'Failed to update industry analysis',
  });

  const { postData, loading: creatingIndustryAnalysis } = usePostData<TickerV1IndustryAnalysis, CreateIndustryAnalysisRequest>({
    successMessage: 'Industry analysis created successfully!',
    errorMessage: 'Failed to create industry analysis',
  });

  const loading: boolean = updatingIndustryAnalysis || creatingIndustryAnalysis || loadingIndustries;

  useEffect(() => {
    if (industryAnalysis) {
      setName(industryAnalysis.name);
      setIndustryKey(industryAnalysis.industryKey);
      setMetaDescription(industryAnalysis.metaDescription || '');
      setDetails(industryAnalysis.details || '');
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [industryAnalysis, isOpen]);

  const resetForm = (): void => {
    setName('');
    setIndustryKey(null);
    setMetaDescription('');
    setDetails('');
    setFormError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setFormError('');

    if (!industryKey) {
      setFormError('Industry is required.');
      return;
    }

    try {
      if (isEditMode) {
        await putData(`/api/industry-analysis/${industryAnalysis!.industryKey}`, {
          name,
          industryKey,
          metaDescription: metaDescription || undefined,
          details: details || undefined,
        });
      } else {
        if (!name) {
          setFormError('Name is required.');
          return;
        }

        await postData('/api/industry-analysis', {
          name,
          industryKey,
          metaDescription: metaDescription || undefined,
          details: details || undefined,
        });
      }

      onSuccess();
      if (!isEditMode) resetForm();
      onClose();
    } catch {
      setFormError(`Failed to ${isEditMode ? 'update' : 'create'} industry analysis`);
    }
  };

  const industryItems: StyledSelectItem[] = useMemo<StyledSelectItem[]>(
    () =>
      (industries ?? []).map((ind: TickerV1Industry) => ({
        id: ind.industryKey,
        label: `${ind.name} (${ind.industryKey})`,
      })),
    [industries]
  );

  return (
    <SingleSectionModal open={isOpen} onClose={onClose} title={isEditMode ? 'Edit Industry Analysis' : 'Create Industry Analysis'}>
      <form onSubmit={handleSubmit} className="space-y-3 text-left mt-3">
        <Input
          label="Name"
          modelValue={name}
          onUpdate={(v: unknown): void => {
            if (typeof v === 'string') setName(v);
          }}
          required
        />

        <StyledSelect
          label="Industry"
          showPleaseSelect
          selectedItemId={industryKey}
          items={industryItems}
          setSelectedItemId={(id: string | null): void => setIndustryKey(id)}
          helpText={loadingIndustries ? 'Loading industries…' : undefined}
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
            objectId={`industry-analysis-${industryAnalysis?.id || 'new'}`}
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
              'Create Industry Analysis'
            )}
          </Button>
        </div>
      </form>
    </SingleSectionModal>
  );
}
