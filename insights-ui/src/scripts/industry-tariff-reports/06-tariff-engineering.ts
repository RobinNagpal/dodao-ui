import {
  chapterSeoGuidance,
  formatChapterLabel,
  getChapterPromptContext,
  readIndustryHeadings,
  readTariffUpdates,
  writeTariffEngineering,
} from '@/scripts/industry-tariff-reports/tariff-report-repository';
import { TariffEngineering } from '@/scripts/industry-tariff-reports/tariff-types';
import { z } from 'zod';
import { getLlmResponse, outputInstructions } from '../llm‑utils‑gemini';
import { GeminiModel, LLMProvider } from '@/types/llmConstants';

const ClassificationLeverSchema = z.object({
  leverTitle: z.string().describe('Short, descriptive name of the reclassification lever (e.g. "Reclassify men\'s anoraks as down-filled outerwear").'),
  currentClassification: z
    .string()
    .describe(
      'The HTS subheading commonly used today for the in-scope product, including the heading number, ' +
        'a one-line description, and the current US general (Column 1) duty rate. Wrap rates and amounts in backticks.'
    ),
  engineeredClassification: z
    .string()
    .describe(
      'The alternative HTS subheading the product can legitimately be classified under after a design, ' +
        'composition, or feature change. Include heading number, description, and the duty rate. Wrap values in backticks.'
    ),
  basisForReclassification: z
    .string()
    .describe(
      'The concrete product attribute (material composition, feature, function, weight threshold, etc.) that supports ' +
        'the new classification under General Rules of Interpretation (GRI) or a CBP ruling. ' +
        'Cite the specific GRI / Chapter Note / CBP ruling number where relevant, with markdown hyperlinks.'
    ),
  dutyDelta: z
    .string()
    .describe(
      'Plain-language before-vs-after on duty exposure, e.g. "Drops the column-1 rate from `27.7%` to `4.4%`, plus avoids the ' +
        '`Section 301 List 4A` `7.5%` add-on if the bill of materials shifts away from China." Wrap values in backticks.'
    ),
});

const StrategySchema = z.object({
  title: z.string().describe('Short strategy name (e.g. "First-sale-for-export valuation", "Substantial transformation in Vietnam").'),
  technique: z
    .string()
    .describe(
      'A 2-3 sentence plain-language description of what the strategy is and the legal/operational mechanism that makes it work. ' +
        'Reference the relevant CBP regulation (19 CFR §xxxx), USMCA / GSP rule, or established trade-law doctrine.'
    ),
  applicabilityToChapter: z
    .string()
    .describe(
      'Specifically which sub-areas / sub-headings of THIS HTS chapter the strategy applies to. ' +
        'Name the in-scope products and any quantitative thresholds (volume, value, BOM percentage) that gate the strategy.'
    ),
  potentialDutyImpact: z
    .string()
    .describe(
      'Concrete duty impact in numbers: rate before, rate after, dollar savings on a representative shipment value if available. ' +
        'Wrap rates and amounts in backticks. Avoid vague phrases like "significant savings". ' +
        'Do not invent figures — if a precise number is not available, describe qualitatively or omit it.'
    ),
  implementationSteps: z
    .array(z.string())
    .describe(
      '3-6 ordered, actionable steps an importer/exporter must take to execute the strategy. ' +
        'Each step is one sentence and references the specific document, ruling request, or supplier change involved ' +
        '(e.g. "File a CBP ruling letter request via the eRulings program citing HQ ruling H299196").'
    ),
  risksAndCaveats: z
    .string()
    .describe(
      'The substantive compliance risks: CBP audit triggers, recordkeeping burden, prior disclosure exposure, ' +
        'misclassification penalties (19 USC §1592), AD/CVD circumvention concerns, anti-transshipment scrutiny, etc. ' +
        'Be specific — name the regulation or enforcement program.'
    ),
  precedent: z
    .string()
    .describe(
      'Real precedent supporting the strategy: a CBP ruling number (HQ/NY), a CIT/CAFC case, a published industry practice, ' +
        'or a documented Section 301 exclusion. Include the citation in markdown link format where possible.'
    ),
});

const TariffEngineeringSchema = z.object({
  title: z.string().describe('Page H1, e.g. "Tariff Engineering Strategies for HTS Chapter 39 — Plastics and Articles".'),
  overview: z
    .string()
    .describe(
      '2-4 paragraphs of markdown introducing tariff engineering specifically for products in this HTS chapter. ' +
        'Define tariff engineering, explain the legitimacy boundary (legal restructuring vs. fraudulent misclassification), ' +
        'and frame why the current tariff landscape (Section 232 / 301 / IEEPA) makes this analysis valuable to importers right now. ' +
        'Wrap every percentage / dollar amount / rate value in backticks. Include at least 2 markdown citation links. ' +
        'Do NOT include any markdown headings (`#`, `##`, `###`) — the page UI already renders the section title.'
    ),
  classificationLevers: z
    .array(ClassificationLeverSchema)
    .describe(
      '3-6 concrete, chapter-specific classification levers. Each lever is a real product-design or product-attribute change that ' +
        'shifts the good into a different HTS subheading with a materially different duty rate. ' +
        'Pull the actual sub-headings from the chapter (e.g. for Chapter 61, the difference between knit-vs-woven, sweatshirt-vs-jacket, ' +
        'cotton-vs-MMF), not generic examples. Cite real CBP rulings (HQ / NY series) or CIT cases where possible.'
    ),
  strategies: z
    .array(StrategySchema)
    .describe(
      '5-7 distinct tariff-engineering strategies that go BEYOND classification. Cover the canonical toolkit: ' +
        '(1) substantial transformation / country-of-origin engineering, ' +
        '(2) first-sale-for-export valuation, ' +
        '(3) unbundling / set-rule manipulation under GRI 3, ' +
        '(4) Foreign Trade Zone (FTZ) and bonded-warehouse usage, ' +
        '(5) duty drawback (manufacturing / unused-merchandise / substitution), ' +
        '(6) FTA preferential origin (USMCA, KORUS, GSP where still active), ' +
        '(7) Section 301 / 232 exclusion strategies, ' +
        '(8) Chapter 98 provisions (US goods returned, repairs/alterations). ' +
        'Each strategy must be tailored to the specific products in this HTS chapter — generic advice is not useful.'
    ),
  countryOfOriginPlaybook: z
    .string()
    .describe(
      '4-6 paragraph markdown analysis on country-of-origin engineering for this chapter. ' +
        'Discuss: (a) the substantial-transformation test as applied to the typical manufacturing process for this chapter; ' +
        '(b) tariff-shift rules under USMCA/CAFTA/KORUS for the relevant tariff-shift level; ' +
        '(c) realistic relocation candidates (Mexico, Vietnam, India, Malaysia, Thailand, Turkey) for sourcing teams ' +
        'now subject to Section 301 / IEEPA / reciprocal tariffs on China-origin goods; ' +
        "(d) anti-circumvention enforcement risk (CBP's focus on Vietnam/Cambodia/Malaysia transshipment). " +
        'Wrap every percentage / dollar amount in backticks. Cite specific CBP guidance and CSMS messages where possible.'
    ),
  valuationOpportunities: z
    .string()
    .describe(
      '3-5 paragraphs of markdown on valuation-side levers. ' +
        'Cover first-sale-for-export (with the Nissho Iwai factors), assists, royalties/license fees that may be excluded under 19 USC §1401a, ' +
        'related-party-transfer-pricing alignment with customs value, separately invoiced engineering and design costs, and ' +
        'the impact on landed cost when duty is `25%` versus `7.5%`. Be specific about the documentation burden ' +
        '(invoices, contracts, payment trails) required to defend each posture.'
    ),
  ftzAndDrawback: z
    .string()
    .describe(
      '3-5 paragraphs of markdown on Foreign Trade Zone (FTZ) and duty drawback opportunities for products in this chapter. ' +
        'Cover: FTZ inverted-tariff benefits when components carry a higher rate than the finished good (or vice versa), ' +
        'weekly-entry savings under 19 CFR §146, manufacturing drawback (19 USC §1313(a)), unused-merchandise drawback (§1313(j)(1)), ' +
        'substitution drawback (§1313(j)(2)) and the §1313(b) manufacturing-substitution variant. ' +
        'Note where Section 301 duties and IEEPA tariffs are/are not eligible for drawback so readers do not over-claim.'
    ),
  complianceGuardrails: z
    .string()
    .describe(
      '3-4 paragraphs of markdown on the compliance guardrails any tariff-engineering program must respect. ' +
        'Cover: 19 USC §1592 (penalties for fraud / gross negligence / negligence), prior-disclosure mechanics, the binding-ruling ' +
        '(eRulings) program as a safe harbor, recordkeeping (5 years; 19 CFR Part 163), AD/CVD scope-ruling and circumvention risk ' +
        '(EAPA petitions), and reasonable-care obligations under the Mod Act. ' +
        'Make clear the line between aggressive-but-legal tariff engineering and misclassification fraud.'
    ),
  bottomLine: z
    .string()
    .describe(
      '2-3 paragraphs of markdown that close with a prioritized, prescriptive recommendation: which 2-3 levers from above are likely ' +
        'the highest-ROI for a typical importer in this HTS chapter today, in what sequence to deploy them (e.g. classification review first, ' +
        'then origin engineering, then drawback claim setup), and what data the importer needs to gather before acting. ' +
        'Avoid filler; this should read like a partner-level memo conclusion.'
    ),
});

export async function getAndWriteTariffEngineeringJson(slug: string): Promise<void> {
  const ctx = await getChapterPromptContext(slug);
  const chapterLabel = formatChapterLabel(ctx);
  const padded = ctx.chapterNumber.toString().padStart(2, '0');
  const headings = await readIndustryHeadings(slug);
  if (!headings) throw new Error(`Headings not found for slug "${slug}"`);
  // Tariff updates are best-effort context — the section is still useful even if
  // tariff-updates haven't been generated, but the strategies are far more
  // grounded when they reference the actual current rate environment.
  const tariffUpdates = await readTariffUpdates(slug);

  const prompt = `
You are a senior US trade-compliance and customs strategy advisor writing a "Tariff Engineering" analysis
for ${chapterLabel}. The audience is importers, sourcing leaders, customs brokers, and corporate trade
counsel who need actionable, defensible duty-mitigation strategies — not a textbook overview.

# What "Tariff Engineering" Means In This Report
Tariff engineering is the legitimate practice of designing, manufacturing, sourcing, valuing, or routing
a product so that — under the existing US Harmonized Tariff Schedule, customs valuation rules, and
free-trade-agreement preferences — the lawful classification, country of origin, or dutiable value
results in a lower duty burden. It is grounded in long-standing CBP and Court of International Trade
(CIT) doctrine: see e.g. the Converse "felt-soled sneaker" reclassification (HQ ruling 950333) and the
Ford Transit Connect "passenger van vs. cargo van" CIT decision (Ford Motor Co. v. United States,
926 F.3d 741 (Fed. Cir. 2019)).

It is NOT misclassification, transshipment fraud, or undervaluation. The report must keep that line
clear and be useful to a legal/compliance reader.

# Inputs (use these to ground every section)

## Chapter Scope
- **Chapter:** ${chapterLabel}
- **Padded number:** HTS Chapter ${padded}
- **Title:** ${ctx.chapterTitle}

## Industry Areas / Sub-headings In Scope
${JSON.stringify(headings, null, 2)}

## Current Tariff Environment for This Chapter
${
  tariffUpdates
    ? JSON.stringify(tariffUpdates, null, 2)
    : "(Tariff-updates section not yet generated — fall back to the reader's general knowledge of Section 232, Section 301 List 1-4A, IEEPA reciprocal tariffs, and current MFN rates for this chapter.)"
}

# Output Requirements
Output a JSON object that matches this EXACT schema:
{
  "title": string,
  "overview": string (markdown),
  "classificationLevers": [
    {
      "leverTitle": string,
      "currentClassification": string,
      "engineeredClassification": string,
      "basisForReclassification": string,
      "dutyDelta": string
    }
  ],
  "strategies": [
    {
      "title": string,
      "technique": string,
      "applicabilityToChapter": string,
      "potentialDutyImpact": string,
      "implementationSteps": string[],
      "risksAndCaveats": string,
      "precedent": string
    }
  ],
  "countryOfOriginPlaybook": string (markdown),
  "valuationOpportunities": string (markdown),
  "ftzAndDrawback": string (markdown),
  "complianceGuardrails": string (markdown),
  "bottomLine": string (markdown)
}

# Hard rules for the content
1. Every classification lever and strategy MUST be specific to ${chapterLabel}. Generic advice
   ("consider FTZs", "look at first sale") is NOT acceptable — name the products in the chapter,
   the actual HTS subheadings, and the actual rate differential.
2. Cite real authorities wherever possible: CBP HQ / NY ruling numbers, CIT / CAFC case names,
   USTR exclusion notices, CBP CSMS messages, GRI numbers, 19 USC / 19 CFR sections. Use markdown
   links (\`[citation](url)\`) when you have a source.
3. Wrap every percentage, dollar amount, tariff rate, HTS subheading number, and regulation citation in backticks (e.g. \`27.7%\`, \`\\$1.2M\`, \`6109.10.0012\`, \`19 CFR §146\`). Do NOT invent or stub figures — if a precise number is not in your sources, describe qualitatively or omit it.
4. The classification levers must reflect the structure of THIS chapter's subheadings — read the
   "Industry Areas / Sub-headings In Scope" input above and pick levers that move a product between
   those subheadings (or into / out of the chapter entirely under GRI 1 or Chapter Notes).
5. Strategies must collectively cover the canonical toolkit: classification, country-of-origin /
   substantial-transformation, FTA preference, first-sale valuation, FTZ, drawback, exclusions,
   Chapter 98 provisions. At minimum 5 distinct strategies.
6. Be candid about risk. If a strategy historically draws CBP scrutiny (e.g. Vietnam transshipment of
   China-origin goods, related-party first-sale challenges), call it out in \`risksAndCaveats\`.
7. The "bottomLine" must read like a partner-level memo conclusion: prescriptive sequencing, not a
   summary of what was just discussed.

${outputInstructions}

${chapterSeoGuidance(ctx)}
`;

  console.log('Invoking LLM for tariff engineering analysis');
  const tariffEngineering = await getLlmResponse<TariffEngineering>(
    prompt,
    TariffEngineeringSchema,
    LLMProvider.GEMINI_WITH_GROUNDING,
    GeminiModel.GEMINI_3_1_PRO_PREVIEW
  );

  await writeTariffEngineering(slug, tariffEngineering);
}
