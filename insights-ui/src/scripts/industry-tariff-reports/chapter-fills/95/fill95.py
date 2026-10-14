#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 95 content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill95.py <generated.json> <out.json>
Re-runnable: run.sh regenerates the data parts, then runs this script, then compacts and formats.
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import glob
import json
import os
import re
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
WT = IU
TODAY = '2026-10-13'

d = json.load(open(SRC))

# Official sources already used (and checked) in other chapter files, by id.
REF_SOURCES = {}
for f in sorted(glob.glob(f'{WT}/src/tariff-data/chapters/*.json')):
    if '/95-' in f:
        continue
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            REF_SOURCES.setdefault(s['id'], s)

CH95_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2095'
CH98_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
CH99_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
GN_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
USC_2463 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap12-subchapV-sec2463.htm'
USC_2466A = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap12-subchapV-sec2466a.htm'
USC_4161 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title26/html/USCODE-2024-title26-subtitleD-chap32-subchapD-partI-sec4161.htm'
USC_2063 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap47-sec2063.htm'
USC_1278A = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap30-sec1278a.htm'
USC_2056B = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap47-sec2056b.htm'
CBP_REFUNDS = 'https://www.cbp.gov/trade/programs-administration/trade-remedies/ieepa-duty-refunds'
RULING_POKEMON = 'https://rulings.cbp.gov/ruling/N359352'
RULING_PICKLEBALL = 'https://rulings.cbp.gov/ruling/N347450'


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
# Sources
# ---------------------------------------------------------------------------------------------------
def fr_src(sid, citation, document, title, published, url, signed=None):
    return {
        'id': sid,
        'publisher': 'Federal Register',
        'citation': citation,
        'document': document,
        'title': title,
        'signed': signed,
        'published': published,
        'url': url,
    }


NEW_SOURCES = {
    'hts-ch95': {
        'id': 'hts-ch95',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 95',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 95: Toys, Games and Sports Equipment; Parts and '
        'Accessories Thereof',
        'signed': None,
        'published': '2026-10-07',
        'url': CH95_PDF,
    },
    'fr-2024-00741': fr_src(
        'fr-2024-00741',
        '89 FR 3344',
        'Direct final rule (CPSC)',
        'Safety Standard Mandating ASTM F963 for Toys (ASTM F963-23 becomes the mandatory toy standard, 16 CFR part 1250)',
        '2024-01-18',
        'https://www.federalregister.gov/documents/2024/01/18/2024-00741/safety-standard-mandating-astm-f963-for-toys',
    ),
    'fr-2025-22643': fr_src(
        'fr-2025-22643',
        '90 FR 57820',
        'Final rule (CPSC)',
        'Safety Standard for Toys: Requirements for Water Beads (16 CFR 1250.4, effective March 12, 2026)',
        '2025-12-12',
        'https://www.federalregister.gov/documents/2025/12/12/2025-22643/safety-standard-for-toys-requirements-for-water-beads',
    ),
    'fr-2025-22827': fr_src(
        'fr-2025-22827',
        '90 FR 58096',
        'Final rule (CPSC)',
        'Mandatory Toy Safety Standards: Requirements for Neck Floats (16 CFR 1250.5, effective June 15, 2026)',
        '2025-12-15',
        'https://www.federalregister.gov/documents/2025/12/15/2025-22827/mandatory-toy-safety-standards-requirements-for-neck-floats',
    ),
    'fr-2026-09977': fr_src(
        'fr-2026-09977',
        '91 FR 29118',
        'Notice (CPSC)',
        'Extension of the Date by Which Neck Floats Must Be Tested and Certified Subject to the Submission of Samples (to August 16, 2026)',
        '2026-05-19',
        'https://www.federalregister.gov/documents/2026/05/19/2026-09977/extension-of-the-date-by-which-neck-floats-must-be-tested-and-certified-subject-to-the-submission-of',
    ),
    'fr-2026-12695': fr_src(
        'fr-2026-12695',
        '91 FR 37957',
        'Notice (CPSC)',
        'Notice of Commission Determination Regarding Technological Feasibility of Lead Content Reduction (100 ppm lead-content and 90 ppm '
        'lead-paint limits kept)',
        '2026-06-24',
        'https://www.federalregister.gov/documents/2026/06/24/2026-12695/notice-of-commission-determination-regarding-technological-feasibility-of-lead-content-reduction',
    ),
    'cbp-n359352': {
        'id': 'cbp-n359352',
        'publisher': 'CBP',
        'citation': 'CBP ruling NY N359352',
        'document': 'New York ruling letter',
        'title': 'The tariff classification of Pokémon trading cards from Japan: subheading 9504.40.00 (playing cards)',
        'signed': None,
        'published': '2026-03-16',
        'url': RULING_POKEMON,
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
SHORT = 'Toys, Games & Sports Equipment'
d['chapter']['title'] = 'Toys, Games and Sports Equipment; Parts and Accessories Thereof'

GROUP_LABELS = {
    '9503': ('Toys, dolls, puzzles, building sets, scale models, tricycles and toy scooters', 'Toys & dolls'),
    '9504': ('Video game consoles, board and card games, billiards, arcade, casino and bowling equipment', 'Video & board games'),
    '9505': ('Christmas ornaments, artificial Christmas trees, Halloween and party articles, magic tricks', 'Christmas & festive'),
    '9506': ('Sports and exercise equipment: golf, balls, skis, skates, fitness machines, pools, archery, hockey', 'Sports & fitness'),
    '9507': ('Fishing rods, reels, hooks, line, lures and other fishing tackle; landing nets', 'Fishing tackle'),
    '9508': ('Amusement park rides, carousels, water park and fairground amusements, traveling circuses and theaters', 'Amusement rides'),
}

BLURBS = {
    '9503': (
        'Toys of every kind — dolls and plush toys, building blocks and construction sets, puzzles, ride-on toys (tricycles, toy scooters, '
        'pedal cars), toy balls and balloons, scale models and hobby kits — and their parts. One 8-digit line, 9503.00.00, Free; the '
        'statistical suffix says whether it is an inflatable ball or balloon or another toy, and the youngest age it is labeled for (under 3, '
        '3 to 12, or not a children\'s product). The extra duty by origin is what costs: 12.5% from China or Vietnam, 10% from the EU, 50% '
        'from Canada even under USMCA.',
        ['toys', 'plush toys', 'dolls', 'building blocks', 'puzzles', 'jigsaw puzzles', 'action figures', 'scale models', 'toy cars',
         'kids scooters', 'tricycles', 'balloons'],
    ),
    '9504': (
        'Video game consoles and handheld game machines with their controllers and parts (9504.50), coin- or card-operated arcade and pinball '
        'machines (9504.30), playing and trading cards (9504.40), chess, checkers, darts, dice, poker chips and other board games '
        '(9504.90.60), billiard tables and balls, bowling balls and equipment. Every line is Free; the extra duty depends on the country.',
        ['video game consoles', 'game controllers', 'handheld game console', 'arcade machines', 'pinball machines', 'playing cards',
         'trading cards', 'board games', 'chess sets', 'billiard tables', 'bowling balls', 'poker chips'],
    ),
    '9505': (
        'Christmas ornaments (of glass, wood or other materials), nativity scenes, artificial Christmas trees, wreaths and other Christmas '
        'decorations, Halloween and other holiday decorations, party favors, confetti and noisemakers, magic tricks and practical jokes. '
        'All Free. Christmas lighting strings are heading 9405, and utilitarian holiday articles (tableware, linens) are classified by '
        'material.',
        ['christmas ornaments', 'artificial christmas trees', 'christmas decorations', 'halloween decorations', 'nativity scenes',
         'party supplies', 'confetti', 'magic tricks'],
    ),
    '9506': (
        'Sports and fitness equipment. Free: golf balls, soccer balls and footballs, baseballs, tennis balls, ski and snowboard parts, '
        'water skis and surfboards, roller skates, archery, hockey and lacrosse gear. Dutiable 2.6%–5.6%: golf clubs 4.4%, golf parts 4.9%, '
        'basketballs and volleyballs 4.8%, tennis rackets 5.3%, table tennis 5.1%, treadmills, exercise bikes and other fitness equipment '
        '4.6%, swimming pools 5.3%, other sports goods 4%.',
        ['golf clubs', 'golf balls', 'basketballs', 'soccer balls', 'tennis rackets', 'exercise equipment', 'treadmills', 'exercise bikes',
         'dumbbells', 'trampolines', 'swimming pools', 'skis', 'snowboards', 'hockey sticks', 'pickleball'],
    ),
    '9507': (
        'Fishing tackle — every line is dutiable: rods 6%, hooks 4%–4.8%, reels 9.2% (up to $2.70 each), 24¢ each ($2.70–$8.45) or 3.9% '
        '(over $8.45), reel parts 5.4%, retail fishing line 3.7%, leaders 5.6%, landing and butterfly nets 5%, artificial baits and flies 9%, '
        'other tackle 9%. A separate federal excise tax of 10% (rods capped at $10) applies when the importer sells them.',
        ['fishing rods', 'fishing reels', 'fishing hooks', 'fishing line', 'fishing lures', 'artificial flies', 'fishing tackle',
         'landing nets'],
    ),
    '9508': (
        'Roller coasters, carousels and swings, bumper cars, motion simulators, water rides and water park amusements, fairground games, '
        'traveling circuses and theaters. All Free; home and playground equipment is not included.',
        ['amusement park rides', 'roller coasters', 'carousels', 'bumper cars', 'water slides', 'fairground games'],
    ),
}

ov = d['overview']
ov['h1'] = f'HTS Chapter 95: {SHORT} — Tariff Rates'
for g in ov['productGroups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['blurb'], g['searchExamples'] = BLURBS[g['heading']]

for e in ov['spiLegend']:
    if e['code'] == 'A':
        e['name'] = 'Generalized System of Preferences (GSP) — expired December 31, 2020'
    if e['code'] == 'A*':
        e['name'] = 'GSP, some beneficiary countries excluded — expired December 31, 2020'
    if e['code'] == 'A+':
        e['name'] = 'GSP, least-developed beneficiary countries only — expired December 31, 2020'
    if e['code'] == 'D':
        e['name'] = 'African Growth and Opportunity Act (AGOA), through December 31, 2026'

# ---------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------
ov['seo']['title'] = 'HTS Chapter 95 Tariffs 2026: Toy, Video Game Console & Sporting Goods Import Duty by Country | KoalaGains'
ov['seo']['shortDescription'] = (
    'Searchable 2026 U.S. tariff table for all 118 HTS Chapter 95 lines — toys, dolls, puzzles, video game consoles, board games, Christmas '
    'decorations, golf clubs, exercise equipment, fishing tackle. Base rates Free to 9.2%, plus the extra duty by country: China and Vietnam '
    '+12.5%, EU 10% in total, Canada 50% on toys and consoles.'
)
ov['seo']['keywords'] = [
    'hts chapter 95',
    'htsus chapter 95',
    'toy tariffs',
    'tariffs on toys from china',
    'hts code for toys',
    'hs code 9503',
    'hs code 9504',
    'hs code 9506',
    'video game console tariff',
    'sporting goods tariffs',
    'christmas decorations tariffs',
    'toys games and sports requisites',
]

ov['intro'] = (
    'Chapter 95 covers toys, dolls and puzzles (heading 9503), video game consoles, card, board and arcade games (9504), Christmas and other '
    'festive articles (9505), sports and exercise equipment (9506), fishing tackle (9507) and amusement park rides (9508). The base rates are '
    'among the **lowest in the tariff schedule**: 70 of the 118 lines are **Free**, including every toy, game console, playing card, '
    'Christmas decoration and amusement ride. The 48 dutiable lines are sports goods and fishing tackle, at 2.6% to 9.2% (fishing reels '
    'between $2.70 and $8.45: 24¢ each).\n\n'
    '__TRADE_PARAGRAPH__'
    'So the duty a shipment pays is mostly the **extra duty by country**. Since July 24, 2026 a Section 301 tariff on 60 economies adds '
    '**+12.5% for China, Vietnam and Thailand** and **+10% for Indonesia, Cambodia, India and Malaysia**; **EU goods pay 10% in total** and '
    '**Japanese 12.5% in total**, so a Free toy from Germany or Japan now pays 10% or 12.5%. China adds **+7.5% (List 4A)** on 81 lines, '
    'mostly sports goods — but **toys, video game consoles, playing cards, board games and most Christmas decorations were on List 4B, '
    'which was suspended**, so Chinese toys and consoles pay 12.5%. USMCA-qualifying goods from Mexico pay nothing; from **Canada, toys, '
    'video game consoles, arcade games, hockey equipment, exercise equipment, pools and other listed goods — 27 lines — pay a 50% Section '
    '338 duty even under USMCA**.'
)

for s in ov['stats']:
    if s['label'] == 'Lines with an extra duty for some origins':
        s['note'] = (
            'Section 301 (2026, 60 economies): 118; Brazil: 118; China List 4A: 81 (the other 37 — toys, consoles, games, most Christmas '
            'articles — were on the suspended List 4B); Canada Section 338: 27 (also on USMCA goods); Russia: 7 lines at 35% in lieu of '
            'column 2, 22 lines +200% on Russian aluminum'
        )

ov['workedExamples'] = [
    {
        'title': 'Toys from China — Free base rate, 12.5% in total',
        'line': '9503.00.00.73',
        'body': 'Toys labeled for ages 3 to 12 are Free. China pays the 2026 Section 301 duty (9903.05.31): **12.5%**, $1,250 on a $10,000 '
        'shipment. Toys were moved to List 4B, which USTR suspended in December 2019, so no List 4A duty is added. In April–May 2025 the same '
        'shipment paid 145% (125% reciprocal + 20% fentanyl IEEPA duties), and 20% from November 10, 2025 until the IEEPA duties ended on '
        'February 24, 2026.',
    },
    {
        'title': 'Video game consoles: China, Vietnam, Japan, Canada',
        'line': '9504.50.00.00',
        'body': 'Consoles, handheld game machines and their controllers are Free. From China or Vietnam they pay **12.5%** (9903.05.31, '
        '9903.05.84; consoles were on suspended List 4B), from Japan 12.5% in total (9903.05.49), from Malaysia or Indonesia 10%. From '
        'Canada 9504.50 is on the Section 338 list (9903.03.14): **50% even with a USMCA claim**, 60% without one.',
    },
    {
        'title': 'Golf clubs from China, Vietnam or Japan',
        'line': '9506.31.00.00',
        'body': 'Complete golf clubs pay 4.4%. 9506.31 is on China\'s List 4A, so Chinese clubs pay 4.4% + 12.5% + 7.5% = **24.4%** — $2,440 on '
        '$10,000. Vietnamese clubs pay 16.9%, Taiwanese 10% in total (9903.05.76), Japanese 12.5% in total even though the U.S.–Japan Trade '
        'Agreement (JP) removes the 4.4% (U.S. note 52(a) charges the Section 301 duty on FTA goods too). Golf balls (9506.32) are Free: 20% '
        'from China.',
    },
    {
        'title': 'Treadmills and exercise bikes from China or Taiwan',
        'line': '9506.91.00.30',
        'body': 'Exercise equipment pays 4.6%. From China it is a List 4A line: 4.6% + 12.5% + 7.5% = **24.6%**. From Taiwan 10% in total, '
        'from Vietnam 17.1%. From August 18, 2025 to April 5, 2026 the steel content of exercise equipment also paid the 50% Section 232 '
        'duty (and the aluminum content from March 12, 2025); Proclamation 11021 left 9506.91 off the new metals lists. From Canada, '
        '9506.91 owes the 50% Section 338 duty even under USMCA.',
    },
    {
        'title': 'Artificial Christmas trees and ornaments from China',
        'line': '9505.10.40.10',
        'body': 'Artificial Christmas trees of plastics are Free and pay **12.5%** from China — 9505.10.40 was on the suspended List 4B. Glass '
        'ornaments (9505.10.10) are on List 4A: 20%. Christmas light sets are not in this chapter (heading 9405). Christmas tableware and '
        'other utilitarian articles shaped like a holiday symbol can enter Free under 9817.95.05, a Chapter 98 provision the 2026 Section 301 '
        'duty does not reach.',
    },
]

snap = ov['tradeSnapshot']
snap['effectiveDutyRateNote'] = 'Duty-collected figures aren’t available from an official source yet.'
snap['totalDutyCollectedUsd'] = None

ov['notes']['chapterNotes'] = (
    '**Note 1.** This chapter does not cover: (a) candles (3406); (b) fireworks (3604); (c) fishing yarns, monofilament, cords or gut cut to '
    'length but not made up into fishing lines; (d) sports bags (4202, 4303, 4304); (e) fancy dress and sports clothing of textiles '
    '(chapters 61, 62); (f) textile flags or sails (chapter 63); (g) sports footwear (other than skating boots with skates attached) of '
    'chapter 64 or sports headgear of chapter 65; (h) walking-sticks, whips and riding-crops (6602, 6603); (ij) unmounted glass eyes for '
    'dolls (7018); (k) parts of general use of base metal or plastics; (l) bells and gongs (8306); (m) pumps, filters, electric motors, '
    'transformers, recording media, radio remote controls and infrared remote controls; (n) sports vehicles other than sleds and toboggans '
    '(section XVII); (o) children\'s bicycles (8712); (p) unmanned aircraft — drones (8806); (q) canoes, skiffs and other sports craft '
    '(chapter 89); (r) sports goggles (9004); (s) decoy calls or whistles (9208); (t) arms of chapter 93; (u) lighting strings of all '
    'kinds (9405); (v) monopods, bipods and tripods (9620); (w) racket strings, tents and camping goods, gloves and mitts (by material); or '
    '(x) tableware, kitchenware, toilet articles, carpets, apparel, bed, table, toilet and kitchen linen and similar utilitarian articles '
    '(by material; see 9817.95.01 and 9817.95.05).\n\n'
    '**Note 2.** The chapter includes articles in which pearls, precious or semiprecious stones or precious metal are only minor '
    'constituents.\n\n'
    '**Note 3.** Parts and accessories suitable for use solely or principally with articles of this chapter are classified with those '
    'articles.\n\n'
    '**Note 4.** Heading 9503 covers toys combined with other items that are not sets under General Interpretative Rule 3(b), when put up '
    'together for retail sale and the combination has the essential character of a toy.\n\n'
    '**Note 5.** Heading 9503 does not cover articles identifiable as intended exclusively for animals — pet toys are classified in their '
    'own heading.\n\n'
    '**Note 6.** For heading 9508: "amusement park rides" carry or direct persons over or through a fixed or restricted course or within a '
    'defined area for amusement, and do not include equipment of a kind commonly installed in residences or playgrounds; "water park '
    'amusements" are equipment designed specifically for water parks; "fairground amusements" are games of chance, strength or skill '
    'commonly run by an operator, other than equipment of heading 9504.\n\n'
    '**Subheading note 1.** Subheading 9504.50 covers video game consoles from which the image is reproduced on a television receiver, a '
    'monitor or another external screen or surface, and video game machines with a self-contained screen, portable or not; coin-, '
    'banknote-, card- or token-operated machines go to 9504.30.\n\n'
    '**Statistical note 1.** In heading 9503, classification follows the youngest age for which the product is intended — an item labeled '
    '"For ages 2–5" goes in the "Under 3 years of age" category. Parts and accessories not labeled for an age follow the finished retail '
    'product they belong to.'
)
ov['notes']['additionalUsNotes'] = None

# ---------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['h1'] = f'HTS Chapter 95: {SHORT} — Tariff Updates'
tu['seo'] = {
    'title': 'Toy Tariffs 2026: HTS Chapter 95 Tariff Updates Since January 2025 — China, Vietnam, Canada, Video Game Consoles | KoalaGains',
    'shortDescription': 'What changed for U.S. tariffs on toys, video game consoles, Christmas decorations and sporting goods since January '
    '2025: the IEEPA duties (up to 145% on Chinese toys) and their end, Section 122, the 2026 Section 301 tariffs, China List 4A and 4B, '
    'Canada\'s 50% Section 338 duty, Section 232 metals and the CPSC eFiling rule, with Federal Register citations.',
    'keywords': [
        'toy tariffs',
        'trump toy tariffs',
        'chinese toy tariffs',
        'us toy tariffs',
        'tariffs on video game consoles',
        'tariffs on sporting goods',
        'tariffs on christmas decorations',
        'list 4b section 301',
        'hts chapter 95 tariff updates',
        'cpsc efiling requirements',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 '
    'Revision 21** (in force October 9, 2026). **No Chapter 95 base rate changed**: all 118 lines carry the same General, Special and Column 2 '
    'rates — Free on toys, consoles, games, Christmas articles and rides, 2.6% to 9.2% on sports goods and fishing tackle.\n\n'
    'Everything that changed sits on top of the base rate. In 2025 the IEEPA duties reached toys from every country: **Chinese toys paid 145% '
    'in April–May 2025**, then 30% and from November 10, 2025 20%; Vietnam 20%, Indonesia, Cambodia, Thailand and Malaysia 19%, the EU 15% in '
    'total. The IEEPA duties **ended on February 24, 2026** (importers can claim refunds through CBP\'s CAPE process), and the 10% Section '
    '122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff**: '
    '+12.5% for China, Vietnam and Thailand, +10% for Indonesia, Cambodia, India and Malaysia, 10% in total for the EU and 12.5% in total for '
    'Japan. China still pays **+7.5% (List 4A)** on 81 lines, mostly sports goods; toys and consoles were on List 4B, which stays suspended. '
    'Since **August 22, 2026** Canadian toys, consoles, hockey equipment and other goods on 27 lines pay a **50% Section 338 duty**, even '
    'under USMCA. '
    'The Section 232 metals duties that reached exercise equipment, fishing reels and other sports goods in 2025 ended April 6, 2026, except '
    'for Russian aluminum. And since **July 8, 2026** importers of toys and other children\'s products must **eFile** their Children\'s '
    'Product Certificate data with the entry.'
)
tu['scope'] = (
    'Measures that reach Chapter 95 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 tariff, the China '
    'Section 301 List 4A duty (and the suspended List 4B), the Canada Section 338 duty, Russia\'s rates in lieu of column 2 and the 200% '
    'Section 232 duty on Russian aluminum, the Nicaragua Section 301 duty scheduled for 2027, the 2025–2026 IEEPA and Section 122 duties and '
    'Section 232 metals duties that have ended, and the suspension of de minimis. CPSC toy-safety and certificate rules are listed with their '
    'effective dates. No antidumping or countervailing duty order covers a Chapter 95 product, and no Section 232 action other than the '
    'Russian aluminum duty reaches Chapter 95 today. For the rate each supplier pays, see Rates by country.'
)

NO_52B = 'No Chapter 95 line is on the general exemption list (note 52(b)) or on any country exception list (note 52(j)). '

CA338_LINES = (
    'toys (all of 9503.00.00), coin-operated and arcade games (9504.30), video game consoles and controllers (9504.50), other game '
    'machines (9504.90.40), Christmas ornaments other than glass or wood (9505.10.25), Halloween and other festive articles (9505.90.60), '
    'golf club parts and other golf equipment (9506.39), ice skates (9506.70.40, 9506.70.60), exercise equipment (9506.91), swimming pools '
    '(9506.99.55), other sports goods (9506.99.60) and fishing rods (9507.10.00.40) on the motor-vehicle list (9903.03.14), and ice- and '
    'field-hockey equipment (9506.99.25) on the alcoholic-beverage list (9903.03.12)'
)

IN_EFFECT_TEXT = {
    'China': (
        'Two Section 301 duties stack on 81 of the 118 lines: +12.5% under the 2026 action (9903.05.31) and +7.5% under List 4A (9903.88.15, '
        'U.S. note 20(r)–(s)), which covers 57 Chapter 95 subheadings — billiard balls and accessories, coin-operated games, bowling '
        'equipment, glass Christmas ornaments, nearly all sports equipment (skis, golf clubs and balls, sports balls, ice skates, exercise '
        'equipment, pools, hockey, archery), fish hooks, reels over $8.45, fishing line and lures, and all amusement rides. The other 37 lines '
        '— 28 subheadings including **toys (9503), video game consoles (9504.50), playing cards, board games, billiard tables, Christmas '
        'decorations other than glass ornaments, artificial Christmas trees, festive articles**, table tennis, tennis and badminton rackets, '
        'roller skates, baseball equipment, fishing rods, cheaper reels and nets — were put on List 4B (9903.88.16), which USTR suspended '
        'before it took effect, so they pay only +12.5%. No current China product exclusion (note 20(vvv), (www)) covers a Chapter 95 line; '
        'the 2019–2020 exclusions for weight-machine pads and fish hooks expired. USTR\'s four-year review kept List 4A in place. The IEEPA '
        'duties on China ended February 24, 2026.',
        'Chinese toys, consoles and artificial Christmas trees pay 12.5%; golf clubs 24.4%, treadmills 24.6%, soccer balls 20%, fishing rods '
        '18.5%.',
    ),
    'Vietnam': (
        'Base rate + 12.5% (9903.05.84). ' + NO_52B + 'The 20% IEEPA reciprocal duty (9903.02.69, from August 7, 2025) ended February 24, '
        '2026.',
        'Vietnamese toys and consoles pay 12.5%, golf clubs 16.9%, exercise equipment 17.1%, fishing rods 18.5%.',
    ),
    'Mexico': (
        'USMCA-qualifying goods pay no Section 301 duty (9903.05.94); others pay +10% (9903.05.55). ' + NO_52B + 'Mexico is not subject to '
        'the Canada Section 338 duty. The 25% IEEPA duty on non-USMCA goods (9903.01.01) ended February 24, 2026.',
        'USMCA-qualifying toys and sports goods from Mexico pay nothing; non-qualifying toys pay 10%, exercise equipment 14.6%.',
    ),
    'Indonesia': (
        'Base rate + 10% (9903.05.45). ' + NO_52B + 'The 19% IEEPA reciprocal duty (9903.02.27) ended February 24, 2026.',
        'Indonesian toys and consoles pay 10%, golf clubs 14.4%.',
    ),
    'Cambodia': (
        'Base rate + 10% (9903.05.28). ' + NO_52B + 'The 19% IEEPA reciprocal duty (9903.02.11, from August 7, 2025) ended February 24, '
        '2026.',
        'Cambodian toys pay 10%, sports goods their base rate plus 10%.',
    ),
    'Taiwan': (
        'Taiwanese goods pay 10% in total where the base rate is under 10% (9903.05.76) — every Chapter 95 line. ' + NO_52B + 'The 20% IEEPA '
        'reciprocal duty ended February 24, 2026.',
        'Taiwanese exercise equipment, golf clubs, toys and fishing tackle all pay 10% in total.',
    ),
    'India': (
        'Base rate + 10% (9903.05.44). ' + NO_52B + 'The IEEPA duties on India — 25% reciprocal from August 7, 2025 plus 25% from August 27, '
        '2025 — ended in February 2026.',
        'Indian toys pay 10%, sports goods their base rate plus 10%.',
    ),
    'Canada': (
        'Two measures. The 2026 Section 301 duty (+10%, 9903.05.29) does not apply to USMCA-qualifying goods (9903.05.93). The Section 338 duty '
        '(+50%, from August 22, 2026) applies to products of Canada in 27 Chapter 95 lines: ' + CA338_LINES + '. U.S. note 51(a) applies it '
        'even when USMCA or another special rate is claimed. From September 15, 2026 Proclamation 11065 took fishing-rod parts and '
        'accessories (9507.10.00.80) off the list. No Chapter 95 product is on the September 2026 import-exclusion proclamations. The 35% '
        'IEEPA duty on non-USMCA goods (9903.01.10) ended February 24, 2026.',
        'USMCA-qualifying Canadian toys, consoles, hockey sticks and exercise equipment pay 50%; non-qualifying ones 60% plus the base rate. '
        'Other Canadian sports goods with a USMCA claim pay nothing.',
    ),
    'Thailand': (
        'Base rate + 12.5% (9903.05.77). ' + NO_52B + 'The 19% IEEPA reciprocal duty (9903.02.61) ended February 24, 2026.',
        'Thai toys pay 12.5%, sports goods their base rate plus 12.5%.',
    ),
    'European Union': (
        'EU goods whose base rate is under 10% pay 10% in total (9903.05.39) — every Chapter 95 line, since the highest base rate is 9.2%. '
        + NO_52B + 'This replaced the 15%-in-total IEEPA rate (9903.02.20), which ended February 24, 2026.',
        'German, Danish, Czech or Italian toys, games and Christmas decorations pay 10% where they paid nothing before 2025; EU golf clubs '
        'and fishing tackle 10% in total.',
    ),
    'Japan': (
        'Japanese goods pay 12.5% in total where the base rate is lower (9903.05.49) — every Chapter 95 line. The U.S.–Japan Trade Agreement '
        '(JP) makes golf clubs, golf parts, tennis rackets not strung and parts, fish hooks, reels over $8.45 and fishing line Free of the '
        'base rate, but the Section 301 duty still applies to them (note 52(a)). ' + NO_52B + 'The 15% IEEPA floor on Japanese goods ended '
        'February 24, 2026.',
        'Japanese video game consoles, trading cards, toys and golf clubs pay 12.5%.',
    ),
    'Malaysia': (
        'Base rate + 10% (9903.05.54). ' + NO_52B + 'Malaysia\'s exception list in note 52(j) names no Chapter 95 line. The 19% IEEPA '
        'reciprocal duty ended February 24, 2026.',
        'Malaysian consoles and toys pay 10%, golf equipment its base rate plus 10%.',
    ),
    'United Kingdom': (
        'Base rate + 10% (9903.05.81). ' + NO_52B + 'The 10% IEEPA reciprocal duty ended February 24, 2026.',
        'British toys and games pay 10%, golf clubs 14.4%.',
    ),
    'Brazil': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 (9903.05.27). The '
        'Brazil exemption list (U.S. note 50(a)(ii)) names no Chapter 95 line. The 40% IEEPA duty on Brazil (Executive Order 14323) and the 10% '
        'reciprocal duty ended February 24, 2026.',
        'Brazilian toys pay 37.5%, sports goods their base rate plus 37.5%.',
    ),
    'South Korea': (
        'Korean goods pay 12.5% in total where the base rate is lower (9903.05.71) — every Chapter 95 line, including those the KORUS FTA '
        'makes Free. ' + NO_52B + 'The 15% IEEPA floor ended February 24, 2026.',
        'Korean toys, games and golf equipment pay 12.5%.',
    ),
    'Philippines': (
        'Base rate + 12.5% (9903.05.64). ' + NO_52B + 'The 19% IEEPA reciprocal duty ended February 24, 2026.',
        'Philippine toys pay 12.5%.',
    ),
    'Russia': (
        'Russia pays column 2 rates (general note 3(b)) — 70% on toys, 35% on consoles, Free (racing toboggans) to 90% on other lines — plus +12.5% (9903.05.66). '
        'Seven lines pay 35% under 9903.90.08 in place of their column 2 rate (U.S. note 30): playing cards, wooden and other Christmas '
        'ornaments, other festive articles, cross-country skis and hockey equipment. Twenty-two sports and fishing lines on the aluminum '
        'derivative list of note 19(k) — exercise equipment, snowboards, tennis-racket frames and parts, roller skates, archery, baseball, '
        'football, hockey and lacrosse equipment, pools, fishing reels and nets — also pay +200% when they are products of Russia or contain '
        'Russian aluminum (9903.85.68).',
        'Russian toys and sports goods are effectively priced out.',
    ),
}
OTHER_TEXT = (
    'Rates by country: Bangladesh, Pakistan, Sri Lanka, El Salvador, Guatemala and Honduras +10%; Hong Kong, the Philippines, Türkiye, the '
    'Dominican Republic and Costa Rica +12.5%; South Korea and Switzerland 12.5% in total. ' + NO_52B + 'The CAFTA-DR relief in note 52(i) '
    'covers textiles and apparel, not toys or sports goods. Countries outside the 60 economies pay only the base rate.',
    'Philippine or Sri Lankan toys pay 12.5% or 10%; toys from a country outside the 60 economies are Free.',
)
for e in tu['inEffect']:
    key = e['country']
    if key in IN_EFFECT_TEXT:
        e['exemption'], e['whatItMeans'] = IN_EFFECT_TEXT[key]
    elif key.startswith('Other'):
        e['country'] = 'Other Section 301 economies (incl. Hong Kong, South Korea, the Philippines, Bangladesh, Switzerland, Central America)'
        e['exemption'], e['whatItMeans'] = OTHER_TEXT
    else:
        raise SystemExit(f'no inEffect text for {key}')
    if e['country'] == 'European Union':
        e['measure'] = 'Section 301 tariff (forced-labor investigations), EU rate'
    elif e['country'] == 'Canada':
        e['measure'] = 'Section 301 tariff (non-USMCA goods) + Section 338 duty (27 lines, USMCA or not)'
        e['now'] = '+10% (non-USMCA); +50% on 27 lines, USMCA or not'
    elif e['country'] == 'China':
        e['measure'] = 'Section 301 tariffs: 2026 action plus List 4A'
        e['before'] = '+7.5% (List 4A, 81 lines)'
        e['now'] = '+20% on 81 lines; +12.5% on the 37 former List 4B lines (toys, consoles, games)'
        for sid in ('fr-2019-27306',):
            if sid not in e['sourceIds']:
                e['sourceIds'].insert(-1, sid)
    elif e['country'] == 'Brazil':
        e['measure'] = 'Section 301 tariffs: Brazil action plus 2026 forced-labor action'
        if 'eo-14323' not in e['sourceIds']:
            e['sourceIds'].insert(-1, 'eo-14323')
    elif e['country'] == 'Russia':
        e['measure'] = 'Section 301 tariff + rates in lieu of column 2 (7 lines) + Section 232 Russian aluminum (22 lines)'
        e['before'] = '35% in lieu of column 2 (7 lines); +200% Russian aluminum (22 lines)'
        e['now'] = '+12.5%; 35% in lieu of column 2 on 7 lines; +200% on 22 lines with Russian aluminum'
    elif e['country'] in ('Japan', 'Taiwan', 'South Korea'):
        e['measure'] = 'Section 301 tariff (forced-labor investigations), floor rate'
    else:
        e['measure'] = 'Section 301 tariff (forced-labor investigations)'

# --- change log -----------------------------------------------------------------------------------
for c in tu['changes']:
    if c['id'].startswith('section-301-nicaragua'):
        c['date'] = '2025-12-29'
        c['title'] = 'Scheduled: Section 301 tariff on products of Nicaragua'
        c['detail'] = (
            'USTR\'s implementation notice: products of Nicaragua that pay the column 1-general rate (that is, not entered under CAFTA-DR) will '
            'pay +10% (9903.89.01) from January 1, 2027 and +15% from January 1, 2028, on every Chapter 95 line. Today Nicaragua pays the 12.5% '
            '2026 Section 301 duty (9903.05.58).'
        )
    elif c['id'].startswith('section-338-canada-end'):
        c['date'] = '2026-09-15'
        c['dateLabel'] = 'Effective'
        c['title'] = 'Canada Section 338 list revised: fishing-rod parts removed'
        c['detail'] = (
            'Proclamation 11065 (Annex I, Part B) took fishing-rod parts and accessories (9507.10.00.80) off the motor-vehicle list from '
            'September 15, 2026; fishing rods themselves (9507.10.00.40) stay at 50%. Proclamations 11064 and 11065 added no Chapter 95 '
            'provision, and from this date the duty also applies on top of any Section 232 duty.'
        )
        c['before'] = '+50%'
        c['now'] = 'None (9507.10.00.80)'
        for sid in ('procl-11064',):
            if sid not in c['sourceIds']:
                c['sourceIds'].insert(0, sid)
    elif c['id'].startswith('section-338-canada'):
        c['title'] = 'Canada Section 338 duty: 50% on Canadian toys, consoles, hockey sticks and sports goods'
        c['detail'] = (
            'Proclamations 11046 and 11048 (July 20, 2026) imposed a 50% duty on listed products of Canada after Proclamation 11056 moved the '
            'start from August 19 to August 22, 2026. In Chapter 95 it reached 28 lines: ' + CA338_LINES + ', and fishing-rod parts and '
            'accessories (9507.10.00.80) until September 14. Unlike the Section 301 duty, it applies to USMCA-qualifying goods too (U.S. note 51(a)).'
        )
    elif c['id'].startswith('section-301-2026-60-economies'):
        c['title'] = 'Section 301 tariffs on 60 economies cover all of Chapter 95'
        c['detail'] = (
            '10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). No Chapter 95 line is on the general exemption list (note '
            '52(b)) or on any country exception list (note 52(j)). China, Vietnam, Thailand and the Philippines +12.5%; Indonesia, Cambodia, '
            'India and Malaysia +10%. EU goods pay 10% in total and Japanese and Korean 12.5% in total — on Free toys and games that is the '
            'whole rate. FTA goods pay it too (note 52(a)). USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94).'
        )
    elif c['id'].startswith('section-301-brazil'):
        c['title'] = 'Section 301 tariff on products of Brazil'
        c['detail'] = (
            '25% on all goods of Brazil (9903.05.01). No Chapter 95 line is on the Brazil exemption list (U.S. note 50(a)(ii)). From July 24 the '
            '12.5% forced-labor tariff (9903.05.27) is added on top.'
        )
    elif c['id'].startswith('section-232-aluminum-russia'):
        c['title'] = 'Section 232 aluminum duty reaches 22 sports and fishing lines'
        c['detail'] = (
            'Proclamation 10895 extended the aluminum duty to the derivative articles Commerce listed (90 FR 11251), including 22 Chapter 95 '
            'lines: snowboards (9506.11.40.80), tennis-racket frames and parts (9506.51.40, .60), badminton rackets (9506.59.40.40), roller '
            'skates (9506.70.20.90), exercise equipment (9506.91), archery (9506.99.05), baseball, football, hockey and lacrosse equipment, '
            'swimming pools, other sports goods (9506.99.60.80), fishing reels and parts (9507.30) and landing nets (9507.90.60). From all '
            'countries: 25% on the value of the aluminum content (9903.85.08), 50% from June 4, 2025, ended April 6, 2026. Products of Russia '
            'or made with Russian aluminum: 200% (9903.85.68), still in force.'
        )
        c['before'] = 'None'
        c['now'] = '+25% of aluminum content (ended); Russia +200%'
        c['countries'] = 'All; Russia'
        if 'fr-2025-03596' not in c['sourceIds']:
            c['sourceIds'].insert(0, 'fr-2025-03596')
    elif c['id'] == 'base-rates':
        c['detail'] = (
            'All 118 Chapter 95 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition, and no '
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
        'toys are entered, not their duty rate.',
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
        'for them to continue. For Chapter 95 this keeps +7.5% (List 4A, 9903.88.15) on 81 lines; List 4B, with toys and consoles, stays '
        'suspended.',
        'before': '+7.5%',
        'now': '+7.5%',
        'countries': 'China',
        'sourceIds': ['fr-2026-20510'],
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
        'title': 'CPSC eFiling: certificate data must be filed with the entry',
        'detail': 'CPSC\'s revised certificates rule (16 CFR part 1110) took effect: importers of toys and other products that need a '
        'Children\'s Product Certificate or General Certificate of Conformity must eFile the certificate data elements in ACE when they file '
        'the entry (for mail shipments, in CPSC\'s Product Registry before arrival). Goods entered from a foreign-trade zone follow from '
        'January 8, 2027. It adds no duty.',
        'before': 'Certificate available on request',
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
        'resolution of the issues or until termination, so USMCA claims (SPI S) still remove the Section 301 duty on Mexican and Canadian '
        'goods — but not the Section 338 duty on the 27 listed Canadian lines.',
        'before': None,
        'now': None,
        'countries': 'Canada, Mexico',
        'sourceIds': ['ustr-usmca-review'],
    },
    {
        'id': 'cpsc-lead',
        'type': 'reference',
        'date': '2026-06-24',
        'dateLabel': 'Published',
        'title': 'CPSC keeps the lead limits for toys and children\'s products',
        'detail': 'CPSC\'s periodic review found that the current limits — 100 ppm lead in any accessible component of a children\'s product '
        'and 90 ppm (0.009%) lead in paint and surface coatings — are already the lowest technologically feasible, so it did not change them.',
        'before': '100 ppm / 90 ppm',
        'now': '100 ppm / 90 ppm',
        'countries': 'All',
        'sourceIds': ['fr-2026-12695'],
    },
    {
        'id': 'dm-ifr',
        'type': 'reference',
        'date': '2026-06-24',
        'dateLabel': 'Effective',
        'title': 'CBP suspends de minimis indefinitely',
        'detail': 'Two interim final rules suspend the $800 de minimis exemption in CBP\'s regulations: 19 CFR 10.151(b) for every mode except '
        'mail, and 19 CFR 145.31(b) for mail, until CBP announces otherwise. A toy shipped direct to a U.S. consumer needs an entry and pays the '
        'full duty — base rate plus the extra duty for its origin. The new postal informal entry process took effect July 24, 2026.',
        'before': 'Free under $800',
        'now': 'Full duty, any value',
        'countries': 'All',
        'sourceIds': ['cbp-ifr-dm', 'cbp-ifr-mail'],
    },
    {
        'id': 'cpsc-neck-floats',
        'type': 'reference',
        'date': '2026-06-15',
        'dateLabel': 'Effective',
        'title': 'CPSC toy standard adds neck-float requirements',
        'detail': 'A new 16 CFR 1250.5 sets performance and labeling requirements for baby neck floats under the toy standard. Third-party '
        'testing and certification was extended to August 16, 2026 for importers that submitted a sample to CPSC.',
        'before': None,
        'now': None,
        'countries': 'All',
        'sourceIds': ['fr-2025-22827', 'fr-2026-09977'],
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
        'period. The Section 301, List 4A and Section 338 duties are not refunded.',
        'before': None,
        'now': None,
        'countries': 'All',
        'sourceIds': ['cbp-ieepa-refunds'],
    },
    {
        'id': 's232-end',
        'type': 'extraDuty',
        'date': '2026-04-06',
        'dateLabel': 'Effective',
        'title': 'Section 232 metals duties on sports goods end (except Russia)',
        'detail': 'Proclamation 11021 replaced the Section 232 aluminum and steel derivative headings with new 9903.82 headings and new product '
        'lists (U.S. note 16(c)). No Chapter 95 line is on them, so exercise equipment, fishing reels, pools and the other derivative lines no '
        'longer pay a metals duty. The 200% duty on Russian aluminum (9903.85.68) still applies to the 22 lines.',
        'before': '+50% of the metal content',
        'now': 'None (Russia: +200%)',
        'countries': 'All',
        'sourceIds': ['procl-11021', 'fr-2026-08297', 'hts-chapter-99', 'hts-now'],
    },
    {
        'id': 'cpsc-water-beads',
        'type': 'reference',
        'date': '2026-03-12',
        'dateLabel': 'Effective',
        'title': 'CPSC toy standard adds water-bead requirements',
        'detail': 'A new 16 CFR 1250.4 sets performance and labeling requirements for water bead toys and toys containing water beads, in '
        'addition to ASTM F963-23.',
        'before': None,
        'now': None,
        'countries': 'All',
        'sourceIds': ['fr-2025-22643'],
    },
    {
        'id': 's122-start',
        'type': 'extraDuty',
        'date': '2026-02-24',
        'dateLabel': 'Effective',
        'title': 'Section 122 surcharge replaces the IEEPA tariffs',
        'detail': '10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 95 subheading was on the product exemption '
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
        'the dutiable sports and fishing lines of Chapter 95 Free for eligible sub-Saharan countries; toys and games are Free for everyone. GSP '
        '(SPI A) remains expired since December 31, 2020.',
        'before': 'Lapsed (from September 30, 2025)',
        'now': 'In force to December 31, 2026',
        'countries': 'AGOA beneficiary countries',
        'sourceIds': ['ustr-agoa-2026', 'crs-agoa', 'procl-11030', 'usc-2466a', 'cbp-gsp', 'hts-now'],
    },
    {
        'id': 'cn-ieepa-cut',
        'type': 'extraDuty',
        'date': '2025-11-10',
        'dateLabel': 'Effective',
        'title': 'China fentanyl duty cut to 10%',
        'detail': 'The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%, so Chinese toys and consoles paid 20% '
        '(10% + 10% reciprocal) until February 23, 2026.',
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
        'entered from August 29, 2025. Toys ordered online from overseas sellers have paid duty since then.',
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
        '(EO 14326): 50% in all on Indian toys and sports goods. Ended February 7, 2026.',
        'before': '+25%',
        'now': '+50% (ended)',
        'countries': 'India',
        'sourceIds': ['eo-14329', 'eo-14326'],
    },
    {
        'id': 's232-steel-9506',
        'type': 'extraDuty',
        'date': '2025-08-18',
        'dateLabel': 'Effective',
        'title': 'Exercise equipment added to the Section 232 steel derivative list',
        'detail': 'Commerce\'s first inclusions round added 9506.91.00 (exercise cycles, rowing machines and other fitness equipment) to the '
        'steel derivative list of U.S. note 16: 50% on the value of the steel content, on top of the aluminum duty already charged on its '
        'aluminum content. Ended April 6, 2026.',
        'before': None,
        'now': '+50% of steel content (ended)',
        'countries': 'All',
        'sourceIds': ['fr-2025-15819'],
    },
    {
        'id': 'country-rates',
        'type': 'extraDuty',
        'date': '2025-08-07',
        'dateLabel': 'Effective',
        'title': 'Country reciprocal rates replace the 10% baseline',
        'detail': 'Executive Order 14326 set country rates for goods entered from August 7, 2025: Indonesia, Cambodia, Thailand, Malaysia and the '
        'Philippines +19%, Vietnam, Taiwan and Bangladesh +20%, India +25%, the UK +10%. EU goods with a column 1 rate under 15% paid 15% in '
        'total (9903.02.20) — so a Free German toy paid 15%. Ended February 24, 2026.',
        'before': '+10%',
        'now': '+10% to +25% (ended)',
        'countries': 'Listed countries, European Union',
        'sourceIds': ['eo-14326', 'hts-now'],
    },
    {
        'id': 'brazil-ieepa',
        'type': 'extraDuty',
        'date': '2025-08-06',
        'dateLabel': 'Effective',
        'title': 'Extra 40% on products of Brazil',
        'detail': 'Executive Order 14323 added 40% on Brazilian goods, on top of the 10% reciprocal duty: 50% in all on Brazilian toys and sports '
        'goods. Ended February 24, 2026.',
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
        'id': 's232-50',
        'type': 'extraDuty',
        'date': '2025-06-04',
        'dateLabel': 'Effective',
        'title': 'Section 232 doubled to 50% on the metal content',
        'detail': 'Proclamation 10947 raised the aluminum and steel duties from 25% to 50% (UK stayed at 25%). For the 22 Chapter 95 aluminum '
        'derivative lines it applied to the value of the aluminum content. Ended April 5, 2026.',
        'before': '+25%',
        'now': '+50% (UK +25%) (ended)',
        'countries': 'All except UK',
        'sourceIds': ['procl-10947'],
    },
    {
        'id': 'cn-reciprocal-10',
        'type': 'extraDuty',
        'date': '2025-05-14',
        'dateLabel': 'Effective',
        'title': 'China reciprocal duty cut from 125% to 10%',
        'detail': 'Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. Chinese toys and '
        'consoles then paid 30% (10% + 20% fentanyl) until November 9, 2025. Ended February 24, 2026.',
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
        'fentanyl duty, Chinese toys and consoles paid 145% until May 13, 2025, and List 4A sports goods 152.5% plus the base rate.',
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
        'detail': '10% baseline (9903.01.25) from April 5, 2025, and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 95 '
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
        'the first extra duty on Chinese toys since List 4B was suspended in 2019. Ended February 24, 2026.',
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
        'detail': '+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt from March 7, 2025. Ended February 24, 2026.',
        'before': 'None',
        'now': '+25% (ended)',
        'countries': 'Mexico',
        'sourceIds': ['eo-14194', 'eo-14232'],
    },
    {
        'id': 'ca-imposed',
        'type': 'extraDuty',
        'date': '2025-02-01',
        'dateLabel': 'Signed',
        'title': 'Additional duty on products of Canada',
        'detail': '+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt from March 7, 2025. Ended February '
        '24, 2026.',
        'before': 'None',
        'now': '+25% (ended)',
        'countries': 'Canada',
        'sourceIds': ['eo-14193', 'eo-14231'],
    },
    {
        'id': 'cpsc-f963-23',
        'type': 'reference',
        'date': '2024-04-20',
        'dateLabel': 'Effective',
        'title': 'ASTM F963-23 becomes the mandatory U.S. toy standard',
        'detail': 'CPSC\'s direct final rule made ASTM F963-23 the toy safety standard of 16 CFR part 1250 (section 106 of the CPSIA). Toys for '
        'children 12 and under must be third-party tested to it by a CPSC-accepted laboratory and certified on a Children\'s Product '
        'Certificate.',
        'before': 'ASTM F963-17',
        'now': 'ASTM F963-23',
        'countries': 'All',
        'sourceIds': ['fr-2024-00741'],
    },
    {
        'id': 'cn-4a-cut',
        'type': 'extraDuty',
        'date': '2020-02-14',
        'dateLabel': 'Effective',
        'title': 'China List 4A duty cut to 7.5%',
        'detail': 'Under the Phase One agreement USTR cut the List 4A duty (9903.88.15) from 15% to 7.5%. The rate on the 81 Chapter 95 lines '
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
        'title': 'China List 4B — toys and consoles — suspended before it took effect',
        'detail': 'USTR suspended indefinitely the 15% List 4B duty (9903.88.16) that was to start December 15, 2019. List 4B held 28 Chapter 95 '
        'subheadings — toys, video game consoles, playing cards, board games, most Christmas decorations, artificial Christmas trees, festive '
        'articles, rackets, roller skates, fishing rods and cheaper reels — so those Chinese goods never paid a China Section 301 list duty.',
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
        'title': 'China Section 301 List 4A reaches sports goods',
        'detail': 'The fourth China Section 301 list put +15% on 57 Chapter 95 subheadings: billiard and bowling equipment, coin-operated games, '
        'glass Christmas ornaments, most sports and exercise equipment, fish hooks, lures and reels over $8.45, and amusement rides. No '
        'Chapter 95 line was on Lists 1–3.',
        'before': 'None',
        'now': '+15%',
        'countries': 'China',
        'sourceIds': ['fr-2019-17865'],
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
        'procl-11012',
        'csms-67844987',
        'fr-2024-30826',
        'fr-2025-18521',
        'ustr-usmca-review',
        'fr-2026-12695',
        'cbp-ifr-dm',
        'cbp-ifr-mail',
        'fr-2025-22827',
        'fr-2026-09977',
        'cbp-nprm-lvs',
        'cbp-ieepa-refunds',
        'procl-11021',
        'fr-2026-08297',
        'fr-2025-22643',
        'scotus-24-1287',
        'eo-14389',
        'csms-67834313',
        'eo-14388',
        'eo-14384',
        'ustr-agoa-2026',
        'crs-agoa',
        'procl-11030',
        'usc-2466a',
        'cbp-gsp',
        'eo-14357',
        'eo-14324',
        'cbp-dm-2025',
        'eo-14329',
        'eo-14326',
        'fr-2025-15819',
        'eo-14325',
        'pl-119-21',
        'procl-10947',
        'eo-14298',
        'eo-14266',
        'eo-14257',
        'fr-2025-03596',
        'eo-14195',
        'eo-14228',
        'eo-14194',
        'eo-14232',
        'eo-14193',
        'eo-14231',
        'fr-2024-00741',
        'fr-2020-00904',
        'fr-2019-17865',
    ],
)

stats = [s for s in tu['stats'] if s['label'] != 'IEEPA duties']
stats.append({'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'})
tu['stats'] = stats

# ---------------------------------------------------------------------------------------------------
# Industry areas (matrix)
# ---------------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['h1'] = f'HTS Chapter 95: {SHORT} — Tariff Rates by Country'
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]

RULE_LABELS = {
    'China': 'Base rate + 12.5% Section 301 (9903.05.31), plus 7.5% List 4A (9903.88.15) on 81 of the 118 lines — sports and fitness '
    'equipment, billiards and bowling, coin-operated games, glass ornaments, most fishing tackle, amusement rides. The 37 lines of the '
    'suspended List 4B — toys, video game consoles, playing cards, board games, most Christmas decorations, rackets, fishing rods — pay only '
    'the 12.5%.',
    'Vietnam': 'Base rate + 12.5% Section 301 (9903.05.84). No Chapter 95 line is exempt. The 20% IEEPA duty ended February 24, 2026.',
    'Indonesia': 'Base rate + 10% Section 301 (9903.05.45). No Chapter 95 line is exempt. The 19% IEEPA duty ended February 24, 2026.',
    'Cambodia': 'Base rate + 10% Section 301 (9903.05.28). No Chapter 95 line is exempt. The 19% IEEPA duty ended February 24, 2026.',
    'India': 'Base rate + 10% Section 301 (9903.05.44). No Chapter 95 line is exempt. The IEEPA duties (up to 50%) ended in February 2026.',
    'Thailand': 'Base rate + 12.5% Section 301 (9903.05.77). No Chapter 95 line is exempt.',
    'Malaysia': 'Base rate + 10% Section 301 (9903.05.54). No Chapter 95 line is exempt. The 19% IEEPA duty ended February 24, 2026.',
    'Philippines': 'Base rate + 12.5% Section 301 (9903.05.64). No Chapter 95 line is exempt.',
    'Brazil': 'Base rate + 25% Section 301 (Brazil, 9903.05.01) + 12.5% Section 301 (2026, 9903.05.27). No Chapter 95 line is on the Brazil '
    'exemption list. The 50% IEEPA duties ended February 24, 2026.',
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94). Otherwise base rate + 10% Section 301 (9903.05.55). The 25% IEEPA duty ended '
    'February 24, 2026.',
    'Canada': 'USMCA-qualifying: no Section 301 duty (9903.05.93); otherwise base rate + 10% (9903.05.29). On top, 50% Section 338 on 27 '
    'lines whether or not USMCA is claimed: toys (9503), arcade games, video game consoles and other game machines, Christmas and festive '
    'articles of 9505.10.25 and 9505.90.60, golf parts, ice skates, exercise equipment, pools, other sports goods, fishing rods '
    '(9903.03.14) and hockey equipment (9903.03.12).',
    'Taiwan': 'Taiwan: 10% in total in place of the base rate (9903.05.76) — every Chapter 95 base rate is under 10%. The 20% IEEPA duty ended '
    'February 24, 2026.',
    'Japan': 'Japan: 12.5% in total in place of the base rate (9903.05.49), also on golf clubs, tennis rackets and fishing tackle made Free '
    'by the U.S.–Japan Trade Agreement. The 15% IEEPA floor ended February 24, 2026.',
    'South Korea': 'South Korea: 12.5% in total in place of the base rate (9903.05.71), also on lines KORUS makes Free.',
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81). No Chapter 95 line is on the UK exception list.',
}
EU_LABEL = (
    'EU: 10% in total in place of the base rate (9903.05.39) — every Chapter 95 line, from Free toys to 9.2% fishing reels, pays 10%. The '
    '15%-in-total IEEPA rate ended February 24, 2026.'
)


def rule_label(c):
    r = c['rule']
    name = c['country']
    if name in RULE_LABELS:
        return RULE_LABELS[name]
    if r.get('atLeast'):
        return (
            'Countries outside the 60 Section 301 economies pay only the base rate — Free on toys, games and Christmas articles. The 60 pay '
            '+10% or +12.5% (9903.05.20–9903.05.84), or 10%–12.5% in total for the EU, Japan, Taiwan, South Korea and Switzerland; Brazil pays '
            '+37.5%. No note 52(j) country list exempts a Chapter 95 line. Column 2 countries (Cuba, North Korea, Russia, Belarus) pay column 2 '
            'rates — 70% on toys, up to 90% on Christmas articles.'
        )
    if r['kind'] == 'eu15':
        return EU_LABEL
    raise SystemExit(f'no rule label for {name}')


for c in ia['countries']:
    c['rule']['label'] = rule_label(c)
    if c['country'] == 'Any other country':
        c['rule']['ch99Code'] = '9903.05.20–9903.05.84'
    ids = c['rule']['sourceIds']
    if c['country'] in ('Canada', 'Mexico', 'Vietnam', 'Indonesia', 'Cambodia', 'India', 'Thailand', 'China', 'Malaysia', 'Taiwan'):
        if 'eo-14389' not in ids:
            ids.insert(-1, 'eo-14389')
    if c['country'] == 'China' and 'fr-2019-27306' not in ids:
        ids.insert(-1, 'fr-2019-27306')
    if c['country'] == 'Brazil' and 'eo-14323' not in ids:
        ids.insert(-1, 'eo-14323')
add_sources(ia, ['eo-14389', 'fr-2019-27306', 'eo-14323'])

ia['seo'] = {
    'title': 'Toy Tariffs by Country 2026 — China, Vietnam, Mexico, Canada, EU, Japan: Toys, Consoles & Sporting Goods (HTS Ch. 95) | '
    'KoalaGains',
    'shortDescription': 'The total 2026 U.S. tariff on toys, video game consoles, Christmas decorations, sporting goods and fishing tackle by '
    'country: Chinese and Vietnamese toys 12.5%, Chinese golf clubs 24.4%, EU toys 10%, Japanese 12.5%, Canadian toys and consoles 50% even '
    'under USMCA, Mexican USMCA goods Free.',
    'keywords': [
        'tariffs on toys from china',
        'tariffs on toys from vietnam',
        'tariffs on toys from canada to us',
        'tariffs on toys from japan',
        'canada tariff video game consoles',
        'us tariffs on sporting goods',
        'golf club tariffs',
        'fishing tackle tariffs',
        'artificial christmas tree tariffs',
        'gym equipment tariffs',
    ],
}
ia['intro'] = (
    'Most Chapter 95 goods have **no base duty**, so the tariff a shipment pays **depends almost entirely on where it comes from**. Each cell '
    'below is the base rate for that product group plus the extra duty for that country, minus any preference — taken from the current '
    'tariff schedule.\n\n'
    'Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** that started July '
    '24, 2026: **+12.5% for China, Vietnam and Thailand**, **+10% for Indonesia, Cambodia, India and Malaysia**, and **10% in total for '
    'Taiwan and the EU, 12.5% for Japan and South Korea** — which on a Free toy is the whole duty. **China adds 7.5% more on the 81 List 4A '
    'lines** (mostly sports goods), but not on toys or consoles. **Brazil** pays +37.5%. USMCA-qualifying goods from Mexico pay nothing; '
    'from **Canada**, toys, video game consoles, hockey equipment, exercise equipment and the other goods on 27 listed lines owe the **50% '
    'Section 338 duty** whatever is claimed.'
)
assumptions = [a for a in ia['assumptions'] if 'TODO' not in a]
assumptions += [
    'Fishing reels valued over $2.70 but not over $8.45 each pay 24¢ each; that per-unit rate is shown as written, with the extra duty added '
    'as a percentage. For EU, Japanese, Taiwanese and Korean goods, note 52(k) compares the ad valorem equivalent with the floor; 24¢ on a '
    'reel of $2.70–$8.45 is under 10%, so the floor applies.',
    'Canada, "USMCA-qualifying" side: the Section 301 duty is removed (9903.05.93), but the 50% Section 338 duty stays on the 27 listed lines '
    'because U.S. note 51(a) applies it even when a special rate is claimed.',
    'Russia is not a column: its goods pay column 2 rates plus 12.5%, 35% in lieu of column 2 on 7 lines, and +200% on 22 lines made with '
    'Russian aluminum.',
    'Not in the cells: AGOA, CAFTA-DR and FTA preferences other than USMCA (they remove only the base rate, and most Chapter 95 lines are '
    'Free anyway); Chapter 98 claims such as 9817.95.05; the federal excise tax on fishing tackle and archery; and the scheduled Nicaragua '
    'duty (9903.89.01, from January 1, 2027). No antidumping or countervailing duty order covers a Chapter 95 product.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026, and the Section 232 aluminum and steel derivative duties (9903.85.08, 9903.81.91) on sports goods '
    'ended April 6, 2026; none is applied.',
]
ia['assumptions'] = assumptions
ia['exemptionCheck'] = (
    'Read U.S. notes 16, 19, 20, 30, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 general exemption '
    'list (note 52(b), 9903.05.86), the Chapter 98 and civil-aircraft carve-outs (52(c)–(f)) and every country exception list in note 52(j) '
    '— the UK, EU, Switzerland, Malaysia, Cambodia, Guatemala, El Salvador, Argentina, Bangladesh, Taiwan, Indonesia, Ecuador and Jordan lists '
    '— name no Chapter 95 code; the CAFTA-DR relief in note 52(i) covers only textile and apparel goods. The Brazil list (note 50(a)(ii)) has '
    'no Chapter 95 line. The Canada Section 338 lists name 13 Chapter 95 provisions (25 lines) on the 9903.03.14 list (note 51(b)(3)) and '
    '9506.99.25 (2 lines) on the 9903.03.12 list (note 51(b)(1)); Proclamation 11065 removed 9507.10.00.80 from September 15, 2026. China: note 20(s) puts 57 Chapter '
    '95 subheadings (81 lines) on List 4A; the other 28 (37 lines) are on List 4B (note 20(u)), which is suspended; no Chapter 95 line is on '
    'Lists 1–3 or the 2024 increases (note 31), and the only Chapter 95 product exclusions (weight-machine pads, unsnelled fish hooks, '
    'arrowheads, swim masks and other items in notes 20(iii)–(ttt)) have expired; the exclusions still in effect (notes 20(vvv) and (www)) '
    'name no Chapter 95 product. Note 30(b) sets 35% for 7 Russian lines in place of column 2. Note 19(k) still lists 22 Chapter 95 lines, '
    'now charged only for Russian aluminum (9903.85.68); no Chapter 95 line is on the note 16(c) metals lists of Proclamation 11021. The '
    'temporary duty reductions for sports goods in subchapter II (9902.16.xx–9902.17.xx) expired December 31, 2020. A Federal Register search '
    'of Commerce (ITA) notices found no antidumping or countervailing duty order on a Chapter 95 product.'
)

# ---------------------------------------------------------------------------------------------------
# Understand industry (trade text in fill95_trade.py)
# ---------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
ui['h1'] = f'HTS Chapter 95: {SHORT} — U.S. Import Statistics'
ui['effectiveDuty']['note'] = 'Duty-collected figures aren’t available from an official source yet.'
ui['effectiveDuty']['dutyPaidUsd'] = None

exec(open(os.path.join(HERE, 'fill95_trade.py')).read())

# ---------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------
exec(open(os.path.join(HERE, 'fill95_te.py')).read())

# ---------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------
exec(open(os.path.join(HERE, 'fill95_faq.py')).read())

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
