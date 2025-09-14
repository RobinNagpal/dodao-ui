// components/EditIndustryModal.tsx
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import { useEffect, useState } from 'react';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { Loader2 } from 'lucide-react';
import { TickerV1Industry } from '@prisma/client';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';

interface EditIndustryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  industry: TickerV1Industry;
}

interface IndustryUpdateRequest {
  name?: string;
  summary?: string;
}

export default function EditIndustryModal({ isOpen, onClose, onSuccess, industry }: EditIndustryModalProps): JSX.Element {
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [formError, setFormError] = useState('');

  const { putData, loading } = usePutData<TickerV1Industry, IndustryUpdateRequest>({
    successMessage: 'Industry updated successfully!',
    errorMessage: 'Failed to update industry',
  });

  useEffect(() => {
    if (industry) {
      setName(industry.name);
      setSummary(industry.summary);
    }
  }, [industry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      await putData(`/api/industries/${industry.industryKey}`, { name, summary });
      onSuccess();
      onClose();
    } catch {
      setFormError('Failed to update industry');
    }
  };

  return (
    <SingleSectionModal open={isOpen} onClose={onClose} title="Edit Industry">
      <form onSubmit={handleSubmit} className="space-y-4 text-left mt-4">
        <Input label="Name" modelValue={name} onUpdate={(v) => setName(v as string)} required />
        <TextareaAutosize label="Summary" modelValue={summary} onUpdate={(v) => setSummary(v as string)} />
        {formError && <p className="text-red-500 text-sm">{formError}</p>}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </SingleSectionModal>
  );
}
