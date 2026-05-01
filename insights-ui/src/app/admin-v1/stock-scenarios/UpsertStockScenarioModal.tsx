import { ScenarioDirection, ScenarioProbabilityBucket, ScenarioTimeframe } from '@/types/scenarioEnums';
import { ALL_SUPPORTED_COUNTRIES, SupportedCountries } from '@/utils/countryExchangeUtils';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import Input from '@dodao/web-core/components/core/input/Input';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { StockScenario } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

interface UpsertStockScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  scenarioId?: string;
}

const DIRECTION_OPTIONS: Array<{ value: ScenarioDirection; label: string }> = [
  { value: 'DOWNSIDE', label: 'Downside (risk / crash scenario)' },
  { value: 'UPSIDE', label: 'Upside (rally / boom scenario)' },
];

const TIMEFRAME_OPTIONS: Array<{ value: ScenarioTimeframe; label: string }> = [
  { value: 'FUTURE', label: 'Future (hasn’t happened yet)' },
  { value: 'IN_PROGRESS', label: 'In progress (currently unfolding)' },
  { value: 'PAST', label: 'Already happened' },
];

const PROBABILITY_OPTIONS: Array<{ value: ScenarioProbabilityBucket; label: string }> = [
  { value: 'HIGH', label: 'High (>40%)' },
  { value: 'MEDIUM', label: 'Medium (20–40%)' },
  { value: 'LOW', label: 'Low (<20%)' },
];

export default function UpsertStockScenarioModal({ isOpen, onClose, onSuccess, scenarioId }: UpsertStockScenarioModalProps): JSX.Element {
  const [scenarioNumber, setScenarioNumber] = useState<number>(1);
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [underlyingCause, setUnderlyingCause] = useState<string>('');
  const [historicalAnalog, setHistoricalAnalog] = useState<string>('');
  const [outlookMarkdown, setOutlookMarkdown] = useState<string>('');
  const [direction, setDirection] = useState<ScenarioDirection>('DOWNSIDE');
  const [timeframe, setTimeframe] = useState<ScenarioTimeframe>('FUTURE');
  const [probabilityBucket, setProbabilityBucket] = useState<ScenarioProbabilityBucket>('MEDIUM');
  const [probabilityPercentage, setProbabilityPercentage] = useState<string>('');
  const [countries, setCountries] = useState<SupportedCountries[]>([]);
  const [outlookAsOfDate, setOutlookAsOfDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [detailedAnalysis, setDetailedAnalysis] = useState<string>('');
  const [archived, setArchived] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [loadingExisting, setLoadingExisting] = useState<boolean>(false);

  const isEditMode: boolean = !!scenarioId;

  const { postData, loading: creating } = usePostData<StockScenario, unknown>({
    successMessage: 'Scenario created successfully!',
    errorMessage: 'Failed to create scenario',
  });

  const { putData, loading: updating } = usePutData<StockScenario, unknown>({
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
      setOutlookMarkdown('');
      setDirection('DOWNSIDE');
      setTimeframe('FUTURE');
      setProbabilityBucket('MEDIUM');
      setProbabilityPercentage('');
      setCountries([]);
      setOutlookAsOfDate(new Date().toISOString().slice(0, 10));
      setMetaDescription('');
      setDetailedAnalysis('');
      setArchived(false);
      setFormError('');
      return;
    }

    setLoadingExisting(true);
    fetch(`${getBaseUrl()}/api/stock-scenarios/${scenarioId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: StockScenario | null) => {
        if (!data) {
          setFormError('Failed to load scenario');
          return;
        }
        setScenarioNumber(data.scenarioNumber);
        setTitle(data.title);
        setSlug(data.slug);
        setUnderlyingCause(data.underlyingCause);
        setHistoricalAnalog(data.historicalAnalog);
        setOutlookMarkdown(data.outlookMarkdown);
        setDirection(data.direction as ScenarioDirection);
        setTimeframe(data.timeframe as ScenarioTimeframe);
        setProbabilityBucket(data.probabilityBucket as ScenarioProbabilityBucket);
        setProbabilityPercentage(typeof data.probabilityPercentage === 'number' ? String(data.probabilityPercentage) : '');
        setCountries((data.countries ?? []) as SupportedCountries[]);
        setOutlookAsOfDate(new Date(data.outlookAsOfDate).toISOString().slice(0, 10));
        setMetaDescription(data.metaDescription ?? '');
        setDetailedAnalysis(data.detailedAnalysis ?? '');
        setArchived(data.archived);
      })
      .catch(() => setFormError('Failed to load scenario'))
      .finally(() => setLoadingExisting(false));
  }, [isOpen, scenarioId]);

  const archivedItems: CheckboxItem[] = useMemo<CheckboxItem[]>(() => [{ id: 'archived', name: 'archived', label: 'Archived' }], []);

  const countryItems: CheckboxItem[] = useMemo<CheckboxItem[]>(() => ALL_SUPPORTED_COUNTRIES.map((c) => ({ id: c, name: c, label: c })), []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setFormError('');

    if (!title || !underlyingCause || !historicalAnalog || !outlookMarkdown) {
      setFormError('Title, underlying cause, historical analog, and outlook are required.');
      return;
    }
    if (countries.length === 0) {
      setFormError('Select at least one supported country — scenarios must be scoped to a market.');
      return;
    }

    let probabilityPercentageValue: number | null = null;
    if (probabilityPercentage.trim() !== '') {
      const n = parseInt(probabilityPercentage, 10);
      if (isNaN(n) || n < 0 || n > 100) {
        setFormError('Probability percentage must be an integer between 0 and 100.');
        return;
      }
      probabilityPercentageValue = n;
    }

    const payload = {
      scenarioNumber,
      title,
      slug: slug || undefined,
      underlyingCause,
      historicalAnalog,
      outlookMarkdown,
      direction,
      timeframe,
      probabilityBucket,
      probabilityPercentage: probabilityPercentageValue,
      countries,
      outlookAsOfDate: new Date(outlookAsOfDate).toISOString(),
      metaDescription: metaDescription || null,
      detailedAnalysis: detailedAnalysis || null,
      archived,
    };

    try {
      if (isEditMode) {
        await putData(`/api/stock-scenarios/${scenarioId}`, payload);
      } else {
        await postData('/api/stock-scenarios', payload);
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-300">Direction</span>
            <select
              className="bg-[#111827] border border-[#374151] rounded px-2 py-1.5 text-sm text-white"
              value={direction}
              onChange={(e) => setDirection(e.target.value as ScenarioDirection)}
            >
              {DIRECTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-300">Timeframe</span>
            <select
              className="bg-[#111827] border border-[#374151] rounded px-2 py-1.5 text-sm text-white"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as ScenarioTimeframe)}
            >
              {TIMEFRAME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-300">Probability bucket</span>
            <select
              className="bg-[#111827] border border-[#374151] rounded px-2 py-1.5 text-sm text-white"
              value={probabilityBucket}
              onChange={(e) => setProbabilityBucket(e.target.value as ScenarioProbabilityBucket)}
            >
              {PROBABILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <p className="text-sm text-gray-300 mb-1">Countries in scope (at least one required)</p>
          <Checkboxes items={countryItems} selectedItemIds={countries} onChange={(ids: string[]) => setCountries(ids as SupportedCountries[])} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-300">Precise probability % (optional, 0–100)</span>
            <input
              type="number"
              min={0}
              max={100}
              className="bg-[#111827] border border-[#374151] rounded px-2 py-1.5 text-sm text-white"
              value={probabilityPercentage}
              onChange={(e) => setProbabilityPercentage(e.target.value)}
              placeholder="e.g. 30"
            />
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
          label="Outlook (markdown; should include the as-of date and catalysts)"
          modelValue={outlookMarkdown}
          onUpdate={(v: unknown): void => {
            if (typeof v === 'string') setOutlookMarkdown(v);
          }}
        />

        <TextareaAutosize
          label="Detailed analysis (markdown, optional — surfaced behind a 'Detailed analysis' button on the public detail page)"
          modelValue={detailedAnalysis}
          onUpdate={(v: unknown): void => {
            if (typeof v === 'string') setDetailedAnalysis(v);
          }}
        />

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
