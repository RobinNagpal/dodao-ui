// Per-chapter readiness of the official-measures calculator engine (issue #1794).
//
// A chapter may be switched to the measures engine (App Setting TARIFF_CALC_MEASURES_ENABLED) only when every
// Chapter 99 program that charges duty on any of its lines is modelled in measures.json — otherwise the engine
// undercharges. This module works out, offline and from committed files only:
//   1. every duty-charging Chapter 99 heading (ch99-headings.json), grouped into programs, with its status on a date
//      (in effect / ended / suspended / upcoming / unknown) from the official schedule and the reviewed facts below;
//   2. which HTS lines each heading covers (note-coverage.json + program-coverage.json + the heading's own text);
//   3. whether measures.json has a measure for that heading covering each line ("modelled").
// A chapter is READY when no in-effect (or unknown) program reaches one of its lines unmodelled.

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Ch99HeadingRecord, Ch99HeadingsFile, TariffMeasureRecord, TariffMeasuresFile } from '@/types/tariff-calculator-measures';
import { INSIGHTS_UI_ROOT } from './hts-source';

export const CALC_DATA_DIR = path.join(INSIGHTS_UI_ROOT, 'src', 'tariff-data', 'calculator');
export const PROGRAM_COVERAGE_FILE = path.join(CALC_DATA_DIR, 'program-coverage.json');
export const CHAPTER_READINESS_FILE = path.join(CALC_DATA_DIR, 'chapter-readiness.json');
export const ACCEPTED_GAPS_FILE = path.join(CALC_DATA_DIR, 'accepted-gaps.json');
export const APP_CONFIG_DEFAULTS_FILE = path.join(INSIGHTS_UI_ROOT, 'src', 'lib', 'appConfig', 'appConfigDefaults.json');
/** Runbook holding the documented production value of TARIFF_CALC_MEASURES_ENABLED (marker comment, see below). */
export const CALC_RUNBOOK_FILE = path.join(INSIGHTS_UI_ROOT, '..', 'docs', 'insights-ui', 'tariffs', 'calculator-data-refresh.md');
const ENABLED_MARKER = /<!--\s*calc-enabled-chapters:\s*([^>]*?)\s*-->/;
const MEASURES_ENABLED_KEY = 'TARIFF_CALC_MEASURES_ENABLED';

/** Written by extract-ch99-program-coverage.ts. */
export interface ProgramCoverageFile {
  htsEdition: string;
  /** Chapter 99 PDF the notes and the expired shading were read from. */
  sourceUrl: string;
  /** HTS JSON the chapter lines were read from. */
  htsJsonUrl: string;
  generatedAt: string;
  /** Headings shaded as expired in the Chapter 99 PDF. */
  expiredHeadings: string[];
  /** Note subdivision ("16(c)(iv)") → HTS digit prefixes listed directly in it. */
  notes: Record<string, string[]>;
  /** Chapter ("01") → space-separated 10-digit lines. */
  chapterLines: Record<string, string>;
}

interface NoteCoverageFileLike {
  notes: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Programs: Chapter 99 heading ranges → program, with the reviewed status facts
// ---------------------------------------------------------------------------

export type ProgramStatus = 'inEffect' | 'ended' | 'suspended' | 'notDuty' | 'unknown';

interface ProgramDef {
  id: string;
  name: string;
  /** Inclusive heading range ("9903.01.01"–"9903.02.99"). */
  from: string;
  to: string;
  status: ProgramStatus;
  /** First day in effect / last day in effect (inclusive), ISO. */
  effectiveFrom?: string;
  effectiveTo?: string;
  /** Rate steps for headings printed at +0% today (e.g. Nicaragua): the duty starts on `from`. */
  rateSteps?: { from: string; ratePct: number }[];
  /** Why the status is what it is (official fact, with where it is stated). */
  basis: string;
  sources?: string[];
}

const HTS_CH99 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099';

/**
 * Reviewed against HTS 2026 Revision 21 and the chapter pages' official sources (src/tariff-data/chapters/*.json).
 * Order matters only for overlapping ranges (first match wins). A heading in no range is "unknown" and blocks.
 */
const PROGRAMS: ProgramDef[] = [
  {
    id: 'ieepa',
    name: 'IEEPA duties (2025: fentanyl, reciprocal, Brazil, India)',
    from: '9903.01.01',
    to: '9903.02.99',
    status: 'ended',
    effectiveTo: '2026-02-23',
    basis: 'All IEEPA duties ended February 24, 2026 (Learning Resources v. Trump; EO 14389; CBP CSMS 67834313).',
    sources: [
      'https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf',
      'https://www.federalregister.gov/documents/2026/02/25/2026-03832/ending-certain-tariff-actions',
      'https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9',
    ],
  },
  {
    id: 's122',
    name: 'Section 122 import surcharge',
    from: '9903.03.01',
    to: '9903.03.11',
    status: 'ended',
    effectiveTo: '2026-07-23',
    basis: 'Proclamation 11012 surcharge (9903.03.01) expired July 23, 2026; shaded as expired in Revision 21.',
    sources: [
      'https://www.federalregister.gov/documents/2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems',
    ],
  },
  {
    id: 's338-canada',
    name: 'Section 338 duties on Canada (U.S. note 51)',
    from: '9903.03.12',
    to: '9903.03.19',
    status: 'inEffect',
    effectiveFrom: '2026-08-22',
    basis: '50% on listed Canadian alcoholic beverages, dairy and motor vehicles (Proclamations 11046–11048), in effect since August 22, 2026.',
    sources: [
      'https://www.federalregister.gov/documents/2026/07/23/2026-14991/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united-states',
    ],
  },
  {
    id: 'note5-suspended',
    name: 'Retaliatory 200% duties (9903.04.05–9903.04.55)',
    from: '9903.04.01',
    to: '9903.04.55',
    status: 'suspended',
    basis: 'U.S. note 5 to subchapter III: subheadings 9903.04.05, 9903.04.10 and headings 9903.04.15–9903.04.55 are suspended.',
    sources: [HTS_CH99],
  },
  {
    id: 's232-pharma',
    name: 'Section 232 pharmaceuticals',
    from: '9903.04.56',
    to: '9903.04.99',
    status: 'inEffect',
    effectiveFrom: '2026-07-31',
    basis: 'Proclamation 11020 (U.S. note 40).',
    sources: [HTS_CH99],
  },
  {
    id: 's301-brazil',
    name: 'Section 301 (Brazil)',
    from: '9903.05.01',
    to: '9903.05.19',
    status: 'inEffect',
    effectiveFrom: '2026-07-22',
    basis: 'USTR notice of action on Brazil (U.S. note 50).',
    sources: [
      'https://www.federalregister.gov/documents/2026/07/20/2026-14542/notice-of-action-brazils-acts-policies-and-practices-related-to-digital-trade-and-electronic-payment',
    ],
  },
  {
    id: 's301-2026',
    name: 'Section 301 (2026, 60 economies)',
    from: '9903.05.20',
    to: '9903.06.99',
    status: 'inEffect',
    effectiveFrom: '2026-07-24',
    basis: 'USTR notice of actions in the 60-economy forced-labor investigations (U.S. note 52).',
    sources: [
      'https://www.federalregister.gov/documents/2026/07/28/2026-15181/notice-of-actions-in-section-301-investigations-of-acts-policies-and-practices-of-various-economies',
    ],
  },
  {
    id: 'eu-1999-retaliation',
    name: '100% duties on EU products (9903.08.04–9903.08.15)',
    from: '9903.08.01',
    to: '9903.08.19',
    status: 'ended',
    basis: 'Shaded as expired in the Revision 21 Chapter 99 PDF.',
    sources: [HTS_CH99],
  },
  {
    id: 's232-drones',
    name: 'Section 232 unmanned aircraft (U.S. note 43)',
    from: '9903.08.20',
    to: '9903.08.29',
    status: 'inEffect',
    basis: 'Headings 9903.08.21–9903.08.24 in force in Revision 21 (not shaded).',
    sources: [HTS_CH99],
  },
  {
    id: 'sugar-quota',
    name: 'Sugar quota periods (U.S. note 15)',
    from: '9903.17.00',
    to: '9903.18.99',
    status: 'notDuty',
    basis: 'Quota-period entry headings; no rate of duty.',
  },
  {
    id: 'infant-formula',
    name: 'Infant formula (2022 temporary duty-free)',
    from: '9903.19.00',
    to: '9903.19.99',
    status: 'ended',
    basis: 'Free; shaded as expired.',
  },
  {
    id: 'ukraine-301',
    name: '100% duties on products of Ukraine (9903.27)',
    from: '9903.27.00',
    to: '9903.27.99',
    status: 'ended',
    basis: 'Shaded as expired in the Revision 21 Chapter 99 PDF.',
    sources: [HTS_CH99],
  },
  {
    id: 'china-tires-421',
    name: 'Section 421 safeguard on Chinese tires (9903.40)',
    from: '9903.40.00',
    to: '9903.40.99',
    status: 'ended',
    effectiveTo: '2012-09-25',
    basis: 'U.S. note 14(b): no duty after the close of September 25, 2012.',
    sources: [HTS_CH99],
  },
  {
    id: 'japan-1980s',
    name: 'Duties on products of Japan (9903.41)',
    from: '9903.41.00',
    to: '9903.41.99',
    status: 'unknown',
    basis:
      'U.S. note 5 suspends 9903.41.25 and 9903.41.35–.45 and the PDF shades 9903.41.15–.45 as expired, but 9903.41.05 and 9903.41.10 (leather, footwear) are neither shaded nor suspended and no end date was found.',
    sources: [HTS_CH99],
  },
  {
    id: 's201-washers-solar',
    name: 'Section 201 safeguards (washers, solar) (9903.45.01–.29)',
    from: '9903.45.01',
    to: '9903.45.29',
    status: 'ended',
    basis: 'Shaded as expired; heading texts carry "have expired" compiler\'s notes.',
    sources: [HTS_CH99],
  },
  {
    id: 's201-quartz',
    name: 'Section 201 safeguard on quartz surface products (U.S. note 41)',
    from: '9903.45.30',
    to: '9903.45.39',
    status: 'inEffect',
    effectiveFrom: '2026-08-15',
    effectiveTo: '2030-08-14',
    basis: 'U.S. note 41: in-quota 25% / over-quota 50% from August 15, 2026 through August 14, 2030.',
    sources: [HTS_CH99],
  },
  {
    id: 'cotton-quota',
    name: 'Upland cotton import quotas (U.S. note 6)',
    from: '9903.52.00',
    to: '9903.52.99',
    status: 'notDuty',
    basis: 'Quota headings; no rate of duty.',
  },
  {
    id: 'softwood-sla',
    name: 'Softwood Lumber Agreement export charge (9903.53)',
    from: '9903.53.00',
    to: '9903.53.99',
    status: 'ended',
    basis: 'HTS footnote: "The provisions of this heading and referenced note have expired."',
    sources: [HTS_CH99],
  },
  {
    id: 'misc-quota-free',
    name: 'Other quota / free provisions (9903.54–9903.55)',
    from: '9903.54.00',
    to: '9903.55.99',
    status: 'notDuty',
    basis: 'Quota or Free provisions; no additional duty.',
  },
  {
    id: 's232-trucks',
    name: 'Section 232 medium/heavy trucks and parts (U.S. note 38)',
    from: '9903.74.00',
    to: '9903.74.99',
    status: 'inEffect',
    basis: 'U.S. note 38.',
    sources: [HTS_CH99],
  },
  {
    id: 's232-lumber',
    name: 'Section 232 timber, lumber and wood products (U.S. note 37)',
    from: '9903.76.00',
    to: '9903.76.99',
    status: 'inEffect',
    basis: 'U.S. note 37.',
    sources: [HTS_CH99],
  },
  {
    id: 's232-semiconductors',
    name: 'Section 232 semiconductors (U.S. note 39)',
    from: '9903.79.00',
    to: '9903.79.99',
    status: 'inEffect',
    basis: 'U.S. note 39.',
    sources: [HTS_CH99],
  },
  {
    id: 's232-metals',
    name: 'Section 232 steel, aluminum, copper and derivatives (U.S. notes 16, 19)',
    from: '9903.80.00',
    to: '9903.85.99',
    status: 'inEffect',
    basis: 'U.S. notes 16 and 19.',
    sources: [HTS_CH99],
  },
  {
    id: 's301-china',
    name: 'Section 301 (China, 2018-2019 lists)',
    from: '9903.88.00',
    to: '9903.88.99',
    status: 'inEffect',
    basis: 'U.S. note 20 (lists 1, 2, 3, 4A); exclusion headings shaded as expired, 9903.88.16 suspended.',
    sources: [HTS_CH99],
  },
  {
    id: 's301-nicaragua',
    name: 'Section 301 (Nicaragua)',
    from: '9903.89.01',
    to: '9903.89.04',
    status: 'inEffect',
    rateSteps: [
      { from: '2027-01-01', ratePct: 10 },
      { from: '2028-01-01', ratePct: 15 },
    ],
    basis: 'U.S. note 29(b): +0% in 2026, +10% from January 1, 2027, +15% from January 1, 2028 (not on CAFTA-DR originating goods).',
    sources: [HTS_CH99],
  },
  {
    id: 'eu-lca',
    name: 'Section 301 large civil aircraft (EU/UK) (9903.89.05–.63)',
    from: '9903.89.05',
    to: '9903.89.99',
    status: 'suspended',
    basis: 'U.S. note (21)(w)–(x): USTR determined the duties do not apply to products of the UK (from July 4, 2021) or the EU (from July 11, 2021).',
    sources: [HTS_CH99],
  },
  {
    id: 'russia-col2',
    name: 'Russia: 35% in lieu of Column 2 (U.S. note 30)',
    from: '9903.90.00',
    to: '9903.90.99',
    status: 'inEffect',
    basis: 'U.S. note 30: listed Russian goods pay 35% in lieu of the Column 2 rate.',
    sources: [HTS_CH99],
  },
  {
    id: 's301-china-2024',
    name: 'Section 301 (China, 2024 increases)',
    from: '9903.91.00',
    to: '9903.91.99',
    status: 'inEffect',
    basis: 'U.S. note 31; per-heading effective dates are in the heading texts.',
    sources: [HTS_CH99],
  },
  {
    id: 's301-china-cranes',
    name: 'Section 301 (China, ship-to-shore cranes)',
    from: '9903.92.00',
    to: '9903.92.99',
    status: 'inEffect',
    basis: 'Heading 9903.92.10.',
    sources: [HTS_CH99],
  },
  {
    id: 's232-autos',
    name: 'Section 232 autos and auto parts (U.S. note 33)',
    from: '9903.94.00',
    to: '9903.94.99',
    status: 'inEffect',
    basis: 'U.S. note 33.',
    sources: [HTS_CH99],
  },
  {
    id: 's232-aircraft-relief',
    name: 'Civil aircraft relief (9903.96)',
    from: '9903.96.00',
    to: '9903.96.99',
    status: 'notDuty',
    basis: 'Relief headings only.',
  },
];

function programOf(code: string): ProgramDef | null {
  return PROGRAMS.find((p) => code >= p.from && code <= p.to) ?? null;
}

// ---------------------------------------------------------------------------
// Coverage: which HTS lines a heading reaches
// ---------------------------------------------------------------------------

/** Chapters an "automobile/vehicle part certified for U.S. production or repair" can fall in: 39–97 except 72, 73, 76. */
const CERTIFIED_PARTS_CHAPTERS: string[] = Array.from({ length: 59 }, (_, i) => String(39 + i)).filter((c) => !['72', '73', '76'].includes(c));
const CERTIFIED_PARTS_NOTE = 'certified vehicle parts, approximated as chapters 39–97 except 72, 73, 76';

interface CoverageOverride {
  refs?: string[];
  prefixes?: string[];
  countryWide?: boolean;
  approximate?: string;
  basis: string;
}

const C16 = (...subs: string[]): string[] => subs.map((s) => `16(c)(${s})`);

/** Headings whose coverage can't be read from their own note references (reviewed against the note texts). */
const HEADING_COVERAGE: Record<string, CoverageOverride> = {
  '9903.03.12': { refs: ['51(b)(1)'], basis: 'U.S. note 51(b)(1)' },
  '9903.03.13': { refs: ['51(b)(2)'], basis: 'U.S. note 51(b)(2)' },
  '9903.03.14': { refs: ['51(b)(3)'], basis: 'U.S. note 51(b)(3)' },
  '9903.04.60': { refs: ['40(c)'], basis: 'U.S. note 40(c)' },
  '9903.04.62': { refs: ['40(c)'], basis: 'U.S. note 40(c)' },
  '9903.04.63': { refs: ['40(c)'], basis: 'U.S. note 40(c)' },
  '9903.04.64': { refs: ['40(c)'], basis: 'U.S. note 40(c)' },
  '9903.04.65': { refs: ['40(c)'], basis: 'U.S. note 40(c)' },
  '9903.04.66': { refs: ['40(c)'], basis: 'U.S. note 40(c)' },
  '9903.04.70': { refs: ['40(c)'], basis: 'U.S. note 40(c)' },
  '9903.05.01': { countryWide: true, basis: 'all articles the product of Brazil (U.S. note 50(a)); the 50(a) lists are exemptions' },
  '9903.08.21': { refs: ['43(c)(1)', '43(c)(2)', '43(c)(3)'], basis: 'U.S. note 43(c)(1)–(3)' },
  '9903.08.22': { refs: ['43(c)(4)'], basis: 'U.S. note 43(c)(4)' },
  '9903.08.23': { refs: ['43(c)'], basis: 'U.S. note 43(c)' },
  '9903.08.24': { refs: ['43(c)'], basis: 'U.S. note 43(c)' },
  '9903.45.30': { refs: ['41(a)'], basis: 'U.S. note 41(a)' },
  '9903.45.31': { refs: ['41(a)'], basis: 'U.S. note 41(a)' },
  '9903.74.01': { refs: ['38(b)'], basis: 'U.S. note 38(b)' },
  '9903.74.02': { refs: ['38(c)'], basis: 'U.S. note 38(c)' },
  '9903.74.03': { refs: ['38(b)'], basis: 'U.S. note 38(d): vehicles of 38(b) with approved U.S. content' },
  '9903.74.08': { refs: ['38(i)'], basis: 'U.S. note 38(i)' },
  '9903.74.09': { prefixes: CERTIFIED_PARTS_CHAPTERS, approximate: CERTIFIED_PARTS_NOTE, basis: 'U.S. note 38(j)' },
  '9903.76.01': { refs: ['37(b)'], basis: 'U.S. note 37(b)' },
  '9903.76.02': { refs: ['37(d)'], basis: 'U.S. note 37(d)' },
  '9903.76.03': { refs: ['37(f)'], basis: 'U.S. note 37(f)' },
  '9903.76.20': { refs: ['37(d)', '37(f)'], basis: 'U.S. note 37(d), (f)' },
  '9903.76.21': { refs: ['37(d)', '37(f)'], basis: 'U.S. note 37(d), (f)' },
  '9903.76.22': { refs: ['37(d)', '37(f)'], basis: 'U.S. note 37(d), (f)' },
  '9903.76.23': { refs: ['37(d)', '37(f)'], basis: 'U.S. note 37(d), (f)' },
  '9903.76.24': { refs: ['37(d)', '37(f)'], basis: 'U.S. note 37(d), (f)' },
  '9903.79.01': { refs: ['39(b)'], basis: 'U.S. note 39(b)' },
  '9903.82.02': { refs: C16('i', 'ii', 'iii', 'iv', 'v'), basis: 'U.S. note 16(c)(i)–(v)' },
  '9903.82.04': { refs: C16('i', 'ii', 'iii', 'iv'), basis: 'U.S. note 16(c)(i)–(iv)' },
  '9903.82.05': { refs: C16('vi', 'vii'), basis: 'U.S. note 16(c)(vi)–(vii)' },
  '9903.82.06': { refs: C16('ii', 'iv', 'vi', 'vii', 'viii', 'xi'), basis: 'U.S. note 16(c)(ii), (iv), (vi)–(viii), (xi)' },
  '9903.82.07': { refs: C16('ix', 'x'), basis: 'U.S. note 16(c)(ix)–(x)' },
  '9903.82.09': { refs: C16('vi', 'vii', 'viii', 'xi'), basis: 'U.S. note 16(c)(vi)–(viii), (xi)' },
  '9903.82.10': { refs: C16('ix', 'x'), basis: 'U.S. note 16(f): articles of 16(c)(ix)–(x)' },
  '9903.82.12': { refs: C16('ix', 'x'), basis: 'U.S. note 16(c)(ix)–(x)' },
  '9903.82.14': { refs: C16('iii', 'iv', 'v'), basis: 'U.S. note 16(c)(iii)–(v)' },
  '9903.82.15': { refs: C16('iv', 'vii', 'viii', 'xi'), basis: 'U.S. note 16(c)(iv), (vii), (viii), (xi)' },
  '9903.82.16': { refs: C16('vii', 'viii', 'xi'), basis: 'U.S. note 16(c)(vii)–(viii), (xi)' },
  '9903.82.17': { refs: C16('x'), basis: 'U.S. note 16(c)(x)' },
  '9903.82.20': { refs: C16('xi'), basis: 'U.S. note 16(j): derivative steel of 16(c)(xi)' },
  '9903.82.22': { refs: C16('xi'), basis: 'U.S. note 16(c)(xi)' },
  '9903.82.23': { refs: C16('vi', 'vii', 'viii'), basis: 'U.S. note 16(k): parts of 16(c)(vi)–(viii)' },
  '9903.82.25': { refs: C16('vi', 'vii', 'viii'), basis: 'U.S. note 16(k): parts of 16(c)(vi)–(viii)' },
  '9903.85.67': { prefixes: ['76'], approximate: 'aluminum articles of U.S. note 19(a)(vii)(A)/(m)(A) — approximated as chapter 76', basis: 'U.S. note 19' },
  '9903.85.68': { refs: ['19(a)(iii)', '19(i)', '19(j)', '19(k)'], basis: 'U.S. note 19(a)(iii), (i), (j), (k)' },
  '9903.88.01': { refs: ['20(b)'], basis: 'U.S. note 20(b) (list 1)' },
  '9903.88.02': { refs: ['20(d)'], basis: 'U.S. note 20(d) (list 2)' },
  '9903.88.03': { refs: ['20(f)'], basis: 'U.S. note 20(f) (list 3)' },
  '9903.88.04': { refs: ['20(g)'], basis: 'U.S. note 20(g)' },
  '9903.88.15': { refs: ['20(s)'], basis: 'U.S. note 20(s) (list 4A)' },
  '9903.90.08': { refs: ['30(b)'], basis: 'U.S. note 30(b)' },
  '9903.90.09': { refs: ['30(d)'], basis: 'U.S. note 30(d)' },
  '9903.94.01': { refs: ['33(b)'], basis: 'U.S. note 33(b)' },
  '9903.94.03': { refs: ['33(b)'], basis: 'U.S. note 33(d): vehicles of 33(b) with approved U.S. content' },
  '9903.94.05': { refs: ['33(g)'], basis: 'U.S. note 33(g)' },
  '9903.94.07': { prefixes: CERTIFIED_PARTS_CHAPTERS, approximate: CERTIFIED_PARTS_NOTE, basis: 'U.S. note 33(p)' },
  '9903.94.31': { refs: ['33(i)'], basis: 'U.S. note 33(i)' },
  '9903.94.32': { refs: ['33(j)'], basis: 'U.S. note 33(j)' },
  '9903.94.33': { prefixes: CERTIFIED_PARTS_CHAPTERS, approximate: CERTIFIED_PARTS_NOTE, basis: 'U.S. note 33(q)' },
  '9903.94.41': { refs: ['33(b)'], basis: 'U.S. note 33(k): vehicles of 33(b)' },
  '9903.94.43': { refs: ['33(g)'], basis: 'U.S. note 33(l): parts of 33(g)' },
  '9903.94.45': { prefixes: CERTIFIED_PARTS_CHAPTERS, approximate: CERTIFIED_PARTS_NOTE, basis: 'U.S. note 33(r)' },
  '9903.94.51': { refs: ['33(b)'], basis: 'U.S. note 33(n): vehicles of 33(b)' },
  '9903.94.53': { refs: ['33(g)'], basis: 'U.S. note 33(o): parts of 33(g)' },
  '9903.94.55': { prefixes: CERTIFIED_PARTS_CHAPTERS, approximate: CERTIFIED_PARTS_NOTE, basis: 'U.S. note 33(r)' },
  '9903.94.61': { refs: ['33(b)'], basis: 'U.S. note 33(s): vehicles of 33(b)' },
  '9903.94.63': { refs: ['33(g)'], basis: 'U.S. note 33(t): parts of 33(g)' },
  '9903.94.65': { prefixes: CERTIFIED_PARTS_CHAPTERS, approximate: CERTIFIED_PARTS_NOTE, basis: 'U.S. note 33(r), (t)' },
  '9903.94.67': { refs: ['33(g)'], basis: 'U.S. note 33(u): parts of 33(g)' },
  '9903.94.69': { prefixes: CERTIFIED_PARTS_CHAPTERS, approximate: CERTIFIED_PARTS_NOTE, basis: 'U.S. note 33(r), (u)' },
};

const DOTTED_CODE = /\d{4}(?:\.\d{2}){1,3}/g;

/**
 * Digit prefixes in a run of note or heading text. Lines made only of codes (the note lists) also yield 4-digit
 * headings printed run together ("7606760576047601" → 7606, 7605, 7604, 7601) and 2-digit statistical suffixes run
 * into the next code ("7616.99.5160760…" → 7616995160). Chapter 98/99 references are dropped.
 */
export function extractListCodes(text: string): { codes: string[]; problems: string[] } {
  const codes: string[] = [];
  const problems: string[] = [];
  const add = (digits: string): void => {
    if (!digits.startsWith('98') && !digits.startsWith('99')) codes.push(digits);
  };
  for (const raw of text.split('\n')) {
    const isList = /^[\d.\s]+$/.test(raw) && /\d{4}/.test(raw);
    for (const segment of raw.split(/\s+/).filter(Boolean)) {
      const matches = Array.from(segment.matchAll(DOTTED_CODE));
      if (!isList) {
        for (const m of matches) {
          // "8716.39.0090": a dotted 8-digit code followed directly by its 2-digit statistical suffix.
          const after = segment.slice((m.index ?? 0) + m[0].length);
          const suffix = /^\d{2}(?!\d)/.exec(after);
          add(m[0].replace(/\./g, '') + (m[0].length === 10 && suffix ? suffix[0] : ''));
        }
        continue;
      }
      let pos = 0;
      let last: string | null = null;
      const leftover = (run: string): void => {
        let rest = run.replace(/\D/g, ''); // a sentence's closing period is not a code
        if (rest === '') return;
        if (rest.length % 4 === 2 && last !== null && last.length === 8) {
          const idx = codes.lastIndexOf(last);
          if (idx >= 0) codes[idx] = last + rest.slice(0, 2); // statistical suffix of the previous code
          rest = rest.slice(2);
        }
        if (rest.length % 4 !== 0) {
          problems.push(`unreadable digits "${run}" in "${raw}"`);
          return;
        }
        for (let i = 0; i < rest.length; i += 4) add(rest.slice(i, i + 4));
      };
      for (const m of matches) {
        leftover(segment.slice(pos, m.index));
        last = m[0].replace(/\./g, '');
        add(last);
        pos = (m.index ?? 0) + m[0].length;
      }
      leftover(segment.slice(pos));
    }
  }
  return { codes, problems };
}

/** Codes a heading's own description names: dotted subheadings, "heading 4104", "chapter 64". */
function descriptionCodes(description: string): string[] {
  const text = description.replace(/\[Compiler['’]s note:[^\]]*\]/gi, '');
  const out = new Set(extractListCodes(text).codes);
  for (const m of text.matchAll(/\bheadings?\s+((?:\d{4}(?!\.\d)(?:,\s*(?:or\s+|and\s+)?|\s+or\s+|\s+and\s+)?)+)/gi)) {
    for (const h of m[1].match(/\d{4}/g) ?? []) if (!h.startsWith('98') && !h.startsWith('99')) out.add(h);
  }
  for (const m of text.matchAll(/\bchapters?\s+((?:\d{1,2}(?!\d|\.)(?:,\s*(?:or\s+|and\s+)?|\s+or\s+|\s+and\s+)?)+)/gi)) {
    for (const c of m[1].match(/\d{1,2}/g) ?? []) if (Number(c) >= 1 && Number(c) <= 97) out.add(c.padStart(2, '0'));
  }
  return Array.from(out);
}

const ROMAN = ['', 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx'];

/** "16(c)(i)–(v)" → 16(c)(i) … 16(c)(v); other refs unchanged. */
export function expandNoteRef(ref: string): string[] {
  const m = /^(.*)\(([a-z]+|\d+)\)\s*[–-]\s*\(([a-z]+|\d+)\)$/.exec(ref);
  if (!m) return [ref];
  const [, base, a, b] = m;
  if (/^\d+$/.test(a) && /^\d+$/.test(b)) return Array.from({ length: Number(b) - Number(a) + 1 }, (_, i) => `${base}(${Number(a) + i})`);
  if (ROMAN.includes(a) && ROMAN.includes(b) && ROMAN.indexOf(b) > ROMAN.indexOf(a)) {
    return ROMAN.slice(ROMAN.indexOf(a), ROMAN.indexOf(b) + 1).map((r) => `${base}(${r})`);
  }
  if (/^[a-z]$/.test(a) && /^[a-z]$/.test(b) && b > a) {
    return Array.from({ length: b.charCodeAt(0) - a.charCodeAt(0) + 1 }, (_, i) => `${base}(${String.fromCharCode(a.charCodeAt(0) + i)})`);
  }
  return [ref];
}

export type HeadingCoverage =
  | { kind: 'all'; basis: string }
  | { kind: 'prefixes'; prefixes: string[]; basis: string; approximate?: string }
  | { kind: 'unknown'; basis: string };

function codesForRef(notes: Map<string, string[]>, ref: string): string[] {
  const out: string[] = [];
  for (const [key, codes] of notes) if (key === ref || key.startsWith(`${ref}(`)) out.push(...codes);
  return out;
}

export function resolveCoverage(h: Ch99HeadingRecord, notes: Map<string, string[]>): HeadingCoverage {
  const override = HEADING_COVERAGE[h.code];
  if (override) {
    if (override.countryWide) return { kind: 'all', basis: override.basis };
    const prefixes = [...(override.prefixes ?? []), ...(override.refs ?? []).flatMap((r) => codesForRef(notes, r))];
    if (prefixes.length === 0) return { kind: 'unknown', basis: `${override.basis}: no codes found in the note lists` };
    return { kind: 'prefixes', prefixes: Array.from(new Set(prefixes)), basis: override.basis, approximate: override.approximate };
  }
  const subdivisionRefs = h.noteRefs.flatMap(expandNoteRef).filter((r) => r.includes('('));
  const fromRefs = subdivisionRefs.flatMap((r) => codesForRef(notes, r));
  const fromText = descriptionCodes(h.description);
  if (fromRefs.length + fromText.length > 0) {
    const basis = [fromText.length ? 'codes named in the heading text' : '', subdivisionRefs.length ? `U.S. note ${subdivisionRefs.join(', ')}` : '']
      .filter(Boolean)
      .join(' + ');
    return { kind: 'prefixes', prefixes: Array.from(new Set([...fromRefs, ...fromText])), basis };
  }
  if (/\b(?:articles|products?|goods)\b[^.]*\bthe product of\b|\bproducts of\b/i.test(h.description)) {
    return { kind: 'all', basis: 'all articles of the named countries (the cited note lists no products)' };
  }
  const noteNums = Array.from(new Set(h.noteRefs.map((r) => r.split('(')[0])));
  const whole = noteNums.flatMap((n) => codesForRef(notes, n));
  if (whole.length > 0) {
    return { kind: 'prefixes', prefixes: Array.from(new Set(whole)), basis: `every list in U.S. note ${noteNums.join(', ')}`, approximate: 'whole-note lists' };
  }
  return { kind: 'unknown', basis: 'no product coverage found in the heading text or its notes' };
}

// ---------------------------------------------------------------------------
// Heading status on a date
// ---------------------------------------------------------------------------

export type HeadingState = 'inEffect' | 'upcoming' | 'ended' | 'suspended' | 'notDuty' | 'zeroRate' | 'unknown';

interface HeadingStatus {
  state: HeadingState;
  startsOn?: string;
  basis: string;
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

function isoFromText(s: string): string | null {
  const m = /([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/.exec(s);
  if (!m) return null;
  const month = MONTHS.indexOf(m[1].toLowerCase());
  if (month < 0) return null;
  return `${m[3]}-${String(month + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
}

function dayBefore(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function headingStatus(h: Ch99HeadingRecord, program: ProgramDef | null, expired: Set<string>, asOf: string): HeadingStatus {
  if (!program) return { state: 'unknown', basis: 'heading is in no reviewed program — classify it in calc-readiness.ts' };
  if (program.status === 'notDuty') return { state: 'notDuty', basis: program.basis };
  if (h.rateKind === 'relief') return { state: 'notDuty', basis: 'relief heading' };
  if (program.status === 'ended' || program.status === 'suspended') return { state: program.status, basis: program.basis };
  if (expired.has(h.code)) return { state: 'ended', basis: 'shaded as expired in the Chapter 99 PDF' };
  const note = /\[Compiler['’]s note:[^\]]*\b(suspended|expired)\b[^\]]*\]/i.exec(h.description);
  if (note) return { state: note[1].toLowerCase() === 'suspended' ? 'suspended' : 'ended', basis: `heading text: ${note[0]}` };

  const from = /on or after ([A-Za-z]+ \d{1,2}, \d{4})/.exec(h.description);
  const before = /\band before ([A-Za-z]+ \d{1,2}, \d{4})/.exec(h.description);
  const headingFrom = from ? isoFromText(from[1]) : null;
  const headingTo = before ? isoFromText(before[1]) : null;
  const effFrom = [program.effectiveFrom, headingFrom]
    .filter((x): x is string => !!x)
    .sort()
    .pop();
  const effTo = [program.effectiveTo, headingTo ? dayBefore(headingTo) : undefined].filter((x): x is string => !!x).sort()[0];
  if (effTo && asOf > effTo) return { state: 'ended', basis: `ended ${effTo}` };

  const zero = (h.rateKind === 'additive' || h.rateKind === 'flat') && h.ratePct === 0;
  if (zero) {
    const steps = program.rateSteps ?? [];
    const active = steps.filter((s) => s.from <= asOf && s.ratePct > 0);
    const next = steps.find((s) => s.from > asOf && s.ratePct > 0);
    if (active.length === 0) {
      return next
        ? { state: 'upcoming', startsOn: next.from, basis: `+0% today; +${next.ratePct}% from ${next.from} (${program.basis})` }
        : { state: 'zeroRate', basis: 'rate is +0%' };
    }
  }
  if (effFrom && asOf < effFrom) return { state: 'upcoming', startsOn: effFrom, basis: `in effect from ${effFrom}` };
  return { state: program.status === 'unknown' ? 'unknown' : 'inEffect', basis: program.basis };
}

// ---------------------------------------------------------------------------
// Readiness
// ---------------------------------------------------------------------------

export type ModelledState = 'yes' | 'partial' | 'no';

export interface ProgramGap {
  programId: string;
  program: string;
  /** State of the program's headings that reach this chapter (worst first: unknown > inEffect > upcoming). */
  state: 'inEffect' | 'unknown' | 'upcoming';
  startsOn?: string;
  headings: string[];
  linesAffected: number;
  linesNotModelled: number;
  modelled: ModelledState;
  /** Unmodelled lines covered by an unexpired waiver in accepted-gaps.json (they don't block). */
  linesAccepted?: number;
  acceptedBy?: string[];
  /** Heading → note on approximate or unknown coverage. */
  coverageNotes?: string[];
}

/** A reviewed, time-limited waiver: a known gap that may stay unmodelled until `reviewBy` (accepted-gaps.json). */
export interface AcceptedGap {
  id: string;
  /**
   * "lines": the listed lines may stay unmodelled for these headings (they report ACCEPTED, not GAP).
   * "condition": the headings are modelled, but a condition the line-level check can't see is not (e.g. a duty that also
   * reaches other origins through where the metal was smelted). Never turns an unmodelled line into an accepted one;
   * recorded so the known limitation is listed with the chapters it touches and re-reviewed by `reviewBy`.
   */
  kind: 'lines' | 'condition';
  /** Chapter 99 headings the waiver applies to. */
  ch99Codes: string[];
  /** HTS digit prefixes of the waived lines; empty = every line the headings reach. */
  linePrefixes: string[];
  /** Chapters ("30") the waiver is limited to; empty = any. */
  chapters: string[];
  /** What the measures engine doesn't model, in plain words. */
  conditionNotModelled: string;
  reason: string;
  sources: string[];
  reviewedBy: string;
  reviewedAt: string;
  /** Last day the waiver counts (ISO); after it the gap blocks again until re-reviewed. */
  reviewBy: string;
}

export interface AcceptedGapsFile {
  acceptedGaps: AcceptedGap[];
}

export interface ChapterReadiness {
  chapter: string;
  lines: number;
  status: 'READY' | 'NOT READY';
  /** Programs that block the chapter (in effect or unknown, not fully modelled). */
  gaps: ProgramGap[];
  /** Programs that start later and aren't modelled for the chapter yet (don't block today). */
  upcoming: ProgramGap[];
  /** Programs whose remaining unmodelled lines are all covered by an unexpired waiver (accepted-gaps.json). */
  accepted: ProgramGap[];
  /** Programs that reach the chapter and are fully modelled. */
  modelled: ProgramGap[];
  /** Ids of unexpired "condition" waivers whose headings reach the chapter. */
  acceptedConditions: string[];
}

export interface ProgramSummary {
  id: string;
  name: string;
  status: ProgramStatus;
  basis: string;
  sources: string[];
  /** Duty headings of the program by state on the as-of date. */
  headings: Partial<Record<HeadingState, string[]>>;
  /** Chapters the program blocks / reaches unmodelled later. */
  blocksChapters: string[];
  upcomingInChapters: string[];
}

export interface CalcReadinessReport {
  asOf: string;
  htsEdition: string;
  measuresReviewedAt: string | null;
  ready: string[];
  notReady: string[];
  programs: ProgramSummary[];
  /** Waivers past their reviewBy date (no longer applied) and waivers that matched no gap. */
  expiredWaivers: string[];
  unusedWaivers: string[];
  chapters: ChapterReadiness[];
}

function readJson<T>(file: string): T {
  if (!existsSync(file)) throw new Error(`${path.relative(INSIGHTS_UI_ROOT, file)} not found`);
  return JSON.parse(readFileSync(file, 'utf8')) as T;
}

function hasPrefixIn(set: Set<string>, line: string): boolean {
  for (let n = 2; n <= line.length; n++) if (set.has(line.slice(0, n))) return true;
  return false;
}

function measureKnowsLine(m: TariffMeasureRecord, line: string): boolean {
  const covers = (prefixes: string[]): boolean => prefixes.some((p) => p.length > 0 && line.startsWith(p.replace(/\D/g, '')));
  return m.coverageInclude.length === 0 || covers(m.coverageInclude) || covers(m.coverageExclude);
}

export interface ReadinessInputs {
  headings?: Ch99HeadingsFile;
  measures?: TariffMeasuresFile;
  noteCoverage?: NoteCoverageFileLike;
  programCoverage?: ProgramCoverageFile;
  acceptedGaps?: AcceptedGapsFile;
}

const STATE_RANK: Record<ProgramGap['state'], number> = { unknown: 0, inEffect: 1, upcoming: 2 };

export function computeCalcReadiness(asOf: string, inputs: ReadinessInputs = {}): CalcReadinessReport {
  const headingsFile = inputs.headings ?? readJson<Ch99HeadingsFile>(path.join(CALC_DATA_DIR, 'ch99-headings.json'));
  const measuresFile = inputs.measures ?? readJson<TariffMeasuresFile>(path.join(CALC_DATA_DIR, 'measures.json'));
  const noteCoverage = inputs.noteCoverage ?? readJson<NoteCoverageFileLike>(path.join(CALC_DATA_DIR, 'note-coverage.json'));
  const programCoverage = inputs.programCoverage ?? readJson<ProgramCoverageFile>(PROGRAM_COVERAGE_FILE);

  const notes = new Map<string, string[]>();
  for (const src of [noteCoverage.notes, programCoverage.notes]) {
    for (const [k, v] of Object.entries(src)) notes.set(k, Array.from(new Set([...(notes.get(k) ?? []), ...v])));
  }
  const expired = new Set(programCoverage.expiredHeadings);
  const waiverFile = inputs.acceptedGaps ?? (existsSync(ACCEPTED_GAPS_FILE) ? readJson<AcceptedGapsFile>(ACCEPTED_GAPS_FILE) : { acceptedGaps: [] });
  const waivers = waiverFile.acceptedGaps.filter((w) => w.reviewBy >= asOf);
  const lineWaivers = waivers.filter((w) => w.kind === 'lines');
  const conditionWaivers = waivers.filter((w) => w.kind === 'condition');
  const expiredWaivers = waiverFile.acceptedGaps.filter((w) => w.reviewBy < asOf).map((w) => `${w.id} (review was due ${w.reviewBy})`);
  const usedWaivers = new Set<string>();
  const waiverFor = (code: string, chapter: string, line: string): AcceptedGap | undefined =>
    lineWaivers.find(
      (w) =>
        w.ch99Codes.includes(code) &&
        (w.chapters.length === 0 || w.chapters.includes(chapter)) &&
        (w.linePrefixes.length === 0 || w.linePrefixes.some((p) => line.startsWith(p)))
    );

  // Measures that haven't ended by the as-of date, by heading.
  const measuresByHeading = new Map<string, TariffMeasureRecord[]>();
  for (const m of measuresFile.measures) {
    if (m.effectiveTo && m.effectiveTo < asOf) continue;
    measuresByHeading.set(m.ch99Code, [...(measuresByHeading.get(m.ch99Code) ?? []), m]);
  }

  interface ActiveHeading {
    code: string;
    program: ProgramDef | null;
    status: HeadingStatus;
    coverage: HeadingCoverage;
    prefixSet: Set<string>;
  }
  const active: ActiveHeading[] = [];
  const programHeadings = new Map<string, Partial<Record<HeadingState, string[]>>>();
  for (const h of headingsFile.headings) {
    const program = programOf(h.code);
    const status = headingStatus(h, program, expired, asOf);
    const pid = program?.id ?? `unclassified-${h.code.slice(0, 7)}`;
    if (!(h.rateKind === 'relief' && program)) {
      const byState = programHeadings.get(pid) ?? {};
      byState[status.state] = [...(byState[status.state] ?? []), h.code];
      programHeadings.set(pid, byState);
    }
    if (status.state !== 'inEffect' && status.state !== 'unknown' && status.state !== 'upcoming') continue;
    const coverage = resolveCoverage(h, notes);
    active.push({ code: h.code, program, status, coverage, prefixSet: new Set(coverage.kind === 'prefixes' ? coverage.prefixes : []) });
  }

  const chapters: ChapterReadiness[] = [];
  const blocks = new Map<string, string[]>();
  const upcomingIn = new Map<string, string[]>();
  for (const [chapter, joined] of Object.entries(programCoverage.chapterLines).sort(([a], [b]) => a.localeCompare(b))) {
    const lines = joined.split(' ').filter(Boolean);
    const conditions = new Set<string>();
    const perProgram = new Map<string, { gap: ProgramGap; affected: Set<string>; unmodelled: Set<string>; accepted: Set<string>; by: Set<string> }>();
    for (const a of active) {
      const affected = a.coverage.kind === 'prefixes' ? lines.filter((l) => hasPrefixIn(a.prefixSet, l)) : lines;
      if (affected.length === 0) continue;
      for (const w of conditionWaivers) {
        if (w.ch99Codes.includes(a.code) && (w.chapters.length === 0 || w.chapters.includes(chapter))) {
          conditions.add(w.id);
          usedWaivers.add(w.id);
        }
      }
      const measures = measuresByHeading.get(a.code) ?? [];
      const notModelled = a.coverage.kind === 'unknown' ? affected : affected.filter((l) => !measures.some((m) => measureKnowsLine(m, l)));
      const unmodelled: string[] = [];
      const acceptedLines: string[] = [];
      const acceptedBy = new Set<string>();
      for (const l of notModelled) {
        const w = a.status.state === 'upcoming' ? undefined : waiverFor(a.code, chapter, l);
        if (w) {
          acceptedLines.push(l);
          acceptedBy.add(w.id);
          usedWaivers.add(w.id);
        } else unmodelled.push(l);
      }
      const pid = a.program?.id ?? `unclassified-${a.code.slice(0, 7)}`;
      const state: ProgramGap['state'] = a.status.state === 'upcoming' ? 'upcoming' : a.status.state === 'unknown' ? 'unknown' : 'inEffect';
      let entry = perProgram.get(pid);
      if (!entry) {
        entry = {
          gap: {
            programId: pid,
            program: a.program?.name ?? `Unclassified ${a.code.slice(0, 7)}`,
            state,
            headings: [],
            linesAffected: 0,
            linesNotModelled: 0,
            modelled: 'yes',
          },
          affected: new Set(),
          unmodelled: new Set(),
          accepted: new Set(),
          by: new Set(),
        };
        perProgram.set(pid, entry);
      }
      // A program's in-effect headings decide its state; upcoming ones only count when nothing else applies.
      if (STATE_RANK[state] < STATE_RANK[entry.gap.state]) entry.gap.state = state;
      if (state === 'upcoming' && a.status.startsOn && (!entry.gap.startsOn || a.status.startsOn < entry.gap.startsOn)) entry.gap.startsOn = a.status.startsOn;
      entry.gap.headings.push(a.code);
      affected.forEach((l) => entry!.affected.add(l));
      unmodelled.forEach((l) => entry!.unmodelled.add(l));
      acceptedLines.forEach((l) => entry!.accepted.add(l));
      acceptedBy.forEach((id) => entry!.by.add(id));
      if (a.coverage.kind === 'unknown' || (a.coverage.kind === 'prefixes' && a.coverage.approximate)) {
        const why = a.coverage.kind === 'unknown' ? `coverage unknown (${a.coverage.basis})` : `approximate coverage: ${a.coverage.approximate}`;
        entry.gap.coverageNotes = Array.from(new Set([...(entry.gap.coverageNotes ?? []), `${a.code}: ${why}`]));
      }
    }
    const gaps: ProgramGap[] = [];
    const upcoming: ProgramGap[] = [];
    const modelled: ProgramGap[] = [];
    const accepted: ProgramGap[] = [];
    for (const { gap, affected, unmodelled, accepted: acc, by } of perProgram.values()) {
      // A line waived for one heading of the program but unmodelled for another still counts as not modelled.
      acc.forEach((l) => {
        if (unmodelled.has(l)) acc.delete(l);
      });
      const notModelled = unmodelled.size + acc.size;
      gap.linesAffected = affected.size;
      gap.linesNotModelled = unmodelled.size;
      gap.modelled = notModelled === 0 ? 'yes' : notModelled === affected.size ? 'no' : 'partial';
      if (acc.size > 0) {
        gap.linesAccepted = acc.size;
        gap.acceptedBy = Array.from(by).sort();
      }
      if (gap.state !== 'upcoming') delete gap.startsOn;
      if (gap.modelled === 'yes') modelled.push(gap);
      else if (unmodelled.size === 0) accepted.push(gap);
      else if (gap.state === 'upcoming') upcoming.push(gap);
      else gaps.push(gap);
    }
    const byLines = (x: ProgramGap, y: ProgramGap): number => y.linesNotModelled - x.linesNotModelled || x.program.localeCompare(y.program);
    gaps.sort(byLines);
    upcoming.sort(byLines);
    modelled.sort((x, y) => x.program.localeCompare(y.program));
    for (const g of gaps) blocks.set(g.programId, [...(blocks.get(g.programId) ?? []), chapter]);
    for (const g of upcoming) upcomingIn.set(g.programId, [...(upcomingIn.get(g.programId) ?? []), chapter]);
    accepted.sort((x, y) => x.program.localeCompare(y.program));
    chapters.push({
      chapter,
      lines: lines.length,
      status: gaps.length === 0 ? 'READY' : 'NOT READY',
      gaps,
      upcoming,
      accepted,
      modelled,
      acceptedConditions: Array.from(conditions).sort(),
    });
  }

  const programs: ProgramSummary[] = Array.from(programHeadings.entries()).map(([id, headings]) => {
    const def = PROGRAMS.find((p) => p.id === id);
    return {
      id,
      name: def?.name ?? `Unclassified ${id.replace('unclassified-', '')}`,
      status: def?.status ?? 'unknown',
      basis: def?.basis ?? 'not in the reviewed program list',
      sources: def?.sources ?? [],
      headings,
      blocksChapters: blocks.get(id) ?? [],
      upcomingInChapters: upcomingIn.get(id) ?? [],
    };
  });

  return {
    asOf,
    htsEdition: headingsFile.htsEdition,
    measuresReviewedAt: measuresFile.reviewedAt ?? null,
    ready: chapters.filter((c) => c.status === 'READY').map((c) => c.chapter),
    notReady: chapters.filter((c) => c.status === 'NOT READY').map((c) => c.chapter),
    programs,
    expiredWaivers,
    unusedWaivers: waivers.filter((w) => !usedWaivers.has(w.id)).map((w) => w.id),
    chapters,
  };
}

// ---------------------------------------------------------------------------
// Enabled chapters (the App Setting default and the documented production value)
// ---------------------------------------------------------------------------

/** Same parsing as getMeasuresEnabledChapters (load-measures.ts): comma-separated chapter numbers; "off"/empty = none. */
export function parseEnabledChapters(raw: string): number[] {
  return raw
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 99);
}

export interface EnabledChapterSource {
  source: string;
  chapters: number[];
}

/**
 * Chapters listed for the measures engine in appConfigDefaults.json and in the runbook marker
 * `<!-- calc-enabled-chapters: 1,30 -->` (the documented production App Setting value). A missing file is skipped.
 */
export function enabledChapterSources(): EnabledChapterSource[] {
  const out: EnabledChapterSource[] = [];
  if (existsSync(APP_CONFIG_DEFAULTS_FILE)) {
    const defaults = readJson<Record<string, string>>(APP_CONFIG_DEFAULTS_FILE);
    out.push({ source: `appConfigDefaults.json ${MEASURES_ENABLED_KEY}`, chapters: parseEnabledChapters(defaults[MEASURES_ENABLED_KEY] ?? '') });
  }
  if (existsSync(CALC_RUNBOOK_FILE)) {
    const m = ENABLED_MARKER.exec(readFileSync(CALC_RUNBOOK_FILE, 'utf8'));
    if (m) out.push({ source: 'docs/insights-ui/tariffs/calculator-data-refresh.md (calc-enabled-chapters)', chapters: parseEnabledChapters(m[1]) });
  }
  return out;
}

export function chapterKey(n: number): string {
  return String(n).padStart(2, '0');
}

/** "<source> lists chapter 05, which is NOT READY: …" for every enabled chapter that isn't READY. */
export function enabledChapterProblems(report: CalcReadinessReport, sources: EnabledChapterSource[] = enabledChapterSources()): string[] {
  const problems: string[] = [];
  const byChapter = new Map(report.chapters.map((c) => [c.chapter, c]));
  for (const s of sources) {
    for (const n of s.chapters) {
      const c = byChapter.get(chapterKey(n));
      if (!c) problems.push(`${s.source} lists chapter ${n}, which has no HTS lines in program-coverage.json`);
      else if (c.status !== 'READY') problems.push(`${s.source} lists chapter ${n}, which is NOT READY: ${c.gaps.map(describeGap).join('; ')}`);
    }
  }
  return problems;
}

export function describeGap(g: ProgramGap): string {
  const heads = g.headings.length > 3 ? `${g.headings.slice(0, 3).join(', ')} +${g.headings.length - 3}` : g.headings.join(', ');
  const modelled = g.modelled === 'no' ? 'not modelled' : g.modelled === 'partial' ? `partly modelled (${g.linesNotModelled} not)` : 'modelled';
  const state = g.state === 'unknown' ? ', status unknown' : g.state === 'upcoming' ? `, starts ${g.startsOn}` : '';
  const waived = g.linesAccepted ? `, ${g.linesAccepted} accepted (${(g.acceptedBy ?? []).join(', ')})` : '';
  return `${g.program} [${heads}] ${g.linesAffected} line(s), ${modelled}${state}${waived}`;
}
