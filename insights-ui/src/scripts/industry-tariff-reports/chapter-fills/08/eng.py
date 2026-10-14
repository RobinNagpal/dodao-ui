# Country-independent authored content for Chapter 08: tariffEngineering + notes.
E = 'https://www.ecfr.gov/current/'
HTS_JSON = 'https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_21_json.json'
HTS_CH8 = 'https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%208'
HTS_CH99 = 'https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2099'
ACIR = 'https://acir.aphis.usda.gov/s/'
AMS8E = 'https://www.ams.usda.gov/rules-regulations/section8e'


def c(label, url):
    return {'label': label, 'url': url}


LEVERS = [
    {
        'id': 'usmca',
        'title': 'Claim USMCA on fruit and nuts from Mexico or Canada',
        'saves': 'The 10% Section 301 duty on goods of Mexico or Canada, plus the base rate (for example 11.2¢/kg on avocados, up to 29.8% on out-of-season cantaloupes)',
        'appliesTo': 'All 240 lines, for goods that originate under USMCA (fruit grown in Mexico or Canada is wholly obtained)',
        'document': 'A certification of origin from the importer, exporter or producer. It need not follow a set form; it can be on the invoice or another document, and CBP can ask for it.',
        'caveat': 'Without a valid claim, a Mexican or Canadian shipment pays the base rate plus 10% on the 163 lines that are not on the Section 301 exemption list. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.',
        'citations': [
            c('19 CFR 182.12', E + 'title-19/section-182.12'),
            c('HTSUS 9903.05.93 / 9903.05.94', HTS_JSON),
            c('USTR statement on the USMCA joint review (July 1, 2026)', 'https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review'),
        ],
    },
    {
        'id': 'fta',
        'title': 'Claim the free trade agreement rate (Chile, Peru, CAFTA-DR, Colombia and others)',
        'saves': 'The base rate: almost every dutiable Chapter 08 line is Free under the FTAs listed in its Special column (for example 24¢/kg on shelled almonds, 1.1¢/kg on strawberries, 11.2% on frozen strawberries)',
        'appliesTo': 'Lines whose Special column lists the partner (CL, PE, P, CO, AU, KR, IL, MA, PA and others)',
        'document': 'The FTA claim on the entry (SPI code) backed by the origin information the agreement requires.',
        'caveat': 'An FTA claim removes the base rate only. The 2026 Section 301 duty still applies to FTA goods (U.S. note 52(a) to Chapter 99 subchapter III): Chile, Peru, Colombia, Costa Rica and the Dominican Republic pay +12.5%, Guatemala and Honduras +10%, unless the line is on the exemption list.',
        'citations': [
            c('19 CFR 10.410 (Chile)', E + 'title-19/section-10.410'),
            c('19 CFR 10.903 (Peru)', E + 'title-19/section-10.903'),
            c('19 CFR 10.583 (CAFTA-DR)', E + 'title-19/section-10.583'),
            c('19 CFR 10.3003 (Colombia)', E + 'title-19/section-10.3003'),
            c('HTSUS Ch. 99, subch. III, U.S. note 52(a)', HTS_CH99),
        ],
    },
    {
        'id': 'season',
        'title': 'Time the entry: many fruit rates change with the calendar',
        'saves': 'The difference between the in-season and out-of-season rate, set by the date of entry: table grapes Free from April 1 to June 30 (else $1.13 or $1.80 per m³); pears and quinces Free April 1–June 30 (else 0.3¢/kg); plums Free January 1–May 31 (else 0.5¢/kg); watermelons 9% December 1–March 31 (else 17%); cantaloupes 12.8% August 1–September 15 (else 29.8%); other melons 5.4% December 1–May 31 (else 28%); strawberries 0.2¢/kg June 15–September 15 (else 1.1¢/kg)',
        'appliesTo': 'Lines split by entry period in headings 0804, 0805, 0806, 0807, 0808, 0809 and 0810',
        'document': 'None beyond the entry: the rate in force on the date of entry (or withdrawal from warehouse) applies.',
        'caveat': 'Perishable fruit rarely waits for a cheaper season; the split matters most for melons, where the gap is up to 17 points. The Section 301 duty does not change with the season.',
        'citations': [
            c('19 CFR 141.69', E + 'title-19/section-141.69'),
            c('HTSUS Chapter 8', HTS_CH8),
        ],
    },
    {
        'id': 's301-exempt',
        'title': 'Declare the Section 301 exemption for listed fruit and nuts',
        'saves': 'The whole 2026 Section 301 duty (+10% or +12.5%, and 10% or 12.5% in place of the base rate for the EU, Japan and others) on the 77 exempt lines; for Brazil also the 25% Brazil Section 301 duty',
        'appliesTo': 'Coconuts, Brazil nuts, cashews, chestnuts, macadamias, kola, areca and pine nuts, bananas and plantains, pineapples, avocados, mangoes and guavas, oranges, limes, papayas, quinces, kiwifruit, durians, tamarinds and other berries of 0810.90.27, lychee, dragon fruit and other 0810.90.46 fruit, several frozen tropical fruits and provisionally preserved pineapple (U.S. note 52(b)); etrogs (0805.90.01) and frozen tropical fruit nesoi (0811.90.80) on declaration (note 52(c))',
        'document': 'Report heading 9903.05.86 (listed subheadings) or 9903.05.87 (etrogs, frozen tropical fruit nesoi) with the Chapter 08 line; for 9903.05.87 the goods must match the description.',
        'caveat': 'Lemons, grapes, berries other than those listed, apples, cherries, almonds, walnuts, pistachios, dates, figs and dried fruit are not exempt. China still pays its older Section 301 List 3 or 4A duty on exempt lines.',
        'citations': [
            c('HTSUS Ch. 99, subch. III, U.S. note 52(b)–(c)', HTS_CH99),
            c('91 FR 47318 (USTR Section 301 notice)', 'https://www.federalregister.gov/documents/2026/07/28/2026-15181/notice-of-actions-in-section-301-investigations-of-acts-policies-and-practices-of-various-economies'),
        ],
    },
    {
        'id': 'sc6',
        'title': 'Send 8e-regulated fruit to processing under an SC-6 certificate',
        'saves': 'The Section 8e grade, size and quality inspection (and its fee) for avocados, grapefruit, oranges, table grapes, kiwifruit, fresh prunes, dates, hazelnuts, pistachios, raisins and dried prunes going to processing, animal feed or charity',
        'appliesTo': 'Fruit and nuts covered by 7 CFR part 944 and part 999',
        'document': 'An Importers Exempt Commodity Form (SC-6 certificate), filed electronically through AMS’s Compliance and Enforcement Management System (CEMS), ideally before the shipment arrives.',
        'caveat': 'This saves inspection, not duty. Pistachios still need the aflatoxin certificate, and APHIS and FDA rules still apply.',
        'citations': [
            c('7 CFR 944.350', E + 'title-7/section-944.350'),
            c('7 CFR 999.500', E + 'title-7/section-999.500'),
            c('USDA AMS: Section 8e exemptions (SC-6)', 'https://www.ams.usda.gov/rules-regulations/section8e/understanding-sc6'),
        ],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding ruling before you import',
        'saves': 'Certainty: a ruling fixes the line (fresh vs dried vs provisionally preserved, mixtures, frozen) before the goods arrive, and with it the base rate and whether the Section 301 exemption applies',
        'appliesTo': 'Any line where classification decides the rate, for example 0811 vs 0812 vs Chapter 20, or nut mixtures in 0813.50',
        'document': 'A ruling request to CBP describing the product and how it is processed and packed.',
        'caveat': 'A ruling applies to the transaction described; a different product or process may need its own.',
        'citations': [c('19 CFR part 177', E + 'title-19/part-177')],
    },
]

RULES = [
    {'id': 'aphis-fresh', 'agency': 'USDA APHIS', 'title': 'Fresh fruit: APHIS import permit, fruit and origin listed in ACIR, port inspection; most origins also need a phytosanitary certificate and some need treatment or a systems approach', 'citations': [c('7 CFR 319.56-3', E + 'title-7/section-319.56-3'), c('7 CFR 319.56-4', E + 'title-7/section-319.56-4'), c('APHIS ACIR database (approved fruit by country)', ACIR)]},
    {'id': 'aphis-treatment', 'agency': 'USDA APHIS', 'title': 'Fruit fly and other pest treatments: cold treatment, heat (vapor or hot water) or irradiation where ACIR requires it, under the PPQ Treatment Manual', 'citations': [c('7 CFR 305.2', E + 'title-7/section-305.2'), c('7 CFR 305.6 (cold)', E + 'title-7/section-305.6'), c('7 CFR 305.8 (heat)', E + 'title-7/section-305.8'), c('7 CFR 305.9 (irradiation)', E + 'title-7/section-305.9')]},
    {'id': 'aphis-pfa', 'agency': 'USDA APHIS', 'title': 'Pest-free areas: some fruit may come only from an area APHIS recognizes as free of a pest (for example fruit flies)', 'citations': [c('7 CFR 319.56-5', E + 'title-7/section-319.56-5')]},
    {'id': 'aphis-canada', 'agency': 'USDA APHIS', 'title': 'Fruit grown in Canada: no APHIS permit needed, but still subject to inspection', 'citations': [c('7 CFR 319.56-3(b)(1)(ii)', E + 'title-7/section-319.56-3'), c('7 CFR 319.56-10', E + 'title-7/section-319.56-10')]},
    {'id': 'aphis-dried', 'agency': 'USDA APHIS', 'title': 'Dried, cured or processed fruit and nuts (including raisins, cured figs and dates, nuts): no APHIS permit, except certain chestnuts and acorns', 'citations': [c('7 CFR 319.56-3(b)(1)(i)', E + 'title-7/section-319.56-3'), c('7 CFR 319.56-11', E + 'title-7/section-319.56-11')]},
    {'id': 'aphis-frozen', 'agency': 'USDA APHIS', 'title': 'Frozen fruit: imported under the general fruit rules and held under the frozen-product requirements of 7 CFR part 305', 'citations': [c('7 CFR 319.56-12', E + 'title-7/section-319.56-12'), c('7 CFR part 305', E + 'title-7/part-305')]},
    {'id': 'ams-avocado', 'agency': 'USDA AMS', 'title': 'Avocados: Section 8e grade and maturity requirements and AMS inspection (maturity schedule changed April 8, 2026)', 'citations': [c('7 CFR 944.28', E + 'title-7/section-944.28'), c('7 CFR 944.31', E + 'title-7/section-944.31'), c('91 FR 11131 (March 9, 2026)', 'https://www.federalregister.gov/documents/2026/03/09/2026-04584/avocados-grown-in-south-florida-and-imported-avocados-change-in-maturity-requirements')]},
    {'id': 'ams-citrus', 'agency': 'USDA AMS', 'title': 'Grapefruit and oranges: Section 8e grade, size and maturity requirements and AMS inspection', 'citations': [c('7 CFR 944.106', E + 'title-7/section-944.106'), c('7 CFR 944.312', E + 'title-7/section-944.312')]},
    {'id': 'ams-grapes', 'agency': 'USDA AMS', 'title': 'Table grapes: Section 8e grade and size requirements and AMS inspection', 'citations': [c('7 CFR 944.503', E + 'title-7/section-944.503')]},
    {'id': 'ams-raisins', 'agency': 'USDA AMS', 'title': 'Raisins: Section 8e grade requirements and inspection', 'citations': [c('7 CFR 999.300', E + 'title-7/section-999.300')]},
    {'id': 'ams-kiwi', 'agency': 'USDA AMS', 'title': 'Kiwifruit: Section 8e grade, size and maturity requirements and AMS inspection (size change proposed February 6, 2026)', 'citations': [c('7 CFR 944.550', E + 'title-7/section-944.550'), c('91 FR 5365 (proposed rule)', 'https://www.federalregister.gov/documents/2026/02/06/2026-02372/kiwifruit-grown-in-california-and-imported-kiwifruit-modification-of-handling-regulations')]},
    {'id': 'ams-prunes', 'agency': 'USDA AMS', 'title': 'Fresh prune-variety plums and dried prunes: Section 8e grade and size requirements and inspection', 'citations': [c('7 CFR 944.700 (fresh prunes)', E + 'title-7/section-944.700'), c('7 CFR 999.200 (dried prunes)', E + 'title-7/section-999.200')]},
    {'id': 'ams-dates', 'agency': 'USDA AMS', 'title': 'Dates (other than for processing): Section 8e grade requirements and inspection', 'citations': [c('7 CFR 999.1', E + 'title-7/section-999.1')]},
    {'id': 'ams-nuts', 'agency': 'USDA AMS', 'title': 'Hazelnuts: Section 8e grade and size requirements; pistachios: aflatoxin certificate from a USDA or USDA-accredited laboratory for each lot; walnut import regulation stayed since November 6, 2025', 'citations': [c('7 CFR 999.400 (filberts/hazelnuts)', E + 'title-7/section-999.400'), c('7 CFR 999.600 (pistachios)', E + 'title-7/section-999.600'), c('7 CFR 999.100 (walnuts, stayed)', E + 'title-7/section-999.100'), c('90 FR 45315 (walnut regulation stayed)', 'https://www.federalregister.gov/documents/2025/09/22/2025-18267/imported-walnuts-suspension-of-handling-regulations')]},
    {'id': 'ams-8e', 'agency': 'USDA AMS', 'title': 'Section 8e: imports of covered fruit and nuts must meet the grade, size, quality and maturity rules of the matching domestic marketing order while it is regulating; inspection fees charged per pound since March 20, 2025', 'citations': [c('USDA AMS: Section 8e & Imports', AMS8E), c('7 CFR 944.400', E + 'title-7/section-944.400'), c('89 FR 106231 (8e fee structure)', 'https://www.federalregister.gov/documents/2024/12/30/2024-31144/section-8e-import-inspection-fee-structure'), c('90 FR 8367 (effective date moved to March 20, 2025)', 'https://www.federalregister.gov/documents/2025/01/29/2025-01903/section-8e-import-inspection-fee-structure')]},
    {'id': 'fda-entry', 'agency': 'FDA', 'title': 'All food: prior notice before arrival, registered foreign facility (packing houses, processors), and a Foreign Supplier Verification Program kept by the U.S. importer', 'citations': [c('21 CFR part 1, subpart I (prior notice)', E + 'title-21/part-1/subpart-I'), c('21 CFR part 1, subpart H (registration)', E + 'title-21/part-1/subpart-H'), c('21 CFR part 1, subpart L (FSVP)', E + 'title-21/part-1/subpart-L'), c('FDA: FSVP rule', 'https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-foreign-supplier-verification-programs-fsvp-importers-food-humans-and-animals')]},
    {'id': 'fda-produce', 'agency': 'FDA', 'title': 'Fresh produce: the foreign farm must meet the Produce Safety Rule (the importer verifies this under FSVP)', 'citations': [c('21 CFR part 112', E + 'title-21/part-112'), c('FDA: Produce Safety Rule', 'https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-produce-safety')]},
    {'id': 'fda-trace', 'agency': 'FDA', 'title': 'Food Traceability List items (for example fresh melons, tropical tree fruits, fresh-cut fruit): key-event records; FDA will not enforce before July 20, 2028', 'citations': [c('21 CFR part 1, subpart S', E + 'title-21/part-1/subpart-S'), c('FDA: Food Traceability Rule (updated October 8, 2026)', 'https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-requirements-additional-traceability-records-certain-foods')]},
    {'id': 'nop-organic', 'agency': 'USDA AMS', 'title': 'Certified organic lines: an NOP Import Certificate for each organic shipment', 'citations': [c('7 CFR 205.273', E + 'title-7/section-205.273'), c('USDA AMS: organic international trade', 'https://www.ams.usda.gov/services/organic-certification/international-trade')]},
]

FRESH = ['aphis-fresh', 'aphis-treatment', 'aphis-pfa', 'aphis-canada']
FOOD = ['fda-entry']
GROUPS = {
    '0801': (['aphis-dried', 'aphis-fresh', 'fda-entry', 'nop-organic'], 'Dried coconut and shelled or in-shell nuts need no APHIS permit; fresh coconuts are fresh fruit under 7 CFR 319.56 (APHIS published a risk analysis for fresh coconuts from Belize on September 17, 2026). Every line here is Free and on the Section 301 exemption list.'),
    '0802': (['aphis-dried', 'ams-nuts', 'fda-entry', 'nop-organic'], 'Nuts are dried products for APHIS (chestnuts are the exception), but hazelnuts and pistachios meet Section 8e rules, and pistachios need an aflatoxin certificate per lot.'),
    '0803': (FRESH + ['fda-entry', 'fda-produce', 'nop-organic'], 'Fresh bananas and plantains enter under APHIS fruit rules; bananas are Free and exempt from the Section 301 duty.'),
    '0804': (FRESH + ['ams-avocado', 'ams-dates', 'fda-entry', 'fda-produce', 'fda-trace', 'nop-organic'], 'Avocados need an APHIS-approved origin listed in ACIR and meet Section 8e grade and maturity rules; mangoes from many origins need a hot-water or irradiation treatment. Dates and dried figs are dried products for APHIS; dates also meet Section 8e rules.'),
    '0805': (FRESH + ['ams-citrus', 'fda-entry', 'fda-produce', 'nop-organic'], 'Grapefruit and oranges meet Section 8e rules. Citrus from many origins needs a fruit fly treatment or pest-free area; lemons and limes are not 8e commodities.'),
    '0806': (FRESH + ['ams-grapes', 'ams-raisins', 'fda-entry', 'fda-produce', 'nop-organic'], 'Fresh table grapes meet Section 8e rules and, from some origins, cold treatment or fumigation; raisins are a dried product for APHIS but meet Section 8e grade rules.'),
    '0807': (FRESH + ['fda-entry', 'fda-produce', 'fda-trace', 'nop-organic'], 'Melons are on the FDA Food Traceability List. Rates depend on the entry date (watermelons 9% or 17%, cantaloupes 12.8% or 29.8%).'),
    '0808': (FRESH + ['fda-entry', 'fda-produce', 'nop-organic'], None),
    '0809': (FRESH + ['ams-prunes', 'fda-entry', 'fda-produce', 'nop-organic'], 'Fresh prune-variety plums meet Section 8e rules; cherries and stone fruit from some origins need cold treatment or a systems approach.'),
    '0810': (FRESH + ['ams-kiwi', 'fda-entry', 'fda-produce', 'fda-trace', 'nop-organic'], 'Kiwifruit meets Section 8e rules. Berries, lychee, rambutan and dragon fruit often need a treatment (irradiation or cold) depending on origin; tropical tree fruits are on the FDA Food Traceability List.'),
    '0811': (['aphis-frozen', 'fda-entry', 'nop-organic'], 'Frozen fruit enters under 7 CFR 319.56-12; frozen tropical fruit nesoi (0811.90.80) can claim the Section 301 exemption under 9903.05.87.'),
    '0812': (['aphis-dried', 'fda-entry'], 'Fruit provisionally preserved (for example cherries in brine) and unsuitable for eating as entered.'),
    '0813': (['aphis-dried', 'ams-prunes', 'ams-dates', 'fda-entry', 'nop-organic'], 'Dried prunes meet Section 8e rules; dried apricots, apples, berries and mixtures need FDA entry only.'),
    '0814': (['aphis-dried', 'fda-entry'], 'Dried or brined citrus peel is a processed product; fresh peel follows the fresh-fruit rules.'),
}

CHAPTER_NOTES = (
    "**Note 1.** This chapter does not cover inedible nuts or fruit.\n\n"
    "**Note 2.** Chilled fruit and nuts are to be classified in the same headings as the corresponding fresh fruit and nuts.\n\n"
    "**Note 3.** Dried fruit or dried nuts of this chapter may be partially rehydrated, or treated for the following purposes: (a) for additional preservation or stabilization (for example, by moderate heat treatment, sulfuring, the addition of sorbic acid or potassium sorbate); (b) to improve or maintain their appearance (for example, by the addition of vegetable oil or small quantities of glucose syrup), provided that they retain the character of dried fruits or dried nuts.\n\n"
    "**Note 4.** Heading 0812 applies to fruit and nuts which have been treated solely to ensure their provisional preservation during transport or storage prior to use (for example, by sulfur dioxide gas, in brine, in sulfur water or in other preservative solutions), provided they remain unsuitable for immediate consumption in that state."
)
US_NOTES = "**Additional U.S. Note 1.** No allowance shall be made for dirt or other impurities in nuts of any kind, shelled or not shelled."
