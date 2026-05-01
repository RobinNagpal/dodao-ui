import type { EtfScenarioDetail, EtfScenarioLinkDto } from '@/app/api/[spaceId]/etf-scenarios/[slug]/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ETF_EXCHANGES } from '@/utils/etfCountryExchangeUtils';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { EtfScenarioEtfLink } from '@prisma/client';
import { EtfScenarioRole } from '@/types/etfScenarioEnums';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ManageLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  scenarioId?: string;
  scenarioTitle?: string;
}

interface AddLinkFormState {
  symbol: string;
  exchange: string;
  role: EtfScenarioRole;
  roleExplanation: string;
  expectedPriceChange: string;
  expectedPriceChangeExplanation: string;
}

const ROLES: EtfScenarioRole[] = ['WINNER', 'LOSER'];

function fetchDetailBySlug(slug: string): Promise<EtfScenarioDetail | null> {
  return fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etf-scenarios/${slug}?allowNull=true`).then((r) => (r.ok ? r.json() : null));
}

export default function ManageLinksModal({ isOpen, onClose, onSuccess, scenarioId, scenarioTitle }: ManageLinksModalProps): JSX.Element {
  const [detail, setDetail] = useState<EtfScenarioDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [form, setForm] = useState<AddLinkFormState>({
    symbol: '',
    exchange: 'NYSEARCA',
    role: 'WINNER',
    roleExplanation: '',
    expectedPriceChange: '',
    expectedPriceChangeExplanation: '',
  });
  const [formError, setFormError] = useState<string>('');

  const { postData, loading: adding } = usePostData<EtfScenarioEtfLink, unknown>({
    successMessage: 'Link added!',
    errorMessage: 'Failed to add link',
  });
  const { deleteData, loading: removing } = useDeleteData<{ success: boolean }, never>({
    successMessage: 'Link removed!',
    errorMessage: 'Failed to remove link',
  });

  useEffect(() => {
    if (!isOpen || !scenarioId) {
      setDetail(null);
      return;
    }

    setLoadingDetail(true);
    // Fetch scenario slug first (detail endpoint is keyed by slug; we have id).
    fetch(`${getBaseUrl()}/api/etf-scenarios/${scenarioId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((scenario: { slug: string } | null) => (scenario ? fetchDetailBySlug(scenario.slug) : null))
      .then((d) => setDetail(d))
      .finally(() => setLoadingDetail(false));
  }, [isOpen, scenarioId]);

  const refreshDetail = async (): Promise<void> => {
    if (!detail) return;
    const fresh = await fetchDetailBySlug(detail.slug);
    if (fresh) setDetail(fresh);
    onSuccess();
  };

  const handleAdd = async (): Promise<void> => {
    setFormError('');
    if (!scenarioId) return;
    const symbol = form.symbol.trim().toUpperCase();
    const exchange = form.exchange.trim().toUpperCase();
    if (!symbol || !exchange) {
      setFormError('Symbol and exchange are both required.');
      return;
    }

    let expectedPriceChangeValue: number | null = null;
    if (form.expectedPriceChange.trim() !== '') {
      const n = parseInt(form.expectedPriceChange, 10);
      if (isNaN(n) || n < -100 || n > 100) {
        setFormError('Expected price change must be an integer between -100 and 100.');
        return;
      }
      expectedPriceChangeValue = n;
    }

    try {
      await postData(`/api/etf-scenarios/${scenarioId}/links`, {
        symbol,
        exchange,
        role: form.role,
        roleExplanation: form.roleExplanation.trim() || null,
        expectedPriceChange: expectedPriceChangeValue,
        expectedPriceChangeExplanation: form.expectedPriceChangeExplanation.trim() || null,
      });
      setForm({
        symbol: '',
        exchange: form.exchange,
        role: form.role,
        roleExplanation: '',
        expectedPriceChange: '',
        expectedPriceChangeExplanation: '',
      });
      await refreshDetail();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add link';
      setFormError(message);
    }
  };

  const handleRemove = async (link: EtfScenarioLinkDto): Promise<void> => {
    if (!scenarioId) return;
    const url = `${getBaseUrl()}/api/etf-scenarios/${scenarioId}/links?symbol=${encodeURIComponent(link.symbol)}&role=${link.role}`;
    await deleteData(url);
    await refreshDetail();
  };

  const allLinks: Array<{ heading: string; role: EtfScenarioRole; items: EtfScenarioLinkDto[] }> = [
    { heading: 'Winners', role: 'WINNER', items: detail?.winners ?? [] },
    { heading: 'Losers', role: 'LOSER', items: detail?.losers ?? [] },
  ];

  return (
    <SingleSectionModal open={isOpen} onClose={onClose} title={`Manage Links${scenarioTitle ? ` — ${scenarioTitle}` : ''}`}>
      <div className="text-left mt-3 max-h-[75vh] overflow-y-auto pr-1 space-y-4">
        {loadingDetail ? (
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading links…
          </div>
        ) : (
          <>
            {detail && detail.countries.length > 0 && (
              <p className="text-xs text-gray-400">
                This scenario is scoped to: <span className="text-gray-200 font-medium">{detail.countries.join(', ')}</span>. Links on any other country&apos;s
                ETF exchanges will be rejected.
              </p>
            )}
            <div className="rounded-lg border border-gray-700/50 bg-gray-900/40 p-3 space-y-2">
              <h3 className="text-sm font-semibold text-white">Add link</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <Input
                  label="Symbol"
                  modelValue={form.symbol}
                  onUpdate={(v: unknown) => {
                    if (typeof v === 'string') setForm((f) => ({ ...f, symbol: v }));
                  }}
                />
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-gray-300">Exchange</span>
                  <select
                    className="bg-[#111827] border border-[#374151] rounded px-2 py-1.5 text-sm text-white"
                    value={form.exchange}
                    onChange={(e) => setForm((f) => ({ ...f, exchange: e.target.value }))}
                  >
                    {ETF_EXCHANGES.map((ex) => (
                      <option key={ex} value={ex}>
                        {ex}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-gray-300">Role</span>
                  <select
                    className="bg-[#111827] border border-[#374151] rounded px-2 py-1.5 text-sm text-white"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as EtfScenarioRole }))}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
                <Button onClick={handleAdd} disabled={adding}>
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                  Add
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <TextareaAutosize
                  label="Role explanation (why this ETF is a winner / loser — markdown)"
                  modelValue={form.roleExplanation}
                  onUpdate={(v: unknown): void => {
                    if (typeof v === 'string') setForm((f) => ({ ...f, roleExplanation: v }));
                  }}
                />
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-gray-300">Expected price change % (-100 to 100)</span>
                  <input
                    type="number"
                    min={-100}
                    max={100}
                    className="bg-[#111827] border border-[#374151] rounded px-2 py-1.5 text-sm text-white"
                    value={form.expectedPriceChange}
                    onChange={(e) => setForm((f) => ({ ...f, expectedPriceChange: e.target.value }))}
                    placeholder="e.g. -25"
                  />
                </label>
              </div>
              <TextareaAutosize
                label="Expected price change explanation (size of the move and over what timeframe — markdown)"
                modelValue={form.expectedPriceChangeExplanation}
                onUpdate={(v: unknown): void => {
                  if (typeof v === 'string') setForm((f) => ({ ...f, expectedPriceChangeExplanation: v }));
                }}
              />
              {formError && <p className="text-red-500 text-sm">{formError}</p>}
            </div>

            {allLinks.map((group) => (
              <div key={group.role}>
                <h3 className="text-sm font-semibold text-white mb-2">
                  {group.heading} <span className="text-xs text-gray-400">({group.items.length})</span>
                </h3>
                {group.items.length === 0 ? (
                  <p className="text-xs text-gray-500">No links in this role.</p>
                ) : (
                  <ul className="space-y-1">
                    {group.items.map((link) => (
                      <li key={`${link.symbol}-${link.role}`} className="bg-[#111827] border border-[#374151] rounded px-2 py-1.5 text-sm">
                        <div className="flex items-center justify-between">
                          <span>
                            <span className="font-semibold text-white">{link.symbol}</span>
                            {link.exchange && <span className="text-gray-400"> · {link.exchange}</span>}
                            {link.etfId ? (
                              <span className="ml-2 text-xs text-emerald-400">resolved</span>
                            ) : (
                              <span className="ml-2 text-xs text-gray-500">unresolved</span>
                            )}
                            {link.expectedPriceChange !== null && (
                              <span className={`ml-2 text-xs ${link.expectedPriceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {link.expectedPriceChange > 0 ? '+' : ''}
                                {link.expectedPriceChange}%
                              </span>
                            )}
                          </span>
                          <Button variant="outlined" onClick={() => handleRemove(link)} disabled={removing}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        {link.roleExplanation && <p className="mt-1 text-xs text-gray-300 whitespace-pre-wrap">{link.roleExplanation}</p>}
                        {link.expectedPriceChangeExplanation && (
                          <p className="mt-1 text-xs text-gray-400 whitespace-pre-wrap">{link.expectedPriceChangeExplanation}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </SingleSectionModal>
  );
}
