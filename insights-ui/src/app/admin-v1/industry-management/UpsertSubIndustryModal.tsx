// unchanged except exported here for completeness
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { Loader2 } from 'lucide-react';
import { TickerV1SubIndustry, TickerV1Industry } from '@prisma/client';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';

interface UpsertSubIndustryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subIndustry?: TickerV1SubIndustry;
  preselectedIndustryKey?: string;
}

interface SubIndustryUpdateRequest {
  name?: string;
  summary?: string;
  industryKey?: string;
  archived?: boolean;
}

interface CreateSubIndustryRequest {
  subIndustryKey: string;
  industryKey: string;
  name: string;
  summary: string;
  archived?: boolean;
}

export default function UpsertSubIndustryModal({ isOpen, onClose, onSuccess, subIndustry, preselectedIndustryKey }: UpsertSubIndustryModalProps): JSX.Element {
  const [subIndustryKey, setSubIndustryKey] = useState<string>('');
  const [industryKey, setIndustryKey] = useState<string | null>(preselectedIndustryKey ?? null);
  const [name, setName] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [archived, setArchived] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const isEditMode: boolean = !!subIndustry;

  const { data: industries, loading: loadingIndustries } = useFetchData<TickerV1Industry[]>(`${getBaseUrl()}/api/industries`, {}, 'Failed to load industries');

  const { putData, loading: updatingSubIndustry } = usePutData<TickerV1SubIndustry, SubIndustryUpdateRequest>({
    successMessage: 'Sub-industry updated successfully!',
    errorMessage: 'Failed to update sub-industry',
  });

  const { postData, loading: creatingSubIndustry } = usePostData<TickerV1SubIndustry, CreateSubIndustryRequest>({
    successMessage: 'Sub-industry created successfully!',
    errorMessage: 'Failed to create sub-industry',
  });

  const loading: boolean = updatingSubIndustry || creatingSubIndustry || loadingIndustries;

  useEffect(() => {
    if (subIndustry) {
      setName(subIndustry.name);
      setSummary(subIndustry.summary);
      setArchived(subIndustry.archived);
      setSubIndustryKey(subIndustry.subIndustryKey);
      setIndustryKey(subIndustry.industryKey);
    } else {
      resetForm();
      if (preselectedIndustryKey) {
        setIndustryKey(preselectedIndustryKey);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subIndustry, isOpen, preselectedIndustryKey]);

  const resetForm = (): void => {
    setSubIndustryKey('');
    setIndustryKey(preselectedIndustryKey ?? null);
    setName('');
    setSummary('');
    setArchived(false);
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
        await putData(`/api/sub-industries/${subIndustry!.subIndustryKey}`, {
          name,
          summary,
          industryKey,
          archived,
        });
      } else {
        if (!subIndustryKey || !name || !summary) {
          setFormError('Sub-industry Key, Name, and Summary are required.');
          return;
        }

        await postData('/api/sub-industries', {
          subIndustryKey,
          industryKey,
          name,
          summary,
          archived,
        });
      }

      onSuccess();
      if (!isEditMode) resetForm();
      onClose();
    } catch {
      setFormError(`Failed to ${isEditMode ? 'update' : 'create'} sub-industry`);
    }
  };

  const industryItems: StyledSelectItem[] = useMemo<StyledSelectItem[]>(
    () =>
      (industries ?? []).map((ind: TickerV1Industry) => ({
        id: ind.industryKey,
        label: ind.name,
      })),
    [industries]
  );

  const archivedItems: CheckboxItem[] = useMemo<CheckboxItem[]>(() => [{ id: 'archived', name: 'archived', label: 'Archived' }], []);
  const handleArchivedChange = (selectedIds: string[]): void => {
    setArchived(selectedIds.includes('archived'));
  };

  return (
    <SingleSectionModal open={isOpen} onClose={onClose} title={isEditMode ? 'Edit Sub-industry' : 'Create Sub-industry'}>
      <form onSubmit={handleSubmit} className="space-y-3 text-left mt-3">
        {!isEditMode && (
          <Input
            label="Sub-industry Key"
            modelValue={subIndustryKey}
            onUpdate={(v: unknown): void => {
              if (typeof v === 'string') setSubIndustryKey(v);
            }}
            required
            disabled={isEditMode}
          />
        )}

        <StyledSelect
          label="Industry"
          showPleaseSelect
          selectedItemId={industryKey}
          items={industryItems}
          setSelectedItemId={(id: string | null): void => setIndustryKey(id)}
          helpText={loadingIndustries ? 'Loading industries…' : undefined}
        />

        <Input
          label="Name"
          modelValue={name}
          onUpdate={(v: unknown): void => {
            if (typeof v === 'string') setName(v);
          }}
          required
        />

        <TextareaAutosize
          label="Summary"
          modelValue={summary}
          onUpdate={(v: unknown): void => {
            if (typeof v === 'string') setSummary(v);
          }}
        />

        <Checkboxes items={archivedItems} selectedItemIds={archived ? ['archived'] : []} onChange={handleArchivedChange} className="mt-1" />

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
              'Create Sub-industry'
            )}
          </Button>
        </div>
      </form>
    </SingleSectionModal>
  );
}
