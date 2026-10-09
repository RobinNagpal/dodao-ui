// Plain-English glossary for the tariff chapter pages (issue #1784).
//
// One entry per term. `aliases` are the spellings searched for (whole words, case-insensitive) when the
// "Key terms on this page" block decides which entries a page needs, so list every form the chapter
// content files use. Adding a term is a one-entry change here; no component change is needed.
//
// Keep `plain` to one or two sentences, factual and general: what the term means, not what a reader
// should do. Dated facts (an expiry, an end date) must match the chapter content files.

export interface GlossaryEntry {
  /** Stable kebab-case id, used by `glossaryEntry(id)`. */
  id: string;
  /** Display name. */
  term: string;
  /** Other spellings matched in page content (whole words, case-insensitive). `term` itself is always matched. */
  aliases: string[];
  /** One or two plain-English sentences. */
  plain: string;
}

export const TARIFF_GLOSSARY: GlossaryEntry[] = [
  {
    id: 'hts',
    term: 'HTS (HTSUS)',
    aliases: ['HTS', 'HTSUS', 'Harmonized Tariff Schedule', 'HTS code', 'tariff schedule'],
    plain:
      'The Harmonized Tariff Schedule of the United States: the official list that gives every imported product a 10-digit code and the duty rate for that code. The U.S. International Trade Commission publishes it and revises it several times a year.',
  },
  {
    id: 'chapter-99',
    term: 'Chapter 99',
    aliases: ['Chapter 99 heading', '9903'],
    plain:
      'The part of the tariff schedule that holds temporary extra duties, such as Section 232 and Section 301 tariffs, as 9903.xx.xx headings. A product is entered under its normal code plus the Chapter 99 heading that adds (or exempts it from) the extra duty.',
  },
  {
    id: 'base-rate',
    term: 'Base rate (General / MFN)',
    aliases: ['base rate', 'base rates', 'general rate', 'General column', 'MFN', 'most-favored-nation', 'normal trade relations', 'NTR'],
    plain:
      'The duty in the schedule\'s "General" column, paid by goods from most countries before any extra duty or trade-deal discount. It is also called the MFN (most-favored-nation) or normal-trade-relations rate.',
  },
  {
    id: 'column-2',
    term: 'Column 2',
    aliases: ['Column 2 rate', 'Column 2 rates'],
    plain:
      'A much higher set of rates in the schedule that applies only to countries without normal trade relations with the U.S.: currently Cuba, North Korea, Russia and Belarus. Goods from everywhere else never pay the Column 2 rate.',
  },
  {
    id: 'special-rate',
    term: 'Special / FTA rate',
    aliases: [
      'special rate',
      'Special column',
      'FTA rate',
      'FTA',
      'free trade agreement',
      'trade deal',
      'preference rate',
      'preference program',
      'preferences',
    ],
    plain:
      'The lower rate in the schedule\'s "Special" column for goods that qualify under a free trade agreement or preference program. It replaces the base rate only when the importer claims it and the goods meet that program\'s rules of origin.',
  },
  {
    id: 'spi',
    term: 'SPI code',
    aliases: ['SPI', 'SPI codes', 'Special Program Indicator', 'Special Program Indicators'],
    plain:
      'The short letter code (for example S for USMCA, D for AGOA, A for GSP) printed next to a special rate, naming the trade program that gives it. The importer puts the code on the entry to claim that rate.',
  },
  {
    id: 'ad-valorem',
    term: 'Ad valorem rate',
    aliases: ['ad valorem', 'ad valorem equivalent', 'percentage rate'],
    plain: 'A duty charged as a percentage of the goods’ customs value, such as 10%. A $10,000 shipment at 10% owes $1,000.',
  },
  {
    id: 'specific-rate',
    term: 'Specific (per-unit) rate',
    aliases: ['specific rate', 'per-unit rate', 'per-unit rates', 'per unit', '¢/kg', '¢/head', '¢/liter'],
    plain:
      'A duty charged per unit of quantity instead of on value, such as 68¢ per head or 1¢ per kg. The amount owed depends on how many units or kilograms are shipped, not on the price.',
  },
  {
    id: 'compound-rate',
    term: 'Compound rate',
    aliases: ['compound duty', 'compound rates'],
    plain:
      'A duty that combines a per-unit charge and a percentage, such as 40¢/kg + 10.4%. Both parts are paid, so the total needs the shipment’s quantity and its value.',
  },
  {
    id: 'in-place-of-base',
    term: '"In place of the base rate"',
    aliases: ['in place of base', 'in place of the base rate', 'replaces the base rate', 'replace the base rate'],
    plain:
      'The extra-duty rate is the total duty, not an addition: the base rate is not charged on top. For example, "15% in place of the base rate" means the goods pay 15% in total.',
  },
  {
    id: 'stacking',
    term: 'Stacking (additive duty)',
    aliases: ['stacking', 'stack', 'stacked', 'on top of the base rate', 'added to the base rate'],
    plain:
      'An extra duty that is added on top of the base rate, and sometimes on top of another extra duty. For example, a 2% base rate plus a +10% extra duty is 12% in total.',
  },
  {
    id: 'usmca',
    term: 'USMCA',
    aliases: ['USMCA-qualifying', 'USMCA claimed', 'United States–Mexico–Canada Agreement', 'qualifying goods'],
    plain:
      'The United States–Mexico–Canada Agreement, the free trade agreement with Canada and Mexico. Goods that meet its rules of origin ("qualifying") enter at the USMCA rate, often free and exempt from some extra duties, but only when the importer claims it (SPI "S") on the entry.',
  },
  {
    id: 'section-232',
    term: 'Section 232',
    aliases: ['Section 232 duty', 'Section 232 tariff'],
    plain:
      'A U.S. law (Trade Expansion Act of 1962) that lets the President put tariffs on imports the Commerce Department finds threaten national security. The duties are set by proclamation and listed in Chapter 99.',
  },
  {
    id: 'section-301',
    term: 'Section 301',
    aliases: ['Section 301 duty', 'Section 301 tariff', 'Section 301 tariffs'],
    plain:
      'A U.S. law (Trade Act of 1974) that lets the U.S. Trade Representative put tariffs on a country’s goods after finding that country’s trade practices unfair. Each action has its own country list, rates and exemption lists in Chapter 99.',
  },
  {
    id: 'section-122',
    term: 'Section 122',
    aliases: ['Section 122 surcharge', 'import surcharge'],
    plain:
      'A U.S. law (Trade Act of 1974) that allows a temporary import surcharge of up to 15% for up to 150 days. The 2026 Section 122 surcharge expired on July 23, 2026 and is no longer collected.',
  },
  {
    id: 'ieepa',
    term: 'IEEPA',
    aliases: ['IEEPA tariffs', 'IEEPA duties', 'International Emergency Economic Powers Act'],
    plain:
      'The International Emergency Economic Powers Act, the emergency law used for the 2025 country tariffs. Those IEEPA duties ended on February 24, 2026; their Chapter 99 headings can still appear in the schedule but are not collected.',
  },
  {
    id: 'chapter-98',
    term: 'Chapter 98 provision',
    aliases: ['Chapter 98', 'Chapter 98 provisions'],
    plain:
      'Special headings in Chapter 98 of the schedule (9801–9817) that give lower or zero duty to goods in particular situations, such as U.S. goods returned, items for repair, or goods covered by a trade agreement’s special rules, when their conditions are met.',
  },
  {
    id: 'cbp',
    term: 'CBP',
    aliases: ['U.S. Customs and Border Protection', 'Customs and Border Protection', 'U.S. Customs'],
    plain: 'U.S. Customs and Border Protection, the agency that clears imports, checks their classification and value, and collects duties and fees.',
  },
  {
    id: 'csms',
    term: 'CSMS',
    aliases: ['CSMS message', 'Cargo Systems Messaging Service'],
    plain:
      'The Cargo Systems Messaging Service: CBP’s official bulletins to importers and brokers explaining how to file and collect a new or changed duty, including which Chapter 99 heading to use.',
  },
  {
    id: 'federal-register',
    term: 'Federal Register',
    aliases: ['FR'],
    plain:
      'The U.S. government’s daily official journal, where proclamations, executive orders, agency rules and notices are published. A citation such as "91 FR 18183" means volume 91, page 18183.',
  },
  {
    id: 'us-note',
    term: 'U.S. note',
    aliases: ['U.S. notes', 'note 52', 'note 40', 'note 50', 'additional U.S. note', 'additional U.S. notes'],
    plain:
      'A numbered legal note in the schedule that sets the rules for a group of headings. In Chapter 99, each extra-duty action has its own note (for example U.S. note 52 for the 2026 Section 301 action) listing its rates, the covered countries and the exempt products.',
  },
  {
    id: 'gsp',
    term: 'GSP',
    aliases: ['Generalized System of Preferences'],
    plain:
      'The Generalized System of Preferences, a program that let goods from many developing countries enter duty-free (SPI "A" / "A+"). It expired on December 31, 2020 and has not been renewed, so GSP claims pay the base rate.',
  },
  {
    id: 'agoa',
    term: 'AGOA',
    aliases: ['African Growth and Opportunity Act'],
    plain:
      'The African Growth and Opportunity Act, a preference program (SPI "D") that lets qualifying goods from eligible sub-Saharan African countries enter duty-free. It was reauthorized in February 2026 through December 31, 2026.',
  },
  {
    id: 'cif',
    term: 'CIF',
    aliases: ['cost, insurance and freight'],
    plain:
      'Cost, insurance and freight: a value that includes the goods plus shipping and insurance to the destination. Trade statistics often report imports at CIF value; U.S. duty itself is charged on the transaction value, which excludes international freight and insurance.',
  },
  {
    id: 'fob',
    term: 'FOB',
    aliases: ['free on board'],
    plain:
      'Free on board: the value of goods loaded at the port of export, without international shipping or insurance. Export statistics are usually reported at FOB value.',
  },
  {
    id: 'mpf',
    term: 'MPF',
    aliases: ['merchandise processing fee'],
    plain:
      'The merchandise processing fee CBP charges on most formal imports: 0.3464% of the goods’ value, with a minimum and maximum per entry that CBP adjusts each fiscal year. Goods entered free under some trade agreements, including USMCA, are exempt.',
  },
  {
    id: 'hmf',
    term: 'HMF',
    aliases: ['harbor maintenance fee'],
    plain: 'The harbor maintenance fee: 0.125% of the goods’ value, charged only on shipments that arrive by sea at a U.S. port.',
  },
  {
    id: 'quota',
    term: 'Quota (tariff-rate quota)',
    aliases: ['quota', 'quotas', 'tariff-rate quota', 'TRQ', 'in-quota', 'over-quota'],
    plain:
      'A limit on the quantity that can enter at a given rate. Under a tariff-rate quota, imports up to the limit pay a low in-quota rate and anything above it pays a higher over-quota rate.',
  },
  {
    id: 'ad-cvd',
    term: 'AD/CVD',
    aliases: ['antidumping', 'anti-dumping', 'countervailing duty', 'countervailing duties', 'antidumping duty', 'antidumping duties'],
    plain:
      'Antidumping and countervailing duties: extra duties set by Commerce on a specific product from a specific country (and sometimes a specific maker) found to be sold below fair value or subsidized. They are not shown in the tariff schedule and are paid on top of all other duties.',
  },
  {
    id: 'landed-cost',
    term: 'Landed cost',
    aliases: ['landed costs', 'total landed cost'],
    plain: 'The full cost of getting goods to you: the purchase price plus shipping, insurance, duties, extra duties and customs fees such as MPF and HMF.',
  },
  {
    id: 'de-minimis',
    term: 'De minimis',
    aliases: ['de minimis exemption', 'Section 321'],
    plain:
      'The rule (Section 321) that let a low-value shipment, up to $800, enter the U.S. without duty. It has been suspended and is being phased out, so most commercial shipments now pay duty whatever their value. Check CBP’s current guidance before relying on it.',
  },
];

const BY_ID = new Map(TARIFF_GLOSSARY.map((entry) => [entry.id, entry]));

/** The entry with this id. Throws on an unknown id so a typo fails at build time, not silently. */
export function glossaryEntry(id: string): GlossaryEntry {
  const entry = BY_ID.get(id);
  if (!entry) throw new Error(`Unknown glossary term: ${id}`);
  return entry;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Whole-word, case-insensitive match. `\b` only works next to a word character, so an alias that starts
// with a symbol ("¢/kg", which follows a number as in "1¢/kg") has no start boundary.
function aliasPattern(alias: string): RegExp {
  const start = /^\w/.test(alias) ? '\\b' : '';
  const end = /\w$/.test(alias) ? '\\b' : '(?![A-Za-z0-9])';
  return new RegExp(`${start}${escapeRegExp(alias)}${end}`, 'i');
}

const PATTERNS: { entry: GlossaryEntry; patterns: RegExp[] }[] = TARIFF_GLOSSARY.map((entry) => ({
  entry,
  patterns: [entry.term, ...entry.aliases].map(aliasPattern),
}));

/** Glossary entries whose term or an alias appears in `text`, in glossary order. */
export function findGlossaryTerms(text: string): GlossaryEntry[] {
  return PATTERNS.filter(({ patterns }) => patterns.some((pattern) => pattern.test(text))).map(({ entry }) => entry);
}
