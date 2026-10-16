#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 21 content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill21.py <generated.json> <out.json>
Re-runnable: every regeneration of the data parts is followed by this script.
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import HTS_FILE, IU  # noqa: E402,F401

import json
import re
import sys
from collections import OrderedDict

SRC, OUT = sys.argv[1], sys.argv[2]
WT = IU
HTS_FILE = HTS_FILE

d = json.load(open(SRC))
ref01 = json.load(open(f'{WT}/src/tariff-data/chapters/01-live-animals.json'))
REF_SOURCES = {s['id']: s for s in ref01['tariffUpdates']['sources']}

TODAY = d['asOf']
HTS_NOW_URL = 'https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_21_json.json'
CH21_PDF = 'https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2021'
CH17_PDF = 'https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2017'
CH04_PDF = 'https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%204'
CH98_PDF = 'https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2098'
CH99_PDF = 'https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2099'
GN_PDF = 'https://hts.usitc.gov/reststop/file?release=currentRelease&filename=General%20Notes'


def fmt_usd(n):
    if n >= 1e9:
        return f'${n / 1e9:.2f}B'
    if n >= 1e6:
        return f'${n / 1e6:.0f}M' if n >= 1e8 else f'${n / 1e6:.1f}M'
    return f'${n / 1e3:.0f}K'


def pct(a, b):
    return round(a / b * 100) if b else 0


# ---------------------------------------------------------------------------------------------------
# Trade figures (from the generated understandIndustry / tradeSnapshot)
# ---------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
have_trade = bool(ui.get('latestYear'))
if have_trade:
    Y = ui['latestYear']
    PY = ui['priorYear']
    total = next(r['totalUsd'] for r in ui['byYear'] if r['year'] == Y)
    prior_total = next(r['totalUsd'] for r in ui['byYear'] if r['year'] == PY)
    by_c = {c['country']: c for c in ui['byCountry']}
    top = ui['byCountry']
else:
    Y, PY, total, prior_total, by_c, top = 2025, 2024, 0, 0, {}, []


def imp(country):
    c = by_c.get(country)
    return c['importsUsd'] if c else 0


# ---------------------------------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------------------------------
NEW_SOURCES = [
    {
        'id': 'hts-ch21',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 21',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 21: Miscellaneous Edible Preparations',
        'signed': None,
        'published': '2026-10-07',
        'url': CH21_PDF,
    },
    {
        'id': 'hts-ch98-usmca',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 98, subchapter XXIII',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 98, subchapter XXIII: provisions established pursuant to the USMCA',
        'signed': None,
        'published': '2026-10-07',
        'url': CH98_PDF,
    },
    {
        'id': 'hts-ch17',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 17, additional U.S. notes 2–9',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 17: Sugars and Sugar Confectionery',
        'signed': None,
        'published': '2026-10-07',
        'url': CH17_PDF,
    },
    {
        'id': 'hts-ch04',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 4, additional U.S. notes 1, 10 and 14',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 4: Dairy Produce',
        'signed': None,
        'published': '2026-10-07',
        'url': CH04_PDF,
    },
]
REUSE_IDS = [
    'eo-14389',
    'csms-67834313',
    'scotus-24-1287',
    'procl-11012',
    'procl-11046',
    'procl-11047',
    'procl-11048',
    'procl-11062',
    'ustr-usmca-review',
    'eo-14194',
    'eo-14193',
    'eo-14325',
    'eo-14257',
    'eo-14360',
    'ustr-agoa-2026',
    'crs-agoa',
    'procl-11030',
    'cbp-gsp',
]


def add_sources(page, ids_or_objs):
    have = {s['id'] for s in page['sources']}
    for x in ids_or_objs:
        s = x if isinstance(x, dict) else REF_SOURCES[x]
        if s['id'] not in have:
            page['sources'].append(json.loads(json.dumps(s)))
            have.add(s['id'])


# ---------------------------------------------------------------------------------------------------
# Chapter + top-level
# ---------------------------------------------------------------------------------------------------
d['chapter']['title'] = 'Miscellaneous Edible Preparations'

# ---------------------------------------------------------------------------------------------------
# Labels for the six headings
# ---------------------------------------------------------------------------------------------------
GROUP_LABELS = {
    '2101': ('Coffee, tea & maté extracts and preparations; chicory', 'Coffee & tea extracts'),
    '2102': ('Yeasts, dead single-cell micro-organisms & baking powder', 'Yeasts'),
    '2103': ('Sauces, condiments, seasonings & mustard', 'Sauces & condiments'),
    '2104': ('Soups, broths & homogenized composite food (baby food)', 'Soups & baby food'),
    '2105': ('Ice cream & other edible ice', 'Ice cream'),
    '2106': ('Food preparations n.e.s.i. (supplements, syrups, mixes)', 'Food preparations n.e.s.i.'),
}

BLURBS = {
    '2101': (
        'Instant coffee and extracts of coffee and tea are Free. Coffee or tea preparations with sugar or dairy fall into quota lines: '
        '10% inside the quota, 30.5¢/kg + 8.5% above it. Other coffee preparations pay 8.5%, roasted chicory 2.1¢/kg.',
        ['instant coffee', 'coffee extract', 'cold brew concentrate', 'coffee mix', 'instant tea', 'tea extract', 'chicory', 'maté'],
    ),
    '2102': (
        "Active yeast and most inactive yeast pay 6.4%, other dead micro-organisms 3.2%. Crude dried brewers' yeast and prepared baking powder are Free.",
        ['yeast', "baker's yeast", 'nutritional yeast', "brewers' yeast", 'baking powder'],
    ),
    '2103': (
        'Soy sauce is 3%, ketchup 6%, other tomato sauces 11.6% and prepared mustard 2.8¢/kg; fish sauce and mustard flour are Free. '
        'Mayonnaise, salad dressings, pasta sauces and most seasonings are 6.4%. Seasonings with over 10% cane or beet sugar have a 689-tonne quota: '
        '7.5% inside it, 30.5¢/kg + 6.4% above it.',
        ['soy sauce', 'ketchup', 'pasta sauce', 'mustard', 'fish sauce', 'mayonnaise', 'salad dressing', 'hot sauce', 'seasoning', 'curry paste'],
    ),
    '2104': (
        'Soups and broths pay 3.2%. Homogenized composite food (baby food in containers of 250 g or less) pays 2.5% for infants and 6.4% for young children.',
        ['soup', 'broth', 'bouillon', 'stock cube', 'bone broth', 'baby food'],
    ),
    '2105': (
        'Ice cream is a dairy quota product: 20% for the 5.67 million liters a year allowed in the quota, 50.2¢/kg + 17% above it. '
        'Edible ice with no dairy limit — sorbet, ice pops — pays 17%.',
        ['ice cream', 'gelato', 'frozen yogurt', 'sorbet', 'ice pop', 'frozen dessert'],
    ),
    '2106': (
        'The catch-all heading: dietary supplements, protein concentrates, drink mixes, flavored syrups, non-dairy creamers, herbal tea blends and '
        'fortified juice concentrates. Most of it is 2106.90.99 at 6.4%. Lines with dairy or sugar have quotas with over-quota rates up to $1.996/kg, '
        'and fortified juice concentrates (2106.90.52, 2106.90.54) pay the rate of the same juice in heading 2009.',
        [
            'dietary supplement',
            'protein powder',
            'protein concentrate',
            'textured soy protein',
            'drink mix',
            'flavored syrup',
            'non-dairy creamer',
            'herbal tea blend',
            'flavored honey',
            'fortified juice concentrate',
        ],
    ),
}

ov = d['overview']
for g in ov['productGroups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['blurb'], g['searchExamples'] = BLURBS[g['heading']]

# ---------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------
ov['seo']['shortDescription'] = (
    'Searchable duty table for all 118 HTS Chapter 21 tariff lines — coffee and tea extracts, yeasts, soy sauce and other sauces, soups, '
    'ice cream, protein concentrates and dietary supplements (2106.90). General, FTA and Column 2 rates, quota lines and the 2026 extra duties by country.'
)
ov['seo']['keywords'] = [
    'HTS Chapter 21',
    'miscellaneous edible preparations tariff',
    'miscellaneous edible preparations import duty rates',
    'HTS 2106.90.99 duty rate',
    'dietary supplements import duty',
    'soy sauce import duty',
    'ice cream tariff-rate quota',
    'coffee extract import duty',
]

if have_trade:
    c1, c2 = top[0], top[1]
    ov['intro'] = (
        'Chapter 21 is the "everything else" chapter of the food schedule: coffee and tea extracts, yeasts, sauces and seasonings, soups, ice cream '
        'and — in heading 2106 — dietary supplements, protein concentrates, drink mixes and flavored syrups. Its **118 tariff lines** run from Free on '
        'instant coffee to $1.996/kg on over-quota butter substitutes, and most of the trade sits on one line: **2106.90.99 at 6.4%**.\n\n'
        f'The U.S. imported **{fmt_usd(total)}** of these goods in {Y}; {c1["country"]} ({fmt_usd(c1["importsUsd"])}) and {c2["country"]} '
        f'({fmt_usd(c2["importsUsd"])}) were the largest suppliers. On top of the base rate comes an **extra duty by country**: since July 24, 2026 a '
        'Section 301 tariff on 60 economies — 10% in total for the EU, +10% or +12.5% for most others, +20% (or +37.5% on soy sauce and protein '
        'concentrates) for China and +37.5% for Brazil. USMCA-qualifying goods from Canada and Mexico are exempt, and six coffee, tea, sugar-syrup and '
        'fortified orange juice lines are exempt for every country. Lines that contain sugar or dairy are also under **tariff-rate quotas**: a low rate '
        'inside the quota, a high per-kilogram rate above it.'
    )

ov['workedExamples'] = [
    {
        'title': 'Dietary supplements from Germany',
        'line': '2106.90.99',
        'body': 'The general rate is 6.4%. For EU goods whose base rate is under 10%, the 2026 Section 301 action charges 10% in total in place of the '
        'base rate (9903.05.39). A $100,000 shipment pays **$10,000** instead of $6,400. FDA rules still apply at entry: the importer needs a foreign '
        'supplier verification program (21 CFR 1.511 for supplements), and prior notice must be filed before arrival.',
    },
    {
        'title': 'Soy sauce from China',
        'line': '2103.10.00.00',
        'body': 'Soy sauce has a 3% base rate. China pays two Section 301 duties on it: +12.5% under the 2026 action (9903.05.31) and +25% because soy '
        'sauce is on List 3 (9903.88.03). That is **40.5%** in total: $20,250 on a $50,000 container. Soy sauce from Japan, by contrast, is Free under '
        'the U.S.–Japan Trade Agreement (JP), but the 12.5% Japan total (9903.05.49) still applies.',
    },
    {
        'title': 'Instant coffee from Brazil',
        'line': '2101.11.21',
        'body': 'Instant coffee is Free, and 2101.11.21 is on both exemption lists: the Brazil Section 301 list (U.S. note 50(a)(ii), 9903.05.03) and '
        "the general 2026 list (note 52(b), 9903.05.86). So Brazil's 37.5% does not apply and the total is **Free**. A coffee *preparation* with sugar "
        '(2101.12.58) from Brazil is different: 30.5¢/kg + 8.5% over quota, plus 37.5%.',
    },
]

if have_trade:
    snap = ov['tradeSnapshot']
    snap['effectiveDutyRateNote'] = 'Duty-collected figures aren’t available from an official source yet'
    snap['totalDutyCollectedUsd'] = None
    snap['source'] = f'UN Comtrade, United States imports, HS chapter 21 ({Y})'
    snap['coverageNote'] = 'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade.'

ov['notes']['chapterNotes'] = (
    '**Note 1.** This chapter does not cover: (a) mixed vegetables of heading 0712; (b) roasted coffee substitutes containing coffee in any proportion '
    '(heading 0901); (c) flavored tea (heading 0902); (d) spices or other products of headings 0904 to 0910; (e) food preparations, other than the '
    'products described in heading 2103 or 2104, containing more than 20 percent by weight of sausage, meat, meat offal, blood, insects, fish or '
    'crustaceans, molluscs or other aquatic invertebrates, or any combination thereof (chapter 16); (f) products of heading 2404; (g) yeast put up as a '
    'medicament or other products of heading 3003 or 3004; or (h) prepared enzymes of heading 3507.\n\n'
    '**Note 2.** Extracts of the substitutes referred to in note 1(b) above are to be classified in heading 2101.\n\n'
    '**Note 3.** For the purposes of heading 2104, the expression "homogenized composite food preparations" means preparations consisting of a finely '
    'homogenized mixture of two or more basic ingredients such as meat, fish, vegetables, fruit or nuts, put up for retail sale as food suitable for '
    'infants or young children or for dietetic purposes, in containers of a net weight content not exceeding 250 g.'
)
ov['notes']['additionalUsNotes'] = (
    '**Note 1.** Subheadings 2106.90.48, 2106.90.52 and 2106.90.54 cover vitamin or mineral fortified fruit or vegetable juices imported only in '
    'concentrated form; non-concentrated fortified juices go to 2202.99.30–2202.99.37.\n\n'
    '**Note 2.** For those subheadings, "liter" means liter of reconstituted fruit juice (the concentrate mixed with water back to the average Brix of '
    'the natural juice), and a mixture of juices is treated as wholly the component juice with the lowest Brix value when working out its '
    'concentration.\n\n'
    '**Note 3.** "Mixed condiments and mixed seasonings described in additional U.S. note 3" means articles with over 10% by dry weight of cane or beet '
    'sugar, with exceptions for retail-packed non-crystalline articles, cake decorations and similar products, coconut preparations and sauces.\n\n'
    '**Note 4.** Quota for those mixed condiments and seasonings under 2103.90.74: 689 metric tons from October 1 to September 30 (Mexico excluded).\n\n'
    '**Note 5.** Quota for ice cream under 2105.00.10: 5,667,846 liters a calendar year (Mexico excluded), with minimum access for Belgium, Denmark, '
    'Jamaica, the Netherlands and New Zealand.\n\n'
    '**Other quotas that reach this chapter** are set in the notes to Chapter 4 (dairy: notes 1, 10 and 14) and Chapter 17 (sugar: notes 2–9). '
    'Note 7 (articles over 65% sugar) and note 9 (blended syrups) set the quota at **none**, so those goods always pay the over-quota rate unless an '
    'FTA gives its own quota.'
)

# ---------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['seo'] = {
    'title': 'HTS Chapter 21 Miscellaneous Edible Preparations Tariff Updates — What Changed Since January 2025 | KoalaGains',
    'shortDescription': 'What changed for HTS Chapter 21 (coffee extracts, sauces, soups, ice cream, food supplements) since January 2025: base rates '
    'on all 118 lines, the end of the IEEPA and Section 122 duties, and the 2026 Section 301 tariffs, with Federal Register citations.',
    'keywords': [
        'HTS Chapter 21 tariff updates',
        'miscellaneous edible preparations tariff updates',
        'china tariff on miscellaneous edible preparations',
        'section 301 tariff food supplements',
        'singapore tariff food preparations',
        'usmca chapter 21 tariff',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 '
    'Revision 21** (in force October 9, 2026). No Chapter 21 base rate changed: 112 of the 118 lines are the same, and the other 6 are new statistical '
    'splits (organic soups, and frozen, sugar-containing and organic food preparations under 2106.90.99) that carry their parent line\'s rate.\n\n'
    'Everything that changed came on top of the base rate, as extra duties set by country. The 2025 IEEPA duties (Canada +35%, Mexico +25%, the '
    'reciprocal tariff on everyone else) **ended on February 24, 2026**, and the 10% Section 122 surcharge that replaced them expired on July 23, 2026. '
    'Since **July 24, 2026**, goods from 60 economies pay a **Section 301 tariff of 10% or 12.5%**. Six Chapter 21 subheadings are on its general '
    'exemption list — instant coffee, coffee and tea extracts, coffee preparations without sugar or dairy, in-quota sugar syrups and fortified orange '
    'juice. China pays more because older Section 301 duties stack on top (7.5%, or 25% on soy sauce, other sauces and protein concentrates), and '
    'Brazil adds a separate 25%. **USMCA-qualifying goods from Canada and Mexico are still exempt.**'
)
tu['scope'] = (
    'Measures that reach Chapter 21 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 tariff, the older China '
    'Section 301 lists, the 2025–2026 IEEPA and Section 122 duties that have ended, and the Canada Section 338 actions (which list no Chapter 21 line). '
    'For the rate each supplier pays, see Rates by country.'
)

EXEMPT_52B = (
    'Six Chapter 21 subheadings are exempt for every country (U.S. note 52(b), 9903.05.86): 2101.11.21, 2101.11.29 and 2101.12.90 (instant coffee, '
    'coffee extracts and coffee preparations outside the sugar and dairy quotas), 2101.20.20 (tea extracts), 2106.90.44 (in-quota sugar syrups) and '
    '2106.90.48 (fortified orange juice). Acai preparations for making beverages (2106.90.99) are exempt by description (note 52(c), 9903.05.87).'
)

IN_EFFECT_TEXT = {
    'Canada': (
        'USMCA-qualifying goods entered under USMCA pay no Section 301 duty (9903.05.93). ' + EXEMPT_52B + ' The 2025 IEEPA duty on Canada (+35%, '
        '9903.01.10) ended February 24, 2026. The 2026 Section 338 duties on Canadian alcoholic beverages, dairy and motor vehicles (9903.03.12–9903.03.14) '
        'list no Chapter 21 line, so the September 29, 2026 dairy import ban does not reach this chapter either.',
        'A USMCA-qualifying sauce, soup or supplement from Canada pays $0 extra; one that does not qualify pays the base rate plus 10% of value. On the '
        "sugar and dairy quota lines, USMCA goods of Canada are Free only inside Canada's own USMCA quotas (Chapter 98, 9823) and pay the over-quota "
        'rate above them.',
    ),
    'Mexico': (
        'USMCA-qualifying goods entered under USMCA pay no Section 301 duty (9903.05.94). ' + EXEMPT_52B + ' The 2025 IEEPA duty on Mexico (+25%, '
        '9903.01.01) ended February 24, 2026.',
        'USMCA-qualifying goods of Mexico pay nothing — even on the sugar and dairy quota lines, which are Free for Mexico with no quantity limit '
        '(9823.xx.01). Goods that do not qualify pay the base rate plus 10% of value.',
    ),
    'China': (
        'Two Section 301 duties stack: +12.5% under the 2026 action (9903.05.31, from July 24, 2026) and an older one — +25% under List 3 (9903.88.03) '
        'for soy sauce (2103.10.00), other sauces and seasonings (2103.90.80) and protein concentrates (2106.10.00), or +7.5% under List 4A '
        '(9903.88.15, 7.5% since February 14, 2020) for almost every other line. The six note 52(b) lines skip the 12.5% but still pay List 4A. '
        'Fortified juice concentrates (2106.90.52, 2106.90.54) skip List 4A when their rate is borrowed from a 2009 juice line on List 1–3 (U.S. note '
        '20(dd)–(gg)). No China exclusion in effect (note 20(vvv)–(www)) names a Chapter 21 product. The IEEPA duties on China ended February 24, 2026.',
        'A 6.4% supplement from China pays 26.4%, soy sauce 40.5% (3% + 12.5% + 25%) and instant coffee 7.5%.',
    ),
    'European Union': (
        'For EU goods whose base rate (or its ad valorem equivalent) is under 10%, the total is 10% (9903.05.39); at or above 10%, nothing is added '
        '(9903.05.38, U.S. note 52(k)). ' + EXEMPT_52B + ' This replaced the 15% IEEPA reciprocal rate (9903.02.20), which ended February 24, 2026.',
        'Most EU sauces, soups and supplements (3%–6.4% base) pay 10% in total — $10,000 on a $100,000 shipment. Over-quota sugar and dairy lines '
        'whose per-kilogram rate already works out above 10% pay only that rate.',
    ),
    'Japan': (
        'For Japanese goods whose rate (or its ad valorem equivalent) is under 12.5%, the total is 12.5% (9903.05.49); at or above, nothing is added '
        '(U.S. note 52(k)). ' + EXEMPT_52B + ' Soy sauce and yeast-extract preparations are Free under the U.S.–Japan Trade Agreement (JP), but the '
        '12.5% total still applies.',
        'Soy sauce, sauces and supplements from Japan pay 12.5% of value in total.',
    ),
    'India': (
        'Base rate + 10% (9903.05.44). ' + EXEMPT_52B + ' The IEEPA reciprocal duty on India ended February 24, 2026.',
        'A 6.4% food preparation from India pays 16.4%.',
    ),
    'Vietnam': (
        'Base rate + 12.5% (9903.05.84). ' + EXEMPT_52B + ' The IEEPA reciprocal duty on Vietnam ended February 24, 2026.',
        'A 6.4% food preparation from Vietnam pays 18.9%; instant coffee stays Free.',
    ),
    'Brazil': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 (9903.05.27). The Brazil '
        'exemption list (U.S. note 50(a)(ii), 9903.05.03) covers 2101.11.21, 2101.11.29, 2101.12.90, 2101.20.20 and 2106.90.48, and acai '
        'preparations for beverages are exempt by description (9903.05.04); 2106.90.44 is exempt only from the 12.5% (note 52(b)).',
        'Instant coffee from Brazil stays Free; a 6.4% food preparation pays 43.9%.',
    ),
    'United Kingdom': (
        'Base rate + 10% (9903.05.81). ' + EXEMPT_52B + ' The UK exception list (9903.05.96) has no Chapter 21 line.',
        'A 6.4% sauce or supplement from the UK pays 16.4%.',
    ),
    'Thailand': (
        'Base rate + 12.5% (9903.05.77). ' + EXEMPT_52B + ' The IEEPA reciprocal duty on Thailand ended February 24, 2026.',
        'A 6.4% food preparation or sauce from Thailand pays 18.9%; instant coffee stays Free.',
    ),
    'South Korea': (
        'For Korean goods whose rate (or its ad valorem equivalent) is under 12.5%, the total is 12.5% (9903.05.71); at or above, nothing is added '
        '(U.S. note 52(k)). A KORUS claim (KR) sets the rate that is compared. ' + EXEMPT_52B + ' The IEEPA reciprocal duty ended February 24, 2026.',
        'Most Korean sauces, noodle seasonings and food preparations pay 12.5% of value in total, whether or not KORUS makes the base rate Free.',
    ),
    'Colombia': (
        'Base rate + 12.5% (9903.05.32). ' + EXEMPT_52B + ' The U.S.–Colombia TPA (CO) removes the base rate on most lines but not the Section 301 '
        'duty (U.S. note 52(a)). The IEEPA reciprocal duty ended February 24, 2026.',
        'Colombian instant coffee and coffee extracts (most of the trade) stay Free; a TPA food preparation pays 12.5%.',
    ),
    'Singapore': (
        'Base rate + 12.5% (9903.05.68). ' + EXEMPT_52B + ' The U.S.–Singapore FTA (SG) removes the base rate but not the Section 301 duty (U.S. note '
        '52(a)). The IEEPA reciprocal duty ended February 24, 2026.',
        'A Singapore food preparation entered under the FTA pays 12.5% of value; without the FTA claim, 6.4% + 12.5% = 18.9%.',
    ),
}
OTHER_TEXT = (
    'Rates by country: Japan and Switzerland pay 12.5% in total and Taiwan 10% in total when the base rate is lower (9903.05.49, 9903.05.74, '
    '9903.05.76); Vietnam, Australia, New Zealand and the Philippines +12.5%; India, the UK, Malaysia, Indonesia and Bangladesh +10%. ' + EXEMPT_52B + ' Country exception lists in U.S. note 52(j) also exempt roasted chicory (2101.30.00) and/or other dead '
    'micro-organisms (2102.20.60) for Switzerland, Malaysia, Cambodia, Guatemala, Argentina, Bangladesh, Taiwan, Indonesia, Ecuador and Jordan. '
    'Countries outside the 60 economies pay no extra duty.',
    'A 6.4% food preparation from Vietnam pays 18.9%, from India 16.4%, from Japan 12.5%; from a country outside the 60 (for example Mauritius) only the base rate.',
)
for e in tu['inEffect']:
    key = e['country']
    if key in IN_EFFECT_TEXT:
        e['exemption'], e['whatItMeans'] = IN_EFFECT_TEXT[key]
    elif key.startswith('Other'):
        e['country'] = 'Other Section 301 economies (incl. Japan, Switzerland, Taiwan, India, Vietnam, the UK, Australia, New Zealand, Malaysia, Indonesia)'
        e['exemption'], e['whatItMeans'] = OTHER_TEXT
    if e['country'] == 'European Union':
        e['measure'] = 'Section 301 tariff (forced-labor investigations), EU rate'
    elif 'Section 301 (2026, 60 economies)' == e['measure']:
        e['measure'] = 'Section 301 tariff (forced-labor investigations)'
    elif e['country'] == 'China':
        e['measure'] = 'Section 301 tariffs: 2026 action plus List 3 or List 4A'
    elif e['country'] == 'Brazil':
        e['measure'] = 'Section 301 tariffs: Brazil action plus 2026 forced-labor action'

CHANGE_DETAIL = {
    'section-301-2026-60-economies-2026-07-24': (
        'Section 301 tariffs on 60 economies cover Chapter 21',
        '10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). Six Chapter 21 subheadings are on the general exemption list in U.S. '
        'note 52(b) — 2101.11.21, 2101.11.29, 2101.12.90, 2101.20.20, 2106.90.44 and 2106.90.48 — and acai preparations by description (note 52(c)). '
        'EU goods pay 10% in total; Japan, South Korea and Switzerland 12.5% in total. USMCA-qualifying goods from Canada and Mexico are exempt '
        '(9903.05.93, 9903.05.94).',
    ),
    'section-301-brazil-2026-07-22': (
        'Section 301 tariff on products of Brazil',
        '25% on all goods of Brazil (9903.05.01). The exemption list (U.S. note 50(a)(ii)) covers five Chapter 21 subheadings — instant coffee, coffee '
        'extracts and preparations (2101.11.21, 2101.11.29, 2101.12.90), tea extracts (2101.20.20) and fortified orange juice (2106.90.48) — and acai '
        'preparations for beverages by description (note 50(a)(iii)). From July 24 the 12.5% forced-labor tariff (9903.05.27) is added on top.',
    ),
    'section-301-nicaragua-scheduled-2027-01-01': (
        'Scheduled: Section 301 tariff on products of Nicaragua',
        'Products of Nicaragua that pay the column 1-general rate (that is, not entered under CAFTA-DR) will pay +10% (9903.89.01) from January 1, '
        '2027 and +15% from January 1, 2028. CAFTA-DR originating goods are not covered (U.S. note 29). Today Nicaragua pays the 12.5% 2026 Section '
        '301 duty (9903.05.58).',
    ),
}
for c in tu['changes']:
    if c['id'] in CHANGE_DETAIL:
        c['title'], c['detail'] = CHANGE_DETAIL[c['id']]
    if c['id'] == 'base-rates':
        c['title'] = 'No Chapter 21 base-rate changes'
        c['detail'] = (
            'All 118 Chapter 21 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition. Six '
            'statistical lines are new — 2104.10.00.55/.65 (organic and other soups) and 2106.90.99.91–.94 (frozen, sugar-containing, organic and other '
            'food preparations) — and take their 8-digit parent\'s rate (3.2% and 6.4%).'
        )

EXTRA_CHANGES = [
    {
        'id': 'ca-dairy-ban',
        'type': 'reference',
        'date': '2026-09-29',
        'dateLabel': 'Effective',
        'title': 'Canada dairy import ban does not reach Chapter 21',
        'detail': 'From September 29, 2026 certain Canadian dairy products moved from the 50% Section 338 duty to an import ban. The ban covers only '
        'products already on the dairy duty list (U.S. note 51(b)(2), 9903.03.13), and that list has no Chapter 21 line — Canadian ice cream, dairy '
        'preparations and butter substitutes are not on it.',
        'before': None,
        'now': None,
        'countries': 'Canada',
        'sourceIds': ['procl-11062', 'hts-now'],
    },
    {
        'id': 'ca-338',
        'type': 'reference',
        'date': '2026-08-22',
        'dateLabel': 'Effective',
        'title': 'Canada Section 338 duties take effect; Chapter 21 not covered',
        'detail': '50% duties on certain Canadian alcoholic beverages, dairy and motor vehicles (9903.03.12–9903.03.14) took effect after a 3-day '
        'suspension lapsed. No Chapter 21 line is on the lists in U.S. note 51.',
        'before': None,
        'now': None,
        'countries': 'Canada',
        'sourceIds': ['procl-11046', 'procl-11047', 'procl-11048', 'hts-now'],
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
        'id': 'usmca-review',
        'type': 'reference',
        'date': '2026-07-01',
        'dateLabel': 'Announced',
        'title': 'USMCA joint review: not renewed, still in force',
        'detail': 'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending '
        'resolution of the issues or until termination, so USMCA claims (SPI S, S+) and the Canada and Mexico quota provisions in Chapter 98 '
        'subchapter XXIII still apply.',
        'before': None,
        'now': None,
        'countries': 'Canada, Mexico',
        'sourceIds': ['ustr-usmca-review'],
    },
    {
        'id': 's122-start',
        'type': 'extraDuty',
        'date': '2026-02-24',
        'dateLabel': 'Effective',
        'title': 'Section 122 surcharge replaces the IEEPA tariffs',
        'detail': '10% on products of all countries (9903.03.01) until July 23, 2026. Four Chapter 21 subheadings were on the product exemption list '
        '(9903.03.03): 2101.11.29, 2101.12.90, 2101.20.20 and 2106.90.48 (coffee extracts and preparations, tea extracts, fortified orange juice), '
        'plus acai preparations by description (9903.03.04). USMCA-qualifying goods from Canada and Mexico were exempt (9903.03.07, 9903.03.08).',
        'before': 'None',
        'now': '+10% (until July 23, 2026)',
        'countries': 'All',
        'sourceIds': ['procl-11012', 'hts-now'],
    },
    {
        'id': 'ieepa-end',
        'type': 'extraDuty',
        'date': '2026-02-24',
        'dateLabel': 'Effective',
        'title': 'All IEEPA tariffs end',
        'detail': 'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, '
        'Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 a.m. '
        'ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.',
        'before': 'Varied by country',
        'now': 'None',
        'countries': 'All',
        'sourceIds': ['scotus-24-1287', 'eo-14389', 'csms-67834313'],
    },
    {
        'id': 'agoa-renewed',
        'type': 'reference',
        'date': '2026-02-03',
        'dateLabel': 'Signed',
        'title': 'AGOA reauthorized through December 31, 2026',
        'detail': 'The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025. AGOA (SPI D) makes '
        'most dutiable Chapter 21 lines Free for listed sub-Saharan countries; the sugar and dairy over-quota lines do not list D. GSP (SPI A, A*, A+) '
        'remains expired since December 31, 2020.',
        'before': 'Lapsed (from September 30, 2025)',
        'now': 'In force to December 31, 2026',
        'countries': 'AGOA beneficiary countries',
        'sourceIds': ['ustr-agoa-2026', 'crs-agoa', 'procl-11030', 'cbp-gsp', 'hts-now'],
    },
    {
        'id': 'ag-exemption',
        'type': 'reference',
        'date': '2025-11-13',
        'dateLabel': 'Effective',
        'title': 'Agricultural exemption covered coffee and tea extracts',
        'detail': 'Executive Order 14360 widened the reciprocal-tariff exemption list (U.S. note 2(v)(iii)) to more farm products. In Chapter 21 it '
        'covered 2101.11.29, 2101.12.90, 2101.20.20 and 2106.90.48, plus acai preparations by description; every other Chapter 21 line kept paying '
        'the reciprocal duty until it ended on February 24, 2026.',
        'before': None,
        'now': None,
        'countries': 'All countries subject to the reciprocal tariff',
        'sourceIds': ['eo-14360', 'hts-now'],
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
        'id': 'reciprocal',
        'type': 'extraDuty',
        'date': '2025-04-02',
        'dateLabel': 'Signed',
        'title': 'Reciprocal tariff on products of all countries',
        'detail': '10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. Ended February 24, 2026.',
        'before': 'None',
        'now': '+10% or more (ended)',
        'countries': 'All except Canada, Mexico',
        'sourceIds': ['eo-14257'],
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
]
have_ids = {c['id'] for c in tu['changes']}
tu['changes'] += [c for c in EXTRA_CHANGES if c['id'] not in have_ids]
tu['changes'].sort(key=lambda c: c['date'], reverse=True)
add_sources(tu, REUSE_IDS)

stats = [s for s in tu['stats'] if s['label'] != 'IEEPA duties']
stats.append({'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'})
tu['stats'] = stats

# ---------------------------------------------------------------------------------------------------
# Industry areas (matrix)
# ---------------------------------------------------------------------------------------------------
ia = d['industryAreas']
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]

# USMCA over-quota rates from Chapter 98 subchapter XXIII (HTS JSON), keyed by 8-digit subheading.
hts = json.load(open(HTS_FILE))
USMCA_OVER = {}
for r in hts:
    h = r.get('htsno') or ''
    if h.startswith('9823.'):
        m = re.match(r'Goods provided (?:for )?in subheading (\d{4}\.\d{2}\.\d{2})', r.get('description') or '')
        if m:
            USMCA_OVER[m.group(1)] = (h, (r.get('special') or '').replace('(S+)', '').strip())
# Canada's in-quota heading and 2026 quantity per subchapter XXIII note (2026 = "Year 7"; note 10 is flat).
CA_QUOTA = {
    '9823.01': ('9823.01.02', '10,605,000-liter', 'note 1'),
    '9823.03': ('9823.03.02', '4,545-tonne', 'note 3'),
    '9823.08': ('9823.08.02', '1,919-tonne', 'note 8'),
    '9823.10': ('9823.10.02', '9,600-tonne', 'note 10'),
}

JUICE_BASE = 'The rate applicable to the natural juice in heading 2009'


def juice_extra(country, rule):
    name = country['country']
    if name == 'China':
        return (
            '+12.5% (9903.05.31) + 7.5% (9903.88.15); +25% (9903.88.03) instead of the 7.5% when the matching 2009 juice is on List 3',
            'Heading 2009 juice rate + 20% or + 37.5%',
        )
    if name == 'Brazil':
        return '+25% (9903.05.01) + 12.5% (9903.05.27)', 'Heading 2009 juice rate + 37.5%'
    if rule.get('atLeast'):
        return '0% to +12.5% by country, Section 301 (9903.05.20–9903.05.84)', 'Heading 2009 juice rate + 0–12.5%'
    if rule['kind'] == 'eu15':
        x = f"{rule['extraPct']:g}"
        return (
            f"{x}% in place of the juice rate when that rate is lower ({rule['ch99Code']})",
            f'Heading 2009 juice rate, or {x}% if that rate is lower',
        )
    x = f"{rule['extraPct']:g}"
    return f"+{x}% ({rule['ch99Code']})", f'Heading 2009 juice rate + {x}%'


def fix_row(country, rule, side, b):
    """Rewrite one breakdown row the engine could not price (quota S+ text, natural-juice rate)."""
    name = country['country']
    if b['base'] == JUICE_BASE or JUICE_BASE in b['total'] or 'natural juice' in b['total']:
        if 'TODO' not in b['total'] and 'TODO' not in b['extra']:
            return
        b['base'] = 'Rate of the same juice in heading 2009'
        b['extra'], b['total'] = juice_extra(country, rule)
        b['preference'] = 'None'
        return
    if '(quota)' in b['total'] or 'TODO' in b['total']:
        subs = sorted({ln[:10] for ln in b['lines']})
        over = [USMCA_OVER[s] for s in subs if s in USMCA_OVER]
        if not over:
            raise SystemExit(f'no 9823 rate for {name} {subs} {b}')
        prefix = over[0][0][:7]
        rates = sorted({o[1] for o in over})
        codes = [o[0] for o in over]
        code_txt = codes[0] if len(codes) == 1 else f'{codes[0]}–{codes[-1]}'
        b['extra'] = 'None (USMCA)'
        if name == 'Mexico':
            b['preference'] = (
                f'USMCA: Free for goods of Mexico with no quantity limit ({prefix}.01, HTSUS Ch. 98 subch. XXIII); Section 301 does not apply (9903.05.94)'
            )
            b['total'] = f'Free under USMCA ({prefix}.01, no quota)'
        elif name == 'Canada':
            inq, qty, note = CA_QUOTA[prefix]
            rate_txt = ' / '.join(rates)
            b['preference'] = (
                f"USMCA: Free inside Canada's {qty} quota for 2026 ({inq}, subch. XXIII {note}); above it {rate_txt} ({code_txt}). "
                'Section 301 does not apply (9903.05.93)'
            )
            b['total'] = f'Free in quota; over quota {rate_txt}'
        else:
            raise SystemExit(f'unexpected quota row for {name}')


def rebuild_totals(cell_side):
    counts = OrderedDict()
    for b in cell_side['breakdown']:
        counts[b['total']] = counts.get(b['total'], 0) + b['lineCount']
    cell_side['totals'] = [t for t, _ in sorted(counts.items(), key=lambda kv: -kv[1])]


for c in ia['countries']:
    for h, cell in c['cells'].items():
        for side in ('withUsmca', 'withoutUsmca'):
            for b in cell[side]['breakdown']:
                fix_row(c, c['rule'], side, b)
            rebuild_totals(cell[side])

for lane in ia['biggestLanes']:
    c = next(x for x in ia['countries'] if x['country'] == lane['country'])
    side = 'withUsmca' if c['rule']['kind'] == 'usmca' else 'withoutUsmca'
    lane['totals'] = c['cells'][lane['heading']][side]['totals']

EU_NAMES = {'Germany', 'Netherlands', 'France', 'Italy', 'Ireland', 'Belgium', 'Spain', 'Denmark', 'Austria', 'Poland', 'Sweden', 'Portugal', 'Greece'}
NOTE52B_SHORT = 'The six note 52(b) subheadings (instant coffee, coffee and tea extracts, in-quota sugar syrups, fortified orange juice) are exempt.'
RULE_LABELS = {
    'Canada': 'USMCA-qualifying: no extra duty (9903.05.93); on the sugar and dairy quota lines Free only inside Canada\'s USMCA quotas '
    '(9823), the over-quota rate above them. Otherwise base rate + 10% Section 301 (9903.05.29). ' + NOTE52B_SHORT + ' The 35% IEEPA duty ended February 24, 2026.',
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94), and the sugar and dairy quota lines are Free with no quantity limit (9823.xx.01). '
    'Otherwise base rate + 10% Section 301 (9903.05.55). ' + NOTE52B_SHORT + ' The 25% IEEPA duty ended February 24, 2026.',
    'China': 'Base rate + 12.5% Section 301 (9903.05.31) + 7.5% List 4A (9903.88.15) on most lines, or + 25% List 3 (9903.88.03) on soy sauce, '
    '2103.90.80 sauces and seasonings and protein concentrates (2106.10.00). The note 52(b) subheadings pay only the 7.5%.',
    'Japan': 'Japan: 12.5% in total when the base rate (or its ad valorem equivalent) is lower (9903.05.49); U.S.–Japan Trade Agreement (JP) '
    'rates applied where the line has one (soy sauce, yeast-extract preparations, some seasonings and ice cream). ' + NOTE52B_SHORT,
    'South Korea': 'South Korea: 12.5% in total when the rate (or its ad valorem equivalent) is lower (9903.05.71); KORUS (KR) rates applied where '
    'the line has one. ' + NOTE52B_SHORT,
    'Colombia': 'Base rate + 12.5% Section 301 (9903.05.32); U.S.–Colombia TPA (CO) rates applied where the line has one, but the Section 301 duty '
    'still applies (U.S. note 52(a)). ' + NOTE52B_SHORT,
    'Thailand': 'Base rate + 12.5% Section 301 (9903.05.77). ' + NOTE52B_SHORT,
    'Brazil': 'Base rate + 25% (9903.05.01) + 12.5% (9903.05.27) = +37.5%. The Brazil exemption list (U.S. note 50(a)(ii)) covers instant coffee, '
    'coffee and tea extracts and fortified orange juice; 2106.90.44 skips only the 12.5%.',
}


def rule_label(c):
    r = c['rule']
    name = c['country']
    if name in RULE_LABELS:
        return RULE_LABELS[name]
    if r.get('atLeast'):
        return (
            'Countries outside the 60 Section 301 economies pay only the base rate. The 60 pay +10% or +12.5% (9903.05.20–9903.05.84), or 10%–12.5% in '
            'total for the EU, Japan, South Korea, Switzerland and Taiwan; Brazil pays +37.5%. Chicory (2101.30.00) and other dead micro-organisms '
            '(2102.20.60) are exempt for some countries (U.S. note 52(j)).'
        )
    if r['kind'] == 'eu15':
        return (
            f"EU: 10% in total in place of the base rate when the base rate (or its ad valorem equivalent) is under 10% (9903.05.39); nothing added at "
            f'or above 10%. ' + NOTE52B_SHORT
        )
    x = f"{r['extraPct']:g}"
    extra = ''
    if name == 'Singapore':
        extra = ' The U.S.–Singapore FTA (SG) removes the base rate where the line lists SG; the Section 301 duty still applies (U.S. note 52(a)).'
    return f"Base rate + {x}% Section 301 ({r['ch99Code']}). " + NOTE52B_SHORT + extra


for c in ia['countries']:
    c['rule']['label'] = rule_label(c)
    if c['country'] == 'Any other country':
        c['rule']['ch99Code'] = '9903.05.20–9903.05.84'
    ids = c['rule']['sourceIds']
    if c['country'] in ('Canada', 'Mexico'):
        for sid in ('hts-ch98-usmca', 'eo-14389'):
            if sid not in ids:
                ids.insert(-1, sid)

add_sources(ia, [s for s in NEW_SOURCES if s['id'] == 'hts-ch98-usmca'] + ['eo-14389'])

ia['seo'] = {
    'title': 'HTS Chapter 21 Tariff Rates by Country — Food Preparations, Supplements & Sauces from Canada, Mexico, China, EU | KoalaGains',
    'shortDescription': 'The total U.S. tariff on Chapter 21 goods — supplements, sauces, soups, coffee extracts, ice cream — by country and product '
    'group: base rate plus the 2026 Section 301 duty, with USMCA, EU and quota rules applied.',
    'keywords': [
        'miscellaneous edible preparations tariff by country',
        'HTS Chapter 21 tariff rates by country',
        'dietary supplements tariff china',
        'european union tariff on miscellaneous edible preparations',
        'usmca chapter 21 tariff',
        'heading 2106 tariff',
        'ice cream tariff-rate quotas',
    ],
}
ia['intro'] = (
    'The total rate on Chapter 21 goods depends as much on **where they come from** as on what they are. Each cell below is the base rate for that '
    'product group plus the extra duty for that country, minus any preference — taken from the current tariff schedule.\n\n'
    'Since the IEEPA duties ended on February 24, 2026, the extra duty is the **Section 301 tariff on 60 economies** that started July 24, 2026. '
    '**USMCA-qualifying goods from Canada and Mexico pay no extra duty**, **EU goods pay 10%** in place of a lower base rate, most other large '
    'suppliers add 10% or 12.5%, and **China adds 20% — 37.5% on soy sauce, other sauces and protein concentrates**. Instant coffee, coffee and tea '
    'extracts and fortified orange juice are exempt for everyone. On the sugar and dairy quota lines, the cell shows the over-quota rate.'
)
assumptions = [a for a in ia['assumptions'] if 'TODO' not in a]
assumptions += [
    'Quota lines: where a product has an in-quota and an over-quota line, both are in the group; the over-quota rates (for example 30.5¢/kg + 8.5% '
    'or 50.2¢/kg + 17%) apply once the quota is filled, and several quotas are set at zero (Chapter 17 additional U.S. notes 7 and 9).',
    'USMCA quota lines (Canada and Mexico, "USMCA-qualifying" side): goods of Mexico are Free with no limit (9823.xx.01); goods of Canada are Free '
    'inside Canada\'s 2026 USMCA quotas and pay the over-quota rate printed in Chapter 98 subchapter XXIII above them. These cells are text, not '
    'calculator totals.',
    'Fortified juice concentrates (2106.90.52, 2106.90.54) have no printed rate: they pay the rate of the same juice in heading 2009, so their cells '
    'show "Heading 2009 juice rate" plus the country\'s extra duty.',
    'EU and Japan: the 10% (EU) or 12.5% (Japan) total applies when the base rate, or its ad valorem equivalent, is lower. Per-kilogram base rates '
    'are compared at the $10,000 / 1,000 kg test shipment ($10 per kg), so a cheaper product can end up paying only its per-kilogram rate.',
    'Price-based special safeguard duties (Chapter 99 subchapter IV) can add a per-kilogram charge to low-priced over-quota sugar and dairy goods; '
    'they do not apply to Canada, Mexico, Singapore, South Korea, Australia and other FTA partners listed there, and are not applied in the matrix.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied.',
]
ia['assumptions'] = assumptions
ia['exemptionCheck'] = (
    'Read U.S. notes 20, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 general exemption list (note 52(b), '
    '9903.05.86) has six Chapter 21 subheadings: 2101.11.21, 2101.11.29, 2101.12.90, 2101.20.20, 2106.90.44 and 2106.90.48; note 52(c) adds acai '
    'preparations for beverages (2106.90.99) by description. The Brazil list (note 50(a)(ii)) has the same subheadings except 2106.90.44. The '
    'country lists in note 52(j) exempt 2101.30.00 and/or 2102.20.60 for Switzerland, Malaysia, Cambodia, Guatemala, Argentina, Bangladesh, Taiwan, '
    'Indonesia, Ecuador and Jordan. No Chapter 21 line is on the Canada Section 338 lists (note 51). On the China side, List 3 (note 20(f)) covers '
    '2103.10.00, 2103.90.80 and 2106.10.00, List 4A (note 20(s)(i)) the other Chapter 21 subheadings, and no China product exclusion still in force '
    '(note 20(vvv)–(www)) names a Chapter 21 product.'
)

# ---------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['seo'] = {
    'title': 'Importing Food Preparations, Supplements & Sauces: FDA Rules, Quotas & Legal Ways to Lower Duty (HTS Ch. 21) | KoalaGains',
    'shortDescription': 'The FDA, USDA and TTB rules for each HTS Chapter 21 line — FSVP, prior notice, dietary supplement cGMP, labeling, quota '
    'licenses — and the legal ways to pay less: USMCA, other FTAs, quota entries, General Note 15, drawback and binding rulings.',
    'keywords': [
        'chapter 21 tariff engineering',
        'dietary supplements import duty',
        'FSVP dietary supplements',
        'import dietary supplements FDA requirements',
        'usmca chapter 21 rules of origin',
        'sugar tariff-rate quota food preparations',
        'fortified juice concentrate tariff',
    ],
}
te['intro'] = (
    'Chapter 21 goods are food, so **FDA decides whether a shipment can be sold**: the foreign plant must be registered, prior notice must be filed '
    'before arrival, and the U.S. importer needs a foreign supplier verification program. Dietary supplements add their own manufacturing, labeling '
    'and new-ingredient rules; soups and sauces with meat can fall under USDA FSIS; compound alcoholic preparations can owe federal excise tax.\n\n'
    'The ways to pay less are written into the schedule: claim **USMCA** or another **FTA**, enter quota goods **inside the quota** (or under a '
    '**General Note 15** exclusion), and recover duty through **drawback** when the goods are exported. Each lever depends on a document, listed '
    'below with its regulation.'
)
te['regulationsAsOf'] = '2026-10-08'
te['levers'] = [
    {
        'id': 'usmca',
        'title': 'Claim USMCA on goods from Canada or Mexico',
        'saves': 'The Section 301 duty — 10% of value — plus the base rate; on the sugar and dairy quota lines, Free for Mexico and Free inside '
        "Canada's USMCA quotas",
        'appliesTo': 'All 118 lines, for goods that meet the Chapter 21 rules of origin in General Note 11',
        'document': 'A certification of origin from the importer, exporter or producer. It need not follow a prescribed format; it can be on the '
        'invoice or another document, and CBP can ask for it.',
        'caveat': 'The rules of origin bite on ingredients: instant coffee qualifies only if non-originating coffee is no more than 60% of its weight; '
        'dairy preparations may not use non-originating Chapter 4 dairy; fortified juice concentrates may not be made from heading 2009 juice. Canadian '
        'goods on the sugar and dairy quota lines are Free only inside Canada\'s quota (and sugar-containing products may need a Canadian export '
        'certificate when USTR requires one). The USMCA was not renewed at the July 1, 2026 joint review but remains in force.',
        'citations': [
            {'label': '19 CFR 182.12', 'url': 'https://www.ecfr.gov/current/title-19/section-182.12'},
            {'label': 'HTSUS General Note 11 (USMCA rules of origin, Chapter 21)', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 98, subch. XXIII (USMCA quotas, 9823)', 'url': CH98_PDF},
            {'label': 'HTSUS 9903.05.93 / 9903.05.94', 'url': HTS_NOW_URL},
            {
                'label': 'USTR statement on the USMCA joint review (July 1, 2026)',
                'url': 'https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review',
            },
            {'label': 'CBP: USMCA', 'url': 'https://www.cbp.gov/trade/priority-issues/trade-agreements/free-trade-agreements/USMCA'},
        ],
    },
    {
        'id': 'fta',
        'title': 'Claim another free trade agreement',
        'saves': 'The base rate — for example 6.4% on most food preparations, 3% on soy sauce — on goods from Australia, Bahrain, Chile, Colombia, '
        'Israel, Jordan, South Korea, Morocco, Oman, Panama, Peru, Singapore and the CAFTA-DR countries; Japan has its own rates (JP) on some lines',
        'appliesTo': 'Most dutiable lines; on the sugar and dairy over-quota lines only some partners are Free, others have their own quotas in Chapter '
        '98 subchapter XXII (9822)',
        'document': 'The origin proof each agreement requires (a certification or declaration of origin) and records to back it up.',
        'caveat': 'An FTA removes the base rate but not the 2026 Section 301 duty for the 60 economies, which applies even when a special rate is '
        'claimed (U.S. note 52(a)); most of these partners are in the 60. GSP (A, A*, A+) has been expired since December 31, 2020.',
        'citations': [
            {'label': 'HTSUS General Notes 3(c) and 8–34', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 98, subch. XXII (FTA quotas, 9822)', 'url': CH98_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'quota',
        'title': 'Enter sugar and dairy goods inside the tariff-rate quota',
        'saves': 'The gap between the in-quota and over-quota rate: ice cream 20% instead of 50.2¢/kg + 17%; sweetened coffee and tea preparations '
        '10% instead of 30.5¢/kg + 8.5%; dairy food preparations 10% instead of up to 70.4¢/kg + 8.5%; butter substitutes 15.4¢/kg instead of $1.996/kg',
        'appliesTo': 'The paired in-quota and over-quota lines in 2101.12, 2101.20, 2103.90, 2105.00 and 2106.90',
        'document': 'Butter substitutes over 45% butterfat (2106.90.24, 2106.90.34) need a USDA dairy import license (Chapter 4 additional U.S. note 14; '
        '7 CFR part 6). The other quotas are filled at CBP in order of entry; check the quota status before shipping.',
        'caveat': 'Several quotas are tiny or zero: articles over 65% sugar and blended syrups have a quota of none (Chapter 17 notes 7 and 9); the '
        '64,709-tonne quota for articles over 10% sugar runs from October 1 (note 8); mixed condiments 689 t (Chapter 21 note 4); ice cream 5,667,846 '
        'liters a year (note 5). Mexico is outside these quotas because its goods are Free under USMCA. Low-priced over-quota goods can also owe a '
        'special safeguard duty (Chapter 99 subchapter IV).',
        'citations': [
            {'label': 'HTSUS Ch. 21, additional U.S. notes 4–5', 'url': CH21_PDF},
            {'label': 'HTSUS Ch. 17, additional U.S. notes 2–9', 'url': CH17_PDF},
            {'label': 'HTSUS Ch. 4, additional U.S. notes 1, 10, 14', 'url': CH04_PDF},
            {'label': '7 CFR part 6 (dairy import licensing)', 'url': 'https://www.ecfr.gov/current/title-7/part-6'},
            {'label': '19 CFR part 132 (quotas)', 'url': 'https://www.ecfr.gov/current/title-19/part-132'},
            {'label': 'CBP: tariff-rate quotas', 'url': 'https://www.cbp.gov/trade/quota/tariff-rate-quotas'},
            {'label': 'HTSUS Ch. 99, subch. IV (special safeguards)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'gn15',
        'title': 'Use a General Note 15 entry for samples, government or personal-use goods',
        'saves': 'The over-quota rate: these entries use the "described in general note 15" lines at the in-quota rate and are not counted against the quota',
        'appliesTo': 'The quota products: 2101.12.32, 2101.20.32, 2103.90.72, 2105.00.05, 2105.00.25, 2106.90.03, 2106.90.22, 2106.90.32, 2106.90.42, '
        '2106.90.62, 2106.90.83',
        'document': 'Proof of the qualifying purpose: goods for a U.S. government agency; personal-use shipments of 5 kg or less; or samples, trade-fair, '
        'research or embassy goods that will not enter U.S. commerce, with written USDA approval presented at entry.',
        'caveat': 'Commercial goods do not qualify. Ask USDA for approval (identifying the product, quantity and use) before the goods ship.',
        'citations': [{'label': 'HTSUS General Note 15', 'url': GN_PDF}],
    },
    {
        'id': 'drawback',
        'title': 'Recover duty on goods you export',
        'saves': 'Up to 99% of the duties paid, when the imported goods (or goods made from them) are exported or destroyed',
        'appliesTo': 'Any dutiable line',
        'document': 'A drawback claim to CBP with import and export records.',
        'caveat': 'Claims have filing deadlines and record-keeping rules; check with CBP whether a given Chapter 99 duty is eligible before relying on '
        'it.',
        'citations': [{'label': '19 CFR part 190', 'url': 'https://www.ecfr.gov/current/title-19/part-190'}],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding ruling before you import',
        'saves': 'Certainty: a ruling fixes the classification — supplement (2106.90.99, 6.4%) versus medicament (3004), quota line versus non-quota '
        'line, which 2009 juice sets the rate of a fortified concentrate — before the goods arrive',
        'appliesTo': 'Any line where the formula or packaging decides the rate',
        'document': 'A ruling request to CBP describing the product, its ingredients and packaging.',
        'caveat': 'Rulings apply to the transaction described; a reformulated product may need a new one.',
        'citations': [{'label': '19 CFR part 177', 'url': 'https://www.ecfr.gov/current/title-19/part-177'}],
    },
]
FDA_FSVP_PAGE = 'https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-foreign-supplier-verification-programs-fsvp-importers-food-humans-and-animals'
te['rules'] = [
    {
        'id': 'fda-registration',
        'agency': 'FDA',
        'title': 'Food facility registration for the foreign plant that makes, packs or holds the food',
        'citations': [{'label': '21 CFR 1.225', 'url': 'https://www.ecfr.gov/current/title-21/section-1.225'}],
    },
    {
        'id': 'fda-prior-notice',
        'agency': 'FDA',
        'title': 'Prior notice of imported food, filed before the shipment arrives',
        'citations': [
            {'label': '21 CFR part 1, subpart I', 'url': 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-1/subpart-I'}
        ],
    },
    {
        'id': 'fda-fsvp',
        'agency': 'FDA',
        'title': 'Foreign Supplier Verification Program (FSVP) kept by the U.S. importer; modified requirements for dietary supplements (21 CFR 1.511)',
        'citations': [
            {'label': '21 CFR part 1, subpart L', 'url': 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-1/subpart-L'},
            {'label': '21 CFR 1.511', 'url': 'https://www.ecfr.gov/current/title-21/section-1.511'},
            {'label': 'FDA: FSVP final rule', 'url': FDA_FSVP_PAGE},
        ],
    },
    {
        'id': 'fda-labeling',
        'agency': 'FDA',
        'title': 'Food labeling: English label, ingredient list, Nutrition Facts, major allergens',
        'citations': [{'label': '21 CFR part 101', 'url': 'https://www.ecfr.gov/current/title-21/part-101'}],
    },
    {
        'id': 'fda-additives',
        'agency': 'FDA',
        'title': 'Food and color additives must be approved for the use (or GRAS); colors from the listed color additives',
        'citations': [
            {'label': '21 CFR part 170', 'url': 'https://www.ecfr.gov/current/title-21/part-170'},
            {'label': '21 CFR part 73', 'url': 'https://www.ecfr.gov/current/title-21/part-73'},
        ],
    },
    {
        'id': 'fda-pchf',
        'agency': 'FDA',
        'title': 'Current good manufacturing practice and preventive controls at the foreign food plant',
        'citations': [{'label': '21 CFR part 117', 'url': 'https://www.ecfr.gov/current/title-21/part-117'}],
    },
    {
        'id': 'fda-lacf',
        'agency': 'FDA',
        'title': 'Shelf-stable canned or jarred soups and sauces (low-acid or acidified): plant registration and process filing',
        'citations': [
            {'label': '21 CFR part 108', 'url': 'https://www.ecfr.gov/current/title-21/part-108'},
            {'label': '21 CFR part 113', 'url': 'https://www.ecfr.gov/current/title-21/part-113'},
            {'label': '21 CFR part 114', 'url': 'https://www.ecfr.gov/current/title-21/part-114'},
        ],
    },
    {
        'id': 'fda-supplements',
        'agency': 'FDA',
        'title': 'Dietary supplements: supplement cGMP, Supplement Facts label, notification for new dietary ingredients',
        'citations': [
            {'label': '21 CFR part 111', 'url': 'https://www.ecfr.gov/current/title-21/part-111'},
            {'label': '21 CFR 101.36', 'url': 'https://www.ecfr.gov/current/title-21/section-101.36'},
            {'label': '21 CFR 190.6', 'url': 'https://www.ecfr.gov/current/title-21/section-190.6'},
            {'label': 'FDA: Dietary Supplements', 'url': 'https://www.fda.gov/food/dietary-supplements'},
        ],
    },
    {
        'id': 'fsis-meat',
        'agency': 'USDA FSIS',
        'title': 'Soups, broths and sauces containing meat or poultry may be FSIS products: eligible country and plant, reinspection at entry',
        'citations': [
            {'label': '9 CFR part 327', 'url': 'https://www.ecfr.gov/current/title-9/part-327'},
            {'label': '9 CFR part 381, subpart T', 'url': 'https://www.ecfr.gov/current/title-9/part-381/subpart-T'},
        ],
    },
    {
        'id': 'usda-dairy-license',
        'agency': 'USDA',
        'title': 'In-quota butter substitutes over 45% butterfat need a dairy import license',
        'citations': [
            {'label': '7 CFR part 6', 'url': 'https://www.ecfr.gov/current/title-7/part-6'},
            {'label': 'HTSUS Ch. 4, additional U.S. note 14', 'url': CH04_PDF},
        ],
    },
    {
        'id': 'cbp-quota',
        'agency': 'CBP',
        'title': 'Tariff-rate quota: in-quota rate only while the quota is open; over-quota rate afterwards',
        'citations': [
            {'label': '19 CFR part 132', 'url': 'https://www.ecfr.gov/current/title-19/part-132'},
            {'label': 'CBP: tariff-rate quotas', 'url': 'https://www.cbp.gov/trade/quota/tariff-rate-quotas'},
            {'label': 'HTSUS Ch. 17, additional U.S. notes 2–9', 'url': CH17_PDF},
        ],
    },
    {
        'id': 'ttb-fet',
        'agency': 'TTB / CBP',
        'title': 'Compound alcoholic preparations (2106.90.12–2106.90.18) may owe federal excise tax on distilled spirits',
        'citations': [
            {'label': '26 U.S.C. 5001', 'url': 'https://www.govinfo.gov/content/pkg/USCODE-2024-title26/html/USCODE-2024-title26-subtitleE-chap51-subchapA-partI-subpartA-sec5001.htm'},
            {'label': 'HTSUS Ch. 21, footnote 7', 'url': CH21_PDF},
        ],
    },
]

BASE_RULES = ['fda-registration', 'fda-prior-notice', 'fda-fsvp', 'fda-labeling', 'fda-pchf']
GROUP_RULES = {
    '2101': BASE_RULES + ['fda-additives', 'cbp-quota'],
    '2102': BASE_RULES,
    '2103': BASE_RULES + ['fda-additives', 'fda-lacf', 'fsis-meat', 'cbp-quota'],
    '2104': BASE_RULES + ['fda-lacf', 'fsis-meat'],
    '2105': BASE_RULES + ['fda-additives', 'cbp-quota'],
    '2106': BASE_RULES + ['fda-additives', 'fda-supplements', 'cbp-quota', 'usda-dairy-license', 'ttb-fet'],
}
GROUP_NOTES = {
    '2101': 'The sweetened and dairy coffee and tea preparations (2101.12.32–.58, 2101.20.32–.58) sit in the sugar quotas of Chapter 17; plain '
    'extracts and instant coffee have no quota.',
    '2102': None,
    '2103': 'Shelf-stable sauces in cans or jars may be low-acid or acidified foods. Sauces with meat can be FSIS products. Seasonings with over 10% '
    'cane or beet sugar are under the 689-tonne quota (Chapter 21 note 4).',
    '2104': 'Soups and broths that contain meat or poultry may be USDA FSIS products rather than FDA foods; canned soups need FDA process filing.',
    '2105': 'Ice cream and other dairy frozen desserts are quota products (Chapter 21 note 5; Chapter 4 note 10).',
    '2106': 'Dietary supplements (usually 2106.90.99) follow the supplement cGMP and labeling rules. Fortified juice concentrates (2106.90.52, '
    '2106.90.54) pay the rate of the same juice in heading 2009, per liter of reconstituted juice (additional U.S. notes 1–2). In-quota butter '
    'substitutes need a USDA license; compound alcoholic preparations may owe excise tax.',
}
for g in te['groups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['ruleIds'] = GROUP_RULES[g['heading']]
    g['note'] = GROUP_NOTES[g['heading']]

QUOTA_SUBS = set(
    '2101.12.34 2101.12.38 2101.12.44 2101.12.48 2101.12.54 2101.12.58 2101.20.34 2101.20.38 2101.20.44 2101.20.48 2101.20.54 2101.20.58 '
    '2103.90.74 2103.90.78 2105.00.10 2105.00.20 2105.00.30 2105.00.40 2106.90.06 2106.90.09 2106.90.24 2106.90.26 2106.90.34 2106.90.36 '
    '2106.90.44 2106.90.46 2106.90.64 2106.90.66 2106.90.68 2106.90.72 2106.90.74 2106.90.76 2106.90.78 2106.90.80 2106.90.85 2106.90.87 '
    '2106.90.89 2106.90.91 2106.90.92 2106.90.94 2106.90.95 2106.90.97'.split()
)
GN15_SUBS = set('2101.12.32 2101.20.32 2103.90.72 2105.00.05 2105.00.25 2106.90.03 2106.90.22 2106.90.32 2106.90.42 2106.90.62 2106.90.83'.split())
for ln in te['lines']:
    sub = ln['hts'][:10]
    rules = list(BASE_RULES)
    h = ln['heading']
    if h in ('2101', '2103', '2105', '2106'):
        rules.append('fda-additives')
    if h in ('2103', '2104'):
        rules += ['fda-lacf', 'fsis-meat']
    if sub.startswith('2106.90.99'):
        rules.append('fda-supplements')
    if sub in QUOTA_SUBS or sub in GN15_SUBS:
        rules.append('cbp-quota')
    if sub in ('2106.90.24', '2106.90.34'):
        rules.append('usda-dairy-license')
    if sub in ('2106.90.12', '2106.90.15', '2106.90.18'):
        rules.append('ttb-fet')
    ln['ruleIds'] = rules
    levers = ['usmca']
    if ln['general'] and ln['general'] != 'Free':
        levers.append('fta')
    if sub in QUOTA_SUBS:
        levers.append('quota')
    if sub in QUOTA_SUBS or sub in GN15_SUBS:
        levers.append('gn15')
    if ln['general'] and ln['general'] != 'Free':
        levers.append('drawback')
    levers.append('ruling')
    ln['leverIds'] = levers
te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations — not legal advice. FDA and USDA requirements depend on the product\'s '
    'ingredients and form; check the agency before each new product, and CBP for quota status before each over-quota-sensitive shipment.'
)

# ---------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['seo'] = {
    'title': 'Chapter 21 Tariff FAQ: HS Codes for Supplements, Protein Powder, Soy Sauce, Instant Coffee, Ice Cream | KoalaGains',
    'shortDescription': 'Answers to what people search about HTS Chapter 21: the HS code for dietary supplements, protein powder, soy sauce, instant '
    'coffee, ice cream, sauces, yeast and soup — and the U.S. tariff on each by country in 2026.',
    'keywords': [
        'hs code for dietary supplements',
        'harmonized tariff code for dietary supplements',
        'hts code 2106.90',
        'are supplements subject to tariffs',
        'tariffs on protein powder',
        'hs code for protein powder',
        'hs code for soy sauce',
        'hs code for instant coffee',
        'tariffs on ice cream',
        'hs code for ice cream',
        'hs code for yeast',
        'hs code for soup',
    ],
}
fc['intro'] = (
    'Straight answers to the most common questions about importing Chapter 21 goods into the U.S. — HS codes, tariffs by country and quota rules. '
    'Each answer links to the page with the full detail.'
)
fc['questionSource'] = 'Google search suggestions (U.S. English), collected October 11, 2026'


def faq_figs():
    out = {}
    if not have_trade:
        return out
    by_line = {x['hs6']: x for x in ui['byLine']}
    out['by_line'] = by_line
    return out


figs = faq_figs()


def line_imports(hs6):
    x = figs.get('by_line', {}).get(hs6)
    return x['importsUsd'] if x else None


v210690 = line_imports('2106.90')
v210610 = line_imports('2106.10')
v210310 = line_imports('2103.10')
v210500 = line_imports('2105.00')
v210111 = line_imports('2101.11')
trade_2106 = f' The U.S. imported {fmt_usd(v210690)} under 2106.90 in {Y}, the largest product in the chapter.' if v210690 else ''

fc['faqs'] = [
    {
        'id': 'hs-supplements',
        'question': 'What is the HS code for dietary supplements?',
        'searchedAs': [
            'hs code for dietary supplements',
            'dietary supplements hs code',
            'harmonized tariff code for dietary supplements',
            'hs code for food supplements',
            'hs code for nutritional supplements',
        ],
        'answer': 'Most dietary supplements — tablets, capsules and powders sold as food — are food preparations of heading 2106, U.S. line '
        '2106.90.99, with a 6.4% general rate. Products put up as medicines (measured doses for treating or preventing a disease) belong in heading '
        '3004 instead, and supplements with over 10% milk solids or a lot of cane or beet sugar can fall on the 2106.90 quota lines. Whatever the '
        'line, FDA treats them as dietary supplements: the maker must follow the supplement cGMP rules (21 CFR part 111) and the label needs a '
        'Supplement Facts panel (21 CFR 101.36).',
        'link': 'tariff-engineering',
    },
    {
        'id': 'supplement-tariffs',
        'question': 'Are dietary supplements subject to tariffs?',
        'searchedAs': ['are supplements subject to tariffs', 'tariffs on supplements', 'supplements tariffs', 'tariff on vitamins'],
        'answer': 'Yes. On 2106.90.99 the base rate is 6.4%, and since July 24, 2026 a Section 301 duty applies by country: 10% in total for the EU, '
        '12.5% in total for Japan, +10% for India and the UK, +12.5% for Singapore, Vietnam and Thailand, +20% for China (26.4% in all) and +37.5% for '
        'Brazil. USMCA-qualifying supplements from Canada and Mexico pay nothing. The 2025 IEEPA tariffs ended on February 24, 2026.',
        'link': 'industry-areas',
    },
    {
        'id': 'hts-2106',
        'question': 'What is HTS code 2106.90?',
        'searchedAs': ['hts code 2106.90', 'hs code 2106.90', 'harmonized tariff code 2106.90', 'hts code 2106', 'hs code 2106.10'],
        'answer': 'Heading 2106 is "food preparations not elsewhere specified or included". 2106.10 covers protein concentrates and textured protein '
        '(6.4%); 2106.90 covers everything else — 57 U.S. tariff lines, from compound alcoholic preparations and butter substitutes to sugar syrups, '
        'fortified juice concentrates and the 2106.90.99 basket at 6.4%, whose statistical suffixes split out drink preparations, non-dairy creamers, '
        'herbal teas, flavored honey and frozen, sugar-containing and organic food preparations.' + trade_2106,
        'link': '',
    },
    {
        'id': 'protein-powder',
        'question': 'Is there a tariff on protein powder, and what is its HS code?',
        'searchedAs': [
            'tariffs on protein powder',
            'are there tariffs on protein powder',
            'hs code for protein powder',
            'hs code for protein supplements',
            'hs code for whey protein powder',
        ],
        'answer': 'Protein concentrates and textured protein are 2106.10.00 (6.4%); flavored protein blends and shakes are usually 2106.90 — 2106.90.99 '
        'at 6.4%, or the dairy quota lines (10% in quota, up to 70.4¢/kg + 8.5% over quota) if they contain over 10% milk solids. Whey itself, '
        'including whey protein concentrate, is classified in Chapter 4 or heading 3502, not here. On top comes the Section 301 duty by country; '
        'China pays more on 2106.10.00 because it is on List 3: 6.4% + 12.5% + 25% = 43.9%.',
        'link': 'industry-areas',
    },
    {
        'id': 'soy-sauce',
        'question': 'What is the HS code and tariff for soy sauce?',
        'searchedAs': ['hs code for soy sauce', 'soya sauce hs code', 'light soya sauce hs code'],
        'answer': 'Soy sauce is 2103.10.00.00, with a 3% general rate. From China it pays 40.5% in total (3% + 12.5% under the 2026 Section 301 action + '
        '25% under List 3); from Japan it is Free under the U.S.–Japan Trade Agreement but the 12.5% Japan total applies; from the EU it pays 10%; '
        'USMCA-qualifying soy sauce from Canada or Mexico is Free.',
        'link': 'industry-areas',
    },
    {
        'id': 'instant-coffee',
        'question': 'What is the HS code for instant coffee, and is there a tariff on it?',
        'searchedAs': [
            'hs code for instant coffee',
            'instant coffee hs code',
            'hs code for soluble coffee',
            'hs code for instant coffee premix',
            'tariffs on instant coffee',
        ],
        'answer': 'Unflavored instant coffee is 2101.11.21 and other coffee extracts 2101.11.29, both Free. Both are on the Section 301 general '
        'exemption list (U.S. note 52(b)), so there is no extra duty from any of the 60 economies — Brazil included — except China\'s older 7.5% '
        'List 4A duty. Instant coffee premixes with sugar or milk are 2101.12: 8.5%, or the sugar quota lines (10% in quota, 30.5¢/kg + 8.5% over '
        'quota), and those do pay the Section 301 duty.',
        'link': '',
    },
    {
        'id': 'ice-cream',
        'question': 'What is the tariff and HS code for ice cream?',
        'searchedAs': ['tariffs on ice cream', 'hs code for ice cream'],
        'answer': 'Ice cream is heading 2105. It is under a tariff-rate quota of 5,667,846 liters a year: 20% inside the quota (2105.00.10), '
        '50.2¢/kg + 17% above it (2105.00.20), plus the Section 301 duty for the country. USMCA ice cream from Mexico is Free with no limit; from '
        "Canada it is Free inside Canada's USMCA quota (10,605,000 liters in 2026, shared with cream and milk drinks) and over-quota above it. "
        'Edible ice with no dairy limit, such as sorbet, is 2105.00.50 at 17%.',
        'link': '',
    },
    {
        'id': 'hs-sauces',
        'question': 'What is the HS code for sauces like ketchup, tomato sauce and mayonnaise?',
        'searchedAs': ['hs code for sauces', 'hs code for tomato sauce', 'hs code for ketchup', 'hs code for mayonnaise', 'sauce hs code'],
        'answer': 'Heading 2103. Tomato ketchup is 2103.20.20 (6%), other tomato sauces 2103.20.40 (11.6%), prepared mustard 2103.30.40 (2.8¢/kg), '
        'fish sauce 2103.90.20 (Free), and mayonnaise (2103.90.90.20), salad dressings (2103.90.90.40) and most other sauces and mixed seasonings '
        '2103.90.90 (6.4%). Seasonings with over 10% cane or beet sugar fall on the quota lines 2103.90.72–.78.',
        'link': '',
    },
    {
        'id': 'hs-yeast',
        'question': 'What is the HS code for yeast and yeast extract?',
        'searchedAs': ['hs code for yeast', 'hs code for yeast extract', 'hs code for dry yeast', 'hs code for instant yeast'],
        'answer': "Active yeasts, including instant dry baker's yeast, are 2102.10.00 (6.4%). Inactive yeasts are 2102.20: 6.4%, Free for crude dried "
        "brewers' yeast, 3.2% for other dead micro-organisms. Nonalcoholic preparations of yeast extract (other than sauces) are 2103.90.40 (3.2%). "
        'Prepared baking powder is 2102.30.00 (Free).',
        'link': '',
    },
    {
        'id': 'hs-soup',
        'question': 'What is the HS code for soup?',
        'searchedAs': ['hs code for soup', 'hs code for soup mix', 'hs code for soup powder'],
        'answer': 'Soups, broths and preparations for them — including dried soup mixes and bouillon — are 2104.10.00 (3.2%), split for statistics into '
        'dried, fish-based, organic and other. Homogenized baby food in small retail containers is 2104.20. Soups with meat or poultry can be USDA FSIS '
        'products, which must come from an eligible country and plant (9 CFR part 327).',
        'link': 'tariff-engineering',
    },
    {
        'id': 'creamer-drink-mix',
        'question': 'What is the HS code for non-dairy creamer, drink mixes and herbal tea blends?',
        'searchedAs': ['hs code for non dairy creamer', 'coffee creamer hs code', 'hs code for drink mix', 'hs code for powdered drink mix', 'hs code for herbal tea'],
        'answer': 'They are statistical suffixes of 2106.90.99 (6.4%): non-dairy coffee whiteners .75, other cream or milk substitutes .80, '
        'preparations for making beverages .71–.73 (by sweetener), and herbal teas and infusions of mixed herbs .87. A creamer or drink mix with over '
        '10% milk solids, or with enough cane or beet sugar, moves to the 2106.90 quota lines.',
        'link': '',
    },
    {
        'id': 'fortified-juice',
        'question': 'How is a fortified juice concentrate tariffed?',
        'searchedAs': ['fortified juice concentrate', 'calcium fortified orange juice concentrate', 'what is fortified juice'],
        'answer': 'Vitamin- or mineral-fortified juice imported as a concentrate is Chapter 21. Fortified orange juice is 2106.90.48 at 7.85¢ per liter '
        'of reconstituted juice, and it is exempt from the 2026 Section 301 duty. Other single juices (2106.90.52) and juice mixtures (2106.90.54) have no '
        'printed rate: they pay the rate of the same juice in heading 2009, per liter of reconstituted juice — so the calculator cannot price them '
        'without the matching 2009 line. Non-concentrated fortified juices are classified in 2202.99.',
        'link': 'tariff-engineering',
    },
]

fc['keyTakeaways'] = [
    'Most Chapter 21 trade is on one line, 2106.90.99 (dietary supplements and other food preparations), at a 6.4% base rate.',
    'The 2025 IEEPA tariffs ended on February 24, 2026. Since July 24, 2026 the extra duty is a Section 301 tariff: 10% in total for the EU, +10% or '
    '+12.5% for most other large suppliers, +20% for China (+37.5% on soy sauce and protein concentrates) and +37.5% for Brazil. USMCA-qualifying '
    'goods pay nothing extra, and instant coffee, coffee and tea extracts and fortified orange juice are exempt for everyone.',
    'Sugar- and dairy-containing preparations, ice cream and butter substitutes are under tariff-rate quotas; above the quota the rate jumps to as '
    'much as $1.996/kg.',
    'FDA rules decide whether the food can be sold: facility registration, prior notice, FSVP and labeling — plus cGMP and Supplement Facts for '
    'dietary supplements.',
]

# ---------------------------------------------------------------------------------------------------
# Understand industry (import statistics) — wording from the generated figures
# ---------------------------------------------------------------------------------------------------
if have_trade:
    exec(open(__file__.replace('fill21.py', 'fill21_trade.py')).read())

# ---------------------------------------------------------------------------------------------------
# Write
# ---------------------------------------------------------------------------------------------------
def count_todo(v):
    if isinstance(v, str):
        return 1 if re.search(r'\bTODO\b', v) else 0
    if isinstance(v, list):
        return sum(count_todo(x) for x in v)
    if isinstance(v, dict):
        return sum(count_todo(x) for x in v.values())
    return 0


def todo_paths(v, p=''):
    if isinstance(v, str):
        if re.search(r'\bTODO\b', v):
            yield p
    elif isinstance(v, list):
        for i, x in enumerate(v):
            yield from todo_paths(x, f'{p}[{i}]')
    elif isinstance(v, dict):
        for k, x in v.items():
            yield from todo_paths(x, f'{p}.{k}')


json.dump(d, open(OUT, 'w'), ensure_ascii=False, indent=2)
left = list(todo_paths(d))
print(f'wrote {OUT}; TODO left: {len(left)}')
for p in left[:40]:
    print('  ', p)
