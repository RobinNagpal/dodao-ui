import type {
  TariffChangeEntry,
  TariffEditionRef,
  TariffExtraDutyInEffect,
  TariffLineStatus,
  TariffRateTableRow,
  TariffStat,
  TariffUpdatesContent,
} from '@/types/tariff-chapter-prototype';
import type { TariffMeasureRecord } from '@/types/tariff-calculator-measures';
import { COUNTRY_OPTIONS } from '@/utils/tariff-calculator/countries';
import { fmtPct, inEffectOn, measureChargesLine, measureReachesLine, programShort } from './line-rates';
import { todo, TODO } from './placeholders';
import { editionSources, type SourceRegistry } from './sources';

// tariffUpdates: a two-edition comparison (base rates of every 10-digit line) plus the extra duties
// (Chapter 99 measures in measures.json) that reach the chapter, with their dates and official sources.

export const EU27 = [
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
];

/** Release / in-force dates of HTS editions the generator knows (from the USITC release history). */
const KNOWN_EDITIONS: Record<string, { released: string; inForceFrom: string }> = {
  '2025 Basic Edition': { released: '2024-12-10', inForceFrom: '2025-01-01' },
  '2026 Revision 21': { released: '2026-10-07', inForceFrom: '2026-10-09' },
};

export function editionRef(edition: string, url: string, overrides: { released?: string; inForceFrom?: string } = {}): TariffEditionRef {
  const known = KNOWN_EDITIONS[edition];
  return {
    edition,
    released: overrides.released ?? known?.released ?? todo(`release date of HTSUS ${edition}`),
    inForceFrom: overrides.inForceFrom ?? known?.inForceFrom ?? todo(`in-force date of HTSUS ${edition}`),
    url,
  };
}

export function countryName(iso: string): string {
  return COUNTRY_OPTIONS.find((c) => c.code === iso)?.name ?? iso;
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function codeList(codes: string[]): string {
  const sorted = Array.from(new Set(codes)).sort();
  return sorted.length > 3 ? `${sorted[0]}–${sorted[sorted.length - 1]}` : sorted.join(' / ');
}

/** "+20%", "10% (in place of base)", "+10% or +12.5%". */
function rateText(ms: TariffMeasureRecord[], stacked: boolean): string {
  if (ms.length === 0) return 'None';
  const part = (m: TariffMeasureRecord): string => (m.rateKind === 'additive' ? `+${fmtPct(m.ratePct ?? 0)}` : `${fmtPct(m.ratePct ?? 0)} (in place of base)`);
  if (stacked) {
    const additive = ms.filter((m) => m.rateKind === 'additive');
    const other = ms.filter((m) => m.rateKind !== 'additive');
    const parts = [...other.map(part)];
    if (additive.length > 0) parts.push(`+${fmtPct(additive.reduce((s, m) => s + (m.ratePct ?? 0), 0))}`);
    return parts.join(' + ');
  }
  return Array.from(new Set(ms.sort((a, b) => (a.ratePct ?? 0) - (b.ratePct ?? 0)).map(part))).join(' or ');
}

/** Stacked measures differ by line (e.g. China List 3 and List 4A cover different subheadings): the per-line totals, most lines first. */
function perLineRate(ms: TariffMeasureRecord[], lines: TariffRateTableRow[]): string {
  const counts = new Map<string, number>();
  for (const l of lines) {
    const reached = ms.filter((m) => measureReachesLine(m, l.htsCode10 as string));
    if (reached.length === 0) continue;
    const t = rateText(reached, true);
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  if (counts.size === 0) return 'None';
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t)
    .join(' or ');
}

function primarySourceId(m: TariffMeasureRecord, sources: SourceRegistry): string {
  const s = m.sources.find((x) => !/hts\.usitc\.gov/.test(x.url)) ?? m.sources[0];
  return s ? sources.add(s) : 'hts-now';
}

function sourceIdsOf(ms: TariffMeasureRecord[], sources: SourceRegistry): string[] {
  return Array.from(new Set([...ms.flatMap((m) => m.sources.map((s) => sources.add(s))), 'hts-now']));
}

export interface TariffUpdatesInput {
  chapterPadded: string;
  title: string;
  lines: TariffRateTableRow[];
  /** Rate-table rows of the earlier edition; null when it could not be loaded. */
  beforeRows: TariffRateTableRow[] | null;
  /** Measures that reach at least one of the chapter's lines (any date). */
  measures: TariffMeasureRecord[];
  /** ISO codes listed in the rates-by-country matrix (they get their own in-effect entry). */
  featured: string[];
  asOf: string;
  before: TariffEditionRef;
  now: TariffEditionRef;
  sources: SourceRegistry;
}

function linesReached(m: TariffMeasureRecord, lines: TariffRateTableRow[], all: TariffMeasureRecord[], day: string): number {
  // Lines the measure still charges after unconditional relief headings (e.g. note 52(b)).
  return lines.filter((l) => measureChargesLine(m, l.htsCode10 as string, all, day)).length;
}

function inEffectEntries(input: TariffUpdatesInput): TariffExtraDutyInEffect[] {
  const { measures, asOf, sources, lines } = input;
  const beforeDay = /^\d{4}-\d{2}-\d{2}$/.test(input.before.inForceFrom) ? input.before.inForceFrom : '2025-01-01';
  const charging = (m: TariffMeasureRecord): boolean => m.rateKind !== 'relief' && (m.ratePct ?? 0) > 0;
  const live = measures.filter((m) => charging(m) && inEffectOn(m, asOf) && linesReached(m, lines, measures, asOf) > 0);
  const atBefore = measures.filter((m) => charging(m) && inEffectOn(m, beforeDay) && linesReached(m, lines, measures, beforeDay) > 0);
  const reliefs = measures.filter((m) => m.rateKind === 'relief' && inEffectOn(m, asOf));
  const total = lines.length;

  const entries: { order: number; e: TariffExtraDutyInEffect }[] = [];
  const make = (id: string, country: string, ms: TariffMeasureRecord[], beforeMs: TariffMeasureRecord[], stacked: boolean, isos: string[], order: number) => {
    const latest = ms.reduce((a, b) => (b.effectiveFrom > a.effectiveFrom ? b : a));
    const reached = ms
      .map((m) => `${m.ch99Code} reaches ${linesReached(m, lines, measures, asOf)} of ${total} lines`)
      .filter((t) => !t.includes(`${total} of ${total}`));
    const relief = reliefs.filter(
      (r) =>
        ms.some((m) => r.replacesCodes.includes(m.ch99Code)) &&
        (isos.length === 0 || r.countriesInclude.length === 0 || r.countriesInclude.some((c) => isos.includes(c)))
    );
    const reliefText = relief.map((r) => `${r.ch99Code}${r.conditions?.usmcaQualifying ? ' (USMCA-qualifying goods)' : ''}`);
    const draft = [
      reliefText.length > 0 ? `Relief headings: ${Array.from(new Set(reliefText)).join(', ')}.` : null,
      reached.length > 0 ? `Coverage: ${reached.join('; ')}.` : null,
    ]
      .filter(Boolean)
      .join(' ');
    entries.push({
      order,
      e: {
        id,
        country,
        measure: Array.from(new Set(ms.map((m) => m.program))).join(' + '),
        ch99Code: codeList(ms.map((m) => m.ch99Code)),
        before: stacked ? perLineRate(beforeMs, lines) : rateText(beforeMs, false),
        now: stacked ? perLineRate(ms, lines) : rateText(ms, false),
        exemption: todo(`exemptions, exception lists and ended duties for this entry.${draft ? ` Data: ${draft}` : ''}`),
        whatItMeans: TODO,
        effectiveFrom: latest.effectiveFrom.slice(0, 10),
        effectiveSourceId: primarySourceId(latest, sources),
        sourceIds: Array.from(new Set([primarySourceId(latest, sources), ...sourceIdsOf(ms, sources)])),
      },
    });
  };

  // Every-country measures (e.g. Section 232 product actions): one entry per program.
  const global = live.filter((m) => m.countriesInclude.length === 0);
  const globalPrograms = Array.from(new Set(global.map((m) => m.program)));
  globalPrograms.forEach((program, i) => {
    const ms = global.filter((m) => m.program === program);
    const excluded = Array.from(new Set(ms.flatMap((m) => m.countriesExclude)));
    const country = excluded.length > 0 ? `All countries except ${excluded.map(countryName).join(', ')}` : 'All countries';
    const beforeMs = atBefore.filter((m) => m.countriesInclude.length === 0 && m.program === program);
    make(`all-${slug(programShort(program))}-${i + 1}`, country, ms, beforeMs, false, [], 1000 + i);
  });

  // Multi-country measures (e.g. the EU rate): one entry per country set.
  const blocs = live.filter((m) => m.countriesInclude.length > 1);
  const blocKeys = Array.from(new Set(blocs.map((m) => [...m.countriesInclude].sort().join(','))));
  const featuredOrder = (isos: string[]): number => {
    const idx = input.featured.findIndex((f) => isos.includes(f));
    return idx < 0 ? 500 : idx;
  };
  for (const key of blocKeys) {
    const isos = key.split(',');
    const ms = blocs.filter((m) => [...m.countriesInclude].sort().join(',') === key);
    const isEu = isos.length === EU27.length && EU27.every((c) => isos.includes(c));
    const name = isEu ? 'European Union' : `${isos.slice(0, 4).map(countryName).join(', ')}${isos.length > 4 ? ` and ${isos.length - 4} more` : ''}`;
    const beforeMs = atBefore.filter((m) => [...m.countriesInclude].sort().join(',') === key);
    make(`${isEu ? 'eu' : `bloc-${isos[0].toLowerCase()}`}-${slug(programShort(ms[0].program))}`, name, ms, beforeMs, true, isos, featuredOrder(isos));
  }

  // Single-country measures: featured countries (in the matrix, or paying more than one measure) get their own entry.
  const single = live.filter((m) => m.countriesInclude.length === 1);
  const byCountry = new Map<string, TariffMeasureRecord[]>();
  for (const m of single) byCountry.set(m.countriesInclude[0], [...(byCountry.get(m.countriesInclude[0]) ?? []), m]);
  const rest: TariffMeasureRecord[] = [];
  byCountry.forEach((ms, iso) => {
    const featured = input.featured.includes(iso) || new Set(ms.map((m) => m.program)).size > 1;
    if (!featured) {
      rest.push(...ms);
      return;
    }
    const beforeMs = atBefore.filter((m) => m.countriesInclude.length === 1 && m.countriesInclude[0] === iso);
    const order = input.featured.includes(iso) ? featuredOrder([iso]) : 600;
    make(`${iso.toLowerCase()}-${slug(programShort(ms[0].program))}`, countryName(iso), ms, beforeMs, true, [iso], order);
  });

  // Everyone else, per program.
  const restPrograms = Array.from(new Set(rest.map((m) => m.program)));
  restPrograms.forEach((program, i) => {
    const ms = rest.filter((m) => m.program === program);
    const isos = Array.from(new Set(ms.flatMap((m) => m.countriesInclude)));
    const names = isos.map(countryName);
    const country = `Other ${programShort(program)} economies (${names.length}: ${names.slice(0, 8).join(', ')}${names.length > 8 ? ', …' : ''})`;
    const beforeMs = atBefore.filter((m) => m.program === program && m.countriesInclude.some((c) => isos.includes(c)));
    make(`other-${slug(programShort(program))}${i > 0 ? `-${i + 1}` : ''}`, country, ms, beforeMs, false, isos, 800 + i);
  });

  return entries.sort((a, b) => a.order - b.order).map((x) => x.e);
}

function changeEntries(input: TariffUpdatesInput, lineStats: { unchanged: number; changed: number; added: number } | null): TariffChangeEntry[] {
  const { measures, asOf, sources, lines, chapterPadded } = input;
  const since = /^\d{4}-\d{2}-\d{2}$/.test(input.before.inForceFrom) ? input.before.inForceFrom : '2025-01-01';
  const charging = measures.filter((m) => m.rateKind !== 'relief' && (m.ratePct ?? 0) > 0);
  const out: TariffChangeEntry[] = [];

  const countriesText = (ms: TariffMeasureRecord[]): string => {
    const isos = Array.from(new Set(ms.flatMap((m) => m.countriesInclude)));
    if (isos.length === 0) return 'All';
    // The EU counts as one economy, as in the proclamations ("60 economies").
    const economies = EU27.every((c) => isos.includes(c)) ? isos.length - EU27.length + 1 : isos.length;
    if (isos.length > 5) return `${economies} economies`;
    return isos.map(countryName).join(', ');
  };
  const reach = (ms: TariffMeasureRecord[]): number =>
    lines.filter((l) => ms.some((m) => measureChargesLine(m, l.htsCode10 as string, input.measures, input.asOf))).length;

  // Starts (and rate changes) by program and date.
  const starts = new Map<string, TariffMeasureRecord[]>();
  for (const m of charging) {
    const day = m.effectiveFrom.slice(0, 10);
    if (day < since) continue;
    // Scheduled (future) steps of one program are one pending entry, keyed below by its announcement date.
    const key = day > asOf ? `${m.program}|pending` : `${m.program}|${day}`;
    starts.set(key, [...(starts.get(key) ?? []), m]);
  }
  starts.forEach((ms, key) => {
    const [program, keyDay] = key.split('|');
    const pending = keyDay === 'pending';
    // A pending entry is dated by its newest official notice on or before asOf (dates must not be in the future).
    const announced = ms
      .flatMap((m) => m.sources.map((src) => src.published.slice(0, 10)))
      .filter((d) => d <= asOf)
      .sort()
      .pop();
    const day = pending ? announced ?? asOf : keyDay;
    const steps = Array.from(new Set(ms.map((m) => m.effectiveFrom.slice(0, 10)))).sort();
    const pcts = Array.from(new Set(ms.map((m) => m.ratePct ?? 0))).sort((a, b) => a - b);
    const rate = pcts.length > 1 ? `+${fmtPct(pcts[0])} to +${fmtPct(pcts[pcts.length - 1])}` : `+${fmtPct(pcts[0])}`;
    const schedule = pending
      ? `Scheduled: ${steps
          .map((d) => `${ms.filter((m) => m.effectiveFrom.startsWith(d)).map((m) => `+${fmtPct(m.ratePct ?? 0)}`)[0]} from ${d}`)
          .join(', ')}. `
      : '';
    out.push({
      id: `${slug(program)}-${pending ? `scheduled-${steps[0]}` : day}`,
      type: pending ? 'pending' : 'extraDuty',
      date: day,
      dateLabel: pending ? 'Announced' : 'Effective',
      title: `${program}${pending ? ' scheduled' : ' takes effect'}`,
      detail: `${schedule}${rate} (${codeList(ms.map((m) => m.ch99Code))}); reaches ${reach(ms)} of ${lines.length} Chapter ${chapterPadded} lines. ${todo(
        'explain what changed and for whom'
      )}`,
      before: null,
      now: rate,
      countries: countriesText(ms),
      sourceIds: sourceIdsOf(ms, sources),
    });
  });

  // Ends.
  const ends = new Map<string, TariffMeasureRecord[]>();
  for (const m of charging) {
    if (!m.effectiveTo) continue;
    const day = m.effectiveTo.slice(0, 10);
    if (day < since || day > asOf) continue;
    const key = `${m.program}|${day}`;
    ends.set(key, [...(ends.get(key) ?? []), m]);
  }
  ends.forEach((ms, key) => {
    const [program, day] = key.split('|');
    out.push({
      id: `${slug(program)}-end-${day}`,
      type: 'extraDuty',
      date: day,
      dateLabel: 'Last day',
      title: `${program}: rate ends`,
      detail: `${codeList(ms.map((m) => m.ch99Code))} last applied on ${day}. ${todo('say what replaced it')}`,
      before: Array.from(new Set(ms.map((m) => `+${fmtPct(m.ratePct ?? 0)}`))).join(' / '),
      now: null,
      countries: countriesText(ms),
      sourceIds: sourceIdsOf(ms, sources),
    });
  });

  out.push({
    id: 'base-rates',
    type: 'baseRate',
    date: asOf,
    dateLabel: 'Checked',
    title:
      lineStats && lineStats.changed === 0 && lineStats.added === 0 ? `No Chapter ${chapterPadded} base-rate changes` : `Chapter ${chapterPadded} base rates`,
    detail: lineStats
      ? `${lineStats.unchanged} of ${lines.length} lines carry the same general rate in ${input.now.edition} as in ${input.before.edition}; ${lineStats.changed} changed and ${lineStats.added} are new or renumbered.`
      : todo(`compare the ${input.before.edition} with ${input.now.edition} (the earlier edition could not be loaded)`),
    before: null,
    now: null,
    countries: null,
    sourceIds: ['hts-before', 'hts-now', ...(sources.get('hts-now-cr') ? ['hts-now-cr'] : [])],
  });

  // Newest first; ties keep a stable order.
  return out
    .map((e, i) => ({ e, i }))
    .sort((a, b) => (a.e.date < b.e.date ? 1 : a.e.date > b.e.date ? -1 : a.i - b.i))
    .map((x) => x.e);
}

export function buildTariffUpdates(input: TariffUpdatesInput): TariffUpdatesContent {
  const { lines, beforeRows, sources } = input;
  for (const s of editionSources(input.before, input.now)) sources.addFixed(s);

  let lineStatus: TariffLineStatus[] = [];
  let lineStats: { unchanged: number; changed: number; added: number } | null = null;
  if (beforeRows) {
    const beforeGeneral = new Map(beforeRows.filter((r) => r.htsCode10).map((r) => [r.hts as string, r.effectiveGeneral]));
    lineStatus = lines.map((l) => {
      const hts = l.hts as string;
      const known = beforeGeneral.has(hts);
      const generalBefore = known ? beforeGeneral.get(hts) ?? null : null;
      const status: TariffLineStatus['status'] = !known ? 'new' : generalBefore === l.effectiveGeneral ? 'unchanged' : 'changed';
      return {
        hts,
        description: l.description,
        ancestorPath: l.ancestorPath,
        searchText: l.searchText,
        generalBefore,
        generalNow: l.effectiveGeneral,
        status,
        unchangedSince: status === 'unchanged' ? `≤ ${input.before.inForceFrom}` : null,
      };
    });
    lineStats = {
      unchanged: lineStatus.filter((l) => l.status === 'unchanged').length,
      changed: lineStatus.filter((l) => l.status === 'changed').length,
      added: lineStatus.filter((l) => l.status === 'new').length,
    };
  }

  const inEffect = inEffectEntries(input);
  const changes = changeEntries(input, lineStats);
  const stats: TariffStat[] = [];
  if (lineStats) {
    stats.push({ label: 'Base rates unchanged', value: `${lineStats.unchanged} of ${lines.length} lines` });
    if (lineStats.changed > 0) stats.push({ label: 'Base rates changed', value: `${lineStats.changed} of ${lines.length}` });
    if (lineStats.added > 0) stats.push({ label: 'New or renumbered lines', value: `${lineStats.added} of ${lines.length}` });
  } else stats.push({ label: 'Base rates unchanged', value: TODO });
  stats.push({ label: 'Extra duties in effect', value: String(inEffect.length) });
  stats.push({
    label: 'Compared',
    value: `${input.before.edition.replace(/ Basic Edition$/, ' Basic')} → ${input.now.edition.replace(/^\d{4} Revision /, 'Rev ')}`,
  });

  const ids = new Set<string>(['hts-now', 'hts-now-cr', 'hts-before']);
  for (const e of inEffect) e.sourceIds.forEach((id) => ids.add(id));
  for (const c of changes) c.sourceIds.forEach((id) => ids.add(id));

  return {
    h1: `HTS Chapter ${input.chapterPadded}: ${input.title} — Tariff Updates`,
    seo: { title: TODO, shortDescription: TODO, keywords: [TODO] },
    intro: TODO,
    scope: TODO,
    before: input.before,
    now: input.now,
    lastCheckedAt: input.asOf,
    stats,
    inEffect,
    changes,
    lines: lineStatus,
    sources: sources.list(ids),
  };
}
