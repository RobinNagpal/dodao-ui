#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 64 content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill64.py <generated.json> <out.json>
Re-runnable: run.sh regenerates the data parts, then runs this script, then compacts and formats.
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import glob
import json
import re
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
WT = IU
TODAY = '2026-10-13'

d = json.load(open(SRC))

# Official sources already used (and checked) in other chapter files, by id.
REF_SOURCES = {}
for f in sorted(glob.glob(f'{WT}/src/tariff-data/chapters/*.json')):
    if '/64-' in f:
        continue
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            REF_SOURCES.setdefault(s['id'], s)

CH64_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2064'
CH98_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
CH99_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
GN_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
USC_2463 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap12-subchapV-sec2463.htm'
USC_2466A = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap12-subchapV-sec2466a.htm'
USC_2703 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap15-sec2703.htm'
CBP_ICP = 'https://www.cbp.gov/document/guidance/footwear'
CBP_REFUNDS = 'https://www.cbp.gov/trade/programs-administration/trade-remedies/ieepa-duty-refunds'


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
trade = json.load(open(f'{WT}/src/tariff-data/trade/chapter-64.json'))
by_c_all = {c['country']: c for c in trade['byCountry']}
by_h = {h['heading']: h['byYear'] for h in trade['byHeading']}
ranked = sorted(trade['byCountry'], key=lambda c: -c['importsUsd'])


def imp(country):
    c = by_c_all.get(country)
    return c['importsUsd'] if c else 0


def imp_year(country, year):
    c = by_c_all.get(country)
    return c['byYear'].get(str(year), 0) if c else 0


def chg(country):
    c = by_c_all[country]
    return round((c['importsUsd'] / c['priorImportsUsd'] - 1) * 100, 1)


def pct(country):
    return round(imp(country) / total * 100, 1)


def hshare(h):
    return by_h[h][str(Y)]


def signed(x):
    return f'+{x}%' if x >= 0 else f'{x}%'


VN = 'Viet Nam' if 'Viet Nam' in by_c_all else 'Vietnam'

# ---------------------------------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------------------------------
NEW_SOURCES = {
    'hts-ch64': {
        'id': 'hts-ch64',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 64',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 64: Footwear, Gaiters and the Like; Parts of '
        'Such Articles',
        'signed': None,
        'published': '2026-10-07',
        'url': CH64_PDF,
    },
    'usc-2463': {
        'id': 'usc-2463',
        'publisher': 'U.S. Code (GovInfo)',
        'citation': '19 U.S.C. 2463(b)(1)(E)',
        'document': 'United States Code, 2024 edition',
        'title': 'GSP eligible articles: footwear, handbags, luggage, flat goods, work gloves and leather wearing apparel not eligible on '
        'January 1, 1995 may not be designated',
        'signed': None,
        'published': '2024-12-31',
        'url': USC_2463,
    },
    'usc-2466a': {
        'id': 'usc-2466a',
        'publisher': 'U.S. Code (GovInfo)',
        'citation': '19 U.S.C. 2466a(b)(1)',
        'document': 'United States Code, 2024 edition',
        'title': 'AGOA: duty-free treatment for articles of sub-Saharan beneficiary countries otherwise excluded from GSP, including footwear',
        'signed': None,
        'published': '2024-12-31',
        'url': USC_2466A,
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
    'cbp-icp-footwear': {
        'id': 'cbp-icp-footwear',
        'publisher': 'CBP',
        'citation': 'CBP Informed Compliance Publication "Footwear" (April 2018; page modified July 16, 2026)',
        'document': 'Informed Compliance Publication',
        'title': 'What Every Member of the Trade Community Should Know About: Footwear — external surface area of the upper, outer sole, '
        'foxing and foxing-like bands, sports and athletic footwear',
        'signed': None,
        'published': '2026-07-16',
        'url': CBP_ICP,
    },
    'cbp-ieepa-refunds': {
        'id': 'cbp-ieepa-refunds',
        'publisher': 'CBP',
        'citation': 'CBP web page (last modified September 30, 2026)',
        'document': 'Web page',
        'title': 'International Emergency Economic Powers Act (IEEPA) Duty Refunds — CAPE Declarations in ACE (deployed April 20, 2026, '
        'CSMS # 68340863)',
        'signed': None,
        'published': '2026-09-30',
        'url': CBP_REFUNDS,
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
SHORT = 'Footwear, Shoes & Boots'

GROUP_LABELS = {
    '6401': ('Waterproof rubber & plastic footwear (rain boots, galoshes, molded boots)', 'Waterproof boots'),
    '6402': ('Other rubber & plastic footwear (sneakers, sandals, flip-flops, clogs, slides)', 'Rubber & plastic shoes'),
    '6403': ('Leather-upper footwear (dress shoes, boots, leather sneakers, sandals)', 'Leather shoes & boots'),
    '6404': ('Textile-upper footwear (athletic and canvas sneakers, slippers, espadrilles)', 'Textile-upper shoes'),
    '6405': ('Other footwear (wood, felt, cork, disposable, other uppers)', 'Other footwear'),
    '6406': ('Footwear parts (uppers, outer soles, insoles) and gaiters, leg-warmers', 'Parts & gaiters'),
}

BLURBS = {
    '6401': (
        'Boots and overshoes whose rubber or plastic upper is molded or cemented to the sole, not stitched — rain boots, rubber "duck" '
        'boots, galoshes. Most pay 37.5%; galoshes without closures 25%; boots almost all of PVC (over 90% of the surface) 4.6%; ski and '
        'snowboard boots Free.',
        ['rain boots', 'rubber boots', 'wellington boots', 'galoshes', 'duck boots', 'pvc boots', 'snow boots', 'steel toe rubber boots'],
    ),
    '6402': (
        'The widest range in the chapter. Zoris and flip-flops with plugged straps (6402.20) are Free, one-piece molded plastic sandals 3%, and '
        'shoes whose upper is over 90% rubber or plastic without a foxing band 6%. Other rubber and plastic shoes pay by value: 48% under '
        '$3 a pair, 90¢/pr. + 37.5% for $3–$6.50, 90¢/pr. + 20% for $6.50–$12, and 20% over $12; protective active footwear (hiking and '
        'trail shoes over $24 with a coated or laminated waterproof textile) 20%.',
        ['flip flops', 'slides', 'crocs', 'clogs', 'plastic sandals', 'rubber sneakers', 'jelly shoes', 'cleats', 'golf shoes', 'water shoes'],
    ),
    '6403': (
        'Shoes and boots with leather uppers. Men\'s leather shoes pay 8.5%, women\'s and children\'s 10%, welt-constructed shoes 5%, turn '
        'footwear 2.5%; leather sandals with straps (6403.20) and women\'s leather sports shoes (6403.19.70) are Free. Japanese leather '
        'shoes also pay a 40% duty dating from 1986.',
        ['leather shoes', 'dress shoes', 'leather boots', 'ankle boots', 'cowboy boots', 'work boots', 'leather sneakers', 'loafers',
         'leather sandals', 'oxfords'],
    ),
    '6404': (
        'Shoes with textile uppers. Rubber- or plastic-soled athletic and canvas sneakers pay 20% over $12 a pair and compound or 37.5%–48% '
        'rates below $12; other textile shoes over $12 pay 9%. Slippers and espadrilles whose outer sole touches the ground mostly with '
        'textile pay 7.5%–12.5%. Textile shoes with leather soles 10%–37.5%.',
        ['sneakers', 'running shoes', 'canvas shoes', 'trainers', 'slip-on sneakers', 'espadrilles', 'house slippers', 'textile slippers',
         'knit sneakers'],
    ),
    '6405': (
        'Footwear not covered above — wooden clogs and shoes with uppers of leather on other soles 10%, textile uppers 7.5%–12.5%, wool felt '
        '2.5%, disposable footwear 3.8%.',
        ['wooden clogs', 'felt slippers', 'disposable slippers', 'hotel slippers', 'cork shoes'],
    ),
    '6406': (
        'Uppers, soles and other parts. Formed textile uppers pay like finished shoes — 33.6% under $3 a pair, 63¢/pr. + 26.2% for $3–$6.50 — '
        'leather formed uppers 8.5%–10%; non-formed leather, '
        'rubber and plastic uppers are Free; rubber or plastic outer soles and heels 2.7%; removable insoles and other parts of rubber or '
        'plastics 5.3%; textile gaiters and leg-warmers 14.9%.',
        ['shoe uppers', 'shoe soles', 'outsoles', 'insoles', 'heel cushions', 'gaiters', 'leg warmers', 'shoe parts'],
    ),
}

ov = d['overview']
ov['h1'] = f'HTS Chapter 64: {SHORT} — Tariff Rates'
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
    if e['code'] == 'R':
        e['name'] = 'United States–Caribbean Basin Trade Partnership Act (CBTPA), through September 30, 2030'
    if e['code'] == 'D':
        e['name'] = 'African Growth and Opportunity Act (AGOA), through December 31, 2026'

# ---------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------
top = [c for c in ranked if c['country'] not in ('World',)][:6]
top_names = [('Vietnam' if c['country'] == 'Viet Nam' else c['country']) for c in top]

ov['seo']['title'] = 'HTS Chapter 64 Tariffs 2026: Shoe & Footwear Import Duty Rates by Country | KoalaGains'
ov['seo']['shortDescription'] = (
    'Searchable 2026 U.S. tariff table for all 391 HTS Chapter 64 footwear lines — sneakers, leather shoes, boots, sandals, flip-flops, '
    'slippers, shoe parts. Base rates from Free to 48% plus the extra duty by country: Vietnam +12.5%, Indonesia and Cambodia +10%, China '
    'up to +20%, Italian leather shoes 10% in total.'
)
ov['seo']['keywords'] = [
    'hts chapter 64',
    'htsus chapter 64',
    'shoe tariffs',
    'footwear tariffs',
    'hts code for shoes',
    'hs code for shoes usa',
    'footwear import duty rates',
    'footwear tariffs china',
    'vietnam footwear tariffs',
    'tariff on shoes from italy',
    'hs code 6403',
    'hs code 6404',
]

ov['intro'] = (
    'Chapter 64 covers every kind of footwear — rubber and plastic shoes and sandals (6401–6402), leather-upper shoes and boots (6403), '
    'textile-upper sneakers and slippers (6404), other footwear (6405) and shoe parts and gaiters (6406). Footwear carries some of the '
    '**highest base rates in the tariff schedule**: 369 of the 391 lines are dutiable, and the rate follows the **upper material, the outer '
    'sole, the construction and the value per pair**. A men\'s leather shoe pays 8.5%, a women\'s 10%; a textile-upper running shoe over $12 a '
    'pair 20%; a rubber or plastic shoe under $3 a pair 48%; between $3 and $12 the rate is compound, for example **90¢ a pair + 20%**.\n\n'
    f'The U.S. imported **{fmt_usd(total)}** of footwear and parts in {Y}. **{top_names[0]}** ({fmt_usd(top[0]["importsUsd"])}) was the '
    f'largest supplier, passing {top_names[1]} ({fmt_usd(top[1]["importsUsd"])}, down {abs(chg("China"))}%), ahead of {top_names[2]}, '
    f'{top_names[3]} and {top_names[4]}. '
    'On top of the base rate comes the **extra duty by country**: since July 24, 2026 a Section 301 tariff on 60 economies — **+12.5% for '
    'Vietnam and Thailand, +10% for Indonesia, Cambodia and India**, and **10% in total for Italian, Spanish and other EU shoes** (nothing '
    'added where the base rate is already 10% or more). **China** pays +12.5% plus **+7.5% (List 4A)** on 242 of the 391 lines. **Japanese '
    'leather shoes** still pay a **40% duty imposed in 1986**, and Brazil +37.5%. USMCA-qualifying footwear from Mexico and Canada pays '
    'nothing, except women\'s leather ankle boots from Canada (6403.91.90), which owe a **50% Section 338 duty even under USMCA**.'
)

for s in ov['stats']:
    if s['label'] == 'Lines with an extra duty for some origins':
        s['note'] = (
            'Section 301 (2026, 60 economies): 391; Brazil: 391; China List 4A: 242 (the other 149 were on the suspended List 4B); Japan 1986 '
            'duty: 100 (6403 and 6404.20, leather footwear); Russia 35% in lieu of column 2: 30; Canada Section 338: 4 (6403.91.90, also on '
            'USMCA goods)'
        )

ov['workedExamples'] = [
    {
        'title': 'Textile running shoes from Vietnam, over $12 a pair',
        'line': '6404.11.90.20',
        'body': 'Athletic shoes with rubber or plastic soles and textile uppers valued over $12 a pair pay 20%. Vietnam adds +12.5% '
        '(9903.05.84): **32.5%**, $3,250 on a $10,000 shipment. The same shoes pay 30% from Indonesia, Cambodia or India, 20% from the EU (the '
        'base rate is already over 10%), and 40% from China, because 6404.11.90 is on List 4A (+12.5% + 7.5%). In late 2025 they paid 40% '
        'from Vietnam (20% IEEPA).',
    },
    {
        'title': 'Same sneaker, $10 a pair — the compound rate',
        'line': '6404.11.89.20',
        'body': 'Below $12 a pair the rate is per pair plus a percentage: 90¢/pr. + 20%. For 1,000 pairs at $10 ($10,000) that is $900 + $2,000 = '
        '$2,900, 29% of value. From Vietnam add +12.5% of value: **$4,150 (41.5%)**. Under $3 a pair the same kind of shoe pays 48% (6404.11.59), '
        'so cheap sneakers pay a higher share of their price than expensive ones.',
    },
    {
        'title': 'Women\'s leather shoes from Italy',
        'line': '6403.99.90.65',
        'body': 'Women\'s leather-upper shoes with rubber or plastic soles valued over $2.50 a pair pay 10%. For EU goods the 2026 Section 301 '
        'action charges 10% in total (9903.05.39), and the base rate is already 10%, so nothing is added: **$1,000 on $10,000**. A men\'s pair '
        '(6403.99.60, 8.5%) also pays 10% in total from Italy. From Brazil the women\'s pair pays 47.5%; from Japan 52.5% — 12.5% in total plus '
        'the 40% 1986 duty.',
    },
    {
        'title': 'Women\'s leather ankle boots from Canada',
        'line': '6403.91.90.25',
        'body': 'The base rate is 10%, and USMCA-qualifying goods pay neither the base rate nor the 10% Section 301 duty (9903.05.93). But '
        '6403.91.90 is on the Section 338 list in U.S. note 51(b)(3) (9903.03.14), which applies even when USMCA is claimed: **$5,000** on a '
        '$10,000 shipment. A non-qualifying shipment pays 10% + 10% + 50% = 70%. Men\'s boots (6403.91.60) are not on the list.',
    },
    {
        'title': 'Flip-flops from China',
        'line': '6402.20.00.00',
        'body': 'Zoris — flip-flops whose straps are plugged through the sole — are Free. 6402.20 was on China\'s List 4B, which was suspended '
        'before it took effect, so Chinese flip-flops pay only the 2026 Section 301 duty: **12.5%**. One-piece molded plastic sandals '
        '(6402.99.27) pay 3%, plus 12.5% from China, and are on List 4A, so 23%.',
    },
]

snap = ov['tradeSnapshot']
snap['effectiveDutyRateNote'] = 'Duty-collected figures aren’t available from an official source yet.'
snap['totalDutyCollectedUsd'] = None
snap['source'] = f'UN Comtrade, United States imports, HS chapter 64 ({Y})'
snap['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar {Y} — before the '
    '2026 tariff changes.'
)

ov['notes']['chapterNotes'] = (
    '**Note 1.** This chapter does not cover: (a) disposable foot or shoe coverings of flimsy material (for example, paper, sheeting of '
    'plastics) without applied soles — these are classified according to their constituent material; (b) footwear of textile material, '
    'without an outer sole glued, sewn or otherwise affixed or applied to the upper (section XI); (c) worn footwear of heading 6309; (d) '
    'articles of asbestos (heading 6812); (e) orthopedic footwear or other orthopedic appliances, or parts thereof (heading 9021; see heading '
    '9817.64.01); or (f) toy footwear or skating boots with ice or roller skates attached; shin-guards or similar protective sportswear '
    '(chapter 95).\n\n'
    '**Note 2.** For heading 6406, "parts" does not include pegs, protectors, eyelets, hooks, buckles, ornaments, braid, laces, pompons or '
    'other trimmings (classified in their own headings) or buttons or other goods of heading 9606.\n\n'
    '**Note 3.** In this chapter (a) "rubber" and "plastics" include woven fabrics or other textile products with an external layer of rubber '
    'or plastics visible to the naked eye (any resulting change of color is ignored); and (b) "leather" means the goods of headings 4107 and '
    '4112 to 4114.\n\n'
    '**Note 4.** Subject to note 3: (a) the material of the upper is the constituent material with the greatest external surface area, '
    'ignoring accessories or reinforcements such as ankle patches, edging, ornamentation, buckles, tabs, eyelet stays or similar attachments; '
    '(b) the material of the outer sole is the material with the greatest surface area in contact with the ground, ignoring accessories or '
    'reinforcements such as spikes, bars, nails, protectors or similar attachments.\n\n'
    '**Subheading note 1.** For subheadings 6402.12, 6402.19, 6403.12, 6403.19 and 6404.11, "sports footwear" applies only to (a) footwear '
    'designed for a sporting activity that has, or has provision for the attachment of, spikes, sprigs, cleats, stops, clips, bars or the '
    'like; and (b) skating boots, ski-boots and cross-country ski footwear, snowboard boots, wrestling boots, boxing boots and cycling shoes.'
)
ov['notes']['additionalUsNotes'] = (
    '**1.** (a) "Welt footwear" means footwear constructed with a welt that extends around the edge of the tread portion of the sole, in which '
    'the welt and shoe upper are sewed to a lip on the surface of the insole, and the outsole is sewed or cemented to the welt; (b) "footwear '
    'for men, youths and boys" covers footwear of American youths\' size 11-1/2 and larger for males, and does not include footwear commonly '
    'worn by both sexes.\n\n'
    '**2.** "Tennis shoes, basketball shoes, gym shoes, training shoes and the like" covers athletic footwear other than sports footwear (as '
    'defined in subheading note 1), whether or not principally used for such athletic games or purposes.\n\n'
    '**3.** For heading 6401, "waterproof footwear" means footwear specified in the heading, designed to protect against penetration by water '
    'or other liquids, whether or not primarily designed for such purposes.\n\n'
    '**4.** "Formed uppers" (subheading 6406.10) are uppers with closed bottoms that have been shaped by lasting, molding or otherwise, but not '
    'by simply closing at the bottom.\n\n'
    '**5.** In finding the material of the outer sole under note 4(b), textile materials that lack the characteristics usually required for '
    'normal use of an outer sole, including durability and strength, are not taken into account.\n\n'
    '**6.** For subheadings 6402.91.42 and 6402.99.32, "protective active footwear" means footwear (other than sports footwear) designed for '
    'outdoor activities, such as hiking shoes, trekking shoes, running shoes and trail running shoes, valued over $24 a pair, that provides '
    'protection against water imparted by a coated or laminated textile fabric.\n\n'
    '**Statistical notes.** "Work footwear" (statistical note 1(a)) covers footwear with a metal toe-cap and specialized footwear with rubber '
    'or plastic outer soles designed for occupations such as agriculture, construction, industry, public safety and transportation, with '
    'features that protect against workplace hazards; "house slippers" (note 1(d)) are footwear with very thin outer soles (cellular rubber, '
    'non-grain leather or textile up to 3.5 mm; PVC up to 2 mm) or sole components not over 8 mm thick at the ball with no higher heel.'
)

# ---------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['h1'] = f'HTS Chapter 64: {SHORT} — Tariff Updates'
tu['seo'] = {
    'title': 'Shoe Tariffs 2026: HTS Chapter 64 Footwear Tariff Updates Since January 2025 — China, Vietnam, Indonesia, Italy | KoalaGains',
    'shortDescription': 'What changed for U.S. footwear tariffs since January 2025: the end of the IEEPA and Section 122 duties, the 2026 '
    'Section 301 tariffs (Vietnam +12.5%, Indonesia and Cambodia +10%, EU 10% in total), China List 4A, Japan\'s 1986 leather-footwear duty, '
    'Canada Section 338 and the end of de minimis, with Federal Register citations.',
    'keywords': [
        'shoe tariffs',
        'footwear tariffs',
        'us import tariffs footwear',
        'china footwear tariffs',
        'vietnam footwear tariffs',
        'indonesia footwear tariffs',
        'brazil footwear import duties',
        'de minimis tariff footwear',
        'hts chapter 64 tariff updates',
        'section 301 footwear',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 '
    'Revision 21** (in force October 9, 2026). **No Chapter 64 base rate changed**: all 391 lines carry the same General, Special and Column 2 '
    'rates, from Free to 48% and compound rates such as 90¢/pr. + 37.5%.\n\n'
    'Everything that changed sits on top of the base rate. In 2025 the IEEPA duties reached footwear from every country — 20% for Vietnam, '
    '19% for Indonesia, Cambodia and Thailand, 15% in total for the EU from August 7, 2025, 50% for India and Brazil from August 2025, and up '
    'to 145% for China in April–May 2025, on top of the 7.5% List 4A duty. The IEEPA duties **ended on February 24, 2026** (importers can now '
    'claim refunds through CBP\'s CAPE process), and the 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July '
    '24, 2026** goods from 60 economies pay a **Section 301 tariff**: +12.5% for Vietnam and Thailand, +10% for Indonesia, Cambodia and '
    'India, 10% in total for the EU and 12.5% in total for Japan. China still pays **+7.5% (List 4A)** on 242 of the 391 lines, Japan the **40% '
    'duty of 1986** on leather footwear, and since **August 22, 2026** Canadian women\'s leather ankle boots (6403.91.90) a **50% Section 338 '
    'duty**, even under USMCA. The $800 de minimis exemption stays suspended, so shoes shipped direct to consumers pay full duty.'
)
tu['scope'] = (
    'Measures that reach Chapter 64 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 tariff, the China '
    'Section 301 List 4A duty (and the suspended List 4B), the 1986 Section 301 duty on leather footwear from Japan (9903.41.10), the Canada '
    'Section 338 duty, Russia\'s rates in lieu of column 2, the Nicaragua Section 301 duty scheduled for 2027, the 2025–2026 IEEPA and Section '
    '122 duties that have ended, and the suspension of de minimis. Preference-program changes (AGOA, GSP) are listed for reference. No '
    'antidumping or countervailing duty order covers a Chapter 64 product. For the rate each supplier pays, see Rates by country.'
)

NO_52B = 'No Chapter 64 line is on the general exemption list (note 52(b)). '

IN_EFFECT_TEXT = {
    'China': (
        'Two Section 301 duties stack on 242 of the 391 lines: +12.5% under the 2026 action (9903.05.31) and +7.5% under List 4A (9903.88.15, '
        'U.S. note 20(r)–(s)), which covers 91 Chapter 64 subheadings — most leather-upper footwear (6403), rain boots (6401.92.90), many '
        'rubber, plastic and textile-upper shoes (for example 6402.91.90, 6402.99.90, 6404.11.79, .89 and .90, 6404.19.90) and most parts '
        '(6406). The other 149 lines — 56 subheadings including flip-flops (6402.20), shoes with uppers over 90% '
        'rubber or plastic (6402.99.31), protective active footwear (6402.91.42, 6402.99.32), textile sneakers with soles attached only by adhesive (6404.11.41–.69) and '
        'many textile slippers and slip-ons — '
        'were put on List 4B (9903.88.16), which USTR suspended before it took effect, so they pay only +12.5%. No China product exclusion '
        '(note 20(vvv)) covers a Chapter 64 line. USTR\'s four-year review kept List 4A in place. The IEEPA duties on China ended February 24, '
        '2026.',
        'Chinese textile running shoes over $12 a pair pay 40% (20% + 12.5% + 7.5%), women\'s leather shoes 30%, rubber rain boots 57.5%; '
        'flip-flops 12.5%.',
    ),
    'Vietnam': (
        'Base rate + 12.5% (9903.05.84). ' + NO_52B + 'Vietnam has no exception list in note 52(j). The 20% IEEPA reciprocal duty (9903.02.69, '
        'from August 7, 2025) ended February 24, 2026.',
        'Vietnamese textile sneakers over $12 a pair pay 32.5% (20% + 12.5%), women\'s leather shoes 22.5%, men\'s 21%; flip-flops 12.5%.',
    ),
    'European Union': (
        'For EU goods whose base rate is under 10%, the total is 10% (9903.05.39); at or above 10%, nothing is added (9903.05.38). For compound '
        'rates such as 90¢/pr. + 20% the comparison uses the ad valorem equivalent (U.S. note 52(k)), which is always over 10% for these lines. '
        'So Italian, Spanish and Portuguese leather shoes (Free to 10%) and the lower-rated rubber, plastic and textile lines — flip-flops, '
        'molded sandals, textile shoes over $12 (9%) — pay 10% in total, while lines at 10% or more (most rubber, plastic and textile-upper '
        'shoes, 12.5% to 48% and the compound rates) pay only their base rate. ' + NO_52B + 'The EU exception list (note 52(j)(2)) has no Chapter 64 line. This '
        'replaced the 15%-in-total IEEPA rate (9903.02.20), which ended February 24, 2026.',
        'An Italian leather shoe pays 10% of value — $1,000 on $10,000 — instead of 15% in late 2025 and 8.5%–10% before that.',
    ),
    'Indonesia': (
        'Base rate + 10% (9903.05.45). ' + NO_52B + 'Indonesia\'s exception list in note 52(j) names no Chapter 64 line. The 19% IEEPA '
        'reciprocal duty (9903.02.27) ended February 24, 2026.',
        'Indonesian textile sneakers over $12 a pair pay 30%, women\'s leather shoes 20%, men\'s 18.5%.',
    ),
    'Cambodia': (
        'Base rate + 10% (9903.05.28). ' + NO_52B + 'Cambodia\'s exception list in note 52(j) names no Chapter 64 line. The 19% IEEPA '
        'reciprocal duty (9903.02.11, from August 7, 2025) ended February 24, 2026.',
        'Cambodian textile sneakers over $12 a pair pay 30%, women\'s leather shoes 20%.',
    ),
    'India': (
        'Base rate + 10% (9903.05.44). ' + NO_52B + 'The IEEPA duties on India — 25% reciprocal from August 7, 2025 plus 25% from August 27, '
        '2025 — ended in February 2026.',
        'Indian men\'s leather shoes pay 18.5%, women\'s 20%, leather sandals 10%.',
    ),
    'Brazil': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 (9903.05.27). The '
        'Brazil exemption list (U.S. note 50(a)(ii)) names no Chapter 64 line. The 40% IEEPA duty on Brazil (Executive Order 14323) and the 10% '
        'reciprocal duty ended February 24, 2026.',
        'Brazilian women\'s leather shoes pay 47.5% (10% + 37.5%), leather sandals 37.5%.',
    ),
    'Mexico': (
        'USMCA-qualifying goods pay no Section 301 duty (9903.05.94); others pay +10% (9903.05.55). ' + NO_52B + 'Mexico is not subject to '
        'the Canada Section 338 duty. The 25% IEEPA duty on non-USMCA goods (9903.01.01) ended February 24, 2026.',
        'USMCA-qualifying boots and shoes from Mexico pay nothing; non-qualifying goods pay the base rate plus 10% — 18.5% for men\'s leather '
        'boots.',
    ),
    'Canada': (
        'Two measures. The 2026 Section 301 duty (+10%, 9903.05.29) does not apply to USMCA-qualifying goods (9903.05.93). The Section 338 duty '
        '(+50%, from August 22, 2026, 9903.03.14) applies to products of Canada in one Chapter 64 subheading, 6403.91.90 — leather-upper '
        'footwear covering the ankle, for women and other persons, with outer soles of rubber, plastics or composition leather — and U.S. note '
        '51(a) applies it even when USMCA or another special rate is claimed. The September 15, 2026 list revisions (Proclamation 11065) added '
        'or removed no Chapter 64 provision. The 35% IEEPA duty on non-USMCA goods (9903.01.10) ended February 24, 2026.',
        'A USMCA-qualifying women\'s leather ankle boot from Canada pays 50%; a non-qualifying one 70%. All other USMCA footwear from Canada, '
        'men\'s leather boots included, pays nothing.',
    ),
    'Bangladesh': (
        'Base rate + 10% (9903.05.26). ' + NO_52B + 'Bangladesh\'s exception list in note 52(j) names no Chapter 64 line. The 20% IEEPA '
        'reciprocal duty ended February 24, 2026.',
        'Bangladeshi men\'s leather shoes pay 18.5%, women\'s 20%, textile sneakers over $12 a pair 30%.',
    ),
    'Thailand': (
        'Base rate + 12.5% (9903.05.77). ' + NO_52B + 'The 19% IEEPA reciprocal duty (9903.02.61) ended February 24, 2026.',
        'Thai textile sneakers over $12 a pair pay 32.5%, leather shoes 21%–22.5%.',
    ),
    'Japan': (
        'Japan\'s 1986 Section 301 duty (9903.41.10) adds 40% to footwear with leather outer soles and uppers wholly or partly of leather, and '
        'to footwear with rubber or plastic outer soles and uppers mostly of leather — the leather-upper shoes and boots of heading 6403 (91 '
        'lines; ski and snowboard boots, 6403.12, are left out) and, when the textile upper is partly leather, 6404.20 (9 lines). Two kinds are '
        'excepted: (a) slip-on footwear not suitable for outdoor use, without backs or backstraps, with outer soles under 5 mm thick and less '
        'than 20 mm difference in thickness between the ball and the heel, and (b) sports footwear with or for spikes, sprigs, stops, clips, '
        'bars or the like, skating boots, ski-boots, cross-country ski footwear, wrestling and boxing boots and cycling shoes. U.S. note 3 makes '
        'it cumulative with every other duty. Proclamation 5448 imposed it from March 31, 1986, after Japan kept quotas on U.S. leather and '
        'footwear; USTR rewrote the footwear description in June 1986 and may end the duty only by a Federal Register notice, and none has '
        'been published. The 2026 Section 301 duty sets a 12.5% floor (9903.05.49). The 15% IEEPA floor on Japanese goods ended February 24, '
        '2026.',
        'Japanese leather shoes and boots pay 52.5% (12.5% + 40%); excepted indoor slippers and cleated sports shoes pay 12.5%; rubber, plastic '
        'and textile shoes pay 12.5% or their base rate if higher.',
    ),
    'United Kingdom': (
        'Base rate + 10% (9903.05.81). ' + NO_52B + 'The UK exception list (note 52(j)(1)) has no Chapter 64 line. The 10% IEEPA reciprocal '
        'duty ended February 24, 2026.',
        'British Goodyear-welted leather shoes and boots (5%) pay 15%, other men\'s leather shoes 18.5%.',
    ),
    'Dominican Republic': (
        'Base rate + 12.5% (9903.05.34). CAFTA-DR (SPI P) makes every Chapter 64 line Free of the base rate, but the 2026 Section 301 duty still '
        'applies (note 52(a)); the CAFTA-DR relief in note 52(i) (9903.05.95) covers only textile and apparel goods, not footwear. ' + NO_52B
        + 'The 10% IEEPA reciprocal duty ended February 24, 2026.',
        'Dominican footwear entered under CAFTA-DR pays 12.5%; without the CAFTA-DR claim it pays the base rate plus 12.5%.',
    ),
    'Russia': (
        'Russia pays column 2 rates (general note 3(b)) — from 10% to 84% on footwear, some $1.58/pr. + 35% or 66% — plus +12.5% (9903.05.66). Thirty lines pay 35% '
        'under 9903.90.08 in place of their column 2 rate (U.S. note 30).',
        'Russian footwear is effectively priced out.',
    ),
}
OTHER_TEXT = (
    'Rates by country: Pakistan, Sri Lanka, Malaysia, El Salvador, Guatemala and Honduras +10%; the Philippines, Türkiye, '
    'Costa Rica and Nicaragua +12.5%; Taiwan 10% in total (9903.05.76) and South Korea 12.5% in total (9903.05.71). ' + NO_52B + 'No '
    'country exception list in note 52(j) names a Chapter 64 line, and the CAFTA-DR relief in note 52(i) covers textiles and apparel, not '
    'footwear. Countries outside the 60 economies, such as Myanmar, Ethiopia or Kenya, pay only the base rate.',
    'Sri Lankan or Pakistani textile sneakers over $12 a pair pay 30%; Philippine ones 32.5%; Myanmar\'s 20%.',
)
for e in tu['inEffect']:
    key = e['country']
    if key in IN_EFFECT_TEXT:
        e['exemption'], e['whatItMeans'] = IN_EFFECT_TEXT[key]
    elif key.startswith('Other'):
        e['country'] = 'Other Section 301 economies (incl. Pakistan, Sri Lanka, Taiwan, South Korea, the Philippines, Central America)'
        e['exemption'], e['whatItMeans'] = OTHER_TEXT
    else:
        raise SystemExit(f'no inEffect text for {key}')
    if e['country'] == 'European Union':
        e['measure'] = 'Section 301 tariff (forced-labor investigations), EU rate'
    elif e['country'] == 'Canada':
        e['measure'] = 'Section 301 tariff (non-USMCA goods) + Section 338 duty (6403.91.90, USMCA or not)'
        e['now'] = '+10% (non-USMCA); +50% on 6403.91.90, USMCA or not'
    elif e['country'] == 'China':
        e['measure'] = 'Section 301 tariffs: 2026 action plus List 4A'
        e['before'] = '+7.5% (List 4A, 242 lines)'
        e['now'] = '+20% on 242 lines; +12.5% on the 149 former List 4B lines'
        for sid in ('fr-2019-27306',):
            if sid not in e['sourceIds']:
                e['sourceIds'].insert(-1, sid)
    elif e['country'] == 'Japan':
        e['measure'] = 'Section 301: 2026 action (12.5% floor) + 1986 leather-footwear duty'
        e['before'] = '+40% (1986 duty)'
        e['now'] = '12.5% floor on all lines; +40% on leather footwear (6403, and 6404.20 if partly leather) unless excepted'
        for sid in ('eo-14389', 'eo-14345'):
            if sid not in e['sourceIds']:
                e['sourceIds'].insert(-1, sid)
    elif e['country'] == 'Brazil':
        e['measure'] = 'Section 301 tariffs: Brazil action plus 2026 forced-labor action'
        if 'eo-14323' not in e['sourceIds']:
            e['sourceIds'].insert(-1, 'eo-14323')
    elif e['country'] == 'Russia':
        e['measure'] = 'Section 301 tariff + rates in lieu of column 2 (30 lines)'
    elif e['country'] == 'Dominican Republic':
        e['measure'] = 'Section 301 tariff (applies to CAFTA-DR footwear too)'
    else:
        e['measure'] = 'Section 301 tariff (forced-labor investigations)'

# --- change log -----------------------------------------------------------------------------------
for c in tu['changes']:
    if c['id'].startswith('section-301-nicaragua'):
        c['date'] = '2025-12-29'
        c['title'] = 'Scheduled: Section 301 tariff on products of Nicaragua'
        c['detail'] = (
            'USTR\'s implementation notice: products of Nicaragua that pay the column 1-general rate (that is, not entered under CAFTA-DR) will '
            'pay +10% (9903.89.01) from January 1, 2027 and +15% from January 1, 2028, on every Chapter 64 line. Today Nicaragua pays the 12.5% '
            '2026 Section 301 duty (9903.05.58).'
        )
    elif c['id'].startswith('section-338-canada'):
        c['title'] = 'Canada Section 338 duty takes effect on women\'s leather ankle boots (6403.91.90)'
        c['detail'] = (
            '50% on listed products of Canada after a 3-day suspension lapsed. The only Chapter 64 provision on the motor-vehicle list '
            '(9903.03.14, U.S. note 51(b)(3)) is 6403.91.90 — leather-upper footwear covering the ankle, for women and other persons, with outer '
            'soles of rubber, plastics or composition leather (4 statistical lines). Unlike the Section 301 duty, it applies to USMCA-qualifying '
            'goods too (U.S. note 51(a)).'
        )
    elif c['id'].startswith('section-301-2026-60-economies'):
        c['title'] = 'Section 301 tariffs on 60 economies cover all of Chapter 64'
        c['detail'] = (
            '10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). No Chapter 64 line is on the general exemption list (note '
            '52(b)) or on any country exception list (note 52(j)). Vietnam, Thailand, China and the Philippines +12.5%; Indonesia, Cambodia, '
            'India, Bangladesh and Pakistan +10%. EU goods pay 10% in total and Japanese 12.5% in total — nothing extra on lines already at or '
            'above that rate. CAFTA-DR footwear pays it too. USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94).'
        )
    elif c['id'].startswith('section-301-brazil'):
        c['title'] = 'Section 301 tariff on products of Brazil'
        c['detail'] = (
            '25% on all goods of Brazil (9903.05.01). No Chapter 64 line is on the Brazil exemption list (U.S. note 50(a)(ii)). From July 24 the '
            '12.5% forced-labor tariff (9903.05.27) is added on top.'
        )
    elif c['id'] == 'base-rates':
        c['detail'] = (
            'All 391 Chapter 64 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition, and no '
            'line was added, split or renumbered.'
        )

EXTRA_CHANGES = [
    {
        'id': 'lvs-nprm',
        'type': 'pending',
        'date': '2026-10-08',
        'dateLabel': 'Proposed',
        'title': 'CBP proposes new entry rules for low-value and mail shipments',
        'detail': 'CBP proposed to change filing requirements for informal entries of goods valued at $2,500 or less, create an electronic '
        'informal entry type for mail and add bonding requirements. Comments are due December 7, 2026. It would change how small parcels of '
        'shoes are entered, not their duty rate.',
        'before': None,
        'now': None,
        'countries': 'All',
        'sourceIds': ['cbp-nprm-lvs'],
    },
    {
        'id': 'cn-301-continue',
        'type': 'reference',
        'date': '2026-10-07',
        'dateLabel': 'Published',
        'title': 'China Section 301 List 4A continues after the four-year review',
        'detail': 'USTR announced that the China Section 301 actions did not terminate on their anniversaries because domestic industries asked '
        'for them to continue. For Chapter 64 this keeps +7.5% (List 4A, 9903.88.15) on 242 lines; List 4B stays suspended.',
        'before': '+7.5%',
        'now': '+7.5%',
        'countries': 'China',
        'sourceIds': ['fr-2026-20510'],
    },
    {
        'id': 'ca-338-scope',
        'type': 'reference',
        'date': '2026-09-15',
        'dateLabel': 'Effective',
        'title': 'Canada Section 338 lists revised; Chapter 64 entry unchanged',
        'detail': 'Proclamations 11064 and 11065 added and removed provisions on the Section 338 lists. None of the added or removed provisions '
        'is in Chapter 64, so 6403.91.90 stays on the 9903.03.14 list. From this date the duty also applies on top of any Section 232 duty.',
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
        'resolution of the issues or until termination, so USMCA claims (SPI S) still remove the base rate and the Section 301 duty on '
        'Mexican and Canadian footwear.',
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
        'detail': 'Two interim final rules suspend the $800 de minimis exemption in CBP\'s regulations: 19 CFR 10.151(b) for every mode except '
        'mail, and 19 CFR 145.31(b) for mail, until CBP announces otherwise. A pair of shoes shipped direct to a U.S. consumer needs an entry and '
        'pays the full duty — base rate plus the extra duty for its origin. The new postal informal entry process took effect July 24, 2026.',
        'before': 'Free under $800',
        'now': 'Full duty, any value',
        'countries': 'All',
        'sourceIds': ['cbp-ifr-dm', 'cbp-ifr-mail'],
    },
    {
        'id': 'ieepa-refunds',
        'type': 'reference',
        'date': '2026-04-20',
        'dateLabel': 'Deployed',
        'title': 'CBP opens CAPE for IEEPA duty refunds',
        'detail': 'CBP deployed the Consolidated Administration and Processing of Entries (CAPE) function in ACE: importers of record and their '
        'brokers file a CAPE Declaration listing entries, and ACE removes the IEEPA Chapter 99 lines and refunds the IEEPA duties with '
        'interest, generally within 60–90 days. Phase 1 covers unliquidated entries and entries still within the voluntary reliquidation '
        'period. The Section 301, List 4A, 1986 Japan and Section 338 duties are not refunded.',
        'before': None,
        'now': None,
        'countries': 'All',
        'sourceIds': ['cbp-ieepa-refunds'],
    },
    {
        'id': 's122-start',
        'type': 'extraDuty',
        'date': '2026-02-24',
        'dateLabel': 'Effective',
        'title': 'Section 122 surcharge replaces the IEEPA tariffs',
        'detail': '10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 64 subheading was on the product exemption '
        'lists (9903.03.03–9903.03.06). USMCA-qualifying goods from Canada and Mexico were exempt (9903.03.07, 9903.03.08).',
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
        'Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP stopped collecting them for goods '
        'entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer '
        'in effect.',
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
        'most dutiable Chapter 64 lines Free for eligible sub-Saharan countries — footwear is one of the import-sensitive goods AGOA may cover '
        'although GSP may not. GSP (SPI A) remains expired since December 31, 2020 and never covered most footwear.',
        'before': 'Lapsed (from September 30, 2025)',
        'now': 'In force to December 31, 2026',
        'countries': 'AGOA beneficiary countries',
        'sourceIds': ['ustr-agoa-2026', 'crs-agoa', 'procl-11030', 'usc-2466a', 'usc-2463', 'cbp-gsp', 'hts-now'],
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
        'title': 'De minimis exemption suspended for all countries',
        'detail': 'Executive Order 14324 ended duty-free entry for shipments valued at $800 or less from every country, effective for goods '
        'entered from August 29, 2025. Direct-to-consumer shoe parcels have paid duty since then.',
        'before': 'Free under $800',
        'now': 'Dutiable',
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
        '(EO 14326): 50% in all on Indian footwear, on top of the base rate. Ended February 7, 2026.',
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
        'detail': 'Executive Order 14326 set country rates for goods entered from August 7, 2025: Indonesia, Cambodia, Thailand, Pakistan and the '
        'Philippines +19%, Vietnam, Bangladesh and Sri Lanka +20%, India +25%, Myanmar +40%, the UK +10%. EU goods with a column 1 rate under '
        '15% paid 15% in total (9903.02.20) — so Italian leather shoes paid 15%, while EU textile and plastic shoes already at 20% or more paid '
        'nothing extra. Ended February 24, 2026.',
        'before': '+10%',
        'now': '+10% to +40% (ended)',
        'countries': 'Listed countries, European Union',
        'sourceIds': ['eo-14326', 'hts-now'],
    },
    {
        'id': 'brazil-ieepa',
        'type': 'extraDuty',
        'date': '2025-08-06',
        'dateLabel': 'Effective',
        'title': 'Extra 40% on products of Brazil',
        'detail': 'Executive Order 14323 added 40% on Brazilian goods, on top of the 10% reciprocal duty: 50% in all on Brazilian footwear, on top '
        'of the base rate. Footwear was not on its exemption list. Ended February 24, 2026.',
        'before': '+10%',
        'now': '+50% (ended)',
        'countries': 'Brazil',
        'sourceIds': ['eo-14323'],
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
        'id': 'dm-statute',
        'type': 'reference',
        'date': '2025-07-04',
        'dateLabel': 'Signed',
        'title': 'Law ends the de minimis exemption from July 1, 2027',
        'detail': 'Section 70531 of P.L. 119-21 terminates the de minimis exemption of 19 U.S.C. 1321(a)(2)(C) effective July 1, 2027, as CBP\'s '
        '2026 rules note.',
        'before': None,
        'now': None,
        'countries': 'All',
        'sourceIds': ['pl-119-21', 'cbp-ifr-dm'],
    },
    {
        'id': 'cn-reciprocal-10',
        'type': 'extraDuty',
        'date': '2025-05-14',
        'dateLabel': 'Effective',
        'title': 'China reciprocal duty cut from 125% to 10%',
        'detail': 'Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. A Chinese '
        'textile running shoe over $12 a pair then paid 20% + 7.5% (List 4A) + 20% + 10% = 57.5% until November 9, 2025. Ended February 24, '
        '2026.',
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
        'rates announced on April 2 for other countries (Vietnam 46%, Cambodia 49%, Indonesia 32%), which never took effect. With the 20% '
        'fentanyl duty and the 7.5% List 4A duty, a Chinese textile running shoe over $12 (20% base) paid 172.5% until May 13, 2025.',
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
        'detail': '10% baseline (9903.01.25) from April 5, 2025, and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 64 '
        'product was exempt. Ended February 24, 2026.',
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
        'on top of the List 4A duty. Ended February 24, 2026.',
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
        'detail': '+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, '
        '2026.',
        'before': 'None',
        'now': '+25% (ended)',
        'countries': 'Canada',
        'sourceIds': ['eo-14193'],
    },
    {
        'id': 'cn-4a-cut',
        'type': 'extraDuty',
        'date': '2020-02-14',
        'dateLabel': 'Effective',
        'title': 'China List 4A duty cut to 7.5%',
        'detail': 'Under the Phase One agreement USTR cut the List 4A duty (9903.88.15) from 15% to 7.5%. The rate on the 242 Chapter 64 lines '
        'has been 7.5% ever since.',
        'before': '+15%',
        'now': '+7.5%',
        'countries': 'China',
        'sourceIds': ['fr-2020-00904'],
    },
    {
        'id': 'cn-4b-suspended',
        'type': 'reference',
        'date': '2019-12-18',
        'dateLabel': 'Published',
        'title': 'China List 4B suspended before it took effect',
        'detail': 'USTR suspended indefinitely the 15% List 4B duty (9903.88.16) that was to start December 15, 2019. List 4B held 56 Chapter 64 '
        'subheadings — among them flip-flops, plastic-upper shoes without foxing, protective active footwear, adhesive-soled textile sneakers and many '
        'textile slippers — so those Chinese shoes never paid a China Section 301 list duty.',
        'before': '+15% scheduled',
        'now': 'Suspended',
        'countries': 'China',
        'sourceIds': ['fr-2019-27306'],
    },
    {
        'id': 'cn-4a',
        'type': 'extraDuty',
        'date': '2019-09-01',
        'dateLabel': 'Effective',
        'title': 'China Section 301 List 4A reaches footwear',
        'detail': 'The fourth China Section 301 list put +15% on 91 Chapter 64 subheadings: most leather-upper footwear, rain boots, many '
        'rubber, plastic and textile shoes and most shoe parts. No Chapter 64 line was on Lists 1–3.',
        'before': 'None',
        'now': '+15%',
        'countries': 'China',
        'sourceIds': ['fr-2019-17865'],
    },
    {
        'id': 'jp-1988-hts',
        'type': 'reference',
        'date': '1988-11-19',
        'dateLabel': 'Signed',
        'title': 'Japan footwear duty carried into the HTS as 9903.41.10',
        'detail': 'Proclamation 5911 moved the 1986 duty into the new Harmonized Tariff Schedule as heading 9903.41.10, with U.S. note 3 to '
        'Chapter 99 subchapter III making it cumulative with all other duties. Revision 21 still prints it, and U.S. note 5 does not list it '
        'among the suspended headings.',
        'before': None,
        'now': '+40% (9903.41.10)',
        'countries': 'Japan',
        'sourceIds': ['govinfo-statute-103-pg2613', 'hts-chapter-99'],
    },
    {
        'id': 'jp-1986-narrowed',
        'type': 'reference',
        'date': '1986-06-10',
        'dateLabel': 'Published',
        'title': 'USTR rewrites the footwear item of the Japan duty',
        'detail': 'A USTR notice replaced the footwear description, back to March 31, 1986, with the text that 9903.41.10 still carries: leather '
        'footwear and footwear with uppers predominantly of leather, except indoor slip-ons with thin flat soles and sports footwear such as '
        'cleated, ski, skating, wrestling, boxing and cycling footwear. It did not end the duty.',
        'before': None,
        'now': '+40%',
        'countries': 'Japan',
        'sourceIds': ['govinfo-fr-1986-06-10'],
    },
    {
        'id': 'jp-1986',
        'type': 'extraDuty',
        'date': '1986-03-31',
        'dateLabel': 'Effective',
        'title': '40% Section 301 duty on leather footwear from Japan',
        'detail': 'Proclamation 5448 (signed March 16, 1986) added 40% ad valorem to leather footwear and leather from Japan, in response to '
        'Japan\'s quotas on imports of U.S. leather and footwear. It lets USTR suspend or end the duty only by a notice in the Federal Register, '
        'and none has done so.',
        'before': None,
        'now': '+40%',
        'countries': 'Japan',
        'sourceIds': ['govinfo-statute-100-pg4411'],
    },
]
have_ids = {c['id'] for c in tu['changes']}
tu['changes'] += [c for c in EXTRA_CHANGES if c['id'] not in have_ids]
tu['changes'].sort(key=lambda c: c['date'], reverse=True)
add_sources(
    tu,
    [
        'eo-14323',
        'fr-2019-27306',
        'procl-11064',
        'procl-11065',
        'csms-69851916',
        'procl-11012',
        'csms-67844987',
        'ustr-usmca-review',
        'cbp-ifr-dm',
        'cbp-ifr-mail',
        'cbp-nprm-lvs',
        'cbp-ieepa-refunds',
        'scotus-24-1287',
        'eo-14389',
        'csms-67834313',
        'eo-14388',
        'eo-14384',
        'ustr-agoa-2026',
        'crs-agoa',
        'procl-11030',
        'usc-2466a',
        'usc-2463',
        'cbp-gsp',
        'eo-14357',
        'eo-14324',
        'cbp-dm-2025',
        'eo-14329',
        'eo-14326',
        'eo-14325',
        'pl-119-21',
        'eo-14298',
        'eo-14266',
        'eo-14257',
        'eo-14195',
        'eo-14228',
        'eo-14194',
        'eo-14193',
        'eo-14345',
        'fr-2020-00904',
        'fr-2019-17865',
        'govinfo-statute-103-pg2613',
        'govinfo-fr-1986-06-10',
        'govinfo-statute-100-pg4411',
    ],
)

stats = [s for s in tu['stats'] if s['label'] != 'IEEPA duties']
stats.append({'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'})
tu['stats'] = stats

# ---------------------------------------------------------------------------------------------------
# Industry areas (matrix)
# ---------------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['h1'] = f'HTS Chapter 64: {SHORT} — Tariff Rates by Country'
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]

RULE_LABELS = {
    'China': 'Base rate + 12.5% Section 301 (9903.05.31), plus 7.5% List 4A (9903.88.15) on 242 of the 391 lines — leather shoes, rain boots, '
    'many rubber, plastic and textile shoes, most parts. The 149 lines of the suspended List 4B (flip-flops, plastic-upper shoes, '
    'adhesive-soled textile sneakers, many slippers) pay only the 12.5%.',
    'Vietnam': 'Base rate + 12.5% Section 301 (9903.05.84). No Chapter 64 line is exempt. The 20% IEEPA duty ended February 24, 2026.',
    'Indonesia': 'Base rate + 10% Section 301 (9903.05.45). No Chapter 64 line is exempt. The 19% IEEPA duty ended February 24, 2026.',
    'Cambodia': 'Base rate + 10% Section 301 (9903.05.28). No Chapter 64 line is exempt. The 19% IEEPA duty ended February 24, 2026.',
    'India': 'Base rate + 10% Section 301 (9903.05.44). No Chapter 64 line is exempt. The IEEPA duties (up to 50%) ended in February 2026.',
    'Brazil': 'Base rate + 25% Section 301 (Brazil, 9903.05.01) + 12.5% Section 301 (2026, 9903.05.27). No Chapter 64 line is on the Brazil '
    'exemption list. The 50% IEEPA duties ended February 24, 2026.',
    'Bangladesh': 'Base rate + 10% Section 301 (9903.05.26). No Chapter 64 line is exempt. The 20% IEEPA duty ended February 24, 2026.',
    'Thailand': 'Base rate + 12.5% Section 301 (9903.05.77). No Chapter 64 line is exempt.',
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94). Otherwise base rate + 10% Section 301 (9903.05.55). The 25% IEEPA duty ended '
    'February 24, 2026.',
    'Canada': 'USMCA-qualifying: no Section 301 duty (9903.05.93); otherwise base rate + 10% (9903.05.29). On top, 50% Section 338 on '
    '6403.91.90 — women\'s and other non-men\'s leather ankle boots with rubber or plastic soles (9903.03.14) — whether or not USMCA is '
    'claimed.',
    'Japan': 'Base rate, or 12.5% in total where the base rate is lower (9903.05.49), plus +40% (9903.41.10, 1986) on leather-upper footwear '
    '(6403, except ski and snowboard boots) and on 6404.20 footwear whose textile upper is partly leather. Cells for those lines show both '
    'prices: "slip-on or sports footwear" (the 1986 exceptions, 12.5% or the base rate) and "other footwear" (+40%); for 6404.20 the '
    '+40% applies only to "other footwear with a leather upper".',
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81). No Chapter 64 line is on the UK exception list.',
    'Dominican Republic': 'CAFTA-DR (P) removes the base rate, but the 12.5% Section 301 duty (9903.05.34) still applies: the note 52(i) relief '
    'covers only textiles and apparel. Without a CAFTA-DR claim: base rate + 12.5%.',
}
EU_LABEL = (
    'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39) — leather shoes and boots, leather sandals, '
    'flip-flops, molded sandals, textile shoes over $12. Lines at 10% or more (most rubber, plastic and textile-upper footwear) pay only their '
    'base rate (9903.05.38). The 15%-in-total '
    'IEEPA rate ended February 24, 2026.'
)


def rule_label(c):
    r = c['rule']
    name = c['country']
    if name in RULE_LABELS:
        return RULE_LABELS[name]
    if r.get('atLeast'):
        return (
            'Countries outside the 60 Section 301 economies (for example Myanmar, Ethiopia, Kenya) pay only the base rate. The 60 pay +10% or '
            '+12.5% (9903.05.20–9903.05.84), or 10%–12.5% in total for Taiwan, South Korea and Switzerland; Brazil pays +37.5%. No note 52(j) '
            'country list exempts a Chapter 64 line. Column 2 countries (Cuba, North Korea, Russia, Belarus) pay column 2 rates — up to 84% or $1.58/pr. + 66%.'
        )
    if r['kind'] == 'eu15':
        return EU_LABEL
    raise SystemExit(f'no rule label for {name}')


for c in ia['countries']:
    c['rule']['label'] = rule_label(c)
    if c['country'] == 'Any other country':
        c['rule']['ch99Code'] = '9903.05.20–9903.05.84'
    ids = c['rule']['sourceIds']
    if c['country'] in ('Canada', 'Mexico', 'Vietnam', 'Indonesia', 'Cambodia', 'India', 'Thailand', 'China'):
        if 'eo-14389' not in ids:
            ids.insert(-1, 'eo-14389')
    if c['country'] == 'China' and 'fr-2019-27306' not in ids:
        ids.insert(-1, 'fr-2019-27306')
    if c['country'] == 'Brazil' and 'eo-14323' not in ids:
        ids.insert(-1, 'eo-14323')
add_sources(ia, ['eo-14389', 'fr-2019-27306', 'eo-14323'])

ia['seo'] = {
    'title': 'Shoe Tariffs by Country 2026 — Vietnam, China, Indonesia, Cambodia, Italy, India, Brazil (HTS Ch. 64) | KoalaGains',
    'shortDescription': 'The total 2026 U.S. tariff on footwear by country and type: textile sneakers over $12 pay 32.5% from Vietnam, 30% '
    'from Indonesia or Cambodia, 40% from China; Italian leather shoes 10% in total; Japanese leather shoes 52.5%; Brazilian up to 85.5%; '
    'USMCA shoes Free.',
    'keywords': [
        'tariffs on shoes from china',
        'tariff on shoes from vietnam',
        'tariff on shoes from italy',
        'tariff on shoes from spain',
        'tariff on shoes from japan',
        'tariff on shoes from canada',
        'tariffs on shoes from uk',
        'indonesia footwear tariff',
        'cambodia shoe tariff',
        'brazil footwear tariff',
    ],
}
ia['intro'] = (
    'Footwear base rates are among the highest in the tariff schedule, and the extra duty **depends on where the shoes come from**. Each cell '
    'below is the base rate for that product group plus the extra duty for that country, minus any preference — taken from the current tariff '
    'schedule.\n\n'
    'Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** that started July '
    '24, 2026: **+12.5% for Vietnam and Thailand**, **+10% for Indonesia, Cambodia and India**, and **10% in total for Italy, Spain, Portugal '
    'and the rest of the EU** — which adds nothing to EU rubber, plastic or textile shoes already at 10% or more. **China adds 12.5%, or 20% '
    'on the 242 List 4A lines.** **Japan** has a 12.5% floor plus the **40% duty of 1986 on leather footwear**, and **Brazil** pays +37.5%. '
    'USMCA-qualifying shoes from Mexico and Canada pay nothing, except Canadian women\'s leather ankle boots (6403.91.90), which owe the **50% '
    'Section 338 duty** whatever is claimed.'
)
assumptions = [a for a in ia['assumptions'] if 'TODO' not in a]
assumptions += [
    'Compound rates (for example 90¢/pr. + 20%) cannot be added into one percentage without the value per pair, so they are shown as written '
    'with the extra duty added to the percentage part. For EU goods, note 52(k) compares the ad valorem equivalent with 10%; every compound '
    'Chapter 64 rate is above 10% at any price, so EU goods pay just the base rate on those lines.',
    'Japan: the 1986 duty (9903.41.10) is priced both ways where it depends on the shoe. "Slip-on or sports footwear" is the excepted '
    'kind — indoor slip-ons without backs, soles under 5 mm and less than 20 mm heel rise, or cleated, ski, skating, wrestling, boxing and '
    'cycling footwear — and pays no 40%; "other footwear" pays it. In 6404.20 the 40% also needs an upper partly of leather ("upper with '
    'no leather" pays none).',
    'Canada, "USMCA-qualifying" side: the Section 301 duty is removed (9903.05.93), but the 50% Section 338 duty stays on 6403.91.90 because '
    'U.S. note 51(a) applies it even when a special rate is claimed.',
    'Not in the cells: AGOA, CBTPA and FTA preferences other than USMCA and CAFTA-DR; Chapter 98 claims; and the scheduled Nicaragua duty '
    '(9903.89.01, from January 1, 2027). No antidumping or countervailing duty order covers a Chapter 64 product, and no Section 232 action '
    'reaches Chapter 64.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied.',
]
ia['assumptions'] = assumptions
ia['exemptionCheck'] = (
    'Read U.S. notes 3, 16, 19, 20, 30, 33, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 general '
    'exemption list (note 52(b), 9903.05.86), the Chapter 98 and civil-aircraft carve-outs (52(c)–(f)) and every country exception list in note '
    '52(j) — the UK, EU, Switzerland, Malaysia, Cambodia, Guatemala, El Salvador, Argentina, Bangladesh, Taiwan, Indonesia, Ecuador and Jordan '
    'lists — name no Chapter 64 code; the CAFTA-DR relief in note 52(i) covers only textile and apparel goods. The Brazil list (note '
    '50(a)(ii)) has no Chapter 64 line. The Canada Section 338 lists (note 51(b)) name only 6403.91.90, on the 9903.03.14 list. China: note '
    '20(s) puts 91 Chapter 64 subheadings (242 lines) on List 4A; the other 56 (149 lines) are on List 4B (note 20(u)), which is suspended; no '
    'Chapter 64 line is on Lists 1–3, and no exclusion in note 20(vvv) names a Chapter 64 product. Japan: heading 9903.41.10 (note 3) reaches '
    'heading 6403 and leather-upper footwear of 6404.20, with the slip-on and sports-footwear exceptions; note 5 does not suspend it. Note '
    '30(b) sets 35% for 30 Russian lines in place of column 2. No Chapter 64 line is on a Section 232 list (notes 16, 19, 33). The 1990s '
    'Ukraine headings 9903.27.08–.09 (100% on some 6403 and 6404 lines) are printed but no longer in effect, and the temporary duty '
    'reductions for footwear in subchapter II (9902.13.xx) expired December 31, 2020. A Federal Register search of Commerce (ITA) notices '
    'found no antidumping or countervailing duty order on a Chapter 64 product.'
)

# ---------------------------------------------------------------------------------------------------
# Understand industry
# ---------------------------------------------------------------------------------------------------
ui['h1'] = f'HTS Chapter 64: {SHORT} — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Footwear Imports by Country — Shoes from Vietnam, China, Indonesia, Italy (HTS Chapter 64 Trade Statistics) | KoalaGains',
    'shortDescription': f'U.S. imports of HTS Chapter 64 footwear: {fmt_usd(total)} in {Y}. Who supplies sneakers, leather shoes, boots, '
    'sandals and shoe parts — Vietnam, China, Indonesia, Cambodia, Italy, India — with values by product and year from UN Comtrade.',
    'keywords': [
        'us footwear imports by country',
        'us shoe imports',
        'footwear imports from vietnam',
        'footwear imports from china',
        'footwear supply chain',
        'shoe manufacturers in vietnam',
        'hts chapter 64 trade statistics',
        'global footwear trade',
    ],
}
partners = ui['byYearPartners']
ui['byYearCaption'] = (
    f'U.S. imports of Chapter 64 goods each year, split into the two largest {Y} suppliers ({partners[0]} and {partners[1]}) and everyone else.'
)
WHY = None  # set below, needs the trade data
ui['effectiveDuty']['note'] = 'Duty-collected figures aren’t available from an official source yet.'
ui['effectiveDuty']['dutyPaidUsd'] = None
ui['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar years '
    f'{min(year_tot)}–{Y}. "Other Asia, nes" is how UN Comtrade reports Taiwan.'
)

exec(open(__file__.replace('fill64.py', 'fill64_trade.py')).read())

# ---------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------
exec(open(__file__.replace('fill64.py', 'fill64_te.py')).read())

# ---------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------
exec(open(__file__.replace('fill64.py', 'fill64_faq.py')).read())

# ---------------------------------------------------------------------------------------------------
# Checks
# ---------------------------------------------------------------------------------------------------
left = [m.start() for m in re.finditer('TODO', json.dumps(d))]
if left:
    s = json.dumps(d)
    raise SystemExit('TODO left: ' + ' | '.join(s[max(0, i - 120):i + 40] for i in left[:5]))
for ch in d['tariffUpdates']['changes']:
    for sid in ch['sourceIds']:
        assert sid in {s['id'] for s in tu['sources']}, sid
json.dump(d, open(OUT, 'w'), ensure_ascii=False, indent=2)
print('wrote', OUT)
