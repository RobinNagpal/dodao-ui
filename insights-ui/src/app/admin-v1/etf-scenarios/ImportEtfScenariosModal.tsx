import type { ImportEtfScenariosResponse } from '@/app/api/etf-scenarios/import/route';
import Button from '@dodao/web-core/components/core/buttons/Button';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ImportEtfScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportEtfScenariosModal({ isOpen, onClose, onSuccess }: ImportEtfScenariosModalProps): JSX.Element {
  const [markdown, setMarkdown] = useState<string>('');
  const [fallbackDate, setFallbackDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<ImportEtfScenariosResponse | null>(null);

  const { postData, loading } = usePostData<ImportEtfScenariosResponse, { markdown: string; fallbackOutlookDate: string }>({
    successMessage: 'Scenarios imported!',
    errorMessage: 'Failed to import scenarios',
  });

  const handleImport = async (): Promise<void> => {
    setError('');
    setResult(null);
    if (!markdown.trim()) {
      setError('Paste the scenarios markdown before importing.');
      return;
    }
    try {
      const data = await postData('/api/etf-scenarios/import', {
        markdown,
        fallbackOutlookDate: new Date(fallbackDate).toISOString(),
      });
      setResult(data ?? null);
      onSuccess();
    } catch {
      setError('Failed to import scenarios');
    }
  };

  return (
    <SingleSectionModal open={isOpen} onClose={onClose} title="Import ETF Scenarios from markdown">
      <div className="text-left mt-3 max-h-[75vh] overflow-y-auto pr-1 space-y-3">
        <p className="text-xs text-gray-400">
          Paste an ETF scenarios markdown document. Scenarios are matched by <code>scenarioNumber</code> — existing rows are updated in place, and all winner /
          loser / most-exposed links are rebuilt from the doc.
        </p>

        <label className="flex flex-col gap-1 text-sm max-w-xs">
          <span className="text-gray-300">Fallback outlook date (used when a scenario has no explicit &quot;as of&quot; line)</span>
          <input
            type="date"
            className="bg-[#111827] border border-[#374151] rounded px-2 py-1.5 text-sm text-white"
            value={fallbackDate}
            onChange={(e) => setFallbackDate(e.target.value)}
          />
        </label>

        <TextareaAutosize
          label="Scenarios markdown"
          modelValue={markdown}
          onUpdate={(v: unknown) => {
            if (typeof v === 'string') setMarkdown(v);
          }}
          minHeight={240}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {result && (
          <div className="rounded-lg border border-gray-700/50 bg-gray-900/40 p-3 text-sm text-gray-200 space-y-2">
            <p>
              Parsed <strong>{result.totalParsed}</strong> scenarios — {result.created} created, {result.updated} updated. Resolved {result.resolvedTickers}{' '}
              tickers against the ETFs table.
            </p>
            {result.unresolvedTickers.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Unresolved tickers ({result.unresolvedTickers.length}):</p>
                <p className="text-xs text-gray-500 break-words">{result.unresolvedTickers.join(', ')}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleImport} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing…
              </>
            ) : (
              'Import'
            )}
          </Button>
        </div>
      </div>
    </SingleSectionModal>
  );
}
