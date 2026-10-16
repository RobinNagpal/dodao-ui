#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 42 content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill42.py <generated.json> <out.json>
Re-runnable: every regeneration of the data parts is followed by this script.

Generate with (from insights-ui/):
  pnpm tariff:generate-chapter --chapter 42 --slug 42-leather-articles-and-saddlery \
    --title "Articles of Leather; Saddlery and Harness; Travel Goods, Handbags and Similar Containers; Articles of Animal Gut (Other Than Silkworm Gut)" \
    --countries KH,CN,VN,IT,FR,ID,IN,PH,TH,MX,CA,GB,ES,PK --out <scratch>/gen.json --force
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import glob
import json
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
WT = IU
TODAY = '2026-10-12'

d = json.load(open(SRC))

# Official sources already used (and checked) in other chapter files, by id.
REF_SOURCES = {}
for f in sorted(glob.glob(f'{WT}/src/tariff-data/chapters/*.json')):
    if '42-leather' in f:
        continue
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            REF_SOURCES.setdefault(s['id'], s)

CH42_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2042'
CH98_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
CH99_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
GN_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
USC_4454 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap28-subchapVIII-sec4454.htm'
USC_2703 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap15-sec2703.htm'
OTEXA_NEPAL = 'https://www.trade.gov/otexa-nepal-trade-preference-program'


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


# ---------------------------------------------------------------------------------------------------
# Trade figures
# ---------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
Y = ui['latestYear']
PY = ui['priorYear']
year_tot = {r['year']: r['totalUsd'] for r in ui['byYear']}
total, prior_total = year_tot[Y], year_tot[PY]
by_line = {x['hs6']: x for x in ui['byLine']}
trade = json.load(open(f'{WT}/src/tariff-data/trade/chapter-42.json'))
by_c_all = {c['country']: c for c in trade['byCountry']}
by_h = {h['heading']: h['byYear'] for h in trade['byHeading']}


def imp(country):
    c = by_c_all.get(country)
    return c['importsUsd'] if c else 0


def imp_year(country, year):
    c = by_c_all.get(country)
    return c['byYear'].get(str(year), 0) if c else 0


def chg(country):
    c = by_c_all[country]
    return round((c['importsUsd'] / c['priorImportsUsd'] - 1) * 100, 1)


h4202 = by_h['4202'][str(Y)]
h4203 = by_h['4203'][str(Y)]
h4201 = by_h['4201'][str(Y)]

# ---------------------------------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------------------------------
NEW_SOURCES = {
    'hts-ch42': {
        'id': 'hts-ch42',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 42',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 42: Articles of Leather; Saddlery and Harness; '
        'Travel Goods, Handbags and Similar Containers; Articles of Animal Gut (Other Than Silkworm Gut)',
        'signed': None,
        'published': '2026-10-07',
        'url': CH42_PDF,
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
        'citation': 'ITA / OTEXA web page (checked October 12, 2026)',
        'document': 'Web page',
        'title': 'Nepal Trade Preference Program ("expired on December 31, 2025")',
        'signed': None,
        'published': '2026-10-12',
        'url': OTEXA_NEPAL,
    },
    'usc-2703': {
        'id': 'usc-2703',
        'publisher': 'U.S. Code (GovInfo)',
        'citation': '19 U.S.C. 2703(b)(5)(D)',
        'document': 'United States Code, 2024 edition',
        'title': 'Caribbean Basin Trade Partnership Act: the CBTPA "transition period" ends September 30, 2030',
        'signed': None,
        'published': '2024-12-31',
        'url': USC_2703,
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
d['chapter']['title'] = (
    'Articles of Leather; Saddlery and Harness; Travel Goods, Handbags and Similar Containers; Articles of Animal Gut (Other Than Silkworm Gut)'
)
SHORT = 'Leather Goods, Luggage & Handbags'

GROUP_LABELS = {
    '4201': ('Saddlery & harness, incl. dog leashes, collars and harnesses', 'Saddlery & pet gear'),
    '4202': ('Luggage, handbags, wallets, backpacks & other cases', 'Luggage & handbags'),
    '4203': ('Leather apparel, gloves & belts', 'Leather apparel & belts'),
    '4205': ('Other leather articles (straps, belting, shoelaces)', 'Other leather'),
    '4206': ('Articles of gut, bladders & tendons (racquet strings)', 'Gut articles'),
}

BLURBS = {
    '4201': (
        'Saddles, bridles and other horse tack pay 2.8%; dog leashes, collars, muzzles and harnesses 2.4% — whatever they are made of. Both '
        'lines from Canada carry the 50% Section 338 duty, even under USMCA.',
        ['saddle', 'horse tack', 'bridle', 'dog leash', 'dog collar', 'dog harness', 'pet leash', 'saddle pad', 'saddle bag'],
    ),
    '4202': (
        'The rate follows the outer surface and the type of article. Suitcases and other luggage with a plastic or "other" outer surface pay 20%, '
        'with leather 8%; handbags of leather 9% (over $20) or 10%, of reptile leather 5.3%, of plastic sheeting (PU, PVC) 16%, of man-made '
        'fibers 17.6%, of cotton 6.3%; wallets of leather 8%; backpacks and duffels of polyester or nylon 17.6%; golf bags 4.5%.',
        ['suitcase', 'luggage', 'handbag', 'purse', 'wallet', 'backpack', 'tote bag', 'briefcase', 'laptop bag', 'duffel bag', 'cosmetic bag', 'golf bag'],
    ),
    '4203': (
        'Leather jackets and coats pay 6% (reptile leather 4.7%), belts 2.7%, work and dress gloves of leather 12.6%–14%, sports gloves Free to '
        '5.5% (baseball and ice hockey gloves Free, batting gloves 3%, golf gloves 4.9%).',
        ['leather jacket', 'leather coat', 'leather belt', 'leather gloves', 'work gloves', 'golf gloves', 'batting gloves', 'ski gloves'],
    ),
    '4205': (
        'Leather belting for machinery 2.9%, straps and strops 1.8%, other articles of reptile leather 4.9%; shoelaces, technical leather parts '
        'and other leather articles (4205.00.80) are Free.',
        ['leather strap', 'leather shoelaces', 'leather belting', 'leather cord', 'watch strap blank'],
    ),
    '4206': (
        'Catgut for sterile surgical sutures 3.5%, other catgut including racquet strings 3.9%, and other articles of gut, goldbeater\'s skin, '
        'bladders or tendons Free. Finished sterile sutures are not here (heading 3006).',
        ['catgut', 'racquet strings', 'natural gut strings', 'goldbeater\'s skin'],
    ),
}

ov = d['overview']
ov['h1'] = f'HTS Chapter 42: {SHORT} — Tariff Rates'
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

# ---------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------
ov['seo']['title'] = 'HTS Chapter 42 Tariffs 2026: Handbag, Luggage & Leather Goods Import Duty Rates by Country | KoalaGains'
ov['seo']['shortDescription'] = (
    'Searchable 2026 U.S. tariff table for all 121 HTS Chapter 42 lines — luggage, handbags, wallets, backpacks, leather jackets, belts, '
    'gloves, saddlery. Base rates up to 20% plus the extra duty by country: 10% in total for Italian and French leather goods, up to 57.5% from China.'
)
ov['seo']['keywords'] = [
    'hts chapter 42',
    'hts chapter 42 import duty',
    'articles of leather import duty',
    'handbag tariff code',
    'hs code for handbags',
    'hs code for luggage',
    'tariffs on leather goods',
    'hard-sided luggage import duties',
    'china tariff on hts chapter 42',
    'cambodia travel goods tariff',
]

ov['intro'] = (
    'Chapter 42 covers saddlery and pet leashes, luggage, handbags, wallets, backpacks and every other case or bag of heading 4202, leather '
    'apparel, gloves and belts, and articles of gut. Unlike most chapters, its **base rates are high**: 112 of the 121 tariff lines are '
    'dutiable, and the travel-goods lines of heading 4202 run **up to 20%** — 20% for plastic suitcases, 17.6% for polyester or nylon '
    'backpacks and handbags, 16% for handbags of PU or PVC sheeting, 9%–10% for leather handbags. Leather gloves pay 12.6%–14%.\n\n'
    f'The U.S. imported **{fmt_usd(total)}** of these goods in {Y}, {fmt_usd(h4202)} of it in heading 4202. **Cambodia** '
    f'({fmt_usd(imp("Cambodia"))}) passed **China** ({fmt_usd(imp("China"))}, down {abs(chg("China"))}%) as the largest supplier, ahead of '
    f'Vietnam, Italy and France. On top of the base rate comes the **extra duty by country**: since July 24, 2026 a Section 301 tariff on 60 '
    'economies — +10% for Cambodia, Indonesia, India and Pakistan, +12.5% for Vietnam, the Philippines and Thailand, and **10% in total for EU '
    'goods** (nothing added where the base rate is already 10% or more). **China pays +12.5% plus +25% (List 3)** on every line except gut '
    'articles, so a Chinese plastic suitcase pays 57.5%. USMCA-qualifying goods from Mexico pay nothing extra; 14 Canadian subheadings — '
    'saddlery and dog gear, plastic and textile luggage, belts and some bags — owe a **50% Section 338 duty even under USMCA**. Exotic-leather '
    'goods also need **Fish and Wildlife Service** clearance and, for CITES species, permits.'
)

ov['workedExamples'] = [
    {
        'title': 'Leather handbag from Italy (over $20)',
        'line': '4202.21.90.00',
        'body': 'The base rate is 9%. For EU goods whose base rate is under 10%, the 2026 Section 301 action charges 10% in total (9903.05.39), '
        'so a $100,000 shipment pays **$10,000** instead of $9,000. A handbag of python or crocodile leather is 4202.21.30 (5.3%), also 10% in '
        'total from the EU — but it needs CITES documents and a Fish and Wildlife Service declaration at a designated port.',
    },
    {
        'title': 'Hard-shell polycarbonate suitcase from China',
        'line': '4202.12.21.20',
        'body': 'Trunks and suitcases with an outer surface of plastics pay 20%. China adds +12.5% (9903.05.31) and +25% because 4202.12.21 is '
        'on List 3 (9903.88.03): **57.5%**, $5,750 on a $10,000 order. The same suitcase pays 30% from Cambodia or India, 32.5% from Vietnam '
        'and 20% from the EU (its base rate is already over 10%, so nothing is added). In April–May 2025 it paid 190% from China.',
    },
    {
        'title': 'Polyester backpack from Vietnam',
        'line': '4202.92.31.20',
        'body': 'Backpacks of man-made fibers pay 17.6%. Vietnam adds +12.5% (9903.05.84): **30.1%**, $3,010 on $10,000. From China the line pays '
        '55.1%, except backpacks that match the size description of the List 3 exclusion in U.S. note 20(vvv)(iii) (35–75 cm high, 19–34 cm '
        'wide, 5–26 cm deep), which pay 30.1% through November 9, 2026. Origin is the country where the bag is wholly assembled (19 CFR 102.21).',
    },
    {
        'title': 'Leather dog collar from Canada',
        'line': '4201.00.30.00',
        'body': 'The base rate is 2.4%, and USMCA-qualifying goods are exempt from the 10% Section 301 duty (9903.05.93). But 4201.00.30 is on the '
        'Section 338 list in U.S. note 51(b)(3) (9903.03.14), and that 50% applies even when USMCA is claimed: **$5,000** on a $10,000 '
        'shipment. A non-qualifying shipment pays 2.4% + 10% + 50% = 62.4%.',
    },
]

snap = ov['tradeSnapshot']
snap['effectiveDutyRateNote'] = 'Duty-collected figures aren’t available from an official source yet.'
snap['totalDutyCollectedUsd'] = None
snap['source'] = f'UN Comtrade, United States imports, HS chapter 42 ({Y})'
snap['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar {Y} — before the '
    '2026 tariff changes.'
)

ov['notes']['chapterNotes'] = (
    '**Note 1.** For the purposes of this chapter, the term "leather" includes chamois (including combination chamois) leather, patent '
    'leather, patent laminated leather and metalized leather.\n\n'
    '**Note 2.** This chapter does not cover: (a) sterile surgical catgut or similar sterile suture materials (heading 3006); (b) articles of '
    'apparel or clothing accessories (except gloves, mittens and mitts), lined with furskin or artificial fur or to which furskin or '
    'artificial fur is attached on the outside, except as mere trimming (heading 4303 or 4304); (c) made up articles of netting (heading 5608); '
    '(d) articles of chapter 64; (e) headgear or parts thereof of chapter 65; (f) whips, riding-crops or other articles of heading 6602; (g) '
    'cuff-links, bracelets or other imitation jewelry (heading 7117); (h) fittings or trimmings for harness, such as stirrups, bits, horse '
    'brasses and buckles, separately entered (generally section XV); (ij) strings, skins for drums or the like, or other parts of musical '
    'instruments (heading 9209); (k) articles of chapter 94 (for example, furniture, luminaires and lighting fittings); (l) articles of '
    'chapter 95 (for example, toys, games, sports equipment); or (m) buttons, press-fasteners, snap-fasteners, press-studs, button molds or '
    'other parts of these articles, button blanks, of heading 9606.\n\n'
    '**Note 3.** (A) In addition to the provisions of note 2, heading 4202 does not cover: (a) bags made of sheeting of plastics, whether or not '
    'printed, with handles, not designed for prolonged use (heading 3923); (b) articles of plaiting materials (heading 4602). (B) Articles of '
    'headings 4202 and 4203 which have parts of precious metal or metal clad with precious metal, of natural or cultured pearls, of precious or '
    'semiprecious stones remain classified in those headings even if such parts constitute more than minor fittings or minor ornamentation, '
    'provided that these parts do not give the articles their essential character. If the parts give the articles their essential character, '
    'the articles are to be classified in chapter 71.\n\n'
    '**Note 4.** For the purposes of heading 4203, the expression "articles of apparel and clothing accessories" applies, inter alia, to '
    'gloves, mittens and mitts (including those for sport or for protection), aprons and other protective clothing, braces, belts, bandoliers '
    'and wrist straps, but excluding watch straps (heading 9113).'
)
ov['notes']['additionalUsNotes'] = (
    '**1.** For the purposes of heading 4202, the expression "travel, sports and similar bags" means goods, other than those falling in '
    'subheadings 4202.11 through 4202.39, of a kind designed for carrying clothing and other personal effects during travel, including '
    'backpacks and shopping bags of this heading, but does not include binocular cases, camera cases, musical instrument cases, bottle cases '
    'and similar containers.\n\n'
    '**2.** For purposes of classifying articles under subheadings 4202.12, 4202.22, 4202.32, and 4202.92, articles of textile fabric '
    'impregnated, coated, covered or laminated with plastics (whether compact or cellular) shall be regarded as having an outer surface of '
    'textile material or of sheeting of plastics, depending upon whether and the extent to which the textile constituent or the plastic '
    'constituent makes up the exterior surface of the article.'
)

for s in ov['stats']:
    if s['label'] == 'Lines with an extra duty for some origins':
        s['note'] = (
            'Section 301 (2026, 60 economies): 121; Brazil: 121; China List 3: 117 (all but the 4206 gut lines); Canada Section 338: 22 '
            '(also on USMCA goods); Russia 35% in lieu of column 2: 2'
        )

# ---------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['h1'] = f'HTS Chapter 42: {SHORT} — Tariff Updates'
tu['seo'] = {
    'title': 'HTS Chapter 42 Tariff Updates 2026: Handbag, Luggage & Leather Goods Duties Since January 2025 | KoalaGains',
    'shortDescription': 'What changed for HTS Chapter 42 — luggage, handbags, wallets, backpacks, leather goods — since January 2025: the end of '
    'the IEEPA and Section 122 duties, the 2026 Section 301 tariffs (Cambodia +10%, Vietnam +12.5%, EU 10%), China List 3 and Canada '
    'Section 338, with Federal Register citations.',
    'keywords': [
        'hts chapter 42 tariff updates',
        'hts chapter 42 import duty rates',
        'section 301 tariff on handbags',
        'cambodia travel goods tariff',
        'vietnam luggage customs duty',
        'china tariff on hts chapter 42',
        'ustr section 301 leather goods',
        'section 338 canada tariffs',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 '
    'Revision 21** (in force October 9, 2026). **No Chapter 42 base rate changed**: all 121 lines carry the same General, Special and Column 2 '
    'rates, from Free to 20%.\n\n'
    'Everything that changed sits on top of the base rate. In 2025 the IEEPA duties reached travel goods from every country — 19% for '
    'Cambodia, Indonesia, the Philippines and Thailand, 20% for Vietnam and 15% in total for the EU from August 7, 2025, 50% for India from '
    'August 27, and up to 145% for China in April–May 2025, on top of the 25% List 3 duty. The IEEPA duties **ended on February 24, 2026**, and '
    'the 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026** goods from 60 economies pay a **Section '
    '301 tariff**: +10% for Cambodia, Indonesia, India, Pakistan and Bangladesh, +12.5% for Vietnam, the Philippines and Thailand, 10% in total '
    'for the EU. China still pays the **25% List 3 duty** on 117 of the 121 lines. Since **August 22, 2026** fourteen Chapter 42 subheadings '
    'from Canada pay a **50% Section 338 duty**, even under USMCA. Duty-free programs moved too: GSP stays expired, the Nepal program expired '
    'December 31, 2025, and AGOA was renewed to December 31, 2026.'
)
tu['scope'] = (
    'Measures that reach Chapter 42 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 tariff, the China '
    'Section 301 List 3 duty and its one product exclusion, the Canada Section 338 duties, Russia\'s rates in lieu of column 2, and the '
    '2025–2026 IEEPA and Section 122 duties that have ended. Preference-program changes (GSP, AGOA, Nepal) are listed for reference. No '
    'antidumping or countervailing duty order covers a Chapter 42 product. For the rate each supplier pays, see Rates by country.'
)

NO_52B = 'No Chapter 42 line is on the general exemption list (note 52(b)). '
CA338_LINES = (
    '4201.00.30, 4201.00.60, 4202.12.21, 4202.12.81, 4202.12.89, 4202.92.15, 4202.92.31, 4202.92.50, 4202.92.97, 4202.99.10, 4202.99.90, '
    '4203.29.40, 4203.30.00 and 4205.00.80'
)

IN_EFFECT_TEXT = {
    'Cambodia': (
        'Base rate + 10% (9903.05.28). ' + NO_52B + 'Cambodia\'s exception list in note 52(j) names no Chapter 42 line. The 19% IEEPA '
        'reciprocal duty (9903.02.11, from August 7, 2025) ended February 24, 2026.',
        'A Cambodian polyester backpack or handbag pays 27.6% (17.6% + 10%), a plastic suitcase 30%, a leather handbag over $20 19%.',
    ),
    'China': (
        'Two Section 301 duties stack: +12.5% under the 2026 action (9903.05.31) and +25% under List 3 (9903.88.03), which covers every '
        'Chapter 42 subheading except the 4206 gut articles. The only exclusion in force (U.S. note 20(vvv)(iii), 9903.88.69) covers backpacks '
        'of man-made fibers 35–75 cm high, 19–34 cm wide and 5–26 cm deep (4202.92.31.20), through November 9, 2026. No Chapter 42 line is on '
        'List 4A. The IEEPA duties on China (fentanyl and reciprocal) ended February 24, 2026, and USTR\'s four-year review kept List 3 in place.',
        'Chinese luggage pays 57.5% (20% + 37.5%), polyester backpacks and handbags 55.1%, leather handbags 46.5%, leather belts 40.2%; gut '
        'articles only +12.5%.',
    ),
    'Vietnam': (
        'Base rate + 12.5% (9903.05.84). ' + NO_52B + 'The 20% IEEPA reciprocal duty (9903.02.69, from August 7, 2025) ended February 24, '
        '2026.',
        'Vietnamese backpacks and textile handbags pay 30.1%, plastic suitcases 32.5%, leather wallets 20.5%.',
    ),
    'European Union': (
        'For EU goods whose base rate is under 10%, the total is 10% (9903.05.39); at or above 10%, nothing is added (9903.05.38, U.S. note '
        '52(k)). So leather handbags (9%–10%), wallets (8%), belts and leather jackets pay 10% in total, while plastic or textile luggage and '
        'bags (16%–20%) and leather gloves (12.6%–14%) pay only their base rate. ' + NO_52B + 'The EU exception list (note 52(j)(2)) has no '
        'Chapter 42 line. This replaced the 15%-in-total IEEPA rate (9903.02.20), which ended February 24, 2026.',
        'Italian, French or Spanish leather handbags pay 10% of value — $1,000 on $10,000 — instead of 15% in late 2025 and 9% before that.',
    ),
    'Indonesia': (
        'Base rate + 10% (9903.05.45). ' + NO_52B + 'The 19% IEEPA reciprocal duty (9903.02.27) ended February 24, 2026.',
        'Indonesian textile handbags and backpacks pay 27.6%, leather gloves 22.6%–24%.',
    ),
    'India': (
        'Base rate + 10% (9903.05.44). ' + NO_52B + 'The IEEPA duties on India — 25% reciprocal from August 7, 2025 plus 25% from August 27, '
        '2025 — ended in February 2026.',
        'Indian leather handbags pay 19%, leather belts 12.7%, leather jackets 16%, saddles 12.8%.',
    ),
    'Philippines': (
        'Base rate + 12.5% (9903.05.64). ' + NO_52B + 'The 19% IEEPA reciprocal duty (9903.02.53) ended February 24, 2026.',
        'Philippine handbags of man-made fibers pay 30.1%, leather handbags 21.5%.',
    ),
    'Thailand': (
        'Base rate + 12.5% (9903.05.77). ' + NO_52B + 'The 19% IEEPA reciprocal duty (9903.02.61) ended February 24, 2026.',
        'Thai luggage pays 32.5%, textile bags 30.1%.',
    ),
    'Mexico': (
        'USMCA-qualifying goods pay no Section 301 duty (9903.05.94); others pay +10% (9903.05.55). ' + NO_52B + 'Mexico is not subject to '
        'the Canada Section 338 duties. The 25% IEEPA duty on non-USMCA goods (9903.01.01) ended February 24, 2026.',
        'USMCA-qualifying luggage, handbags, belts or saddlery from Mexico pay nothing; non-qualifying goods pay the base rate plus 10%.',
    ),
    'Canada': (
        'Two measures. The 2026 Section 301 duty (+10%, 9903.05.29) does not apply to USMCA-qualifying goods (9903.05.93). The Section 338 '
        'duty (+50%, from August 22, 2026, 9903.03.14) applies to products of Canada in 14 Chapter 42 subheadings — ' + CA338_LINES + ' — and '
        'U.S. note 51(a) says it applies even when USMCA or another special rate is claimed. The September 15, 2026 list revisions and the '
        'September 29, 2026 import bans changed no Chapter 42 entry. The 35% IEEPA duty on non-USMCA goods (9903.01.10) ended February 24, 2026.',
        'A USMCA-qualifying dog collar, saddle, plastic suitcase, belt or backpack from Canada pays 50%; non-qualifying goods pay 60% plus the '
        'base rate. USMCA leather handbags, wallets and leather luggage from Canada pay nothing.',
    ),
    'United Kingdom': (
        'Base rate + 10% (9903.05.81). ' + NO_52B + 'The UK exception list (note 52(j)(1)) has no Chapter 42 line. The 10% IEEPA reciprocal '
        'duty ended February 24, 2026.',
        'British leather handbags pay 19%, saddlery 12.4%–12.8%.',
    ),
    'Pakistan': (
        'Base rate + 10% (9903.05.62). ' + NO_52B + 'The 19% IEEPA reciprocal duty (9903.02.51) ended February 24, 2026.',
        'Pakistani leather gloves pay 22.6%–24%, leather jackets 16%.',
    ),
    'Brazil': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 (9903.05.27). The '
        'Brazil exemption list (U.S. note 50(a)(ii)) names no Chapter 42 line. The 40% IEEPA duty on Brazil (Executive Order 14323) ended '
        'February 24, 2026.',
        'Brazilian leather goods pay 37.5% on top of the base rate — 46.5% for a leather handbag.',
    ),
    'Russia': (
        'Russia pays column 2 rates (general note 3(b)) — 35% on most leather articles, 45%–110% on plastic and textile travel goods — plus '
        '+12.5% (9903.05.66). Two lines (4202.29.20 and 4203.29.50) pay 35% under 9903.90.08 in place of their column 2 rate (U.S. note 30).',
        'Russian leather goods are effectively priced out.',
    ),
}
OTHER_TEXT = (
    'Rates by country: Bangladesh, Sri Lanka and Malaysia +10%, Taiwan 10% in total (9903.05.76), Turkey and the Dominican Republic +12.5%. '
    + NO_52B + 'Three country exception lists in U.S. note 52(j) cover **every 4202 subheading**: Jordan (9903.06.20), and Guatemala '
    '(9903.06.06) and El Salvador (9903.06.09) when CAFTA-DR is claimed — so their luggage and handbags pay no Section 301 duty. Countries '
    'outside the 60 economies, such as Myanmar, pay only the base rate.',
    'Bangladeshi or Sri Lankan handbags pay 10% plus the base rate; CAFTA-DR handbags from Guatemala or El Salvador and Jordanian travel goods '
    'pay nothing extra.',
)
for e in tu['inEffect']:
    key = e['country']
    if key in IN_EFFECT_TEXT:
        e['exemption'], e['whatItMeans'] = IN_EFFECT_TEXT[key]
    elif key.startswith('Other'):
        e['country'] = 'Other Section 301 economies (incl. Bangladesh, Sri Lanka, Taiwan, Turkey, Jordan, Guatemala, El Salvador)'
        e['exemption'], e['whatItMeans'] = OTHER_TEXT
    else:
        raise SystemExit(f'no inEffect text for {key}')
    if e['country'] == 'European Union':
        e['measure'] = 'Section 301 tariff (forced-labor investigations), EU rate'
    elif e['country'] == 'Canada':
        e['measure'] = 'Section 301 tariff (non-USMCA goods) + Section 338 duty (all goods on the list)'
        e['now'] = '+10% (non-USMCA); +50% on 14 subheadings, USMCA or not'
    elif e['country'] == 'China':
        e['measure'] = 'Section 301 tariffs: 2026 action plus List 3'
        e['now'] = '+37.5% (+12.5% on 4206 gut articles)'
    elif e['country'] == 'Brazil':
        e['measure'] = 'Section 301 tariffs: Brazil action plus 2026 forced-labor action'
        if 'eo-14323' not in e['sourceIds']:
            e['sourceIds'].insert(-1, 'eo-14323')
    elif e['country'] == 'Russia':
        e['measure'] = 'Section 301 tariff + rates in lieu of column 2 (2 lines)'
    elif e['measure'] == 'Section 301 (2026, 60 economies)':
        e['measure'] = 'Section 301 tariff (forced-labor investigations)'
    if e['country'] in ('China',) and 'fr-2025-21671' not in e['sourceIds']:
        e['sourceIds'].insert(-1, 'fr-2025-21671')

CHANGE_DETAIL = {
    'section-338-canada-2026-08-22': (
        'Canada Section 338 duty takes effect on 14 Chapter 42 subheadings',
        '50% on listed products of Canada after a 3-day suspension lapsed. Chapter 42 is on the motor-vehicle list (9903.03.14): saddlery and '
        'dog gear (4201.00.30, 4201.00.60), plastic and man-made-fiber luggage (4202.12.21, .81, .89), cotton, man-made-fiber and other travel '
        'and sports bags (4202.92.15, .31, .97), musical instrument cases (4202.92.50), 4202.99.10 and .90, unlined leather gloves (4203.29.40), '
        'belts (4203.30.00) and other leather articles (4205.00.80). Unlike the Section 301 duty, it applies to USMCA-qualifying goods too '
        '(U.S. note 51(a)).',
    ),
    'section-301-2026-60-economies-2026-07-24': (
        'Section 301 tariffs on 60 economies cover all of Chapter 42',
        '10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). No Chapter 42 line is on the general exemption list (note 52(b)). '
        'EU goods pay 10% in total — nothing extra on lines already at 10% or more. Cambodia, Indonesia, India and Pakistan +10%; Vietnam, the '
        'Philippines and Thailand +12.5%. Jordanian travel goods and CAFTA-DR travel goods from Guatemala and El Salvador are exempt (note 52(j)). '
        'USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94).',
    ),
    'section-301-brazil-2026-07-22': (
        'Section 301 tariff on products of Brazil',
        '25% on all goods of Brazil (9903.05.01). No Chapter 42 line is on the Brazil exemption list (U.S. note 50(a)(ii)). From July 24 the '
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
    if c['id'] == 'base-rates':
        c['title'] = 'No Chapter 42 base-rate changes'
        c['detail'] = (
            'All 121 Chapter 42 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition, and no '
            'line was added, split or renumbered.'
        )
    if 'TODO' in c['detail']:
        raise SystemExit(f'unfilled change {c["id"]}')

EXTRA_CHANGES = [
    {
        'id': 'cn-301-continue',
        'type': 'reference',
        'date': '2026-10-07',
        'dateLabel': 'Published',
        'title': 'China Section 301 List 3 continues after the four-year review',
        'detail': 'USTR announced that the 2018 China Section 301 actions did not terminate on their 2026 anniversaries because domestic '
        'industries asked for them to continue. For Chapter 42 this keeps +25% (List 3) on luggage, handbags, wallets, backpacks, leather '
        'apparel, gloves, belts and saddlery.',
        'before': '+25%',
        'now': '+25%',
        'countries': 'China',
        'sourceIds': ['fr-2026-20510'],
    },
    {
        'id': 'ca-338-scope',
        'type': 'reference',
        'date': '2026-09-15',
        'dateLabel': 'Effective',
        'title': 'Canada Section 338 lists revised; Chapter 42 entries unchanged',
        'detail': 'Proclamations 11064 and 11065 added and removed provisions on the 9903.03.12 and 9903.03.14 lists. None of the added or removed '
        'provisions is in Chapter 42, and the September 29, 2026 Canadian import bans name no Chapter 42 product.',
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
        'id': 'usmca-review',
        'type': 'reference',
        'date': '2026-07-01',
        'dateLabel': 'Announced',
        'title': 'USMCA joint review: not renewed, still in force',
        'detail': 'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending '
        'resolution of the issues or until termination, so USMCA claims (SPI S) still remove the base rate and the Section 301 duty on Mexican '
        'and most Canadian leather goods.',
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
        'detail': '10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 42 subheading was on the product exemption list '
        '(9903.03.03). USMCA-qualifying goods from Canada and Mexico were exempt.',
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
        'Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting them for goods entered from '
        '12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.',
        'before': 'Varied by country',
        'now': 'None',
        'countries': 'All',
        'sourceIds': ['scotus-24-1287', 'eo-14389', 'csms-67834313'],
    },
    {
        'id': 'india-oil-end',
        'type': 'extraDuty',
        'date': '2026-02-07',
        'dateLabel': 'Effective',
        'title': "India's extra 25% IEEPA duty removed",
        'detail': 'Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) from February 7, 2026. The 25% '
        'reciprocal rate on India ended with the other IEEPA duties on February 24.',
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
        'detail': 'The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025. AGOA (SPI D) makes '
        'most dutiable Chapter 42 lines Free for eligible sub-Saharan countries — including leather and plastic luggage, leather handbags and '
        'wallets, and man-made-fiber backpacks and bags — though some cotton, silk, vegetable-fiber and other textile bag lines are left out. GSP (SPI A, A*) '
        'remains expired since December 31, 2020.',
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
        'detail': 'The program that let Nepal ship many travel goods, handbags and textile bags duty-free (SPI NP) ended after December 31, 2025, '
        'as the statute required. The NP code is still printed in the Special column, but no longer applies: Nepalese bags now pay the General '
        'rate. Nepal is not one of the 60 Section 301 economies.',
        'before': 'Free (NP)',
        'now': 'General rate',
        'countries': 'Nepal',
        'sourceIds': ['usc-4454', 'otexa-nepal', 'hts-now'],
    },
    {
        'id': 'cn-backpack-excl',
        'type': 'reference',
        'date': '2025-12-01',
        'dateLabel': 'Published',
        'title': 'China List 3 exclusion for backpacks extended to November 9, 2026',
        'detail': 'USTR extended 178 China Section 301 product exclusions, among them backpacks of man-made fibers 35–75 cm high, 19–34 cm wide '
        'and 5–26 cm deep (4202.92.31.20, U.S. note 20(vvv)(iii), 9903.88.69), through November 9, 2026. Matching backpacks skip the 25% List '
        '3 duty; other goods of the line pay it.',
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
        'id': 'india-oil',
        'type': 'extraDuty',
        'date': '2025-08-27',
        'dateLabel': 'Effective',
        'title': 'Extra 25% on products of India',
        'detail': 'Executive Order 14329 added 25% on Indian goods (9903.01.84), on top of the 25% reciprocal rate in force since August 7, 2025 '
        '(EO 14326): 50% in all on Indian leather goods, on top of the base rate. Ended February 7, 2026.',
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
        'detail': 'Executive Order 14326 set country rates for goods entered from August 7, 2025: Cambodia, Indonesia, Pakistan, the Philippines '
        'and Thailand +19%, Vietnam and Bangladesh +20%, India +25%, Myanmar +40%, the UK +10%. EU goods with a column 1 rate under 15% paid 15% '
        'in total (9903.02.20) — so Italian leather handbags paid 15%, while EU luggage and textile bags already at 16%–20% paid no extra. Ended '
        'February 24, 2026.',
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
        'detail': 'Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. A Chinese plastic '
        'suitcase then paid 20% + 25% (List 3) + 20% + 10% = 75% until November 9, 2025. Ended February 24, 2026.',
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
        'rates announced on April 2 for other countries (Cambodia 49%, Vietnam 46%), which never took effect. With the 20% fentanyl duty and the '
        '25% List 3 duty, a Chinese plastic suitcase (20% base) paid 190% until May 13, 2025.',
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
        'detail': '10% baseline (9903.01.25) from April 5, 2025, and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 42 product '
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
        'on top of the List 3 duty. Ended February 24, 2026.',
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
        'id': 'cn-list3-25',
        'type': 'extraDuty',
        'date': '2019-05-10',
        'dateLabel': 'Effective',
        'title': 'China List 3 duty raised to 25%',
        'detail': 'USTR raised the List 3 duty (9903.88.03) from 10% to 25%. List 3 covers every Chapter 42 subheading except the 4206 gut '
        'articles, and the rate has applied ever since.',
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
        'title': 'China Section 301 List 3 reaches luggage, handbags and leather goods',
        'detail': 'The third China Section 301 list put +10% on Chinese saddlery, travel goods, handbags, wallets, leather apparel, gloves, belts '
        'and other leather articles (headings 4201–4205).',
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
        'ustr-usmca-review',
        'scotus-24-1287',
        'eo-14389',
        'csms-67834313',
        'eo-14384',
        'ustr-agoa-2026',
        'crs-agoa',
        'procl-11030',
        'cbp-gsp',
        'usc-4454',
        'otexa-nepal',
        'eo-14357',
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
        'fr-2019-09681',
        'fr-2018-20610',
    ],
)

stats = [s for s in tu['stats'] if s['label'] != 'IEEPA duties']
stats.append({'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'})
tu['stats'] = stats

# ---------------------------------------------------------------------------------------------------
# Industry areas (matrix)
# ---------------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['h1'] = f'HTS Chapter 42: {SHORT} — Tariff Rates by Country'
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]

RULE_LABELS = {
    'Cambodia': 'Base rate + 10% Section 301 (9903.05.28). No Chapter 42 line is exempt. The 19% IEEPA duty ended February 24, 2026.',
    'China': 'Base rate + 12.5% Section 301 (9903.05.31) + 25% List 3 (9903.88.03) on every line except the 4206 gut articles. Backpacks matching '
    'the note 20(vvv)(iii) description (4202.92.31.20) skip the 25% through November 9, 2026.',
    'Vietnam': 'Base rate + 12.5% Section 301 (9903.05.84). No Chapter 42 line is exempt. The 20% IEEPA duty ended February 24, 2026.',
    'Indonesia': 'Base rate + 10% Section 301 (9903.05.45). No Chapter 42 line is exempt.',
    'India': 'Base rate + 10% Section 301 (9903.05.44). No Chapter 42 line is exempt. The IEEPA duties (up to 50%) ended in February 2026.',
    'Philippines': 'Base rate + 12.5% Section 301 (9903.05.64). No Chapter 42 line is exempt.',
    'Thailand': 'Base rate + 12.5% Section 301 (9903.05.77). No Chapter 42 line is exempt.',
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94). Otherwise base rate + 10% Section 301 (9903.05.55). The 25% IEEPA duty ended '
    'February 24, 2026.',
    'Canada': 'USMCA-qualifying: no Section 301 duty (9903.05.93); otherwise base rate + 10% (9903.05.29). On top, 50% Section 338 on 14 '
    'subheadings — saddlery and dog gear, plastic and man-made-fiber luggage, some travel bags, belts, unlined gloves and 4205.00.80 '
    '(9903.03.14) — whether or not USMCA is claimed.',
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81). No Chapter 42 line is on the UK exception list.',
    'Pakistan': 'Base rate + 10% Section 301 (9903.05.62). No Chapter 42 line is exempt.',
}
EU_LABEL = (
    'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39) — leather handbags, wallets, belts, jackets, '
    'saddlery. Lines at 10% or more (plastic and textile luggage and bags, leather gloves) pay only their base rate (9903.05.38). The '
    '15%-in-total IEEPA rate ended February 24, 2026.'
)


def rule_label(c):
    r = c['rule']
    name = c['country']
    if name in RULE_LABELS:
        return RULE_LABELS[name]
    if r.get('atLeast'):
        return (
            'Countries outside the 60 Section 301 economies (for example Myanmar, Nepal, Kenya) pay only the base rate. The 60 pay +10% or +12.5% '
            '(9903.05.20–9903.05.84), or 10% in total for Taiwan; China pays +37.5% and Brazil +37.5%. Jordan, and Guatemala and El Salvador '
            'under CAFTA-DR, are exempt on all 4202 travel goods (note 52(j)). Column 2 countries (Cuba, North Korea, Russia, Belarus) pay column 2 '
            'rates — 35% to 110%.'
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
add_sources(ia, ['eo-14389'])

ia['seo'] = {
    'title': 'Handbag & Luggage Tariffs by Country 2026 — China, Cambodia, Vietnam, Italy, France, India (HTS Ch. 42) | KoalaGains',
    'shortDescription': 'The total 2026 U.S. tariff on luggage, handbags, wallets, backpacks, leather apparel and saddlery by country: 10% for '
    'Italian and French leather handbags, 27.6%–30% for Cambodian bags and luggage, up to 57.5% for Chinese suitcases, 50% Section 338 on some '
    'Canadian goods.',
    'keywords': [
        'chapter 42 customs duty',
        'tariffs on handbags from china',
        'tariff on italian leather goods',
        'tariffs on french handbags',
        'cambodia travel goods tariff',
        'vietnam luggage customs duty',
        'tariff on leather goods from india to usa',
        'nepal trade preference program ntpp',
    ],
}
ia['intro'] = (
    'Chapter 42 has high base rates — up to 20% on luggage and bags — and an extra duty that **depends on where the goods come from**. Each cell '
    'below is the base rate for that product group plus the extra duty for that country, minus any preference — taken from the current tariff '
    'schedule.\n\n'
    'Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** that started July '
    '24, 2026: **+10% for Cambodia, Indonesia, India and Pakistan**, **+12.5% for Vietnam, the Philippines and Thailand**, and **10% in total for '
    'Italy, France, Spain and the rest of the EU** — which adds nothing to EU luggage or textile bags already at 16%–20%. **China adds 37.5%** '
    '(12.5% plus the 25% List 3 duty). USMCA-qualifying goods from Mexico pay nothing; from Canada they pay nothing except on the **14 '
    'subheadings with the 50% Section 338 duty**, which no USMCA claim removes.'
)
assumptions = [a for a in ia['assumptions'] if 'TODO' not in a]
assumptions += [
    'Canada, "USMCA-qualifying" side: the Section 301 duty is removed (9903.05.93), but the 50% Section 338 duty stays on the 14 listed '
    'subheadings because U.S. note 51(a) applies it even when a special rate is claimed.',
    'The compound rate on 4202.32.10 (12.1¢/kg + 4.6%) is compared at the $10,000 / 1,000 kg test shipment ($10 per kg) for the EU "in total" '
    'rule, so it counts as 5.81%.',
    'Not in the cells: the China List 3 exclusion for backpacks of the size in note 20(vvv)(iii) (it needs the importer\'s confirmation); the '
    'note 52(j) exemptions for Jordan and for CAFTA-DR travel goods from Guatemala and El Salvador (those countries are in "Any other country"); '
    'AGOA, CBTPA and FTA preferences; and FWS, CITES or CPSC costs. No antidumping or countervailing duty order covers a Chapter 42 product.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied.',
]
ia['assumptions'] = assumptions
ia['exemptionCheck'] = (
    'Read U.S. notes 16, 19, 20, 30, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 general exemption list '
    '(note 52(b), 9903.05.86) has no Chapter 42 line. The country exception lists in note 52(j) cover every 4202 subheading for Jordan '
    '(9903.06.20), and for Guatemala (9903.06.06) and El Salvador (9903.06.09) when entered under CAFTA-DR; the Cambodia, EU, UK and other lists '
    'name no Chapter 42 line. The Brazil list (note 50(a)(ii)) has no Chapter 42 line. The Canada Section 338 list (note 51(b)(3)) names 14 '
    'Chapter 42 subheadings; the alcoholic-beverage and dairy lists and the September 29, 2026 import bans name none. China: List 3 (note '
    '20(f)) covers every 4201–4205 subheading; heading 4206 is on no China list; the only exclusion in effect (note 20(vvv)(iii)(29)) covers '
    'certain backpacks of 4202.92.31.20, through November 9, 2026 — the older List 3 exclusions printed in note 20 have expired. Section 232: '
    'no Chapter 42 line is on the note 16 or note 19 metal lists. Note 30(b) sets 35% for Russian 4202.29.20 and 4203.29.50 in place of column '
    '2. The 1999 EU retaliation headings 9903.08.07 and 9903.08.08 (plastic-sheeting handbags 4202.22.15 and 4202.32.10) are printed but no '
    'longer in effect. A Federal Register search of Commerce (ITA) notices since 2015 found no antidumping or countervailing duty order on a '
    'Chapter 42 subheading.'
)

# ---------------------------------------------------------------------------------------------------
# Understand industry
# ---------------------------------------------------------------------------------------------------
ui['h1'] = f'HTS Chapter 42: {SHORT} — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Luggage, Handbag & Leather Goods Imports by Country — HTS Chapter 42 Trade Statistics | KoalaGains',
    'shortDescription': f'U.S. imports of HTS Chapter 42 goods: {fmt_usd(total)} in {Y}. Who supplies luggage, handbags, backpacks, wallets, '
    'leather apparel and saddlery — Cambodia, China, Vietnam, Italy, France, Indonesia, India — with values by product and year from UN Comtrade.',
    'keywords': [
        'hts chapter 42',
        'hts chapter 42 tariff updates',
        'us handbag imports by country',
        'us luggage imports by country',
        'section 301 tariffs on hts 4202.21.90 leather handbags',
        'us import duty on hts 4201.00 saddlery',
        'leather goods imports cambodia',
        'italian leather goods imports us',
    ],
}
ui['byYearCaption'] = (
    'U.S. imports of Chapter 42 goods each year, split into the two largest 2025 suppliers (Cambodia and China) and everyone else.'
)
ui['why'] = (
    f'U.S. imports of Chapter 42 goods were **{fmt_usd(total)} in {Y}**, {abs(round((total / prior_total - 1) * 100, 1))}% less than the '
    f'{fmt_usd(prior_total)} of {PY} and well below the {fmt_usd(year_tot[2022])} peak of 2022. Heading 4202 — luggage, handbags, wallets, '
    f'backpacks and other cases — made up {round(h4202 / total * 100)}% of it ({fmt_usd(h4202)}); the largest single product was **other bags and '
    f'cases with a plastic or textile surface (4202.92)**, {fmt_usd(by_line["4202.92"]["importsUsd"])}, followed by **leather handbags (4202.21)**, '
    f'{fmt_usd(by_line["4202.21"]["importsUsd"])}.\n\n'
    f'The supplier map moved away from China. **China** fell {abs(chg("China"))}% to {fmt_usd(imp("China"))}, from {fmt_usd(imp_year("China", 2020))} '
    f'in 2020. **Cambodia** grew {chg("Cambodia")}% to {fmt_usd(imp("Cambodia"))} and became the largest supplier — more than double its 2020 '
    f'level — and **Vietnam** ({fmt_usd(imp("Viet Nam"))}, +{chg("Viet Nam")}%), **Indonesia** ({fmt_usd(imp("Indonesia"))}, +{chg("Indonesia")}%) '
    f'and **Thailand** ({fmt_usd(imp("Thailand"))}, from {fmt_usd(imp_year("Thailand", 2020))} in 2020) kept growing. **Italy** '
    f'({fmt_usd(imp("Italy"))}) and **France** ({fmt_usd(imp("France"))}) supply mainly leather handbags and luxury goods. India '
    f'({fmt_usd(imp("India"))}) and Pakistan ({fmt_usd(imp("Pakistan"))}) are strongest in leather apparel and gloves (heading 4203, '
    f'{fmt_usd(h4203)} in all).\n\n'
    f'Mexico ({fmt_usd(imp("Mexico"))}) and Canada ({fmt_usd(imp("Canada"))}) supplied {round((imp("Canada") + imp("Mexico")) / total * 100)}% '
    f'of {Y} imports. The figures are annual and stop at {Y}, before the 2026 tariff changes (the end of the IEEPA duties in February, the '
    'Section 301 tariffs from July 24, 2026 and the Canada Section 338 duties from August 22); they do not show what those changes did. '
    'Duty-collected figures are not available from an official source yet.'
)
ui['effectiveDuty']['note'] = 'Duty-collected figures aren’t available from an official source yet.'
ui['effectiveDuty']['dutyPaidUsd'] = None
ui['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar years 2020–{Y}. '
    '"Other Asia, nes" is how UN Comtrade reports Taiwan.'
)

# ---------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['h1'] = f'HTS Chapter 42: {SHORT} — Import Documents & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing Handbags, Luggage & Leather Goods into the U.S.: FWS/CITES Exotic Leather Rules, Marking & Legal Ways to Lower Duty '
    '(HTS Ch. 42) | KoalaGains',
    'shortDescription': 'What each HTS Chapter 42 line needs at U.S. entry — FWS declaration and CITES permits for python, crocodile and other '
    'exotic leathers, country-of-origin marking, FTC leather labeling, CPSC rules for children\'s bags — and the legal ways to pay less: '
    'outer-surface classification, origin, USMCA, AGOA and CAFTA-DR, first sale, drawback, FTZ and rulings.',
    'keywords': [
        'first-sale-for-export valuation',
        'usmca tariff shift for travel goods',
        'italian luxury handbag import duty',
        'handbag outer surface classification',
        'exotic leather import cites',
        'fish and wildlife declaration form 3-177',
        'country of origin marking handbags',
        'cbp tariff engineering',
    ],
}
te['intro'] = (
    'Most Chapter 42 goods need no license — but **anything made from a wild species** (python, crocodile, alligator, ostrich, stingray and other '
    'exotic leathers) is wildlife under U.S. law: it must enter through a designated port, be declared to the **Fish and Wildlife Service** on '
    'Form 3-177 and cleared before CBP releases it, and, for CITES-listed species, travel with CITES permits. Leather from cattle, sheep, goats '
    'and other domesticated animals is exempt. Every article must be **marked with its country of origin**, and the FTC Leather Guides govern '
    'what may be called "leather".\n\n'
    'On cost, base rates of up to 20% and an extra duty by country leave real room: the **outer surface** decides the rate (a leather handbag '
    'pays 9%, a PU one 16%, a polyester one 17.6%), the **country of origin** decides the extra duty (+10% Cambodia, +37.5% China), and USMCA, '
    'AGOA, CAFTA-DR, first-sale valuation, drawback and foreign-trade zones lower the bill further. Each lever depends on a document, listed '
    'below with its regulation.'
)
te['regulationsAsOf'] = '2026-10-08'
te['levers'] = [
    {
        'id': 'surface',
        'title': 'Classify by the outer surface — and the value break on leather handbags',
        'saves': 'The gap between outer-surface rates: a handbag pays 9%–10% in leather, 16% in plastic sheeting (PU, PVC), 17.6% in polyester or '
        'nylon and 6.3% in cotton; luggage pays 8% in leather and 20% in plastics',
        'appliesTo': 'Heading 4202 — luggage, handbags, wallets, backpacks and cases',
        'document': 'Product specifications showing the material that makes up the exterior surface, including how coated or laminated fabrics '
        'are built.',
        'caveat': 'The outer surface is what the classification follows; a coated textile counts as textile or plastic depending on which makes '
        'up the exterior (additional U.S. note 2). Leather handbags valued not over $20 pay 10%, over $20 9%. Design and material are commercial '
        'choices — the declared classification must match the goods, and a ruling settles doubtful cases.',
        'citations': [
            {'label': 'HTSUS Chapter 42, additional U.S. notes 1–2', 'url': CH42_PDF},
            {'label': '19 CFR part 177 (rulings)', 'url': ecfr_part(19, 177)},
        ],
    },
    {
        'id': 'origin',
        'title': 'Know the country of origin — and where a bag gets it',
        'saves': 'The difference between country rates: +10% for Cambodia or India, +12.5% for Vietnam, 10% in total for the EU, +37.5% for China',
        'appliesTo': 'All lines; the gap is widest on luggage and bags from China',
        'document': 'Production records showing where the article was made: for textile bags (4202.12.40–.89, 4202.22.40–.89, 4202.32.40–.99, '
        '4202.92.04–.08, .15–.33, .60–.97) where it was wholly assembled; for leather and other bags, where it was last substantially '
        'transformed.',
        'caveat': 'Cutting in one country and sewing in another, or only adding trim, labels or packaging, may not move the origin. The Section '
        '301 and 338 duties follow the country of origin, and CBP can ask for proof.',
        'citations': [
            {'label': '19 CFR 102.21 (textile and apparel origin, incl. 4202 textile bags)', 'url': ecfr(19, '102.21')},
            {'label': '19 CFR 134.1 (country of origin)', 'url': ecfr(19, '134.1')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 51, 52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'usmca',
        'title': 'Claim USMCA on goods from Mexico or Canada',
        'saves': 'The base rate (up to 20%) plus the 10% Section 301 duty',
        'appliesTo': 'All lines from Mexico; from Canada, the lines not on the Section 338 list (leather luggage and handbags, wallets, textile '
        'handbags, leather apparel and most gloves)',
        'document': 'A certification of origin from the importer, exporter or producer, kept ready for CBP.',
        'caveat': 'USMCA does not remove the 50% Section 338 duty on the 14 Canadian subheadings in U.S. note 51(b)(3). The good must meet the '
        'Chapter 42 rule of origin in General Note 11 for its subheading. The USMCA was not renewed at the July 1, 2026 joint review but remains '
        'in force.',
        'citations': [
            {'label': '19 CFR 182.12', 'url': ecfr(19, '182.12')},
            {'label': 'HTSUS General Note 11 (USMCA rules of origin)', 'url': GN_PDF},
            {'label': 'HTSUS 9903.05.93 / 9903.05.94, U.S. notes 51–52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'fta',
        'title': 'Claim AGOA, CAFTA-DR, CBTPA or another FTA',
        'saves': 'The base rate, and for CAFTA-DR travel goods from Guatemala or El Salvador — and all Jordanian travel goods — the Section 301 duty '
        'too',
        'appliesTo': 'Dutiable lines whose Special column lists the program: AGOA (D), CAFTA-DR (P), CBTPA (R, Haiti and other Caribbean '
        'beneficiaries, in force through September 30, 2030), Jordan (JO), Korea (KR) and the other FTA partners',
        'document': 'The origin proof each program requires (a certification or declaration of origin, or the AGOA/CBTPA documentation) and '
        'records to back it up.',
        'caveat': 'An FTA removes the base rate but, except where a note 52(j) list says otherwise, not the 2026 Section 301 duty (U.S. note 52(a)). '
        'AGOA (D) runs to December 31, 2026 and leaves out some cotton, silk, vegetable-fiber and other textile bag lines. GSP (A, A*) has been expired since '
        'December 31, 2020 and the Nepal program (NP) since December 31, 2025, although both codes are still printed.',
        'citations': [
            {'label': 'HTSUS General Notes 3(c) and 8–34', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a), (j)', 'url': CH99_PDF},
            {'label': '19 CFR 10.178a (AGOA)', 'url': ecfr(19, '10.178a')},
            {'label': '19 U.S.C. 2703 (CBTPA, through September 30, 2030)', 'url': USC_2703},
            {'label': '19 U.S.C. 4454(f) (Nepal program ended December 31, 2025)', 'url': USC_4454},
        ],
    },
    {
        'id': 'cn-exclusion',
        'title': 'Use the China List 3 exclusion for qualifying backpacks',
        'saves': 'The 25% List 3 duty on Chinese backpacks of man-made fibers that match the exclusion description',
        'appliesTo': '4202.92.31.20 — backpacks with an outer surface of man-made fibers, 35–75 cm high, 19–34 cm wide and 5–26 cm deep',
        'document': 'Product dimensions and materials showing the backpack matches the description; report 9903.88.69 instead of 9903.88.03.',
        'caveat': 'In effect through November 9, 2026 unless USTR extends it again. The 12.5% 2026 Section 301 duty (9903.05.31) still applies.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 20(vvv)(iii), 9903.88.69', 'url': CH99_PDF},
            {
                'label': '90 FR 55232 (exclusions extended to November 9, 2026)',
                'url': 'https://www.federalregister.gov/documents/2025/12/01/2025-21671/notice-of-product-exclusion-extensions-chinas-acts-policies-and-practices-related-to-technology',
            },
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
        'id': 'drawback',
        'title': 'Recover duty on goods you export or destroy',
        'saves': 'Up to 99% of the duties paid, when the imported goods (or goods made from them) are exported or destroyed',
        'appliesTo': 'Any line — for example handbags or luggage re-exported to Canadian or Latin American stores',
        'document': 'A drawback claim to CBP with import, manufacturing and export records.',
        'caveat': 'Claims have filing deadlines and record-keeping rules; check whether a given Chapter 99 duty is eligible before relying on it.',
        'citations': [{'label': '19 CFR part 190', 'url': ecfr_part(19, 190)}],
    },
    {
        'id': 'ftz',
        'title': 'Hold, kit or relabel goods in a foreign-trade zone',
        'saves': 'No duty on goods re-exported from the zone, and duty deferred until goods leave it for the U.S. market',
        'appliesTo': 'Any line — useful for luggage and handbags distributed to several countries',
        'document': 'Zone admission (CBP Form 214) and the zone operator\'s inventory records.',
        'caveat': 'Goods entered for U.S. consumption from a zone pay the duties in force on the entry date; wildlife rules still apply.',
        'citations': [{'label': '19 CFR part 146', 'url': ecfr_part(19, 146)}],
    },
    {
        'id': 'ch98',
        'title': 'Use a Chapter 98 provision for U.S. goods coming back',
        'saves': 'All duty on U.S.-made goods returned unchanged (9801.00.10), for example unsold stock sent back by a foreign distributor',
        'appliesTo': 'Any line, for American goods returned without having been advanced in value or improved abroad',
        'document': 'Proof of U.S. origin and of the export, as CBP requires for the provision.',
        'caveat': 'The Section 301 and 338 duties also do not apply to goods properly entered under Chapter 98, except subchapter XXIII and '
        '9802.00.40–9802.00.80 (U.S. notes 51(a) and 52(a)).',
        'citations': [
            {'label': 'HTSUS Chapter 98, 9801.00.10', 'url': CH98_PDF},
            {'label': '19 CFR 10.1', 'url': ecfr(19, '10.1')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 51(a), 52(a)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding classification ruling',
        'saves': 'Certainty where the line decides the rate and the extra duty: handbag (4202.2x) versus pocket article (4202.3x) or travel bag '
        '(4202.92); coated fabric counted as textile or plastic; a bag on or off the Canada Section 338 list',
        'appliesTo': 'Any line where the material, construction or use decides the line',
        'document': 'A ruling request to CBP describing the article, its outer surface, dimensions and use.',
        'caveat': 'Rulings apply to the transaction described; a changed design or material may need a new one.',
        'citations': [
            {'label': '19 CFR part 177', 'url': ecfr_part(19, 177)},
            {'label': 'HTSUS Chapter 42 notes', 'url': CH42_PDF},
        ],
    },
]

te['rules'] = [
    {
        'id': 'fws-declaration',
        'agency': 'U.S. Fish & Wildlife Service',
        'title': 'Wildlife products — exotic leathers such as python, crocodile, alligator, lizard, ostrich or stingray — must enter at a '
        'designated port, be declared on Form 3-177 and be cleared by FWS before CBP releases them. Domesticated animals (cattle, sheep, goats, '
        'pigs and others listed in 50 CFR 14.4) are exempt',
        'citations': [
            {'label': '50 CFR 14.4 (domesticated animals)', 'url': ecfr(50, '14.4')},
            {'label': '50 CFR 14.11–14.12 (designated ports)', 'url': ecfr(50, '14.12')},
            {'label': '50 CFR 14.52 (clearance)', 'url': ecfr(50, '14.52')},
            {'label': '50 CFR 14.61 (Form 3-177)', 'url': ecfr(50, '14.61')},
        ],
    },
    {
        'id': 'fws-license',
        'agency': 'U.S. Fish & Wildlife Service',
        'title': 'A business importing wildlife products for sale needs an FWS import/export license',
        'citations': [
            {'label': '50 CFR 14.91', 'url': ecfr(50, '14.91')},
            {'label': '50 CFR 14.92 (exemptions)', 'url': ecfr(50, '14.92')},
        ],
    },
    {
        'id': 'cites',
        'agency': 'U.S. Fish & Wildlife Service (CITES)',
        'title': 'Products of CITES-listed species need the CITES documents for their appendix — an export permit or re-export certificate, and an '
        'import permit for Appendix I species; crocodilian skins and products follow added tagging and labeling rules, and American alligator '
        'products have their own rules',
        'citations': [
            {'label': '50 CFR 23.13', 'url': ecfr(50, '23.13')},
            {'label': '50 CFR 23.20', 'url': ecfr(50, '23.20')},
            {'label': '50 CFR 23.35–23.36', 'url': ecfr(50, '23.35')},
            {'label': '50 CFR 23.70 (crocodilian products)', 'url': ecfr(50, '23.70')},
            {'label': '50 CFR 17.42(a) (American alligator)', 'url': ecfr(50, '17.42')},
        ],
    },
    {
        'id': 'cbp-marking',
        'agency': 'CBP',
        'title': 'Country-of-origin marking in English, legible, indelible and permanent enough to reach the ultimate purchaser — on the bag, '
        'wallet, belt or glove itself or its retail container; a U.S. place name on the article requires the origin marking near it',
        'citations': [
            {'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')},
            {'label': '19 CFR 134.41', 'url': ecfr(19, '134.41')},
            {'label': '19 CFR 134.46', 'url': ecfr(19, '134.46')},
        ],
    },
    {
        'id': 'cbp-textile-origin',
        'agency': 'CBP',
        'title': 'Textile travel goods and bags (4202.12.40–.89, 4202.22.40–.89, 4202.32.40–.99, 4202.92.04–.08, .15–.33, .60–.97) are "textile '
        'products": their origin is the country where they were wholly assembled',
        'citations': [{'label': '19 CFR 102.21', 'url': ecfr(19, '102.21')}],
    },
    {
        'id': 'ftc-leather',
        'agency': 'FTC',
        'title': 'Leather Guides: luggage, handbags, wallets, belts and similar articles may not be called "leather" unless made in all '
        'substantial parts of leather; imitation, bonded, split or embossed leather must be disclosed',
        'citations': [
            {'label': '16 CFR 24.0', 'url': ecfr(16, '24.0')},
            {'label': '16 CFR 24.2', 'url': ecfr(16, '24.2')},
        ],
    },
    {
        'id': 'cpsc-children',
        'agency': 'CPSC',
        'title': 'Backpacks, bags and cases designed or intended primarily for children 12 or younger are children\'s products: lead limits for '
        'paint and coatings, third-party testing and a Children\'s Product Certificate',
        'citations': [
            {'label': '16 CFR part 1110 (certificates)', 'url': ecfr_part(16, 1110)},
            {'label': '16 CFR part 1303 (lead paint)', 'url': ecfr_part(16, 1303)},
        ],
    },
    {
        'id': 'fda-suture',
        'agency': 'FDA',
        'title': 'Catgut imported to make sterile surgical sutures (4206.00.13): the finished absorbable gut suture is an FDA-regulated medical '
        'device',
        'citations': [{'label': '21 CFR 878.4830', 'url': ecfr(21, '878.4830')}],
    },
    {
        'id': 'cbp-ch99',
        'agency': 'CBP',
        'title': 'Report the Chapter 99 headings with the line: the 2026 Section 301 heading for the country (or its note 52(j) exemption), China '
        'List 3 (9903.88.03) or its exclusion (9903.88.69), Brazil (9903.05.01), Canada Section 338 (9903.03.14)',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 30, 50–52', 'url': CH99_PDF},
            {'label': 'CBP CSMS # 69606660 (Section 338 guidance)', 'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/4261d04'},
        ],
    },
]

LEATHER_LINES_4202 = {'4202.11.00', '4202.21.30', '4202.21.60', '4202.21.90', '4202.31.30', '4202.31.60', '4202.91.10', '4202.91.90'}
TEXTILE_RANGES = [
    ('4202.12.40', '4202.12.89'),
    ('4202.22.40', '4202.22.89'),
    ('4202.32.40', '4202.32.99'),
    ('4202.92.04', '4202.92.08'),
    ('4202.92.15', '4202.92.33'),
    ('4202.92.60', '4202.92.97'),
]
CHILD_PREFIX = ('4202.11', '4202.12', '4202.92.15', '4202.92.20', '4202.92.31', '4202.92.33', '4202.92.39', '4202.92.45')


def is_textile(sub):
    return any(a <= sub <= b for a, b in TEXTILE_RANGES)


GROUP_RULES = {
    '4201': ['cbp-marking', 'cbp-ch99'],
    '4202': ['fws-declaration', 'fws-license', 'cites', 'cbp-marking', 'cbp-textile-origin', 'ftc-leather', 'cpsc-children', 'cbp-ch99'],
    '4203': ['fws-declaration', 'fws-license', 'cites', 'cbp-marking', 'ftc-leather', 'cbp-ch99'],
    '4205': ['fws-declaration', 'fws-license', 'cites', 'cbp-marking', 'cbp-ch99'],
    '4206': ['fda-suture', 'cbp-marking', 'cbp-ch99'],
}
GROUP_NOTES = {
    '4201': 'No agency license for saddlery or dog gear of cattle leather, textiles or plastics. Both lines from Canada pay the 50% Section 338 '
    'duty even under USMCA.',
    '4202': 'Bags of exotic leather (reptile lines 4202.21.30 and 4202.31.30, and any leather from a wild species) need FWS clearance and, for '
    'CITES species, permits. Textile bags take their origin from where they are wholly assembled. The outer surface decides the line and '
    'rate: 8%–10% for leather, 16%–20% for plastics, 17.6% for man-made fibers.',
    '4203': 'Reptile-leather apparel and accessories (4203.10.20, 4203.40.30) are wildlife products. Leather gloves carry the chapter\'s other '
    'high rates (12.6%–14%); 4203.29.40 gloves and 4203.30.00 belts from Canada pay the 50% Section 338 duty.',
    '4205': 'Reptile-leather articles (4205.00.60) are wildlife products. 4205.00.80 from Canada pays the 50% Section 338 duty.',
    '4206': 'Sterile surgical catgut is not here (heading 3006). Gut articles are on no China Section 301 list, so Chinese goods pay only the '
    '12.5% 2026 duty.',
}
for g in te['groups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['ruleIds'] = GROUP_RULES[g['heading']]
    g['note'] = GROUP_NOTES[g['heading']]

REPTILE = {'4202.21.30', '4202.31.30', '4203.10.20', '4203.40.30', '4205.00.60'}
for ln in te['lines']:
    sub = ln['hts'][:10]
    h = sub[:4]
    rules = []
    if h == '4202':
        if sub in LEATHER_LINES_4202:
            rules += ['fws-declaration', 'fws-license', 'cites', 'ftc-leather']
        if is_textile(sub):
            rules.append('cbp-textile-origin')
        if sub.startswith(CHILD_PREFIX):
            rules.append('cpsc-children')
    elif h == '4203':
        rules += ['fws-declaration', 'fws-license', 'cites']
        if sub in ('4203.30.00', '4203.40.30', '4203.40.60'):
            rules.append('ftc-leather')
    elif h == '4205':
        rules += ['fws-declaration', 'fws-license', 'cites']
    elif h == '4206' and sub == '4206.00.13':
        rules.append('fda-suture')
    rules += ['cbp-marking', 'cbp-ch99']
    ln['ruleIds'] = rules
    gen = ln.get('general')
    if gen is None:
        row = next(r for r in ov['rateTable']['rows'] if r['hts'] == ln['hts'])
        gen = row['effectiveGeneral']
    dutiable = bool(gen and gen != 'Free')
    levers = []
    if h == '4202':
        levers.append('surface')
    levers += ['origin', 'usmca']
    if dutiable:
        levers.append('fta')
    if ln['hts'] == '4202.92.31.20':
        levers.append('cn-exclusion')
    levers += ['first-sale', 'drawback', 'ftz', 'ch98', 'ruling']
    ln['leverIds'] = levers

te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations and the tariff schedule — not legal advice. Whether a leather comes from '
    'a protected species, which line a bag falls in and which Chapter 99 duties apply depend on the facts of each shipment, and the extra '
    'duties change by Federal Register notice and CBP guidance; confirm the current headings and the FWS requirements before each shipment.'
)

# ---------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['h1'] = f'HTS Chapter 42: {SHORT} — Tariff FAQ'
fc['seo'] = {
    'title': 'Handbag, Luggage & Leather Goods Tariff FAQ: China, Italy, France, India, Cambodia, Vietnam, HS Codes (HTS Ch. 42) | KoalaGains',
    'shortDescription': 'Answers to what people search about U.S. tariffs on handbags, luggage and leather goods: luxury and designer bags from '
    'Italy and France, handbags and suitcases from China, leather goods from India, Cambodia and Vietnam rates, and the HS codes for handbags, '
    'luggage, backpacks, wallets, belts, gloves and dog leashes.',
    'keywords': [
        'tariffs on handbags',
        'tariffs on luxury bags',
        'tariffs on leather goods from china',
        'tariff on leather goods from india to usa',
        'import duty on luggage',
        'cambodia tariffs',
        'hs code for handbags',
        'hs code for luggage',
        'hs code for backpack',
        'hs code for wallet',
        'hs code for leather belt',
        'hs code for dog leash',
    ],
}
fc['intro'] = (
    'Straight answers to the most common questions about U.S. tariffs and import rules for handbags, luggage, backpacks, wallets and other '
    'leather goods. Each answer links to the page with the full detail.'
)
fc['keyTakeaways'] = [
    '112 of the 121 Chapter 42 lines carry a base duty, and travel goods are among the highest-rated consumer goods: 20% for plastic luggage, '
    '17.6% for polyester or nylon bags and backpacks, 16% for PU handbags, 9%–10% for leather handbags.',
    'Since July 24, 2026 a Section 301 duty is added by country: +10% for Cambodia, Indonesia, India and Pakistan, +12.5% for Vietnam, the '
    'Philippines and Thailand, and 10% in total for the EU — nothing extra on EU goods already at 10% or more.',
    'China pays the most: +12.5% plus +25% (List 3) on every line except gut articles — 57.5% on plastic suitcases, 55.1% on polyester backpacks.',
    'USMCA-qualifying goods from Mexico pay nothing. From Canada, 14 subheadings — saddlery and dog gear, plastic and textile luggage, some '
    'travel bags, belts — pay a 50% Section 338 duty even under USMCA.',
    'The IEEPA duties (up to 190% on Chinese luggage in spring 2025, 19%–20% on Cambodia and Vietnam from August 2025) ended February 24, 2026; '
    'the 10% Section 122 surcharge ended July 23, 2026. GSP and the Nepal program have expired; AGOA runs to December 31, 2026.',
    'Exotic leathers (python, crocodile, ostrich) need Fish and Wildlife Service clearance and, for CITES species, permits; every article must '
    'be marked with its country of origin.',
]
fc['questionSource'] = 'Google search suggestions (U.S. English), collected October 12, 2026'

cn, kh, vn, it, fr, inn = (by_c_all[n] for n in ('China', 'Cambodia', 'Viet Nam', 'Italy', 'France', 'India'))
fc['faqs'] = [
    {
        'id': 'handbag-tariffs',
        'question': 'Are there tariffs on handbags imported into the U.S.?',
        'searchedAs': [
            'tariffs on handbags',
            'are there tariffs on handbags',
            'tariffs on handbags from japan',
            'import duty on handbags',
            'customs duty on handbags',
        ],
        'answer': 'Yes. The base rate depends on the outer surface: leather handbags pay 9% (over $20) or 10%, reptile leather 5.3%, plastic '
        'sheeting such as PU or PVC 16%, man-made fibers 17.6%, cotton 6.3%. Since July 24, 2026 a Section 301 duty is added by country: Italy, '
        'France and the rest of the EU 10% in total, Japan 12.5% in total (so a Japanese leather handbag pays 12.5%), Cambodia and India +10%, '
        'Vietnam +12.5%, China +37.5%. USMCA-qualifying handbags from Mexico or Canada pay nothing.',
        'link': 'industry-areas',
    },
    {
        'id': 'luxury-bags',
        'question': 'What is the tariff on luxury and designer bags from Italy and France?',
        'searchedAs': [
            'tariffs on luxury bags',
            'tariffs on designer bags',
            'customs duty on luxury bags',
            'tariffs on french handbags',
            'tariff on italian leather goods',
            'tariff on italian leather',
        ],
        'answer': 'A leather handbag, wallet or belt from Italy or France pays 10% of its customs value in total since July 24, 2026 (9903.05.39) '
        '— $500 on a $5,000 bag — instead of 15% between August 2025 and February 24, 2026 and 9% before 2025. Bags with a base rate of 10% or '
        'more, such as nylon or PU handbags and textile or plastic luggage, pay only that base rate. Italy supplied '
        f'{fmt_usd(it["importsUsd"])} and France {fmt_usd(fr["importsUsd"])} of Chapter 42 goods in {Y}. A bag of python or crocodile also '
        'needs CITES documents and an FWS declaration.',
        'link': 'industry-areas',
    },
    {
        'id': 'china-leather',
        'question': 'What are the tariffs on handbags and leather goods from China?',
        'searchedAs': ['tariffs on leather goods from china', 'tariffs on handbags from china', 'import duty on bags from china'],
        'answer': 'Chinese Chapter 42 goods pay the base rate plus 12.5% (2026 Section 301, 9903.05.31) plus 25% (List 3, 9903.88.03): 46.5% on a '
        'leather handbag over $20, 53.5% on a PU handbag, 55.1% on a polyester backpack or handbag, 45.5% on a leather wallet, 40.2% on a leather '
        'belt. Backpacks matching the size description of the note 20(vvv)(iii) exclusion skip the 25% through November 9, 2026. China '
        f'supplied {fmt_usd(cn["importsUsd"])} in {Y}, {abs(chg("China"))}% less than in {PY}.',
        'link': 'industry-areas',
    },
    {
        'id': 'luggage',
        'question': 'What is the import duty on luggage and suitcases?',
        'searchedAs': ['luggage tariffs', 'import duty on luggage', 'import duty on luggage from china', 'import duty on suitcases'],
        'answer': 'Suitcases and trunks with an outer surface of plastics (hard-shell luggage) pay 20%, of man-made fibers 17.6%, of leather 8%. '
        'Add the extra duty by country: 57.5% in total for a Chinese hard-shell suitcase, 30% from Cambodia, India or Indonesia, 32.5% from '
        'Vietnam or Thailand, 20% from the EU (nothing is added at 10% or more). Plastic and man-made-fiber luggage from Canada also pays 50% '
        'Section 338, even under USMCA.',
        'link': 'industry-areas',
    },
    {
        'id': 'india',
        'question': 'What is the tariff on leather goods from India to the USA?',
        'searchedAs': ['tariff on leather goods from india to usa', 'tariff on leather goods from india', 'us tariffs on leather goods'],
        'answer': 'Base rate plus 10% Section 301 (9903.05.44) since July 24, 2026: 19% for a leather handbag over $20, 16% for a leather jacket, '
        '12.7% for a belt, 12.8% for a saddle, 22.6%–24% for leather gloves. The IEEPA duties on India — 50% from August 27, 2025 — ended in '
        f'February 2026. India supplied {fmt_usd(inn["importsUsd"])} of Chapter 42 goods in {Y}.',
        'link': 'industry-areas',
    },
    {
        'id': 'cambodia',
        'question': 'What are the U.S. tariffs on bags and luggage from Cambodia?',
        'searchedAs': ['cambodia tariffs', 'cambodia tariffs to us', 'cambodia tariffs rate', 'cambodia reciprocal tariffs', 'current cambodia tariffs'],
        'answer': 'Since July 24, 2026 Cambodian goods pay the base rate plus 10% Section 301 (9903.05.28): 27.6% for a polyester backpack or '
        'handbag, 30% for a plastic suitcase, 19% for a leather handbag. The 19% IEEPA reciprocal tariff (from August 7, 2025) ended February 24, '
        f'2026, and the 49% rate announced in April 2025 never took effect. Cambodia was the largest Chapter 42 supplier in {Y} '
        f'({fmt_usd(kh["importsUsd"])}).',
        'link': 'industry-areas',
    },
    {
        'id': 'vietnam',
        'question': 'What are the U.S. tariffs on bags and luggage from Vietnam?',
        'searchedAs': ['tariffs on vietnam', 'tariffs on vietnam products', 'tariffs on vietnam goods', 'tariffs on vietnam right now'],
        'answer': 'Base rate plus 12.5% Section 301 (9903.05.84) since July 24, 2026: 30.1% for a polyester backpack or handbag, 32.5% for a '
        'plastic suitcase, 20.5% for a leather wallet. The 20% IEEPA reciprocal tariff (August 7, 2025 to February 24, 2026) has ended. Vietnam '
        f'supplied {fmt_usd(vn["importsUsd"])} of Chapter 42 goods in {Y}.',
        'link': 'industry-areas',
    },
    {
        'id': 'hs-handbags',
        'question': 'What is the HS code for handbags and purses?',
        'searchedAs': [
            'hs code for handbags',
            'handbag hs code',
            'handbag tariff code',
            'hs code for handbags of leather',
            'hs code for pu handbags',
            'hs code for purse',
            'hs code for tote bag',
        ],
        'answer': 'Handbags are 4202.21 (outer surface of leather), 4202.22 (plastic sheeting or textile) and 4202.29 (other). In the U.S. '
        'schedule: leather handbags 4202.21.60.00 (valued not over $20, 10%) or 4202.21.90.00 (over $20, 9%), reptile leather 4202.21.30.00 '
        '(5.3%), PU or PVC 4202.22.15.00 (16%), polyester or nylon 4202.22.81.00 (17.6%), cotton 4202.22.45.00 (6.3%). Small purses and wallets '
        'carried in a handbag are 4202.31 or 4202.32; tote bags are classed as handbags or shopping bags by design and surface.',
        'link': '',
    },
    {
        'id': 'hs-luggage',
        'question': 'What is the HS code for luggage and suitcases?',
        'searchedAs': ['hs code for luggage', 'hs code for suitcase', 'hs code for luggage bag', 'hs code for pvc suitcase', 'hs code for leather suitcase'],
        'answer': 'Suitcases, trunks and similar containers are 4202.11 (leather, 4202.11.00, 8%), 4202.12 (plastics: 4202.12.21, 20%; '
        'man-made fibers: 4202.12.81, 17.6%) and 4202.19 (other, 20%). Hard-shell suitcases use 4202.12.21.20 ("structured, rigid on all '
        'sides"). Duffel and other travel bags are 4202.91 (leather, 4.5%) or 4202.92 (textile or plastic, mostly 17.6%–20%).',
        'link': '',
    },
    {
        'id': 'hs-backpack',
        'question': 'What is the HS code for a backpack or laptop bag?',
        'searchedAs': ['hs code for backpack', 'hs code for laptop backpack', 'hs code for school backpack', 'hs code for laptop bag', 'tariffs on backpacks'],
        'answer': 'Backpacks are travel, sports and similar bags of 4202.92 (additional U.S. note 1): polyester or nylon backpacks are '
        '4202.92.31.20 (17.6%), cotton 4202.92.15.00 (6.3%). A laptop case shaped like a briefcase is usually an attache or briefcase-type '
        'container of 4202.11 or 4202.12 (4202.12.81.30 in man-made fibers, 17.6%). Backpacks for children 12 and under also need a CPSC '
        'Children\'s Product Certificate.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'hs-wallet',
        'question': 'What is the HS code for a wallet?',
        'searchedAs': ['hs code for wallet', 'hs code for wallet leather', 'hs code for wallet purse', 'hs code for coin purse', 'hs code for mens wallet'],
        'answer': 'Wallets, card cases and coin purses are articles carried in the pocket or handbag: leather 4202.31.60.00 (8%), reptile leather '
        '4202.31.30.00 (3.7%), plastic sheeting 4202.32.20.00 (20%) or 4202.32.10.00 (reinforced or laminated plastics, 12.1¢/kg + 4.6%), '
        'man-made fibers 4202.32.93.00 (17.6%).',
        'link': '',
    },
    {
        'id': 'hs-apparel',
        'question': 'What are the HS codes for leather belts, gloves and jackets?',
        'searchedAs': ['hs code for leather belt', 'hs code for leather gloves', 'hs code for leather jacket', 'hs code for leather golf gloves'],
        'answer': 'Leather belts are 4203.30.00.00 (2.7%), leather jackets and coats 4203.10.40 (6%; reptile leather 4203.10.20, 4.7%), leather '
        'work and dress gloves 4203.29 (12.6%–14%), golf gloves 4203.21.80.30 (4.9%), batting gloves 4203.21.20 (3%). Fur-lined leather apparel '
        'is in Chapter 43 and leather watch straps in heading 9113. Belts and unlined 4203.29.40 gloves from Canada pay the 50% Section 338 duty.',
        'link': '',
    },
    {
        'id': 'hs-dog-saddle',
        'question': 'What is the HS code for dog leashes, collars and saddles?',
        'searchedAs': ['hs code for dog leash', 'hs code for dog collar', 'hs code for dog harness', 'hs code for saddle', 'hs code for saddlery'],
        'answer': 'Dog leashes, collars, muzzles and harnesses of any material are 4201.00.30.00 (2.4%); saddles, bridles and other saddlery and '
        'harness for any animal 4201.00.60.00 (2.8%). Stirrups, bits and buckles entered separately are not here (Chapter 42, note 2(h)). From '
        'China both lines pay 37.5% extra; from Canada 50% Section 338, even under USMCA.',
        'link': '',
    },
]

# ---------------------------------------------------------------------------------------------------
json.dump(d, open(OUT, 'w'), ensure_ascii=False, indent=2)
print('wrote', OUT)
