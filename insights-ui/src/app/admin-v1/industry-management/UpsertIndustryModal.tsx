// components/UpsertIndustryModal.tsx
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { Loader2 } from 'lucide-react';
import { TickerV1Industry } from '@prisma/client';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';

interface UpsertIndustryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  industry?: TickerV1Industry;
}

interface IndustryUpdateRequest {
  name?: string;
  summary?: string;
  archived?: boolean;
}

interface CreateIndustryRequest {
  industryKey: string;
  name: string;
  summary: string;
  archived?: boolean;
}

export default function UpsertIndustryModal({ isOpen, onClose, onSuccess, industry }: UpsertIndustryModalProps): JSX.Element {
  const [industryKey, setIndustryKey] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [archived, setArchived] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const isEditMode: boolean = !!industry;

  const { putData, loading: updatingIndustry } = usePutData<TickerV1Industry, IndustryUpdateRequest>({
    successMessage: 'Industry updated successfully!',
    errorMessage: 'Failed to update industry',
  });

  const { postData, loading: creatingIndustry } = usePostData<TickerV1Industry, CreateIndustryRequest>({
    successMessage: 'Industry created successfully!',
    errorMessage: 'Failed to create industry',
  });

  const loading: boolean = updatingIndustry || creatingIndustry;

  useEffect(() => {
    if (industry) {
      setName(industry.name);
      setSummary(industry.summary);
      setArchived(industry.archived);
      setIndustryKey(industry.industryKey);
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [industry, isOpen]);

  const resetForm = (): void => {
    setIndustryKey('');
    setName('');
    setSummary('');
    setArchived(false);
    setFormError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setFormError('');

    try {
      if (isEditMode) {
        await putData(`/api/industries/${industry!.industryKey}`, {
          name,
          summary,
          archived,
        });
      } else {
        if (!industryKey || !name || !summary) {
          setFormError('Industry Key, Name, and Summary are required.');
          return;
        }

        await postData('/api/industries', {
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
      setFormError(`Failed to ${isEditMode ? 'update' : 'create'} industry`);
    }
  };

  // Single-item checkbox group for "Archived"
  const archivedItems: CheckboxItem[] = useMemo<CheckboxItem[]>(() => [{ id: 'archived', name: 'archived', label: 'Archived' }], []);
  const handleArchivedChange = (selectedIds: string[]): void => {
    setArchived(selectedIds.includes('archived'));
  };

  return (
    <SingleSectionModal open={isOpen} onClose={onClose} title={isEditMode ? 'Edit Industry' : 'Create Industry'}>
      <form onSubmit={handleSubmit} className="space-y-4 text-left mt-4">
        {!isEditMode && (
          <Input
            label="Industry Key"
            modelValue={industryKey}
            onUpdate={(v: unknown): void => {
              if (typeof v === 'string') setIndustryKey(v);
            }}
            required
            disabled={isEditMode}
          />
        )}

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

        <Checkboxes items={archivedItems} selectedItemIds={archived ? ['archived'] : []} onChange={handleArchivedChange} className="mt-2" />

        {formError && <p className="text-red-500 text-sm">{formError}</p>}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Saving...' : 'Creating...'}
              </>
            ) : isEditMode ? (
              'Save Changes'
            ) : (
              'Create Industry'
            )}
          </Button>
        </div>
      </form>
    </SingleSectionModal>
  );
}
