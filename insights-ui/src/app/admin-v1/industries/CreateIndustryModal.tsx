// components/CreateIndustryModal.tsx
import Input from '@dodao/web-core/components/core/input/Input';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import { useState } from 'react';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { TickerV1Industry } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import Button from '@dodao/web-core/components/core/buttons/Button';

interface CreateIndustryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CreateIndustryRequest {
  industryKey: string;
  name: string;
  summary: string;
}

export default function CreateIndustryModal({ isOpen, onClose, onSuccess }: CreateIndustryModalProps): JSX.Element {
  const [industryKey, setIndustryKey] = useState('');
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [formError, setFormError] = useState('');

  const { postData, loading } = usePostData<TickerV1Industry, CreateIndustryRequest>({
    successMessage: 'Industry created successfully!',
    errorMessage: 'Failed to create industry',
  });

  const resetForm = () => {
    setIndustryKey('');
    setName('');
    setSummary('');
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!industryKey || !name || !summary) {
      setFormError('All fields are required.');
      return;
    }

    try {
      await postData('/api/industries', { industryKey, name, summary });
      onSuccess();
      resetForm();
      onClose();
    } catch {
      setFormError('Failed to create industry');
    }
  };

  return (
    <SingleSectionModal open={isOpen} onClose={onClose} title="Create Industry">
      <form onSubmit={handleSubmit} className="space-y-4 text-left mt-4">
        <Input label="Industry Key" modelValue={industryKey} onUpdate={(v) => setIndustryKey(v as string)} required />
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
                Creating...
              </>
            ) : (
              'Create Industry'
            )}
          </Button>
        </div>
      </form>
    </SingleSectionModal>
  );
}
