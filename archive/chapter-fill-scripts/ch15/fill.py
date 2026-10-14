#!/usr/bin/env python3
"""Fill the writer TODOs of src/tariff-data/chapters/15-fats-and-oils.json (issue #1810, batch 1).

Re-run after:
  cd insights-ui && pnpm tariff:generate-chapter --chapter 15 --slug 15-fats-and-oils \
    --title "Animal, Vegetable or Microbial Fats and Oils and Their Cleavage Products; Prepared Edible Fats; Animal or Vegetable Waxes" \
    --trade-file src/tariff-data/trade/chapter-15.json --countries CA,ID,ES,IT,MY,PH,AU,CN,MX,BR,TN,AR --force
Then: python3 fill.py && npx prettier --write src/tariff-data/chapters/15-fats-and-oils.json
"""
import glob
import json

ROOT = '/Users/robin/projects/worktrees/chapter-migration-1810-batch1/insights-ui'
FILE = f'{ROOT}/src/tariff-data/chapters/15-fats-and-oils.json'
TODAY = '2026-10-12'
ECFR_AS_OF = '2026-10-08'
QUESTIONS_COLLECTED = 'October 12, 2026'

HTS_CH15 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2015'
HTS_CH99 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
HTS_GN = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'

d = json.load(open(FILE))

# Sources already used by finished chapters (same ids, same documents)
ref_src = {}
for f in sorted(glob.glob(f'{ROOT}/src/tariff-data/chapters/*.json')):
    if f.endswith('15-fats-and-oils.json'):
        continue
    for s in json.load(open(f)).get('tariffUpdates', {}).get('sources', []):
        ref_src.setdefault(s['id'], s)


def ecfr(title, section):
    return f'https://www.ecfr.gov/current/title-{title}/section-{section}'


def ecfr_part(title, part):
    return f'https://www.ecfr.gov/current/title-{title}/part-{part}'


def fr(ymd, doc, slug):
    y, m, dd = ymd.split('-')
    return f'https://www.federalregister.gov/documents/{y}/{m}/{dd}/{doc}/{slug}'


def money(n):
    return f'${n / 1e9:.2f}B' if n >= 1e9 else f'${n / 1e6:.0f}M'


def src(id_, publisher, citation, document, title, signed, published, url):
    return dict(id=id_, publisher=publisher, citation=citation, document=document, title=title, signed=signed, published=published, url=url)


# ---------------------------------------------------------------------------------------------
# Facts computed from the generated data
# ---------------------------------------------------------------------------------------------
rows = d['overview']['rateTable']['rows']
leaves = [r for r in rows if r['htsCode10']]
assert len(leaves) == 114, len(leaves)
N_DUTIABLE = sum(1 for r in leaves if r['dutiable'])
assert N_DUTIABLE == 94, N_DUTIABLE

EX52B = ['1513.11.00', '1513.19.00', '1521.10.00', '1521.90.20']  # U.S. note 52(b) / 50(a)(ii)
N_EXEMPT = sum(1 for r in leaves if r['hts'].startswith(tuple(EX52B)))
assert N_EXEMPT == 7, N_EXEMPT
# U.S. note 52(j) country exception lists (8-digit subheadings in Chapter 15)
COUNTRY_LISTS = {
    'ID': ['1511.10.00', '1511.90.00', '1513.21.00', '1513.29.00', '1515.30.00', '1515.90.21', '1515.90.60'],
    'MY': ['1511.10.00', '1511.90.00', '1513.29.00', '1515.30.00'],
    'KH': ['1511.10.00', '1511.90.00', '1513.21.00', '1513.29.00', '1515.30.00', '1515.90.21', '1515.90.60'],
    'EC': ['1511.10.00', '1511.90.00', '1513.21.00', '1513.29.00', '1515.30.00', '1515.90.21', '1515.90.60'],
    'JO': ['1511.10.00', '1511.90.00', '1513.21.00', '1513.29.00', '1515.30.00', '1515.90.21', '1515.90.60'],
    'GT': ['1511.10.00', '1511.90.00', '1513.21.00', '1515.90.21'],
    'SV': ['1511.10.00', '1513.29.00', '1515.30.00'],
    'CH': ['1515.30.00', '1515.90.21'],
    'AR': ['1515.90.60'],
    'BD': ['1515.30.00'],
    'TW': ['1511.90.00'],
}
COUNTRY_LIST_LINES = sorted({r['hts'] for r in leaves for subs in COUNTRY_LISTS.values() if r['hts'].startswith(tuple(subs))})
ARGAN = '1515.90.81'  # described "argan oil" exception for MY, AR, BD, TW (9903.06.01/.11/.13/.15)

ui = d['understandIndustry']
tot = ui['byYear'][-1]['totalUsd']
prior_tot = ui['byYear'][-2]['totalUsd']
first_tot = ui['byYear'][0]['totalUsd']
by_heading = {}
for r in ui['byHeadingCountry']:
    by_heading[r['heading']] = by_heading.get(r['heading'], 0) + r['importsUsd']
hc = {(r['heading'], r['country']): r['importsUsd'] for r in ui['byHeadingCountry']}
ct = {c['country']: c['importsUsd'] for c in ui['byCountry']}
ct_prior = {c['country']: c['priorImportsUsd'] for c in ui['byCountry']}
_trade = json.load(open(f'{ROOT}/src/tariff-data/trade/chapter-15.json'))
for c in _trade['byCountry']:
    ct.setdefault(c['country'], c['importsUsd'])
    ct_prior.setdefault(c['country'], c['priorImportsUsd'])
assert money(tot) == '$16.03B', money(tot)
assert money(prior_tot) == '$17.20B'
assert money(by_heading['1514']) == '$3.09B' and money(hc[('1514', 'Canada')]) == '$3.04B'
assert money(by_heading['1509']) == '$2.41B' and money(by_heading['1518']) == '$2.58B'
assert money(hc[('1511', 'Indonesia')]) == '$1.49B'
assert money(hc[('1502', 'Brazil')]) == '$445M'

# ---------------------------------------------------------------------------------------------
# Labels for the 21 headings
# ---------------------------------------------------------------------------------------------
LABELS = {
    '1501': ('Lard, choice white grease & other pig or poultry fat', 'Lard'),
    '1502': ('Tallow & other cattle, sheep or goat fat', 'Tallow'),
    '1503': ('Lard stearin, lard oil, oleo-oil & tallow oil', 'Lard & tallow oil'),
    '1504': ('Fish oil, cod liver oil & marine mammal oil', 'Fish oil'),
    '1505': ('Wool grease & lanolin', 'Lanolin'),
    '1506': ('Other animal fats & oils', 'Other animal fats'),
    '1507': ('Soybean oil, crude or refined', 'Soybean oil'),
    '1508': ('Peanut oil', 'Peanut oil'),
    '1509': ('Olive oil: extra virgin, virgin & refined', 'Olive oil'),
    '1510': ('Olive-pomace oil & other olive oils', 'Olive-pomace oil'),
    '1511': ('Palm oil & palm olein, crude or refined', 'Palm oil'),
    '1512': ('Sunflower, safflower & cottonseed oil', 'Sunflower & cottonseed'),
    '1513': ('Coconut oil, palm kernel oil & babassu oil', 'Coconut & palm kernel'),
    '1514': ('Canola (rapeseed) & mustard oil', 'Canola oil'),
    '1515': ('Corn, sesame, linseed, castor, avocado, jojoba & other vegetable oils', 'Other vegetable oils'),
    '1516': ('Hydrogenated & interesterified fats and oils', 'Hydrogenated fats'),
    '1517': ('Margarine, shortening & edible oil blends', 'Margarine & blends'),
    '1518': ('Chemically modified & inedible fats and oils, incl. used cooking oil', 'Modified & used oils'),
    '1520': ('Crude glycerol, glycerol waters & lyes', 'Crude glycerol'),
    '1521': ('Vegetable waxes (carnauba, candelilla), beeswax & insect waxes', 'Waxes'),
    '1522': ('Degras & residues from treating fats or waxes', 'Degras & residues'),
}

# ---------------------------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------------------------
NEW_SOURCES = {
    'hts-ch15': src('hts-ch15', 'USITC', 'HTSUS 2026 Revision 21, Chapter 15', 'Harmonized Tariff Schedule',
                    'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 15: Animal, Vegetable or Microbial Fats and Oils and Their Cleavage Products; Prepared Edible Fats; Animal or Vegetable Waxes',
                    None, '2026-10-07', HTS_CH15),
    'cbp-wro-mar-hip': src('cbp-wro-mar-hip', 'CBP', 'CBP national media release', 'Withhold Release Orders (19 U.S.C. 1307)',
                           'CBP issues Withhold Release Orders on Mitra Aneka Rezeki and Hardaya Inti Plantation', None, '2026-09-29',
                           'https://www.cbp.gov/newsroom/national-media-release/cbp-issues-withhold-release-orders-mitra-aneka-rezeki-and-hardaya'),
    'cbp-wro-fgv-mod': src('cbp-wro-fgv-mod', 'CBP', 'CBP national media release', 'Modification of a Withhold Release Order',
                           'CBP modifies Withhold Release Order on FGV Holdings Berhad in Malaysia', None, '2026-01-15',
                           'https://www.cbp.gov/newsroom/national-media-release/cbp-modifies-withhold-release-order-fgv-holdings-berhad-malaysia'),
    'cbp-wro-fgv': src('cbp-wro-fgv', 'CBP', 'CBP national media release', 'Withhold Release Order (19 U.S.C. 1307)',
                       'CBP Issues Detention Order on Palm Oil Produced with Forced Labor in Malaysia', None, '2020-09-30',
                       'https://www.cbp.gov/newsroom/national-media-release/cbp-issues-detention-order-palm-oil-produced-forced-labor-malaysia'),
    'fr-sime-darby-finding': src('fr-sime-darby-finding', 'Federal Register', '87 FR 4635', 'Notice (CBP)',
                                 'Notice of Finding That Certain Palm Oil and Derivative Products Made Wholly or In Part With Palm Oil Produced by the Malaysian Company Sime Darby Plantation Berhad Its Subsidiaries, and Joint Ventures, With the Use of Convict, Forced or Indentured Labor Are Being, or Are Likely To Be, Imported Into the United States in Violation of 19 U.S.C. 1307',
                                 None, '2022-01-28',
                                 fr('2022-01-28', '2022-01779', 'notice-of-finding-that-certain-palm-oil-and-derivative-products-made-wholly-or-in-part-with-palm-oil')),
    'fr-sime-darby-revoked': src('fr-sime-darby-revoked', 'Federal Register', '88 FR 7451', 'Notice (CBP)',
                                 'Determination That Maintenance of Finding of January 28, 2022, Pertaining to Certain Palm Oil and Derivative Products Made Wholly or in Part With Palm Oil Produced by the Malaysian Company Sime Darby Plantation Berhad, Its Subsidiaries, and Joint Ventures, Is No Longer Necessary',
                                 None, '2023-02-03',
                                 fr('2023-02-03', '2023-02286', 'determination-that-maintenance-of-finding-of-january-28-2022-pertaining-to-certain-palm-oil-and')),
    'epa-rfs-2026': src('epa-rfs-2026', 'Federal Register', '91 FR 16388', 'Final rule (EPA)',
                        'Renewable Fuel Standard (RFS) Program: Standards for 2026 and 2027, Partial Waiver of 2025 Cellulosic Biofuel Volume Requirement, and Other Changes',
                        None, '2026-04-01',
                        fr('2026-04-01', '2026-06275', 'renewable-fuel-standard-rfs-program-standards-for-2026-and-2027-partial-waiver-of-2025-cellulosic')),
    'irs-45z-nprm': src('irs-45z-nprm', 'Federal Register', '91 FR 5160', 'Proposed rule (Treasury / IRS)', 'Section 45Z Clean Fuel Production Credit',
                        None, '2026-02-04', fr('2026-02-04', '2026-02246', 'section-45z-clean-fuel-production-credit')),
    'cbp-n347194': src('cbp-n347194', 'CBP', 'CBP ruling NY N347194', 'Classification ruling', 'The tariff classification of Used Cooking Oil from Canada',
                       None, '2025-04-24', 'https://rulings.cbp.gov/ruling/N347194'),
    'ustr-lca-2021': src('ustr-lca-2021', 'Federal Register', '86 FR 36313', 'Notice (USTR)',
                         'Suspension of Action: Enforcement of U.S. WTO Rights in the Large Civil Aircraft Dispute', None, '2021-07-09',
                         fr('2021-07-09', '2021-14550', 'suspension-of-action-enforcement-of-us-wto-rights-in-the-large-civil-aircraft-dispute')),
}
for k in ['procl-11012', 'eo-14389', 'csms-67834313', 'scotus-24-1287', 'eo-14193', 'eo-14194', 'eo-14325', 'eo-14257', 'eo-14360',
          'eo-14361', 'eo-14323', 'ustr-usmca-review', 'eo-14195', 'eo-14228', 'eo-14357']:
    NEW_SOURCES[k] = ref_src[k]

tu = d['tariffUpdates']
have = {s['id'] for s in tu['sources']}
for k, s in NEW_SOURCES.items():
    if k not in have:
        tu['sources'].append(s)
all_src = {s['id']: s for s in tu['sources']}

d['asOf'] = TODAY
if not any('comtrade' in s['url'] for s in d['sources']):
    d['sources'].append({'label': 'UN Comtrade', 'url': 'https://comtradeplus.un.org/', 'note': '2025 import figures'})
d['sources'].append({'label': 'CBP Forced Labor', 'url': 'https://www.cbp.gov/trade/forced-labor/withhold-release-orders-and-findings',
                     'note': 'Withhold Release Orders on palm oil and palm oil products'})

# ---------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------
ov = d['overview']
ov['seo'] = {
    'title': 'HTS Chapter 15 Tariff Rates 2026: Olive Oil, Palm Oil, Canola & Vegetable Oil Import Duties | KoalaGains',
    'shortDescription': ('Searchable 2026 duty table for all 114 HTS Chapter 15 lines — olive oil, palm oil, canola, soybean, coconut and sunflower oil, '
                         'tallow, fish oil, margarine, used cooking oil and waxes. General, FTA and Column 2 rates plus the Section 301 duty by country.'),
    'keywords': ['hts chapter 15', 'hts chapter 15 import duty rates', 'olive oil tariff code', 'extra virgin olive oil import duty',
                 'palm oil hs code', 'soybean oil tariff', 'canola oil tariff code', 'coconut oil hs code', 'sunflower oil tariff code',
                 'crude vegetable oils customs duty', 'margarine import duties', 'used cooking oil hs code'],
}
ov['intro'] = (
    'Chapter 15 covers fats and oils and the waxes made from them: olive, palm, canola, soybean, coconut, sunflower and other vegetable oils, '
    'lard, tallow and fish oil, margarine and shortening, used cooking oil and other inedible fats, crude glycerol, beeswax and carnauba wax. '
    f'Its **114 tariff lines** carry a base rate on {N_DUTIABLE} of them, mostly small per-kilogram rates — 3.4¢/kg on bulk olive oil, '
    '0.43¢/kg on tallow — with a few steep ones: **19.1% on soybean oil**, 18% on oil blends containing soybean oil, 34.2¢/kg on dairy butter '
    'substitutes over their quota. Palm oil, coconut oil and palm kernel oil are Free.\n\n'
    f'The U.S. imported **{money(tot)}** of these goods in 2025. Canada supplied a quarter, almost all of it canola oil, and USMCA-qualifying goods '
    'from Canada and Mexico enter free. Goods from elsewhere pay the base rate **plus an extra duty by country**: since July 24, 2026 a '
    'Section 301 tariff on 60 economies — **10% in total for EU olive oil**, +10% or +12.5% for most others, +37.5% for Brazil, up to +37.5% for '
    f'China. **{N_EXEMPT} lines are exempt** for every country (coconut oil, vegetable waxes, bleached beeswax), and the country lists exempt '
    '**palm oil from Indonesia and Malaysia**. Used cooking oil and other goods of 1518.00.40 from Canada also pay a **50% Section 338 duty**. '
    'Olive oil from Tunisia, outside the 60 economies, pays only the base rate.'
)
ov['stats'][2]['note'] = ('Section 301 (2026): 107 lines; China lists: 113; Brazil: 107; Section 338 (Canada): 1518.00.40. '
                          'USMCA goods exempt from Section 301')
for g in ov['productGroups']:
    g['label'] = LABELS[g['heading']][0]

BLURBS = {
    '1501': ('Rendered pig fat: lard, choice white grease and yellow grease, all at 3¢/kg. Poultry fat is here too; pig fat that is not rendered is heading 0209.',
             ['lard', 'choice white grease', 'yellow grease', 'pork fat', 'poultry fat', 'chicken fat']),
    '1502': ('Tallow and other cattle, sheep or goat fat at 0.43¢/kg, split into edible and inedible tallow. Brazil, Canada, Australia and Argentina '
             'are the main suppliers.', ['tallow', 'beef tallow', 'edible tallow', 'inedible tallow', 'mutton fat']),
    '1503': ('Lard stearin, lard oil, oleostearin, oleo-oil and tallow oil that are not emulsified, mixed or otherwise prepared: 2¢/kg.',
             ['lard oil', 'tallow oil', 'oleostearin', 'lard stearin']),
    '1504': ('Fish oils: cod liver oil and cod oil are Free; other fish-liver oil 2.5%; herring oil 1¢/kg; menhaden and other fish oil '
             '1.5¢/kg + 5%; marine mammal oil 1.7¢/kg + 5%. Fish-oil capsules made up as supplements are classified elsewhere.',
             ['fish oil', 'cod liver oil', 'omega-3 fish oil', 'menhaden oil', 'krill oil', 'salmon oil']),
    '1505': ('Wool grease: crude at 1.3¢/kg, lanolin and other wool-grease substances 2.4%.', ['lanolin', 'wool grease', 'wool wax']),
    '1506': ('Animal fats and oils not covered elsewhere, such as neatsfoot oil or emu oil: 2.3%.', ['neatsfoot oil', 'emu oil', 'animal oil']),
    '1507': ('Soybean oil carries the chapter\'s highest ad valorem rate: 19.1% crude or refined. Only pharmaceutical-grade oil meeting FDA '
             'requirements for intravenous fat emulsions (1507.90.20) is Free.', ['soybean oil', 'soya oil', 'crude soybean oil', 'refined soybean oil']),
    '1508': ('Peanut (groundnut) oil, crude or refined: 7.5¢/kg.', ['peanut oil', 'groundnut oil']),
    '1509': ('Olive oil by grade — extra virgin (1509.20), virgin (1509.30), other virgin (1509.40) and refined or blended (1509.90). Each pays '
             '5¢/kg on contents and container in containers under 18 kg, or 3.4¢/kg in bulk; certified-organic oil has its own statistical lines.',
             ['olive oil', 'extra virgin olive oil', 'virgin olive oil', 'pure olive oil', 'organic olive oil', 'bulk olive oil']),
    '1510': ('Olive-pomace oil (extracted with solvents) and blends with olive oil, at the same rates as olive oil; pomace oil rendered unfit for '
             'food is Free.', ['olive pomace oil', 'pomace oil', 'crude pomace oil']),
    '1511': ('Crude palm oil (1511.10) and refined, bleached and deodorized palm oil, palm olein and palm stearin (1511.90): Free. Palm oil from '
             'Indonesia and Malaysia is on their Section 301 exception lists.', ['palm oil', 'crude palm oil', 'RBD palm oil', 'palm olein', 'palm stearin']),
    '1512': ('Sunflower-seed and safflower oil at 1.7¢/kg + 3.4%, crude or refined (organic sunflower oil has its own lines); cottonseed oil at '
             '5.6¢/kg.', ['sunflower oil', 'high oleic sunflower oil', 'safflower oil', 'cottonseed oil']),
    '1513': ('Coconut (copra) oil, palm kernel oil and babassu oil: all Free. Coconut oil, crude or refined, is on the Section 301 exemption list '
             'for every country; palm kernel oil only on some country lists.', ['coconut oil', 'virgin coconut oil', 'copra oil', 'palm kernel oil', 'babassu oil']),
    '1514': ('Canola (low erucic acid rapeseed) oil at 6.4%, crude or refined. Rapeseed or mustard oil imported to make rubber substitutes or '
             'lubricants is Free; denatured oil 1.3¢/kg.', ['canola oil', 'rapeseed oil', 'mustard oil', 'colza oil']),
    '1515': ('Every other vegetable oil: corn oil 3.4%, linseed oil 6.3¢/kg, sesame oil 0.68¢/kg, castor oil and nut oils Free, jojoba 2.3%, '
             'microbial oils and hemp, avocado, argan and other oils 3.2%.',
             ['corn oil', 'sesame oil', 'linseed oil', 'flaxseed oil', 'castor oil', 'avocado oil', 'jojoba oil', 'hemp seed oil', 'argan oil', 'almond oil']),
    '1516': ('Fats and oils that have been hydrogenated, interesterified or re-esterified but not further prepared: animal 7¢/kg, rapeseed 7.7%, '
             'other vegetable and microbial 8.8¢/kg.', ['hydrogenated oil', 'hydrogenated palm oil', 'interesterified fat', 'vegetable fat']),
    '1517': ('Margarine at 12.3¢/kg; oil blends and shortenings at 18% if they contain 5% or more soybean oil, otherwise 8%; dairy butter '
             'substitutes under a tariff-rate quota (11¢/kg in quota, 34.2¢/kg over it); other edible preparations 8.8¢/kg.',
             ['margarine', 'shortening', 'vegetable oil blend', 'cooking oil blend', 'frying fat', 'butter substitute', 'ghee substitute']),
    '1518': ('Boiled, oxidized or otherwise chemically modified fats and oils, and inedible mixtures of fats — including used cooking oil '
             '(1518.00.40, 8%). Linseed-based products are 6.3¢/kg.', ['used cooking oil', 'UCO', 'waste cooking oil', 'epoxidized soybean oil', 'boiled linseed oil']),
    '1520': ('Crude glycerol, glycerol waters and glycerol lyes: Free. Refined glycerol is Chapter 29.', ['crude glycerin', 'crude glycerol', 'glycerine']),
    '1521': ('Carnauba, candelilla and other vegetable waxes, and beeswax and other insect waxes: Free, except bleached beeswax at 4.8%. Vegetable '
             'waxes and bleached beeswax are on the Section 301 exemption list.', ['beeswax', 'carnauba wax', 'candelilla wax', 'insect wax']),
    '1522': ('Degras and residues from treating fats, oils or waxes, such as soapstocks and oil foots: 3.8%.', ['degras', 'soapstock', 'oil foots']),
}
for g in ov['productGroups']:
    g['blurb'], g['searchExamples'] = BLURBS[g['heading']]

ov['workedExamples'] = [
    {
        'title': 'A tanker of refined canola oil from Canada',
        'line': '1514.19.00',
        'body': ('The general rate is 6.4%. Canadian canola oil claimed under USMCA (SPI **S**) is Free, and USMCA-qualifying goods are exempt from '
                 'the Section 301 duty (9903.05.93), so on $1,000,000 the duty is **$0**. Oil that does not qualify pays 6.4% + 10% (9903.05.29) = '
                 '**$164,000**.'),
    },
    {
        'title': '10,000 kg of bottled extra virgin olive oil from Spain — or Tunisia',
        'line': '1509.20.20',
        'body': ('In containers under 18 kg the rate is 5¢/kg on contents and container, so 10,000 kg gross = $500. On $90,000 of oil that is '
                 'under 1% of value, so the EU Section 301 rule (9903.05.39) lifts the total to 10%: **$9,000**. The same oil from Tunisia, which is '
                 'not one of the 60 economies, pays only **$500**.'),
    },
    {
        'title': '$500,000 of refined palm oil from Indonesia',
        'line': '1511.90.00',
        'body': ('Palm oil is Free, and 1511.90.00 is on Indonesia\'s Section 301 exception list (U.S. note 52(j), 9903.06.16), so the duty is '
                 '**$0**. From Colombia, which has no exception list, it is 12.5% (9903.05.32) = **$62,500**; from China 12.5% + 7.5% = **$100,000**.'),
    },
    {
        'title': '$200,000 of used cooking oil from Canada',
        'line': '1518.00.40',
        'body': ('Used cooking oil is 1518.00.40 (CBP ruling N347194), general rate 8%. Since September 15, 2026 this line carries the 50% '
                 'Section 338 duty on Canadian goods (9903.03.12), which applies even when USMCA is claimed: **$100,000** with USMCA, '
                 '8% + 10% + 50% = **$136,000** without it.'),
    },
]
ov['tradeSnapshot']['totalDutyCollectedUsd'] = None
ov['tradeSnapshot']['effectiveDutyRateNote'] = "Duty-collected figures aren't available from an official source yet."
ov['tradeSnapshot']['biggestLines'] = [
    {'hts': '1518.00', 'label': 'Chemically modified and inedible fats and oils, incl. used cooking oil'},
    {'hts': '1514.19', 'label': 'Refined canola (low erucic acid rapeseed) oil'},
]
ov['tradeSnapshot']['coverageNote'] = 'Imports are CIF values reported by the United States to UN Comtrade for 2025; they are not duty-paid figures.'
ov['notes'] = {
    'chapterNotes': (
        '**Note 1.** This chapter does not cover: (a) pig fat or poultry fat, of heading 0209; (b) cocoa butter, fat or oil (heading 1804); '
        '(c) edible preparations containing by weight more than 15 percent of the products of heading 0405 (generally chapter 21); (d) greaves '
        '(heading 2301) or residues of headings 2304 to 2306; (e) fatty acids, prepared waxes, medicaments, paints, varnishes, soap, perfumery, '
        'cosmetic or toilet preparations, sulfonated oils or other goods of section VI; or (f) factice derived from oils (heading 4002).\n\n'
        '**Note 2.** Heading 1509 does not apply to oils obtained from olives by solvent extraction (heading 1510).\n\n'
        '**Note 3.** Heading 1518 does not cover fats or oils or their fractions, merely denatured, which are to be classified in the heading '
        'appropriate to the corresponding undenatured fats and oils and their fractions.\n\n'
        '**Note 4.** Soap-stocks, oil foots and dregs, stearin pitch, glycerol pitch and wool grease residues fall in heading 1522.\n\n'
        '**Subheading notes.** (1) For subheading 1509.30, virgin olive oil has a free acidity expressed as oleic acid not exceeding 2.0 g/100 g '
        'and can be distinguished from the other virgin olive oil categories according to Codex Alimentarius Standard 33-1981. (2) For '
        'subheadings 1514.11 and 1514.19, "low erucic acid rape or colza oil" means the fixed oil which has an erucic acid content of less than '
        '2 percent by weight.'
    ),
    'additionalUsNotes': (
        '**Note 1.** Products of American fisheries are provided for in chapter 98.\n\n'
        '**Statistical notes.** The unit "kg cmsc" (kilograms cows\' milk solids content) includes all cows\' milk components other than water. '
        'For the approved standards for "certified organic", see General Statistical Note 6. The dairy lines of 1517.90 (butter substitutes) '
        'follow the quota rules of additional U.S. notes 1 and 10 to chapter 4 and general note 15.'
    ),
}

# ---------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------
tu['seo'] = {
    'title': 'HTS Chapter 15 Tariff Updates 2026: Olive Oil, Palm Oil & Vegetable Oil Duties Since 2025 | KoalaGains',
    'shortDescription': ('What changed for HTS Chapter 15 fats and oils since January 2025: the end of the IEEPA and Section 122 duties, the '
                         '2026 Section 301 tariffs and the palm and coconut oil exemptions, the Section 338 duty on Canadian used cooking oil '
                         'and new palm oil forced-labor orders, with official citations.'),
    'keywords': ['hts chapter 15 tariff updates', 'olive oil tariffs 2026', 'palm oil tariff exemption', 'indonesian palm oil tariff',
                 'coconut oil tariff exemption', 'section 301 tariff vegetable oil', 'section 122 surcharge', 'usmca exemption',
                 'palm oil withhold release order'],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current '
    '**2026 Revision 21** (in force October 9, 2026). No Chapter 15 base rate changed between them; six new statistical lines split out '
    'certified-organic coconut oil and avocado oil at the same rates.\n\n'
    'Everything that changed came on top of the base rate. The 2025 IEEPA duties (Canada, Mexico, China, Brazil and the reciprocal tariff on '
    'everyone else) **ended on February 24, 2026**, and the 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since '
    '**July 24, 2026**, goods from 60 economies pay a **Section 301 tariff of 10% or 12.5%** (10% in total for EU goods) — except coconut oil, '
    'vegetable waxes and bleached beeswax for every country, and palm, palm kernel, castor and some other oils on the exception lists of '
    'Indonesia, Malaysia and nine other economies. China pays its 2018–2019 Section 301 duties too, Brazil an extra 25%, and since '
    '**September 15, 2026** used cooking oil and other goods of 1518.00.40 from Canada pay **+50% under Section 338**. '
    '**USMCA-qualifying goods from Canada and Mexico are exempt from the Section 301 duties.**'
)
tu['scope'] = ('Measures that reach Chapter 15 from any country: the 2026 Section 301 tariffs on 60 economies and their exemption and country '
               'exception lists, the Brazil Section 301 tariff, the China Section 301 Lists 3 and 4A, the Section 338 duty on Canada, the phased '
               'Nicaragua duty, and the 2025–2026 IEEPA and Section 122 duties that have ended. CBP forced-labor orders on palm oil and the biofuel '
               'rules that shape demand for imported fats are listed as reference entries. No antidumping or countervailing duty order covers a '
               'Chapter 15 line. For the rate each supplier pays, see Rates by country.')
tu['lastCheckedAt'] = TODAY

EX_TEXT = (f'The {N_EXEMPT} lines on the general exemption list (U.S. note 52(b), 9903.05.86) — coconut oil (1513.11, 1513.19), vegetable waxes '
           '(1521.10) and bleached beeswax (1521.90.20) — pay no 2026 Section 301 duty from any country.')
IEEPA_END = 'The IEEPA duties ended February 24, 2026, and the Section 122 surcharge expired July 23, 2026.'
WHAT = {
    'ca-section-301': (
        'USMCA-qualifying goods: no Section 301 duty (9903.05.93). ' + EX_TEXT + ' The Section 338 duty (9903.03.12, +50% from September 15, '
        '2026) covers 1518.00.40 — used cooking oil and other inedible fat mixtures — and applies even to USMCA goods (U.S. note 51(a)). The 2025 '
        'IEEPA duty on Canada (+35%, 9903.01.10) ended February 24, 2026.',
        'USMCA-qualifying canola oil from Canada pays $0; canola oil that does not qualify pays 6.4% + 10%. Canadian used cooking oil pays 50% with '
        'USMCA, 68% without.'),
    'id-section-301': (
        '+10% (9903.05.45). ' + EX_TEXT + ' Indonesia\'s country exception list (U.S. note 52(j), 9903.06.16) adds crude and refined palm oil '
        '(1511.10, 1511.90), palm kernel oil (1513.21, 1513.29), castor oil (1515.30), nut oils (1515.90.21) and jojoba oil (1515.90.60): 14 of 114 '
        'lines pay no Section 301 duty. ' + IEEPA_END,
        'Palm oil and palm kernel oil from Indonesia are Free; Indonesian hydrogenated fats (1516) and oil blends (1517) pay the base rate plus 10%. '
        'CBP Withhold Release Orders since September 29, 2026 detain palm oil from two Indonesian producers.'),
    'eu-section-301': (
        'For EU goods whose base rate (or its ad valorem equivalent) is under 10%, the total is 10% (9903.05.39); lines with a higher base rate keep '
        'it and pay nothing extra. ' + EX_TEXT + ' The EU exception list (9903.05.97) names no Chapter 15 line. The 2019 Airbus-dispute duty on '
        'olive oil from Spain and Germany (9903.89.13) is still suspended. This replaced the 15% IEEPA rate (9903.02.20), which ended February 24, 2026.',
        'Spanish, Italian and Greek olive oil pays 10% of value in total (its 3.4¢–5¢/kg base rate is far below that); EU oil blends with 5% or '
        'more soybean oil keep their 18% base rate.'),
    'my-section-301': (
        '+10% (9903.05.54). ' + EX_TEXT + ' Malaysia\'s country exception list (9903.05.99) adds crude and refined palm oil, palm kernel oil '
        '(1513.29) and castor oil, and argan oil (1515.90.81) is exempt when entered as the described article (9903.06.01). ' + IEEPA_END,
        'Malaysian palm oil is Free; Malaysian used cooking oil and other goods of 1518.00.40 pay 8% + 10%.'),
    'ph-section-301': (
        '+12.5% (9903.05.64). ' + EX_TEXT + ' The Philippines has no country exception list, so its palm kernel oil (1513.21, 1513.29) pays the '
        'duty. ' + IEEPA_END,
        'Philippine coconut oil, the bulk of its shipments, pays nothing; Philippine palm kernel oil pays 12.5%.'),
    'au-section-301': (
        '+12.5% (9903.05.23). The Australia FTA (SPI AU) removes the base rate but not the Section 301 duty (U.S. note 52(a)). ' + EX_TEXT + ' '
        + IEEPA_END,
        'Australian tallow and used cooking oil claimed under the FTA pay 12.5% of value.'),
    'cn-section-301': (
        'Three Section 301 duties can apply: +12.5% under the 2026 action (9903.05.31) on every line not on the exemption list, plus +7.5% under '
        'List 4A (9903.88.15, 104 lines) or +25% under List 3 (9903.88.03, 9 lines: fish oils, wool grease and 1506). Rapeseed oil for rubber '
        'substitutes or lubricants (1514.91.10) is on the suspended List 4B and pays only the 12.5%. USTR continued the 2018–2019 actions on '
        'October 7, 2026. Coconut oil and the waxes still pay their List 4A duty. The IEEPA duties on China ended February 24, 2026.',
        'Chinese used cooking oil (1518.00.40) pays 8% + 20% = 28%; Chinese fish oil 1.5¢/kg + 5% + 37.5%.'),
    'mx-section-301': (
        'USMCA-qualifying goods: no Section 301 duty (9903.05.94). ' + EX_TEXT + ' The 2025 IEEPA duty on Mexico (+25%, 9903.01.01) ended '
        'February 24, 2026.',
        'USMCA-qualifying avocado oil and other vegetable oils from Mexico pay nothing; goods that do not qualify pay the base rate plus 10%.'),
    'br-section-301': (
        'Two Section 301 duties stack: +25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, '
        '2026 (9903.05.27). Both exempt coconut oil, vegetable waxes and bleached beeswax (U.S. note 50(a)(ii), 9903.05.03 and note 52(b), '
        '9903.05.86). Brazil has no country exception list. The 2025 IEEPA duties on Brazil (10% + 40%) ended February 24, 2026.',
        'Brazilian tallow pays 0.43¢/kg + 37.5%; Brazilian carnauba wax pays nothing.'),
    'ar-section-301': (
        '+10% (9903.05.22). ' + EX_TEXT + ' Argentina\'s exception list (9903.06.10) adds jojoba oil (1515.90.60), and argan oil (1515.90.81) is '
        'exempt as the described article (9903.06.11). ' + IEEPA_END,
        'Argentine sunflower and peanut oil and tallow pay the base rate plus 10%.'),
    'other-section-301': (
        'Chile, Colombia, Peru, Türkiye, Vietnam, South Africa and most others pay +12.5%; India, Ecuador, Guatemala, El Salvador and some others '
        '+10% (9903.05.20–9903.05.84). Japan, South Korea and Switzerland pay 12.5% in total, and Taiwan 10% in total, when the base rate is lower. '
        + EX_TEXT + ' Country exception lists (U.S. note 52(j)) exempt palm, palm kernel, castor, nut or jojoba oil for Cambodia, Ecuador, Jordan, '
        'Guatemala, El Salvador, Switzerland, Bangladesh and Taiwan (Taiwan: refined palm oil only), and argan oil for Bangladesh and Taiwan. '
        'Countries outside the 60 economies (for example Tunisia, Ukraine or Kenya) pay no extra duty.',
        'Olive oil from Türkiye pays its base rate plus 12.5%; the same oil from Tunisia pays only the base rate. Colombian palm oil pays 12.5%.'),
}
for e in tu['inEffect']:
    e['exemption'], e['whatItMeans'] = WHAT[e['id']]
    if e['id'] == 'other-section-301':
        e['country'] = 'Other Section 301 economies (incl. South Korea, Vietnam, India, Türkiye, Chile, Colombia, Peru)'
        e['now'] = '+10% or +12.5% (10% or 12.5% in total for Japan, South Korea, Switzerland, Taiwan)'
    if e['id'] == 'cn-section-301':
        e['now'] = '+20% (List 4A lines) or +37.5% (List 3 lines); +7.5% on exempt lines'
        e['before'] = '+7.5% (List 4A) or +25% (List 3)'
    if e['id'] == 'ca-section-301':
        e['now'] = '+10% (non-USMCA); +50% on 1518.00.40 (all)'

# Change log --------------------------------------------------------------------------------
gen = {c['id']: c for c in tu['changes']}
base = gen['base-rates']
base['title'] = 'No Chapter 15 base-rate changes'
base['detail'] = ('All 108 Chapter 15 lines that exist in both editions carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as '
                  'in the 2025 Basic Edition. The six new 10-digit lines split existing ones at the same rate: certified-organic and other refined '
                  'coconut oil (1513.19.00.30/.90) and avocado oil, organic and other, and other oils, organic and other, under 1515.90.81.')
s338 = gen['section-338-canada-2026-09-15']
s338.update(id='s338-ca', title='Section 338 duty on Canadian used cooking oil and inedible fats',
            detail=('Proclamation 11064 added 34 provisions to the 50% Section 338 duty on products of Canada (9903.03.12), from September 15, 2026. '
                    'One is Chapter 15: 1518.00.40, which covers used cooking oil and other inedible or chemically modified fat mixtures. The duty '
                    'applies on top of the general rate and any Section 301 duty, and also to goods entered under USMCA (U.S. note 51(a)).'),
            before='None', now='+50%')
s301 = gen['section-301-2026-60-economies-2026-07-24']
s301.update(id='s301-fl', title='Section 301 tariffs on 60 economies — coconut oil, waxes and Indonesian and Malaysian palm oil exempt',
            detail=(f'10% or 12.5% on products of 60 economies (9903.05.20–9903.05.84), on {114 - N_EXEMPT} of 114 Chapter 15 lines. The general '
                    f'exemption list (U.S. note 52(b), 9903.05.86) covers {N_EXEMPT} lines: coconut oil, vegetable waxes and bleached beeswax. Country '
                    'exception lists (note 52(j)) exempt palm oil and other tropical oils for Indonesia, Malaysia, Cambodia, Ecuador, Jordan, Guatemala, '
                    'El Salvador and others. EU goods pay 10% in total and Japan, South Korea and Switzerland 12.5% in total where the base rate is '
                    'lower. USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94).'),
            countries='60 economies', now='+10% / +12.5%', before='None')
br = gen['section-301-brazil-2026-07-22']
br.update(id='br-301', title='Section 301 tariff on products of Brazil',
          detail=('25% on goods of Brazil (9903.05.01). Its exemption list (U.S. note 50(a)(ii), 9903.05.03) has the same four Chapter 15 subheadings '
                  'as the 2026 list — coconut oil, vegetable waxes (including carnauba) and bleached beeswax. From July 24 the 12.5% 2026 tariff '
                  '(9903.05.27) is added on top, so Brazilian tallow and lard pay +37.5%.'),
          before='None', now='+25%')
ni = gen['section-301-nicaragua-scheduled-2027-01-01']
ni.update(title='Nicaragua Section 301 duty: 10% from 2027, 15% from 2028',
          detail=('USTR set a phased duty on products of Nicaragua (9903.89.01): 0% in 2026, 10% from January 1, 2027 and 15% from January 1, 2028. It '
                  'does not apply to goods that originate under CAFTA-DR and are entered under it (U.S. note 29). It comes on top of the 12.5% 2026 '
                  'Section 301 duty on Nicaragua (9903.05.58).'),
          before='0%', now='+10% (2027), +15% (2028)')


def change(id_, type_, date, label, title, detail, before, now, countries, ids):
    for i in ids:
        assert i in all_src, i
    return dict(id=id_, type=type_, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries, sourceIds=ids)


changes = [
    base,
    ni,
    change('cn-301-continued', 'reference', '2026-10-07', 'Published', 'China Section 301 duties continued',
           'After its four-year review USTR continued the 2018–2019 Section 301 actions on China. For Chapter 15, List 4A (+7.5%, 9903.88.15) covers 104 '
           'lines and List 3 (+25%, 9903.88.03) 9 lines; they stack with the 12.5% 2026 duty.', None, None, 'China', ['fr-2026-20510', 'hts-now']),
    change('wro-id-palm', 'reference', '2026-09-29', 'Issued', 'CBP detains palm oil from two Indonesian producers',
           'CBP issued Withhold Release Orders under 19 U.S.C. 1307 against palm oil and its derivative products made by Mitra Aneka Rezeki and Hardaya '
           'Inti Plantation in Indonesia. Their shipments — and products traceable to their oil — are detained at every U.S. port unless the importer '
           'proves no forced labor was used. It does not change the tariff: palm oil from other Indonesian producers is still Free.',
           None, None, 'Indonesia', ['cbp-wro-mar-hip']),
    s338,
    s301,
    change('s122-end', 'extraDuty', '2026-07-23', 'Expired', 'Section 122 import surcharge expired',
           'The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.', '+10%', 'None', 'All', ['procl-11012', 'hts-now']),
    br,
    change('usmca-review', 'reference', '2026-07-01', 'Announced', 'USMCA joint review: not renewed, still in force',
           'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the '
           'issues or until termination, so USMCA claims (SPI S) still apply.', None, None, 'Canada, Mexico', ['ustr-usmca-review']),
    change('rfs-2026', 'reference', '2026-06-15', 'Effective', 'EPA sets 2026–2027 biofuel volumes; import RIN cut postponed',
           'EPA\'s final Renewable Fuel Standard rule for 2026 and 2027 raised the volume requirements but did not finalize the proposed "import RIN '
           'reduction", which would have given fewer RINs to fuel made from imported feedstocks such as canola oil, tallow or used cooking oil. EPA '
           'said it intends to adopt it from the 2028 compliance year or shortly after. No tariff change.', None, None, 'All', ['epa-rfs-2026']),
    change('s122-start', 'extraDuty', '2026-02-24', 'Effective', 'Section 122 surcharge replaces the IEEPA tariffs — coconut oil and waxes exempt',
           '10% on products of all countries (9903.03.01) until July 23, 2026. The product exemption list (9903.03.03) covered the same four Chapter 15 '
           'subheadings as the reciprocal-tariff exemption: coconut oil, vegetable waxes and bleached beeswax. USMCA-qualifying goods from Canada and '
           'Mexico were exempt (9903.03.07, 9903.03.08).', 'None', '+10% (until July 23, 2026)', 'All', ['procl-11012', 'hts-now']),
    change('ieepa-end', 'extraDuty', '2026-02-24', 'Effective', 'All IEEPA tariffs end',
           'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order '
           '14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 a.m. ET on '
           'February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.', 'Varied by country',
           'None', 'All', ['scotus-24-1287', 'eo-14389', 'csms-67834313']),
    change('45z-feedstock', 'reference', '2026-01-01', 'Effective', 'Clean fuel credit limited to North American feedstocks',
           'For transportation fuel produced after December 31, 2025, the section 45Z clean fuel production credit requires the fuel to be made '
           'exclusively from feedstock produced or grown in the United States, Mexico or Canada (section 45Z(f)(1)(A)(iii), added by the One Big '
           'Beautiful Bill Act). Treasury\'s proposed rules were published February 4, 2026. Imported tallow, used cooking oil or vegetable oil from '
           'other countries no longer earns the credit. No tariff change.', None, None, 'All except Canada, Mexico', ['irs-45z-nprm']),
    change('wro-fgv', 'reference', '2026-01-15', 'Modified', 'CBP lifts the detention order on FGV palm oil',
           'CBP modified the September 30, 2020 Withhold Release Order on palm oil and palm oil products of FGV Holdings Berhad (Malaysia), after the '
           'company remediated forced labor. FGV oil may enter again if otherwise compliant. CBP had likewise ended its 2022 finding on Sime Darby '
           'Plantation in February 2023.', 'Detained', 'Admitted', 'Malaysia',
           ['cbp-wro-fgv-mod', 'cbp-wro-fgv', 'fr-sime-darby-finding', 'fr-sime-darby-revoked']),
    change('ag-exemption', 'extraDuty', '2025-11-13', 'Effective', 'Coconut oil and waxes taken out of the reciprocal tariff',
           'Executive Order 14360 added agricultural products to the reciprocal-tariff exemption list (U.S. note 2(v)(iii), 9903.01.32), for goods entered '
           'from November 13, 2025. For Chapter 15 it listed coconut oil (1513.11, 1513.19), vegetable waxes (1521.10) and bleached beeswax (1521.90.20). '
           'Palm oil and every other Chapter 15 good stayed subject until all IEEPA duties ended on February 24, 2026.', '+10% or more',
           'None for listed goods', 'All countries subject to the reciprocal tariff', ['eo-14360', 'hts-now']),
    change('cn-ieepa-cut', 'extraDuty', '2025-11-10', 'Effective', 'China fentanyl duty cut to 10%',
           'The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It had no agricultural exemption, so it applied to every '
           'Chapter 15 line until it ended on February 24, 2026.', '+20%', '+10% (ended)', 'China', ['eo-14357']),
    change('br-40', 'extraDuty', '2025-08-06', 'Effective', '40% IEEPA duty on products of Brazil',
           'Executive Order 14323 (signed July 30, 2025) added 40% on goods of Brazil from August 6, 2025, on top of the 10% reciprocal duty. By the time '
           'it ended on February 24, 2026, its exemption list (9903.01.81, widened by EO 14361) named coconut oil, vegetable waxes and bleached beeswax; '
           'Brazilian tallow paid the full 50%.', 'None', '+40% (ended)', 'Brazil', ['eo-14323', 'eo-14361', 'hts-now']),
    change('ca-amended', 'extraDuty', '2025-07-31', 'Signed', 'Canada additional duty raised to 35%',
           'Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.', '+25%', '+35% (ended)', 'Canada', ['eo-14325']),
    change('reciprocal', 'extraDuty', '2025-04-02', 'Signed', 'Reciprocal tariff on products of all countries',
           '10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. Ended February 24, 2026.', 'None',
           '+10% or more (ended)', 'All except Canada, Mexico', ['eo-14257']),
    change('cn-ieepa', 'extraDuty', '2025-03-04', 'Effective', 'China fentanyl duty raised to 20%',
           'The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) to +20%, on top of the '
           'Section 301 duties.', '+10%', '+20% (ended)', 'China', ['eo-14195', 'eo-14228']),
    change('mx-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Mexico',
           '+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.', 'None', '+25% (ended)', 'Mexico',
           ['eo-14194']),
    change('ca-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Canada',
           '+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, 2026.', 'None',
           '+25% (ended)', 'Canada', ['eo-14193']),
]
changes.sort(key=lambda c: c['date'], reverse=True)
tu['changes'] = changes
used = {i for c in changes for i in c['sourceIds']} | {i for e in tu['inEffect'] for i in e['sourceIds']}
tu['sources'] = [s for s in tu['sources'] if s['id'] in used or s['id'] in ('hts-ch15', 'cbp-n347194', 'ustr-lca-2021')]
all_src = {s['id']: s for s in tu['sources']}
tu['stats'] = [
    {'label': 'Base rates unchanged', 'value': '108 of 108 lines', 'note': '6 new organic and avocado-oil statistical lines'},
    {'label': 'Extra duties in effect', 'value': str(len(tu['inEffect']))},
    {'label': 'Lines exempt from the 2026 Section 301 duty', 'value': f'{N_EXEMPT} of 114', 'note': 'more for 11 countries with exception lists'},
    {'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'},
]

# ---------------------------------------------------------------------------------------------
# Understand industry
# ---------------------------------------------------------------------------------------------
ui['h1'] = 'HTS Chapter 15: Animal, Vegetable or Microbial Fats and Oils — U.S. Import Statistics'
ui['seo'] = {
    'title': 'HTS Chapter 15 Import Statistics: U.S. Olive Oil, Palm Oil, Canola & Tallow Imports by Country | KoalaGains',
    'shortDescription': (f'U.S. imports of fats and oils 2020–2025 by country, product and year: {money(tot)} in 2025, down 6.8%. Canada (canola), '
                         'Indonesia (palm and coconut oil), Spain and Italy (olive oil) lead.'),
    'keywords': ['us olive oil imports by country', 'us palm oil imports', 'us canola oil imports canada', 'us tallow imports',
                 'soybean and palm oil import duty', 'hts chapter 15 import statistics', 'used cooking oil imports'],
}
ui['stats'][4]['note'] = 'Chemically modified and inedible fats and oils, incl. used cooking oil (1518.00)'
for c in ui['byCountry']:
    if c.get('mainHeading'):
        c['mainHeadingLabel'] = LABELS[c['mainHeading']][0]
ui['effectiveDuty'] = {'year': 2025, 'dutyPaidUsd': None, 'note': "Duty-collected figures aren't available from an official source yet."}
ui['why'] = (
    f'U.S. imports of Chapter 15 goods fell from **{money(prior_tot)} in 2024 to {money(tot)} in 2025** (-6.8%), after more than doubling since 2020 '
    f'({money(first_tot)}). The largest groups are canola oil (heading 1514, {money(by_heading["1514"])}), chemically modified and inedible fats '
    f'(1518, {money(by_heading["1518"])}), olive oil (1509, {money(by_heading["1509"])}), palm oil (1511, {money(by_heading["1511"])}), coconut and '
    f'palm kernel oil (1513, {money(by_heading["1513"])}) and tallow (1502, {money(by_heading["1502"])}).\n\n'
    f'Each big supplier has its own product. **Canada** ({money(ct["Canada"])}, down from {money(ct_prior["Canada"])}) ships canola oil — '
    f'{money(hc[("1514", "Canada")])} of it. **Indonesia** ({money(ct["Indonesia"])}) ships palm oil ({money(hc[("1511", "Indonesia")])}) and coconut '
    f'and palm kernel oil ({money(hc[("1513", "Indonesia")])}); **Malaysia** ({money(ct["Malaysia"])}, +61%) mostly heading 1518 and palm oil. '
    f'**Spain** ({money(ct["Spain"])}), **Italy** ({money(ct["Italy"])}) and **Tunisia** ({money(ct["Tunisia"])}) supply olive oil, and the '
    f'**Philippines** ({money(ct["Philippines"])}) coconut oil. Heading 1518 — which includes used cooking oil (CBP ruling N347194) — comes mainly from '
    f'China ({money(hc[("1518", "China")])}), Australia ({money(hc[("1518", "Australia")])}), Malaysia, Canada and South Korea, and tallow mainly from '
    f'Brazil ({money(hc[("1502", "Brazil")])}), Canada and Australia. **Mexico** ({money(ct["Mexico"])}) ships mostly heading 1515, which includes '
    'avocado oil.\n\n'
    'Many of these fats are feedstocks for biodiesel and renewable diesel, so U.S. biofuel rules move demand as much as tariffs do: since 2026 the '
    'section 45Z credit only counts fuel made from North American feedstock. USMCA-qualifying goods from Canada and Mexico — 29% of 2025 imports — '
    'enter free, and palm and coconut oil are exempt from the 2026 Section 301 duty for their main suppliers. 2025 is the latest full year of U.S. '
    'trade data.'
)
ui['sources'] = ui['sources'] + [
    {'label': 'USITC, HTSUS 2026 Revision 21, Chapter 99 (Section 301 exemption and country exception lists, U.S. note 52)', 'url': HTS_CH99},
    {'label': 'CBP ruling NY N347194 (used cooking oil, 1518.00.4000)', 'url': 'https://rulings.cbp.gov/ruling/N347194'},
]
usmca_share = (ct['Canada'] + ct['Mexico']) / tot
assert round(usmca_share * 100) == 29, usmca_share

# ---------------------------------------------------------------------------------------------
# Industry areas
# ---------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['seo'] = {
    'title': 'HTS Chapter 15 Tariff Rates by Country — Olive Oil from Spain & Italy, Palm Oil from Indonesia, Canola from Canada | KoalaGains',
    'shortDescription': ('The total U.S. tariff on fats and oils by country and product: base rate plus the 2026 Section 301 duty, with USMCA, EU '
                         'and palm-oil exception rules applied — Canada, Indonesia, Spain, Italy, Malaysia, Philippines, China, Brazil and more.'),
    'keywords': ['spain olive oil import duties', 'italian olive oil import duties', 'indonesia palm oil tariff exemption', 'palm oil tariff malaysia',
                 'canola oil tariffs canada', 'china tariff on vegetable oils', 'hts chapter 15 tariff rates by country', 'tariff on olive oil from greece'],
}
ia['intro'] = (
    'The total rate on fats and oils depends on **where they come from** as much as on what they are. Each cell below is the base rate for that '
    'product group plus the extra duty for that country, minus any preference — taken from the current tariff schedule.\n\n'
    'Since the IEEPA duties ended on February 24, 2026, the extra duty is the **Section 301 tariff on 60 economies** that started July 24, 2026. '
    '**USMCA-qualifying goods from Canada and Mexico enter free** (except used cooking oil from Canada, which pays 50%), **EU olive oil pays 10% '
    'in total**, **palm oil from Indonesia and Malaysia is Free**, and Brazil and China add up to 37.5%. Tunisia, outside the 60 economies, pays '
    'only the base rate.'
)
for g in ia['groups']:
    g['label'], g['shortLabel'] = LABELS[g['heading']]
RULE_LABELS = {
    'Canada': ('USMCA-qualifying: no Section 301 duty (9903.05.93). Otherwise base rate +10% (9903.05.29) on 107 of 114 lines; coconut oil and waxes '
               'pay the base rate only. 1518.00.40 (used cooking oil) also pays +50% Section 338 (9903.03.12), USMCA or not. The 35% IEEPA duty ended '
               'February 24, 2026.'),
    'Indonesia': ('Base rate +10% Section 301 (9903.05.45) on 100 of 114 lines. Palm oil, palm kernel oil, castor, nut and jojoba oil (country list, '
                  '9903.06.16) and coconut oil and waxes (9903.05.86) pay the base rate only. The IEEPA duty ended February 24, 2026.'),
    'Spain': ('EU: 10% in total where the base rate is lower, otherwise the base rate (9903.05.39), on 107 of 114 lines — so olive oil pays 10% of '
              'value. The 2019 Airbus-dispute duty on olive oil (9903.89.13) remains suspended.'),
    'Italy': ('EU: 10% in total where the base rate is lower, otherwise the base rate (9903.05.39), on 107 of 114 lines. Olive oil pays 10%; oil '
              'blends with soybean oil keep their 18% base rate.'),
    'Malaysia': ('Base rate +10% Section 301 (9903.05.54) on 103 of 114 lines. Palm oil, palm kernel oil (1513.29) and castor oil (country list, '
                 '9903.05.99) and coconut oil and waxes pay the base rate only; argan oil only when declared as such (9903.06.01, not applied here).'),
    'Philippines': 'Base rate +12.5% Section 301 (9903.05.64) on 107 of 114 lines. Coconut oil and waxes pay the base rate only; palm kernel oil pays the duty.',
    'Australia': ('Base rate +12.5% Section 301 (9903.05.23) on 107 of 114 lines. The Australia FTA (AU) is applied: it removes the base rate but not '
                  'the Section 301 duty; dairy butter substitutes over quota (1517.90.60) are not Free under it.'),
    'China': ('Base rate +12.5% Section 301 (9903.05.31) on 107 lines, plus +7.5% List 4A (9903.88.15, 104 lines) or +25% List 3 (9903.88.03, '
              '9 lines). Coconut oil and waxes pay only the List 4A duty; 1514.91.10 (on suspended List 4B) only the 12.5%.'),
    'Mexico': ('USMCA-qualifying: no extra duty (9903.05.94). Otherwise base rate +10% Section 301 (9903.05.55) on 107 of 114 lines. The 25% '
               'IEEPA duty ended February 24, 2026.'),
    'Brazil': ('Base rate +25% Section 301 Brazil (9903.05.01) +12.5% Section 301 (9903.05.27) on 107 of 114 lines. Coconut oil, carnauba and '
               'other vegetable waxes and bleached beeswax pay the base rate only.'),
    'Tunisia': 'Base rate only: Tunisia is not one of the 60 Section 301 economies, so its olive oil pays 3.4¢/kg in bulk or 5¢/kg on contents and container.',
    'Argentina': ('Base rate +10% Section 301 (9903.05.22) on 106 of 114 lines. Jojoba oil (country list, 9903.06.10), coconut oil and waxes pay '
                  'the base rate only; argan oil only when declared as such (9903.06.11, not applied here).'),
    'Any other country': ('From no extra duty (countries outside the 60 Section 301 economies, e.g. Tunisia, Ukraine, Kenya) to +12.5%, or 10%/12.5% '
                          'in total for other EU members, Japan, South Korea, Switzerland and Taiwan (9903.05.20–9903.05.84). Country exception '
                          'lists exempt palm and other tropical oils for Cambodia, Ecuador, Jordan, Guatemala, El Salvador, Switzerland, Bangladesh '
                          'and Taiwan.'),
}
for c in ia['countries']:
    c['rule']['label'] = RULE_LABELS[c['country']]
ia['assumptions'] = [a for a in ia['assumptions'] if not a.startswith('TODO')] + [
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.',
    'The 2019 Large Civil Aircraft duties (9903.89.13, olive oil from Germany, Spain and the United Kingdom) are printed but suspended since 2021 and are not applied.',
    f'The {N_EXEMPT} lines on the Section 301 general exemption list (U.S. note 52(b)) and the lines on each matrix country\'s own exception list (note 52(j)) are priced with no 2026 Section 301 duty.',
    'Antidumping and countervailing duties: no order covers a Chapter 15 line. Federal excise taxes do not apply to these goods.',
    'Dairy butter substitutes (1517.90.45, 1517.90.50) are in-quota lines that need general note 15 or a USDA import licence; the over-quota line (1517.90.60) can also face an agricultural special safeguard duty (9904.04) that is not included.',
    'The rate is not the only gate: CBP Withhold Release Orders detain palm oil from named producers, and animal fats must meet APHIS and FSIS entry rules (see the documents page).',
]
ia['exemptionCheck'] = (
    'Read U.S. notes 20, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 general exemption list (note 52(b), '
    f'9903.05.86) names 4 Chapter 15 subheadings ({N_EXEMPT} ten-digit lines: coconut oil 1513.11 and 1513.19, vegetable waxes 1521.10, bleached '
    'beeswax 1521.90.20), and the Brazil list (note 50(a)(ii), 9903.05.03) the same 4. Country exception lists (note 52(j)) name palm oil 1511.10/1511.90, '
    'palm kernel oil 1513.21/1513.29, castor oil 1515.30, nut oils 1515.90.21 or jojoba oil 1515.90.60 for Switzerland, Malaysia, Cambodia, '
    'Guatemala, El Salvador, Argentina, Bangladesh, Taiwan, Indonesia, Ecuador and Jordan, and argan oil (1515.90.81) by description for Malaysia, '
    'Argentina, Bangladesh and Taiwan. The EU (9903.05.97) and UK (9903.05.96) lists name no Chapter 15 line. Canada\'s Section 338 list (note 51(b)(1), '
    '9903.03.12) names 1518.00.40. China List 3 (9903.88.03) covers 9 lines and List 4A (9903.88.15) 104; 1514.91.10 is only on the suspended List '
    '4B. No 9903.88.69 product exclusion covers a Chapter 15 line. Note 21(d) (9903.89.13, olive oil from Germany, Spain and the UK) is suspended.'
)
for k in ['eo-14389', 'procl-11012', 'csms-67834313', 'ustr-lca-2021']:
    if k not in {s['id'] for s in ia['sources']}:
        ia['sources'].append(all_src[k])
ia['lastCheckedAt'] = TODAY

# ---------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['seo'] = {
    'title': 'Importing Olive Oil, Palm Oil & Edible Oils: FDA, USDA & CBP Rules and Legal Ways to Lower Duty (HTS Ch. 15) | KoalaGains',
    'shortDescription': ('The entry rules for each HTS Chapter 15 line — FDA registration, prior notice and FSVP, APHIS and FSIS rules for tallow and '
                         'lard, CBP palm-oil forced-labor orders, dairy licences — plus the legal ways to pay less: USMCA, exemption lists, bulk '
                         'containers, actual-use lines, drawback.'),
    'keywords': ['fda requirements for importing olive oil', 'importing palm oil forced labor wro', 'usmca tariff exemption on chapter 15 goods',
                 'rspo certified palm oil trade regulations', 'tallow import permit aphis', 'fsvp importer edible oil', 'used cooking oil import rules'],
}
te['intro'] = (
    'For fats and oils, **who made the oil and what it came from** decide whether a shipment is released. Every edible line needs a registered '
    'foreign facility, prior notice and an importer with a Foreign Supplier Verification Program. Lard and tallow must also clear APHIS and FSIS '
    'animal-product rules, and palm oil from producers under a CBP Withhold Release Order is detained however it is classified.\n\n'
    'The ways to pay less are written into the schedule: claim **USMCA** or another FTA, check the **Section 301 exemption and country lists** '
    '(coconut oil, palm oil from Indonesia and Malaysia), ship olive oil in **bulk containers** of 18 kg or more, use the **actual-use lines** for '
    'industrial rapeseed oil, or claim **drawback**. No antidumping or countervailing duty order applies to this chapter.'
)
te['lastCheckedAt'] = TODAY
te['regulationsAsOf'] = ECFR_AS_OF

te['levers'] = [
    {
        'id': 'usmca', 'title': 'Claim USMCA on goods from Canada or Mexico',
        'saves': 'The Section 301 duty (10% of value) plus the base rate — 6.4% on canola oil, 19.1% on soybean oil, 8% on oil blends',
        'appliesTo': 'All 114 lines, for goods that qualify as originating under USMCA',
        'document': 'A certification of origin from the importer, exporter or producer. It need not follow a prescribed format; it can be on the invoice or another document, and CBP can ask for it.',
        'caveat': ('Oil crushed in Canada or Mexico from seed grown elsewhere may not qualify; check the product-specific rule. The 50% Section 338 duty on '
                   'Canadian 1518.00.40 (used cooking oil) applies even to USMCA goods. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.'),
        'citations': [
            {'label': '19 CFR 182.12', 'url': ecfr(19, '182.12')},
            {'label': 'HTSUS 9903.05.93 / 9903.05.94; U.S. note 51(a)', 'url': HTS_CH99},
            {'label': 'USTR statement on the USMCA joint review (July 1, 2026)', 'url': all_src['ustr-usmca-review']['url']},
        ],
    },
    {
        'id': 'fta', 'title': 'Claim another free trade agreement',
        'saves': 'The base rate: nearly every dutiable line is Free for FTA partners such as Australia, Chile, Colombia, Israel, Korea, Morocco, Peru and CAFTA-DR',
        'appliesTo': 'Dutiable lines, for originating goods of the partner country (the special-rate column lists who qualifies)',
        'document': 'Proof of origin as the agreement requires (certification or declaration), kept on file and given to CBP on request.',
        'caveat': ('An FTA claim removes the base rate but not the 2026 Section 301 duty for that country (U.S. note 52(a)). Dairy butter substitutes over '
                   'quota (1517.90.60) are Free only for the partners named on the line.'),
        'citations': [
            {'label': 'HTSUS General Notes 3(c), 8–32', 'url': HTS_GN},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a)', 'url': HTS_CH99},
        ],
    },
    {
        'id': 's301-exempt', 'title': 'Check the Section 301 exemption list',
        'saves': 'The whole 2026 Section 301 duty (10%–12.5%, or 25% + 12.5% for Brazil) — the line pays only its base rate',
        'appliesTo': f'{N_EXEMPT} lines for every country: coconut oil, crude and refined (1513.11, 1513.19), vegetable waxes such as carnauba and candelilla (1521.10), bleached beeswax (1521.90.20)',
        'document': 'Correct classification on the entry (the exemption follows the HTS subheading; it is filed with 9903.05.86 / 9903.05.03).',
        'caveat': 'Palm kernel oil (1513.21, 1513.29) is not on the general list. China still pays its List 4A duty on these lines.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 50(a)(ii) and 52(b)', 'url': HTS_CH99},
            {'label': '91 FR 47318 (USTR, July 28, 2026)', 'url': all_src['fr-2026-15181']['url']},
        ],
    },
    {
        'id': 's301-country', 'title': 'Use the supplier country\'s exception list (palm and other tropical oils)',
        'saves': 'The 2026 Section 301 duty (10%–12.5%) on palm oil, palm kernel oil, castor oil, nut oils or jojoba oil from the listed countries',
        'appliesTo': ('Indonesia, Cambodia, Ecuador, Jordan: palm, palm kernel, castor, nut and jojoba oils; Malaysia: palm, refined palm kernel and castor oil; '
                      'Guatemala and El Salvador: some of these; Switzerland: castor and nut oils; Argentina: jojoba; Bangladesh: castor; Taiwan: refined palm oil. '
                      'Argan oil (1515.90.81) by description for Malaysia, Argentina, Bangladesh and Taiwan.'),
        'document': 'Entry of goods that are products of the listed country, filed with that country\'s exception heading (9903.05.98–9903.06.21).',
        'caveat': 'The lists follow origin, not the shipping port: palm oil refined or transshipped elsewhere takes the origin CBP assigns. Other countries (Colombia, Brazil, the Philippines for palm kernel oil) pay the duty.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(j)', 'url': HTS_CH99},
            {'label': '91 FR 47318 (USTR, July 28, 2026)', 'url': all_src['fr-2026-15181']['url']},
        ],
    },
    {
        'id': 'bulk', 'title': 'Import olive oil in bulk and bottle it in the U.S.',
        'saves': 'Olive and pomace oil in containers of 18 kg or more pay 3.4¢/kg on the oil instead of 5¢/kg on contents and container',
        'appliesTo': 'Olive oil and olive-pomace oil (1509.20–1509.90, 1510.10, 1510.90)',
        'document': 'Entry under the "Other" (bulk) subheading, with the container weight shown on the packing list.',
        'caveat': 'For EU, Turkish and other Section 301 origins the percentage duty (10%–12.5% of value) is far larger than either per-kg rate, so the saving is small there.',
        'citations': [{'label': 'HTSUS Ch. 15, headings 1509–1510', 'url': HTS_CH15}],
    },
    {
        'id': 'actual-use', 'title': 'Use the actual-use and special-grade lines',
        'saves': 'Free instead of 6.4% (rapeseed or mustard oil for rubber substitutes or lubricants), Free instead of 19.1% (pharmaceutical-grade soybean oil for intravenous fat emulsions), Free instead of 3.4¢–5¢/kg (pomace oil rendered unfit for food)',
        'appliesTo': '1514.91.10, 1514.99.10, 1507.90.20, 1510.90.10',
        'document': 'For actual-use lines, proof of use within 3 years of entry kept by the importer and available to CBP; for 1507.90.20, proof the oil meets FDA requirements for intravenous use.',
        'caveat': 'Goods not used as declared owe the higher duty. The 2026 Section 301 duty still applies to these lines.',
        'citations': [{'label': '19 CFR 10.131–10.139 (actual use)', 'url': ecfr(19, '10.133')}, {'label': 'HTSUS Ch. 15', 'url': HTS_CH15}],
    },
    {
        'id': 'dairy-quota', 'title': 'Enter dairy butter substitutes within the quota',
        'saves': '11¢/kg in quota instead of 34.2¢/kg over quota',
        'appliesTo': 'Butter substitutes and other dairy fat blends of 1517.90 (1517.90.45, 1517.90.50 vs 1517.90.60)',
        'document': 'A USDA dairy import licence for licensed quota goods (additional U.S. note 10 to chapter 4), or entry under general note 15.',
        'caveat': 'Over-quota goods can also face an agricultural special safeguard duty (9904.04); Australia and Colombia have their own FTA quotas (9822.04.25, 9918.04.60).',
        'citations': [{'label': '7 CFR 6.20', 'url': ecfr(7, '6.20')}, {'label': 'HTSUS Ch. 15, 1517.90.45–1517.90.60', 'url': HTS_CH15}],
    },
    {
        'id': 'drawback', 'title': 'Claim drawback on goods you export or destroy',
        'saves': 'Up to 99% of the ordinary customs duties paid, when the imported oil (or goods made from it) is exported or destroyed',
        'appliesTo': 'Any line, for importers who re-export — for example oil refined or blended and shipped abroad',
        'document': 'A drawback claim filed with CBP with proof of import, use and export.',
        'caveat': 'Confirm with CBP whether a given Chapter 99 duty is eligible before relying on it.',
        'citations': [{'label': '19 CFR part 191', 'url': ecfr_part(19, 191)}],
    },
    {
        'id': 'ruling', 'title': 'Get a binding ruling before you import',
        'saves': 'Certainty: a ruling fixes the classification — virgin vs. refined olive oil, blend vs. single oil, edible vs. inedible, 1518 vs. fatty acids of Chapter 38 — before the goods arrive',
        'appliesTo': 'Any line where the classification decides the rate',
        'document': 'A ruling request to CBP describing the product, its composition and how it is processed and packed.',
        'caveat': 'Rulings apply to the transaction described. Fatty acids and refined glycerol are outside Chapter 15 (Chapters 38 and 29), and fatty acids from Indonesia and Malaysia are under antidumping and countervailing duty investigation.',
        'citations': [{'label': '19 CFR part 177', 'url': ecfr_part(19, 177)}, {'label': 'CBP ruling N347194 (used cooking oil)', 'url': 'https://rulings.cbp.gov/ruling/N347194'}],
    },
]

WRO_CITES = [
    {'label': '19 CFR 12.42', 'url': ecfr(19, '12.42')},
    {'label': 'CBP: WROs on Mitra Aneka Rezeki and Hardaya Inti Plantation (September 29, 2026)', 'url': all_src['cbp-wro-mar-hip']['url']},
    {'label': 'CBP: FGV Holdings WRO modified (January 15, 2026)', 'url': all_src['cbp-wro-fgv-mod']['url']},
    {'label': 'CBP: Withhold Release Orders and Findings list', 'url': 'https://www.cbp.gov/trade/forced-labor/withhold-release-orders-and-findings'},
]
te['rules'] = [
    {'id': 'fda-registration', 'agency': 'FDA', 'title': 'Food facility registration: the foreign plant that makes, packs or holds the food must be registered with FDA',
     'citations': [{'label': '21 CFR 1.225', 'url': ecfr(21, '1.225')}, {'label': '21 CFR 1.226 (exemptions)', 'url': ecfr(21, '1.226')}]},
    {'id': 'fda-prior-notice', 'agency': 'FDA', 'title': 'Prior notice of every food shipment before it arrives',
     'citations': [{'label': '21 CFR 1.279', 'url': ecfr(21, '1.279')}]},
    {'id': 'fsvp', 'agency': 'FDA', 'title': 'Foreign Supplier Verification Program (FSVP): the importer must verify that each foreign supplier produces the food safely',
     'citations': [{'label': '21 CFR 1.502', 'url': ecfr(21, '1.502')},
                   {'label': 'FDA: FSVP final rule', 'url': 'https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-foreign-supplier-verification-programs-fsvp-importers-food-humans-and-animals'}]},
    {'id': 'fda-pho', 'agency': 'FDA', 'title': 'Partially hydrogenated oils (PHOs) are not allowed in food: FDA revoked their remaining authorized uses, including in margarine and shortening, from December 22, 2023',
     'citations': [{'label': '88 FR 53764 (August 9, 2023)', 'url': fr('2023-08-09', '2023-16725', 'revocation-of-uses-of-partially-hydrogenated-oils-in-foods')},
                   {'label': '88 FR 86580 (effective date confirmed)', 'url': fr('2023-12-14', '2023-27506', 'revocation-of-uses-of-partially-hydrogenated-oils-in-foods-confirmation-of-effective-date')}]},
    {'id': 'fda-seafood-haccp', 'agency': 'FDA', 'title': 'Seafood HACCP: edible fish oils are fishery products; the importer must hold proof the foreign processor follows seafood HACCP',
     'citations': [{'label': '21 CFR 123.12', 'url': ecfr(21, '123.12')}]},
    {'id': 'fsis-edible-fat', 'agency': 'USDA FSIS', 'title': 'Edible lard and tallow are meat food products: only from countries and establishments FSIS lists as eligible, with a foreign health certificate, and reinspected at entry',
     'citations': [{'label': '9 CFR 327.2', 'url': ecfr(9, '327.2')}, {'label': '9 CFR part 327', 'url': ecfr_part(9, 327)}]},
    {'id': 'aphis-bse', 'agency': 'USDA APHIS', 'title': 'Animal disease rules: tallow, processed fats and their derivatives from ruminants are restricted for BSE unless the conditions of 9 CFR 95.4 are met',
     'citations': [{'label': '9 CFR 95.4', 'url': ecfr(9, '95.4')}]},
    {'id': 'usda-dairy-licence', 'agency': 'USDA FAS', 'title': 'Dairy import licence for butter substitutes entered under the licensed tariff-rate quota',
     'citations': [{'label': '7 CFR 6.20', 'url': ecfr(7, '6.20')}]},
    {'id': 'ams-organic', 'agency': 'USDA AMS', 'title': 'Certified-organic lines: an NOP import certificate for each organic shipment',
     'citations': [{'label': '7 CFR 205.273', 'url': ecfr(7, '205.273')}]},
    {'id': 'cbp-forced-labor', 'agency': 'CBP', 'title': 'Forced-labor orders: palm oil and palm oil products of Mitra Aneka Rezeki and Hardaya Inti Plantation (Indonesia) are detained under Withhold Release Orders issued September 29, 2026; the FGV order (Malaysia) was lifted January 15, 2026',
     'citations': WRO_CITES},
    {'id': 'tsca', 'agency': 'EPA / CBP', 'title': 'TSCA import certification for chemical substances not imported as food, drugs or cosmetics (e.g. crude glycerol, inedible fats for industry)',
     'citations': [{'label': '19 CFR 12.121', 'url': ecfr(19, '12.121')}, {'label': '40 CFR 707.20', 'url': ecfr(40, '707.20')}]},
    {'id': 'biofuel', 'agency': 'EPA / Treasury', 'title': 'Biofuel feedstock rules: RIN-generating fuel needs feedstock records under the Renewable Fuel Standard, and since 2026 the 45Z credit only counts feedstock grown or produced in the U.S., Mexico or Canada',
     'citations': [{'label': '40 CFR 80.1454', 'url': ecfr(40, '80.1454')},
                   {'label': '91 FR 16388 (RFS 2026–2027, April 1, 2026)', 'url': all_src['epa-rfs-2026']['url']},
                   {'label': '26 U.S.C. 45Z', 'url': 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title26-section45Z&num=0&edition=prelim'},
                   {'label': '91 FR 5160 (proposed 45Z rules, February 4, 2026)', 'url': all_src['irs-45z-nprm']['url']}]},
    {'id': 'cbp-marking', 'agency': 'CBP', 'title': 'Country-of-origin marking on each retail container (bottled olive oil, cooking oil, margarine)',
     'citations': [{'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')}]},
]
FOOD = ['fda-registration', 'fda-prior-notice', 'fsvp']
GROUP_RULES = {
    '1501': (FOOD + ['fsis-edible-fat', 'aphis-bse', 'biofuel'], 'Edible lard needs FSIS eligibility; choice white and yellow grease for feed or fuel follow APHIS rules and, as biofuel feedstock, the RFS and 45Z rules.'),
    '1502': (FOOD + ['fsis-edible-fat', 'aphis-bse', 'biofuel', 'tsca'], 'Edible tallow is a meat food product under FSIS; inedible tallow from ruminants is restricted for BSE (9 CFR 95.4). Tallow is a major biofuel feedstock.'),
    '1503': (FOOD + ['fsis-edible-fat', 'aphis-bse'], 'Lard and tallow oils follow the same FSIS and APHIS rules as lard and tallow.'),
    '1504': (FOOD + ['fda-seafood-haccp'], 'Edible fish oils are fishery products under seafood HACCP. Fish-oil supplements in capsules are classified outside Chapter 15.'),
    '1505': (['tsca'], 'Lanolin for cosmetics is an FDA-regulated cosmetic ingredient; for industrial uses it needs TSCA certification.'),
    '1506': (FOOD + ['aphis-bse'], 'Animal-derived oils follow APHIS rules for the species they come from.'),
    '1507': (FOOD + ['biofuel'], 'Soybean oil for fuel use falls under the RFS feedstock rules; pharmaceutical-grade oil (1507.90.20) must meet FDA requirements for intravenous use.'),
    '1508': (FOOD, None),
    '1509': (FOOD + ['ams-organic', 'cbp-marking'], 'FDA has no standard of identity for olive oil; USDA grade standards are voluntary. Bottles for retail sale must show the country of origin.'),
    '1510': (FOOD + ['cbp-marking'], None),
    '1511': (FOOD + ['cbp-forced-labor', 'biofuel'], 'Palm oil traceable to a producer under a Withhold Release Order is detained, whatever its country of shipment.'),
    '1512': (FOOD + ['ams-organic'], None),
    '1513': (FOOD + ['ams-organic', 'cbp-forced-labor'], 'Palm kernel oil from producers under a Withhold Release Order is detained like palm oil.'),
    '1514': (FOOD + ['biofuel'], 'Canola oil is a leading biofuel feedstock; Canadian oil keeps 45Z eligibility because Canada is a qualifying origin.'),
    '1515': (FOOD + ['ams-organic', 'tsca'], 'Castor and linseed oil for industrial use need TSCA certification; organic avocado and other oils need an NOP import certificate.'),
    '1516': (FOOD + ['fda-pho', 'cbp-forced-labor'], 'Partially hydrogenated oils may not be used in food in the United States; fully hydrogenated oils are not affected.'),
    '1517': (FOOD + ['fda-pho', 'usda-dairy-licence', 'cbp-forced-labor', 'cbp-marking'], 'Margarine and shortening may not contain partially hydrogenated oils; dairy butter substitutes need a licence for in-quota entry.'),
    '1518': (['tsca', 'biofuel', 'cbp-forced-labor'], 'Used cooking oil and other inedible fats are mostly imported as biofuel feedstock; from Canada, 1518.00.40 also pays the 50% Section 338 duty.'),
    '1520': (['tsca'], 'Crude glycerol for industrial use needs TSCA certification; refined glycerol is Chapter 29.'),
    '1521': (['tsca'], 'Beeswax and carnauba wax for food or cosmetics follow FDA rules; for industrial use, TSCA certification.'),
    '1522': (['tsca'], None),
}
for g in te['groups']:
    g['label'] = LABELS[g['heading']][0]
    ids, note = GROUP_RULES[g['heading']]
    g['ruleIds'] = ids
    g['note'] = note

ORGANIC_HEADINGS = ('1509', '1512', '1513', '1515')
for ln in te['lines']:
    h = ln['heading']
    rules = []
    for r in GROUP_RULES[h][0]:
        if r == 'ams-organic' and 'organic' not in (ln['description'] + ' '.join(ln['ancestorPath'])).lower():
            continue
        if r == 'fsis-edible-fat' and ln['hts'] in ('1502.10.00.40',):  # inedible tallow
            continue
        if r == 'fda-seafood-haccp' and ln['hts'].startswith('1504.30'):  # marine mammals
            continue
        if r == 'usda-dairy-licence' and not ln['hts'].startswith(('1517.90.45', '1517.90.50', '1517.90.60')):
            continue
        if r == 'cbp-forced-labor' and h == '1513' and not ln['hts'].startswith(('1513.21', '1513.29')):
            continue
        if r == 'biofuel' and h == '1507' and ln['hts'].startswith('1507.90.20'):
            continue
        rules.append(r)
    if ln['hts'].startswith('1502.10.00.40'):
        rules = [r for r in rules if r not in FOOD]
    ln['ruleIds'] = rules
    levers = ['usmca']
    if ln['general'] not in (None, 'Free'):
        levers.append('fta')
    if ln['hts'].startswith(tuple(EX52B)):
        levers.append('s301-exempt')
    if ln['hts'] in COUNTRY_LIST_LINES or ln['hts'].startswith(ARGAN):
        levers.append('s301-country')
    if h in ('1509', '1510') and ln['general'] not in (None, 'Free'):
        levers.append('bulk')
    if ln['hts'].startswith(('1514.91.10', '1514.99.10', '1507.90.20', '1510.90.10')):
        levers.append('actual-use')
    if ln['hts'].startswith(('1517.90.45', '1517.90.50', '1517.90.60')):
        levers.append('dairy-quota')
    levers += ['drawback', 'ruling']
    ln['leverIds'] = levers
te['disclaimer'] = ('A checklist of where the rules are, with links to the regulations — not legal advice. Withhold Release Orders are added and '
                    'modified without notice in the Federal Register; check CBP\'s current list before buying palm oil from a new supplier.')

# ---------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['seo'] = {
    'title': 'Olive Oil, Palm Oil & Vegetable Oil Tariffs FAQ: HS Codes and U.S. Duties (HTS Ch. 15) | KoalaGains',
    'shortDescription': ('Answers to what people search about fats and oils tariffs: olive oil from Spain, Italy and Greece, palm oil exemptions for '
                         'Indonesia and Malaysia, HS codes for olive, palm, coconut, soybean, canola, sunflower, fish and used cooking oil.'),
    'keywords': ['olive oil tariffs us', 'olive oil tariff code', 'are there tariffs on italian olive oil', 'tariff on olive oil from spain',
                 'palm oil tariff exemption', 'palm oil hs code', 'coconut oil tariff exemption', 'soybean oil tariff code', 'canola oil tariff code',
                 'sunflower oil tariff code', 'hs code for used cooking oil', 'fish oil tariff code', 'avocado oil tariff code', 'beeswax tariff code'],
}
fc['intro'] = ('Straight answers to the most common questions about importing fats and oils into the U.S. — tariffs by country, HS codes and the '
               'rules that decide whether a shipment is released. Each answer links to the page with the full detail.')
fc['keyTakeaways'] = [
    'USMCA-qualifying goods from Canada and Mexico enter free — no base rate, no Section 301 duty — except Canadian used cooking oil (1518.00.40), which pays 50% under Section 338.',
    'The 2025 IEEPA tariffs ended on February 24, 2026. Since July 24, 2026 the extra duty is a Section 301 tariff: 10% in total for EU olive oil, +10% or +12.5% for most other suppliers, +37.5% for Brazil and up to +37.5% for China.',
    'Coconut oil and vegetable waxes are exempt for every country, and palm oil is exempt for Indonesia, Malaysia and other countries with exception lists. Tunisian olive oil pays only its base rate.',
    'No antidumping order covers these goods, but CBP forced-labor orders can stop palm oil from named producers, and animal fats must meet USDA rules.',
]
fc['lastCheckedAt'] = TODAY
fc['questionSource'] = f'Google search suggestions, collected {QUESTIONS_COLLECTED}'
fc['faqs'] = [
    {'id': 'olive-oil-tariff', 'question': 'Are there tariffs on olive oil imported into the U.S.?',
     'searchedAs': ['olive oil tariffs', 'olive oil tariffs us', 'are there tariffs on olive oil', 'olive oil prices tariffs'],
     'answer': ('Yes. The base rate is small — 5¢/kg on contents and container for bottles under 18 kg, 3.4¢/kg in bulk — but most suppliers also pay '
                'the 2026 Section 301 duty. EU olive oil pays 10% of value in total, Turkish olive oil the base rate plus 12.5%. Olive oil from Tunisia, '
                'which is not one of the 60 economies, pays only the base rate, and FTA partners such as Morocco or Chile pay no base rate but still pay the 12.5% Section 301 duty.'),
     'link': 'industry-areas'},
    {'id': 'olive-oil-eu', 'question': 'What is the tariff on olive oil from Spain, Italy or Greece?',
     'searchedAs': ['tariff on olive oil from spain', 'olive oil tariffs italy', 'are there tariffs on italian olive oil', 'tariffs on olive oil from greece', 'italian olive oil tariffs'],
     'answer': ('10% of value in total. Since July 24, 2026 EU goods whose base rate is under 10% pay 10% in all (9903.05.39), and olive oil\'s 3.4¢–5¢/kg '
                'is far below that. This replaced the 15% IEEPA rate that ended February 24, 2026. The 25% duty on Spanish olive oil from the 2019 '
                'Airbus dispute (9903.89.13) is still suspended.'),
     'link': 'industry-areas'},
    {'id': 'hs-olive-oil', 'question': 'What is the HS code for olive oil?',
     'searchedAs': ['hs code for olive oil', 'olive oil tariff code', 'hs code for olive oil extra virgin', 'hs code for virgin olive oil', 'hs code for pomace olive oil', 'hs code 1509'],
     'answer': ('Heading 1509: extra virgin olive oil 1509.20, virgin olive oil 1509.30, other virgin olive oils (such as lampante) 1509.40, and refined or '
                'blended ("pure") olive oil 1509.90. Olive-pomace oil is 1510. In the U.S. schedule each splits by container — under 18 kg (1509.20.20, '
                '5¢/kg on contents and container) or bulk (1509.20.90, 3.4¢/kg) — and certified-organic oil has its own statistical suffix.'),
     'link': ''},
    {'id': 'palm-oil-exempt', 'question': 'Is palm oil exempt from U.S. tariffs?',
     'searchedAs': ['palm oil tariff exemption', 'palm oil tariff indonesia', 'palm oil tariff malaysia', 'palm oil duty', 'indonesian palm oil tariff'],
     'answer': ('Palm oil has no base rate (Free), and palm oil from Indonesia and Malaysia is on their Section 301 exception lists, so it pays nothing. '
                'Cambodia, Ecuador, Jordan, Guatemala, El Salvador and Taiwan (refined palm oil) have the same exemption. From Colombia, Brazil or the '
                'Philippines palm oil pays the 12.5% Section 301 duty (37.5% for Brazil), and from China 20%. Palm oil from producers under a CBP forced-labor order is detained.'),
     'link': 'industry-areas'},
    {'id': 'hs-palm-oil', 'question': 'What is the HS code for palm oil and palm kernel oil?',
     'searchedAs': ['hs code for palm oil', 'hs code for crude palm oil', 'hs code for refined palm oil', 'hs code for rbd palm oil', 'hs code for palm olein', 'hs code for palm kernel oil', 'palm oil tariff code'],
     'answer': ('Crude palm oil is 1511.10.00; refined, bleached and deodorized (RBD) palm oil, palm olein and palm stearin are 1511.90.00. Palm kernel oil '
                'is 1513.21.00 (crude) or 1513.29.00 (other). All are Free. Hydrogenated palm oil is 1516.20, and palm fatty acid distillate and other '
                'fatty acids are Chapter 38.'),
     'link': ''},
    {'id': 'wro-palm', 'question': 'Which palm oil imports are blocked for forced labor?',
     'searchedAs': ['palm oil forced labor', 'palm oil withhold release order', 'rspo certified palm oil trade regulations'],
     'answer': ('On September 29, 2026 CBP issued Withhold Release Orders on palm oil and its derivative products made by Mitra Aneka Rezeki and Hardaya '
                'Inti Plantation in Indonesia; their shipments are detained unless the importer proves no forced labor was used. CBP lifted its order '
                'on FGV Holdings (Malaysia) on January 15, 2026 and ended its Sime Darby finding in 2023. Certification schemes are not a legal '
                'substitute for that proof.'),
     'link': 'tariff-engineering'},
    {'id': 'coconut-oil', 'question': 'Is coconut oil exempt from tariffs, and what is its HS code?',
     'searchedAs': ['coconut oil tariff exemption', 'coconut oil tariffs', 'coconut oil tariff code', 'hs code for coconut oil', 'hs code for virgin coconut oil'],
     'answer': ('Yes. Coconut oil is 1513.11.00 (crude) or 1513.19.00 (other, including refined and virgin coconut oil, with a certified-organic suffix), '
                'with no base rate, and both are on the 2026 Section 301 exemption list for every country. Only China still adds its 7.5% List 4A duty. '
                'Coconut oil was also exempted from the reciprocal tariff in November 2025 and from the Section 122 surcharge.'),
     'link': 'tariff-updates'},
    {'id': 'soybean-oil', 'question': 'What is the tariff on soybean oil?',
     'searchedAs': ['soybean oil tariff', 'soybean oil tariff code', 'soybean oil hs code'],
     'answer': ('Soybean oil is 1507.10 (crude) and 1507.90.40 (once-refined or fully refined), both 19.1% — the highest ad valorem rate in the chapter. '
                'Pharmaceutical-grade oil for intravenous fat emulsions (1507.90.20) is Free. Section 301 duties come on top for most origins; '
                'USMCA-qualifying soybean oil from Canada or Mexico is Free. Blends containing 5% or more soybean oil are 1517.90.10 at 18%.'),
     'link': ''},
    {'id': 'canola-oil', 'question': 'What is the tariff on canola oil from Canada?',
     'searchedAs': ['canola oil tariffs', 'canola oil tariffs canada', 'canola oil tariff code', 'canola oil hs code'],
     'answer': ('Canola oil is 1514.11.00 (crude) or 1514.19.00 (other), with a 6.4% base rate. USMCA-qualifying canola oil from Canada is Free and exempt '
                'from the 10% Section 301 duty; oil that does not qualify pays 16.4%. Canada shipped $3.04B of canola oil to the U.S. in 2025, '
                'the chapter\'s largest single flow.'),
     'link': 'industry-areas'},
    {'id': 'sunflower-oil', 'question': 'What is the HS code and tariff for sunflower oil?',
     'searchedAs': ['sunflower oil tariff code', 'sunflower oil tariff', 'hs code for sunflower oil', 'hs code for refined sunflower oil', 'hs code high oleic sunflower oil'],
     'answer': ('Sunflower-seed oil is 1512.11 (crude) or 1512.19 (refined and other), at 1.7¢/kg + 3.4%; high-oleic sunflower oil is classified the '
                'same way, and organic oil has its own statistical suffix. Ukrainian sunflower oil pays only that rate; Argentine oil adds 10% and '
                'Turkish oil 12.5% under Section 301.'),
     'link': ''},
    {'id': 'uco', 'question': 'What is the HS code and tariff for used cooking oil?',
     'searchedAs': ['used cooking oil tariff', 'used cooking oil tariff code', 'hs code for used cooking oil', 'waste cooking oil hs code'],
     'answer': ('CBP classifies used cooking oil in 1518.00.40 (ruling N347194), with an 8% base rate. Since September 15, 2026 Canadian used cooking oil '
                'pays a 50% Section 338 duty even under USMCA. From China it pays 8% + 20%, from Malaysia 8% + 10%. Imported used cooking oil from '
                'outside North America no longer earns the 45Z clean fuel credit.'),
     'link': 'tariff-updates'},
    {'id': 'fish-oil', 'question': 'What is the tariff code for fish oil and cod liver oil?',
     'searchedAs': ['fish oil tariff code', 'cod liver oil tariff code', 'hs code for fish oil', 'hs code for cod liver oil', 'hs code crude fish oil'],
     'answer': ('Fish-liver oils are 1504.10 — cod liver oil Free, others 2.5%. Other fish oils are 1504.20: cod Free, herring 1¢/kg, menhaden and other '
                'fish oil 1.5¢/kg + 5%. Fish-oil capsules put up as dietary supplements are generally classified outside Chapter 15. From China fish oils '
                'add 37.5% in Section 301 duties.'),
     'link': ''},
    {'id': 'avocado-oil', 'question': 'What is the tariff code for avocado oil?',
     'searchedAs': ['avocado oil tariff code', 'avocado oil tariff', 'avocado oil hs code'],
     'answer': ('Avocado oil is 1515.90.81 (statistical suffixes .20 certified organic, .40 other), at 3.2%. USMCA-qualifying avocado oil from Mexico is '
                'Free; from other Section 301 economies the duty is added on top.'),
     'link': ''},
    {'id': 'margarine', 'question': 'What is the tariff code for margarine and shortening?',
     'searchedAs': ['margarine tariff code', 'margarine import duties', 'hs code 1517'],
     'answer': ('Margarine (not liquid) is 1517.10.00 at 12.3¢/kg. Shortenings, frying fats and cooking-oil blends are 1517.90: 18% if they contain 5% or '
                'more soybean oil (1517.90.10), otherwise 8% (1517.90.20). Dairy-based butter substitutes are under a tariff-rate quota: 11¢/kg in quota, '
                '34.2¢/kg over it. Partially hydrogenated oils may no longer be used in these foods.'),
     'link': ''},
    {'id': 'beeswax', 'question': 'What is the tariff code for beeswax?',
     'searchedAs': ['beeswax tariff code', 'hs code for beeswax'],
     'answer': ('Beeswax is heading 1521.90: bleached beeswax 1521.90.20 at 4.8%, other beeswax and insect waxes 1521.90.40 Free. Carnauba and candelilla '
                'waxes are 1521.10, Free. Bleached beeswax and vegetable waxes are on the Section 301 exemption list for every country.'),
     'link': ''},
]

json.dump(d, open(FILE, 'w'), ensure_ascii=False, indent=2)


def todos(o, path=''):
    out = []
    if isinstance(o, dict):
        for k, v in o.items():
            out += todos(v, f'{path}.{k}')
    elif isinstance(o, list):
        for i, v in enumerate(o):
            out += todos(v, f'{path}[{i}]')
    elif isinstance(o, str) and 'TODO' in o:
        out.append(path)
    return out


print('remaining TODOs:', todos(d))
print('exempt', N_EXEMPT, 'country-list lines', len(COUNTRY_LIST_LINES), 'dutiable', N_DUTIABLE, 'usmca share', round(usmca_share * 100, 1))
