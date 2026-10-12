// Units a per-unit HTS rate is charged in — the vocabulary shared by the rate parser
// (src/utils/tariff-reports/shipment-duty.ts), the official-measures engine (measures-engine.ts)
// and the legacy engine (duty-engine.ts). No imports, so every engine can use it.
//
// A rate may charge on a *qualified* quantity rather than the plain weight / volume / count of
// the goods: "12.8¢/kg on molybdenum content", "5.7¢/kg on drained weight", "5¢/kg on contents
// and container", "$40/kg of anhydrous morphine content", "20¢/gross of immediate containers".
// Those are a different number from the shipment's plain kilograms, so they get their own
// quantity key: the base unit code plus the qualifier, e.g. "KG:molybdenum content",
// "KG:drained weight", "KG:gross weight" (incl. the immediate container), "KG:entire contents".
// Plain-unit keys ("KG", "NO", …) are unchanged.
//
// Rates per 1,000 units ("89.6¢/1000", "$2/1,000", "10¢/1,000 pins") are not a separate unit:
// the parser divides the amount by 1,000 and charges it per unit (NO), so the importer enters
// the plain count (500,000 bulbs), the way the HTS reports those lines ("No.").

/** A per-unit rate's unit text split into its base unit and qualifier ("kg on copper content" → "kg" + "copper content"). */
export interface UnitText {
  base: string;
  /** Normalized qualifier, e.g. "copper content", "drained weight", "gross weight"; null for a plain unit. */
  qualifier: string | null;
}

/** Qualifiers whose wording is fixed; anything else after "on"/"of" is kept as written ("molybdenum content"). */
const FIXED_QUALIFIERS: { pattern: RegExp; qualifier: string | null }[] = [
  { pattern: /^(.+?)\s*,?\s+on\s+(?:the\s+)?contents\s+and\s+(?:the\s+)?(?:immediate\s+)?containers?$/, qualifier: 'gross weight' },
  { pattern: /^(.+?)\s*,?\s+including\s+(?:the\s+)?weight\s+of\s+(?:the\s+)?(?:immediate\s+)?containers?$/, qualifier: 'gross weight' },
  { pattern: /^(.+?)\s+on\s+(?:the\s+)?entire\s+contents\s+of\s+(?:the\s+)?containers?$/, qualifier: 'entire contents' },
  { pattern: /^(.+?)\s+on\s+(?:the\s+)?drained\s+weight$/, qualifier: 'drained weight' },
  // A proof liter already measures the alcohol, so "pf. liter on ethyl alcohol content" is a plain proof liter.
  { pattern: /^(pf\.?\s?l(?:iters?|itres?)?\.?|proof\s+lit(?:ers?|res?))\s+(?:on|of)\s+(?:the\s+)?(?:ethyl\s+)?alcohol(?:\s+content)?$/, qualifier: null },
];
const GENERIC_QUALIFIER = /^(.+?)\s*(?:\b(?:on|of)\s+(?:the\s+)?)(.+)$/;

/** Splits a unit text into base + qualifier. Lower-cases and collapses spaces; never throws. */
export function splitUnitText(raw: string): UnitText {
  const text = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  for (const { pattern, qualifier } of FIXED_QUALIFIERS) {
    const m = text.match(pattern);
    if (m) return { base: m[1].trim(), qualifier };
  }
  // "m2of recording surface" (no space) is in the HTS too.
  const g = text.replace(/^(m2|m²|m3|m³)of\b/, '$1 of').match(GENERIC_QUALIFIER);
  if (g && g[1].trim()) return { base: g[1].trim(), qualifier: g[2].trim() };
  return { base: text, qualifier: null };
}

/** Joins a base key and qualifier into a quantity key: ("KG", "copper content") → "KG:copper content". */
export function qualifiedKey(base: string, qualifier: string | null): string {
  return qualifier ? `${base}:${qualifier}` : base;
}

/** Splits a quantity key: "KG:copper content" → { base: "KG", qualifier: "copper content" }. */
export function splitQualifiedKey(key: string): { base: string; qualifier: string | null } {
  const i = key.indexOf(':');
  return i < 0 ? { base: key, qualifier: null } : { base: key.slice(0, i), qualifier: key.slice(i + 1).trim() || null };
}

/** How a qualifier reads after the unit name: "kilograms" + this → "kilograms of copper content". */
export function qualifierPhrase(qualifier: string): string {
  switch (qualifier) {
    case 'gross weight':
      return ', gross weight incl. the immediate container';
    case 'drained weight':
      return ', drained weight';
    case 'entire contents':
      return ' of the entire contents of the container';
    default:
      return ` of ${qualifier}`;
  }
}

const UOM_LABELS: Record<string, string> = {
  KG: 'kilograms',
  CKG: 'clean kilograms',
  G: 'grams',
  T: 'metric tons',
  L: 'liters',
  'PF.L': 'proof liters',
  NO: 'number of units / head',
  DOZ: 'dozens',
  DPR: 'dozen pairs',
  PRS: 'pairs',
  GROSS: 'gross',
  M: 'meters',
  M2: 'square meters',
  M3: 'cubic meters',
  THS: 'thousands',
  BBL: 'barrels',
};

/** Unit codes the calculator knows (plain, without a qualifier). */
export const KNOWN_UOMS: readonly string[] = Object.keys(UOM_LABELS);

/** "KG (kilograms)"; a qualified key reads "KG (kilograms of copper content)"; an unknown code is returned as is. */
export function describeUom(uom: string): string {
  const { base, qualifier } = splitQualifiedKey(uom);
  const label = UOM_LABELS[base];
  if (!label) return uom;
  if (!qualifier) return `${base} (${label})`;
  const unitName = base === 'NO' ? 'number' : label;
  return `${base} (${unitName}${qualifierPhrase(qualifier)})`;
}
