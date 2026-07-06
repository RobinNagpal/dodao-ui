'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import { AdminInvalidateCacheResult, invalidateCloudFrontPathsForAdmin } from '@/utils/cache-actions';
import Button from '@dodao/web-core/components/core/buttons/Button';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useMemo, useState } from 'react';

interface ParsedInput {
  paths: string[];
  invalid: string[];
}

/**
 * Parse the textarea into CloudFront invalidation paths. Accepts:
 * - bare paths (`/stocks/NYSE/RTX`) — used as-is
 * - full URLs (`https://koalagains.com/stocks/...`) — pathname + search is used
 * - blank lines — ignored
 *
 * Any other entry (e.g. `not a url`) is reported back so the operator can fix it.
 */
function parseInputToPaths(raw: string): ParsedInput {
  const paths: string[] = [];
  const invalid: string[] = [];
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('/')) {
      paths.push(trimmed);
      continue;
    }
    try {
      const url = new URL(trimmed);
      paths.push(`${url.pathname}${url.search}`);
    } catch {
      invalid.push(trimmed);
    }
  }
  return { paths, invalid };
}

function ResultPanel({ result }: { result: AdminInvalidateCacheResult }): JSX.Element {
  const { cloudfront, cachedPaths, uncachedPaths } = result;

  const headline: { tone: 'success' | 'error' | 'warning'; text: string } = (() => {
    switch (cloudfront.status) {
      case 'sent':
        return { tone: 'success', text: `CloudFront invalidation submitted (id ${cloudfront.id}).` };
      case 'skipped-no-distribution':
        return {
          tone: 'error',
          text: 'CloudFront was not called — CLOUDFRONT_DISTRIBUTION_ID env var is unset on this runtime.',
        };
      case 'skipped-no-cached-paths':
        return {
          tone: 'warning',
          text: 'None of the provided paths matched a CloudFront-cached prefix, so nothing was sent.',
        };
      case 'failed':
        return { tone: 'error', text: `CloudFront invalidation failed: ${cloudfront.error}` };
    }
  })();

  const toneClass =
    headline.tone === 'success'
      ? 'border-emerald-700/40 bg-emerald-900/30 text-emerald-200'
      : headline.tone === 'warning'
      ? 'border-amber-700/40 bg-amber-900/30 text-amber-200'
      : 'border-red-700/40 bg-red-900/30 text-red-200';

  return (
    <div className={`mt-4 rounded-lg border p-4 space-y-3 ${toneClass}`}>
      <p className="font-medium">{headline.text}</p>

      {cachedPaths.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-200">Forwarded to CloudFront ({cachedPaths.length}):</p>
          <ul className="mt-1 text-sm text-gray-300 list-disc list-inside space-y-0.5">
            {cachedPaths.map((p) => (
              <li key={`cached-${p}`} className="font-mono break-all">
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {uncachedPaths.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-200">Skipped — not under any CloudFront-cached prefix ({uncachedPaths.length}):</p>
          <ul className="mt-1 text-sm text-gray-300 list-disc list-inside space-y-0.5">
            {uncachedPaths.map((p) => (
              <li key={`uncached-${p}`} className="font-mono break-all">
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function InvalidateCachePage(): JSX.Element {
  const { showNotification } = useNotificationContext();
  const [input, setInput] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<AdminInvalidateCacheResult | null>(null);

  const parsed = useMemo(() => parseInputToPaths(input), [input]);

  const handleInvalidate = async (): Promise<void> => {
    if (parsed.paths.length === 0) {
      showNotification({ type: 'error', message: 'Enter at least one URL or path to invalidate.' });
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const res = await invalidateCloudFrontPathsForAdmin(parsed.paths);
      setResult(res);
      if (res.cloudfront.status === 'sent') {
        showNotification({ type: 'success', message: `Invalidation submitted (id ${res.cloudfront.id})` });
      } else {
        showNotification({ type: 'error', message: 'Invalidation did not run — see details below.' });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      showNotification({ type: 'error', message: `Failed to invalidate cache: ${message}` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <AdminNav />

      <div className="bg-gray-800 -mx-6 px-6 py-6 mb-6 border-b border-gray-700/60">
        <div>
          <h1 className="text-2xl font-semibold text-white">Invalidate CloudFront Cache</h1>
          <p className="text-gray-300 mt-1">Paste one or more URLs (or absolute paths) — one per line — to purge them from the CloudFront edge cache.</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-700/50 bg-gray-900/40 p-4 space-y-4">
        <TextareaAutosize
          label="URLs or paths to invalidate (one per line)"
          modelValue={input}
          onUpdate={(v: unknown) => {
            if (typeof v === 'string') setInput(v);
          }}
          minHeight={200}
          placeholder={'https://koalagains.com/stocks/NYSE/RTX\n/commodities/gold\n/commodities/crude-oil*\n/commodities'}
        />

        <div className="text-sm text-gray-300 space-y-1">
          <p>
            Parsed <strong>{parsed.paths.length}</strong> path{parsed.paths.length === 1 ? '' : 's'} from input.
          </p>
          {parsed.invalid.length > 0 && (
            <p className="text-amber-300">
              <strong>{parsed.invalid.length}</strong> line{parsed.invalid.length === 1 ? '' : 's'} could not be parsed as a URL or path and will be ignored:
              <span className="ml-2 font-mono">{parsed.invalid.join(', ')}</span>
            </p>
          )}
          <p className="text-gray-400">
            Wildcards are supported (e.g. <span className="font-mono">/stocks/NYSE/RTX*</span> or <span className="font-mono">/commodities/gold*</span> to purge
            a commodity&apos;s whole page tree). Only paths under CloudFront-cached prefixes (<span className="font-mono">/stocks</span>,{' '}
            <span className="font-mono">/etfs</span>, <span className="font-mono">/commodities</span>,{' '}
            <span className="font-mono">/industry-tariff-report</span>, <span className="font-mono">/tariff-reports</span>, and their backing APIs) are
            forwarded to AWS; the rest are ignored as no-ops.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleInvalidate} loading={submitting} disabled={submitting || parsed.paths.length === 0}>
            Invalidate {parsed.paths.length > 0 ? `(${parsed.paths.length})` : ''}
          </Button>
        </div>
      </div>

      {result && <ResultPanel result={result} />}
    </PageWrapper>
  );
}
