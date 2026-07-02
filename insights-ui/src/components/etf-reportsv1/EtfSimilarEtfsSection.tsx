import SimilarEtfs from '@/components/etf-reportsv1/SimilarEtfs';
import type { SimilarEtf } from '@/types/etf/etf-detail-response-types';
import { use } from 'react';

export interface EtfSimilarEtfsSectionProps {
  /** Promise returned by `fetchSimilarEtfsForEtf`. Unwrapped with `use()` inside a `<Suspense>` boundary. */
  similarEtfsPromise: Promise<ReadonlyArray<SimilarEtf>>;
  /** Sub-report slug so each peer links to the same sub-report page (see {@link SimilarEtfs}). */
  linkSlug?: string;
}

/**
 * Suspense-friendly wrapper that unwraps the peer-ETF promise and renders the
 * shared {@link SimilarEtfs} table. Kept separate from `EtfCategoryReport` so
 * only this subtree suspends while the peer lookup resolves. `SimilarEtfs`
 * returns `null` when the list is empty, so no peers → nothing rendered.
 */
export default function EtfSimilarEtfsSection({ similarEtfsPromise, linkSlug }: EtfSimilarEtfsSectionProps): JSX.Element | null {
  const similarEtfs = use(similarEtfsPromise);
  return <SimilarEtfs data={similarEtfs} linkSlug={linkSlug} />;
}
