import confirmationFactsJson from '@/tariff-data/calculator/confirmation-facts.json';
import type { TariffConfirmationFact, TariffMeasureSource } from '@/types/tariff-calculator-measures';

// Registry of yes/no shipment facts some measures depend on (issue #1796):
// src/tariff-data/calculator/confirmation-facts.json `{ "facts": TariffConfirmationFact[] }`.
// Bundled with the app (static import, like note-product-descriptions.json) and pure (no DB, no
// file I/O), so the engine, the API routes and the golden-scenario scripts all read the same list.
// Accepts `{ facts: [...] }` or a plain array; malformed entries are dropped with a warning.

function isSource(v: unknown): v is TariffMeasureSource {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  return typeof s.citation === 'string' && typeof s.url === 'string' && typeof s.published === 'string';
}

function isShortLabel(v: unknown): boolean {
  if (typeof v !== 'object' || v === null) return false;
  const l = v as Record<string, unknown>;
  return typeof l.yes === 'string' && typeof l.no === 'string';
}

function isFact(v: unknown): v is TariffConfirmationFact {
  if (typeof v !== 'object' || v === null) return false;
  const f = v as Record<string, unknown>;
  return (
    typeof f.id === 'string' &&
    f.id.trim() !== '' &&
    typeof f.prompt === 'string' &&
    (f.help === undefined || typeof f.help === 'string') &&
    (f.defaultWhenUnanswered === true || f.defaultWhenUnanswered === false || f.defaultWhenUnanswered === null) &&
    (f.shortLabel === undefined || isShortLabel(f.shortLabel)) &&
    (f.sources === undefined || (Array.isArray(f.sources) && f.sources.every(isSource)))
  );
}

/** Parses a registry file's contents (`{ facts }` or an array); malformed or duplicate entries are dropped. */
export function parseConfirmationFacts(raw: unknown): TariffConfirmationFact[] {
  const list: unknown[] = Array.isArray(raw)
    ? raw
    : typeof raw === 'object' && raw !== null && Array.isArray((raw as { facts?: unknown }).facts)
    ? (raw as { facts: unknown[] }).facts
    : [];
  const out: TariffConfirmationFact[] = [];
  const seen = new Set<string>();
  for (const v of list) {
    if (!isFact(v)) {
      console.warn(`[tariff-calculator] confirmation-facts.json: malformed fact ${JSON.stringify(v).slice(0, 120)} — skipped`);
      continue;
    }
    if (seen.has(v.id)) continue;
    seen.add(v.id);
    out.push({ ...v, sources: v.sources ?? [] });
  }
  return out;
}

let cache: TariffConfirmationFact[] | null = null;

/** Every registered confirmation fact (empty list when the registry has none). */
export function loadConfirmationFacts(): TariffConfirmationFact[] {
  if (!cache) cache = parseConfirmationFacts(confirmationFactsJson as unknown);
  return cache;
}
