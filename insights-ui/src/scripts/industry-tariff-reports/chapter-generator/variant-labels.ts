import type { TariffProductType } from '@/types/tariff-calculator-measures';
import { FTA_SAFEGUARD_FACT, FTA_WITHIN_QUOTA_FACT, FTA_WITHIN_SECOND_QUOTA_FACT, type QuotaTierKey } from '@/utils/tariff-calculator/fta-quota';
import { type FactAnswers, factPhrases, resolveFactPhrases, tokenizeLabel } from '@/utils/tariff-calculator/fact-labels';

// The labels of a matrix cell's rate variants ("25% within quota or above quota", "Free generic", "29% car or
// light-truck part"): written by the chapter generator (line-rates.ts) and read back by the chapter validator
// (--check-calculator), which re-prices each variant with the answers its label stands for.
//
// A label is up to three parts joined by ", ": the FTA quota tiers ("within quota or above quota"), a product type
// ("patented"), and the confirmation-fact answers in words (fact-labels.ts), several blocks joined by " or ".

/** FTA quota tiers: the label each tier gets and the facts that pick it (see fta-quota.ts). */
export const QUOTA_TIERS: Record<QuotaTierKey, { label: string | null; facts: FactAnswers }> = {
  unconditional: { label: null, facts: {} },
  inQuota: { label: 'within quota', facts: { [FTA_WITHIN_QUOTA_FACT]: true } },
  secondQuota: { label: 'within additional quota', facts: { [FTA_WITHIN_QUOTA_FACT]: false, [FTA_WITHIN_SECOND_QUOTA_FACT]: true } },
  safeguard: { label: 'safeguard applies', facts: { [FTA_WITHIN_QUOTA_FACT]: false, [FTA_WITHIN_SECOND_QUOTA_FACT]: false, [FTA_SAFEGUARD_FACT]: true } },
  overQuota: { label: 'above quota', facts: { [FTA_WITHIN_QUOTA_FACT]: false, [FTA_WITHIN_SECOND_QUOTA_FACT]: false, [FTA_SAFEGUARD_FACT]: false } },
};

const PRODUCT_TYPES: readonly TariffProductType[] = ['patented', 'generic', 'specialty', 'other'];

/** Labels written before the fact phrases existed: the answer to the line's only varied fact. */
const LEGACY_ANSWERS: Record<string, boolean> = { 'if yes': true, 'if no': false };

export function variantLabel(parts: { quotaLabels: string[]; productType?: TariffProductType; factLabel: string | null }): string | null {
  return [parts.quotaLabels.join(' or '), parts.productType ?? null, parts.factLabel].filter(Boolean).join(', ') || null;
}

export interface ParsedVariantLabel {
  /** The facts of each quota tier named (empty: no tier). */
  quotaTiers: FactAnswers[];
  productType?: TariffProductType;
  /** Fact answers, one entry per " or " block (empty: no fact condition). Facts a block leaves out can be answered either way. */
  factBlocks: FactAnswers[];
  /** "if yes" / "if no" (older chapter files): the answer to the line's only varied fact. */
  legacyAnswer?: boolean;
}

/** Reads a variant label back into the answers it stands for; null when a phrase is unknown or the answers contradict. */
export function parseVariantLabel(label: string): ParsedVariantLabel | null {
  const tierByLabel = new Map<string, FactAnswers>();
  for (const t of Object.values(QUOTA_TIERS)) if (t.label) tierByLabel.set(t.label, t.facts);
  const factLabels = new Set(factPhrases().map((p) => p.label));
  const tokens = tokenizeLabel(label, [...Array.from(tierByLabel.keys()), ...PRODUCT_TYPES, ...Object.keys(LEGACY_ANSWERS), ...Array.from(factLabels)]);
  if (!tokens) return null;
  const out: ParsedVariantLabel = { quotaTiers: [], factBlocks: [] };
  const blocks: string[][] = [];
  let prevFact = false;
  for (const t of tokens) {
    const tier = tierByLabel.get(t.text);
    const type = PRODUCT_TYPES.find((p) => p === t.text);
    if (tier) out.quotaTiers.push(tier);
    else if (type) out.productType = type;
    else if (t.text in LEGACY_ANSWERS) out.legacyAnswer = LEGACY_ANSWERS[t.text];
    else if (factLabels.has(t.text)) {
      if (!prevFact || t.sep === ' or ') blocks.push([]);
      blocks[blocks.length - 1].push(t.text);
    } else return null;
    prevFact = factLabels.has(t.text) && !tier && !type;
  }
  for (const b of blocks) {
    const answers = resolveFactPhrases(b);
    if (!answers) return null;
    out.factBlocks.push(answers);
  }
  return out;
}
