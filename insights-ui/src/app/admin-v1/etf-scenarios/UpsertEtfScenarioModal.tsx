import Button from '@dodao/web-core/components/core/buttons/Button';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import Input from '@dodao/web-core/components/core/input/Input';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { EtfScenario, EtfScenarioOutlookBucket } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

interface UpsertEtfScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  scenarioId?: string;
}

const OUTLOOK_OPTIONS: EtfScenarioOutlookBucket[] = ['HIGH', 'MEDIUM', 'LOW', 'IN_PROGRESS'];

export default function UpsertEtfScenarioModal({ isOpen, onClose, onSuccess, scenarioId }: UpsertEtfScenarioModalProps): JSX.Element {
  const [scenarioNumber, setScenarioNumber] = useState<number>(1);
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [underlyingCause, setUnderlyingCause] = useState<string>('');
  const [historicalAnalog, setHistoricalAnalog] = useState<string>('');
  const [winnersMarkdown, setWinnersMarkdown] = useState<string>('');
  const [losersMarkdown, setLosersMarkdown] = useState<string>('');
  const [outlookMarkdown, setOutlookMarkdown] = useState<string>('');
  const [outlookBucket, setOutlookBucket] = useState<EtfScenarioOutlookBucket>('MEDIUM');
  const [outlookAsOfDate, setOutlookAsOfDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [archived, setArchived] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [loadingExisting, setLoadingExisting] = useState<boolean>(false);

  const isEditMode: boolean = !!scenarioId;

  const { postData, loading: creating } = usePostData<EtfScenario, unknown>({
    successMessage: 'Scenario created successfully!',
    errorMessage: 'Failed to create scenario',
  });

  const { putData, loading: updating } = usePutData<EtfScenario, unknown>({
    successMessage: 'Scenario updated successfully!',
    errorMessage: 'Failed to update scenario',
  });

  const loading: boolean = creating || updating || loadingExisting;

  useEffect(() => {
    if (!isOpen) return;
    if (!scenarioId) {
      setScenarioNumber(1);
      setTitle('');
      setSlug('');
      setUnderlyingCause('');
      setHistoricalAnalog('');
      setWinnersMarkdown('');
      setLosersMarkdown('');
      setOutlookMarkdown('');
      setOutlookBucket('MEDIUM');
      setOutlookAsOfDate(new Date().toISOString().slice(0, 10));
      setMetaDescription('');
      setArchived(false);
      setFormError('');
      return;
    }

    setLoadingExisting(true);
    fetch(`${getBaseUrl()}/api/etf-scenarios/${scenarioId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: EtfScenario | null) => {
        if (!data) {
          setFormError('Failed to load scenario');
          return;
        }
        setScenarioNumber(data.scenarioNumber);
        setTitle(data.title);
        setSlug(data.slug);
        setUnderlyingCause(data.underlyingCause);
        setHistoricalAnalog(data.historicalAnalog);
        setWinnersMarkdown(data.winnersMarkdown);
        setLosersMarkdown(data.losersMarkdown);
        setOutlookMarkdown(data.outlookMarkdown);
        setOutlookBucket(data.outlookBucket);
        setOutlookAsOfDate(new Date(data.outlookAsOfDate).toISOString().slice(0, 10));
        setMetaDescription(data.metaDescription ?? '');
        setArchived(data.archived);
      })
      .catch(() => setFormError('Failed to load scenario'))
      .finally(() => setLoadingExisting(false));
  }, [isOpen, scenarioId]);

  const archivedItems: CheckboxItem[] = useMemo<CheckboxItem[]>(() => [{ id: 'archived', name: 'archived', label: 'Archived' }], []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setFormError('');

    if (!title || !underlyingCause || !historicalAnalog || !winnersMarkdown || !losersMarkdown || !outlookMarkdown) {
      setFormError('All markdown fields plus title are required.');
      return;
    }

    const payload = {
      scenarioNumber,
      title,
      slug: slug || undefined,
      underlyingCause,
      historicalAnalog,
      winnersMarkdown,
      losersMarkdown,
      outlookMarkdown,
      outlookBucket,
      outlookAsOfDate: new Date(outlookAsOfDate).toISOString(),
      metaDescription: metaDescription || null,
      archived,
    };

    try {
      if (isEditMode) {
        await putData(`/api/etf-scenarios/${scenarioId}`, payload);
      } else {
        await postData('/api/etf-scenarios', payload);
      }
      onSuccess();
      onClose();
    } catch {
      setFormError(`Failed to ${isEditMode ? 'update' : 'create'} scenario`);
    }
  };

  return (
    <SingleSectionModal open={isOpen} onClose={onClose} title={isEditMode ? 'Edit Scenario' : 'Create Scenario'}>
      <form onSubmit={handleSubmit} className="space-y-3 text-left mt-3 max-h-[75vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            label="Scenario Number"
            modelValue={scenarioNumber}
            onUpdate={(v: unknown): void => {
              const n = typeof v === 'string' ? parseInt(v, 10) : typeof v === 'number' ? v : NaN;
              if (!isNaN(n)) setScenarioNumber(n);
            }}
            required
          />
          <div className="md:col-span-2">
            <Input
              label="Title"
              modelValue={title}
              onUpdate={(v: unknown): void => {
                if (typeof v === 'string') setTitle(v);
              }}
              required
            />
          </div>
        </div>

        <Input
          label="Slug (leave blank to auto-derive from title)"
          modelValue={slug}
          onUpdate={(v: unknown): void => {
            if (typeof v === 'string') setSlug(v);
          }}
        />

        <TextareaAutosize
          label="Underlying cause (markdown)"
          modelValue={underlyingCause}
          onUpdate={(v: unknown): void => {
            if (typeof v === 'string') setUnderlyingCause(v);
          }}
        />

        <TextareaAutosize
          label="Historical analog (markdown)"
          modelValue={historicalAnalog}
          onUpdate={(v: unknown): void => {
            if (typeof v === 'string') setHistoricalAnalog(v);
          }}
        />

        <TextareaAutosize
          label="Winners (markdown)"
          modelValue={winnersMarkdown}
          onUpdate={(v: unknown): void => {
            if (typeof v === 'string') setWinnersMarkdown(v);
          }}
        />

        <TextareaAutosize
          label="Losers (markdown)"
          modelValue={losersMarkdown}
          onUpdate={(v: unknown): void => {
            if (typeof v === 'string') setLosersMarkdown(v);
          }}
        />

        <TextareaAutosize
          label="Outlook (markdown; should include the as-of date, catalysts, and most exposed ETFs)"
          modelValue={outlookMarkdown}
          onUpdate={(v: unknown): void => {
            if (typeof v === 'string') setOutlookMarkdown(v);
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-300">Outlook bucket</span>
            <select
              className="bg-[#111827] border border-[#374151] rounded px-2 py-1.5 text-sm text-white"
              value={outlookBucket}
              onChange={(e) => setOutlookBucket(e.target.value as EtfScenarioOutlookBucket)}
            >
              {OUTLOOK_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-300">Outlook as-of date</span>
            <input
              type="date"
              className="bg-[#111827] border border-[#374151] rounded px-2 py-1.5 text-sm text-white"
              value={outlookAsOfDate}
              onChange={(e) => setOutlookAsOfDate(e.target.value)}
            />
          </label>
        </div>

        <TextareaAutosize
          label="SEO meta description (optional)"
          modelValue={metaDescription}
          onUpdate={(v: unknown): void => {
            if (typeof v === 'string') setMetaDescription(v);
          }}
        />

        <Checkboxes
          items={archivedItems}
          selectedItemIds={archived ? ['archived'] : []}
          onChange={(ids: string[]) => setArchived(ids.includes('archived'))}
          className="mt-1"
        />

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
              'Create Scenario'
            )}
          </Button>
        </div>
      </form>
    </SingleSectionModal>
  );
}
