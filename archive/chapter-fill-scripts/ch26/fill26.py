#!/usr/bin/env python3
"""Fill the writer parts of HTS Chapter 26 (Ores, Slag and Ash) on top of the generator output.

Re-run after a regeneration:
    ./gen.sh && python3 fill26.py
Reads gen.json (this folder) + the trade file, writes insights-ui/src/tariff-data/chapters/26-ores-slag-and-ash.json
and formats it with the repo's prettier.
"""
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = '/Users/robin/projects/worktrees/chapter-migration-1810-batch1/insights-ui'
OUT = os.path.join(REPO, 'src/tariff-data/chapters/26-ores-slag-and-ash.json')
TRADE = os.path.join(REPO, 'src/tariff-data/trade/chapter-26.json')
TODAY = '2026-10-12'
ECFR_AS_OF = '2026-10-08'

d = json.load(open(os.path.join(HERE, 'gen.json')))
trade = json.load(open(TRADE))

# ---------------------------------------------------------------------------------------------
# trade helpers
# ---------------------------------------------------------------------------------------------
def money(n):
    if n >= 1e9:
        return f'${n / 1e9:.2f}B'
    if n >= 1e6:
        return f'${n / 1e6:.0f}M' if n >= 1e8 else f'${n / 1e6:.1f}M'.replace('.0M', 'M')
    return f'${n / 1e3:.0f}K'

TOTAL = trade['totalsByYear'][-1]['totalUsd']
PRIOR = trade['totalsByYear'][-2]['totalUsd']
CTRY = {c['country']: c for c in trade['byCountry']}
HC = {(h['country'], h['heading']): h['importsUsd'] for h in trade['byHeadingCountry']}
HS6 = {h['hs6']: h for h in trade['byHs6']}
HEAD = {h['heading']: h for h in trade['byHeading']}

def c(name):
    return money(CTRY[name]['importsUsd'])

def hc(name, heading):
    return money(HC[(name, heading)])

def hs6(code):
    return money(HS6[code]['importsUsd'])

def head(h):
    return money(HEAD[h]['byYear']['2025'])

assert abs(TOTAL - 3849156157) < 1, 'trade total changed: re-check the prose figures'
chg = (TOTAL / PRIOR - 1) * 100

# ---------------------------------------------------------------------------------------------
# sources (tariffUpdates.sources + industryAreas.sources)
# ---------------------------------------------------------------------------------------------
FR = 'https://www.federalregister.gov/documents/'
NEW_SOURCES = [
    dict(id='hts-ch26', publisher='USITC', citation='HTSUS 2026 Revision 21, Chapter 26', document='Harmonized Tariff Schedule',
         title='Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 26: Ores, Slag and Ash', signed=None,
         published='2026-10-07', url='https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2026'),
    dict(id='eo-14193', publisher='Federal Register', citation='90 FR 9113', document='Executive Order 14193',
         title='Imposing Duties To Address the Flow of Illicit Drugs Across Our Northern Border', signed='2025-02-01', published='2025-02-07',
         url=FR + '2025/02/07/2025-02406/imposing-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border'),
    dict(id='eo-14194', publisher='Federal Register', citation='90 FR 9117', document='Executive Order 14194',
         title='Imposing Duties To Address the Situation at Our Southern Border', signed='2025-02-01', published='2025-02-07',
         url=FR + '2025/02/07/2025-02407/imposing-duties-to-address-the-situation-at-our-southern-border'),
    dict(id='eo-14231', publisher='Federal Register', citation='90 FR 11785', document='Executive Order 14231',
         title='Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border', signed='2025-03-06', published='2025-03-11',
         url=FR + '2025/03/11/2025-03990/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border'),
    dict(id='eo-14232', publisher='Federal Register', citation='90 FR 11787', document='Executive Order 14232',
         title='Amendment to Duties To Address the Flow of Illicit Drugs Across Our Southern Border', signed='2025-03-06', published='2025-03-11',
         url=FR + '2025/03/11/2025-03991/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-southern-border'),
    dict(id='eo-14257', publisher='Federal Register', citation='90 FR 15041', document='Executive Order 14257',
         title='Regulating Imports With a Reciprocal Tariff To Rectify Trade Practices That Contribute to Large and Persistent Annual United States Goods Trade Deficits',
         signed='2025-04-02', published='2025-04-07',
         url=FR + '2025/04/07/2025-06063/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and'),
    dict(id='eo-14325', publisher='Federal Register', citation='90 FR 37957', document='Executive Order 14325',
         title='Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border', signed='2025-07-31', published='2025-08-06',
         url=FR + '2025/08/06/2025-14999/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border'),
    dict(id='eo-14323', publisher='Federal Register', citation='90 FR 37739', document='Executive Order 14323',
         title='Addressing Threats to the United States by the Government of Brazil', signed='2025-07-30', published='2025-08-05',
         url=FR + '2025/08/05/2025-14896/addressing-threats-to-the-united-states-by-the-government-of-brazil'),
    dict(id='eo-14220', publisher='Federal Register', citation='90 FR 11001', document='Executive Order 14220',
         title='Addressing the Threat to National Security From Imports of Copper', signed='2025-02-25', published='2025-02-28',
         url=FR + '2025/02/28/2025-03439/addressing-the-threat-to-national-security-from-imports-of-copper'),
    dict(id='procl-10962', publisher='Federal Register', citation='90 FR 37727', document='Proclamation 10962',
         title='Adjusting Imports of Copper Into the United States', signed='2025-07-30', published='2025-08-05',
         url=FR + '2025/08/05/2025-14893/adjusting-imports-of-copper-into-the-united-states'),
    dict(id='eo-14272', publisher='Federal Register', citation='90 FR 16437', document='Executive Order 14272',
         title='Ensuring National Security and Economic Resilience Through Section 232 Actions on Processed Critical Minerals and Derivative Products',
         signed='2025-04-15', published='2025-04-18',
         url=FR + '2025/04/18/2025-06836/ensuring-national-security-and-economic-resilience-through-section-232-actions-on-processed-critical'),
    dict(id='procl-11001', publisher='Federal Register', citation='91 FR 2439', document='Proclamation 11001',
         title='Adjusting Imports of Processed Critical Minerals and Their Derivative Products Into The United States', signed='2026-01-14',
         published='2026-01-20',
         url=FR + '2026/01/20/2026-01045/adjusting-imports-of-processed-critical-minerals-and-their-derivative-products-into-the-united'),
    dict(id='fr-2026-03868', publisher='Federal Register', citation='91 FR 9686', document='Notice (USTR)',
         title='Request for Comments on the Design of a Plurilateral Agreement on Trade in Critical Minerals and Policy Actions To Strengthen the Resilience of Critical Mineral Supply Chains',
         signed=None, published='2026-02-26',
         url=FR + '2026/02/26/2026-03868/request-for-comments-on-the-design-of-a-plurilateral-agreement-on-trade-in-critical-minerals-and'),
    dict(id='eo-14389', publisher='Federal Register', citation='91 FR 9437', document='Executive Order 14389', title='Ending Certain Tariff Actions',
         signed='2026-02-20', published='2026-02-25', url=FR + '2026/02/25/2026-03832/ending-certain-tariff-actions'),
    dict(id='csms-67834313', publisher='CBP', citation='CSMS # 67834313', document='CBP CSMS message',
         title='Ending Collection of International Emergency Economic Powers Act Duties', signed=None, published='2026-02-22',
         url='https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9'),
    dict(id='scotus-24-1287', publisher='Supreme Court of the United States', citation='607 U.S. 229', document='Opinion, No. 24-1287',
         title='Learning Resources, Inc. v. Trump', signed=None, published='2026-02-20',
         url='https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf'),
    dict(id='procl-11012', publisher='Federal Register', citation='91 FR 9339', document='Proclamation 11012',
         title='Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems', signed='2026-02-20',
         published='2026-02-25',
         url=FR + '2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems'),
    dict(id='ustr-usmca-review', publisher='USTR', citation='USTR press release', document='Statement',
         title='Ambassador Greer Issues Statement on the USMCA Joint Review', signed=None, published='2026-07-01',
         url='https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review'),
    dict(id='procl-11030', publisher='Federal Register', citation='91 FR 30469', document='Proclamation 11030',
         title='To Implement Certain Provisions in the Consolidated Appropriations Act, 2026, and for Other Purposes', signed='2026-05-19',
         published='2026-05-22',
         url=FR + '2026/05/22/2026-10398/to-implement-certain-provisions-in-the-consolidated-appropriations-act-2026-and-for-other-purposes'),
    dict(id='pl-118-62', publisher='U.S. Government Publishing Office', citation='Public Law 118-62', document='Public Law 118-62',
         title='Prohibiting Russian Uranium Imports Act', signed='2024-05-13', published='2024-05-13',
         url='https://www.govinfo.gov/content/pkg/PLAW-118publ62/html/PLAW-118publ62.htm'),
]

tu = d['tariffUpdates']
have = {s['id'] for s in tu['sources']}
for s in NEW_SOURCES:
    if s['id'] not in have:
        tu['sources'].append(s)
SRC = {s['id']: s for s in tu['sources']}
for must in ['fr-2026-15181', 'fr-2026-15274', 'fr-2026-14542', 'fr-2018-20610', 'fr-2019-09681', 'fr-2026-20510', 'fr-2019-17865',
             'fr-2020-00904', 'fr-2024-21217', 'procl-10523', 'fr-2025-22690', 'fr-2025-23892', 'hts-now', 'hts-before', 'hts-now-cr',
             'hts-chapter-99']:
    assert must in SRC, f'generator no longer provides source {must}'

# ---------------------------------------------------------------------------------------------
# labels per heading
# ---------------------------------------------------------------------------------------------
LABEL = {
    '2601': ('Iron ore & concentrates', 'Iron ore'),
    '2602': ('Manganese ore', 'Manganese'),
    '2603': ('Copper ore & concentrates', 'Copper'),
    '2604': ('Nickel ore', 'Nickel'),
    '2605': ('Cobalt ore', 'Cobalt'),
    '2606': ('Bauxite (aluminum ore)', 'Bauxite'),
    '2607': ('Lead ore & concentrates', 'Lead'),
    '2608': ('Zinc ore & concentrates', 'Zinc'),
    '2609': ('Tin ore', 'Tin'),
    '2610': ('Chromium ore (chromite)', 'Chromite'),
    '2611': ('Tungsten ore & concentrates', 'Tungsten'),
    '2612': ('Uranium & thorium ore', 'Uranium/thorium'),
    '2613': ('Molybdenum ore & concentrates', 'Molybdenum'),
    '2614': ('Titanium ore (ilmenite, rutile)', 'Titanium'),
    '2615': ('Niobium, tantalum, vanadium & zirconium ores', 'Nb/Ta/V/Zr'),
    '2616': ('Silver, gold & other precious-metal ores', 'Precious metal'),
    '2617': ('Other ores (antimony, beryllium)', 'Other ores'),
    '2618': ('Granulated slag (slag sand)', 'Slag sand'),
    '2619': ('Iron & steel slag, dross & scale', 'Steel slag'),
    '2620': ('Metal-bearing slag, ash & residues', 'Metal residues'),
    '2621': ('Other slag & ash (incinerator ash, kelp)', 'Other ash'),
}

# ---------------------------------------------------------------------------------------------
# overview
# ---------------------------------------------------------------------------------------------
ov = d['overview']
lines = [r for r in ov['rateTable']['rows'] if r['htsCode10']]
assert len(lines) == 102, len(lines)
dutiable = [r for r in lines if r['dutiable']]
assert len(dutiable) == 30, len(dutiable)

ov['seo'] = {
    'title': 'HTS Chapter 26 Tariffs: Iron Ore, Copper & Critical Mineral Ores, Slag and Ash — Import Duty Rates | KoalaGains',
    'shortDescription': (
        'Searchable U.S. duty table for all 102 HTS Chapter 26 lines — iron ore, copper and lead concentrates, bauxite, manganese, uranium, '
        'molybdenum, tungsten, titanium ores, slag and ash. Most ores are Free and exempt from the 2026 Section 301 tariffs; who pays 10–37.5%, '
        'and why copper ore is outside the Section 232 copper tariff.'
    ),
    'keywords': [
        'HTS Chapter 26',
        'ores slag and ash tariff',
        'iron ore tariff',
        'copper ore tariff',
        'critical minerals tariffs',
        'mining tariffs',
        'HS code for iron ore',
        'HS code 2603',
        'tariff on bauxite',
        'uranium tariffs',
    ],
}
ov['intro'] = (
    f'Chapter 26 covers metal ores and concentrates — iron ore (2601), manganese, copper, nickel, cobalt, bauxite, lead, zinc, tin, chromium, '
    f'tungsten, uranium and thorium, molybdenum, titanium, niobium, tantalum, vanadium, zirconium and precious-metal ores (2602–2617) — plus '
    f'slag, ash and metal-bearing residues (2618–2621). **72 of the 102 tariff lines are Free**; the other 30 carry small duties charged on '
    f'the **metal content** found by assay (for example 1.7¢/kg on the lead in copper concentrate), and most of those are Free for Australia, '
    f'Chile, Peru, Canada, Mexico and other FTA partners. The U.S. imported **{money(TOTAL)}** of Chapter 26 goods in 2025, led by uranium ore '
    f'({hs6("261210")}), iron ore pellets ({hs6("260112")}) and molybdenum ores.\n\n'
    f'The extra duties depend on the product. **Most ores are on the exemption list of the 2026 Section 301 tariffs** (U.S. note 52(b)): '
    f'unagglomerated iron ore, manganese, copper, nickel, cobalt, bauxite, zinc, tin, chromium, tungsten, uranium, titanium and other ores pay '
    f'nothing extra from any of the 60 economies. **Iron ore pellets, lead ore, roasted molybdenum, zirconium ore, gold ores, slag and most '
    f'residues are not exempt** and pay 10% or 12.5% (Brazil up to 37.5%). China-origin goods pay 25% on most lines under the older Section 301 '
    f'lists. Copper ores and concentrates are **not** covered by the Section 232 copper tariff, and the 2026 Section 232 critical-minerals '
    f'action set no tariff. The IEEPA tariffs ended on February 24, 2026.'
)
ov['stats'][2] = {
    'label': 'Lines with an extra duty for some origins',
    'value': '92 of 102',
    'note': '2026 Section 301: 52 lines (50 exempt under U.S. note 52(b)); China Section 301 lists: 89; USMCA goods exempt',
}

BLURB = {
    '2601': ('Iron ore fines and concentrates (2601.11), pellets and other agglomerated ore (2601.12) and roasted pyrites: 7 lines, all Free. '
             'Unagglomerated ore is exempt from the 2026 Section 301 duty; pellets are not, so pellets pay 10–12.5% (Canada 10% unless USMCA).',
             ['iron ore', 'iron ore pellets', 'iron ore fines', 'iron ore concentrate', 'taconite', 'pyrites']),
    '2602': ('Manganese ores and concentrates (including ferruginous ore with 20% or more manganese): 2 lines, Free, exempt from the 2026 '
             'Section 301 duty. China-origin ore pays 25% (2024 four-year review).', ['manganese ore', 'manganese concentrate', 'ferruginous manganese']),
    '2603': ('Copper ores and concentrates: 1.7¢/kg on the lead content (Free for USMCA, FTA and AGOA goods), reported by copper, lead, zinc, '
             'silver and gold content. Exempt from the 2026 Section 301 duty and outside the Section 232 copper tariff.',
             ['copper ore', 'copper concentrate', 'chalcopyrite', 'copper ores and concentrates']),
    '2604': ('Nickel ores and concentrates: 2 lines, Free, exempt from the 2026 Section 301 duty.', ['nickel ore', 'nickel concentrate', 'laterite', 'pentlandite']),
    '2605': ('Cobalt ores and concentrates: 1 line, Free, exempt from the 2026 Section 301 duty. China-origin ore pays 25%.', ['cobalt ore', 'cobalt concentrate']),
    '2606': ('Bauxite and other aluminum ores — calcined bauxite (refractory grade and other) and other: 3 lines, Free, exempt from the 2026 Section 301 duty. Guyana and '
             'Jamaica were the main suppliers in 2025.', ['bauxite', 'aluminum ore', 'refractory bauxite', 'calcined bauxite']),
    '2607': ('Lead ores and concentrates: 1.1¢/kg on lead content. Not on the 2026 Section 301 exemption list, so non-USMCA Canadian ore pays '
             '+10% and FTA partners such as Australia +12.5% even when the base rate is Free.', ['lead ore', 'lead concentrate', 'galena']),
    '2608': ('Zinc ores and concentrates: 5 lines (by metal content), Free, exempt from the 2026 Section 301 duty. China-origin ore pays 25%.',
             ['zinc ore', 'zinc concentrate', 'sphalerite']),
    '2609': ('Tin ores and concentrates: 1 line, Free, and no extra duty from any origin — not even China.', ['tin ore', 'cassiterite', 'tin concentrate']),
    '2610': ('Chromium ores and concentrates (chromite), split by Cr2O3 content: 3 lines, Free, exempt from the 2026 Section 301 duty. South '
             'Africa is the main supplier.', ['chrome ore', 'chromite', 'chromite sand', 'chrome concentrate']),
    '2611': ('Tungsten ores (Free) and concentrates (37.5¢/kg on tungsten content; Free for FTA and AGOA goods). Both are exempt from the 2026 '
             'Section 301 duty; Chinese concentrates pay +25% (2024 four-year review).', ['tungsten ore', 'tungsten concentrate', 'wolframite', 'scheelite']),
    '2612': ('Uranium ores and concentrates (2612.10) and thorium ores (2612.20): Free, exempt from the 2026 Section 301 duty. The largest '
             'Chapter 26 import in 2025, from Australia and Namibia. NRC import rules apply.', ['uranium ore', 'uranium concentrate', 'U3O8', 'thorium ore']),
    '2613': ('Molybdenum ores and concentrates: roasted (2613.10, 12.8¢/kg on Mo content + 1.8%) and other (2613.90, 17.8¢/kg on Mo content). '
             'Unroasted concentrate is exempt from the 2026 Section 301 duty; roasted is not.', ['molybdenum concentrate', 'roasted molybdenum', 'moly oxide', 'molybdenite']),
    '2614': ('Titanium ores: synthetic rutile, ilmenite and ilmenite sand, rutile: 3 lines, Free, exempt from the 2026 Section 301 duty.',
             ['ilmenite', 'rutile', 'synthetic rutile', 'titanium ore', 'mineral sands']),
    '2615': ('Zirconium ores (zircon, 2615.10) and niobium, tantalum and vanadium ores (2615.90): all Free. Zirconium ore is not on the 2026 '
             'Section 301 exemption list; the others are.', ['zircon', 'zircon sand', 'tantalum ore', 'coltan', 'niobium ore', 'vanadium ore']),
    '2616': ('Silver ores (0.8¢/kg on lead content) and gold and other precious-metal ores (1.7¢/kg on lead content), reported by metal content. '
             'Silver ores are exempt from the 2026 Section 301 duty; gold ores are not.', ['silver ore', 'gold ore', 'gold concentrate', 'precious metal ore']),
    '2617': ('Antimony ores (exempt from the 2026 Section 301 duty) and other ores such as beryllium ores (not exempt): 3 lines, all Free.',
             ['antimony ore', 'stibnite', 'beryllium ore', 'beryl']),
    '2618': ('Granulated blast-furnace slag (slag sand) from iron or steel making, used in cement: 1 line, Free, but not exempt from the 2026 '
             'Section 301 duty.', ['granulated blast furnace slag', 'slag sand', 'blast furnace slag', 'slag cement']),
    '2619': ('Other iron and steel slag, dross, mill scale and waste: 2 lines, Free, not exempt from the 2026 Section 301 duty.',
             ['mill scale', 'ferrous scale', 'steel slag', 'dross']),
    '2620': ('Slag, ash and residues containing metals (zinc dross, copper and lead residues, leaded gasoline sludge, arsenic and vanadium '
             'residues, titanium slag): 36 lines, mostly Free. Only copper residues (2620.30) and titanium slag (2620.99.50) are exempt from the 2026 Section 301 duty.',
             ['zinc dross', 'hard zinc spelter', 'copper slag', 'vanadium residue', 'titanium slag', 'leaded gasoline sludge']),
    '2621': ('Ash and residues from incinerating municipal waste and other slag and ash, including seaweed ash (kelp): 2 lines, Free, not exempt '
             'from the 2026 Section 301 duty.', ['fly ash', 'incinerator ash', 'bottom ash', 'kelp ash']),
}
for g in ov['productGroups']:
    g['label'] = LABEL[g['heading']][0]
    g['blurb'], g['searchExamples'] = BLURB[g['heading']]

ov['workedExamples'] = [
    {
        'title': '10,000 t of copper concentrate',
        'line': '2603.00.00.20',
        'body': (
            'Copper concentrate pays **1.7¢/kg on its lead content**, less an allowance of 18 kg per dry metric ton (Chapter 26 additional U.S. '
            'note 1). A concentrate with 0.5% lead holds 50 kg of lead per dry ton, so 32 kg is dutiable: 10,000 t × 32 kg × $0.017 = **$5,440**. '
            'From Chile, Peru, Australia, Canada or Mexico (FTA or USMCA claim) the duty is **$0**. 2603.00.00 is on the U.S. note 52(b) list, so '
            'no 2026 Section 301 duty applies, and Proclamation 10962 (Section 232 copper) does not cover ores or concentrates.'
        ),
    },
    {
        'title': '$10 million of iron ore pellets: Brazil vs Canada',
        'line': '2601.12.00.30',
        'body': (
            'Pellets are Free, but 2601.12 is not on the note 52(b) exemption list. Brazilian pellets pay the **12.5%** 2026 Section 301 duty '
            '(9903.05.27) = **$1.25 million**; they are on the Brazil exemption list (U.S. note 50(a)(ii)), so the separate 25% Brazil duty does '
            'not apply. Canadian pellets pay **$0** with a USMCA claim (9903.05.93), otherwise **10%** = $1 million. Unagglomerated iron ore '
            'fines (2601.11) are exempt and pay $0 from either country.'
        ),
    },
    {
        'title': 'Molybdenum concentrate from Peru vs roasted moly from Chile',
        'line': '2613.90.00.00',
        'body': (
            'Unroasted molybdenum concentrate (2613.90) pays 17.8¢/kg on molybdenum content, but the Peru TPA rate is **Free** and 2613.90 is on '
            'the note 52(b) list, so Peruvian concentrate pays **$0**. Roasted molybdenum concentrate (2613.10) from Chile is also Free under the '
            'FTA, but 2613.10 is not on the exemption list and the 2026 Section 301 duty applies even when an FTA rate is claimed (note 52(a)): '
            '**12.5%** of value, $125,000 on a $1 million lot.'
        ),
    },
    {
        'title': 'Tungsten concentrate from China',
        'line': '2611.00.60.00',
        'body': (
            'Tungsten concentrates pay 37.5¢/kg on tungsten content plus **25%** for China (9903.91.01, the 2024 four-year review, since '
            'September 27, 2024). 1,000 kg of contained tungsten worth $40,000 pays $375 + $10,000 = **$10,375**. The 2026 Section 301 duty does '
            'not apply (note 52(b)). Tungsten ores (2611.00.30) from China pay only their Free base rate.'
        ),
    },
]
ov['tradeSnapshot']['biggestLines'] = [
    {'hts': '2612.10', 'label': 'Uranium ores and concentrates'},
    {'hts': '2601.12', 'label': 'Iron ore pellets and other agglomerated iron ore'},
]
ov['tradeSnapshot']['coverageNote'] = (
    'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. Duty-collected figures aren\'t '
    'available from an official source yet.'
)

# chapter notes from the HTS Chapter 26 PDF (2026 Revision 21)
ch_text = open(os.path.join(HERE, 'ch26.txt')).read()
assert 'absolute deduction for losses of 18 kg per dry metric' in ch_text.replace('\n', ' ')
ov['notes'] = {
    'chapterNotes': (
        '**Note 1.** This chapter does not cover: (a) slag or similar industrial waste prepared as macadam (heading 2517); (b) natural magnesium '
        'carbonate (magnesite), whether or not calcined (heading 2519); (c) sludges from the storage tanks of petroleum oils, consisting mainly of '
        'such oils (heading 2710); (d) basic slag of chapter 31; (e) slag wool, rock wool or similar mineral wools (heading 6806); (f) waste or '
        'scrap of precious metal or of metal clad with precious metal; other waste or scrap containing precious metal or precious metal compounds, '
        'of a kind used principally for the recovery of precious metal (heading 7112 or 8549); or (g) copper, nickel or cobalt mattes produced by '
        'any process of smelting (section XV).\n\n'
        '**Note 2.** For the purposes of headings 2601 to 2617, the term "ores" means minerals of mineralogical species actually used in the '
        'metallurgical industry for the extraction of mercury, of the metals of heading 2844 or of the metals of section XIV or XV, even if they '
        'are intended for non-metallurgical purposes. Headings 2601 to 2617 do not, however, include minerals which have been submitted to '
        'processes not normal to the metallurgical industry.\n\n'
        '**Note 3.** Heading 2620 applies only to: (a) slag, ash and residues of a kind used in industry either for the extraction of metals or as a '
        'basis for the manufacture of chemical compounds of metals, excluding ash and residues from the incineration of municipal waste (heading '
        '2621); and (b) slag, ash and residues containing arsenic, whether or not containing metals, of a kind used either for the extraction of '
        'arsenic or metals or for the manufacture of their chemical compounds.\n\n'
        '**Subheading note 1.** For the purposes of subheading 2620.21, "leaded gasoline sludges and leaded anti-knock compound sludges" means '
        'sludges obtained from storage tanks of leaded gasoline and leaded anti-knock compounds (for example, tetraethyl lead), and consisting '
        'essentially of lead, lead compounds and iron oxide.\n\n'
        '**Subheading note 2.** Slag, ash and residues containing arsenic, mercury, thallium or their mixtures, of a kind used for the extraction '
        'of arsenic or those metals or for the manufacture of their chemical compounds, are to be classified in subheading 2620.60.'
    ),
    'additionalUsNotes': (
        '**Note 1.** The specific rates of duty imposed under the headings of this chapter on the metal content of ores and other materials shall '
        'apply to the assay quantity of metal contained therein, whether recovered as metals, as alloys or as chemical compounds or used directly '
        'in the manufacture of articles, except that with respect to ores or other materials provided for in this chapter which are subject to '
        'duty at specific rates on their copper, lead or zinc content, an absolute deduction for losses of 18 kg per dry metric ton from the '
        'respective quantities of each of such metal contents shall be allowed.\n\n'
        '**Note 2.** When the classification of imported materials under any provision of this chapter is dependent on the percentage of metal '
        'content, such percentage shall be the ratio of the total quantity of the respective metal content to the total quantity of imported '
        'material when computed on a dry-weight basis; i.e., free of all uncombined moisture.\n\n'
        '**Statistical notes.** The quantity of metal content to be reported is the assay quantity without deductions. "Coarse" iron ore '
        '(2601.11.0060) has a majority of particles over 4.75 mm. For the 10-digit lines under 2603.00.00, 2604.00.00, 2607.00.00, 2608.00.00, '
        '2616.10.00, 2616.90.00, 2620.19.60, 2620.21.00, 2620.29.00 and 2620.30.00, and 2620.99.7560 and 2620.99.7580, the weight and value of '
        'each named metal in the shipment is reported under its own statistical number, so one shipment can need several 10-digit lines.'
    ),
}

# ---------------------------------------------------------------------------------------------
# tariff updates
# ---------------------------------------------------------------------------------------------
tu['seo'] = {
    'title': 'HTS Chapter 26 Tariff Updates 2025–2026: Iron Ore, Copper Ore, Critical Minerals, Section 301 & 232 | KoalaGains',
    'shortDescription': (
        'What changed for imports of ores, slag and ash since January 2025: the IEEPA tariffs and their end, the Section 122 surcharge, the 2026 '
        'Section 301 tariffs and the note 52(b) ore exemption, Brazil and China duties, the Section 232 copper and critical-minerals actions — with '
        'Federal Register citations.'
    ),
    'keywords': [
        'critical minerals tariffs',
        'section 232 critical minerals',
        'trump tariff on critical minerals',
        'copper tariff ores',
        'iron ore tariffs',
        'metal tariffs 2026',
        'china critical minerals tariffs',
        'section 301 tariffs 2026',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current '
    '**2026 Revision 21** (in force October 9, 2026). All 102 Chapter 26 lines have the same base rates in both — the changes were extra duties.\n\n'
    'In 2025 the IEEPA tariffs reached ores from Canada and Mexico (non-USMCA goods; energy and critical minerals of Canada at 10%), China, Brazil '
    'and, through the April 2025 reciprocal tariff, every other country — but most ores were on the reciprocal tariff\'s exemption list. Iron '
    'ore, lead ore, slag and ash were not. **All IEEPA tariffs ended on February 24, 2026.** A 10% Section 122 surcharge with the same ore '
    'exemptions ran until July 23, 2026.\n\n'
    'Today\'s extra duties are the **2026 Section 301 tariffs** on 60 economies (10% or 12.5%, from July 24, 2026), which exempt most ores under '
    'U.S. note 52(b) but charge iron ore pellets, lead ore, roasted molybdenum, zirconium ore, gold ores, slag, ash and most residues; Brazil\'s '
    '25% Section 301 duty; and the **China Section 301** duties (25% on most lines). Copper ores are outside the Section 232 copper tariff, and '
    'the January 2026 Section 232 critical-minerals proclamation imposed no tariff.'
)
tu['scope'] = (
    'Chapter 99 measures that reach Chapter 26 from any country: the 2026 Section 301 tariffs on 60 economies and their U.S. note 52(b) exemption '
    'list, the Brazil and China Section 301 actions, Russia\'s column 2 and 35% rates, the ended IEEPA and Section 122 duties, and the Section 232 '
    'copper and critical-minerals actions (which set no Chapter 26 tariff). We found no antidumping or countervailing duty order on Chapter 26 goods. '
    'For the rate each supplier pays, see Rates by country.'
)
tu['stats'] = [
    {'label': 'Base rates unchanged', 'value': '102 of 102 lines', 'note': '72 Free, 30 with metal-content or ad valorem duties'},
    {'label': 'Exempt from 2026 Section 301', 'value': '50 of 102 lines', 'note': 'U.S. note 52(b): most ores'},
    {'label': 'Compared', 'value': 'Jan 2025 → Rev 21'},
    {'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'},
]

EXEMPT_TEXT = ('U.S. note 52(b) (9903.05.86) exempts 23 Chapter 26 subheadings — 50 of the 102 lines: unagglomerated iron ore and roasted pyrites, '
               'manganese, copper, nickel, cobalt, aluminum (bauxite), zinc, tin, chromium, tungsten, uranium and thorium, unroasted molybdenum, '
               'titanium, niobium/tantalum/vanadium, silver and antimony ores, copper residues (2620.30) and titanium slag (2620.99.50). Iron ore '
               'pellets (2601.12), lead ore, roasted molybdenum, zirconium ore, gold and other precious-metal ores, beryllium and other ores (2617.90), '
               'slag, ash and the other residues pay. The duty applies even when an FTA rate is claimed (note 52(a)).')
IE = {
    'au-section-301': (
        f'{EXEMPT_TEXT} The AUSFTA still makes the base rate Free (for example on lead ore). The IEEPA reciprocal tariff ended February 24, 2026 and the Section 122 surcharge July 23, 2026.',
        f'Uranium and titanium ores, Australia\'s main shipments, are Free; zircon (2615.10) pays 12.5%. Lead ore and other non-exempt lines pay 12.5% of value. Australia supplied {c("Australia")} in 2025.'),
    'ca-section-301': (
        f'USMCA-qualifying goods are exempt (9903.05.93). {EXEMPT_TEXT} The IEEPA duties (25%, then 35%; 10% on energy and critical minerals) ended February 24, 2026.',
        f'Canadian iron ore pellets, lead concentrate, slag and residues pay 10% only when no USMCA claim is made; with a USMCA certification of origin they pay nothing. Canada supplied {c("Canada")} in 2025, mostly iron ore and lead ore.'),
    'br-section-301': (
        'Two duties: 12.5% (9903.05.27, 60-economy action) on lines not on note 52(b), and 25% (9903.05.01, Brazil action, from July 22, 2026) on lines not on the Brazil exemption list in U.S. note 50(a)(ii). '
        'That list mirrors note 52(b) but also includes iron ore pellets (2601.12) and leaves out roasted pyrites (2601.20). So Brazilian pellets pay 12.5% only, roasted pyrites 25% only, and slag, lead ore and residues 37.5%. '
        'The IEEPA duties — 10% reciprocal and the 40% Brazil duty, from which iron ore was exempt (9903.01.81) — ended February 24, 2026.',
        f'Brazil ships almost only iron ore ({hc("Brazil", "2601")} in 2025): pellets pay 12.5% of value, ore fines and concentrate nothing.'),
    'za-section-301': (
        f'{EXEMPT_TEXT} AGOA (SPI D) is in force through December 31, 2026, so qualifying South African goods pay no base rate on the content-duty lines. The IEEPA reciprocal tariff ended February 24, 2026.',
        'Chromite, titanium ore and manganese ore from South Africa are Free; its granulated slag (2618) and most residues (2620), including vanadium-bearing ones, pay 12.5%.'),
    'pe-section-301': (
        f'{EXEMPT_TEXT} The Peru TPA still makes the base rates Free (molybdenum, lead, copper and precious-metal ores).',
        f'Peruvian molybdenum concentrate (2613.90) and zinc concentrate pay nothing; roasted molybdenum and lead or gold ores pay 12.5%. Peru supplied {c("Peru")} in 2025, mostly molybdenum.'),
    'mx-section-301': (
        f'USMCA-qualifying goods are exempt (9903.05.94). {EXEMPT_TEXT} The IEEPA duty (25% on non-USMCA goods) ended February 24, 2026.',
        f'With a USMCA claim Mexican ore and residues pay nothing. Without one, molybdenum concentrate pays 17.8¢/kg on molybdenum content, and roasted molybdenum, slag and residues also pay 10%. Mexico supplied {c("Mexico")} in 2025, up from {money(CTRY["Mexico"]["priorImportsUsd"])}.'),
    'no-section-301': (
        f'{EXEMPT_TEXT} Norway has no FTA with the United States, so content-based base rates also apply.',
        'Norway ships mainly metal-bearing residues (2620), which pay 12.5% of value.'),
    'jp-section-301': (
        f'Goods of Japan pay 12.5% in total when the base rate is lower (9903.05.49; specific rates are converted to an ad valorem equivalent, note 52(k)). {EXEMPT_TEXT}',
        'Japanese granulated blast-furnace slag (2618) pays 12.5% of value; exempt ores pay their base rate only.'),
    'cn-section-301': (
        'China Section 301 List 3 (9903.88.03, 25%) covers 73 Chapter 26 lines; the 2024 four-year review added 25% on manganese, cobalt, bauxite, zinc and chromium ores and tungsten concentrates '
        '(9903.91.01, from September 27, 2024); List 4A (9903.88.15, 7.5%) covers municipal-waste incinerator ash (2621.10). The 12.5% 2026 duty (9903.05.31) applies on top on the 52 lines '
        'not on note 52(b). Copper ores, tin ore, tungsten ores, thorium ores, unroasted molybdenum and antimony ores pay no extra duty. No product exclusion covers the chapter. USTR confirmed on October 7, 2026 '
        'that the 2018 actions continue during their four-year review. The IEEPA duties on China ended February 24, 2026.',
        f'Most Chinese ores pay 25%; Chinese slag, ash and residues 37.5%; incinerator ash 20%. China supplied {c("China")} in 2025, mostly granulated slag.'),
    'cl-section-301': (
        f'{EXEMPT_TEXT} The Chile FTA still makes the base rates Free.',
        f'Chilean molybdenum concentrate and iron ore fines pay nothing; roasted molybdenum and iron ore pellets pay 12.5%. Chile supplied {c("Chile")} in 2025, down from {money(CTRY["Chile"]["priorImportsUsd"])}.'),
    'eu-section-301': (
        f'Goods of the EU pay 10% in total when the base rate is lower (9903.05.39; specific rates are converted to an ad valorem equivalent, note 52(k)). {EXEMPT_TEXT} None of the EU-specific exemptions (9903.05.97) names a Chapter 26 line.',
        f'Swedish iron ore pellets pay 10% of value; iron ore fines and the exempt ores pay nothing. Sweden, the largest EU supplier, shipped {c("Sweden")} in 2025.'),
    'ru-section-301': (
        'Russia pays the column 2 rates (normal trade relations suspended in 2022), and 35% in place of column 2 on iron ore pellets (2601.12) and zirconium ore (2615.10) (9903.90.08, U.S. note 30(b), from April 1, 2023). '
        'The 12.5% 2026 duty (9903.05.66) is added on lines not on note 52(b). Column 2 ore rates are mostly per kg of metal content (for example 8.8¢/kg on copper content).',
        'Russian ore is expensive to import: pellets and zircon pay 47.5% of value, slag 22.5%. Chapter 26 imports from Russia were only $2.4M in 2025, all niobium, tantalum, vanadium or zirconium ores.'),
    'other-section-301': (
        f'{EXEMPT_TEXT} Countries outside the 60 economies — for example Namibia, Madagascar, Gabon, Mozambique, Jamaica and Sierra Leone — pay only the base rate.',
        'Iron ore pellets, lead ore, slag, ash and residues from these economies pay 10% or 12.5% of value; the exempt ores pay their base rate only.'),
}
for e in tu['inEffect']:
    e['exemption'], e['whatItMeans'] = IE[e['id']]
    if e['id'] == 'ru-section-301':
        e['now'] = '+12.5%; pellets and zircon 35% in place of column 2 + 12.5%'
        e['before'] = 'Column 2; pellets and zircon 35%'
    if e['id'] == 'cn-section-301':
        e['now'] = '+25%, +37.5% or +20% (by line)'
        e['before'] = '+25% (+7.5% incinerator ash)'
    if e['id'] == 'br-section-301':
        e['now'] = '+12.5%, +25% or +37.5% (by line)'
    if e['id'] == 'other-section-301':
        e['now'] = '+10% or +12.5% (by economy)'

# generated changes: fill the TODO details
for ch in tu['changes']:
    if ch['id'].startswith('section-301-nicaragua'):
        ch['title'] = 'Section 301 tariff on Nicaragua phases in from 2027'
        ch['detail'] = ('Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, '
                        '2028 (9903.89.01, U.S. note 29), with no ore exemption. The rate is 0% in 2026. Nicaragua shipped no Chapter 26 goods to the U.S. in 2025.')
    elif ch['id'].startswith('section-301-2026-60'):
        ch['title'] = '2026 Section 301 tariffs on 60 economies: most ores exempt'
        ch['detail'] = ('The 10% or 12.5% Section 301 duties (9903.05.20–9903.05.84) took effect on July 24, 2026. 23 Chapter 26 subheadings (50 lines) '
                        'are on the U.S. note 52(b) exemption list (9903.05.86). The other 52 lines pay: iron ore pellets, lead ore, roasted '
                        'molybdenum, zirconium ore, gold and other precious-metal ores, beryllium ores, granulated slag, steel slag and scale, most '
                        'metal-bearing residues and incinerator ash. USMCA goods of Canada and Mexico are exempt; EU and Japan goods pay 10% and 12.5% in total.')
    elif ch['id'].startswith('section-301-brazil'):
        ch['title'] = 'Brazil Section 301 tariff: 25%, most ores exempt'
        ch['detail'] = ('The 25% duty on goods of Brazil (9903.05.01) took effect July 22, 2026. Its exemption list (U.S. note 50(a)(ii), 9903.05.03) '
                        'covers the same ores as note 52(b) plus iron ore pellets (2601.12), but not roasted pyrites (2601.20). Brazilian pellets therefore '
                        'pay only the 12.5% 60-economy duty; slag, lead ore and residues pay both (37.5%).')
    elif ch['id'] == 'base-rates':
        ch['title'] = 'No Chapter 26 base-rate changes'
        ch['detail'] = ('All 102 Chapter 26 tariff lines carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 '
                        'Basic Edition; no line was added, removed or renumbered.')

def change(id, type, date, label, title, detail, before, now, countries, sids):
    for s in sids:
        assert s in SRC, s
    return dict(id=id, type=type, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries, sourceIds=sids)

tu['changes'] += [
    change('cn-301-continued', 'reference', '2026-10-07', 'Published', 'China Section 301 duties continue during the four-year review',
           'USTR received requests to continue the 2018 China actions, so they did not terminate on their 2026 anniversaries and remain in effect pending '
           'the statutory review. The 25% List 3 and 2024 four-year-review duties on Chinese ores continue.', None, None, 'China', ['fr-2026-20510']),
    change('s122-end', 'reference', '2026-07-23', 'Expired', 'Section 122 surcharge expired',
           'The 150-day 10% surcharge (9903.03.01) expired at the close of July 23, 2026. Its exemption list (9903.03.03) had the note 52(b) ores '
           'except iron ore; iron ore, lead ore, slag, ash and residues paid it.', '+10%', 'None', 'All', ['procl-11012', 'hts-chapter-99']),
    change('usmca-review', 'reference', '2026-07-01', 'Announced', 'USMCA joint review: not renewed, still in force',
           'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the '
           'issues or until termination, so USMCA claims (SPI S) still apply.', None, None, 'Canada, Mexico', ['ustr-usmca-review']),
    change('agoa-extended', 'reference', '2026-05-19', 'Signed', 'AGOA duty-free treatment extended through December 31, 2026',
           'Proclamation 11030 implemented the Consolidated Appropriations Act, 2026: AGOA (SPI D) applies through December 31, 2026, and Gabon was '
           're-designated a beneficiary. South Africa, Namibia, Madagascar, Mozambique and Sierra Leone are listed beneficiaries (general note 16). '
           'For Chapter 26 this makes the content-duty lines (copper, lead, tungsten, molybdenum, precious-metal ores and residues) Free for '
           'qualifying goods.', None, 'Free (SPI D)', 'Sub-Saharan Africa', ['procl-11030', 'hts-now']),
    change('cm-plurilateral', 'reference', '2026-02-26', 'Published', 'USTR consults on a plurilateral critical-minerals agreement',
           'Following Proclamation 11001, USTR requested comments on the design of a plurilateral agreement on trade in critical minerals and on '
           'policy actions such as price floors. No tariff has been set on critical-mineral ores.', None, None, 'All', ['fr-2026-03868', 'procl-11001']),
    change('s122-start', 'extraDuty', '2026-02-24', 'Effective', 'Section 122 surcharge replaces the IEEPA tariffs; most ores exempt',
           'A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. Most non-ferrous ores (the note 52(b) list without iron ore) '
           'were exempt (9903.03.03), as were USMCA goods of Canada and Mexico. Iron ore, lead ore, slag, ash and residues paid.',
           'None', '+10% (ended)', 'All', ['procl-11012', 'hts-chapter-99']),
    change('ieepa-end', 'extraDuty', '2026-02-24', 'Effective', 'All IEEPA tariffs end',
           'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive '
           'Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 '
           'a.m. ET on February 24.', 'Varied by country', 'None', 'All', ['scotus-24-1287', 'eo-14389', 'csms-67834313']),
    change('cm-232', 'reference', '2026-01-14', 'Signed', 'Section 232 critical minerals: negotiations, no tariff',
           'Proclamation 11001 concurred that imports of processed critical minerals and their derivative products threaten national security, but '
           'directed Commerce and USTR to negotiate agreements (considering price floors) instead of imposing tariffs, with an update due within 180 '
           'days. No Chapter 26 line pays a Section 232 duty.', None, 'No tariff', 'All', ['procl-11001', 'eo-14272']),
    change('br-ieepa', 'extraDuty', '2025-08-06', 'Effective', 'IEEPA 40% duty on Brazil; iron ore and tin ore exempt',
           'Executive Order 14323 added 40% on products of Brazil (9903.01.77). Iron ore (2601.11, 2601.12) and tin ore (2609) were on its exemption '
           'list (9903.01.81); iron ore still paid the 10% reciprocal tariff. Ended February 24, 2026.', 'None', '+40% (ended)', 'Brazil', ['eo-14323']),
    change('ca-amended', 'extraDuty', '2025-08-01', 'Effective', 'Canada additional duty raised to 35%',
           'Raised the IEEPA duty on non-USMCA Canadian goods from 25% to 35% (9903.01.10); energy and critical minerals (9903.01.13) stayed at 10%. '
           'Ended February 24, 2026.', '+25%', '+35% (ended)', 'Canada', ['eo-14325']),
    change('cu-232', 'reference', '2025-08-01', 'Effective', 'Section 232 copper tariff does not cover ores',
           'Proclamation 10962 imposed 50% on semi-finished copper products and copper-intensive derivatives from August 1, 2025. Copper ores and '
           'concentrates (2603) are not covered; a phased tariff on refined copper (15% in 2027, 30% in 2028) was left for '
           'a later decision after a Commerce update due June 30, 2026.', None, 'Not covered', 'All', ['procl-10962', 'eo-14220']),
    change('reciprocal', 'extraDuty', '2025-04-02', 'Signed', 'Reciprocal tariff: most ores exempt, iron ore and slag not',
           '10% baseline (9903.01.25) and country rates (9903.02.xx) on products of all countries except Canada and Mexico, from April 5, 2025. '
           'Manganese, copper, cobalt, bauxite, zinc, chromium, tungsten, uranium, titanium, niobium/tantalum/vanadium, silver and antimony ores were '
           'on the Annex II exemption list (U.S. note 2(v)(iii)); nickel, tin, thorium and unroasted molybdenum ores were added later in 2025. Iron '
           'ore, lead ore, slag, ash and most residues paid. Ended February 24, 2026.', 'None', '+10% or more (ended)', 'All except Canada, Mexico',
           ['eo-14257', 'hts-chapter-99']),
    change('usmca-exempt', 'extraDuty', '2025-03-06', 'Signed', 'USMCA goods exempted from the Canada and Mexico duties',
           'From March 7, 2025, goods entered under USMCA were exempt from the IEEPA duties on Canada and Mexico. Ended February 24, 2026.',
           '+25% (+10% Canadian energy and critical minerals)', 'USMCA goods exempt (ended)', 'Canada, Mexico', ['eo-14231', 'eo-14232']),
    change('ca-mx-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duties on products of Canada and Mexico',
           '+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01), in force from March 4, 2025, with 10% for Canadian energy and critical '
           'minerals as defined by 30 U.S.C. 1606(a)(3) (9903.01.13). Ended February 24, 2026.', 'None', '+25% / +10% (ended)', 'Canada, Mexico',
           ['eo-14193', 'eo-14194', 'hts-chapter-99']),
    change('cn-2024-review', 'extraDuty', '2024-09-27', 'Effective', 'China: 25% on critical-mineral ores (four-year review)',
           'USTR\'s four-year review added a 25% duty (9903.91.01) on Chinese manganese, cobalt, aluminum, zinc and chromium ores and tungsten '
           'concentrates, among other critical minerals.', 'None', '+25%', 'China', ['fr-2024-21217']),
    change('ru-35', 'extraDuty', '2023-04-01', 'Effective', 'Russia: 35% on iron ore pellets and zirconium ore',
           'Proclamation 10523 added iron ore pellets (2601.12) and zirconium ores (2615.10) of Russia to the list paying 35% in place of the column '
           '2 rate (9903.90.08, U.S. note 30(b)).', 'Column 2', '35%', 'Russia', ['procl-10523', 'hts-chapter-99']),
    change('cn-4a', 'extraDuty', '2020-02-14', 'Effective', 'China List 4A on incinerator ash cut to 7.5%',
           'The List 4A duty (9903.88.15) on Chinese ash and residues from municipal waste incineration (2621.10), imposed at 15% from September 1, '
           '2019, was cut to 7.5%.', '+15%', '+7.5%', 'China', ['fr-2019-17865', 'fr-2020-00904']),
    change('cn-list3', 'extraDuty', '2019-05-10', 'Effective', 'China List 3 raised to 25%',
           'List 3 (9903.88.03), which covers 73 Chapter 26 lines including iron ore, nickel, titanium, uranium ores, slag and residues, rose from '
           '10% (from September 24, 2018) to 25%.', '+10%', '+25%', 'China', ['fr-2018-20610', 'fr-2019-09681']),
]
tu['changes'].sort(key=lambda x: x['date'], reverse=True)
ids = [x['id'] for x in tu['changes']]
assert len(ids) == len(set(ids)), ids

# ---------------------------------------------------------------------------------------------
# understand industry
# ---------------------------------------------------------------------------------------------
ui = d['understandIndustry']
ui['h1'] = 'HTS Chapter 26: Ores, Slag and Ash — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Imports of Ores & Concentrates by Country — Iron Ore, Uranium, Molybdenum, Bauxite (HTS Ch. 26) | KoalaGains',
    'shortDescription': (
        f'Where U.S. ore, slag and ash imports come from, 2020–2025: {money(TOTAL)} in 2025, led by Australia (uranium), Canada and Brazil (iron '
        'ore), Peru and Mexico (molybdenum). By country, by product and over time, from UN Comtrade.'
    ),
    'keywords': [
        'where does the us import iron ore from',
        'us imports of iron ore',
        'where does the us get bauxite',
        'where does the us import uranium from',
        'us critical minerals imports',
        'mining imports by country',
        'HTS Chapter 26 import statistics',
    ],
}
for row in ui['byCountry']:
    if row['mainHeading']:
        row['mainHeadingLabel'] = LABEL[row['mainHeading']][0]
ui['why'] = (
    f'U.S. imports of Chapter 26 goods were **{money(TOTAL)} in 2025**, {chg:+.1f}% from {money(PRIOR)} in 2024 and up from '
    f'{money(trade["totalsByYear"][0]["totalUsd"])} in 2020. Each heading has its own supplier: **uranium ores** ({head("2612")}) came from '
    f'Australia ({hc("Australia", "2612")}) and Namibia ({hc("Namibia", "2612")}); **iron ore** ({head("2601")}) from Brazil '
    f'({hc("Brazil", "2601")}) and Canada ({hc("Canada", "2601")}); **molybdenum** ({head("2613")}) from Peru ({hc("Peru", "2613")}) and '
    f'Mexico ({hc("Mexico", "2613")}); **titanium ores** ({head("2614")}) from South Africa, Australia, Madagascar, Mozambique and Sierra Leone; '
    f'**bauxite** ({head("2606")}) from Guyana and Jamaica; **manganese** from Gabon; **chromite** from South Africa; and **lead '
    f'concentrate** ({head("2607")}) from Canada. Metal-bearing residues ({head("2620")}) come mainly from South Africa, Norway and Canada, and '
    f'granulated slag ({head("2618")}) from Japan, China and South Africa.\n\n'
    f'Copper is the notable gap: imports of copper ores and concentrates were only {head("2603")}. Mexico\'s shipments more than doubled to '
    f'{c("Mexico")} on molybdenum, and Chile\'s fell to {c("Chile")}. Most ores were exempt from the 2025 reciprocal tariff; among the lines '
    f'that paid it, granulated slag fell to {head("2618")} from {money(HEAD["2618"]["byYear"]["2024"])} and iron ore pellets to '
    f'{hs6("260112")} from {money(HS6["260112"]["priorImportsUsd"])}.\n\n'
    'Many of these ores have no large U.S. mine supply: the USGS puts 2025 U.S. net import reliance at 100% for manganese, niobium and tantalum, '
    '88% for titanium mineral concentrates, 79% for chromium and over 75% for bauxite, but under 25% for zirconium ores (Mineral Commodity '
    'Summaries 2026, Figure 2).\n\n'
    '2025 is the latest full year of U.S. trade data. Duty-collected figures aren\'t available from an official source yet.'
)
ui['sources'] = [
    {'label': 'UN Comtrade (public API), United States imports, HS chapter 26 (retrieved 2026-10-12)', 'url': 'https://comtradeplus.un.org/'},
    {'label': 'U.S. Geological Survey, Mineral Commodity Summaries 2026 (version 1.3, May 2026), Figure 2: 2025 U.S. net import reliance', 'url': 'https://pubs.usgs.gov/periodicals/mcs2026/mcs2026.pdf'},
    {'label': 'HTSUS 2026 Revision 21, Chapter 26 (headings and statistical notes)', 'url': 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2026'},
]
ui['coverageNote'] = ('Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. Ore values '
                      'include the whole shipment, not only the metal content that is dutiable.')

# ---------------------------------------------------------------------------------------------
# industry areas
# ---------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['seo'] = {
    'title': 'Ore Tariff Rates by Country — Australia, Canada, Brazil, Peru, Chile, China (HTS Ch. 26) | KoalaGains',
    'shortDescription': (
        'The total U.S. tariff on ores, slag and ash by country and product: Free for most ores from Australia, Canada, Brazil, South Africa, '
        'Peru and Mexico; 10–37.5% on iron ore pellets, lead ore, slag and residues; 25% on most Chinese ores. With the note 52(b) exemption list explained.'
    ),
    'keywords': [
        'iron ore tariff by country',
        'tariff on canadian iron ore',
        'copper tariff chile',
        'china critical minerals tariffs',
        'uranium tariff canada',
        'ore tariffs by country',
    ],
}
ia['intro'] = (
    'Each cell below is the base rate for that product group plus the extra duty for that country, minus any preference, from the current tariff '
    'schedule. For most ores the answer is **Free**: they are on the exemption list of the 2026 Section 301 tariffs (U.S. note 52(b)). The lines '
    'that pay are **iron ore pellets, lead ore, roasted molybdenum, zircon, gold ores, slag, ash and residues** — 10% for Canada, Mexico (without '
    'USMCA) and the EU, 12.5% for Australia, Peru, Chile, South Africa, Norway and Japan, and up to 37.5% for Brazil. **China** pays 25% on most '
    'ores and 37.5% on slag and residues.\n\n'
    'Content-based base rates (cents per kg of lead, tungsten or molybdenum) are shown as written; FTA, USMCA and AGOA claims make them Free. '
    '**Russia** pays the column 2 rates, 35% on pellets and zircon, and 12.5% on top on non-exempt lines.'
)
for g in ia['groups']:
    g['label'], g['shortLabel'] = LABEL[g['heading']]

RULES = {
    'Australia': ('additive', 'Ores Free except lead ore, zircon, roasted molybdenum and gold ores; slag, ash and residues +12.5% (9903.05.23). '
                  'AUSFTA (AU) makes the content duties Free; the 12.5% applies anyway.'),
    'Canada': ('usmca', 'USMCA-qualifying: no extra duty (9903.05.93). Otherwise +10% (9903.05.29) on iron ore pellets, lead ore, slag and the other '
               '52 lines not on note 52(b), plus the content-based base rates. IEEPA 25–35% (10% critical minerals) ended Feb 24, 2026.'),
    'Brazil': ('additive', '+12.5% (9903.05.27) on lines not on note 52(b) and +25% (9903.05.01) on lines not on the Brazil list (note 50(a)(ii)): '
               'pellets 12.5%, roasted pyrites 25%, slag and residues 37.5%. Iron ore fines Free.'),
    'South Africa': ('additive', 'Chromite, titanium and manganese ores Free; slag and residues +12.5% (9903.05.69). AGOA (D, through Dec 31, '
                     '2026) applied to the content-duty lines.'),
    'Peru': ('additive', 'Molybdenum and zinc concentrates Free; roasted molybdenum, lead and gold ores +12.5% (9903.05.63). Peru TPA (PE) makes '
             'the content duties Free.'),
    'Mexico': ('usmca', 'USMCA-qualifying: no extra duty (9903.05.94). Otherwise +10% (9903.05.55) on roasted molybdenum, slag and residues and the '
               'other non-exempt lines, plus content-based base rates. IEEPA 25% ended Feb 24, 2026.'),
    'Namibia': ('additive', 'Not one of the 60 Section 301 economies: base rate only. AGOA (D) applied, so every line is Free.'),
    'Norway': ('additive', '+12.5% (9903.05.60) on the 52 lines not on note 52(b), including the residues Norway mainly ships; content-based base '
               'rates apply (no FTA).'),
    'Japan': ('eu15', '12.5% in total when the base rate is lower (9903.05.49) on the 52 lines not on note 52(b), such as granulated slag; exempt '
              'ores pay their base rate.'),
    'Madagascar': ('additive', 'Not one of the 60 Section 301 economies: base rate only. AGOA (D) applied, so every line is Free.'),
    'China': ('additive', 'Most ores +25% (List 3, 9903.88.03, or 2024 review, 9903.91.01); slag, ash and residues +37.5% (with 9903.05.31); '
              'incinerator ash 20%. Copper, tin, tungsten and antimony ores, thorium and unroasted moly: no extra duty.'),
    'Chile': ('additive', 'Molybdenum concentrate, copper and iron ore fines Free; pellets, roasted molybdenum and slag +12.5% (9903.05.30). Chile '
              'FTA (CL) makes the content duties Free.'),
    'Sweden': ('eu15', 'EU: 10% in total when the base rate is lower (9903.05.39) on iron ore pellets and the other 52 non-exempt lines; '
               'unagglomerated ore and exempt ores pay their base rate.'),
    'Russia': ('additive', 'Column 2 rates (mostly per kg of metal content), 35% in place of column 2 on iron ore pellets and zircon (9903.90.08), and '
               '+12.5% (9903.05.66) on the 52 lines not on note 52(b): pellets and zircon 47.5%, granulated slag 22.5%.'),
    'Any other country': ('additive', 'Countries outside the 60 economies (e.g. Gabon, Mozambique, Jamaica, Sierra Leone) pay the base rate only; '
                          'Guyana, Türkiye and the other listed economies pay up to +12.5% on the 52 non-exempt lines.'),
}
for row in ia['countries']:
    kind, label = RULES[row['country']]
    assert row['rule']['kind'] == kind, (row['country'], row['rule']['kind'])
    row['rule']['label'] = label
ia['assumptions'] = [a for a in ia['assumptions'] if 'TODO' not in a] + [
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied.',
    'No Section 232 duty is applied: Proclamation 10962 (copper) does not cover ores or concentrates, and Proclamation 11001 (processed critical '
    'minerals) set no tariff. We found no antidumping or countervailing duty order on Chapter 26 goods.',
    'AGOA (SPI D) is in force through December 31, 2026 and is applied for South Africa, Namibia and Madagascar; other sub-Saharan beneficiaries '
    '(e.g. Gabon, Mozambique, Sierra Leone) can claim it too.',
    'Content-based rates are charged on the assay quantity of metal; for copper, lead and zinc content, 18 kg per dry metric ton is deducted '
    '(Chapter 26 additional U.S. note 1).',
    'Russia is priced at the column 2 rates (normal trade relations suspended), with 35% in place of column 2 on iron ore pellets and zirconium '
    'ore (9903.90.08) and 12.5% on non-exempt lines.',
    'Entry rules still apply: uranium and thorium ores need an NRC-authorized consignee (10 CFR 110.27), and hazardous-waste residues and ash '
    'need EPA import consent (40 CFR 262.84).',
]
ia['exemptionCheck'] = (
    'Read U.S. notes 2, 20, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) (9903.05.86) lists 23 Chapter 26 '
    'subheadings (50 lines); the Brazil list in note 50(a)(ii) (9903.05.03) has the same ores plus 2601.12 and without 2601.20. No EU-specific '
    'exemption (9903.05.97) and no Canada Section 338 list (note 51) names a Chapter 26 line. China: 73 lines on List 3 (note 20(f)), 2621.10 on '
    'List 4A (note 20(s)), 15 lines in the 2024 four-year review (note 31(b)); no product exclusion in effect covers the chapter. Russia: 2601.12 and '
    '2615.10 in note 30(b). The ended reciprocal-tariff (note 2(v)(iii)) and Section 122 (9903.03.03) lists exempted the note 52(b) ores except iron ore (2601.11, 2601.20).'
)
# industryAreas sources = everything its rules cite
needed = ['hts-now', 'hts-chapter-99', 'eo-14389', 'procl-11012', 'procl-10962', 'procl-11001', 'procl-11030', 'procl-10523']
for row in ia['countries']:
    needed += row['rule']['sourceIds']
seen, ia_sources = set(), []
for sid in needed:
    if sid not in seen:
        seen.add(sid)
        ia_sources.append(SRC[sid])
ia['sources'] = ia_sources

# ---------------------------------------------------------------------------------------------
# tariff engineering
# ---------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['seo'] = {
    'title': 'Importing Ores & Concentrates: NRC, EPA & CBP Assay Rules and Legal Ways to Lower Duty (HTS Ch. 26) | KoalaGains',
    'shortDescription': (
        'The rules for each HTS Chapter 26 line — CBP sampling and assay of metal-bearing ores, TSCA certification, NRC licensing for uranium and '
        'thorium ores, EPA consent for hazardous residues and ash — and the legal ways to pay less: FTA, USMCA and AGOA claims, the 18 kg/t '
        'deduction, bonded smelting warehouses and drawback.'
    ),
    'keywords': [
        'import uranium ore license',
        'metal bearing ores assay customs',
        'bonded smelting warehouse',
        'hazardous waste import EPA',
        'TSCA certification ores',
        'ores tariff engineering',
        'drawback ores',
    ],
}
te['intro'] = (
    'Most Chapter 26 ores are **Free**, so the duty you can save comes from three places: the **metal-content duties** on copper, lead, '
    'tungsten, molybdenum and precious-metal ores (Free with an FTA, USMCA or AGOA claim), the **10–12.5% Section 301 duty** on iron ore pellets, '
    'lead ore, slag and residues (avoided by USMCA claims or by buying from countries outside the 60 economies), and the **China** duties.\n\n'
    'The paperwork follows the material: every metal-bearing ore is sampled and assayed for CBP, chemical substances need a TSCA certification, '
    'uranium and thorium ores are NRC source material, and residues or ash that are hazardous waste need EPA consent before they ship. Each rule '
    'and lever below links to its regulation.'
)
te['lastCheckedAt'] = TODAY
te['regulationsAsOf'] = ECFR_AS_OF
HTSCH99 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
HTSCH26 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2026'
EC = 'https://www.ecfr.gov/current/'
te['levers'] = [
    {
        'id': 'fta-agoa',
        'title': 'Claim the FTA, USMCA or AGOA rate on the metal-content duties',
        'saves': 'The whole base duty on the 30 dutiable lines — e.g. 1.7¢/kg of lead content on copper concentrate, 37.5¢/kg of tungsten, 17.8¢/kg of molybdenum',
        'appliesTo': 'Copper, lead, tungsten, molybdenum and precious-metal ores and the dutiable residues (2620.19.60, 2620.60.10, 2620.99.20), from Australia, Chile, Peru, Korea, Colombia, Canada, Mexico and other FTA partners, or AGOA beneficiaries',
        'document': 'The FTA claim on the entry (SPI AU, CL, PE, KR, CO …) with the supporting certification or importer knowledge required by the agreement; for AGOA, SPI D and goods of a beneficiary country listed in general note 16.',
        'caveat': 'The 2026 Section 301 duty still applies when an FTA rate is claimed (U.S. note 52(a)). AGOA runs through December 31, 2026; GSP (A, A+, A*) has lapsed.',
        'citations': [
            {'label': '19 CFR 10.723 (Australia)', 'url': EC + 'title-19/section-10.723'},
            {'label': '19 CFR 10.410 (Chile)', 'url': EC + 'title-19/section-10.410'},
            {'label': '19 CFR 10.903 (Peru)', 'url': EC + 'title-19/section-10.903'},
            {'label': 'Proclamation 11030 (AGOA through 2026)', 'url': SRC['procl-11030']['url']},
        ],
    },
    {
        'id': 'usmca',
        'title': 'Claim USMCA for Canadian and Mexican ore, slag and residues',
        'saves': '10% of value on the 52 lines not on note 52(b) (iron ore pellets, lead ore, roasted molybdenum, slag, residues), plus the content-based base rates',
        'appliesTo': 'The 30 lines with a base-rate duty and the 52 lines not on note 52(b) (64 lines in all), for originating goods of Canada or Mexico',
        'document': 'A USMCA certification of origin from the importer, exporter or producer; it need not follow a prescribed format and CBP can ask for it.',
        'caveat': 'Ore mined in Canada or Mexico is wholly obtained and originates; check slag and residues against the rules of origin. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.',
        'citations': [
            {'label': '19 CFR 182.12', 'url': EC + 'title-19/section-182.12'},
            {'label': 'HTSUS Ch. 99, 9903.05.93 / 9903.05.94', 'url': HTSCH99},
            {'label': 'USTR statement on the USMCA joint review (July 1, 2026)', 'url': SRC['ustr-usmca-review']['url']},
        ],
    },
    {
        'id': 'origin-301',
        'title': 'Buy non-exempt products from a country outside the 60 Section 301 economies',
        'saves': '10% or 12.5% of value (Brazil up to 37.5%, China 25–37.5%) on iron ore pellets, lead ore, zircon, gold ores, slag, ash and residues',
        'appliesTo': 'The 52 lines not on the U.S. note 52(b) exemption list',
        'document': 'Commercial invoice, mine or smelter records and bill of lading showing where the ore was mined or the slag produced.',
        'caveat': 'Origin is where the ore was mined; blending or transshipment through a third country does not change it. Exempt ores (most of the chapter) pay nothing extra from any of the 60 economies anyway.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52', 'url': HTSCH99},
            {'label': '19 CFR part 177 (rulings)', 'url': EC + 'title-19/part-177'},
        ],
    },
    {
        'id': 'assay',
        'title': 'Pay on the assayed metal content — and take the 18 kg/t deduction',
        'saves': 'Duty on metal that is not there: content rates apply to the assay quantity, and copper, lead and zinc content is reduced by 18 kg per dry metric ton',
        'appliesTo': 'Lines with a rate on metal content (copper, lead, tungsten, molybdenum and precious-metal ores; 2620.19.60, 2620.99.20)',
        'document': 'Representative moisture and assay samples taken under CBP supervision (or a verified commercial sample), with the assay results on the entry.',
        'caveat': 'CBP liquidates on its own laboratory assay when it tests the sample. The 18 kg deduction is allowed only if the importer followed the procedures (19 CFR 151.55).',
        'citations': [
            {'label': 'HTSUS Ch. 26, additional U.S. note 1', 'url': HTSCH26},
            {'label': '19 CFR 151.52', 'url': EC + 'title-19/section-151.52'},
            {'label': '19 CFR 151.55', 'url': EC + 'title-19/section-151.55'},
        ],
    },
    {
        'id': 'bonded-smelting',
        'title': 'Smelt or refine in a bonded smelting and refining warehouse',
        'saves': 'The content duty on dutiable metal that is exported (charges against the bond are credited on export), and deferral until metal is withdrawn for consumption',
        'appliesTo': 'Dutiable metal-bearing ores and residues smelted or refined to unwrought metal or oxides',
        'document': 'Application to the port director to bond the plant, a smelting and refining bond, and warehouse entries with weight, sampling and assay records.',
        'caveat': 'Covers the base (metal-content) duties under section 312 of the Tariff Act; we found no guidance that it removes Section 301 duties. Wastage allowances are set per plant.',
        'citations': [
            {'label': '19 CFR 19.17', 'url': EC + 'title-19/section-19.17'},
            {'label': '19 CFR 19.25', 'url': EC + 'title-19/section-19.25'},
            {'label': '19 U.S.C. 1312', 'url': 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title19-section1312&num=0&edition=prelim'},
        ],
    },
    {
        'id': 'drawback',
        'title': 'Claim drawback when imported ore or slag is exported or used in exported goods',
        'saves': 'Up to 99% of duties paid — including Section 301 duties on Chinese ores — on goods exported or used to make exported products',
        'appliesTo': 'All 102 lines',
        'document': 'A drawback claim to CBP with import and export records (19 CFR part 191).',
        'caveat': 'Antidumping and countervailing duties are not refundable as drawback; claims have strict time limits and record requirements.',
        'citations': [
            {'label': '19 CFR part 191', 'url': EC + 'title-19/part-191'},
            {'label': '19 CFR 191.3', 'url': EC + 'title-19/section-191.3'},
        ],
    },
]
te['rules'] = [
    {'id': 'cbp-assay', 'agency': 'CBP',
     'title': 'Metal-bearing ores and materials: sampled for moisture and assay at the port of first arrival (or moved under bond to a sampling plant)',
     'citations': [{'label': '19 CFR 151.51', 'url': EC + 'title-19/section-151.51'}, {'label': '19 CFR 151.52', 'url': EC + 'title-19/section-151.52'}]},
    {'id': 'metal-content-report', 'agency': 'CBP / USITC (HTS)',
     'title': 'Report the weight and value of each named metal (copper, lead, zinc, silver, gold …) under its own 10-digit line; one shipment can need several lines',
     'citations': [{'label': 'HTSUS Ch. 26, statistical note 3', 'url': HTSCH26}]},
    {'id': 'tsca', 'agency': 'EPA / CBP', 'title': 'TSCA import certification (positive or negative) for chemical substances at entry',
     'citations': [{'label': '19 CFR 12.121', 'url': EC + 'title-19/section-12.121'}]},
    {'id': 'nrc-source', 'agency': 'NRC',
     'title': 'Uranium and thorium ores are source material: imported under the general license only if the U.S. consignee is authorized by an NRC or Agreement State license (unprocessed ore may be held but not processed without one)',
     'citations': [{'label': '10 CFR 110.27', 'url': EC + 'title-10/section-110.27'}, {'label': '10 CFR 40.13', 'url': EC + 'title-10/section-40.13'},
                   {'label': 'NRC: Export-Import licensing', 'url': 'https://www.nrc.gov/about-nrc/ip/export-import.html'}]},
    {'id': 'dot-class7', 'agency': 'U.S. DOT (PHMSA)',
     'title': 'Uranium and thorium ores and concentrates intended for processing are Class 7 (radioactive) in transport; natural ores not processed for their radionuclides are excepted below 10 times the exempt activity',
     'citations': [{'label': '49 CFR 173.401', 'url': EC + 'title-49/section-173.401'}]},
    {'id': 'epa-hazwaste', 'agency': 'EPA',
     'title': 'Slag, ash, sludge and residues that are hazardous waste: importer notification, EPA consent, contract and manifest before shipment',
     'citations': [{'label': '40 CFR 262.84', 'url': EC + 'title-40/section-262.84'}]},
]
GNOTE = {
    '2601': 'Pellets (2601.12) pay the 2026 Section 301 duty and, from Russia, 35%; ore fines and concentrate (2601.11) are exempt. Report tonnage by coarse, concentrate and other.',
    '2602': 'Exempt from the 2026 Section 301 duty; China-origin ore pays 25% (2024 review). Classification at 20% or more manganese is on a dry-weight basis (additional U.S. note 2).',
    '2603': 'Duty is on the lead content (18 kg/t deduction); report copper, lead, zinc, silver and gold content under separate lines. Not covered by the Section 232 copper tariff.',
    '2604': 'Report nickel content and other metal content separately. Exempt from the 2026 Section 301 duty.',
    '2605': 'Exempt from the 2026 Section 301 duty; China-origin ore pays 25%.',
    '2606': 'Exempt from the 2026 Section 301 duty; China-origin bauxite pays 25%.',
    '2607': 'Content duty on lead (18 kg/t deduction) and the 2026 Section 301 duty; claim USMCA for Canadian concentrate.',
    '2608': 'Report metal contents separately. Exempt from the 2026 Section 301 duty; China-origin concentrate pays 25%.',
    '2609': 'No extra duty from any origin.',
    '2610': 'Lines split by Cr2O3 content. Exempt from the 2026 Section 301 duty; China-origin ore pays 25%.',
    '2611': 'Concentrates pay 37.5¢/kg on tungsten content (Free under FTAs and AGOA); Chinese concentrates +25%.',
    '2612': 'NRC: the U.S. consignee must hold an NRC or Agreement State license for source material; DOT Class 7 rules apply to ore for processing.',
    '2613': 'Unroasted concentrate exempt from the 2026 Section 301 duty; roasted (2613.10) pays it even with an FTA claim.',
    '2614': 'Mineral sands can contain thorium or uranium; at 0.05% or more by weight they are NRC source material.',
    '2615': 'Zircon (2615.10) pays the 2026 Section 301 duty and, from Russia, 35%. Tantalum and niobium ores can contain uranium or thorium (NRC rules at 0.05% or more).',
    '2616': 'Content duty on lead; report each precious metal. Silver ores exempt from the 2026 Section 301 duty, gold ores (2616.90) not.',
    '2617': 'Antimony ores exempt from the 2026 Section 301 duty; beryllium and other ores (2617.90) not.',
    '2618': 'Pays the 2026 Section 301 duty (Japan and the EU 12.5% and 10% in total).',
    '2619': 'Pays the 2026 Section 301 duty. Check whether the material is a hazardous waste before shipping.',
    '2620': 'Residues such as leaded gasoline sludge, arsenic or mercury residues can be hazardous waste (EPA consent). Only 2620.30 and 2620.99.50 are exempt from the 2026 Section 301 duty.',
    '2621': 'Incinerator ash can be hazardous waste (EPA consent). Pays the 2026 Section 301 duty; Chinese ash 20%.',
}
GRULES = {h: ['cbp-assay', 'tsca'] for h in LABEL}
GRULES['2621'] = ['tsca', 'epa-hazwaste']
GRULES['2620'] = ['cbp-assay', 'metal-content-report', 'tsca', 'epa-hazwaste']
GRULES['2619'] = ['cbp-assay', 'tsca', 'epa-hazwaste']
for h in ['2603', '2604', '2607', '2608', '2616']:
    GRULES[h] = ['cbp-assay', 'metal-content-report', 'tsca']
GRULES['2612'] = ['cbp-assay', 'tsca', 'nrc-source', 'dot-class7']
for g in te['groups']:
    g['label'] = LABEL[g['heading']][0]
    g['ruleIds'] = GRULES[g['heading']]
    g['note'] = GNOTE[g['heading']]

# per-line rule + lever mapping
ca_row = [r for r in ia['countries'] if r['country'] == 'Canada'][0]
s301_lines = set()
for cell in ca_row['cells'].values():
    for b in cell['withoutUsmca']['breakdown']:
        if not b['extra'].startswith('None'):
            s301_lines.update(b['lines'])
assert len(s301_lines) == 52, len(s301_lines)
STAT3 = ('2603.00.00', '2604.00.00', '2607.00.00', '2608.00.00', '2616.10.00', '2616.90.00', '2620.19.60', '2620.21.00', '2620.29.00', '2620.30.00',
         '2620.99.75.60', '2620.99.75.80')
rate_by_hts = {r['hts']: r for r in lines}
for ln in te['lines']:
    h = ln['heading']
    rid = list(GRULES[h])
    if h == '2620' and not ln['hts'].startswith(STAT3):
        rid = [x for x in rid if x != 'metal-content-report']
    ln['ruleIds'] = rid
    lev = []
    gen = ln['general'] or ''
    if rate_by_hts[ln['hts']]['dutiable']:
        lev.append('fta-agoa')
    if rate_by_hts[ln['hts']]['dutiable'] or ln['hts'] in s301_lines:
        lev.append('usmca')
    if 'content' in gen:
        lev += ['assay', 'bonded-smelting']
    if ln['hts'] in s301_lines:
        lev.append('origin-301')
    lev.append('drawback')
    ln['leverIds'] = lev
assert sum('usmca' in ln['leverIds'] for ln in te['lines']) == 64
te['disclaimer'] = ('A checklist of where the rules are, with links to the regulations — not legal advice. Whether a residue is a hazardous waste, '
                    'or an ore is NRC source material, depends on its composition; check with EPA, the NRC and CBP before importing.')

# ---------------------------------------------------------------------------------------------
# final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['seo'] = {
    'title': 'Ores & Critical Minerals Tariff FAQ: Iron Ore, Copper Ore, Uranium, Bauxite, HS Codes (HTS Ch. 26) | KoalaGains',
    'shortDescription': (
        'Answers to what people search about ore tariffs: is there a tariff on iron ore or copper concentrate, are critical minerals exempt, the '
        'Section 232 critical-minerals decision, uranium and tungsten tariffs, and HS codes for iron ore, copper concentrate, slag and bauxite.'
    ),
    'keywords': [
        'tariff on iron ore',
        'copper concentrate tariff code',
        'are critical minerals exempt from tariffs',
        'section 232 critical minerals tariffs',
        'trump uranium tariffs',
        'is there a tariff on bauxite',
        'tariff on tungsten from china',
        'hs code for iron ore pellets',
        'hs code for copper ores and concentrates',
        'hs code for granulated blast furnace slag',
    ],
}
fc['intro'] = ('Straight answers to the most common questions about U.S. tariffs on ores, concentrates, slag and ash — by product, by country '
               'and by HS code. Each answer links to the page with the full detail.')
fc['keyTakeaways'] = [
    '72 of the 102 Chapter 26 lines are Free; the other 30 charge cents per kg of metal content, which FTA, USMCA and AGOA claims remove.',
    'Most ores are exempt from the 2026 Section 301 tariffs (U.S. note 52(b)); iron ore pellets, lead ore, roasted molybdenum, zircon, gold ores, '
    'slag, ash and residues pay 10–12.5% (Brazil up to 37.5%, USMCA goods exempt). China pays 25% on most ores.',
    'No Section 232 tariff reaches Chapter 26: copper ores are outside the copper tariff and the January 2026 critical-minerals action set no '
    'tariff. The IEEPA tariffs ended on February 24, 2026.',
]
fc['lastCheckedAt'] = TODAY
fc['questionSource'] = 'Google search suggestions, collected October 12, 2026'
fc['faqs'] = [
    {'id': 'iron-ore', 'question': 'Is there a tariff on iron ore?',
     'searchedAs': ['tariff on iron ore', 'tariffs on iron ore', 'us tariff on iron ore', 'iron ore tariffs', 'iron ore tariff code'],
     'answer': ('Iron ore is Free under the general rate, but the extra duty depends on its form. Ore fines and concentrate (2601.11) are on the '
                'U.S. note 52(b) list and pay nothing extra. Pellets and other agglomerated ore (2601.12) pay the 2026 Section 301 duty: 12.5% '
                'from Brazil, Australia or Chile, 10% from the EU, and 10% from Canada unless a USMCA claim is made. Chinese iron ore pays 25% '
                'or 37.5%, and Russian pellets 35% plus 12.5%.'),
     'link': 'industry-areas'},
    {'id': 'iron-ore-from', 'question': 'Where does the U.S. import iron ore from?',
     'searchedAs': ['where does the us import iron ore from', 'where does us get iron ore', 'us imports of iron ore', 'does us import iron ore'],
     'answer': (f'Mostly Brazil ({hc("Brazil", "2601")} in 2025) and Canada ({hc("Canada", "2601")}), then Sweden and Chile. U.S. iron ore '
                f'imports were {head("2601")} in 2025, nearly all pellets ({hs6("260112")}).'),
     'link': 'understand-industry'},
    {'id': 'hs-iron-ore', 'question': 'What is the HS code for iron ore pellets, fines and concentrate?',
     'searchedAs': ['hs code for iron ore', 'hs code for iron ore pellets', 'hs code for iron ore fines', 'hs code for iron ore concentrate',
                    'hs code of iron ore lumps', 'hs code 2601.11', 'hs code 2601.12'],
     'answer': ('2601.11 is non-agglomerated iron ore — fines, lumps and concentrate (U.S. lines 2601.11.00.30 concentrates, .60 coarse, .90 other). '
                '2601.12 is agglomerated ore: pellets (2601.12.00.30), briquettes (.60) and other (.90). Roasted iron pyrites is '
                '2601.20. All are Free; only 2601.12 pays the 2026 Section 301 duty.'),
     'link': ''},
    {'id': 'copper-ore', 'question': 'Is there a tariff on copper ore or copper concentrate?',
     'searchedAs': ['copper ore tariff', 'copper concentrate tariff code', 'copper tariff', 'copper tariff chile', 'chile copper tariff'],
     'answer': ('Copper ores and concentrates (2603.00.00) pay 1.7¢/kg on their lead content, less 18 kg per dry ton — Free from Chile, Peru, '
                'Australia, Canada, Mexico and other FTA partners. They are on the note 52(b) list, so no 2026 Section 301 duty applies, and the '
                '50% Section 232 copper tariff (Proclamation 10962, August 1, 2025) covers semi-finished copper products and derivatives, not ores '
                'or concentrates. The U.S. imported only $0.7M of copper ores in 2025.'),
     'link': 'tariff-updates'},
    {'id': 'hs-copper', 'question': 'What is the HS code for copper ores and concentrates?',
     'searchedAs': ['hs code for copper concentrate', 'hs code for copper ores and concentrates', 'hs code for copper ore', 'hs code 2603',
                    'hs code 2603.00'],
     'answer': ('2603.00.00. The U.S. reports a shipment under five 10-digit lines by metal: copper content (2603.00.00.10), lead (.20), zinc (.30), '
                'silver (.40) and gold (.50), each with that metal\'s weight and value. Copper mattes and cement copper are 7401 (Chapter 74), not '
                'Chapter 26.'),
     'link': ''},
    {'id': 'critical-exempt', 'question': 'Are critical minerals exempt from tariffs?',
     'searchedAs': ['are critical minerals exempt from tariffs', 'critical minerals exempt from tariffs', 'us tariffs on critical minerals',
                    'trump tariff on critical minerals', 'critical minerals tariffs us'],
     'answer': ('Mostly, at the ore stage. Manganese, nickel, cobalt, bauxite, zinc, tin, chromium, tungsten, uranium, titanium, niobium, tantalum, '
                'vanadium and antimony ores are on the 2026 Section 301 exemption list (U.S. note 52(b)), as most were on the reciprocal tariff and '
                'Section 122 exemption lists. Zircon and beryllium ores are not, and China-origin ores pay 25% under Section 301 whatever the '
                'mineral. Processed critical minerals in Chapters 28, 81 and others have their own rates.'),
     'link': 'tariff-updates'},
    {'id': 'section-232-cm', 'question': 'What happened with the Section 232 critical minerals investigation?',
     'searchedAs': ['section 232 critical minerals', 'section 232 critical minerals tariffs', 'section 232 critical minerals deadline',
                    'section 232 processed critical minerals', 'critical minerals 232 tariffs', 'section 232 critical minerals report'],
     'answer': ('Commerce began the investigation under Executive Order 14272 (April 15, 2025) and reported on October 24, 2025. In Proclamation '
                '11001 of January 14, 2026 the President agreed that imports threaten national security but chose negotiations — with price floors '
                'to be considered — instead of tariffs, with an update due within 180 days. USTR asked for comments on a plurilateral critical-minerals '
                'agreement on February 26, 2026. No Section 232 duty applies to Chapter 26 ores.'),
     'link': 'tariff-updates'},
    {'id': 'uranium', 'question': 'Is there a tariff on uranium?',
     'searchedAs': ['tariff on uranium', 'tariffs on uranium', 'trump uranium tariffs', 'us uranium tariffs', 'uranium tariff canada'],
     'answer': (f'Uranium ores and concentrates (2612.10) are Free and on the note 52(b) exemption list, so Australian and Namibian supplies pay no '
                f'tariff. Only China-origin ore pays (25%, List 3). Canadian uranium ore paid 10% under IEEPA in 2025 unless entered under USMCA, but '
                f'that ended February 24, 2026. Uranium ore was the largest Chapter 26 import in 2025 ({head("2612")}). Importers need an '
                f'NRC-authorized consignee (10 CFR 110.27).'),
     'link': 'tariff-engineering'},
    {'id': 'uranium-russia', 'question': 'Does the U.S. import uranium from Russia?',
     'searchedAs': ['does the us import uranium from russia', 'does the us still import uranium from russia', 'does the us import enriched uranium from russia',
                    'what countries does the us import uranium from'],
     'answer': ('Not uranium ore: 2025 Chapter 26 uranium imports came from Australia and Namibia. The Prohibiting Russian Uranium Imports Act '
                '(Public Law 118-62, May 13, 2024) bans unirradiated low-enriched uranium produced in Russia from August 2024, with Energy Department waivers '
                'capped by annual quantities and ending no later than January 1, 2028.'),
     'link': 'understand-industry'},
    {'id': 'bauxite', 'question': 'Is there a tariff on bauxite?',
     'searchedAs': ['is there a tariff on bauxite', 'tariff on bauxite', 'where does the us import bauxite from', 'where does the us get bauxite from',
                    'hs code for bauxite ore'],
     'answer': (f'No, except from China. Bauxite (2606.00.00) is Free and on the note 52(b) list, so it pays nothing extra from Guyana, Jamaica, '
                f'Australia or Brazil; Chinese bauxite pays 25% (2024 four-year review). The U.S. imported {head("2606")} in 2025, mainly from Guyana '
                f'({hc("Guyana", "2606")}) and Jamaica ({hc("Jamaica", "2606")}).'),
     'link': 'industry-areas'},
    {'id': 'tungsten', 'question': 'What is the tariff on tungsten ore from China?',
     'searchedAs': ['tariff on tungsten from china', 'us tariff on tungsten', 'is there a tariff on tungsten', 'tungsten tariff code', 'tariff on china minerals'],
     'answer': ('Tungsten concentrates (2611.00.60) pay 37.5¢/kg on tungsten content plus 25% for China (9903.91.01, since September 27, 2024). '
                'Tungsten ores (2611.00.30) are Free and on no China list. Both are exempt from the 2026 Section 301 duty, and concentrates are Free '
                'from FTA partners such as Australia, Korea and Peru.'),
     'link': 'industry-areas'},
    {'id': 'hs-slag', 'question': 'What is the HS code for slag?',
     'searchedAs': ['hs code for slag', 'hs code for granulated blast furnace slag', 'hs code for steel slag', 'hs code for copper slag',
                    'hs code for granulated slag', 'hs code 2620'],
     'answer': ('Granulated blast-furnace slag (slag sand) is 2618.00.00; other iron and steel slag, dross and mill scale 2619.00; slag and residues '
                'used to recover other metals 2620 (copper residues 2620.30, zinc dross 2620.19.30, titanium slag 2620.99.50); incinerator and '
                'other ash 2621. Slag prepared as macadam is 2517 and slag wool 6806. All Chapter 26 slag lines are Free, but most pay the 2026 '
                'Section 301 duty.'),
     'link': ''},
    {'id': 'hs-minerals', 'question': 'What are the HS codes for manganese, chrome, ilmenite, rutile and zircon?',
     'searchedAs': ['manganese hs code', 'hs code for chrome ore', 'hs code for chromite ore', 'hs code for ilmenite sand', 'hs code for rutile sand',
                    'hs code for zircon'],
     'answer': ('Manganese ore 2602.00.00; chromite (chrome ore) 2610.00.00, split by Cr2O3 content; ilmenite and ilmenite sand 2614.00.60.20; '
                'rutile and rutile sand 2614.00.60.40; synthetic rutile 2614.00.30; zircon (zirconium ore) 2615.10.00. All are Free; zircon is the '
                'only one not exempt from the 2026 Section 301 duty.'),
     'link': ''},
]
links = {'', 'tariff-updates', 'understand-industry', 'industry-areas', 'tariff-engineering', 'final-conclusion'}
assert all(f['link'] in links for f in fc['faqs'])
assert 11 <= len(fc['faqs']) <= 15

# ---------------------------------------------------------------------------------------------
# chapter-level
# ---------------------------------------------------------------------------------------------
d['asOf'] = TODAY
d['sources'] = [
    {'label': 'Harmonized Tariff Schedule of the United States', 'url': 'https://hts.usitc.gov/', 'note': 'rate table rows and Chapter 26 notes (2026 Revision 21)'},
    {'label': 'UN Comtrade', 'url': 'https://comtradeplus.un.org/', 'note': '2025 import figures'},
]

# ---------------------------------------------------------------------------------------------
# write
# ---------------------------------------------------------------------------------------------
blob = json.dumps(d, ensure_ascii=False)
left = re.findall(r'[^"]{0,60}\bTODO\b[^"]{0,60}', blob)
if left:
    print('TODO left:', left[:10])
    sys.exit(1)
if '[forbidden-source-name]' in blob.lower():
    sys.exit('forbidden word')
with open(OUT, 'w') as f:
    f.write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
subprocess.run(['npx', 'prettier', '--write', OUT], cwd=REPO, check=True, stdout=subprocess.DEVNULL)
print('wrote', OUT)
