#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 65 content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill65.py <generated.json> <out.json>
Re-runnable: run.sh regenerates the data parts, then runs this script.
"""
import glob
import json
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
WT = '/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui'
TODAY = '2026-10-13'
SUGG_DATE = 'October 13, 2026'

d = json.load(open(SRC))

# Official sources already used (and checked) in other chapter files, by id.
REF_SOURCES = {}
for f in sorted(glob.glob(f'{WT}/src/tariff-data/chapters/*.json')):
    if '/65-' in f:
        continue
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            REF_SOURCES.setdefault(s['id'], s)

CH65_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2065'
CH98_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
CH99_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
GN_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
USC_4454 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap28-subchapVIII-sec4454.htm'
OTEXA_NEPAL = 'https://www.trade.gov/otexa-nepal-trade-preference-program'
FR_EXCL = (
    'https://www.federalregister.gov/documents/2025/12/01/2025-21671/'
    'notice-of-product-exclusion-extensions-chinas-acts-policies-and-practices-related-to-technology'
)
FR_CPSC_CERT = 'https://www.federalregister.gov/documents/2025/01/08/2024-30826/certificates-of-compliance'


def ecfr(title, section):
    return f'https://www.ecfr.gov/current/title-{title}/section-{section}'


def ecfr_part(title, part):
    return f'https://www.ecfr.gov/current/title-{title}/part-{part}'


def fmt_usd(n):
    if n >= 1e9:
        return f'${n / 1e9:.2f}B'
    if n >= 1e6:
        return f'${n / 1e6:.0f}M' if n >= 1e8 else f'${n / 1e6:.1f}M'
    return f'${n / 1e3:.0f}K'


def pct(a, b):
    return round((a / b - 1) * 100, 1)


# ---------------------------------------------------------------------------------------------------
# Trade figures
# ---------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
trade = json.load(open(f'{WT}/src/tariff-data/trade/chapter-65.json'))
Y = trade['latestYear']
PY = trade['priorYear']
year_tot = {r['year']: r['totalUsd'] for r in trade['totalsByYear']}
total, prior_total = year_tot[Y], year_tot[PY]
by_c_all = {c['country']: c for c in trade['byCountry']}
by_h = {h['heading']: h['byYear'] for h in trade['byHeading']}
by_hs6 = {x['hs6']: x for x in trade['byHs6']}
by_hc = {}
for x in trade['byHeadingCountry']:
    by_hc[(x['heading'], x['country'])] = x['importsUsd']


def imp(country):
    c = by_c_all.get(country)
    return c['importsUsd'] if c else 0


def imp_year(country, year):
    c = by_c_all.get(country)
    return c['byYear'].get(str(year), 0) if c else 0


def chg(country):
    c = by_c_all[country]
    return pct(c['importsUsd'], c['priorImportsUsd'])


def hy(heading, year=None):
    return by_h.get(heading, {}).get(str(year or Y), 0)


def share(n):
    return round(n / total * 100)


# ---------------------------------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------------------------------
NEW_SOURCES = {
    'hts-ch65': {
        'id': 'hts-ch65',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 65',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 65: Headgear and Parts Thereof',
        'signed': None,
        'published': '2026-10-07',
        'url': CH65_PDF,
    },
    'hts-gn': {
        'id': 'hts-gn',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, General Notes 11 and 29',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), General Notes (USMCA rules of origin, general note 11; '
        'CAFTA-DR, general note 29, incl. the "textile or apparel good" definition in 29(d)(v))',
        'signed': None,
        'published': '2026-10-07',
        'url': GN_PDF,
    },
    'usc-4454': {
        'id': 'usc-4454',
        'publisher': 'U.S. Code (GovInfo)',
        'citation': '19 U.S.C. 4454(f)',
        'document': 'United States Code, 2024 edition',
        'title': 'Trade preferences for Nepal — "No preferential treatment extended under this section shall remain in effect after December 31, 2025"',
        'signed': None,
        'published': '2024-12-31',
        'url': USC_4454,
    },
    'otexa-nepal': {
        'id': 'otexa-nepal',
        'publisher': 'International Trade Administration (OTEXA)',
        'citation': 'ITA / OTEXA web page (checked October 13, 2026)',
        'document': 'Web page',
        'title': 'Nepal Trade Preference Program ("expired on December 31, 2025")',
        'signed': None,
        'published': '2026-10-13',
        'url': OTEXA_NEPAL,
    },
    'fr-2025-18521': {
        'id': 'fr-2025-18521',
        'publisher': 'Federal Register',
        'citation': '90 FR 45917',
        'document': 'Final rule; correction (CPSC)',
        'title': 'Certificates of Compliance; Correction (effective date of the 90 FR 1800 rule is July 8, 2026)',
        'signed': None,
        'published': '2025-09-24',
        'url': 'https://www.federalregister.gov/documents/2025/09/24/2025-18521/certificates-of-compliance-correction',
    },
}


def src(sid):
    if sid in NEW_SOURCES:
        return NEW_SOURCES[sid]
    return REF_SOURCES[sid]


def add_sources(page, ids):
    have = {s['id'] for s in page['sources']}
    for sid in ids:
        if sid not in have:
            page['sources'].append(json.loads(json.dumps(src(sid))))
            have.add(sid)


# ---------------------------------------------------------------------------------------------------
# Chapter + labels
# ---------------------------------------------------------------------------------------------------
d['chapter']['title'] = 'Headgear and Parts Thereof'
SHORT = 'Hats, Caps & Helmets (Headgear)'

GROUP_LABELS = {
    '6501': ('Felt hat forms, hat bodies & hoods (not yet shaped)', 'Felt hat bodies'),
    '6502': ('Plaited hat shapes (straw and other strips, not yet shaped)', 'Straw hat shapes'),
    '6504': ('Straw & other plaited hats', 'Straw hats'),
    '6505': ('Knitted & textile hats and caps, felt hats, hair-nets', 'Caps, beanies & felt hats'),
    '6506': ('Helmets & safety headgear; rubber, plastic, fur & leather headgear', 'Helmets & other'),
    '6507': ('Hat parts: headbands, linings, frames, peaks (visors), chin straps', 'Hat parts'),
}

BLURBS = {
    '6501': (
        'Felt cones, hoods and plateaux that a hatter blocks into a hat. Fur-felt bodies for men\'s or boys\' hats are Free, other fur-felt '
        'bodies 96¢/doz. + 1.4%, wool and other felt bodies 10.3¢/kg + 10.3%.',
        ['felt hat body', 'fur felt cone', 'wool felt hood', 'hat plateau', 'felt capeline', 'hat blank'],
    ),
    '6502': (
        'Plaited or strip-assembled hat shapes not yet blocked or trimmed — panama-type and other straw bodies. Sewn vegetable-fiber shapes '
        'pay 34¢/doz. + 3.4%, unbleached unsewn shapes 4%, bleached or colored unsewn shapes Free, man-made-fiber and other shapes 6.8%.',
        ['straw hat body', 'panama hat body', 'toquilla straw', 'raffia hat shape', 'paper straw hat shape'],
    ),
    '6504': (
        'Finished hats of plaited or strip material — straw, raffia, paper braid, plastic braid. Sewn vegetable-fiber hats pay 6%, unsewn '
        '94¢/doz. + 4.6%, man-made-fiber and other braided hats 6.8%.',
        ['straw hat', 'panama hat', 'sun hat', 'cowboy hat straw', 'raffia hat', 'fedora straw', 'beach hat'],
    ),
    '6505': (
        'Most hats and caps: baseball caps, beanies, bucket hats, visors, felt fedoras and hair-nets. Woven cotton caps pay 7.5%, knitted '
        'cotton 7.9%, polyester or nylon caps 18.7¢/kg + 6.8% (knitted: 20¢/kg + 7%), wool beanies 25.4¢/kg + 7.7%, fur-felt hats Free, '
        'other felt hats 13.5¢/kg + 6.3% + 1.9¢ each, hair-nets 9.4%.',
        ['baseball cap', 'trucker hat', 'beanie', 'knit hat', 'bucket hat', 'sun visor', 'fedora', 'cowboy hat felt', 'hair net', 'baby hat'],
    ),
    '6506': (
        'Safety headgear — motorcycle, bicycle, ski, hockey and other sports helmets, hard hats — is Free, as are rubber or plastic headgear '
        'such as bathing caps and plastic visors. Furskin headgear pays 3.3%, leather and other headgear 8.5%.',
        ['motorcycle helmet', 'bicycle helmet', 'bike helmet', 'hard hat', 'safety helmet', 'ski helmet', 'hockey helmet', 'swim cap', 'fur hat'],
    ),
    '6507': (
        'Parts made for headgear — sweatbands and headbands for hats, linings, covers, hat foundations and frames, peaks (visors) and chin '
        'straps — are Free.',
        ['hat sweatband', 'hat lining', 'cap visor', 'chin strap', 'helmet visor', 'hat frame'],
    ),
}

ov = d['overview']
ov['h1'] = f'HTS Chapter 65: {SHORT} — Tariff Rates'
for g in ov['productGroups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['blurb'], g['searchExamples'] = BLURBS[g['heading']]

for e in ov['spiLegend']:
    if e['code'] == 'NP':
        e['name'] = 'Nepal Preference Program (expired December 31, 2025)'
    if e['code'] == 'A':
        e['name'] = 'Generalized System of Preferences (GSP) — expired December 31, 2020'
    if e['code'] == 'A*':
        e['name'] = 'GSP, some beneficiary countries excluded — expired December 31, 2020'
    if e['code'] == 'D':
        e['name'] = 'African Growth and Opportunity Act (AGOA) — through December 31, 2026'

rows = ov['rateTable']['rows']
leaf = [r for r in rows if r['htsCode10']]
n_lines = len(leaf)
n_dutiable = sum(1 for r in leaf if r['dutiable'])
assert n_lines == 64, n_lines

# ---------------------------------------------------------------------------------------------------
# Trade-dependent names
# ---------------------------------------------------------------------------------------------------
cn = by_c_all['China']
vn = by_c_all['Viet Nam']
bd = by_c_all['Bangladesh']
top = sorted(trade['byCountry'], key=lambda c: -c['importsUsd'])
TOP_NAMES = [c['country'] for c in top[:10]]

# ---------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['h1'] = f'HTS Chapter 65: {SHORT} — Tariff Updates'
tu['seo'] = {
    'title': 'HTS Chapter 65 Tariff Updates 2026: Hat, Cap & Helmet Import Duties Since January 2025 | KoalaGains',
    'shortDescription': 'What changed for HTS Chapter 65 — baseball caps, beanies, straw and felt hats, helmets — since January 2025: the end of '
    'the IEEPA and Section 122 duties, the 2026 Section 301 tariffs (Vietnam +12.5%, Bangladesh +10%, EU 10%), China List 3 and 4A, and '
    'Canada Section 338 on beanies and helmets, with Federal Register citations.',
    'keywords': [
        'hts chapter 65 tariff updates',
        'headgear and parts thereof tariff',
        'headgear and parts thereof import duty rates',
        'china section 301 headwear duties',
        'section 301 tariff on hats',
        'vietnam hat tariff',
        'bangladesh knitted beanies tariff',
        'section 338 canada tariffs helmets',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 '
    f'Revision 21** (in force October 9, 2026). **No Chapter 65 base rate changed**: all {n_lines} lines carry the same General, Special and '
    'Column 2 rates — Free for helmets and fur-felt hats, 6%–9.4% or a per-kilo-plus-percent rate for most hats and caps.\n\n'
    'Everything that changed sits on top of the base rate. In 2025 the IEEPA duties reached hats from every country — 20% for Vietnam and '
    'Bangladesh and 15% in total for the EU from August 7, 2025, 50% for India from August 27, and up to 145% for China in April–May 2025, on '
    'top of the 25% (List 3) or 7.5% (List 4A) Section 301 duty. The IEEPA duties **ended on February 24, 2026**, and the 10% Section 122 '
    'surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff**: '
    '+12.5% for Vietnam, +10% for Bangladesh, India and Cambodia, 10% in total for the EU. China still pays the **25% List 3 duty** on hats and '
    'caps and **7.5% (List 4A)** on helmets and hair-nets, plus the 12.5%. Since **August 22, 2026** two Canadian subheadings — knitted '
    'man-made-fiber hats (6505.00.60) and safety headgear other than reinforced plastics (6506.10.60) — pay a **50% Section 338 duty**, even '
    'under USMCA. Duty-free programs moved too: GSP stays expired, the Nepal program expired December 31, 2025, AGOA was renewed to December '
    '31, 2026, and the $800 de minimis exemption is suspended.'
)
tu['scope'] = (
    'Measures that reach Chapter 65 from any country: the 2026 Section 301 tariffs on 60 economies and their note 52(j) country exceptions, the '
    'Brazil Section 301 tariff, the China Section 301 List 3 and List 4A duties and their three product exclusions, the Canada Section 338 '
    'duty, Russia\'s rate in lieu of column 2, and the 2025–2026 IEEPA and Section 122 duties that have ended. Preference-program and '
    'de minimis changes are listed for reference. No antidumping or countervailing duty order covers a Chapter 65 product. For the rate each '
    'supplier pays, see Rates by country.'
)

NO_52B = 'No Chapter 65 line is on the general exemption list (note 52(b)). '
EXC_LISTS = (
    'Three country exception lists in U.S. note 52(j) name every Chapter 65 line except safety headgear (6506.10): Jordan (9903.06.20), and '
    'Guatemala (9903.06.06) and El Salvador (9903.06.09) when CAFTA-DR is claimed. '
)
NO_52I = (
    'The CAFTA-DR textile exemption (note 52(i), 9903.05.95) does not help hats: it covers only "textile or apparel goods" as defined in '
    'general note 29(d)(v), which leaves out headings 6501–6504 and the hats of former subheading 6505.90. '
)

IN_EFFECT_TEXT = {
    'China': (
        'Two Section 301 duties stack. The 2026 action adds +12.5% (9903.05.31) to everything. On top, List 3 (+25%, 9903.88.03) covers '
        'headings 6501–6505 (except hair-nets), 6506.91, 6506.99 and 6507, and List 4A (+7.5%, 9903.88.15) covers hair-nets (6505.00.01) and '
        'safety headgear (6506.10). Three exclusions in U.S. note 20(vvv) (9903.88.69) run through November 9, 2026: nonwoven disposable '
        'headgear without peaks (6505.00.80.15) from List 3, and from List 4A motorcycle helmets of 6506.10.60.30 and bicycle helmets of PVC, '
        'polycarbonate or ABS shells with EPS or EPP liners (in 6506.10.60.45). The IEEPA duties on China ended February 24, 2026, and USTR\'s '
        'four-year review kept the lists in place.',
        'A Chinese cotton baseball cap pays 45% (7.5% + 37.5%), a polyester cap 18.7¢/kg + 44.3%, an acrylic beanie 20¢/kg + 44.5%; helmets '
        'and hard hats pay 20% (Free + 7.5% + 12.5%), excluded motorcycle and bicycle helmets 12.5%.',
    ),
    'Vietnam': (
        'Base rate + 12.5% (9903.05.84). ' + NO_52B + 'The 20% IEEPA reciprocal duty (from August 7, 2025) ended February 24, 2026.',
        'A Vietnamese polyester baseball cap pays 18.7¢/kg + 19.3%, a cotton cap 20%, a helmet 12.5%.',
    ),
    'Bangladesh': (
        'Base rate + 10% (9903.05.26). ' + NO_52B + 'Bangladesh\'s exception list (note 52(j)(9)) names no Chapter 65 line. The 20% IEEPA '
        'reciprocal duty (from August 7, 2025) ended February 24, 2026.',
        'A Bangladeshi cotton cap pays 17.5%, a polyester cap 18.7¢/kg + 16.8%, an acrylic beanie 20¢/kg + 17%.',
    ),
    'Mexico': (
        'USMCA-qualifying goods pay no Section 301 duty (9903.05.94); others pay +10% (9903.05.55). ' + NO_52B + 'Mexico is not subject to '
        'the Canada Section 338 duties. The 25% IEEPA duty on non-USMCA goods (9903.01.01) ended February 24, 2026.',
        'A USMCA-qualifying cap sewn in Mexico pays nothing; a non-qualifying one pays the base rate plus 10%.',
    ),
    'Canada': (
        'Two measures. The 2026 Section 301 duty (+10%, 9903.05.29) does not apply to USMCA-qualifying goods (9903.05.93). The Section 338 duty '
        '(+50%, from August 22, 2026, 9903.03.14) applies to products of Canada of 6505.00.60 (knitted man-made-fiber hats, not in part of '
        'braid) and 6506.10.60 (safety headgear other than of reinforced or laminated plastics — including hockey, ski and bicycle helmets), and '
        'U.S. note 51(a) says it applies even when USMCA is claimed. The September 15, 2026 list revisions changed no Chapter 65 entry. The 35% '
        'IEEPA duty on non-USMCA goods ended February 24, 2026.',
        'A USMCA-qualifying acrylic toque, or a hockey helmet of 6506.10.60, from Canada pays 50%; other USMCA hats and caps pay nothing.',
    ),
    'European Union': (
        'For EU goods whose base rate is under 10%, the total is 10% (9903.05.39); at or above 10%, nothing is added (9903.05.38, U.S. note '
        '52(k)). Most Chapter 65 base rates are under 10%, so EU hats, caps and helmets pay 10% in total. Felt hat bodies of 6501.00.90 '
        '(10.3¢/kg + 10.3%) are already above 10% and pay only their base rate; for other per-kilo rates the comparison uses the shipment\'s '
        'own ad valorem equivalent (note 52(k)). ' + NO_52B + 'The EU exception list (note 52(j)(2)) has no Chapter 65 line. This replaced the 15%-in-total IEEPA rate, '
        'which ended February 24, 2026.',
        'An Italian fur-felt fedora (Free) or a helmet pays 10% of value — $1,000 on $10,000 — instead of 15% in late 2025.',
    ),
    'Indonesia': (
        'Base rate + 10% (9903.05.45). ' + NO_52B + 'Indonesia\'s exception list (note 52(j)(11)) names no Chapter 65 line. The 19% IEEPA '
        'reciprocal duty ended February 24, 2026.',
        'An Indonesian cotton cap pays 17.5%, a polyester cap 18.7¢/kg + 16.8%.',
    ),
    'Cambodia': (
        'Base rate + 10% (9903.05.28). ' + NO_52B + 'Cambodia\'s exception list (note 52(j)(5)) names no Chapter 65 line. The 19% IEEPA '
        'reciprocal duty ended February 24, 2026.',
        'A Cambodian cotton cap pays 17.5%, a knitted acrylic beanie 20¢/kg + 17%.',
    ),
    'Taiwan': (
        'For goods of Taiwan whose base rate is under 10%, the total is 10% (9903.05.76); at or above, nothing is added (9903.05.75, U.S. note '
        '52(k)). ' + NO_52B + 'Taiwan\'s exception list (note 52(j)(10)) names no Chapter 65 line.',
        'A Taiwanese bicycle or motorcycle helmet (Free) pays 10% of value.',
    ),
    'Thailand': (
        'Base rate + 12.5% (9903.05.77). ' + NO_52B + 'The 19% IEEPA reciprocal duty ended February 24, 2026.',
        'A Thai helmet pays 12.5%, a cotton cap 20%.',
    ),
    'United Kingdom': (
        'Base rate + 10% (9903.05.81). ' + NO_52B + 'The UK exception list (note 52(j)(1)) has no Chapter 65 line. The 10% IEEPA reciprocal '
        'duty ended February 24, 2026.',
        'A British wool-felt hat pays 13.5¢/kg + 16.3% + 1.9¢ each; a British helmet 10%.',
    ),
    'India': (
        'Base rate + 10% (9903.05.44). ' + NO_52B + 'The IEEPA duties on India — 25% from August 7, 2025 plus 25% from August 27, 2025 — '
        'ended in February 2026.',
        'An Indian cotton cap pays 17.5%, a knitted cotton hat 17.9%.',
    ),
    'Brazil': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 (9903.05.27). The '
        'Brazil exemption list (U.S. note 50(a)(ii)) names no Chapter 65 line. The 40% IEEPA duty on Brazil (Executive Order 14323) ended '
        'February 24, 2026.',
        'Brazilian hats and helmets pay 37.5% on top of the base rate.',
    ),
    'Japan': (
        'For Japanese goods whose base rate is under 12.5%, the total is 12.5% (9903.05.49); at or above, nothing is added (9903.05.48). ' + NO_52B,
        'A Japanese helmet or cotton cap pays 12.5% in total.',
    ),
    'Russia': (
        'Russia pays column 2 rates (general note 3(b)) — 25%–90% plus specific rates on hats — plus +12.5% (9903.05.66). Safety headgear of '
        '6506.10.60 pays 35% under 9903.90.08 in place of its 25% column 2 rate (U.S. note 30).',
        'Russian headgear is effectively priced out.',
    ),
}


def other_text():
    return (
        'Rates by country: Sri Lanka, Pakistan, Honduras and El Salvador +10%, the Philippines, the Dominican Republic, Costa Rica and '
        'Nicaragua +12.5%, South Korea 12.5% in total. ' + NO_52B + EXC_LISTS + NO_52I
        + 'Countries outside the 60 economies — among hat suppliers Myanmar, Laos, Haiti and Nepal — pay no Section 301 duty.',
        'Sri Lankan or Pakistani caps pay 10% plus the base rate; CAFTA-DR caps from Guatemala or El Salvador and Jordanian hats pay nothing '
        'extra; CAFTA-DR caps from Honduras pay 10%, from the Dominican Republic 12.5%.',
    )


for e in tu['inEffect']:
    key = e['country']
    if key in IN_EFFECT_TEXT:
        e['exemption'], e['whatItMeans'] = IN_EFFECT_TEXT[key]
    elif key.startswith('Other'):
        e['country'] = 'Other Section 301 economies (incl. Sri Lanka, Philippines, South Korea, Pakistan, Jordan, Guatemala, El Salvador, Honduras)'
        e['exemption'], e['whatItMeans'] = other_text()
    else:
        raise SystemExit(f'no inEffect text for {key}')
    if e['country'] == 'European Union':
        e['measure'] = 'Section 301 tariff (forced-labor investigations), EU rate'
    elif e['country'] in ('Japan', 'Taiwan'):
        e['measure'] = f'Section 301 tariff (forced-labor investigations), {e["country"]} rate'
    elif e['country'] == 'Canada':
        e['measure'] = 'Section 301 tariff (non-USMCA goods) + Section 338 duty (all goods on the list)'
        e['now'] = '+10% (non-USMCA); +50% on 6505.00.60 and 6506.10.60, USMCA or not'
    elif e['country'] == 'China':
        e['measure'] = 'Section 301 tariffs: 2026 action plus List 3 / List 4A'
        e['now'] = '+37.5% on hats and caps; +20% on helmets and hair-nets'
        e['before'] = '+25% (List 3) or +7.5% (List 4A)'
        if 'fr-2025-21671' not in e['sourceIds']:
            e['sourceIds'].insert(-1, 'fr-2025-21671')
    elif e['country'] == 'Brazil':
        e['measure'] = 'Section 301 tariffs: Brazil action plus 2026 forced-labor action'
        if 'eo-14323' not in e['sourceIds']:
            e['sourceIds'].insert(-1, 'eo-14323')
    elif e['country'] == 'Russia':
        e['measure'] = 'Section 301 tariff + rate in lieu of column 2 (6506.10.60)'
        e['now'] = 'Column 2 rate + 12.5% (35% + 12.5% on 6506.10.60)'
    elif e['measure'] == 'Section 301 (2026, 60 economies)':
        e['measure'] = 'Section 301 tariff (forced-labor investigations)'

CHANGE_DETAIL = {
    'section-338-canada-2026-08-22': (
        'Canada Section 338 duty takes effect on knitted synthetic hats and most helmets',
        '50% on listed products of Canada after a 3-day suspension lapsed. Two Chapter 65 subheadings are on the motor-vehicle list '
        '(9903.03.14): 6505.00.60 (hats knitted of man-made fibers, not in part of braid — acrylic toques and beanies) and 6506.10.60 (safety '
        'headgear other than of reinforced or laminated plastics — hockey, ski, bicycle and other helmets, hard hats). Unlike the Section 301 '
        'duty, it applies to USMCA-qualifying goods too (U.S. note 51(a)).',
    ),
    'section-301-2026-60-economies-2026-07-24': (
        'Section 301 tariffs on 60 economies cover all of Chapter 65',
        '10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). No Chapter 65 line is on the general exemption list (note 52(b)). '
        'EU goods pay 10% in total and Japanese goods 12.5% in total. Vietnam +12.5%; Bangladesh, Cambodia, India, Indonesia and Sri Lanka +10%. '
        'Jordanian hats, and CAFTA-DR hats from Guatemala and El Salvador, are exempt on every line except safety headgear (note 52(j)). '
        'USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94).',
    ),
    'section-301-brazil-2026-07-22': (
        'Section 301 tariff on products of Brazil',
        '25% on all goods of Brazil (9903.05.01). No Chapter 65 line is on the Brazil exemption list (U.S. note 50(a)(ii)). From July 24 the '
        '12.5% forced-labor tariff (9903.05.27) is added on top.',
    ),
    'section-301-nicaragua-scheduled-2027-01-01': (
        'Scheduled: Section 301 tariff on products of Nicaragua',
        'Products of Nicaragua that pay the column 1-general rate (that is, not entered under CAFTA-DR) will pay +10% (9903.89.01) from January '
        '1, 2027 and +15% from January 1, 2028. Today Nicaragua pays the 12.5% 2026 Section 301 duty (9903.05.58).',
    ),
}
for c in tu['changes']:
    if c['id'] in CHANGE_DETAIL:
        c['title'], c['detail'] = CHANGE_DETAIL[c['id']]
    if c['id'] == 'section-301-nicaragua-scheduled-2027-01-01':
        # generator quirk: the pending entry carries the HTS release date; use the implementation notice date
        c['date'] = '2025-12-29'
        c['dateLabel'] = 'Published'
    if c['id'] == 'base-rates':
        c['title'] = 'No Chapter 65 base-rate changes'
        c['detail'] = (
            f'All {n_lines} Chapter 65 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition, '
            'and no line was added, split or renumbered.'
        )
    if 'TODO' in c['detail']:
        raise SystemExit(f'unfilled change {c["id"]}')

EXTRA_CHANGES = [
    {
        'id': 'cn-301-continue',
        'type': 'reference',
        'date': '2026-10-07',
        'dateLabel': 'Published',
        'title': 'China Section 301 lists continue after the four-year review',
        'detail': 'USTR announced that the 2018 China Section 301 actions did not terminate on their 2026 anniversaries because domestic '
        'industries asked for them to continue. For Chapter 65 this keeps +25% (List 3) on hats, caps and hat parts and +7.5% (List 4A) on '
        'helmets and hair-nets.',
        'before': '+25% / +7.5%',
        'now': '+25% / +7.5%',
        'countries': 'China',
        'sourceIds': ['fr-2026-20510'],
    },
    {
        'id': 'ca-338-scope',
        'type': 'reference',
        'date': '2026-09-15',
        'dateLabel': 'Effective',
        'title': 'Canada Section 338 lists revised; Chapter 65 entries unchanged',
        'detail': 'Proclamations 11064 and 11065 added and removed provisions on the 9903.03.12 and 9903.03.14 lists. None of the added or removed '
        'provisions is in Chapter 65: 6505.00.60 and 6506.10.60 stay on the list.',
        'before': None,
        'now': None,
        'countries': 'Canada',
        'sourceIds': ['procl-11064', 'procl-11065', 'csms-69851916'],
    },
    {
        'id': 's122-end',
        'type': 'extraDuty',
        'date': '2026-07-23',
        'dateLabel': 'Expired',
        'title': 'Section 122 import surcharge expired',
        'detail': 'The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.',
        'before': '+10%',
        'now': 'None',
        'countries': 'All',
        'sourceIds': ['procl-11012', 'hts-now'],
    },
    {
        'id': 'cpsc-efiling',
        'type': 'reference',
        'date': '2026-07-08',
        'dateLabel': 'Effective',
        'title': 'CPSC certificates must be eFiled at entry — including for bicycle helmets',
        'detail': 'CPSC\'s revised certificates rule (16 CFR part 1110) took effect. Importers of products under a CPSC rule — among them bicycle '
        'helmets (16 CFR part 1203) — must file the certificate data electronically with CBP when they file the entry (January 8, 2027 for goods '
        'entered from a foreign-trade zone). The duty rate is unchanged.',
        'before': 'Certificate on request',
        'now': 'Certificate data eFiled at entry',
        'countries': 'All',
        'sourceIds': ['fr-2024-30826', 'fr-2025-18521'],
    },
    {
        'id': 'usmca-review',
        'type': 'reference',
        'date': '2026-07-01',
        'dateLabel': 'Announced',
        'title': 'USMCA joint review: not renewed, still in force',
        'detail': 'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending '
        'resolution of the issues or until termination, so USMCA claims (SPI S) still remove the base rate and the Section 301 duty on Mexican '
        'and most Canadian headgear.',
        'before': None,
        'now': None,
        'countries': 'Canada, Mexico',
        'sourceIds': ['ustr-usmca-review'],
    },
    {
        'id': 'dm-ifr',
        'type': 'reference',
        'date': '2026-06-24',
        'dateLabel': 'Effective',
        'title': 'CBP suspends de minimis indefinitely',
        'detail': 'Two interim final rules suspend the $800 de minimis exemption in CBP\'s regulations — 19 CFR 10.151(b) for every mode except '
        'mail, and 19 CFR 145.31(b) for mail — until CBP announces otherwise. A hat or cap shipped direct to a U.S. buyer needs an entry and pays '
        'the base rate plus any extra duty, whatever its value.',
        'before': 'Free under de minimis up to $800',
        'now': 'Entry required',
        'countries': 'All',
        'sourceIds': ['cbp-ifr-dm', 'cbp-ifr-mail'],
    },
    {
        'id': 's122-start',
        'type': 'extraDuty',
        'date': '2026-02-24',
        'dateLabel': 'Effective',
        'title': 'Section 122 surcharge replaces the IEEPA tariffs',
        'detail': '10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 65 subheading was on the product exemption list '
        '(9903.03.03). USMCA-qualifying goods from Canada and Mexico were exempt.',
        'before': 'None',
        'now': '+10% (until July 23, 2026)',
        'countries': 'All',
        'sourceIds': ['procl-11012', 'csms-67844987', 'hts-now'],
    },
    {
        'id': 'ieepa-end',
        'type': 'extraDuty',
        'date': '2026-02-24',
        'dateLabel': 'Effective',
        'title': 'All IEEPA tariffs end',
        'detail': 'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, '
        'Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting them for goods entered from '
        '12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.',
        'before': 'Varied by country',
        'now': 'None',
        'countries': 'All',
        'sourceIds': ['scotus-24-1287', 'eo-14389', 'csms-67834313'],
    },
    {
        'id': 'dm-continued',
        'type': 'reference',
        'date': '2026-02-20',
        'dateLabel': 'Signed',
        'title': 'De minimis suspension continued after the IEEPA ruling',
        'detail': 'Executive Order 14388 kept duty-free de minimis treatment suspended for all countries.',
        'before': None,
        'now': None,
        'countries': 'All',
        'sourceIds': ['eo-14388'],
    },
    {
        'id': 'india-oil-end',
        'type': 'extraDuty',
        'date': '2026-02-07',
        'dateLabel': 'Effective',
        'title': 'India\'s extra 25% IEEPA duty removed',
        'detail': 'Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) from February 7, 2026. The 25% reciprocal '
        'rate on India ended with the other IEEPA duties on February 24.',
        'before': '+50%',
        'now': '+25% (until February 24, 2026)',
        'countries': 'India',
        'sourceIds': ['eo-14384'],
    },
    {
        'id': 'agoa-renewed',
        'type': 'reference',
        'date': '2026-02-03',
        'dateLabel': 'Signed',
        'title': 'AGOA reauthorized through December 31, 2026',
        'detail': 'The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025. In Chapter 65, '
        'AGOA (SPI D) makes Free some fur-felt hat bodies (6501.00.60), sewn and unsewn vegetable-fiber hat shapes and straw hats (6502.00.20, '
        '6502.00.40, 6504.00.30, 6504.00.60), hair-nets (6505.00.01) and furskin and other headgear (6506.99) for eligible sub-Saharan countries; '
        'knitted and textile caps (6505.00.08–.90) are not covered. GSP (SPI A, A*) remains expired since December 31, 2020.',
        'before': 'Lapsed (from September 30, 2025)',
        'now': 'In force to December 31, 2026',
        'countries': 'AGOA beneficiary countries',
        'sourceIds': ['ustr-agoa-2026', 'crs-agoa', 'procl-11030', 'cbp-gsp', 'hts-now'],
    },
    {
        'id': 'nepal-expired',
        'type': 'reference',
        'date': '2025-12-31',
        'dateLabel': 'Expired',
        'title': 'Nepal Preference Program (NP) expired',
        'detail': 'The program that let Nepal ship many hats duty-free (SPI NP) — knitted and textile caps, felt and wool hats, braided hats and '
        'other headgear — ended after December 31, 2025, as the statute required. The NP code is still printed in the Special column but no '
        'longer applies: Nepalese hats now pay the General rate. Nepal is not one of the 60 Section 301 economies.',
        'before': 'Free (NP)',
        'now': 'General rate',
        'countries': 'Nepal',
        'sourceIds': ['usc-4454', 'otexa-nepal', 'hts-now'],
    },
    {
        'id': 'cn-excl',
        'type': 'reference',
        'date': '2025-12-01',
        'dateLabel': 'Published',
        'title': 'China exclusions for disposable caps and some helmets extended to November 9, 2026',
        'detail': 'USTR extended 178 China Section 301 product exclusions through November 9, 2026, among them nonwoven disposable headgear without '
        'peaks or visors (6505.00.80.15, List 3), motorcycle helmets of 6506.10.60.30 and bicycle helmets with PVC, polycarbonate or ABS shells '
        'and EPS or EPP liners (in 6506.10.60.45, both List 4A) — U.S. note 20(vvv), 9903.88.69. Matching goods skip the List 3 or 4A duty; '
        'the 12.5% 2026 duty still applies.',
        'before': 'Through November 29, 2025',
        'now': 'Through November 9, 2026',
        'countries': 'China',
        'sourceIds': ['fr-2025-21671', 'hts-now'],
    },
    {
        'id': 'cn-ieepa-cut',
        'type': 'extraDuty',
        'date': '2025-11-10',
        'dateLabel': 'Effective',
        'title': 'China fentanyl duty cut to 10%',
        'detail': 'The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It ended with the other IEEPA duties on '
        'February 24, 2026.',
        'before': '+20%',
        'now': '+10% (ended)',
        'countries': 'China',
        'sourceIds': ['eo-14357'],
    },
    {
        'id': 'dm-suspended',
        'type': 'reference',
        'date': '2025-08-29',
        'dateLabel': 'Effective',
        'title': 'De minimis suspended for all countries',
        'detail': 'Executive Order 14324 ended duty-free de minimis treatment for shipments of any value, origin or mode. Low-value hats and caps '
        'sent by mail or courier became subject to duty.',
        'before': 'Free under de minimis up to $800',
        'now': 'Entry required',
        'countries': 'All',
        'sourceIds': ['eo-14324', 'cbp-dm-2025'],
    },
    {
        'id': 'india-oil',
        'type': 'extraDuty',
        'date': '2025-08-27',
        'dateLabel': 'Effective',
        'title': 'Extra 25% on products of India',
        'detail': 'Executive Order 14329 added 25% on Indian goods (9903.01.84), on top of the 25% reciprocal rate in force since August 7, 2025 '
        '(EO 14326): 50% in all on Indian hats, on top of the base rate. Ended February 7, 2026.',
        'before': '+25%',
        'now': '+50% (ended)',
        'countries': 'India',
        'sourceIds': ['eo-14329', 'eo-14326'],
    },
    {
        'id': 'country-rates',
        'type': 'extraDuty',
        'date': '2025-08-07',
        'dateLabel': 'Effective',
        'title': 'Country reciprocal rates replace the 10% baseline',
        'detail': 'Executive Order 14326 set country rates for goods entered from August 7, 2025: Cambodia, Indonesia, Pakistan, the Philippines, '
        'Sri Lanka and Thailand +19%–20%, Vietnam and Bangladesh +20%, India +25%, Myanmar +40%, the UK +10%. EU goods with a column 1 rate under '
        '15% paid 15% in total (9903.02.20) — so EU hats, caps and helmets paid 15%. Ended February 24, 2026.',
        'before': '+10%',
        'now': '+10% to +40% (ended)',
        'countries': 'Listed countries, European Union',
        'sourceIds': ['eo-14326', 'hts-now'],
    },
    {
        'id': 'ca-amended',
        'type': 'extraDuty',
        'date': '2025-07-31',
        'dateLabel': 'Signed',
        'title': 'Canada additional duty raised to 35%',
        'detail': 'Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.',
        'before': '+25%',
        'now': '+35% (ended)',
        'countries': 'Canada',
        'sourceIds': ['eo-14325'],
    },
    {
        'id': 'cn-reciprocal-10',
        'type': 'extraDuty',
        'date': '2025-05-14',
        'dateLabel': 'Effective',
        'title': 'China reciprocal duty cut from 125% to 10%',
        'detail': 'Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. A Chinese cotton cap '
        'then paid 7.5% + 25% (List 3) + 20% + 10% = 62.5% until November 9, 2025. Ended February 24, 2026.',
        'before': '+125%',
        'now': '+10% (ended)',
        'countries': 'China',
        'sourceIds': ['eo-14298'],
    },
    {
        'id': 'cn-125',
        'type': 'extraDuty',
        'date': '2025-04-10',
        'dateLabel': 'Effective',
        'title': 'China reciprocal duty raised to 125%',
        'detail': 'Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% from April 10, 2025, and paused the higher country '
        'rates announced on April 2 for other countries, which never took effect. With the 20% fentanyl duty and the 25% List 3 duty, a Chinese '
        'cotton cap (7.5% base) paid 177.5% until May 13, 2025; a helmet (Free, List 4A) 152.5%.',
        'before': None,
        'now': '+125% (ended)',
        'countries': 'China',
        'sourceIds': ['eo-14266'],
    },
    {
        'id': 'reciprocal',
        'type': 'extraDuty',
        'date': '2025-04-02',
        'dateLabel': 'Signed',
        'title': 'Reciprocal tariff on products of all countries',
        'detail': '10% baseline (9903.01.25) from April 5, 2025, and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 65 product '
        'was exempt. Ended February 24, 2026.',
        'before': 'None',
        'now': '+10% or more (ended)',
        'countries': 'All except Canada, Mexico',
        'sourceIds': ['eo-14257'],
    },
    {
        'id': 'cn-ieepa',
        'type': 'extraDuty',
        'date': '2025-03-04',
        'dateLabel': 'Effective',
        'title': 'China fentanyl duty raised to 20%',
        'detail': 'The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) to +20%, '
        'on top of the List 3 and 4A duties. Ended February 24, 2026.',
        'before': '+10%',
        'now': '+20% (ended)',
        'countries': 'China',
        'sourceIds': ['eo-14195', 'eo-14228'],
    },
    {
        'id': 'mx-imposed',
        'type': 'extraDuty',
        'date': '2025-02-01',
        'dateLabel': 'Signed',
        'title': 'Additional duty on products of Mexico',
        'detail': '+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.',
        'before': 'None',
        'now': '+25% (ended)',
        'countries': 'Mexico',
        'sourceIds': ['eo-14194'],
    },
    {
        'id': 'ca-imposed',
        'type': 'extraDuty',
        'date': '2025-02-01',
        'dateLabel': 'Signed',
        'title': 'Additional duty on products of Canada',
        'detail': '+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, 2026.',
        'before': 'None',
        'now': '+25% (ended)',
        'countries': 'Canada',
        'sourceIds': ['eo-14193'],
    },
    {
        'id': 'cn-list4a-cut',
        'type': 'extraDuty',
        'date': '2020-02-14',
        'dateLabel': 'Effective',
        'title': 'China List 4A duty cut to 7.5%',
        'detail': 'USTR halved the List 4A duty (9903.88.15) from 15% to 7.5%. For Chapter 65 it covers hair-nets (6505.00.01) and safety headgear '
        '(6506.10), and the rate has applied ever since.',
        'before': '+15%',
        'now': '+7.5%',
        'countries': 'China',
        'sourceIds': ['fr-2020-00904'],
    },
    {
        'id': 'cn-list4a',
        'type': 'extraDuty',
        'date': '2019-09-01',
        'dateLabel': 'Effective',
        'title': 'China List 4A reaches helmets and hair-nets',
        'detail': 'List 4A put +15% on Chinese motorcycle, bicycle and sports helmets, hard hats and other safety headgear (6506.10.30, 6506.10.60) '
        'and on hair-nets (6505.00.01).',
        'before': 'None',
        'now': '+15%',
        'countries': 'China',
        'sourceIds': ['fr-2019-17865'],
    },
    {
        'id': 'cn-list3-25',
        'type': 'extraDuty',
        'date': '2019-05-10',
        'dateLabel': 'Effective',
        'title': 'China List 3 duty raised to 25%',
        'detail': 'USTR raised the List 3 duty (9903.88.03) from 10% to 25%. List 3 covers hat bodies and shapes, straw, felt, knitted and textile '
        'hats and caps, rubber, plastic, fur and other headgear (6506.91, 6506.99) and hat parts (6507).',
        'before': '+10%',
        'now': '+25%',
        'countries': 'China',
        'sourceIds': ['fr-2019-09681'],
    },
    {
        'id': 'cn-list3',
        'type': 'extraDuty',
        'date': '2018-09-24',
        'dateLabel': 'Effective',
        'title': 'China Section 301 List 3 reaches hats and caps',
        'detail': 'The third China Section 301 list put +10% on Chinese hats, caps and hat parts — every Chapter 65 subheading except hair-nets and '
        'safety headgear.',
        'before': 'None',
        'now': '+10%',
        'countries': 'China',
        'sourceIds': ['fr-2018-20610'],
    },
]
have_ids = {c['id'] for c in tu['changes']}
tu['changes'] += [c for c in EXTRA_CHANGES if c['id'] not in have_ids]
tu['changes'].sort(key=lambda c: c['date'], reverse=True)
add_sources(
    tu,
    [
        'eo-14323',
        'fr-2025-21671',
        'procl-11064',
        'procl-11065',
        'csms-69851916',
        'procl-11012',
        'csms-67844987',
        'fr-2024-30826',
        'fr-2025-18521',
        'ustr-usmca-review',
        'cbp-ifr-dm',
        'cbp-ifr-mail',
        'scotus-24-1287',
        'eo-14389',
        'csms-67834313',
        'eo-14388',
        'eo-14384',
        'ustr-agoa-2026',
        'crs-agoa',
        'procl-11030',
        'cbp-gsp',
        'usc-4454',
        'otexa-nepal',
        'eo-14357',
        'eo-14324',
        'cbp-dm-2025',
        'eo-14329',
        'eo-14326',
        'eo-14325',
        'eo-14298',
        'eo-14266',
        'eo-14257',
        'eo-14195',
        'eo-14228',
        'eo-14194',
        'eo-14193',
        'fr-2020-00904',
        'fr-2019-17865',
        'fr-2019-09681',
        'fr-2018-20610',
    ],
)

stats = [s for s in tu['stats'] if s['label'] != 'IEEPA duties']
stats.append({'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'})
tu['stats'] = stats

# ---------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['h1'] = f'HTS Chapter 65: {SHORT} — Import Documents & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing Hats, Caps & Helmets into the U.S.: CPSC Bike Helmet & DOT Motorcycle Helmet Rules, Labeling & Legal Ways to Lower '
    'Duty (HTS Ch. 65) | KoalaGains',
    'shortDescription': 'What each HTS Chapter 65 line needs at U.S. entry — CPSC certification and eFiling for bicycle helmets, DOT FMVSS 218 '
    'labels and the HS-7 declaration for motorcycle helmets, FTC fiber and origin labels for textile hats, origin marking — and the legal ways '
    'to pay less: material, origin, USMCA, CAFTA-DR, China exclusions, first sale, 9802 assembly, drawback.',
    'keywords': [
        'tariff engineering for headgear',
        'usmca headgear rules of origin',
        'hts 6505.00 import duty',
        'cpsc bicycle helmet certificate',
        'dot motorcycle helmet import fmvss 218',
        'hs-7 declaration helmets',
        'ftc textile labeling hats',
        'first-sale-for-export valuation',
    ],
}
te['intro'] = (
    'Most hats and caps need no license, but three groups have entry rules. **Bicycle helmets** must meet the CPSC safety standard (16 CFR part '
    '1203) and carry its certification label, and since July 8, 2026 the importer must eFile the certificate data with the entry. '
    '**Motorcycle helmets** must meet FMVSS 218, carry the "DOT" label, and be declared on NHTSA\'s HS-7 form at entry. **Textile hats and '
    'caps** must carry FTC fiber-content, origin and maker labels (wool hats under the Wool Act), and every article must be **marked with its '
    'country of origin**. Hats are exempt from the general apparel flammability standard and from the care-labeling rule.\n\n'
    'On cost, the **material** decides the base rate (a woven cotton cap pays 7.5%, a polyester one 18.7¢/kg + 6.8%), the **country of '
    'origin** decides the extra duty (+12.5% Vietnam, +37.5% China on hats), and USMCA, CAFTA-DR, the China exclusions, first-sale valuation, '
    'U.S.-component assembly (9802.00.80) and drawback lower the bill further. Each lever depends on a document, listed below with its '
    'regulation.'
)
te['regulationsAsOf'] = '2026-10-08'
te['levers'] = [
    {
        'id': 'material',
        'title': 'Classify by fiber and construction',
        'saves': 'The gap between material rates: a woven cotton cap pays 7.5%, a knitted cotton one 7.9%, a polyester or nylon cap 18.7¢/kg + '
        '6.8% (knitted 20¢/kg + 7%), a man-made-fiber cap wholly or partly of braid 6.8%, a wool beanie 25.4¢/kg + 7.7%; a fur-felt hat is Free, '
        'a wool-felt hat 13.5¢/kg + 6.3% + 1.9¢ each',
        'appliesTo': 'Heading 6505 (caps, beanies, felt hats) and plaited hats of 6504',
        'document': 'Product specifications: fiber content by weight, knitted or woven construction, braid, felt type.',
        'caveat': 'The rate follows the component that gives the hat its character; fiber and construction are commercial choices, and the '
        'declared line must match the goods. For Canadian goods the 50% Section 338 duty reaches only 6505.00.60 (knitted man-made fibers, not '
        'braid) and 6506.10.60. A ruling settles doubtful cases.',
        'citations': [
            {'label': 'HTSUS Chapter 65 and its notes', 'url': CH65_PDF},
            {'label': '19 CFR part 177 (rulings)', 'url': ecfr_part(19, 177)},
        ],
    },
    {
        'id': 'origin',
        'title': 'Know the country of origin — and where a hat gets it',
        'saves': 'The difference between country rates: +10% for Bangladesh, Cambodia or India, +12.5% for Vietnam, 10% in total for the EU, '
        '+37.5% for Chinese hats',
        'appliesTo': 'All lines; the gap is widest on caps and beanies from China',
        'document': 'Production records showing where the hat was made: for hats of 6501, 6502, 6504 and 6505 (except hair-nets), where it was '
        'wholly assembled — or, for a one-piece hat such as a knit-to-shape beanie, where it was knitted or the fabric was formed.',
        'caveat': 'Cutting in one country and sewing in another, or only embroidering, adding labels or packing, may not move the origin. The '
        'Section 301 and 338 duties follow the country of origin, and CBP can ask for proof.',
        'citations': [
            {'label': '19 CFR 102.21 (textile origin, incl. 6501, 6502, 6504, 6505.00)', 'url': ecfr(19, '102.21')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 51, 52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'usmca',
        'title': 'Claim USMCA on hats made in Mexico or Canada',
        'saves': 'The base rate (up to 9.4%, or a per-kilo-plus-percent rate) plus the 10% Section 301 duty',
        'appliesTo': 'All lines from Mexico; from Canada, all lines except 6505.00.60 and 6506.10.60',
        'document': 'A certification of origin from the importer, exporter or producer, kept ready for CBP.',
        'caveat': 'The Chapter 65 rule is a change of heading: a cap cut and sewn in Mexico from imported fabric qualifies, but one assembled '
        'from imported crowns, visors or other 6507 parts does not, and hat bodies of 6501–6502 must come from outside the chapter. USMCA does '
        'not remove the 50% Section 338 duty on 6505.00.60 and 6506.10.60 from Canada. The USMCA was not renewed at the July 1, 2026 joint review '
        'but remains in force.',
        'citations': [
            {'label': '19 CFR 182.12', 'url': ecfr(19, '182.12')},
            {'label': 'HTSUS General Note 11 (USMCA rules of origin, Chapter 65)', 'url': GN_PDF},
            {'label': 'HTSUS 9903.05.93 / 9903.05.94, U.S. notes 51–52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'fta',
        'title': 'Claim CAFTA-DR, the Jordan FTA, AGOA or another FTA',
        'saves': 'The base rate; for CAFTA-DR hats from Guatemala or El Salvador and for all Jordanian hats, the Section 301 duty too',
        'appliesTo': 'Dutiable lines whose Special column lists the program: CAFTA-DR (P), Jordan (JO), AGOA (D, some lines only), Korea (KR), '
        'Colombia (CO), Peru (PE) and the other FTA partners',
        'document': 'The origin proof each program requires (a certification or declaration of origin, or the AGOA documentation) and records to '
        'back it up.',
        'caveat': 'An FTA removes the base rate but, except where a note 52(j) list says otherwise, not the 2026 Section 301 duty (U.S. note '
        '52(a)). The note 52(j) lists for Guatemala, El Salvador and Jordan cover every Chapter 65 line except safety headgear. The CAFTA-DR '
        'textile exemption (note 52(i)) does not reach hats, because general note 29(d)(v) leaves headings 6501–6504 and hats of former '
        '6505.90 out of "textile or apparel good" — so CAFTA-DR caps from Honduras, the Dominican Republic, Nicaragua and Costa Rica pay the '
        'Section 301 duty. GSP (A, A*) has been expired since December 31, 2020 and the Nepal program (NP) since December 31, 2025.',
        'citations': [
            {'label': 'HTSUS General Notes 3(c), 8–34 (incl. 29(d)(v))', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a), (i), (j)', 'url': CH99_PDF},
            {'label': '19 U.S.C. 4454(f) (Nepal program ended December 31, 2025)', 'url': USC_4454},
        ],
    },
    {
        'id': 'cn-exclusion',
        'title': 'Use the China exclusions for disposable caps and some helmets',
        'saves': 'The 25% List 3 duty on nonwoven disposable caps, or the 7.5% List 4A duty on the excluded motorcycle and bicycle helmets',
        'appliesTo': '6505.00.80.15 (nonwoven disposable headgear without peaks or visors); 6506.10.60.30 (motorcycle helmets); bicycle helmets '
        'in 6506.10.60.45 with shells of PVC, polycarbonate or ABS and an inner liner of expanded polypropylene or polystyrene',
        'document': 'Product specifications showing the goods match the exclusion; report 9903.88.69 instead of 9903.88.03 or 9903.88.15.',
        'caveat': 'In effect through November 9, 2026 unless USTR extends them again. The 12.5% 2026 Section 301 duty (9903.05.31) still applies.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 20(vvv)(iii)–(iv), 9903.88.69', 'url': CH99_PDF},
            {'label': '90 FR 55232 (exclusions extended to November 9, 2026)', 'url': FR_EXCL},
        ],
    },
    {
        'id': 'first-sale',
        'title': 'Value at the first sale for export when you buy through a middleman',
        'saves': 'Every ad valorem duty is charged on a lower value — the base rate and the 10%–50% extra duties included — when the factory price '
        'to a trading company or brand owner is lower than the price you pay',
        'appliesTo': 'All lines bought through a trading company, agent-buyer or brand owner rather than straight from the maker',
        'document': 'Proof that the first sale was a bona fide sale for export to the United States at arm\'s length: the factory invoice, '
        'contracts and payment records.',
        'caveat': 'Only a sale clearly destined for the U.S. qualifies, and the importer must be able to show the earlier price at entry.',
        'citations': [{'label': '19 CFR 152.103', 'url': ecfr(19, '152.103')}],
    },
    {
        'id': 'assembly',
        'title': 'Assemble abroad from U.S.-made components (9802.00.80)',
        'saves': 'Duty — including the Section 301 duty — on the value of U.S.-made components, such as U.S.-cut cap panels or visors, sewn into '
        'hats abroad',
        'appliesTo': 'Caps and hats sewn abroad from components fabricated in the United States',
        'document': 'The assembler\'s declaration and the importer\'s endorsement that 19 CFR 10.24 requires, with records of the U.S. components.',
        'caveat': 'The components must be fabricated in the U.S., ready for assembly and not advanced in value abroad except by assembly. The '
        'Section 301 duty applies to the value of the hat less the U.S. components (U.S. note 52(a)); the hat\'s origin is still where it was '
        'assembled.',
        'citations': [
            {'label': 'HTSUS Chapter 98, 9802.00.80', 'url': CH98_PDF},
            {'label': '19 CFR 10.11–10.24', 'url': ecfr(19, '10.11')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'drawback',
        'title': 'Recover duty on goods you export or destroy',
        'saves': 'Up to 99% of the duties paid, when the imported goods (or goods made from them) are exported or destroyed',
        'appliesTo': 'Any line — for example caps re-exported to Canadian or Latin American customers',
        'document': 'A drawback claim to CBP with import, manufacturing and export records.',
        'caveat': 'Claims have filing deadlines and record-keeping rules; check whether a given Chapter 99 duty is eligible before relying on it.',
        'citations': [{'label': '19 CFR part 190', 'url': ecfr_part(19, 190)}],
    },
    {
        'id': 'ftz',
        'title': 'Hold, decorate or relabel goods in a foreign-trade zone',
        'saves': 'No duty on goods re-exported from the zone, and duty deferred until goods leave it for the U.S. market',
        'appliesTo': 'Any line — useful for blank caps stocked for several markets',
        'document': 'Zone admission (CBP Form 214) and the zone operator\'s inventory records.',
        'caveat': 'Goods entered for U.S. consumption from a zone pay the duties in force on the entry date. CPSC certificate eFiling for goods '
        'entered from a zone applies from January 8, 2027.',
        'citations': [
            {'label': '19 CFR part 146', 'url': ecfr_part(19, 146)},
            {'label': '90 FR 1800 (CPSC certificates rule)', 'url': FR_CPSC_CERT},
        ],
    },
    {
        'id': 'ch98',
        'title': 'Use a Chapter 98 provision for U.S. goods coming back',
        'saves': 'All duty on U.S.-made goods returned unchanged (9801.00.10), for example unsold caps sent back by a foreign distributor',
        'appliesTo': 'Any line, for American goods returned without having been advanced in value or improved abroad',
        'document': 'Proof of U.S. origin and of the export, as CBP requires for the provision.',
        'caveat': 'The Section 301 and 338 duties also do not apply to goods properly entered under Chapter 98, except subchapter XXIII and '
        '9802.00.40–9802.00.80 (U.S. notes 51(a) and 52(a)).',
        'citations': [
            {'label': 'HTSUS Chapter 98, 9801.00.10', 'url': CH98_PDF},
            {'label': '19 CFR 10.1', 'url': ecfr(19, '10.1')},
        ],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding classification ruling',
        'saves': 'Certainty where the line decides the rate and the extra duty: knitted versus woven, cotton versus man-made fiber, braid or not; '
        'a helmet of reinforced plastics (6506.10.30) or not (6506.10.60, on the Canada Section 338 list)',
        'appliesTo': 'Any line where the material, construction or use decides the line',
        'document': 'A ruling request to CBP describing the article, its materials by weight, construction and use.',
        'caveat': 'Rulings apply to the transaction described; a changed design or material may need a new one.',
        'citations': [
            {'label': '19 CFR part 177', 'url': ecfr_part(19, 177)},
            {'label': 'HTSUS Chapter 65 notes', 'url': CH65_PDF},
        ],
    },
]

te['rules'] = [
    {
        'id': 'cpsc-bike',
        'agency': 'CPSC',
        'title': 'Bicycle helmets must meet the CPSC safety standard and carry its certification label, which is the helmet\'s certificate of '
        'compliance; the importer counts as the manufacturer and must run a reasonable testing program. From July 8, 2026 the certificate data '
        'must be eFiled in ACE with the entry. Helmets for children 12 and under need third-party testing by a CPSC-accepted lab',
        'citations': [
            {'label': '16 CFR 1203.1 (scope)', 'url': ecfr(16, '1203.1')},
            {'label': '16 CFR 1203.32–1203.34 (importers, testing, label)', 'url': ecfr(16, '1203.34')},
            {'label': '16 CFR 1110.13 (eFiling at entry)', 'url': ecfr(16, '1110.13')},
            {'label': '16 CFR part 1107 (third-party testing)', 'url': ecfr_part(16, 1107)},
        ],
    },
    {
        'id': 'nhtsa-moto',
        'agency': 'NHTSA (DOT)',
        'title': 'Motorcycle helmets must meet FMVSS No. 218 and carry its labels, including the "DOT" certification label; at entry the '
        'importer files the HS-7 declaration that the equipment conforms, and a foreign manufacturer must name a U.S. agent for service',
        'citations': [
            {'label': '49 CFR 571.218 (FMVSS 218)', 'url': ecfr(49, '571.218')},
            {'label': '49 CFR 591.5 (declaration at entry)', 'url': ecfr(49, '591.5')},
            {'label': '49 CFR part 551, subpart D (agent)', 'url': ecfr(49, '551.45')},
        ],
    },
    {
        'id': 'ftc-textile',
        'agency': 'FTC',
        'title': 'Textile headwear is wearing apparel under the Textile Act: label the fiber content by generic name and percentage, the country '
        'where it was made and the maker\'s name or RN. Hats are excluded from the care-labeling rule',
        'citations': [
            {'label': '16 CFR 303.1 (headwear, wearing apparel)', 'url': ecfr(16, '303.1')},
            {'label': '16 CFR 303.16 (label content)', 'url': ecfr(16, '303.16')},
            {'label': '16 CFR 303.33 (country of origin)', 'url': ecfr(16, '303.33')},
            {'label': '16 CFR 423.1(g) (care labeling excludes hats)', 'url': ecfr(16, '423.1')},
        ],
    },
    {
        'id': 'ftc-wool',
        'agency': 'FTC',
        'title': 'Hats containing wool (wool beanies, wool-felt hats) are labeled under the Wool Products Labeling Act instead of the Textile Act',
        'citations': [{'label': '16 CFR part 300', 'url': ecfr_part(16, 300)}],
    },
    {
        'id': 'cpsc-flam',
        'agency': 'CPSC',
        'title': 'The clothing flammability standard does not apply to hats, unless the hat covers or forms part of a covering for the neck, face '
        'or shoulders (for example a balaclava)',
        'citations': [{'label': '16 CFR 1610.1(c)', 'url': ecfr(16, '1610.1')}],
    },
    {
        'id': 'ftc-fur',
        'agency': 'FTC',
        'title': 'Furskin headgear is a fur product: the label and invoice must give the animal name from the Fur Products Name Guide, the '
        'country of origin and whether the fur is dyed or pieced',
        'citations': [{'label': '16 CFR part 301', 'url': ecfr_part(16, 301)}],
    },
    {
        'id': 'fws-fur',
        'agency': 'U.S. Fish & Wildlife Service',
        'title': 'Headgear of the fur of a wild species is a wildlife product: it must be declared on Form 3-177 and cleared by FWS before CBP '
        'releases it; furs of domesticated animals (rabbit, sheep and others listed in 50 CFR 14.4) are exempt',
        'citations': [
            {'label': '50 CFR 14.4 (domesticated animals)', 'url': ecfr(50, '14.4')},
            {'label': '50 CFR 14.52 (clearance)', 'url': ecfr(50, '14.52')},
            {'label': '50 CFR 14.61 (Form 3-177)', 'url': ecfr(50, '14.61')},
        ],
    },
    {
        'id': 'cbp-marking',
        'agency': 'CBP',
        'title': 'Country-of-origin marking in English, legible, indelible and permanent enough to reach the ultimate purchaser — on the hat or '
        'helmet itself or its retail container',
        'citations': [
            {'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')},
            {'label': '19 CFR 134.41', 'url': ecfr(19, '134.41')},
        ],
    },
    {
        'id': 'cbp-textile-origin',
        'agency': 'CBP',
        'title': 'Hats of headings 6501, 6502, 6504 and 6505 (except hair-nets) are "textile products": their origin is the country where they '
        'were wholly assembled or, for one-piece hats, where the fabric was formed or the hat was knitted',
        'citations': [{'label': '19 CFR 102.21', 'url': ecfr(19, '102.21')}],
    },
    {
        'id': 'cbp-ch99',
        'agency': 'CBP',
        'title': 'Report the Chapter 99 headings with the line: the 2026 Section 301 heading for the country (or its note 52(j) exemption), China '
        'List 3 (9903.88.03) or List 4A (9903.88.15) or their exclusion (9903.88.69), Brazil (9903.05.01), Canada Section 338 (9903.03.14)',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 30, 50–52', 'url': CH99_PDF},
            {'label': 'CBP CSMS # 69326983 (Section 301 guidance)', 'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/421d887'},
        ],
    },
]

GROUP_RULES = {
    '6501': ['cbp-textile-origin', 'ftc-wool', 'cbp-marking', 'cbp-ch99'],
    '6502': ['cbp-textile-origin', 'cbp-marking', 'cbp-ch99'],
    '6504': ['cbp-textile-origin', 'ftc-textile', 'cbp-marking', 'cbp-ch99'],
    '6505': ['cbp-textile-origin', 'ftc-textile', 'ftc-wool', 'cpsc-flam', 'cbp-marking', 'cbp-ch99'],
    '6506': ['cpsc-bike', 'nhtsa-moto', 'ftc-fur', 'fws-fur', 'cbp-marking', 'cbp-ch99'],
    '6507': ['cbp-marking', 'cbp-ch99'],
}
GROUP_NOTES = {
    '6501': 'Unfinished felt hat bodies. No agency license. Their origin follows the textile rules of 19 CFR 102.21.',
    '6502': 'Unfinished plaited hat shapes. No agency license. Shapes made by sewing (other than sewing strips in spirals) are not here '
    '(Chapter 65, note 2).',
    '6504': 'No agency license for straw or plaited hats. Hats of man-made-fiber braid are textile products for the FTC labeling rules.',
    '6505': 'The FTC Textile and Wool Acts govern the labels on caps and beanies; the care-labeling rule and the clothing flammability standard '
    'do not apply to hats. Knitted man-made-fiber hats (6505.00.60) from Canada pay the 50% Section 338 duty even under USMCA.',
    '6506': 'Bicycle helmets (athletic lines 6506.10.30.45 and 6506.10.60.45) fall under CPSC\'s 16 CFR part 1203; motorcycle helmets '
    '(6506.10.30.30, 6506.10.60.30) under NHTSA\'s FMVSS 218. Hard hats have no federal entry rule; OSHA\'s head-protection standard (29 '
    'CFR 1910.135) tells employers which hard hats workers must wear. Safety headgear of 6506.10.60 from Canada pays the 50% Section 338 duty.',
    '6507': 'Hat parts — sweatbands, linings, frames, peaks and chin straps — are Free and need no agency license. A stand-alone headband worn '
    'as a hair accessory is not a part of headgear and is classified by its material elsewhere.',
}
for g in te['groups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['ruleIds'] = GROUP_RULES[g['heading']]
    g['note'] = GROUP_NOTES[g['heading']]

WOOL = ('6501.00.90', '6505.00.08', '6505.00.30', '6505.00.40', '6505.00.60.40', '6505.00.90.45')
MOTO = ('6506.10.30.30', '6506.10.60.30')
BIKE = ('6506.10.30.45', '6506.10.60.45')
EXCL = ('6505.00.80.15', '6506.10.60.30', '6506.10.60.45')
for ln in te['lines']:
    h = ln['hts'][:4]
    sub = ln['hts']
    rules = []
    if h in ('6501', '6502', '6504') or (h == '6505' and not sub.startswith('6505.00.01')):
        rules.append('cbp-textile-origin')
    if h == '6505' or sub.startswith(('6504.00.90.15', '6504.00.90.60')):
        rules.append('ftc-textile')
    if sub.startswith(WOOL):
        rules.append('ftc-wool')
    if h == '6505':
        rules.append('cpsc-flam')
    if sub.startswith(BIKE):
        rules.append('cpsc-bike')
    if sub.startswith(MOTO):
        rules.append('nhtsa-moto')
    if sub.startswith('6506.99.30'):
        rules += ['ftc-fur', 'fws-fur']
    rules += ['cbp-marking', 'cbp-ch99']
    ln['ruleIds'] = rules
    row = next(r for r in rows if r['hts'] == sub)
    gen = row['effectiveGeneral']
    dutiable = bool(gen and gen != 'Free')
    levers = []
    if h in ('6504', '6505'):
        levers.append('material')
    levers += ['origin', 'usmca']
    if dutiable:
        levers.append('fta')
    if sub.startswith(EXCL):
        levers.append('cn-exclusion')
    levers.append('first-sale')
    if h in ('6504', '6505'):
        levers.append('assembly')
    levers += ['drawback', 'ftz', 'ch98', 'ruling']
    ln['leverIds'] = levers

te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations and the tariff schedule — not legal advice. Which line a hat or helmet '
    'falls in, where it originates and which Chapter 99 duties apply depend on the facts of each shipment, and the extra duties change by '
    'Federal Register notice and CBP guidance; confirm the current headings and the CPSC and NHTSA requirements before each shipment.'
)

# ---------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------
h6505, h6506 = hy('6505'), hy('6506')
helmets = by_hs6['650610']['importsUsd']
cn_helm = by_hc.get(('6506', 'China'), 0)
pt_6501 = by_hc.get(('6501', 'Portugal'), 0)
jp_6506 = by_hc.get(('6506', 'Japan'), 0)
ov['seo']['title'] = 'HTS Chapter 65 Tariff Rates 2026: Hat, Cap & Helmet Import Duty by Country | KoalaGains'
ov['seo']['shortDescription'] = (
    f'Searchable 2026 U.S. tariff table for all {n_lines} HTS Chapter 65 lines — baseball caps, beanies, straw and felt hats, hair-nets, '
    'bicycle and motorcycle helmets, hard hats. Base rates from Free to 9.4% plus the extra duty by country: +12.5% Vietnam, +10% Bangladesh, '
    'up to 45% for Chinese caps.'
)
ov['seo']['keywords'] = [
    'hts chapter 65',
    'headgear and parts thereof tariff',
    'headgear and parts thereof import duty rates',
    'hs code for hats',
    'hts code for baseball caps',
    'hs code for beanie',
    'hts 6505 general duty rates',
    'hts 6506 protective helmets',
    'tariffs on hats',
    'china section 301 headwear duties',
]
ov['intro'] = (
    'Chapter 65 covers hats and caps of every kind — baseball caps, beanies, bucket hats, straw and felt hats, hair-nets — plus safety '
    'headgear such as bicycle, motorcycle and sports helmets and hard hats, unfinished felt and straw hat bodies, and hat parts. Base rates are '
    f'moderate: {n_dutiable} of the {n_lines} lines are dutiable, mostly 6%–9.4% or a per-kilo charge plus 6.3%–10.3% — a woven cotton '
    'baseball cap pays 7.5%, a polyester one 18.7¢/kg + 6.8% — while **helmets, fur-felt hats and hat parts are Free**.\n\n'
    f'The U.S. imported **{fmt_usd(total)}** of these goods in {Y}, {fmt_usd(h6505)} of it caps and other hats of heading 6505 and '
    f'{fmt_usd(helmets)} safety headgear. **China** ({fmt_usd(imp("China"))}, down {abs(chg("China"))}%) still led, ahead of **Vietnam** '
    f'({fmt_usd(imp("Viet Nam"))}, up {chg("Viet Nam")}%), **Mexico** ({fmt_usd(imp("Mexico"))}) and **Bangladesh** '
    f'({fmt_usd(imp("Bangladesh"))}). On top of the base rate comes the **extra duty by country**: since July 24, 2026 a Section 301 tariff '
    'on 60 economies — +12.5% for Vietnam and Thailand, +10% for Bangladesh, Cambodia, Indonesia and India, **10% in total for EU goods** and '
    'Taiwan. **China pays +12.5% plus 25% (List 3) on hats and caps** — 45% for a cotton cap — and **+12.5% plus 7.5% (List 4A) on helmets**. '
    'USMCA-qualifying hats from Mexico pay nothing extra; from Canada, knitted synthetic hats and most helmets owe a **50% Section 338 duty '
    'even under USMCA**. Bicycle helmets also need **CPSC** certification and motorcycle helmets a **DOT (FMVSS 218)** label.'
)

ov['workedExamples'] = [
    {
        'title': 'Cotton baseball cap from Vietnam',
        'line': '6505.00.20.60',
        'body': 'A woven cotton cap pays 7.5%. Vietnam adds +12.5% (9903.05.84): **20%**, $2,000 on a $10,000 order. The same cap pays 17.5% '
        'from Bangladesh, Cambodia or Indonesia, 45% from China (7.5% + 12.5% + 25% List 3), 10% from Italy (in total), and nothing from Mexico '
        'when it qualifies under USMCA. Its origin is where it was sewn together (19 CFR 102.21), and the cap needs FTC fiber, origin and maker '
        'labels.',
    },
    {
        'title': 'Acrylic beanie from China — and from Canada',
        'line': '6505.00.60.90',
        'body': 'A beanie knitted of man-made fibers pays 20¢/kg + 7%. 1,000 Chinese beanies weighing 80 kg and valued at $4,000 pay $16 + $280 '
        'base, plus 12.5% (9903.05.31) and 25% (List 3, 9903.88.03) = $1,500 — **$1,796, 44.9%**. From Vietnam the same shipment pays $796 '
        '(19.9%). From Canada, 6505.00.60 is on the Section 338 list (9903.03.14): a USMCA-qualifying beanie pays **50%** ($2,000), because '
        'U.S. note 51(a) applies the duty even when USMCA is claimed.',
    },
    {
        'title': 'Bicycle helmet from China',
        'line': '6506.10.60.45',
        'body': 'Safety headgear is Free, but China adds +12.5% (9903.05.31) and +7.5% (List 4A, 9903.88.15): **20%**, $2,000 on $10,000. A '
        'helmet with a PVC, polycarbonate or ABS shell and an expanded-polystyrene or -polypropylene liner matches the note 20(vvv)(iv) exclusion '
        '(9903.88.69) and pays 12.5% through November 9, 2026. From Taiwan it pays 10% in total, from Vietnam 12.5%. Every bicycle helmet must '
        'meet 16 CFR part 1203, carry its certification label, and — since July 8, 2026 — have its certificate data eFiled with the entry.',
    },
    {
        'title': 'Fur-felt fedora from Italy; wool-felt hat bodies from Portugal',
        'line': '6505.00.04.10',
        'body': 'A fur-felt hat is Free, so the EU rule (9903.05.39) makes it **10% in total**: $1,000 on $10,000, against 15% in late 2025. '
        f'Portugal shipped {fmt_usd(pt_6501)} of felt hat bodies (heading 6501) in {Y}; wool-felt bodies of 6501.00.90 pay 10.3¢/kg + 10.3% — '
        'already above 10% — so nothing is added to them.',
    },
]

snap = ov['tradeSnapshot']
snap['effectiveDutyRateNote'] = 'Duty-collected figures aren’t available from an official source yet.'
snap['totalDutyCollectedUsd'] = None
snap['source'] = f'UN Comtrade, United States imports, HS chapter 65 ({Y})'
snap['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar {Y} — before the '
    '2026 tariff changes.'
)
for c in snap['topCountries']:
    if c['name'] == 'Viet Nam':
        c['name'] = 'Vietnam'

ov['notes']['chapterNotes'] = (
    '**Note 1.** This chapter does not cover: (a) Worn headgear of heading 6309; (b) Asbestos headgear (heading 6812); or (c) Dolls\' hats, '
    'other toy hats or carnival articles of chapter 95.\n\n'
    '**Note 2.** Heading 6502 does not cover hat shapes made by sewing, other than those obtained simply by sewing strips in spirals.'
)
ov['notes']['additionalUsNotes'] = (
    '**1.** This chapter does not include mufflers, shawls, scarves, mantillas, veils and the like (heading 6117 or 6214).'
)

for s in ov['stats']:
    if s['label'] == 'Lines with an extra duty for some origins':
        s['note'] = (
            'Section 301 (2026, 60 economies): 64; Brazil: 64; China List 3: 56 and List 4A: 6 (after the exclusions for whole statistical '
            'lines); Canada Section 338: 7 (also on USMCA goods); Russia 35% in lieu of column 2: 3'
        )
    if s['label'] == 'China + Vietnam share':
        pass

# ---------------------------------------------------------------------------------------------------
# Industry areas (matrix)
# ---------------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['h1'] = f'HTS Chapter 65: {SHORT} — Tariff Rates by Country'
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]

RULE_LABELS = {
    'China': 'Base rate + 12.5% Section 301 (9903.05.31) + 25% List 3 (9903.88.03) on hats, caps, hat bodies and parts, or + 7.5% List 4A '
    '(9903.88.15) on helmets and hair-nets. Nonwoven disposable caps (6505.00.80.15) and motorcycle helmets of 6506.10.60.30 skip the List '
    '3/4A duty through November 9, 2026 (9903.88.69).',
    'Vietnam': 'Base rate + 12.5% Section 301 (9903.05.84). No Chapter 65 line is exempt. The 20% IEEPA duty ended February 24, 2026.',
    'Bangladesh': 'Base rate + 10% Section 301 (9903.05.26). No Chapter 65 line is exempt. The 20% IEEPA duty ended February 24, 2026.',
    'Indonesia': 'Base rate + 10% Section 301 (9903.05.45). No Chapter 65 line is exempt.',
    'Cambodia': 'Base rate + 10% Section 301 (9903.05.28). No Chapter 65 line is exempt.',
    'Thailand': 'Base rate + 12.5% Section 301 (9903.05.77). No Chapter 65 line is exempt.',
    'India': 'Base rate + 10% Section 301 (9903.05.44). No Chapter 65 line is exempt. The IEEPA duties (up to 50%) ended in February 2026.',
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81). No Chapter 65 line is on the UK exception list.',
    'Brazil': 'Base rate + 25% Section 301 Brazil action (9903.05.01) + 12.5% 2026 action (9903.05.27). No Chapter 65 line is on the Brazil '
    'exemption list.',
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94). Otherwise base rate + 10% Section 301 (9903.05.55). The 25% IEEPA duty ended '
    'February 24, 2026.',
    'Canada': 'USMCA-qualifying: no Section 301 duty (9903.05.93); otherwise base rate + 10% (9903.05.29). On top, 50% Section 338 on '
    '6505.00.60 (knitted man-made-fiber hats) and 6506.10.60 (safety headgear not of reinforced plastics) (9903.03.14) — whether or not USMCA '
    'is claimed.',
    'Taiwan': 'Taiwan: 10% in total in place of the base rate when the base rate is under 10% (9903.05.76) — helmets, caps and hats. No Chapter '
    '65 line is exempt.',
    'Japan': 'Japan: 12.5% in total in place of the base rate when the base rate is under 12.5% (9903.05.49) — every Chapter 65 line at the '
    'test shipment. No Chapter 65 line is exempt.',
}
EU_LABEL = (
    'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39) — caps, felt hats, helmets. Lines at 10% or more '
    '— wool-felt hat bodies (6501.00.90) and, at the test shipment, wool caps — pay only their base rate (9903.05.38). The 15%-in-total IEEPA '
    'rate ended February 24, 2026.'
)


def rule_label(c):
    r = c['rule']
    name = c['country']
    if name in RULE_LABELS:
        return RULE_LABELS[name]
    if r.get('atLeast'):
        return (
            'Countries outside the 60 Section 301 economies (for example Myanmar, Laos, Haiti, Nepal) pay no Section 301 duty. The 60 pay +10% '
            'or +12.5% (9903.05.20–9903.05.84), or 10% or 12.5% in total for Taiwan and South Korea; China pays up to +37.5% and Brazil +37.5%. '
            'Jordan, and Guatemala and El Salvador under CAFTA-DR, are exempt on every line except safety headgear (note 52(j)). Column 2 '
            'countries (Cuba, North Korea, Russia, Belarus) pay column 2 rates — 25% to 90% plus specific rates.'
        )
    if r['kind'] == 'eu15':
        return EU_LABEL
    raise SystemExit(f'no rule label for {name}')


for c in ia['countries']:
    c['rule']['label'] = rule_label(c)
    if c['country'] == 'Any other country':
        c['rule']['ch99Code'] = '9903.05.20–9903.05.84'
    ids = c['rule']['sourceIds']
    if c['country'] in ('Canada', 'Mexico'):
        if 'eo-14389' not in ids:
            ids.insert(-1, 'eo-14389')
    if c['country'] == 'China' and 'fr-2025-21671' not in ids:
        ids.insert(-1, 'fr-2025-21671')
add_sources(ia, ['eo-14389', 'fr-2025-21671'])

ia['seo'] = {
    'title': 'Hat & Helmet Tariffs by Country 2026 — China, Vietnam, Mexico, Bangladesh, Italy (HTS Ch. 65) | KoalaGains',
    'shortDescription': 'The total 2026 U.S. tariff on caps, beanies, straw and felt hats and helmets by country: 20% for a Vietnamese cotton '
    'cap, 17.5% from Bangladesh, 45% from China, 10% in total from Italy, Free for USMCA caps from Mexico, 50% Section 338 on Canadian beanies '
    'and helmets.',
    'keywords': [
        'mexico tariff on headgear and parts thereof',
        'usmca headwear duty rates',
        'bangladesh tariff on headgear and parts thereof',
        'vietnam hat tariff',
        'china tariff on hats',
        'section 301 headgear tariffs',
        'plaited hats and knitted headgear customs duty',
        'protective helmets import duty',
    ],
}
ia['intro'] = (
    'Chapter 65 base rates are moderate — Free for helmets, up to 9.4% or a per-kilo-plus-percent rate for caps and hats — and the extra duty '
    '**depends on where the goods come from**. Each cell below is the base rate for that product group plus the extra duty for that country, '
    'minus any preference — taken from the current tariff schedule.\n\n'
    'Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** that started July '
    '24, 2026: **+12.5% for Vietnam and Thailand**, **+10% for Bangladesh, Indonesia, Cambodia and India**, and **10% in total for Italy, '
    'Portugal and the rest of the EU** and for Taiwan. **China adds 37.5%** on hats and caps and **20%** on helmets. USMCA-qualifying hats from '
    'Mexico pay nothing; from Canada they pay nothing except knitted synthetic hats (6505.00.60) and most helmets (6506.10.60), which carry the '
    '**50% Section 338 duty** whatever the USMCA status. Myanmar, Laos and Haiti — outside the 60 economies — pay no Section 301 duty.'
)
assumptions = [a for a in ia['assumptions'] if 'TODO' not in a]
assumptions += [
    'Canada, "USMCA-qualifying" side: the Section 301 duty is removed (9903.05.93), but the 50% Section 338 duty stays on 6505.00.60 and '
    '6506.10.60 because U.S. note 51(a) applies it even when a special rate is claimed.',
    'For the EU, Taiwan and Japan "in total" rules, per-kilo rates are compared at the $10,000 / 1,000 kg test shipment ($10 per kg), so wool '
    'caps (25.4¢/kg + 7.7%, 31¢/kg + 7.9%) count as above 10%; for a real shipment the ad valorem equivalent uses its own value and weight '
    '(note 52(k)). Per-dozen rates are shown as written.',
    'Not in the cells: the China List 4A exclusion for bicycle helmets of the description in note 20(vvv)(iv) (it needs the importer\'s '
    'confirmation); the note 52(j) exemptions for Jordan and for CAFTA-DR hats from Guatemala and El Salvador (those countries are in "Any '
    'other country"); CAFTA-DR, AGOA, CBERA and other FTA preferences; and CPSC, NHTSA or FTC compliance costs. No antidumping or '
    'countervailing duty order covers a Chapter 65 product.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied.',
]
ia['assumptions'] = assumptions
ia['exemptionCheck'] = (
    'Read U.S. notes 16, 19, 20, 30, 33, 36–39, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 general '
    'exemption list (note 52(b), 9903.05.86) and the other note 52(c)–(f) lists have no Chapter 65 line. The country exception lists in note '
    '52(j) name every Chapter 65 line except 6506.10 for Jordan (9903.06.20), and for Guatemala (9903.06.06) and El Salvador (9903.06.09) when '
    'entered under CAFTA-DR; the UK, EU, Malaysia, Cambodia, Argentina, Bangladesh, Taiwan, Indonesia and other lists name none. Note 52(i) '
    '(CAFTA-DR textile goods, 9903.05.95) reaches no hat of headings 6501–6504 or former 6505.90, which general note 29(d)(v) leaves out of '
    '"textile or apparel good". The Brazil list (note 50(a)(ii)) has no Chapter 65 line. The Canada Section 338 list (note 51(b)(3)) names '
    '6505.00.60 and 6506.10.60; the alcoholic-beverage and dairy lists name none. China: List 3 (note 20(f)) covers every 6501–6505 '
    'subheading except hair-nets, plus 6506.91, 6506.99 and 6507; List 4A (note 20(s)) covers 6505.00.01 and 6506.10; the exclusions in '
    'effect (note 20(vvv)(iii)–(iv)) cover 6505.00.80.15, 6506.10.60.30 and certain bicycle helmets of 6506.10.60.45 through November 9, 2026 '
    '— the older exclusions printed in note 20 have expired. Section 232: no Chapter 65 line is on a metals, vehicle, wood, semiconductor or '
    'pharmaceutical list. Note 30(b) sets 35% for Russian 6506.10.60 in place of column 2. A Federal Register search of Commerce (ITA) notices '
    'since 2015 found no antidumping or countervailing duty order on a Chapter 65 product.'
)

# ---------------------------------------------------------------------------------------------------
# Understand industry
# ---------------------------------------------------------------------------------------------------
ui['h1'] = f'HTS Chapter 65: {SHORT} — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Hat, Cap & Helmet Imports by Country — HTS Chapter 65 Trade Statistics | KoalaGains',
    'shortDescription': f'U.S. imports of HTS Chapter 65 goods: {fmt_usd(total)} in {Y}. Who supplies caps, beanies, straw and felt hats and '
    'helmets — China, Vietnam, Mexico, Bangladesh, Italy, Indonesia, Cambodia — with values by product and year from UN Comtrade.',
    'keywords': [
        'hts chapter 65',
        'hts 6505 general duty rates',
        'hts 6506 protective helmets',
        'us hat imports by country',
        'us helmet imports by country',
        'headgear imports vietnam',
        'knitted hats import duty',
        'section 301 headgear tariffs',
    ],
}
ui['valueBasis'] = trade['valueBasis']
for st in ui['stats']:
    st['label'] = st['label'].replace('Viet Nam', 'Vietnam')
ui['byYearPartners'] = ['China', 'Vietnam']
ui['byYearCaption'] = 'U.S. imports of Chapter 65 goods each year, split into the two largest 2025 suppliers (China and Vietnam) and everyone else.'
ui['why'] = (
    f'U.S. imports of Chapter 65 goods were **{fmt_usd(total)} in {Y}**, {abs(pct(total, prior_total))}% less than the {fmt_usd(prior_total)} '
    f'of {PY} and well below the {fmt_usd(year_tot[2022])} peak of 2022. Heading 6505 — caps, beanies, bucket hats, felt hats and hair-nets — '
    f'made up {share(h6505)}% of it ({fmt_usd(h6505)}); **safety headgear (6506.10)**, mostly helmets, added {fmt_usd(helmets)}, and straw and '
    f'other plaited hats (6504) {fmt_usd(hy("6504"))}.\n\n'
    f'The supplier map moved away from China. **China** fell {abs(chg("China"))}% to {fmt_usd(imp("China"))}, from {fmt_usd(imp_year("China", 2020))} '
    f'in 2020, but still shipped {fmt_usd(cn_helm)} of the {fmt_usd(h6506)} of helmets and other headgear of heading 6506 — about half. **Vietnam** grew '
    f'{chg("Viet Nam")}% to {fmt_usd(imp("Viet Nam"))}, more than double its 2020 level, and is now the largest supplier of caps and hats of '
    f'heading 6505 ({fmt_usd(by_hc.get(("6505", "Viet Nam"), 0))}). **Bangladesh** ({fmt_usd(imp("Bangladesh"))}, +{chg("Bangladesh")}%), '
    f'**Cambodia** ({fmt_usd(imp("Cambodia"))}) and **Indonesia** ({fmt_usd(imp("Indonesia"))}, +{chg("Indonesia")}%) kept growing. **Mexico** '
    f'({fmt_usd(imp("Mexico"))}) is the main nearshore source of caps and straw hats. **Italy** ({fmt_usd(imp("Italy"))}) ships caps and hats '
    f'and helmets; **Portugal** ({fmt_usd(imp("Portugal"))}) is the largest source of felt hat bodies ({fmt_usd(pt_6501)} of heading 6501). '
    f'**Japan** ({fmt_usd(imp("Japan"))}) ships almost only helmets and other 6506 headgear ({fmt_usd(jp_6506)}), and **Taiwan** '
    f'({fmt_usd(imp("Other Asia, nes"))}) a mix of helmets, hat parts and caps.\n\n'
    f'Myanmar ({fmt_usd(imp("Myanmar"))}), Laos ({fmt_usd(imp("Lao People\'s Dem. Rep."))}) and Haiti ({fmt_usd(imp("Haiti"))}) are '
    'sizable suppliers outside the 60 Section 301 economies. The figures are annual and stop at '
    f'{Y}, before the 2026 tariff changes (the end of the IEEPA duties in February, the Section 301 tariffs from July 24, 2026 and the Canada '
    'Section 338 duties from August 22); they do not show what those changes did. Duty-collected figures are not available from an official '
    'source yet.'
)
ui['effectiveDuty']['note'] = 'Duty-collected figures aren’t available from an official source yet.'
ui['effectiveDuty']['dutyPaidUsd'] = None
ui['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar years 2020–{Y}. '
    '"Other Asia, nes" is how UN Comtrade reports Taiwan.'
)

# ---------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['h1'] = f'HTS Chapter 65: {SHORT} — Tariff FAQ'
fc['seo'] = {
    'title': 'Hat, Cap & Helmet Tariff FAQ: China, Vietnam, Bangladesh, Mexico, HS Codes for Caps, Beanies & Helmets (HTS Ch. 65) | KoalaGains',
    'shortDescription': 'Answers to what people search about U.S. tariffs on headgear: tariffs on hats from China, Vietnam, Bangladesh and '
    'Mexico, the HS codes for baseball caps, beanies, bucket, straw, felt and cowboy hats, hair-nets and visors, and the duty and rules for '
    'motorcycle, bicycle, hockey and safety helmets.',
    'keywords': [
        'tariffs on hats',
        'hat tariff code',
        'hs code for hats',
        'baseball cap tariff code',
        'hs code for beanie',
        'hs code for bucket hat',
        'helmet tariff code',
        'motorcycle helmet tariff',
        'bike helmet hs code',
        'usmca headwear duty rates',
        'section 301 forced labor tariff headwear',
        'hts chapter 65',
    ],
}
fc['intro'] = (
    'Straight answers to the most common questions about U.S. tariffs and import rules for hats, caps and helmets. Each answer links to the '
    'page with the full detail.'
)
fc['keyTakeaways'] = [
    f'{n_dutiable} of the {n_lines} Chapter 65 lines carry a base duty, mostly 6%–9.4% or a per-kilo charge plus a percentage: 7.5% for a woven '
    'cotton cap, 18.7¢/kg + 6.8% for a polyester cap, 20¢/kg + 7% for an acrylic beanie. Helmets, hard hats, fur-felt hats and hat parts are Free.',
    'Since July 24, 2026 a Section 301 duty is added by country: +12.5% for Vietnam and Thailand, +10% for Bangladesh, Cambodia, Indonesia and '
    'India, and 10% in total for the EU and Taiwan. Myanmar, Laos and Haiti are outside the 60 economies.',
    'China pays the most: +12.5% plus 25% (List 3) on hats and caps — 45% on a cotton cap — and +12.5% plus 7.5% (List 4A) on helmets and '
    'hair-nets; exclusions for disposable caps and some motorcycle and bicycle helmets run to November 9, 2026.',
    'USMCA-qualifying hats from Mexico pay nothing; the Chapter 65 USMCA rule is a change of heading, so caps sewn in Mexico from imported '
    'fabric can qualify. From Canada, knitted synthetic hats (6505.00.60) and most helmets (6506.10.60) pay 50% Section 338 even under USMCA.',
    'The IEEPA duties (up to 177.5% on Chinese cotton caps in spring 2025, 20% on Vietnam and Bangladesh from August 2025) ended February 24, '
    '2026; the 10% Section 122 surcharge ended July 23, 2026. De minimis remains suspended, so low-value hat parcels pay duty.',
    'Bicycle helmets need CPSC certification under 16 CFR part 1203 (certificate data eFiled at entry since July 8, 2026); motorcycle helmets '
    'need the FMVSS 218 "DOT" label and an HS-7 declaration; textile hats need FTC fiber, origin and maker labels.',
]
fc['questionSource'] = f'Google search suggestions (U.S. English), collected {SUGG_DATE}'

fc['faqs'] = [
    {
        'id': 'hat-tariffs',
        'question': 'Are there tariffs on hats imported into the U.S.?',
        'searchedAs': ['tariffs on hats', 'tariffs hat', 'hat tariff'],
        'answer': 'Yes. The base rate depends on the material: a woven cotton cap pays 7.5%, a knitted cotton hat 7.9%, a polyester cap 18.7¢/kg '
        '+ 6.8%, an acrylic beanie 20¢/kg + 7%, a sewn straw hat 6%, a fur-felt hat Free. Since July 24, 2026 a Section 301 duty is added by '
        'country: Vietnam +12.5%, Bangladesh, Cambodia and Indonesia +10%, the EU 10% in total, China +37.5%. USMCA-qualifying hats from Mexico '
        'pay nothing. And with de minimis suspended, even a single hat shipped from abroad pays duty.',
        'link': 'industry-areas',
    },
    {
        'id': 'hs-hats',
        'question': 'What is the HS code (tariff code) for hats?',
        'searchedAs': [
            'hs code for hats',
            'hts code for hats',
            'tariff code for hats',
            'harmonized tariff code for hats',
            'harmonized system code for hats',
            'hs tariff code for hats',
            'hat tariff code',
        ],
        'answer': 'Hats are in HS Chapter 65. Most finished hats and caps are 6505.00 (knitted, or made up from textile fabric or felt; also '
        'hair-nets); hats plaited or made of strips, such as straw hats, are 6504.00; helmets and other safety headgear 6506.10; rubber, '
        'plastic, fur and leather headgear 6506.91 and 6506.99; hat parts 6507.00. The 10-digit U.S. number then depends on fiber, knitted or '
        'woven construction and, for many lines, whether the hat is for babies or is a visor.',
        'link': '',
    },
    {
        'id': 'baseball-cap',
        'question': 'What is the HTS code and tariff for a baseball cap?',
        'searchedAs': [
            'baseball cap tariff code',
            'baseball cap tariff',
            'hts code for baseball caps',
            'hs code for baseball caps',
            'ball caps hs code',
            'cotton baseball cap tariff code',
            'hs code for baseball hats',
        ],
        'answer': 'A woven cotton baseball cap is 6505.00.20.60 (7.5%); knitted cotton 6505.00.15.40 (7.9%); woven polyester or nylon '
        '6505.00.80.90 (18.7¢/kg + 6.8%); knitted man-made fibers 6505.00.60.90 (20¢/kg + 7%). Add the country duty: a cotton cap pays 20% from '
        'Vietnam, 17.5% from Bangladesh, 45% from China, nothing from Mexico under USMCA.',
        'link': '',
    },
    {
        'id': 'beanie',
        'question': 'What is the HS code for a beanie or knit hat?',
        'searchedAs': [
            'hs code for beanie',
            'hs code for beanie hat',
            'hs code for knitted beanie',
            'hs code for acrylic beanie',
            'hs code for wool beanie',
            'hs code for cotton beanie',
            'beanie hs tariff code',
            'beanie hat tariff code',
        ],
        'answer': 'Knitted hats are classified by fiber: acrylic or polyester 6505.00.60.90 (20¢/kg + 7%; 6505.00.60.40 if 23% or more wool), '
        'wool 6505.00.30.90 (25.4¢/kg + 7.7%), cotton 6505.00.15.40 (7.9%). A Chinese acrylic beanie pays about 45% in all; from Canada, '
        '6505.00.60 carries the 50% Section 338 duty even under USMCA.',
        'link': '',
    },
    {
        'id': 'bucket-straw',
        'question': 'What is the HS code for a bucket hat or a straw hat?',
        'searchedAs': [
            'hs code for bucket hat',
            'hs code for cotton bucket hat',
            'tariff code for bucket hat',
            'hs code for straw hat',
            'straw hat tariff code',
        ],
        'answer': 'A woven cotton bucket hat is 6505.00.20.60 (7.5%); polyester or nylon 6505.00.80.90 (18.7¢/kg + 6.8%). Straw hats plaited of '
        'vegetable fiber or paper yarn are 6504.00.30 if sewn (6%) or 6504.00.60 if not (94¢/doz. + 4.6%); hats of plastic braid or other strips '
        '6504.00.90 (6.8%). Unfinished straw hat shapes are heading 6502.',
        'link': '',
    },
    {
        'id': 'felt-cowboy',
        'question': 'What is the HS code for a felt or cowboy hat?',
        'searchedAs': ['hs code for felt hat', 'hs code for cowboy hat', 'cowboy hat code', 'hs code for fedora'],
        'answer': 'Felt hats made from felt hat bodies are 6505.00.04 if of fur felt (Free) or 6505.00.08.00 if of wool or other felt '
        '(13.5¢/kg + 6.3% + 1.9¢ each). A straw cowboy hat is classified as a plaited hat of 6504. Unblocked felt hat bodies are 6501. An '
        'Italian fur-felt fedora pays 10% in total since July 24, 2026.',
        'link': '',
    },
    {
        'id': 'china',
        'question': 'What are the tariffs on hats and caps from China?',
        'searchedAs': ['tariffs on hats', 'us tariffs on clothing from china', 'tariffs on apparel from china', 'current tariffs on clothing from china'],
        'answer': 'Chinese hats and caps pay the base rate plus 12.5% (2026 Section 301, 9903.05.31) plus 25% (List 3, 9903.88.03): 45% on a '
        'cotton cap, 18.7¢/kg + 44.3% on a polyester cap, 20¢/kg + 44.5% on an acrylic beanie. Helmets and hair-nets pay 12.5% plus 7.5% (List '
        '4A) instead. Nonwoven disposable caps, motorcycle helmets of 6506.10.60.30 and some bicycle helmets skip the List 3 or 4A duty through '
        f'November 9, 2026. China supplied {fmt_usd(imp("China"))} of headgear in {Y}, {abs(chg("China"))}% less than in {PY}.',
        'link': 'industry-areas',
    },
    {
        'id': 'vietnam-bangladesh',
        'question': 'What are the U.S. tariffs on hats from Vietnam and Bangladesh?',
        'searchedAs': [
            'tariffs on vietnam products',
            'tariffs on vietnam right now',
            'tariffs on bangladesh by us',
            'us bangladesh textile tariff',
            'us tariffs on bangladesh 2025',
        ],
        'answer': 'Since July 24, 2026 Vietnamese goods pay the base rate plus 12.5% Section 301 (9903.05.84) — 20% on a cotton cap — and '
        'Bangladeshi goods plus 10% (9903.05.26) — 17.5% on a cotton cap. No Chapter 65 line is exempt for either country. The 20% IEEPA '
        f'reciprocal tariffs on both (August 7, 2025 to February 24, 2026) have ended. Vietnam supplied {fmt_usd(imp("Viet Nam"))} of headgear '
        f'in {Y} and Bangladesh {fmt_usd(imp("Bangladesh"))}.',
        'link': 'industry-areas',
    },
    {
        'id': 'mexico',
        'question': 'Do hats made in Mexico pay U.S. tariffs?',
        'searchedAs': ['made in mexico hats', 'made in mexico cowboy hats', 'made in mexico straw hats', 'made in mexico cap', 'tariffs on mexico goods'],
        'answer': 'Not if they qualify under USMCA: the claim removes both the base rate and the 10% Section 301 duty (9903.05.94). The Chapter '
        '65 rule of origin is a change of heading, so a cap cut and sewn in Mexico from imported fabric, or a straw hat plaited there, can '
        'qualify; one assembled from imported crowns or visors (heading 6507) does not. Non-qualifying Mexican hats pay the base rate plus 10%. '
        f'Mexico supplied {fmt_usd(imp("Mexico"))} in {Y}.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'helmets',
        'question': 'What is the HS code and tariff for safety helmets and hard hats?',
        'searchedAs': [
            'helmet tariff',
            'helmet tariff code',
            'hs code for helmet',
            'safety helmet tariff code',
            'hs code for safety helmet',
            'hs code for hard hat',
            'safety hard hat hs code',
            'tariff code for hard hat',
        ],
        'answer': 'Safety headgear is 6506.10: 6506.10.30 if of reinforced or laminated plastics, 6506.10.60 otherwise, with suffix .30 for '
        'motorcycle helmets, .45 for athletic and sporting helmets and .75 for other safety headgear such as hard hats. All are Free; the extra '
        'duty is +12.5% from Vietnam, 10% in total from Taiwan, 20% from China. Hard hats need no federal entry document; OSHA\'s 29 CFR '
        '1910.135 sets which hard hats employers must provide.',
        'link': '',
    },
    {
        'id': 'motorcycle',
        'question': 'What is the tariff code for motorcycle helmets, and what rules apply?',
        'searchedAs': [
            'motorcycle helmet tariff',
            'motorcycle helmet tariff code',
            'hs code for motorcycle helmet',
            'hs code for motorbike helmet',
            'motorcycle helmet import duties',
            'legal requirements for motorcycle helmets',
        ],
        'answer': 'Motorcycle helmets are 6506.10.30.30 (reinforced or laminated plastics) or 6506.10.60.30 (other), both Free. From China they '
        'pay 20%, or 12.5% for 6506.10.60.30 while its List 4A exclusion runs (to November 9, 2026). Every motorcycle helmet must meet FMVSS 218 '
        '(49 CFR 571.218) and carry the "DOT" certification label, and the importer declares conformity on NHTSA\'s HS-7 form at entry (49 CFR '
        '591.5).',
        'link': 'tariff-engineering',
    },
    {
        'id': 'bicycle',
        'question': 'What is the HS code for a bicycle helmet, and what does CPSC require?',
        'searchedAs': [
            'bike helmet tariff code',
            'bicycle helmet tariff code',
            'bike helmet hs code',
            'hs code for bicycle helmet',
            'hs code for bike helmet',
            'bike helmet rules',
        ],
        'answer': 'Bicycle helmets are athletic headgear: 6506.10.60.45, or 6506.10.30.45 if of reinforced or laminated plastics — Free. They '
        'must meet the CPSC standard in 16 CFR part 1203 and carry its certification label; the importer must test them, and since July 8, '
        '2026 must eFile the certificate data with the entry. From China they pay 20%, or 12.5% if they match the exclusion for PVC, '
        'polycarbonate or ABS shells with EPS or EPP liners.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'hockey-ski',
        'question': 'What is the HS code for hockey and ski helmets?',
        'searchedAs': ['hockey helmet hs code', 'ski helmet tariff code'],
        'answer': 'Hockey, ski and other sports helmets are athletic headgear of 6506.10.30.45 or 6506.10.60.45, Free. From Canada, 6506.10.60 '
        'is on the Section 338 list: a USMCA-qualifying Canadian hockey helmet of 6506.10.60 pays 50%, a non-qualifying one 60%; one of '
        'reinforced or laminated plastics (6506.10.30) is not on the list. From the EU or Taiwan they pay 10% in total, from China 20%.',
        'link': 'industry-areas',
    },
    {
        'id': 'hair-net',
        'question': 'What is the HS code for a hair net?',
        'searchedAs': ['hs code for hair net', 'hs tariff code for hair net'],
        'answer': 'Hair-nets of any material are 6505.00.01.00, 9.4%. From China they pay 29.4% (List 4A + 12.5%). Nonwoven disposable caps '
        'without peaks (bouffant caps) are 6505.00.80.15 (18.7¢/kg + 6.8%), excluded from China\'s List 3 duty through November 9, 2026.',
        'link': '',
    },
    {
        'id': 'visor-headband',
        'question': 'What is the HS code for a sun visor, helmet visor or headband?',
        'searchedAs': ['hs code for visor', 'sun visor hs code', 'hs code for sun visor', 'hs code for helmet visor', 'hs code for headband'],
        'answer': 'A sun visor — headgear that leaves the crown uncovered — has its own "visor" suffix within each 6505 fiber line (for example '
        '6505.00.80.50 for woven man-made fibers, 6505.00.15.25 for knitted cotton); plastic visors are 6506.91.00.45 (Free). Peaks (visors), '
        'chin straps, sweatbands and linings made as parts of headgear are 6507.00.00 (Free). A headband worn on its own is not Chapter 65 '
        'headgear and is classified by its material.',
        'link': '',
    },
]

# ---------------------------------------------------------------------------------------------------
d['sources'] = [
    {'label': 'Harmonized Tariff Schedule of the United States', 'url': 'https://hts.usitc.gov/', 'note': 'rate table rows (2026 Revision 21)'},
    {'label': 'UN Comtrade', 'url': 'https://comtradeplus.un.org/', 'note': f'{Y} import figures'},
]
d['asOf'] = TODAY
json.dump(d, open(OUT, 'w'), ensure_ascii=False, indent=2)
print('wrote', OUT)
