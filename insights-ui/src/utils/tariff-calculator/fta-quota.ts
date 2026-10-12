import ftaQuotaHeadingsJson from '@/tariff-data/calculator/fta-quota-headings.json';
import type { FtaQuotaHeading, FtaQuotaHeadingsFile, TariffMeasureSource } from '@/types/tariff-calculator-measures';

// FTA quota claims (Chapter 98 subchapters XXII / XXIII, Chapter 99 subchapters VIII, XVIII, XIX, XXI).
//
// Many HTS lines don't state a trade-deal rate for one partner; their special column points to Chapter 98/99 headings
// instead: "0201.10.50 … See 9822.04.01-9822.04.03 (AU)". Those headings carry the partner's in-quota rate, the
// over-quota rate and (Australian beef) a safeguard rate. The headings are bundled from the HTS JSON in
// src/tariff-data/calculator/fta-quota-headings.json (`pnpm tariff:build-fta-quota`), so pricing a claim needs no
// database rows: the line's own special column (already in hts_codes) names the headings, this file prices them.
//
// Which heading applies depends on facts only the importer knows (quota fill, export certificate, a safeguard in
// effect). They are registry facts (confirmation-facts.json) with a default of "no": a claim unanswered is priced
// at the over-quota rate (never a guessed in-quota rate), and the result says which heading and answer were used.
// Pure (no DB, no Date.now), like the engine.

/** Registry fact: the shipment is within the agreement's in-quota quantity (first quota tier). */
export const FTA_WITHIN_QUOTA_FACT = 'ftaWithinQuota';
/** Registry fact: the shipment is within the agreement's second quota tier (Panama milk powder / cheese, note 4(b) / 6(b)). */
export const FTA_WITHIN_SECOND_QUOTA_FACT = 'ftaWithinSecondQuota';
/** Registry fact: the agreement's safeguard is in effect for the goods (Australian beef, note 8(c)). */
export const FTA_SAFEGUARD_FACT = 'ftaSafeguardApplies';

export const FTA_QUOTA_FACTS = [FTA_WITHIN_QUOTA_FACT, FTA_WITHIN_SECOND_QUOTA_FACT, FTA_SAFEGUARD_FACT];

let cache: FtaQuotaHeadingsFile | null = null;

/** The bundled FTA quota headings (src/tariff-data/calculator/fta-quota-headings.json). */
export function loadFtaQuotaHeadings(): FtaQuotaHeadingsFile {
  if (!cache) cache = ftaQuotaHeadingsJson as unknown as FtaQuotaHeadingsFile;
  return cache;
}

// ---------------------------------------------------------------------------
// References
// ---------------------------------------------------------------------------

/** True when a special-rate entry points to Chapter 98/99 headings instead of stating a rate ("See 9823.08.01-9823.08.38"). */
export function isQuotaReference(rateText: string | null | undefined): boolean {
  return !!rateText && /^\s*See\s+9[89]/i.test(rateText);
}

/** "9822.04.01" / "99.19.04.14" / "9919.04.14" → "9919.04.14"; null when it isn't an 8-digit Chapter 98/99 code. */
function normalizeCode(token: string): string | null {
  const d = token.replace(/\D/g, '');
  if (d.length !== 8 || !/^9[89]/.test(d)) return null;
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}`;
}

/** One code or an inclusive range of codes named by a reference. */
export interface QuotaRefPart {
  from: string;
  to: string;
}

/**
 * The codes and ranges of a "See …" reference: "See 9822.04.01-9822.04.03" → [01–03];
 * "See 9919.04.10, 9919.04.12, 99.19.04.14" → three single codes; "See 9919.04.40, 9919.04.41-9919.04.42" → a code and a range.
 * Null when the text isn't a Chapter 98/99 reference or a part can't be read.
 */
export function parseQuotaReference(rateText: string): QuotaRefPart[] | null {
  if (!isQuotaReference(rateText)) return null;
  const body = rateText.trim().replace(/^See\s+/i, '');
  const parts: QuotaRefPart[] = [];
  for (const piece of body.split(',')) {
    const t = piece.trim();
    if (!t) continue;
    const [a, b] = t.split(/\s*[-–]\s*/);
    const from = normalizeCode(a);
    const to = b === undefined ? from : normalizeCode(b);
    if (!from || !to) return null;
    parts.push({ from, to });
  }
  return parts.length > 0 ? parts : null;
}

function sameProgram(a: string, b: string): boolean {
  return a.replace(/\*$/, '') === b.replace(/\*$/, '');
}

/** The headings a reference names (ranges expanded over the bundled headings), plus any named code the data lacks. */
export function expandQuotaReference(
  rateText: string,
  headings: FtaQuotaHeading[] = loadFtaQuotaHeadings().headings
): {
  headings: FtaQuotaHeading[];
  missing: string[];
} {
  const parts = parseQuotaReference(rateText) ?? [];
  const out: FtaQuotaHeading[] = [];
  const missing: string[] = [];
  for (const p of parts) {
    const inRange = headings.filter((h) => h.code >= p.from && h.code <= p.to);
    for (const code of p.from === p.to ? [p.from] : [p.from, p.to]) if (!headings.some((h) => h.code === code)) missing.push(code);
    for (const h of inRange) if (!out.includes(h)) out.push(h);
  }
  return { headings: out.sort((a, b) => a.code.localeCompare(b.code)), missing };
}

// ---------------------------------------------------------------------------
// Resolution for one line, program and country
// ---------------------------------------------------------------------------

export type QuotaTierKey = 'unconditional' | 'inQuota' | 'secondQuota' | 'safeguard' | 'overQuota';

/** One rate the claim can be charged at. `headings` empty = the HTS general rate (no FTA rate above the quota). */
export interface QuotaTier {
  key: QuotaTierKey;
  headings: FtaQuotaHeading[];
  rateText: string;
}

export interface QuotaResolution {
  /** The reference as the line states it, e.g. "See 9822.04.01-9822.04.03". */
  reference: string;
  /** Tiers in the order the answers pick them: in-quota, second quota, safeguard, over-quota (or one unconditional). */
  tiers: QuotaTier[];
  /** Every tier has the same rate, so no answer changes the duty. */
  collapsed: boolean;
  /** Registry facts whose answer picks the tier (empty when collapsed or unconditional). */
  facts: string[];
}

export type QuotaResolveResult = { ok: true; resolution: QuotaResolution } | { ok: false; error: string };

function digits(s: string): string {
  return s.replace(/\D/g, '');
}

function subheading8(hts10: string): string {
  const d = digits(hts10);
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}`;
}

function sameRate(a: string, b: string): boolean {
  const n = (s: string) => s.toLowerCase().replace(/\s+/g, '');
  return n(a) === n(b);
}

function codesOf(hs: FtaQuotaHeading[]): string {
  return hs.map((h) => h.code).join(', ');
}

/**
 * Resolves a claimed program's "See …" reference for a line and a country of origin: the headings that apply to the
 * goods of that country (USMCA: Mexico → note N(a), Canada → note N(b)) and the line's subheading, grouped into tiers.
 * Above the quota with no over-quota heading (most Australian dairy, Israel, Morocco, Peru, Colombia sugar) the goods get
 * no preference, so the over-quota tier is the line's general rate. `entryDay` (YYYY-MM-DD) checks the subchapter's end date.
 */
export function resolveQuotaClaim(
  line: { hts10: string; general: string | null },
  spi: string,
  rateText: string,
  country: string,
  entryDay?: string,
  data: FtaQuotaHeadingsFile = loadFtaQuotaHeadings()
): QuotaResolveResult {
  const reference = rateText.trim();
  const { headings: named, missing } = expandQuotaReference(reference, data.headings);
  if (missing.length > 0 || named.length === 0) {
    return {
      ok: false,
      error: `The HTS points the ${spi} rate to ${reference}, but heading ${missing.join(', ') || reference} is not in the calculator's data.`,
    };
  }
  const sub = subheading8(line.hts10);
  const forProgram = named.filter((h) => sameProgram(h.spi, spi));
  const forCountry = forProgram.filter((h) => h.countries.includes(country));
  // A heading whose own description lists subheadings applies to those; where the line points to the only heading of
  // its kind anyway, it is kept even if its list doesn't name the line's subheading (the lists in some 98/99
  // descriptions predate later renumbering, e.g. 1901.10.16 → 9822.04.25). Per-subheading over-quota rates
  // (9823.xx.03 …) are picked by the list.
  const applicable: FtaQuotaHeading[] = [];
  for (const kind of Array.from(new Set(forCountry.map((h) => h.kind)))) {
    const ofKind = forCountry.filter((h) => h.kind === kind);
    const matching = ofKind.filter((h) => h.subheadings.length === 0 || h.subheadings.includes(sub));
    applicable.push(...(matching.length > 0 ? matching : ofKind.length === 1 ? ofKind : []));
  }
  applicable.sort((a, b) => a.code.localeCompare(b.code));
  if (applicable.length === 0) {
    const who = forProgram.length > 0 && forCountry.length === 0 ? `goods of ${country}` : `subheading ${sub}`;
    return { ok: false, error: `${reference} (${spi}) has no provision for ${who}, so the ${spi} claim can't be made for this shipment.` };
  }
  const notModelled = applicable.find((h) => h.kind === 'notModelled');
  if (notModelled) {
    return {
      ok: false,
      error: `The ${spi} rate for this line is set by heading ${notModelled.code}: ${notModelled.reason ?? 'not priced by the calculator'}.`,
    };
  }
  const ended = applicable.find((h) => h.effectiveTo && entryDay && entryDay > h.effectiveTo);
  if (ended) {
    return {
      ok: false,
      error: `Heading ${ended.code} (chapter ${ended.chapter}, subchapter ${ended.subchapter}) applies only through ${ended.effectiveTo}, so the ${spi} claim can't be priced for an entry on ${entryDay}.`,
    };
  }

  const unconditional = applicable.filter((h) => h.kind === 'unconditional');
  if (unconditional.length > 0) {
    return {
      ok: true,
      resolution: { reference, tiers: [{ key: 'unconditional', headings: unconditional, rateText: unconditional[0].rateText }], collapsed: true, facts: [] },
    };
  }
  const inQuota = applicable.filter((h) => h.kind === 'inQuota');
  const safeguard = applicable.filter((h) => h.kind === 'safeguard');
  const overQuota = applicable.filter((h) => h.kind === 'overQuota');
  const tiers: QuotaTier[] = [];
  if (inQuota.length > 0) {
    const first = inQuota[0];
    const sameAsFirst = inQuota.filter((h) => sameRate(h.rateText, first.rateText));
    tiers.push({ key: 'inQuota', headings: sameAsFirst, rateText: first.rateText });
    const second = inQuota.filter((h) => !sameAsFirst.includes(h));
    if (second.length > 0) tiers.push({ key: 'secondQuota', headings: second, rateText: second[0].rateText });
  }
  if (safeguard.length > 0) tiers.push({ key: 'safeguard', headings: safeguard, rateText: safeguard[0].rateText });
  if (overQuota.length > 0) tiers.push({ key: 'overQuota', headings: overQuota, rateText: overQuota[0].rateText });
  else if (line.general && line.general.trim()) tiers.push({ key: 'overQuota', headings: [], rateText: line.general.trim() });
  else return { ok: false, error: `${reference} (${spi}) gives no rate above the quota and the line has no general rate.` };

  const collapsed = tiers.every((t) => sameRate(t.rateText, tiers[0].rateText));
  const facts = collapsed
    ? []
    : tiers.flatMap((t) =>
        t.key === 'inQuota'
          ? [FTA_WITHIN_QUOTA_FACT]
          : t.key === 'secondQuota'
          ? [FTA_WITHIN_SECOND_QUOTA_FACT]
          : t.key === 'safeguard'
          ? [FTA_SAFEGUARD_FACT]
          : []
      );
  return { ok: true, resolution: { reference, tiers, collapsed, facts } };
}

// ---------------------------------------------------------------------------
// Picking the tier and describing it
// ---------------------------------------------------------------------------

/** The answer used for each quota fact: the importer's, else `defaults` (the registry default), else "no". */
export type QuotaAnswers = Partial<Record<string, boolean>>;

/** The tier the answers pick: first "yes" among in-quota, second quota, safeguard; otherwise above the quota. */
export function chooseQuotaTier(resolution: QuotaResolution, answers: QuotaAnswers): QuotaTier {
  const { tiers } = resolution;
  if (resolution.collapsed) return tiers[0];
  const byKey = (k: QuotaTierKey) => tiers.find((t) => t.key === k);
  const inQuota = byKey('inQuota');
  if (inQuota && answers[FTA_WITHIN_QUOTA_FACT]) return inQuota;
  const second = byKey('secondQuota');
  if (second && answers[FTA_WITHIN_SECOND_QUOTA_FACT]) return second;
  const safeguard = byKey('safeguard');
  if (safeguard && answers[FTA_SAFEGUARD_FACT]) return safeguard;
  return byKey('overQuota') ?? tiers[tiers.length - 1];
}

function noteOf(h: FtaQuotaHeading): string {
  return `U.S. note ${h.noteRef ?? '(none cited)'} to subchapter ${h.subchapter} of chapter ${h.chapter}`;
}

function tierNote(t: QuotaTier): string {
  const h = t.headings[0];
  switch (t.key) {
    case 'unconditional':
      return `heading ${codesOf(t.headings)} (no quota)`;
    case 'inQuota':
      return `heading ${codesOf(t.headings)}, within the in-quota quantity of ${noteOf(h)}`;
    case 'secondQuota':
      return `heading ${codesOf(t.headings)}, within the additional quota of ${noteOf(h)}`;
    case 'safeguard':
      return `heading ${codesOf(t.headings)}, the safeguard of ${noteOf(h)}`;
    case 'overQuota':
      return t.headings.length > 0 ? `heading ${codesOf(t.headings)}, above the quota${h.noteRef ? ` (${noteOf(h)})` : ''}` : 'above the quota';
  }
}

/** The in-quota tier's note, for a claim charged at the general rate above the quota. */
function quotaNoteOf(resolution: QuotaResolution): string {
  const h = resolution.tiers.find((t) => t.key === 'inQuota')?.headings[0];
  return h ? `${noteOf(h)}, heading ${h.code}` : 'the agreement';
}

/** "Free within the quota (9822.04.01); 17.1% if the safeguard applies (9822.04.02); Free above the quota (9822.04.03)". */
export function describeQuotaTiers(resolution: QuotaResolution): string {
  if (resolution.collapsed) {
    const codes = Array.from(new Set(resolution.tiers.flatMap((t) => t.headings.map((h) => h.code))));
    return `${resolution.tiers[0].rateText}${codes.length > 0 ? ` (${codes.join(', ')})` : ''}`;
  }
  return resolution.tiers
    .map((t) => {
      const codes = t.headings.length > 0 ? ` (${codesOf(t.headings)})` : '';
      switch (t.key) {
        case 'inQuota':
          return `${t.rateText} within the quota${codes}`;
        case 'secondQuota':
          return `${t.rateText} within the additional quota${codes}`;
        case 'safeguard':
          return `${t.rateText} if the safeguard applies${codes}`;
        case 'overQuota':
          return t.headings.length > 0 ? `${t.rateText} above the quota${codes}` : `the general rate (${t.rateText}) above the quota`;
        default:
          return `${t.rateText}${codes}`;
      }
    })
    .join('; ');
}

const FACT_PHRASES: Record<string, string> = {
  [FTA_WITHIN_QUOTA_FACT]: 'within the in-quota quantity',
  [FTA_WITHIN_SECOND_QUOTA_FACT]: 'within the additional quota',
  [FTA_SAFEGUARD_FACT]: 'the safeguard applies',
};

export interface QuotaClaimPricing {
  tier: QuotaTier;
  /** True when the claim is charged at the line's general rate (above the quota, the agreement gives no rate). */
  usesGeneralRate: boolean;
  /** Text after the program name in the base line label, e.g. "9822.04.03, above the quota". */
  labelSuffix: string;
  notes: string[];
  sources: TariffMeasureSource[];
}

/**
 * The tier for a resolved claim plus plain notes: the heading used, the U.S. note it comes from, and which answers
 * picked it ("not answered, so 'no' was assumed").
 */
export function priceQuotaClaim(
  resolution: QuotaResolution,
  programName: string,
  answers: QuotaAnswers,
  answered: Partial<Record<string, boolean>>,
  data: FtaQuotaHeadingsFile = loadFtaQuotaHeadings()
): QuotaClaimPricing {
  const tier = chooseQuotaTier(resolution, answers);
  const usesGeneralRate = tier.headings.length === 0;
  const notes: string[] = [];
  let labelSuffix = tierNote(tier);
  if (resolution.collapsed) {
    notes.push(`${programName}: the line's special rate is "${resolution.reference}"; ${describeQuotaTiers(resolution)} for these goods.`);
    const codes = Array.from(new Set(resolution.tiers.flatMap((t) => t.headings.map((h) => h.code))));
    if (tier.key !== 'unconditional') labelSuffix = `heading ${codes.join(', ')}, the same rate within and above the quota`;
  } else {
    notes.push(`${programName}: the line's special rate is "${resolution.reference}" — ${describeQuotaTiers(resolution)}.`);
    const how = resolution.facts.map((f) => {
      const a = answers[f] ? 'yes' : 'no';
      return `${FACT_PHRASES[f] ?? f}: ${answered[f] === undefined ? `not answered, "${a}" assumed` : a}`;
    });
    if (usesGeneralRate) {
      labelSuffix = `above the quota of ${quotaNoteOf(resolution)}: no ${programName} rate, general rate charged`;
      notes.push(
        `Charged at the HTS general rate (${tier.rateText}): above the quota of ${quotaNoteOf(resolution)} the agreement gives no lower rate (${how.join(
          '; '
        )}).`
      );
    } else {
      notes.push(`Charged at ${tier.rateText} under ${tierNote(tier)} (${how.join('; ')}).`);
    }
  }
  const cited = Array.from(
    new Set(resolution.tiers.flatMap((t) => t.headings).map((h) => `${h.chapter}|${h.subchapter}|${(h.noteRef ?? '').replace(/\(.*$/, '')}`))
  );
  const sources: TariffMeasureSource[] = cited.map((c) => {
    const [chapter, subchapter, note] = c.split('|');
    const base = data.noteSources.find((s) => s.citation.includes(`Chapter ${chapter}`)) ?? data.noteSources[0];
    return {
      citation: `HTSUS ${data.htsEdition}, Chapter ${chapter}, subchapter ${subchapter}${note ? `, U.S. note ${note}` : ''}`,
      url: base?.url ?? data.sourceUrl,
      published: base?.published ?? data.generatedAt.slice(0, 10),
    };
  });
  return { tier, usesGeneralRate, labelSuffix, notes, sources };
}

/** Plain question for a quota fact on one program's claim, naming the heading and the U.S. note. */
export function quotaQuestionPrompt(fact: string, resolution: QuotaResolution, programName: string): string {
  const tier = resolution.tiers.find((t) =>
    fact === FTA_WITHIN_QUOTA_FACT ? t.key === 'inQuota' : fact === FTA_WITHIN_SECOND_QUOTA_FACT ? t.key === 'secondQuota' : t.key === 'safeguard'
  );
  const h = tier?.headings[0];
  const where = h ? `${noteOf(h)} (heading ${codesOf(tier?.headings ?? [])})` : 'the agreement';
  if (fact === FTA_SAFEGUARD_FACT) return `${programName} claim: is the safeguard of ${where} in effect for these goods this quarter?`;
  if (fact === FTA_WITHIN_SECOND_QUOTA_FACT) return `${programName} claim: does this shipment enter within the additional quota of ${where}?`;
  return `${programName} claim: does this shipment enter within the in-quota quantity of ${where}?`;
}

/** What answering "yes" changes, e.g. "Charged Free (9822.04.01) instead of Free (9822.04.03)". */
export function quotaQuestionEffect(fact: string, resolution: QuotaResolution): string {
  const yesTier = chooseQuotaTier(resolution, { [fact]: true });
  const noTier = chooseQuotaTier(resolution, {});
  const show = (t: QuotaTier) => `${t.rateText} (${t.headings.length > 0 ? codesOf(t.headings) : 'general rate'})`;
  const safeguard = resolution.tiers.find((t) => t.key === 'safeguard');
  if (sameRate(yesTier.rateText, noTier.rateText) && fact === FTA_WITHIN_QUOTA_FACT && safeguard) {
    return `With the claim: ${show(yesTier)}, the same rate as above the quota, but the safeguard (${codesOf(safeguard.headings)}, ${
      safeguard.rateText
    }) can't apply within the quota.`;
  }
  return `With the claim: ${show(yesTier)} instead of ${show(noTier)}.`;
}
