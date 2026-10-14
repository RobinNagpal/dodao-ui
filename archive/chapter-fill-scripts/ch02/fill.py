#!/usr/bin/env python3
"""Fill the writer TODOs of src/tariff-data/chapters/02-meat-and-offal.json (issue #1803)."""
import json
import sys

ROOT = '/Users/robin/projects/worktrees/chapter-content-generator/insights-ui'
FILE = f'{ROOT}/src/tariff-data/chapters/02-meat-and-offal.json'
REF = f'{ROOT}/src/tariff-data/chapters/01-live-animals.json'
TODAY = '2026-10-11'

d = json.load(open(FILE))
ref = json.load(open(REF))
ref_src = {s['id']: s for s in ref['tariffUpdates']['sources']}

d['asOf'] = TODAY
HTS_CH2 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%202'
HTS_CH98 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
HTS_CH99 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
HTS_JSON = 'https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_21_json.json'


def ecfr(title, section):
    return f'https://www.ecfr.gov/current/title-{title}/section-{section}'


def ecfr_part(title, part):
    return f'https://www.ecfr.gov/current/title-{title}/part-{part}'


# ---------------------------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------------------------
NEW_SOURCES = {
    'hts-ch2': {
        'id': 'hts-ch2',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 2',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 2: Meat and Edible Meat Offal',
        'signed': None,
        'published': '2026-10-07',
        'url': HTS_CH2,
    },
    'hts-ch98': {
        'id': 'hts-ch98',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 98',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 98',
        'signed': None,
        'published': '2026-10-07',
        'url': HTS_CH98,
    },
    'proc-11010': {
        'id': 'proc-11010',
        'publisher': 'Federal Register',
        'citation': '91 FR 7107',
        'document': 'Proclamation 11010',
        'title': 'Ensuring Affordable Beef for the American Consumer',
        'signed': '2026-02-06',
        'published': '2026-02-13',
        'url': 'https://www.federalregister.gov/documents/2026/02/13/2026-03050/ensuring-affordable-beef-for-the-american-consumer',
    },
    'proc-11059': {
        'id': 'proc-11059',
        'publisher': 'Federal Register',
        'citation': '91 FR 55989',
        'document': 'Proclamation 11059',
        'title': 'Further Ensuring Affordable Beef for the American Consumer',
        'signed': '2026-08-26',
        'published': '2026-08-31',
        'url': 'https://www.federalregister.gov/documents/2026/08/31/2026-17842/further-ensuring-affordable-beef-for-the-american-consumer',
    },
    'ustr-beef-trq-uk': {
        'id': 'ustr-beef-trq-uk',
        'publisher': 'Federal Register',
        'citation': '90 FR 61497',
        'document': 'Notice (USTR)',
        'title': 'Modification of the Allocation of the WTO Tariff-Rate Quota Volumes for Beef',
        'signed': None,
        'published': '2025-12-31',
        'url': 'https://www.federalregister.gov/documents/2025/12/31/2025-24120/modification-of-the-allocation-of-the-wto-tariff-rate-quota-volumes-for-beef',
    },
    'ustr-ausfta-2026': {
        'id': 'ustr-ausfta-2026',
        'publisher': 'Federal Register',
        'citation': '91 FR 16080',
        'document': 'Notice (USTR)',
        'title': 'Publication of 2026 Tariff-Rate Quota Quantitative Limits Under the United States-Australia Free Trade Agreement',
        'signed': None,
        'published': '2026-03-31',
        'url': 'https://www.federalregister.gov/documents/2026/03/31/2026-06207/publication-of-2026-tariff-rate-quota-quantitative-limits-under-the-united-states-australia-free',
    },
    'eo-14360': {
        'id': 'eo-14360',
        'publisher': 'Federal Register',
        'citation': '90 FR 54091',
        'document': 'Executive Order 14360',
        'title': 'Modifying the Scope of the Reciprocal Tariffs With Respect to Certain Agricultural Products',
        'signed': '2025-11-14',
        'published': '2025-11-25',
        'url': 'https://www.federalregister.gov/documents/2025/11/25/2025-21203/modifying-the-scope-of-the-reciprocal-tariffs-with-respect-to-certain-agricultural-products',
    },
    'eo-14361': {
        'id': 'eo-14361',
        'publisher': 'Federal Register',
        'citation': '90 FR 54467',
        'document': 'Executive Order 14361',
        'title': 'Modifying the Scope of Tariffs on the Government of Brazil',
        'signed': '2025-11-20',
        'published': '2025-11-26',
        'url': 'https://www.federalregister.gov/documents/2025/11/26/2025-21417/modifying-the-scope-of-tariffs-on-the-government-of-brazil',
    },
    'eo-14323': {
        'id': 'eo-14323',
        'publisher': 'Federal Register',
        'citation': '90 FR 37739',
        'document': 'Executive Order 14323',
        'title': 'Addressing Threats to the United States by the Government of Brazil',
        'signed': '2025-07-30',
        'published': '2025-08-05',
        'url': 'https://www.federalregister.gov/documents/2025/08/05/2025-14896/addressing-threats-to-the-united-states-by-the-government-of-brazil',
    },
    'eo-14425': {
        'id': 'eo-14425',
        'publisher': 'Federal Register',
        'citation': '91 FR 57765',
        'document': 'Executive Order 14425',
        'title': "Supporting America's Ranchers",
        'signed': '2026-09-04',
        'published': '2026-09-10',
        'url': 'https://www.federalregister.gov/documents/2026/09/10/2026-18571/supporting-americas-ranchers',
    },
    'fsis-usa-label': {
        'id': 'fsis-usa-label',
        'publisher': 'Federal Register',
        'citation': '89 FR 19470',
        'document': 'Final rule (USDA FSIS)',
        'title': 'Voluntary Labeling of FSIS-Regulated Products With U.S.-Origin Claims',
        'signed': None,
        'published': '2024-03-18',
        'url': 'https://www.federalregister.gov/documents/2024/03/18/2024-05479/voluntary-labeling-of-fsis-regulated-products-with-us-origin-claims',
    },
    'aphis-fmd-hu-sk': {
        'id': 'aphis-fmd-hu-sk',
        'publisher': 'USDA APHIS',
        'citation': 'APHIS import alert (March 27, 2025)',
        'document': 'Import alert',
        'title': 'UPDATE: Import Alert: Foot-and-Mouth Disease Restrictions for Animal Commodities Originating from or Transiting Hungary, Slovakia, and/or Austria',
        'signed': None,
        'published': '2025-03-27',
        'url': 'https://content.govdelivery.com/accounts/USDAAPHIS/bulletins/3d92d28',
    },
}
for sid in [
    'eo-14257',
    'eo-14193',
    'eo-14194',
    'eo-14325',
    'eo-14389',
    'scotus-24-1287',
    'csms-67834313',
    'procl-11012',
    'procl-11046',
    'procl-11047',
    'procl-11048',
    'ustr-usmca-review',
    'fr-hpai-28day',
]:
    NEW_SOURCES[sid] = ref_src[sid]

tu = d['tariffUpdates']
have = {s['id'] for s in tu['sources']}
for sid, s in NEW_SOURCES.items():
    if sid not in have:
        tu['sources'].append(s)
src_by_id = {s['id']: s for s in tu['sources']}

# ---------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------
o = d['overview']
o['h1'] = 'HTS Chapter 02: Meat and Edible Meat Offal — Tariff Rates'
o['seo'] = {
    'title': 'HTS Chapter 02: Meat and Edible Meat Offal — Tariff Rates & Import Duties | KoalaGains',
    'shortDescription': (
        'Complete searchable duty table for all 166 HTS Chapter 02 tariff lines — beef, pork, lamb, goat, chicken, turkey, offal, '
        'bacon and ham. General, FTA and Column 2 rates, the beef tariff-rate quota and the 2026 Section 301 duties by country.'
    ),
    'keywords': [
        'HTS Chapter 02',
        'meat and edible meat offal tariff',
        'beef import tariff',
        'beef tariff rate quota',
        'HTS 0201 duty rate',
        'HTS 0202 frozen beef duty',
        'pork import duty',
        'lamb import tariff',
        'chicken meat HS code',
        'meat tariffs 2026',
    ],
}
o['intro'] = (
    'Chapter 02 covers meat and edible offal — fresh, chilled or frozen beef, pork, lamb, goat, poultry and game, plus salted, '
    'dried or smoked meat such as bacon and ham. Its **166 tariff lines** mostly carry small printed rates (0.7¢/kg on lamb, '
    '1.4¢/kg on processed pork, Free on offal), with one big exception: **beef above the tariff-rate quota pays 26.4%** instead of '
    '4.4¢/kg.\n\n'
    'Beef is three-quarters of the trade — $13.42B of the $18.16B the U.S. imported in 2025 — and beef and bovine offal (73 lines) are '
    '**exempt from the 2026 Section 301 tariffs**, so for beef the base rate and the quota decide the cost. Every other meat from one of '
    'the 60 Section 301 economies pays an extra duty since **July 24, 2026**: 10% in total for the EU, +10% or +12.5% for most others, '
    '+20% or more for China and +37.5% for Brazil. USMCA-qualifying meat from Canada and Mexico enters free. Whether a shipment can enter '
    'at all is decided by USDA: the exporting country and plant must be approved by FSIS, and APHIS disease rules apply.'
)
for st in o['stats']:
    if st['label'].startswith('Lines with an extra duty'):
        st['note'] = (
            'Section 301. Beef and bovine offal (73 lines) are exempt from the 2026 and Brazil actions, so only China\'s older lists reach them; '
            'USMCA goods exempt'
        )

BLURBS = {
    '0201': (
        'Fresh or chilled beef and veal. In-quota beef (lines "described in additional U.S. note 3" or general note 15) pays 4.4¢/kg, '
        'processed cuts 4% or 10%; above the country\'s quota the "Other" lines pay 26.4%. Exempt from the 2026 Section 301 duties.',
        ['beef', 'steak', 'veal', 'ribeye', 'brisket', 'chuck', 'loin', 'bison', 'organic beef', 'wagyu'],
    ),
    '0202': (
        'Frozen beef — the largest group in the chapter ($6.53B in 2025). Same split as fresh beef: 4.4¢/kg in quota, 26.4% over quota. '
        'Lean beef trimmings for ground beef (0202.30.50.91/.97) have extra in-quota room in 2026.',
        ['frozen beef', 'beef trimmings', 'ground beef', 'boneless beef', 'beef cuts', 'veal'],
    ),
    '0203': (
        'Pork. Carcasses and unprocessed cuts are Free; "processed" cuts (ground, diced, made ready for retail) pay 1.4¢/kg. '
        'The Section 301 duty for the country of origin applies on top.',
        ['pork', 'ham', 'pork belly', 'spare ribs', 'pork shoulder', 'pork loin', 'pork chops'],
    ),
    '0204': (
        'Lamb pays 0.7¢/kg, mutton and other sheep meat 2.8¢/kg, and goat meat is Free. Australia and New Zealand supply almost all of it; '
        'both pay +12.5% under Section 301.',
        ['lamb', 'mutton', 'sheep meat', 'goat meat', 'lamb chops', 'leg of lamb', 'lamb rack'],
    ),
    '0205': ('Horse, ass, mule and hinny meat: one line, Free at the base rate.', ['horse meat', 'horsemeat', 'donkey meat']),
    '0206': (
        'Edible offal — tongues, livers, hearts, tripe and other organs of cattle, pigs, sheep and goats. Every line is Free; bovine offal is also '
        'exempt from the 2026 Section 301 duties, pork and lamb offal are not.',
        ['beef liver', 'beef tongue', 'tripe', 'oxtail', 'pork liver', 'offal', 'organ meat'],
    ),
    '0207': (
        'Chicken, turkey, duck, goose and guinea fowl. Whole birds pay 8.8¢/kg (turkeys 15¢/kg fresh), cuts and offal 17.6¢/kg, frozen '
        'turkeys valued 88¢/kg or more 10%.',
        ['chicken', 'chicken breast', 'chicken wings', 'chicken feet', 'turkey', 'duck', 'foie gras', 'goose'],
    ),
    '0208': (
        'Everything else: rabbit, game, camel, reptile and frog meat. Most lines are 6.4%; deer and frogs\' legs are Free, eviscerated quail '
        '7¢/kg. Whale and other marine-mammal meat cannot be imported.',
        ['rabbit', 'venison', 'deer meat', 'frog legs', 'quail', 'camel meat', 'alligator', 'kangaroo'],
    ),
    '0209': ('Pig fat and poultry fat, not rendered (fatback, lard before rendering): 3.2%.', ['pork fat', 'fatback', 'chicken fat', 'lard']),
    '0210': (
        'Salted, dried or smoked meat. Hams, bacon and other pork pay 1.4¢/kg, dried beef is Free and the rest 2.3%. Italian and Spanish '
        'cured hams pay the EU\'s 10% Section 301 rate instead.',
        ['bacon', 'prosciutto', 'serrano ham', 'jamón', 'cured ham', 'beef jerky', 'smoked meat', 'Canadian bacon'],
    ),
}
for g in o['productGroups']:
    g['blurb'], g['searchExamples'] = BLURBS[g['heading']]

o['workedExamples'] = [
    {
        'title': 'A container of frozen lean beef trimmings from Brazil',
        'line': '0202.30.50.97',
        'body': (
            '25,000 kg at $6/kg ($150,000). Brazil has no country allocation in the beef quota, so it uses the 52,005 t "other countries or '
            'areas" quantity — and from September 1 to November 30, 2026 the extra 300,000 t for lean trimmings (Proclamation 11059). '
            'In quota the rate is 4.4¢/kg: 25,000 × $0.044 = **$1,100**. Once the quota is filled the same beef enters under 0202.30.80 at '
            '26.4%: **$39,600**. Beef is exempt from both Brazil Section 301 duties (U.S. note 50(a)(ii) and note 52(b)).'
        ),
    },
    {
        'title': 'Frozen lamb legs from New Zealand',
        'line': '0204.42.20.20',
        'body': (
            '20,000 kg at $9/kg ($180,000). Lamb is 0.7¢/kg: 20,000 × $0.007 = **$140** base duty. New Zealand is one of the 60 Section 301 '
            'economies, so another 12.5% of value is added (9903.05.57): **$22,500**. The extra duty is 99% of the bill.'
        ),
    },
    {
        'title': 'Dry-cured hams from Italy',
        'line': '0210.11.00.10',
        'body': (
            '5,000 kg at $20/kg ($100,000). The base rate is 1.4¢/kg ($70), but EU goods whose base rate is under 10% pay **10% in total** '
            'instead (9903.05.39): **$10,000**. APHIS rules for pork from regions with African or classical swine fever (9 CFR 94.8, 94.31) '
            'decide whether the hams can be imported at all.'
        ),
    },
    {
        'title': 'Boneless beef from Australia',
        'line': '0202.30.50.97',
        'body': (
            'Australia has its own 378,214 t quota at Free under the Australia FTA (SPI **AU**). Beyond it, Australian beef can still enter free '
            'under 9822.04.01–9822.04.03: 71,695 t in 2026 (USTR, 91 FR 16080), then Free unless the price-based safeguard (17.1%) is triggered. '
            'Beef pays no Section 301 duty, so a qualifying Australian shipment usually pays **$0**.'
        ),
    },
]
o['tradeSnapshot']['effectiveDutyRateNote'] = 'Not shown: UN Comtrade reports trade values, not duty collected.'
o['tradeSnapshot']['coverageNote'] = (
    'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade; 2025 is the latest full year.'
)
o['notes'] = {
    'chapterNotes': (
        '**Note 1.** This chapter does not cover: (a) products of the kinds described in headings 0201 to 0208 or 0210, unfit or unsuitable '
        'for human consumption; (b) edible, non-living insects (heading 0410); (c) guts, bladders or stomachs of animals (heading 0504) or '
        'animal blood (heading 0511 or 3002); or (d) animal fat, other than products of heading 0209 (chapter 15).'
    ),
    'additionalUsNotes': (
        '**Note 1.** "Processed" covers meat ground or comminuted, diced or cut for stew meat, rolled and skewered, or specially processed into '
        'fancy cuts or otherwise made ready for the retail consumer. "High-quality beef cuts" are such cuts that meet the USDA specifications '
        'for Prime or Choice beef and are certified so before export by an official of the exporting country.\n\n'
        '**Note 2.** No allowance is made for bones, fat, hide or skin when assessing duty on meat; for meat in airtight containers with a '
        'specific rate, the dutiable weight is the entire contents.\n\n'
        '**Note 3.** The beef tariff-rate quota: (a) yearly in-quota quantities — Canada and Mexico no limit, Australia 378,214 t, New Zealand '
        '213,402 t, Argentina 20,000 t, Uruguay 20,000 t, United Kingdom 13,000 t, other countries or areas 52,005 t; (b) an extra 80,000 t '
        'of lean beef trimmings of Argentina from February 13 to December 31, 2026, at most 20,000 t a quarter (9903.54.01); (c) an extra '
        '300,000 t of lean beef trimmings of other countries or areas from September 1 to November 30, 2026, in three 100,000 t tranches '
        '(9903.54.02).'
    ),
}

# ---------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------
tu['h1'] = 'HTS Chapter 02: Meat and Edible Meat Offal — Tariff Updates'
tu['seo'] = {
    'title': 'HTS Chapter 02 Meat Tariff Updates — Beef Quota, Section 301 & What Changed Since 2025 | KoalaGains',
    'shortDescription': (
        'What changed for meat imports (HTS Chapter 02) since January 2025: the beef exemptions, the end of the IEEPA and Section 122 '
        'duties, the 2026 Section 301 tariffs, the bigger beef quotas for Argentina and lean trimmings, with Federal Register citations.'
    ),
    'keywords': [
        'HTS Chapter 02 tariff updates',
        'meat tariff changes 2026',
        'beef tariff exemption',
        'Argentina beef quota 80,000 tons',
        'lean beef trimmings quota',
        'Brazil beef tariff',
        'Section 301 tariff meat',
        'Section 122 surcharge meat',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current '
    '**2026 Revision 21** (in force October 9, 2026). On 160 of the 166 Chapter 02 lines the base rates are the same; the other six are a '
    'new statistical split of boneless beef into "certified organic" and "other" at unchanged rates.\n\n'
    'The changes came on top of the base rate. **Beef has been shielded from every new duty since November 13, 2025**: it was taken out of the '
    'reciprocal tariff and the 40% Brazil tariff, kept off the 10% Section 122 surcharge (February 24 – July 23, 2026), and is on the '
    'exemption list of the **2026 Section 301 tariffs**. Pork, lamb, poultry and the rest pay those Section 301 duties since **July 24, 2026**: '
    '10% in total for the EU, +10% or +12.5% for most others, +37.5% for Brazil and +20% or +37.5% for China. USMCA-qualifying meat from '
    'Canada and Mexico stays exempt. For beef the bigger news is the quota: **80,000 t more for Argentina** and **300,000 t more for lean '
    'trimmings** in 2026.'
)
tu['scope'] = (
    'Measures that reach Chapter 02 from any country: the 2026 Section 301 tariffs on 60 economies (with the beef exemption), the Brazil '
    'Section 301 tariff, the older China Section 301 lists, the Nicaragua Section 301 tariff that starts in 2027, the 2025–2026 IEEPA and '
    'Section 122 duties that have ended, the 2026 changes to the beef tariff-rate quota, and USDA rules that changed what can enter. For the '
    'rate each supplier pays, see Rates by country.'
)
for st in tu['stats']:
    if st['label'] == 'New or renumbered lines':
        st['note'] = 'Certified-organic split of boneless beef, same rates'
tu['stats'].append({'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'})

S301 = ['fr-2026-15181', 'fr-2026-15274', 'hts-chapter-99', 'hts-now']
BEEF_EX = (
    'Beef and veal (all of 0201 and 0202), bovine offal (0206.10–0206.29) and dried or salted beef (0210.20) are on the general exemption list '
    '(U.S. note 52(b), 9903.05.86): 73 of the 166 lines pay no Section 301 duty from any of the 60 economies.'
)
IE = {
    'au-section-301': (
        f'{BEEF_EX} Australian beef also has its own quota: 378,214 t at Free under the Australia FTA, then 71,695 t more in 2026 '
        '(9822.04.01), then Free unless the price-based safeguard (17.1%, 9822.04.02) applies. The 10% IEEPA reciprocal duty ended '
        'February 24, 2026 (beef was exempt from November 13, 2025).',
        'Australian beef pays nothing extra. Lamb, mutton and goat meat — $1.29B in 2025 — pay their base rate (Free with an Australia FTA '
        'claim) plus 12.5% of value: a $180,000 container of lamb owes about $22,500.',
        ['ustr-ausfta-2026', 'eo-14360', 'eo-14389'],
    ),
    'ca-section-301': (
        f'USMCA-qualifying goods entered free under USMCA pay no Section 301 duty (9903.05.93). {BEEF_EX} The 35% IEEPA duty on non-USMCA '
        'Canadian goods ended February 24, 2026. The 2026 Section 338 duties on Canadian alcoholic beverages, dairy and motor vehicles list no '
        'Chapter 02 line (U.S. note 51).',
        'USMCA-qualifying beef, pork and poultry from Canada pay $0. Non-qualifying pork pays its base rate plus 10% of value; non-qualifying '
        'beef pays only the base rate (4.4¢/kg in quota — Canada has no quota limit).',
        ['eo-14389', 'procl-11046', 'procl-11047', 'procl-11048'],
    ),
    'mx-section-301': (
        f'USMCA-qualifying goods entered free under USMCA pay no Section 301 duty (9903.05.94). {BEEF_EX} The 25% IEEPA duty on non-USMCA '
        'Mexican goods ended February 24, 2026.',
        'USMCA-qualifying Mexican beef and pork enter free. Meat that does not qualify pays the base rate, plus 10% of value unless it is beef '
        'or bovine offal. The New World screwworm port closures apply to live cattle, not to meat.',
        ['eo-14389'],
    ),
    'nz-section-301': (
        f'{BEEF_EX} New Zealand beef has a 213,402 t quota at 4.4¢/kg; beyond it the "Other" lines pay 26.4%. New Zealand has no FTA with the '
        'United States. The 15% IEEPA reciprocal duty ended February 24, 2026.',
        'Lamb from New Zealand pays 0.7¢/kg plus 12.5% of value; in-quota beef pays only 4.4¢/kg (about $0.02 per pound).',
        ['ustr-beef-trq-uk', 'eo-14389'],
    ),
    'br-section-301': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the forced-labor action from July 24, 2026 '
        f'(9903.05.27). Beef and bovine offal are on both exemption lists (U.S. note 50(a)(ii), 9903.05.03; U.S. note 52(b), 9903.05.86). '
        'The 2025 IEEPA duties on Brazil (10% reciprocal plus 40%) were lifted for beef on November 13, 2025 and ended for everything on '
        'February 24, 2026.',
        'Brazilian beef pays only the base rate: 4.4¢/kg inside the 52,005 t "other countries or areas" quota (and the 300,000 t lean-trimmings '
        'quota until November 30, 2026), 26.4% above it. Brazilian pork pays its base rate plus 37.5% of value.',
        ['eo-14361', 'eo-14389', 'proc-11059'],
    ),
    'uy-section-301': (
        f'{BEEF_EX} Uruguay has a 20,000 t beef quota at 4.4¢/kg; above it the "Other" lines pay 26.4%. The 10% IEEPA reciprocal duty ended '
        'February 24, 2026.',
        'Uruguayan beef pays the base rate only; lamb from Uruguay pays 0.7¢/kg plus 12.5% of value.',
        ['eo-14389'],
    ),
    'ni-section-301': (
        f'{BEEF_EX} With a CAFTA-DR claim (SPI P) every Chapter 02 base rate is Free, including the over-quota beef lines. The separate '
        'Nicaragua Section 301 duty (9903.89.01) is 0% in 2026, 10% in 2027 and 15% from 2028, and does not apply to goods that originate '
        'under CAFTA-DR (U.S. note 29).',
        'CAFTA-DR beef from Nicaragua — $424M in 2025 — pays $0 today. Pork or poultry from Nicaragua would pay 12.5% of value even with a '
        'CAFTA-DR claim.',
        ['fr-2025-22690', 'fr-2025-23892'],
    ),
    'ar-section-301': (
        f'{BEEF_EX} Argentina has a 20,000 t beef quota plus 80,000 t of lean beef trimmings in 2026 (February 13 – December 31, at most '
        '20,000 t a quarter, 9903.54.01), all at 4.4¢/kg; above that the "Other" lines pay 26.4%. The 10% IEEPA reciprocal duty ended '
        'February 24, 2026.',
        'Argentine beef pays 4.4¢/kg in quota — about $0.02 per pound — and nothing extra. Other Argentine meat pays its base rate plus 10%.',
        ['proc-11010', 'eo-14389'],
    ),
    'cl-section-301': (
        f'{BEEF_EX} With a U.S.–Chile FTA claim (SPI CL) every Chapter 02 base rate is Free, including over-quota beef, but the Section 301 '
        'duty still applies to the other lines (U.S. note 52(a)).',
        'Chilean chicken and turkey — $217M in 2025 — pay 12.5% of value; Chilean pork and lamb the same. Chilean beef pays $0.',
        [],
    ),
    'eu-section-301': (
        f'For EU goods whose base rate (or its ad valorem equivalent) is under 10%, the total is 10% (9903.05.39). {BEEF_EX} No other Chapter 02 '
        'line is on the EU exception list (9903.05.97). This replaced the 15% IEEPA reciprocal rate, which ended February 24, 2026.',
        'Italian prosciutto, Spanish jamón and Danish pork pay 10% of value in total: $10,000 on a $100,000 shipment. EU beef pays only its base '
        'rate, inside the 52,005 t "other countries or areas" quota or 26.4% above it.',
        ['eo-14389'],
    ),
    'jp-section-301': (
        f'Japanese goods with a base rate under 12.5% pay 12.5% in total (9903.05.49). {BEEF_EX} Japan has no country allocation in the beef '
        'quota (additional U.S. note 3), so Japanese beef uses the 52,005 t "other countries or areas" quantity.',
        'Wagyu beef from Japan pays 4.4¢/kg while the "other countries" quota is open and 26.4% once it is filled — no Section 301 duty either '
        'way. Any other Japanese meat pays 12.5% of value.',
        ['eo-14389'],
    ),
    'cn-section-301': (
        'Two Section 301 duties stack on most lines: +12.5% under the 2026 action (9903.05.31, from July 24, 2026) and +7.5% under List 4A '
        '(9903.88.15, 158 lines) or +25% under List 3 (9903.88.03, 8 lines — some pork, offal, rabbit, deer and frog meat and Canadian-style '
        'bacon). The 2026 beef exemption (U.S. note 52(b)) removes the 12.5% on beef but not the older List 4A duty. The IEEPA duty on China '
        'ended February 24, 2026.',
        'Meat from China pays its base rate plus 20% of value, or 37.5% on the List 3 lines; Chinese beef would pay its base rate plus 7.5%. '
        'Imports need FSIS approval of the exporting country and plant before any duty matters.',
        [],
    ),
    'other-section-301': (
        f'{BEEF_EX} Country exception lists in U.S. note 52(j) name no Chapter 02 line. Countries outside the 60 economies — for example '
        'Paraguay — pay no extra duty.',
        'Paraguayan beef ($290M in 2025) pays only its base rate; pork or lamb from a Section 301 economy such as Costa Rica pays 10% or 12.5% '
        'of value on top of the base rate.',
        [],
    ),
}
for e in tu['inEffect']:
    ex, what, extra = IE[e['id']]
    e['exemption'] = ex
    e['whatItMeans'] = what
    for sid in extra:
        if sid not in e['sourceIds']:
            e['sourceIds'].insert(len(e['sourceIds']) - 1, sid)
    if 'hts-ch2' not in e['sourceIds'] and e['id'] in ('au-section-301', 'nz-section-301', 'uy-section-301', 'ar-section-301', 'jp-section-301', 'br-section-301'):
        e['sourceIds'].insert(len(e['sourceIds']) - 1, 'hts-ch2')

gen = {c['id']: c for c in tu['changes']}


def ch(id, type, date, label, title, detail, before, now, countries, sids):
    return {
        'id': id,
        'type': type,
        'date': date,
        'dateLabel': label,
        'title': title,
        'detail': detail,
        'before': before,
        'now': now,
        'countries': countries,
        'sourceIds': sids,
    }


base = gen['base-rates']
base['title'] = 'No Chapter 02 base-rate changes'
base['detail'] = (
    '160 of 166 lines carry the same General, FTA and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition; none changed. '
    'Six lines are new: boneless beef under 0201.30.50, 0202.30.50 and 0202.30.80 is now reported as "certified organic" or "other", at the '
    'parent\'s rate (4.4¢/kg or 26.4%).'
)
s301 = gen['section-301-2026-60-economies-2026-07-24']
s301['title'] = 'Section 301 tariffs on 60 economies — beef exempt'
s301['detail'] = (
    '10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84), except beef, veal, bovine offal and dried beef (73 lines, U.S. note '
    '52(b), 9903.05.86). EU goods pay 10% in total and Japanese goods 12.5% in total when the base rate is lower. USMCA-qualifying goods from '
    'Canada and Mexico are exempt (9903.05.93, 9903.05.94). Pork, lamb, poultry, game and cured meat from these economies pay the duty.'
)
s301['now'] = '+10% / +12.5% (beef exempt)'
s301['countries'] = '60 economies'
br = gen['section-301-brazil-2026-07-22']
br['title'] = 'Section 301 tariff on products of Brazil — beef exempt'
br['detail'] = (
    '25% on goods of Brazil (9903.05.01). Beef, veal and bovine offal are on the exemption list (U.S. note 50(a)(ii), 9903.05.03). From July 24 '
    'the 12.5% forced-labor tariff (9903.05.27) stacks on top for other meat, which then pays 37.5%.'
)

changes = [
    ch(
        'ni-301',
        'pending',
        '2025-12-29',
        'Published',
        'Nicaragua Section 301 duty: 10% from 2027, 15% from 2028',
        'USTR set a phased duty on products of Nicaragua (9903.89.01): 0% in 2026, 10% from January 1, 2027 and 15% from January 1, 2028. It does '
        'not apply to goods that originate under CAFTA-DR (U.S. note 29), which covers most of the $444M of Nicaraguan meat — almost all beef.',
        '0%',
        '+10% (2027), +15% (2028)',
        'Nicaragua',
        ['fr-2025-22690', 'fr-2025-23892', 'hts-chapter-99'],
    ),
    base,
    ch(
        'hpai-28day',
        'pending',
        '2026-09-24',
        'Published',
        'Proposed: shorter HPAI waiting period for poultry meat',
        'APHIS proposed cutting the period in which birds and avian commodities — including poultry meat under 9 CFR 94.6 — may not have been '
        'exposed to highly pathogenic avian influenza before export to the United States from 90 days to 28 days. Comments are due November 23, '
        '2026; the 90-day rule still applies.',
        '90 days',
        '28 days (proposed)',
        'All',
        ['fr-hpai-28day'],
    ),
    ch(
        'cool-review',
        'pending',
        '2026-09-04',
        'Signed',
        'Review of mandatory country-of-origin labeling for beef',
        'Executive Order 14425 directs USDA, with USTR, to review within 90 days the authorities for mandatory country-of-origin labeling of '
        'beef and its economic impact, and allows USDA to propose a labeling rule. Nothing has changed yet for importers.',
        None,
        None,
        'All',
        ['eo-14425'],
    ),
    ch(
        'trim-300k',
        'reference',
        '2026-09-01',
        'Effective',
        'Extra 300,000 t quota for lean beef trimmings',
        'Proclamation 11059 adds 300,000 t of in-quota lean beef trimmings (0201.30.50.91/.97, 0202.30.50.91/.97) for "other countries or '
        'areas" — the suppliers without their own allocation, such as Brazil — in three 100,000 t tranches: September 1–30, October 1–30 and '
        'October 31 – November 30, 2026, first come, first served (9903.54.02). The President may end it if the beef is not sold at least 25% '
        'below the market price.',
        '26.4% once the quota is filled',
        '4.4¢/kg in quota',
        'Other countries or areas',
        ['proc-11059', 'hts-ch2', 'hts-now'],
    ),
    ch(
        'ca-338',
        'reference',
        '2026-08-22',
        'Effective',
        'Canada Section 338 duties do not reach meat',
        '50% duties on certain Canadian alcoholic beverages, dairy and motor vehicles (9903.03.12–9903.03.14) took effect. No Chapter 02 line is '
        'on the lists in U.S. note 51, so Canadian beef, pork and poultry are not affected.',
        None,
        None,
        'Canada',
        ['procl-11046', 'procl-11047', 'procl-11048', 'hts-now'],
    ),
    s301,
    ch(
        's122-end',
        'extraDuty',
        '2026-07-23',
        'Expired',
        'Section 122 import surcharge expired',
        'The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.',
        '+10%',
        'None',
        'All',
        ['procl-11012', 'hts-now'],
    ),
    br,
    ch(
        'usmca-review',
        'reference',
        '2026-07-01',
        'Announced',
        'USMCA joint review: not renewed, still in force',
        'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of '
        'the issues or until termination, so USMCA claims (SPI S) still apply to Canadian and Mexican meat.',
        None,
        None,
        'Canada, Mexico',
        ['ustr-usmca-review'],
    ),
    ch(
        's122-start',
        'extraDuty',
        '2026-02-24',
        'Effective',
        'Section 122 surcharge replaces the IEEPA tariffs — beef exempt',
        '10% on products of all countries (9903.03.01) until July 23, 2026. Beef, veal, bovine offal and dried beef were on the product exemption '
        'list (9903.03.03); pork, lamb, poultry and other meat paid it. USMCA-qualifying goods from Canada and Mexico were exempt (9903.03.07, '
        '9903.03.08).',
        'None',
        '+10% (until July 23, 2026)',
        'All',
        ['procl-11012', 'hts-now'],
    ),
    ch(
        'ieepa-end',
        'extraDuty',
        '2026-02-24',
        'Effective',
        'All IEEPA tariffs end',
        'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive '
        'Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 '
        'a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.',
        'Varied by country',
        'None',
        'All',
        ['scotus-24-1287', 'eo-14389', 'csms-67834313'],
    ),
    ch(
        'arg-80k',
        'reference',
        '2026-02-13',
        'Effective',
        'Extra 80,000 t beef quota for Argentina',
        'Proclamation 11010 adds 80,000 t of in-quota lean beef trimmings of Argentina for 2026 (on top of its 20,000 t), in four 20,000 t '
        'quarterly tranches from February 13 to December 31, 2026, first come, first served (9903.54.01).',
        '20,000 t',
        '100,000 t (2026)',
        'Argentina',
        ['proc-11010', 'hts-ch2', 'hts-now'],
    ),
    ch(
        'uk-csq',
        'reference',
        '2026-01-01',
        'Effective',
        'Beef quota: 13,000 t for the UK, "other countries" cut to 52,005 t',
        'USTR moved 13,000 t of the "other countries or areas" beef quota into a new country-specific quota for the United Kingdom, under the '
        'U.S.–UK Economic Prosperity Deal. Brazil, Japan, the EU and other suppliers without their own allocation now share 52,005 t instead of '
        '65,005 t.',
        '65,005 t (other countries)',
        '52,005 t (other countries) + 13,000 t (UK)',
        'United Kingdom, other countries',
        ['ustr-beef-trq-uk', 'hts-ch2'],
    ),
    ch(
        'usa-label',
        'reference',
        '2026-01-01',
        'Compliance date',
        '"Product of USA" labels now require U.S. born, raised, slaughtered and processed',
        'From January 1, 2026, meat and poultry labels may carry a voluntary "Product of USA" or "Made in the USA" claim only if the animal was '
        'born, raised, slaughtered and processed in the United States (9 CFR 412.3). Imported meat that is cut or packed in the United States can '
        'no longer use the claim.',
        None,
        None,
        'All',
        ['fsis-usa-label'],
    ),
    ch(
        'ag-exemption',
        'extraDuty',
        '2025-11-13',
        'Effective',
        'Beef taken out of the reciprocal tariff',
        'Executive Order 14360 added beef, veal, bovine offal and dried beef to the reciprocal-tariff exemption list (U.S. note 2(v)(iii), '
        '9903.01.32), for goods entered from 12:01 a.m. EST on November 13, 2025. Pork, lamb, poultry and other meat stayed subject until all '
        'IEEPA duties ended on February 24, 2026.',
        '+10% or more',
        'None for beef',
        'All countries subject to the reciprocal tariff',
        ['eo-14360', 'hts-now'],
    ),
    ch(
        'br-beef',
        'extraDuty',
        '2025-11-13',
        'Effective',
        'Brazilian beef freed from the 40% IEEPA duty',
        'Executive Order 14361 removed beef and other agricultural products from the 40% duty on Brazil (9903.01.77; exemption list 9903.01.81), '
        'effective for goods entered from November 13, 2025. Together with EO 14360 this ended an over-quota rate of 76.4% (26.4% + 10% + 40%) '
        'on Brazilian beef.',
        '+50% (10% + 40%)',
        'None for beef',
        'Brazil',
        ['eo-14361', 'eo-14360', 'hts-now'],
    ),
    ch(
        'br-40',
        'extraDuty',
        '2025-08-06',
        'Effective',
        '40% IEEPA duty on products of Brazil',
        'Executive Order 14323 (signed July 30, 2025) added 40% on goods of Brazil from August 6, 2025, on top of the 10% reciprocal duty. Beef '
        'was not exempt until November 13, 2025. Ended February 24, 2026.',
        'None',
        '+40% (ended)',
        'Brazil',
        ['eo-14323'],
    ),
    ch(
        'ca-amended',
        'extraDuty',
        '2025-07-31',
        'Signed',
        'Canada additional duty raised to 35%',
        'Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). USMCA-qualifying meat stayed exempt. Ended February 24, 2026.',
        '+25%',
        '+35% (ended)',
        'Canada',
        ['eo-14325'],
    ),
    ch(
        'reciprocal',
        'extraDuty',
        '2025-04-02',
        'Signed',
        'Reciprocal tariff on products of all countries',
        '10% baseline (9903.01.25) and country rates (9903.02.xx) on all meat, including beef until November 13, 2025; Canada and Mexico '
        'excluded. Ended February 24, 2026.',
        'None',
        '+10% or more (ended)',
        'All except Canada, Mexico',
        ['eo-14257'],
    ),
    ch(
        'fmd-hu-sk',
        'reference',
        '2025-02-02',
        'Effective',
        'Foot-and-mouth disease: pork and ruminant meat from Hungary and Slovakia restricted',
        'After foot-and-mouth disease was confirmed, APHIS restricted animal commodities from or through Hungary and Slovakia (from February 2, '
        '2025) and Austria (from February 24, 2025): unprocessed pork and ruminant products arriving as cargo are prohibited with limited '
        'exceptions; processed products need APHIS-compliant treatment or must be commercially cooked and shelf-stable. U.S. meat imports from '
        'Hungary fell from $12.1M in 2024 to $3.0M in 2025.',
        'Eligible',
        'Restricted',
        'Hungary, Slovakia, Austria',
        ['aphis-fmd-hu-sk'],
    ),
    ch(
        'mx-imposed',
        'extraDuty',
        '2025-02-01',
        'Signed',
        'Additional duty on products of Mexico',
        '+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.',
        'None',
        '+25% (ended)',
        'Mexico',
        ['eo-14194'],
    ),
    ch(
        'ca-imposed',
        'extraDuty',
        '2025-02-01',
        'Signed',
        'Additional duty on products of Canada',
        '+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, 2026.',
        'None',
        '+25% (ended)',
        'Canada',
        ['eo-14193'],
    ),
]
changes.sort(key=lambda c: c['date'], reverse=True)
tu['changes'] = changes
tu['lastCheckedAt'] = TODAY
# stats count of in-effect
for st in tu['stats']:
    if st['label'] == 'Extra duties in effect':
        st['value'] = str(len(tu['inEffect']))

# ---------------------------------------------------------------------------------------------
# Understand industry
# ---------------------------------------------------------------------------------------------
ui = d['understandIndustry']
ui['h1'] = 'HTS Chapter 02: Meat and Edible Meat Offal — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Meat Imports by Country & Product 2020–2025 — Beef, Pork, Lamb (HTS Ch. 02) | KoalaGains',
    'shortDescription': (
        'U.S. imports of meat and edible offal 2020–2025 by country, product and year: $18.16B in 2025, up 18.9%, led by beef from Australia, '
        'Canada, Mexico, New Zealand and Brazil.'
    ),
    'keywords': [
        'us beef imports by country',
        'us beef imports 2025',
        'us meat imports by country',
        'meat imports statistics',
        'us beef imports by year',
        'HTS Chapter 02 import statistics',
        'lamb imports Australia New Zealand',
    ],
}
ui['lastCheckedAt'] = TODAY
ui['effectiveDuty']['note'] = (
    'Duty paid is not reported by UN Comtrade, so no chapter-level duty figure is shown. Most beef enters in quota at 4.4¢/kg or free under '
    'USMCA and FTA claims; the over-quota 26.4% rate and the 2025–2026 extra duties are what raise the bill.'
)
ui['sources'] = [
    {'label': 'UN Comtrade (public API), United States imports, HS chapter 02 (retrieved October 2026)', 'url': 'https://comtradeplus.un.org/'},
    {'label': 'Proclamation 11059, Further Ensuring Affordable Beef for the American Consumer (91 FR 55989, August 31, 2026)', 'url': NEW_SOURCES['proc-11059']['url']},
    {'label': 'Proclamation 11010, Ensuring Affordable Beef for the American Consumer (91 FR 7107, February 13, 2026)', 'url': NEW_SOURCES['proc-11010']['url']},
    {'label': 'USDA APHIS import alert: foot-and-mouth disease in Hungary, Slovakia and Austria (March 27, 2025)', 'url': NEW_SOURCES['aphis-fmd-hu-sk']['url']},
]
ui['why'] = (
    'U.S. meat imports rose from **$15.27B in 2024 to $18.16B in 2025** (+18.9%), and almost all of the growth is **beef**: headings 0201 and '
    '0202 went from $10.76B to $13.42B (+24.7%) and are now 74% of the chapter. Australia (+27.8%), Uruguay (+47.1%), Argentina (+50.4%) and '
    'Paraguay (from $96M to $291M) grew fastest; pork (0203) was flat at $1.52B and lamb and goat meat (0204) rose 11.5% to $1.72B.\n\n'
    'The pull came from the U.S. side. The Administration\'s own beef proclamations describe a herd at its lowest level in 75 years after '
    'drought and wildfires, record ground-beef prices, and a 4% drop in U.S. beef output forecast for 2026 — which is why it widened the '
    'beef quota in 2026 (80,000 t more for Argentina, 300,000 t more for lean trimmings).\n\n'
    'Tariffs slowed little of it. Beef from most countries paid the 10% reciprocal duty from April 2025 until November 13, 2025, and '
    'Brazilian over-quota beef briefly paid 76.4%, yet Brazil still grew 21.9%. Since November 13, 2025 beef has been exempt from every new '
    'duty. Animal disease mattered more for small suppliers: imports from Hungary fell from $12.1M to $3.0M after APHIS restricted pork from '
    'foot-and-mouth-affected countries in February 2025. 2025 is the latest full year of U.S. trade data.'
)

# ---------------------------------------------------------------------------------------------
# Industry areas (rates by country)
# ---------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['seo'] = {
    'title': 'Meat Tariff Rates by Country — Beef, Pork, Lamb from Australia, Canada, Brazil, Mexico (HTS Ch. 02) | KoalaGains',
    'shortDescription': (
        'The total U.S. tariff on meat by country and product group: base rate plus the 2026 Section 301 duty, with USMCA, FTA and the beef '
        'exemption applied. Australia, Canada, Mexico, New Zealand, Brazil, Uruguay, Argentina, the EU, Japan and more.'
    ),
    'keywords': [
        'tariff on beef from australia',
        'tariff on beef from brazil',
        'tariff on canadian beef',
        'tariff on new zealand lamb',
        'tariff on beef from argentina',
        'meat tariff by country',
        'EU pork tariff 10%',
        'HTS Chapter 02 tariff rates by country',
    ],
}
ia['intro'] = (
    'The total rate on meat depends on **what it is and where it comes from**. Each cell below is the base rate for that product group plus '
    'the extra duty for that country, minus any preference — computed from the current tariff schedule with the same engine as the tariff '
    'calculator.\n\n'
    '**Beef and bovine offal pay no extra duty from any of the 60 Section 301 economies**, so for beef the base rate decides: 4.4¢/kg (or Free '
    'with an FTA or USMCA claim) inside the quota, 26.4% above it. Everything else from those economies pays the Section 301 duty since July 24, '
    '2026: **10% in total for the EU**, **+10% for Canada, Mexico and Argentina**, **+12.5% for Australia, New Zealand, Uruguay, Chile and '
    'Nicaragua**, +37.5% for Brazil. USMCA-qualifying meat from Canada and Mexico enters free, and Paraguay — outside the 60 — pays only the '
    'base rate.'
)
RULE_LABELS = {
    'Australia': (
        'Beef and bovine offal: no Section 301 duty (9903.05.86) and Free under the Australia FTA in quota. Other meat: base rate (Free with an AU '
        'claim) + 12.5% Section 301 (9903.05.23). The 26.4% shown on six over-quota beef lines is the general rate the calculator applies; '
        'Australian beef entered under 9822.04.01–9822.04.03 is Free up to 71,695 t in 2026 and Free beyond unless the price-based safeguard '
        '(17.1%) applies.',
        ['ustr-ausfta-2026', 'hts-ch2'],
    ),
    'Canada': (
        'USMCA-qualifying: free, no extra duty (9903.05.93). Otherwise base rate + 10% Section 301 (9903.05.29), except beef and bovine offal, '
        'which pay only the base rate (9903.05.86). The 35% IEEPA duty ended February 24, 2026.',
        ['eo-14389'],
    ),
    'Mexico': (
        'USMCA-qualifying: free, no extra duty (9903.05.94). Otherwise base rate + 10% Section 301 (9903.05.55), except beef and bovine offal, '
        'which pay only the base rate (9903.05.86). The 25% IEEPA duty ended February 24, 2026.',
        ['eo-14389'],
    ),
    'New Zealand': (
        'Base rate + 12.5% Section 301 (9903.05.57), except beef and bovine offal (9903.05.86). Beef pays 4.4¢/kg within New Zealand\'s '
        '213,402 t quota and 26.4% above it.',
        ['hts-ch2'],
    ),
    'Brazil': (
        'Base rate + 25% Brazil Section 301 (9903.05.01) + 12.5% forced-labor Section 301 (9903.05.27) = +37.5%, except beef and bovine offal, '
        'which are exempt from both (9903.05.03, 9903.05.86). Beef shares the 52,005 t "other countries or areas" quota; above it, 26.4%.',
        ['hts-ch2'],
    ),
    'Uruguay': (
        'Base rate + 12.5% Section 301 (9903.05.82), except beef and bovine offal (9903.05.86). Beef pays 4.4¢/kg within Uruguay\'s 20,000 t '
        'quota and 26.4% above it.',
        ['hts-ch2'],
    ),
    'Nicaragua': (
        'Free base rate with a CAFTA-DR claim (P) on every line, + 12.5% Section 301 (9903.05.58) except on beef and bovine offal (9903.05.86). '
        'The Nicaragua Section 301 duty (9903.89.01) is 0% in 2026 and does not apply to CAFTA-DR originating goods.',
        ['fr-2025-23892'],
    ),
    'Argentina': (
        'Base rate + 10% Section 301 (9903.05.22), except beef and bovine offal (9903.05.86). Beef pays 4.4¢/kg within Argentina\'s 20,000 t '
        'quota and the extra 80,000 t of lean trimmings in 2026, and 26.4% above them.',
        ['proc-11010', 'hts-ch2'],
    ),
    'Paraguay': (
        'Base rate only: Paraguay is not one of the 60 economies in the 2026 Section 301 action and has no FTA. Beef shares the 52,005 t "other '
        'countries or areas" quota; above it, 26.4%. The 10% IEEPA reciprocal duty ended February 24, 2026.',
        ['fr-2026-15181', 'eo-14389', 'hts-ch2'],
    ),
    'Chile': (
        'Free base rate with a U.S.–Chile FTA claim (CL) on every line, + 12.5% Section 301 (9903.05.30) except on beef and bovine offal '
        '(9903.05.86).',
        [],
    ),
    'Italy': (
        'EU: 10% in total in place of the base rate under Section 301 (9903.05.39), because every non-beef Chapter 02 base rate is under 10%. '
        'Beef and bovine offal pay only the base rate (9903.05.86) and share the "other countries or areas" quota.',
        [],
    ),
    'Denmark': (
        'EU: 10% in total in place of the base rate under Section 301 (9903.05.39), because every non-beef Chapter 02 base rate is under 10%. '
        'Beef and bovine offal pay only the base rate (9903.05.86).',
        [],
    ),
    'Spain': (
        'EU: 10% in total in place of the base rate under Section 301 (9903.05.39), because every non-beef Chapter 02 base rate is under 10%. '
        'Beef and bovine offal pay only the base rate (9903.05.86).',
        [],
    ),
    'Japan': (
        '12.5% in total in place of the base rate under Section 301 (9903.05.49) on non-beef lines. Beef (including wagyu) and bovine offal pay '
        'only the base rate (9903.05.86): 4.4¢/kg inside the "other countries or areas" quota, 26.4% above it.',
        ['hts-ch2'],
    ),
    'Any other country': (
        'Countries outside the 60 Section 301 economies pay only the base rate. The 60 pay +10% or +12.5% on non-beef lines (9903.05.20–'
        '9903.05.84), or 10%–12.5% in total for the EU, Japan, South Korea, Switzerland and Taiwan; China pays +20% (+37.5% on eight List 3 '
        'lines) and 7.5% even on beef (9903.88.15).',
        [],
    ),
}
for c in ia['countries']:
    label, extra = RULE_LABELS[c['country']]
    c['rule']['label'] = label
    for sid in extra:
        if sid not in c['rule']['sourceIds']:
            c['rule']['sourceIds'].insert(len(c['rule']['sourceIds']) - 1, sid)
    if c['country'] == 'Australia':
        for cell in c['cells'].values():
            for side in ('withUsmca', 'withoutUsmca'):
                for b in cell[side]['breakdown']:
                    if b['total'] == '26.4%' and b['preference'] == 'None':
                        b['preference'] = (
                            'Not priced here: Australia FTA beef under 9822.04.01–9822.04.03 is Free up to 71,695 t in 2026, then Free unless the '
                            'price-based safeguard (17.1%) applies'
                        )

ia['assumptions'] = [a for a in ia['assumptions'] if 'TODO' not in a]
ia['assumptions'] = [
    a
    if not a.startswith('Preferences:')
    else (
        'Preferences: USMCA (S) is applied for Canada and Mexico on the "USMCA-qualifying" side; AU for Australia; P (CAFTA-DR) for Nicaragua; '
        'CL for Chile. GSP (A, A+) has been expired since December 31, 2020 and is not applied. An FTA claim removes the base rate but not the '
        'Section 301 duty (U.S. note 52(a)).'
    )
    for a in ia['assumptions']
]
ia['assumptions'] += [
    'Beef: each beef group mixes in-quota lines (4.4¢/kg; processed cuts 4% or 10%) and over-quota "Other" lines (26.4%). Which one applies '
    'depends on whether the country\'s quota under additional U.S. note 3 to Chapter 2 is still open on the entry date; select a cell to see the '
    'lines.',
    'Australia\'s over-quota beef lines are shown at the 26.4% general rate because the Australia FTA rate for them sits in Chapter 98 '
    '(9822.04.01–9822.04.03) and the calculator does not price it. A qualifying Australian entry pays Free up to 71,695 t in 2026 (USTR, '
    '91 FR 16080) and Free beyond unless the price-based safeguard (17.1%) applies.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied.',
    'The rate is not the only gate: the exporting country and plant must be eligible with USDA FSIS, and APHIS disease rules (foot-and-mouth '
    'disease, swine fevers, avian influenza) can bar meat from a region regardless of the tariff.',
]
ia['exemptionCheck'] = (
    'Read U.S. notes 29, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. All beef and veal lines (0201, 0202), bovine offal '
    '(0206.10, 0206.21, 0206.22, 0206.29) and dried or salted beef (0210.20) are on the Section 301 general exemption list (note 52(b), '
    '9903.05.86) and the Brazil exemption list (note 50(a)(ii), 9903.05.03) — the same 73 lines that were exempt from the Section 122 surcharge '
    '(9903.03.03) and, from November 13, 2025, from the reciprocal and Brazil IEEPA duties. No other Chapter 02 line is on any exemption list, '
    'and the country lists in note 52(j) and the Canada Section 338 lists (note 51) name none. All Chapter 02 subheadings are on China Section '
    '301 List 3 (note 20(f), 8 subheadings) or List 4A (note 20(s)(i)). The Nicaragua duty (note 29) excludes CAFTA-DR originating goods.'
)
ia['lastCheckedAt'] = TODAY
ia_have = {s['id'] for s in ia['sources']}
for c in ia['countries']:
    for sid in c['rule']['sourceIds']:
        if sid not in ia_have:
            ia['sources'].append(src_by_id[sid])
            ia_have.add(sid)

# ---------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['seo'] = {
    'title': 'Importing Meat into the U.S.: FSIS & APHIS Rules, Beef Quota & Legal Ways to Lower Duty (HTS Ch. 02) | KoalaGains',
    'shortDescription': (
        'The documents and rules for each HTS Chapter 02 line — USDA FSIS eligibility and import inspection, APHIS disease rules, FDA prior '
        'notice for game meat, Fish & Wildlife — and the legal ways to pay less: the beef quota, USMCA and FTA claims, Chapter 98, drawback.'
    ),
    'keywords': [
        'importing meat into the us',
        'importing beef into the us',
        'FSIS import requirements meat',
        'foreign inspection certificate meat',
        'APHIS meat import restrictions',
        'beef tariff rate quota',
        'USMCA certification of origin beef',
        'duty drawback meat',
    ],
}
te['intro'] = (
    'For meat the first question is not the rate but **whether it can enter at all**. Beef, pork, lamb, goat, horse meat and poultry need a '
    'country and a plant that USDA FSIS has approved, a foreign inspection certificate, and FSIS reinspection at an approved import '
    'establishment; APHIS disease rules can close a region overnight. Game meat, rabbit and frogs\' legs fall under FDA instead, and wildlife '
    'rules add Fish & Wildlife.\n\n'
    'The ways to pay less are written into the schedule: **enter beef inside the quota** (4.4¢/kg instead of 26.4%), **claim USMCA or an FTA**, '
    'or use a **Chapter 98** provision when the purpose fits. Each depends on a document, listed below with its regulation.'
)
te['lastCheckedAt'] = TODAY
te['regulationsAsOf'] = '2026-10-08'
FSIS_EST = 'https://www.fsis.usda.gov/inspection/import-export/import-export-library/eligible-foreign-establishments'
te['rules'] = [
    {
        'id': 'fsis-eligibility',
        'agency': 'USDA FSIS',
        'title': 'Meat and poultry only from countries FSIS has found equivalent, and from establishments that country has certified',
        'citations': [
            {'label': '9 CFR 327.2 (meat)', 'url': ecfr(9, '327.2')},
            {'label': '9 CFR 381.196 (poultry)', 'url': ecfr(9, '381.196')},
            {'label': 'FSIS: Eligible Foreign Establishments', 'url': FSIS_EST},
        ],
    },
    {
        'id': 'fsis-certificate',
        'agency': 'USDA FSIS',
        'title': 'Foreign inspection certificate from the exporting country for every shipment',
        'citations': [
            {'label': '9 CFR 327.4 (meat)', 'url': ecfr(9, '327.4')},
            {'label': '9 CFR 381.197 (poultry)', 'url': ecfr(9, '381.197')},
        ],
    },
    {
        'id': 'fsis-reinspection',
        'agency': 'USDA FSIS',
        'title': 'Import inspection application and FSIS reinspection at an official import inspection establishment',
        'citations': [
            {'label': '9 CFR 327.5', 'url': ecfr(9, '327.5')},
            {'label': '9 CFR 327.6', 'url': ecfr(9, '327.6')},
            {'label': '9 CFR 381.198', 'url': ecfr(9, '381.198')},
            {'label': '9 CFR 381.199', 'url': ecfr(9, '381.199')},
        ],
    },
    {
        'id': 'fsis-labeling',
        'agency': 'USDA FSIS / CBP',
        'title': 'Labeling and origin marking: country of origin on containers; "Product of USA" only for U.S. born, raised, slaughtered and processed meat',
        'citations': [
            {'label': '9 CFR 327.14', 'url': ecfr(9, '327.14')},
            {'label': '9 CFR 412.3', 'url': ecfr(9, '412.3')},
            {'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')},
        ],
    },
    {
        'id': 'aphis-fmd',
        'agency': 'USDA APHIS',
        'title': 'Foot-and-mouth disease: no fresh ruminant or pork meat from affected regions; cured or cooked meat only under treatment conditions',
        'citations': [
            {'label': '9 CFR 94.1', 'url': ecfr(9, '94.1')},
            {'label': '9 CFR 94.4', 'url': ecfr(9, '94.4')},
            {'label': '9 CFR 94.11', 'url': ecfr(9, '94.11')},
            {'label': 'APHIS import alert: Hungary, Slovakia, Austria (March 27, 2025)', 'url': NEW_SOURCES['aphis-fmd-hu-sk']['url']},
        ],
    },
    {
        'id': 'aphis-sa-beef',
        'agency': 'USDA APHIS',
        'title': 'Fresh beef from Northern Argentina, listed Brazilian states and Paraguay, and beef and lamb from Uruguay: born, raised and slaughtered there, deboned, with FMD safeguards',
        'citations': [{'label': '9 CFR 94.29', 'url': ecfr(9, '94.29')}],
    },
    {
        'id': 'aphis-bse',
        'agency': 'USDA APHIS',
        'title': 'BSE: conditions on edible beef products by country risk category',
        'citations': [{'label': '9 CFR 94.18', 'url': ecfr(9, '94.18')}],
    },
    {
        'id': 'aphis-swine-fever',
        'agency': 'USDA APHIS',
        'title': 'African and classical swine fever: pork and pork products from affected regions only under processing or certification conditions',
        'citations': [
            {'label': '9 CFR 94.8 (ASF)', 'url': ecfr(9, '94.8')},
            {'label': '9 CFR 94.9 (CSF)', 'url': ecfr(9, '94.9')},
            {'label': '9 CFR 94.31 (EU CSF region)', 'url': ecfr(9, '94.31')},
        ],
    },
    {
        'id': 'aphis-avian',
        'agency': 'USDA APHIS',
        'title': 'Avian influenza and Newcastle disease: conditions on poultry and game-bird meat from affected regions; separate rules for the European Poultry Trade Region',
        'citations': [
            {'label': '9 CFR 94.6', 'url': ecfr(9, '94.6')},
            {'label': '9 CFR 94.28', 'url': ecfr(9, '94.28')},
            {'label': '91 FR 60521: proposed 28-day HPAI period (September 24, 2026)', 'url': NEW_SOURCES['fr-hpai-28day']['url']},
        ],
    },
    {
        'id': 'fda-food',
        'agency': 'FDA',
        'title': 'Game meat, rabbit, frogs\' legs and other meat outside USDA inspection: prior notice before arrival and a foreign supplier verification program',
        'citations': [
            {'label': '21 CFR 1.281', 'url': ecfr(21, '1.281')},
            {'label': '21 CFR 1.502', 'url': ecfr(21, '1.502')},
        ],
    },
    {
        'id': 'fws-wildlife',
        'agency': 'U.S. Fish & Wildlife Service',
        'title': 'Wildlife meat (reptiles, primates, frogs, wild game): Form 3-177 declaration and CITES permits for listed species',
        'citations': [
            {'label': '50 CFR 14.61', 'url': ecfr(50, '14.61')},
            {'label': '50 CFR part 23', 'url': ecfr_part(50, '23')},
        ],
    },
    {
        'id': 'marine-mammal',
        'agency': 'U.S. Fish & Wildlife Service / NOAA Fisheries',
        'title': 'Whale, dolphin, porpoise, manatee and dugong meat: importation prohibited under the Marine Mammal Protection Act',
        'citations': [
            {'label': '50 CFR 18.12', 'url': ecfr(50, '18.12')},
            {'label': '50 CFR 216.12', 'url': ecfr(50, '216.12')},
        ],
    },
    {
        'id': 'beef-trq',
        'agency': 'USTR / CBP',
        'title': 'Beef tariff-rate quota: in-quota lines only while the country\'s quantity is open (additional U.S. note 3 to Chapter 2)',
        'citations': [
            {'label': 'HTSUS Ch. 2, additional U.S. note 3', 'url': HTS_CH2},
            {'label': 'CBP: Quotas', 'url': 'https://www.cbp.gov/trade/quota'},
        ],
    },
]
te['levers'] = [
    {
        'id': 'beef-quota',
        'title': 'Enter beef inside the tariff-rate quota',
        'saves': 'The difference between 26.4% of value and 4.4¢/kg — about $39,000 on a $150,000 container of 25 t of beef',
        'appliesTo': 'Beef lines of 0201 and 0202 "described in additional U.S. note 3" (in quota) vs. the "Other" over-quota lines',
        'document': (
            'Entry under the in-quota subheading while your country\'s quantity is open: Australia 378,214 t, New Zealand 213,402 t, Argentina '
            '20,000 t (+80,000 t of lean trimmings in 2026), Uruguay 20,000 t, United Kingdom 13,000 t, everyone else 52,005 t (+300,000 t of '
            'lean trimmings, September 1 – November 30, 2026). Canada and Mexico have no limit.'
        ),
        'caveat': (
            'Quotas fill first come, first served; the "other countries or areas" quantity can fill early in the year. Check CBP\'s quota status '
            'before shipping — once a quota is full, the same beef pays 26.4%.'
        ),
        'citations': [
            {'label': 'HTSUS Ch. 2, additional U.S. note 3', 'url': HTS_CH2},
            {'label': 'Proclamation 11010 (91 FR 7107)', 'url': NEW_SOURCES['proc-11010']['url']},
            {'label': 'Proclamation 11059 (91 FR 55989)', 'url': NEW_SOURCES['proc-11059']['url']},
            {'label': 'CBP: Quotas', 'url': 'https://www.cbp.gov/trade/quota'},
        ],
    },
    {
        'id': 'usmca',
        'title': 'Claim USMCA on meat from Canada or Mexico',
        'saves': 'The base rate (up to 26.4% on beef) and the 10% Section 301 duty on non-beef meat',
        'appliesTo': 'All 166 lines, for goods that qualify as originating under USMCA',
        'document': (
            'A certification of origin from the importer, exporter or producer. It need not follow a prescribed format; it can be on the invoice '
            'or another document, and CBP can ask for it.'
        ),
        'caveat': (
            'Claiming without a valid certification exposes the entry to the duty plus penalties. The USMCA was not renewed at the July 1, 2026 '
            'joint review but remains in force.'
        ),
        'citations': [
            {'label': '19 CFR 182.12', 'url': ecfr(19, '182.12')},
            {'label': 'HTSUS 9903.05.93 / 9903.05.94', 'url': HTS_CH99},
            {'label': 'USTR statement on the USMCA joint review (July 1, 2026)', 'url': ref_src['ustr-usmca-review']['url']},
        ],
    },
    {
        'id': 'fta',
        'title': 'Claim a free trade agreement (Australia, Chile, CAFTA-DR and others)',
        'saves': (
            'The base rate — for beef and bovine offal the whole duty, including over-quota beef from Chile, Peru, Colombia, Korea or CAFTA-DR '
            'countries; for other meat the Section 301 duty stays'
        ),
        'appliesTo': 'Lines whose Special column lists the agreement (AU, BH, CL, CO, IL, JO, KR, MA, OM, P, PA, PE, SG)',
        'document': (
            'A claim on the entry with the agreement\'s certification or origin information — for example Chile (19 CFR 10.410, 10.411), '
            'CAFTA-DR (19 CFR 10.583) or Australia (19 CFR 10.703). Australian over-quota beef is claimed under 9822.04.01–9822.04.03.'
        ),
        'caveat': (
            'An FTA claim does not remove the 2026 Section 301 duty on non-beef meat (U.S. note 52(a)). Australia\'s FTA beef is Free up to '
            '71,695 t in 2026 and then Free unless the price-based safeguard (17.1%) applies.'
        ),
        'citations': [
            {'label': '19 CFR 10.410', 'url': ecfr(19, '10.410')},
            {'label': '19 CFR 10.583', 'url': ecfr(19, '10.583')},
            {'label': '19 CFR 10.703', 'url': ecfr(19, '10.703')},
            {'label': 'USTR: 2026 Australia FTA quantities (91 FR 16080)', 'url': NEW_SOURCES['ustr-ausfta-2026']['url']},
            {'label': 'HTSUS chapter 98, subchapter XXII', 'url': HTS_CH98},
        ],
    },
    {
        'id': 'high-quality-beef',
        'title': 'Certify processed in-quota beef as "high-quality beef cuts"',
        'saves': '4% instead of 10% of value on processed in-quota beef cuts',
        'appliesTo': 'Processed beef cuts 0201.20.02/.10, 0201.30.02/.10, 0202.20.02/.10, 0202.30.02/.10 (vs. the 10% "Other" processed lines)',
        'document': (
            'Certification before export by an official of the exporting country\'s government that the cuts meet the USDA specifications for '
            'Prime or Choice beef.'
        ),
        'caveat': 'Only for "processed" cuts entered in quota; ground, diced, stew or skewered beef does not qualify.',
        'citations': [{'label': 'HTSUS Ch. 2, additional U.S. note 1(b)', 'url': HTS_CH2}],
    },
    {
        'id': 'ch98',
        'title': 'Use a Chapter 98 provision when the facts fit',
        'saves': 'The base rate and the Section 301 duty: the provision below is Free',
        'appliesTo': 'U.S. meat that was exported and comes back without being processed abroad (for example a rejected export shipment)',
        'document': 'Proof that the goods are U.S. products returned unchanged, and FSIS clearance of the returned U.S.-inspected product.',
        'caveat': (
            'The 2026 Section 301 duties do not apply to goods properly entered under a Chapter 98 provision when CBP agrees the entry is '
            'appropriate, except 9802.00.40–9802.00.80 entries (U.S. note 52(a)). Returned meat must also meet 9 CFR 327.17.'
        ),
        'provisions': [
            {
                'code': '9801.00.10',
                'rate': 'Free',
                'text': 'Products of the United States returned after export without being advanced in value or improved in condition abroad',
            }
        ],
        'citations': [
            {'label': 'HTSUS chapter 98', 'url': HTS_JSON},
            {'label': '9 CFR 327.17', 'url': ecfr(9, '327.17')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a)', 'url': HTS_CH99},
        ],
    },
    {
        'id': 'drawback',
        'title': 'Claim drawback when imported meat is exported again',
        'saves': 'Up to 99% of the duties paid on meat that is exported or used to make exported products',
        'appliesTo': 'Any line, when the imported meat (or substitutable meat under the same 8-digit subheading) is exported',
        'document': 'A drawback claim with import and export records linking the two.',
        'caveat': 'Not every duty is eligible for drawback; confirm with CBP which duties on your entry can be refunded before pricing on it.',
        'citations': [{'label': '19 CFR 191.32', 'url': ecfr(19, '191.32')}],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding ruling before you import',
        'saves': 'Certainty: a ruling fixes the classification (processed vs. not, in-quota line, game vs. poultry) before the goods arrive',
        'appliesTo': 'Any line where the classification decides the rate',
        'document': 'A ruling request to CBP describing the product and the intended entry.',
        'caveat': 'Rulings apply to the transaction described; a different product may need its own.',
        'citations': [{'label': '19 CFR part 177', 'url': ecfr_part(19, '177')}],
    },
]
FSIS = ['fsis-eligibility', 'fsis-certificate', 'fsis-reinspection', 'fsis-labeling']
GROUP_RULES = {
    '0201': (FSIS + ['aphis-fmd', 'aphis-sa-beef', 'aphis-bse', 'beef-trq'], 'Beef from Argentina, Brazil, Paraguay and Uruguay enters under the FMD conditions of 9 CFR 94.29; in-quota lines need the country\'s quota to be open.'),
    '0202': (FSIS + ['aphis-fmd', 'aphis-sa-beef', 'aphis-bse', 'beef-trq'], 'Same rules as fresh beef. Lean trimmings (0202.30.50.91/.97) have the extra 2026 in-quota quantities.'),
    '0203': (FSIS + ['aphis-fmd', 'aphis-swine-fever'], 'Pork from a region with African or classical swine fever needs the processing or certification conditions in 9 CFR part 94.'),
    '0204': (FSIS + ['aphis-fmd', 'aphis-sa-beef'], 'Lamb and mutton from Uruguay enter under 9 CFR 94.29; Australia and New Zealand are the main suppliers.'),
    '0205': (FSIS + ['aphis-fmd'], 'Horses, asses and mules are amenable species, so equine meat needs FSIS eligibility like beef or pork.'),
    '0206': (FSIS + ['aphis-fmd', 'aphis-swine-fever', 'aphis-bse'], 'The disease rules follow the animal: bovine offal the beef and BSE rules, pork offal the swine-fever rules.'),
    '0207': (FSIS + ['aphis-avian'], 'Poultry products need a country and plant eligible for poultry specifically; avian-influenza restrictions can change by region.'),
    '0208': (['fda-food', 'fws-wildlife', 'marine-mammal', 'aphis-fmd', 'aphis-avian'], 'Depends on the animal: rabbit, deer, camel, frog and quail meat are FDA-regulated; reptile and primate meat also need Fish & Wildlife clearance; marine-mammal meat cannot be imported.'),
    '0209': (FSIS + ['aphis-swine-fever', 'aphis-avian'], None),
    '0210': (FSIS + ['aphis-fmd', 'aphis-swine-fever', 'aphis-bse'], 'Cured or cooked pork and beef from FMD or swine-fever regions must meet the treatment conditions (e.g. 9 CFR 94.4); primate, whale and reptile meat follow the wildlife rules.'),
}
for g in te['groups']:
    g['ruleIds'], g['note'] = GROUP_RULES[g['heading']]

LINE_RULES = {
    '0208.10.00.00': ['fda-food', 'aphis-fmd'],
    '0208.30.00.00': ['fda-food', 'fws-wildlife'],
    '0208.40.01.00': ['marine-mammal'],
    '0208.50.00.00': ['fda-food', 'fws-wildlife'],
    '0208.60.00.00': ['fda-food', 'aphis-fmd'],
    '0208.90.20.00': ['fda-food', 'aphis-fmd'],
    '0208.90.25.00': ['fda-food', 'fws-wildlife'],
    '0208.90.30.00': ['fda-food', 'aphis-avian'],
    '0208.90.91.00': ['fda-food', 'fws-wildlife', 'aphis-fmd'],
    '0209.10.00.00': FSIS + ['aphis-swine-fever'],
    '0209.90.00.00': FSIS + ['aphis-avian'],
    '0210.20.00.00': FSIS + ['aphis-fmd', 'aphis-bse'],
    '0210.91.00.00': ['fda-food', 'fws-wildlife'],
    '0210.92.01.00': ['marine-mammal'],
    '0210.93.00.00': ['fda-food', 'fws-wildlife'],
    '0210.99.20.00': FSIS + ['aphis-avian'],
    '0210.99.91.00': ['fda-food', 'aphis-fmd'],
}
row_by_hts = {r['hts']: r for r in o['rateTable']['rows'] if r['hts']}
QUOTA_HEADINGS = ('0201', '0202')
for l in te['lines']:
    h = l['heading']
    rules = LINE_RULES.get(l['hts'])
    if rules is None:
        rules = list(GROUP_RULES[h][0])
        if h == '0206':
            if l['hts'].startswith(('0206.10', '0206.2')):
                rules = FSIS + ['aphis-fmd', 'aphis-bse']
            elif l['hts'].startswith(('0206.30', '0206.4')):
                rules = FSIS + ['aphis-fmd', 'aphis-swine-fever']
            else:
                rules = FSIS + ['aphis-fmd']
        if h == '0210' and l['hts'].startswith('0210.1'):
            rules = FSIS + ['aphis-fmd', 'aphis-swine-fever']
        if h == '0204' and l['hts'].startswith('0204.50'):
            rules = FSIS + ['aphis-fmd']
    l['ruleIds'] = rules
    levers = ['usmca']
    special = (row_by_hts.get(l['hts']) or {}).get('effectiveSpecial') or ''
    if h in QUOTA_HEADINGS:
        levers.insert(0, 'beef-quota')
    if any(code in special for code in ('AU', 'CL', 'P,', 'PE', 'KR')) or '9822.04' in special:
        levers.append('fta')
    desc_path = ' '.join(l['ancestorPath']).lower()
    if h in QUOTA_HEADINGS and l['hts'][:10] in (
        '0201.20.02', '0201.20.04', '0201.20.10', '0201.20.30', '0201.30.02', '0201.30.04', '0201.30.10', '0201.30.30',
        '0202.20.02', '0202.20.04', '0202.20.10', '0202.20.30', '0202.30.02', '0202.30.04', '0202.30.10', '0202.30.30',
    ):
        levers.append('high-quality-beef')
    if l['hts'] not in ('0208.40.01.00', '0210.92.01.00'):
        levers += ['ch98', 'drawback']
    levers.append('ruling')
    l['leverIds'] = levers

te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations — not legal advice. Eligibility and disease restrictions change with '
    'conditions in the exporting country; check FSIS and APHIS before each shipment.'
)

# ---------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['seo'] = {
    'title': 'Meat & Beef Tariffs FAQ: Australia, Brazil, Argentina, Canada Beef, Lamb, HS Codes (HTS Ch. 02) | KoalaGains',
    'shortDescription': (
        'Answers to what people actually search about meat tariffs: the tariff on beef from Australia, Brazil, Argentina and Canada, the beef '
        'import quota, lamb from New Zealand, HS codes for beef, chicken and pork, and how to import meat into the U.S.'
    ),
    'keywords': [
        'tariff on beef from australia',
        'tariff on beef from brazil',
        'current tariff on brazilian beef',
        'tariff on beef from argentina',
        'argentina beef import quota',
        'tariff on canadian beef',
        'tariff on beef imports',
        'are there tariffs on meat',
        'tariff on new zealand lamb',
        'hs code for beef',
        'hs code for chicken meat',
        'importing meat into the us',
    ],
}
fc['intro'] = (
    'Straight answers to the most common questions about importing meat into the U.S. — beef tariffs by country, the beef quota, lamb, HS '
    'codes and entry requirements. Each answer links to the page with the full detail.'
)
fc['keyTakeaways'] = [
    'Beef, veal and bovine offal are exempt from the 2026 Section 301 tariffs (and were exempt from the Section 122 surcharge and, from November 13, 2025, the IEEPA duties): for beef the base rate and the quota decide the cost — 4.4¢/kg in quota, 26.4% above it, Free with USMCA or most FTAs.',
    'Other meat — pork, lamb, poultry, cured ham — from the 60 Section 301 economies pays an extra duty since July 24, 2026: 10% in total for the EU, +10% or +12.5% for most others, +37.5% for Brazil. USMCA-qualifying meat from Canada and Mexico enters free.',
    'In 2026 the beef quota grew: 80,000 t more for Argentina and 300,000 t more for lean trimmings (September 1 – November 30). And no meat enters without USDA FSIS approval of the country and plant.',
]
fc['lastCheckedAt'] = TODAY
fc['questionSource'] = 'Google search suggestions, collected October 11, 2026'
fc['faqs'] = [
    {
        'id': 'beef-imports-tariff',
        'question': 'Are there tariffs on imported beef and meat right now?',
        'searchedAs': ['tariff on beef imports', 'are there tariffs on meat', 'tariffs on meat imports', 'trump removes tariffs on meat', 'tariffs on beef us'],
        'answer': (
            'Beef has only its base rate: 4.4¢/kg inside the tariff-rate quota and 26.4% above it, Free with USMCA or most FTA claims. Beef, veal '
            'and bovine offal are exempt from the 2026 Section 301 tariffs (U.S. note 52(b)), were exempt from the 10% Section 122 surcharge, and '
            'were taken out of the IEEPA reciprocal and Brazil duties on November 13, 2025. Other meat — pork, lamb, poultry, cured ham — pays its '
            'base rate plus a Section 301 duty of 10% to 12.5% (37.5% for Brazil) if it comes from one of the 60 economies, since July 24, 2026.'
        ),
        'link': '',
    },
    {
        'id': 'australia-beef',
        'question': 'What is the U.S. tariff on Australian beef?',
        'searchedAs': ['tariff on australian beef to usa', 'us tariff on australian beef', 'tariff on beef from australia', 'trump australian beef tariff'],
        'answer': (
            'Usually zero. Australian beef enters free under the Australia FTA within Australia\'s 378,214 t quota, then free for another 71,695 t '
            'in 2026, and beyond that free unless the price-based safeguard (17.1%) is triggered. Beef is exempt from the 12.5% Section 301 duty '
            'on Australian goods. The 10% reciprocal duty that applied from April 2025 was lifted for beef on November 13, 2025. Australia was the '
            'largest supplier in 2025, with $3.76B of beef.'
        ),
        'link': 'industry-areas',
    },
    {
        'id': 'brazil-beef',
        'question': 'What is the current tariff on Brazilian beef?',
        'searchedAs': [
            'current tariff on brazilian beef',
            'us tariff on brazilian beef',
            'tariff on beef from brazil',
            'are there tariffs on brazilian beef',
            'trump tariffs on brazilian beef',
        ],
        'answer': (
            '4.4¢/kg inside the quota and 26.4% above it — the base rate only. Brazil uses the 52,005 t "other countries or areas" quota and, '
            'until November 30, 2026, the extra 300,000 t for lean beef trimmings. Beef is exempt from both Section 301 duties on Brazil (25% and '
            '12.5%). The 40% IEEPA duty and the 10% reciprocal duty, which pushed over-quota Brazilian beef to 76.4% from August 6, 2025, were '
            'lifted for beef on November 13, 2025. Other Brazilian meat, such as pork, pays its base rate plus 37.5%.'
        ),
        'link': 'tariff-updates',
    },
    {
        'id': 'argentina-beef',
        'question': 'What is the tariff on Argentine beef, and how big is the Argentina beef quota?',
        'searchedAs': ['tariff on beef from argentina', 'argentina beef import quota', 'argentine beef import quota increase', 'argentina beef imports', 'argentina beef usa'],
        'answer': (
            'Argentina has a 20,000 t yearly beef quota and, for 2026 only, an extra 80,000 t of lean beef trimmings (Proclamation 11010, in '
            'quarterly tranches of 20,000 t from February 13 to December 31, 2026). In quota the rate is 4.4¢/kg; above it 26.4%. Beef is exempt '
            'from the 10% Section 301 duty on Argentine goods. Imports of Argentine meat rose 50% to $343M in 2025.'
        ),
        'link': 'tariff-updates',
    },
    {
        'id': 'canada-beef',
        'question': 'Is there a U.S. tariff on Canadian beef?',
        'searchedAs': ['is there a us tariff on canadian beef', 'tariff on canadian beef', 'what is the current tariff on canadian beef', 'trump tariff on canadian beef'],
        'answer': (
            'Not on USMCA-qualifying beef, which enters free with no quota limit. Canadian beef that does not qualify pays only the base rate '
            '(4.4¢/kg on most lines) — beef is exempt from the 10% Section 301 duty on Canadian goods, and the 2026 Section 338 duties on Canada '
            'do not cover meat. The 35% IEEPA duty ended on February 24, 2026. Canada shipped $2.81B of beef to the U.S. in 2025.'
        ),
        'link': 'industry-areas',
    },
    {
        'id': 'mexico-beef',
        'question': 'Are there tariffs on Mexican beef?',
        'searchedAs': ['are there tariffs on mexican beef'],
        'answer': (
            'No, if it qualifies for USMCA: Mexican beef then enters free, with no quota limit. Non-qualifying beef pays the base rate only, since '
            'beef is exempt from the 10% Section 301 duty on Mexican goods. The 25% IEEPA duty ended on February 24, 2026. Mexico was the No. 3 '
            'beef supplier in 2025 ($2.18B). The screwworm border closures apply to live cattle, not to meat.'
        ),
        'link': 'industry-areas',
    },
    {
        'id': 'beef-quota',
        'question': 'How does the U.S. beef import quota work?',
        'searchedAs': ['us beef import quotas', 'beef import quota'],
        'answer': (
            'It is a tariff-rate quota, not a ban. Each year a set quantity enters at the low in-quota rate (4.4¢/kg; 4% or 10% on processed cuts): '
            'Australia 378,214 t, New Zealand 213,402 t, Argentina and Uruguay 20,000 t each, the United Kingdom 13,000 t and all other countries '
            '52,005 t together; Canada and Mexico have no limit. Beef entered after a quota fills pays 26.4% (additional U.S. note 3 to Chapter 2). '
            'For 2026, Argentina got 80,000 t more and lean trimmings from other countries 300,000 t more.'
        ),
        'link': 'tariff-engineering',
    },
    {
        'id': 'lean-trimmings',
        'question': 'What are lean beef trimmings, and why is more being imported?',
        'searchedAs': ['imported lean beef trimmings', 'lean beef trimmings', 'boneless lean beef trimmings'],
        'answer': (
            'Lean boneless beef that is blended with fattier U.S. trimmings to make ground beef. They enter under 0201.30.50 and 0202.30.50. To '
            'lower ground-beef prices, Proclamation 11059 opened an extra 300,000 t of in-quota lean trimmings (4.4¢/kg instead of 26.4%) for '
            'countries without their own allocation, from September 1 to November 30, 2026, in three 100,000 t tranches, on top of the 80,000 t '
            'for Argentina.'
        ),
        'link': 'tariff-updates',
    },
    {
        'id': 'lamb',
        'question': 'What is the tariff on lamb from New Zealand or Australia?',
        'searchedAs': ['tariff on new zealand lamb', 'tariff on australian lamb', 'us tariff on australian lamb', 'is there a tariff on lamb'],
        'answer': (
            'Lamb has a base rate of 0.7¢/kg (Free for Australia with an FTA claim), but since July 24, 2026 both countries pay a 12.5% Section 301 '
            'duty on lamb, mutton and goat meat (9903.05.23, 9903.05.57). A $180,000 container of New Zealand lamb legs owes about $22,640. The '
            'U.S. imported $1.72B of sheep and goat meat in 2025, almost all from these two countries.'
        ),
        'link': 'industry-areas',
    },
    {
        'id': 'goat-meat',
        'question': 'Is there a tariff on goat meat?',
        'searchedAs': ['tariffs on goat meat'],
        'answer': (
            'The base rate on goat meat (0204.50) is Free, but goat meat from a Section 301 economy pays that country\'s extra duty — 12.5% for '
            'Australia, the main supplier. The U.S. imported $164M of goat meat in 2025.'
        ),
        'link': '',
    },
    {
        'id': 'hs-beef',
        'question': 'What is the HS code for beef?',
        'searchedAs': ['hs code for beef', 'hs code for beef meat', 'hs code for frozen beef', 'hs code for frozen meat'],
        'answer': (
            'Fresh or chilled beef is heading 0201 and frozen beef 0202; each splits into carcasses (.10), bone-in cuts (.20) and boneless (.30). The '
            'U.S. lines then split by whether the beef enters inside the quota (4.4¢/kg) or above it (26.4%). Frozen boneless beef, 0202.30, was the '
            'largest product in the chapter in 2025 ($6.32B). Beef offal is 0206, dried or salted beef 0210.20, and beef jerky and other prepared '
            'beef are in Chapter 16.'
        ),
        'link': '',
    },
    {
        'id': 'hs-chicken',
        'question': 'What is the HS code for chicken meat?',
        'searchedAs': ['hs code for chicken meat', 'hs code for frozen chicken', 'hs code for chicken breast', 'hs code for chicken feet'],
        'answer': (
            'Chicken is 0207.11–0207.14: whole birds fresh (0207.11) or frozen (0207.12) at 8.8¢/kg, and cuts and offal — breasts, wings, feet, '
            'livers — fresh (0207.13) or frozen (0207.14) at 17.6¢/kg. Turkey is 0207.24–0207.27, duck 0207.41–0207.45. Poultry needs a country '
            'and plant FSIS has approved for poultry.'
        ),
        'link': '',
    },
    {
        'id': 'hs-pork',
        'question': 'What is the HS code for pork?',
        'searchedAs': ['hs code for pork', 'hs code for pork meat', 'hs code for pork belly', 'hs code for pork ribs'],
        'answer': (
            'Fresh or chilled pork is 0203.11–0203.19 and frozen 0203.21–0203.29. Unprocessed cuts, including bellies (0203.19.40.10), are Free; '
            '"processed" cuts such as spare ribs made ready for retail (0203.19.20.10) are 1.4¢/kg. Bacon is 0210.12 and cured ham 0210.11 '
            '(1.4¢/kg). The Section 301 duty for the country of origin applies on top.'
        ),
        'link': '',
    },
    {
        'id': 'import-meat',
        'question': 'Can you import meat into the U.S., and what do you need?',
        'searchedAs': ['importing meat into the us', 'importing beef into the us', 'can you import meat into the us', 'importing cured meat into us'],
        'answer': (
            'Yes, commercially, if the exporting country and plant are eligible with USDA FSIS (9 CFR 327.2; 381.196 for poultry). Each shipment '
            'needs a foreign inspection certificate (9 CFR 327.4), an import inspection application and FSIS reinspection at an approved import '
            'establishment (9 CFR 327.5, 327.6). APHIS disease rules can bar meat from regions with foot-and-mouth disease, swine fevers or avian '
            'influenza (9 CFR part 94). Game meat, rabbit and frogs\' legs fall under FDA prior notice instead.'
        ),
        'link': 'tariff-engineering',
    },
    {
        'id': 'us-beef-imports',
        'question': 'Where does the U.S. import its beef from?',
        'searchedAs': ['us beef imports by country', 'us beef imports 2025', 'us beef imports by year'],
        'answer': (
            '$13.42B of beef in 2025, up from $10.76B in 2024: Australia $3.76B (28%), Canada $2.81B, Mexico $2.18B, New Zealand $1.29B, Brazil '
            '$1.26B and Uruguay $0.82B, followed by Nicaragua, Argentina and Paraguay. Beef was 74% of all U.S. meat imports ($18.16B).'
        ),
        'link': 'understand-industry',
    },
]

json.dump(d, open(FILE, 'w'), ensure_ascii=False, indent=2)
print('ok')
