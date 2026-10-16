#!/usr/bin/env python3
"""Fill the writer TODOs of the generated Chapter 47 content file (re-runnable).

Usage: python3 fill47.py <generated.json> <out.json>
Input is the untouched output of `pnpm tariff:generate-chapter --chapter 47 ...` (copied to gen.json);
the data parts (rate table, matrix totals, trade figures, line statuses) are kept as generated.
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import FILLS  # noqa: E402,F401

import json
import sys

SCRATCH = FILLS + "/47"
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src))
reuse = {s['id']: s for s in json.load(open(f'{SCRATCH}/reuse-sources.json'))}

TODAY = '2026-10-12'
CH99 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
CH47 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2047'
GN = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
FR = 'https://www.federalregister.gov/documents/'


def fr(id_, citation, document, title, published, path, signed=None, publisher='Federal Register'):
    return {'id': id_, 'publisher': publisher, 'citation': citation, 'document': document, 'title': title,
            'signed': signed, 'published': published, 'url': FR + path}


NEW_SOURCES = [
    {'id': 'hts-ch47', 'publisher': 'USITC', 'citation': 'HTSUS 2026 Revision 21, Chapter 47', 'document': 'Harmonized Tariff Schedule',
     'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 47', 'signed': None, 'published': '2026-10-07', 'url': CH47},
    {'id': 'hts-2025r22-cr', 'publisher': 'USITC', 'citation': 'HTSUS 2025 Revision 22 Change Record', 'document': 'Change Record',
     'title': 'Harmonized Tariff Schedule of the United States (2025 Revision 22), Change Record', 'signed': None, 'published': '2025-09-08',
     'url': 'https://hts.usitc.gov/reststop/file?release=2025HTSRev22&filename=Change%20Record'},
    fr('procl-10976', '90 FR 48127', 'Proclamation 10976', 'Adjusting Imports of Timber, Lumber, and Their Derivative Products Into the United States',
       '2025-10-06', '2025/10/06/2025-19482/adjusting-imports-of-timber-lumber-and-their-derivative-products-into-the-united-states', signed='2025-09-29'),
    fr('procl-11048', '91 FR 46663', 'Proclamation 11048',
       'Imposing Additional Duties To Offset Canadian Discrimination Against the Commerce of the United States With Respect to Motor Vehicles',
       '2026-07-23', '2026/07/23/2026-14997/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united', signed='2026-07-20'),
    fr('fr-2025-15518', '90 FR 39419', 'Notice (USITC)',
       'High Purity Dissolving Pulp From Brazil and Norway; Institution of Antidumping and Countervailing Duty Investigations and Scheduling of Preliminary Phase Investigations',
       '2025-08-15', '2025/08/15/2025-15518/high-purity-dissolving-pulp-from-brazil-and-norway-institution-of-antidumping-and-countervailing'),
    fr('fr-2025-17129', '90 FR 43168', 'Notice (Commerce)', 'High Purity Dissolving Pulp From Brazil and Norway: Initiation of Less-Than-Fair-Value Investigations',
       '2025-09-08', '2025/09/08/2025-17129/high-purity-dissolving-pulp-from-brazil-and-norway-initiation-of-less-than-fair-value-investigations'),
    fr('fr-2025-17224', '90 FR 43174', 'Notice (Commerce)', 'High Purity Dissolving Pulp From Brazil: Initiation of Countervailing Duty Investigation',
       '2025-09-08', '2025/09/08/2025-17224/high-purity-dissolving-pulp-from-brazil-initiation-of-countervailing-duty-investigation'),
    fr('fr-2025-19027', '90 FR 46920', 'Notice (USITC)', 'High Purity Dissolving Pulp From Brazil and Norway; Determinations',
       '2025-09-30', '2025/09/30/2025-19027/high-purity-dissolving-pulp-from-brazil-and-norway-determinations'),
    fr('fr-2026-05805', '91 FR 14524', 'Notice (Commerce)',
       'High Purity Dissolving Pulp From Brazil: Preliminary Affirmative Countervailing Duty Determination and Alignment of Final Determination With Final Antidumping Duty Determination',
       '2026-03-25', '2026/03/25/2026-05805/high-purity-dissolving-pulp-from-brazil-preliminary-affirmative-countervailing-duty-determination'),
    fr('fr-2026-10523', '91 FR 31418', 'Notice (Commerce)',
       'High Purity Dissolving Pulp From Brazil: Preliminary Affirmative Determination of Sales at Less Than Fair Value, Postponement of Final Determination, and Extension of Provisional Measures',
       '2026-05-27', '2026/05/27/2026-10523/high-purity-dissolving-pulp-from-brazil-preliminary-affirmative-determination-of-sales-at-less-than'),
    fr('fr-2026-10527', '91 FR 31413', 'Notice (Commerce)',
       'High Purity Dissolving Pulp From Norway: Preliminary Affirmative Determination of Sales at Less Than Fair Value, Postponement of Final Determination, and Extension of Provisional Measures',
       '2026-05-27', '2026/05/27/2026-10527/high-purity-dissolving-pulp-from-norway-preliminary-affirmative-determination-of-sales-at-less-than'),
    fr('fr-2026-11617', '91 FR 35268', 'Notice (USITC)',
       'High Purity Dissolving Pulp From Brazil and Norway; Scheduling of the Final Phase of Countervailing Duty and Antidumping Duty Investigations',
       '2026-06-10', '2026/06/10/2026-11617/high-purity-dissolving-pulp-from-brazil-and-norway-scheduling-of-the-final-phase-of-countervailing'),
]
for sid in ['eo-14193', 'eo-14194', 'eo-14195', 'eo-14228', 'eo-14231', 'eo-14232', 'eo-14257', 'eo-14259', 'eo-14266', 'eo-14298', 'eo-14323',
            'eo-14325', 'eo-14326', 'eo-14346', 'eo-14357', 'eo-14389', 'csms-67834313', 'scotus-24-1287', 'procl-11012', 'ustr-usmca-review']:
    NEW_SOURCES.append(reuse[sid])

d['asOf'] = TODAY
d['sources'] = [
    {'label': 'Harmonized Tariff Schedule of the United States', 'url': 'https://hts.usitc.gov/', 'note': 'rate table rows and Chapter 47 note (2026 Revision 21)'},
    {'label': 'UN Comtrade', 'url': 'https://comtradeplus.un.org/', 'note': '2025 import figures'},
]

# ---------------------------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------------------------
ov = d['overview']
ov['seo'] = {
    'title': 'HTS Chapter 47 Wood Pulp Tariffs: Kraft, Dissolving Pulp & Recovered Paper Import Duties | KoalaGains',
    'shortDescription': 'Searchable duty table for all 26 HTS Chapter 47 lines: mechanical, dissolving, kraft (NBSK, eucalyptus, fluff) and sulfite pulp, recycled-fiber pulp and recovered paper. All Free at base; which origins pay the 2026 Section 301, Brazil and Canada Section 338 duties, and which kraft grades are exempt.',
    'keywords': ['HTS Chapter 47', 'wood pulp tariffs', 'pulp of wood tariff', 'hs code for wood pulp', 'hs code 4703', 'waste and scrap of paper or paperboard',
                 'recovered paper hs code 4707', 'dissolving pulp tariff', 'pulp tariffs canada', 'brazil pulp tariff', 'Section 301 tariffs pulp'],
}
ov['intro'] = (
    'Chapter 47 covers wood pulp and recovered paper: mechanical pulp (4701), dissolving pulp (4702), kraft or sulfate pulp such as NBSK, '
    'eucalyptus and fluff pulp (4703), sulfite pulp (4704), semichemical pulp (4705), pulps of recycled fiber, cotton linters and bamboo (4706), '
    'and recovered (waste and scrap) paper and paperboard such as old corrugated containers (4707). **All 26 tariff lines are Free** under the '
    'general rate, and the U.S. imported **$4.14B** of them in 2025, 82% from Canada and Brazil.\n\n'
    'So the extra duties are the story, and they depend on the grade. Bleached and unbleached softwood kraft and bleached hardwood kraft '
    '(**4703.11, 4703.21 and 4703.29**, 82% of 2025 imports) are on the exemption lists of both 2026 Section 301 actions (U.S. notes 52(b) and 50(a)(ii)), '
    'so they enter Free from every supplier except China. The other pulps and recovered paper pay the **2026 Section 301 duty** of 10% or 12.5% '
    'when they come from one of the 60 listed economies (Canadian and Mexican goods are exempt with a USMCA claim). Brazil pays another **25%** on '
    'mechanical pulp, dissolving pulp and recovered paper; China pays **25% under List 3** on every line; and Canadian **dissolving pulp pays 50%** '
    'under Section 338 since August 22, 2026, even with a USMCA claim. Separately, high purity dissolving pulp from Brazil and Norway is under '
    'antidumping and countervailing duty investigations, with preliminary cash deposits that the tariff calculator does not include.'
)
ov['stats'][2]['note'] = ('China List 3: all 26; 2026 Section 301: 21 (all but kraft pulp 4703.11, 4703.21, 4703.29); Brazil 25%: 9; '
                          'Canada Section 338: 2 (dissolving pulp). USMCA goods are exempt from the 2026 Section 301 duty but not from Section 338.')

GROUPS = {
    '4701': ('Mechanical wood pulp', 'Mechanical', 'Groundwood and thermomechanical pulp: one line, Free. From the 60 Section 301 economies it pays 10% or 12.5%, from Brazil 37.5%. Almost all U.S. imports come from Canada, which are Free with a USMCA claim.',
             ['groundwood pulp', 'mechanical pulp', 'thermomechanical pulp', 'TMP']),
    '4702': ('Dissolving pulp', 'Dissolving', 'Chemical wood pulp of dissolving grades (chapter note 1): 2 lines (sulfite; sulfate or soda), Free. The most taxed group: 50% for Canada (Section 338), 37.5% for Brazil and China, 10% or 12.5% for other Section 301 economies, plus preliminary AD/CVD on high purity grades from Brazil and Norway.',
             ['dissolving pulp', 'dissolving wood pulp', 'high purity dissolving pulp', 'viscose pulp', 'acetate pulp']),
    '4703': ('Kraft (sulfate) pulp: NBSK, eucalyptus, fluff', 'Kraft pulp', 'Paper-grade chemical pulp made by the soda or sulfate (kraft) process: 6 lines, Free. Unbleached softwood (4703.11) and bleached softwood and hardwood kraft (4703.21, 4703.29) are exempt from every 2026 Section 301 duty, so they are Free from everyone but China; unbleached hardwood kraft (4703.19) is not.',
             ['NBSK', 'bleached softwood kraft', 'eucalyptus pulp', 'hardwood kraft pulp', 'fluff pulp', 'unbleached kraft pulp']),
    '4704': ('Sulfite pulp', 'Sulfite', 'Paper-grade chemical pulp made by the sulfite process: 4 lines, Free. Not on the 2026 Section 301 exemption list, so 10% or 12.5% from the 60 economies (Canada and Mexico Free with USMCA); exempt from Brazil\'s 25%.',
             ['sulfite pulp', 'bleached sulfite pulp', 'unbleached sulfite pulp']),
    '4705': ('Semichemical (mechanical-chemical) pulp', 'Semichemical', 'Wood pulp made by a combination of mechanical and chemical pulping: one line, Free. Same extra duties as sulfite pulp: 10% or 12.5% from the 60 Section 301 economies, USMCA goods exempt.',
             ['semichemical pulp', 'chemi-mechanical pulp', 'mechanical-chemical pulp']),
    '4706': ('Recycled-fiber, cotton linter & bamboo pulp', 'Recycled & other', 'Pulp from recovered paper (deinked pulp), cotton linters, bamboo and other fibrous cellulosic material such as bagasse: 6 lines, Free. 10% or 12.5% from the 60 Section 301 economies; exempt from Brazil\'s 25%.',
             ['deinked pulp', 'recycled pulp', 'cotton linters pulp', 'bamboo pulp', 'bagasse pulp']),
    '4707': ('Recovered paper (waste & scrap)', 'Recovered paper', 'Waste and scrap paper and paperboard for recycling, sorted by grade: OCC, office paper, newspapers and mixed paper: 6 lines, Free. 10% or 12.5% from the 60 Section 301 economies (Canada and Mexico Free with USMCA), 37.5% from Brazil and China.',
             ['OCC', 'old corrugated containers', 'waste paper', 'scrap paper', 'old newspapers', 'sorted office paper']),
}
for g in ov['productGroups']:
    label, short, blurb, ex = GROUPS[g['heading']]
    g['label'], g['blurb'], g['searchExamples'] = label, blurb, ex
for g in d['industryAreas']['groups']:
    g['label'], g['shortLabel'] = GROUPS[g['heading']][0], GROUPS[g['heading']][1]

ov['workedExamples'] = [
    {'title': '$1M of bleached eucalyptus pulp from Brazil', 'line': '4703.29.00.40',
     'body': 'Bleached hardwood kraft pulp is **Free** under the general rate, and 4703.29.00 is on both 2026 Section 301 exemption lists: U.S. note 50(a)(ii) lifts Brazil\'s 25% duty (9903.05.01) and note 52(b) lifts the 12.5% duty on Brazil (9903.05.27). The duty is **$0**. In 2025 the same pulp paid the 10% reciprocal tariff from April 5 until September 8, 2025, when Executive Order 14346 exempted it.'},
    {'title': '$1M of dissolving pulp from Brazil', 'line': '4702.00.00.40',
     'body': 'Dissolving pulp is Free at base but is on neither exemption list, so Brazil pays **25% + 12.5% = 37.5%** (9903.05.01 and 9903.05.27): **$375,000**. If it is high purity dissolving pulp (at least 90% alpha cellulose and 90% brightness), Commerce\'s preliminary determinations add an antidumping cash deposit of **7.20%** (Bracell and all others, 91 FR 31418) and a countervailing rate of 3.67% (91 FR 14524), which the tariff calculator does not include. Final determinations are pending.'},
    {'title': 'Dissolving pulp from Canada', 'line': '4702.00.00.20',
     'body': 'Since August 22, 2026, 4702.00.00 is on the Section 338 list in U.S. note 51(b)(3), so Canadian dissolving pulp pays **50%** (9903.03.14). Note 51(a) applies it even when USMCA is claimed. Without a USMCA claim the 10% 2026 Section 301 duty (9903.05.29) is added: **60%**. Canada shipped no dissolving pulp to the U.S. in 2025 (UN Comtrade).'},
    {'title': 'Old corrugated containers (OCC) from Canada', 'line': '4707.10.00.00',
     'body': 'Recovered paper is Free at base. With a USMCA claim it stays **$0**, because U.S. note 52(g) (9903.05.93) exempts USMCA goods from the 10% Section 301 duty on Canada. Without the claim it pays **10%** (9903.05.29); 4707 is not on the note 52(b) list. Canada supplied $94.9M of the $99.8M of recovered paper the U.S. imported in 2025.'},
]
ov['tradeSnapshot']['biggestLines'] = [
    {'hts': '4703.21', 'label': 'Bleached or semibleached softwood kraft pulp'},
    {'hts': '4703.29', 'label': 'Bleached or semibleached hardwood kraft pulp (e.g. eucalyptus)'},
]
ov['tradeSnapshot']['coverageNote'] = 'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade.'
ov['notes'] = {
    'chapterNotes': '**Note 1.** For the purposes of heading 4702, the expression "chemical wood pulp, dissolving grades" means chemical woodpulp having by weight an insoluble fraction of 92 percent or more for soda or sulfate woodpulp or of 88 percent or more for sulfite woodpulp after one hour in a caustic soda solution containing 18 percent sodium hydroxide (NaOH) at 20°C, and for sulfite woodpulp an ash content that does not exceed 0.15 percent by weight.',
    'additionalUsNotes': None,
}

# ---------------------------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['seo'] = {
    'title': 'Wood Pulp Tariff Updates 2025–2026: Canada, Brazil, Section 301 & Dissolving Pulp AD/CVD (HTS Ch. 47) | KoalaGains',
    'shortDescription': 'What changed for pulp and recovered paper imports since January 2025: the IEEPA duties and their end, the Section 122 surcharge, the 2026 Section 301 and Brazil duties and their kraft-pulp exemptions, Section 338 on Canadian dissolving pulp, and the dissolving pulp AD/CVD cases, with Federal Register citations.',
    'keywords': ['wood pulp tariffs 2026', 'tariffs on canadian pulp', 'brazil pulp tariff', 'us tariffs on pulp', 'dissolving pulp antidumping',
                 'section 338 canada', 'pulp tariff exemption'],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current '
    '**2026 Revision 21** (in force October 9, 2026). All 26 Chapter 47 lines are **Free** in both; the base rates did not change.\n\n'
    'The extra duties changed a lot. In 2025 non-USMCA pulp from Canada and Mexico paid IEEPA duties, pulp and recovered paper from most other '
    'countries paid the reciprocal tariff, and Brazil paid another 40% on mechanical pulp and recovered paper (wood pulp of 4702–4706 was exempt). '
    'Bleached and unbleached softwood kraft and bleached hardwood kraft (4703.11, 4703.21, 4703.29) were exempted from the reciprocal tariff on '
    '**September 8, 2025**. All IEEPA duties **ended on February 24, 2026**; the 10% Section 122 surcharge that replaced them (same kraft grades '
    'exempt) expired on **July 23, 2026**.\n\n'
    'Today four measures apply: the **2026 Section 301 duties** on 60 economies (from July 24, 2026; kraft grades exempt), **Brazil\'s 25% Section 301 '
    'duty** (from July 22, 2026; only 4701, 4702 and 4707 pay it), **Section 338 at 50% on Canadian dissolving pulp** (from August 22, 2026) and '
    'China\'s **25% List 3** duty. Separately, **antidumping and countervailing duty investigations** on high purity dissolving pulp from Brazil and '
    'Norway reached preliminary affirmative determinations in 2026; they are listed below for reference and are **not included in the tariff calculator**.'
)
tu['scope'] = ('Chapter 99 measures that reach Chapter 47 from any country (2026 Section 301 on 60 economies, Brazil Section 301, Section 338 on '
               'Canada, China Section 301 List 3; the ended IEEPA and Section 122 duties), the Section 232 timber action (which does not cover pulp), '
               'and the antidumping and countervailing duty investigations on high purity dissolving pulp, which the tariff calculator does not model. '
               'For the rate each supplier pays, see Rates by country.')
tu['lastCheckedAt'] = TODAY
tu['stats'] = [
    {'label': 'Base rates unchanged', 'value': '26 of 26 lines', 'note': 'All Free'},
    {'label': 'Extra-duty programs in effect', 'value': '4', 'note': '2026 Section 301, Brazil 301, Canada Section 338, China List 3'},
    {'label': 'Kraft pulp exempt', 'value': '3 subheadings', 'note': '4703.11, 4703.21, 4703.29 (82% of 2025 imports)'},
    {'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'},
]

S301 = ['fr-2026-15181', 'fr-2026-15274', 'hts-chapter-99', 'hts-now']
NO_IEEPA = 'The IEEPA duties ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026.'
tu['inEffect'] = [
    {'id': 'ca-section-338', 'country': 'Canada', 'measure': 'Section 338 (motor vehicles action, Proclamation 11048)', 'ch99Code': '9903.03.14',
     'before': 'None', 'now': '+50% on dissolving pulp (4702)',
     'exemption': 'Only 4702.00.00 of Chapter 47 is on the list in U.S. note 51(b)(3). Note 51(a) applies the 50% even when USMCA or another special rate is claimed, and on top of any other Chapter 99 duty, so non-USMCA dissolving pulp also pays the 10% Section 301 duty (60% in all). Proclamation 11056 moved the start from August 19 to August 22, 2026; Proclamation 11065 (September 15, 2026) changed the list but kept 4702.00.00. The 50% does not apply to goods properly entered under most Chapter 98 provisions.',
     'whatItMeans': 'Canadian dissolving pulp pays half its value in duty: $500,000 on $1M with a USMCA claim, $600,000 without. Other Canadian pulp and recovered paper are not affected. Canada shipped no dissolving pulp to the U.S. in 2025.',
     'effectiveFrom': '2026-08-22', 'effectiveSourceId': 'procl-11056',
     'sourceIds': ['procl-11048', 'procl-11056', 'csms-69606660', 'procl-11065', 'csms-69851916', 'hts-chapter-99', 'hts-now']},
    {'id': 'ca-section-301', 'country': 'Canada', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.29', 'before': 'None', 'now': '+10% (USMCA goods exempt)',
     'exemption': 'Kraft pulp of 4703.11, 4703.21 and 4703.29 is on the general exemption list in U.S. note 52(b) (9903.05.86). Goods entered free under USMCA are exempt under note 52(g) (9903.05.93). ' + NO_IEEPA,
     'whatItMeans': 'Canadian NBSK and other kraft pulp in those three subheadings pays nothing. Sulfite, mechanical, semichemical and recycled-fiber pulp and recovered paper pay 10% only if they do not qualify for USMCA or no claim is made.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'br-section-301-brazil', 'country': 'Brazil', 'measure': 'Section 301 (Brazil)', 'ch99Code': '9903.05.01', 'before': 'None', 'now': '+25% on 4701, 4702 and 4707',
     'exemption': 'Every subheading of 4703, 4704, 4705 and 4706 is on the exemption list in U.S. note 50(a)(ii) (9903.05.03). Mechanical pulp (4701), dissolving pulp (4702) and recovered paper (4707) are not. The duty stacks with the 12.5% 2026 Section 301 duty on Brazil.',
     'whatItMeans': 'Brazilian eucalyptus and other kraft pulp do not pay it; Brazilian dissolving pulp, mechanical pulp and recovered paper pay 25% of value on top of the 12.5%.',
     'effectiveFrom': '2026-07-22', 'effectiveSourceId': 'fr-2026-14542', 'sourceIds': ['fr-2026-14542', 'hts-chapter-99', 'hts-now']},
    {'id': 'br-section-301', 'country': 'Brazil', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.27', 'before': 'None', 'now': '+12.5%',
     'exemption': 'Kraft pulp of 4703.11, 4703.21 and 4703.29 is exempt under U.S. note 52(b) (9903.05.86). ' + NO_IEEPA,
     'whatItMeans': 'Bleached eucalyptus kraft (4703.29), most of what Brazil ships, is Free. Unbleached hardwood kraft (4703.19), sulfite, semichemical and recycled-fiber pulp pay 12.5%; dissolving pulp, mechanical pulp and recovered paper pay 37.5% with the Brazil duty.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'eu-section-301', 'country': 'European Union (e.g. Sweden, Finland)', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.39',
     'before': 'None', 'now': '10% (in place of the Free base rate)',
     'exemption': 'Kraft pulp of 4703.11, 4703.21 and 4703.29 is exempt under U.S. note 52(b). No Chapter 47 line is on the EU-specific list in note 52(j)(2) (9903.05.97). ' + NO_IEEPA,
     'whatItMeans': 'Swedish and Finnish bleached kraft pulp is Free; their sulfite, semichemical, mechanical and dissolving pulp and recovered paper pay 10% of value.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'uy-section-301', 'country': 'Uruguay', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.82', 'before': 'None', 'now': '+12.5%',
     'exemption': 'Kraft pulp of 4703.11, 4703.21 and 4703.29 is exempt under U.S. note 52(b). ' + NO_IEEPA,
     'whatItMeans': 'All of Uruguay\'s 2025 shipments were kraft pulp (heading 4703); bleached grades are Free. Unbleached hardwood kraft and other pulps would pay 12.5%.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'za-section-301', 'country': 'South Africa', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.69', 'before': 'None', 'now': '+12.5%',
     'exemption': 'Kraft pulp of 4703.11, 4703.21 and 4703.29 is exempt under U.S. note 52(b); dissolving pulp is not. ' + NO_IEEPA,
     'whatItMeans': 'South Africa ships dissolving pulp (4702), which pays 12.5% of value.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'no-section-301', 'country': 'Norway', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.60', 'before': 'None', 'now': '+12.5%',
     'exemption': 'Kraft pulp of 4703.11, 4703.21 and 4703.29 is exempt under U.S. note 52(b). High purity dissolving pulp from Norway is also under an antidumping investigation (preliminary rate 6.54%), not shown here. ' + NO_IEEPA,
     'whatItMeans': 'Norwegian dissolving, sulfite and semichemical pulp pay 12.5% of value.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'cl-section-301', 'country': 'Chile', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.30', 'before': 'None', 'now': '+12.5%',
     'exemption': 'Kraft pulp of 4703.11, 4703.21 and 4703.29 is exempt under U.S. note 52(b). A U.S.–Chile FTA claim does not remove the duty. ' + NO_IEEPA,
     'whatItMeans': 'Chilean bleached kraft pulp is Free; other Chilean pulps and recovered paper pay 12.5%.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'mx-section-301', 'country': 'Mexico', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.55', 'before': 'None', 'now': '+10% (USMCA goods exempt)',
     'exemption': 'Kraft pulp of 4703.11, 4703.21 and 4703.29 is exempt under U.S. note 52(b), and goods entered free under USMCA under note 52(h) (9903.05.94). ' + NO_IEEPA,
     'whatItMeans': 'Mexican recovered paper and pulp are Free with a USMCA claim, 10% without.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'cn-list-3', 'country': 'China', 'measure': 'Section 301 tariff, List 3 (2018–2019)', 'ch99Code': '9903.88.03', 'before': '+25%', 'now': '+25%',
     'exemption': 'Every Chapter 47 subheading is on List 3 (U.S. note 20(f)); no product exclusion for the chapter is in effect. USTR confirmed on October 7, 2026 that the action continues during its four-year review.',
     'whatItMeans': 'Chinese pulp and recovered paper pay 25% of value, plus the 12.5% 2026 Section 301 duty on every line except 4703.11, 4703.21 and 4703.29.',
     'effectiveFrom': '2019-05-10', 'effectiveSourceId': 'fr-2019-09681', 'sourceIds': ['fr-2018-20610', 'fr-2019-09681', 'fr-2026-20510', 'hts-chapter-99', 'hts-now']},
    {'id': 'cn-section-301', 'country': 'China', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.31', 'before': 'None', 'now': '+12.5%',
     'exemption': 'Kraft pulp of 4703.11, 4703.21 and 4703.29 is exempt under U.S. note 52(b). Note 52(a) keeps the List 3 duty on top. The IEEPA duties on China ended February 24, 2026.',
     'whatItMeans': 'With List 3, Chinese pulp and recovered paper pay 37.5%; the three exempt kraft grades pay 25%.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'other-section-301', 'country': 'Other 2026 Section 301 economies (51, e.g. Japan, South Korea, Indonesia, the United Kingdom, Russia)',
     'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.20–9903.05.84', 'before': 'None', 'now': '+10% or +12.5% (for Japan, Korea, Switzerland and Taiwan: 10% or 12.5% in place of the Free base rate)',
     'exemption': 'Kraft pulp of 4703.11, 4703.21 and 4703.29 is exempt for every country under U.S. note 52(b). No Chapter 47 line is on any country-specific list in note 52(j). Countries outside the 60 economies pay no extra duty. ' + NO_IEEPA,
     'whatItMeans': 'Non-kraft pulp and recovered paper from these economies pay 10% or 12.5% of value.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
]

C = []


def ch(id_, type_, date, label, title, detail, before, now, countries, sids):
    C.append({'id': id_, 'type': type_, 'date': date, 'dateLabel': label, 'title': title, 'detail': detail, 'before': before, 'now': now,
              'countries': countries, 'sourceIds': sids})


ch('base-rates', 'baseRate', TODAY, 'Checked', 'No Chapter 47 base-rate changes',
   'All 26 Chapter 47 tariff lines carry the same General (Free), Special and Column 2 (Free) rates in the 2026 Revision 21 as in the 2025 Basic Edition; no line was added, removed or renumbered.',
   None, None, None, ['hts-before', 'hts-now', 'hts-now-cr'])
ch('hpdp-itc-hearing', 'pending', '2026-10-08', 'Hearing', 'Dissolving pulp AD/CVD cases: ITC final hearing held, finals pending',
   'The ITC held its final-phase hearing on high purity dissolving pulp from Brazil and Norway on October 8, 2026 (posthearing briefs due October 15). Commerce\'s final antidumping determinations were due within 135 days of the May 27, 2026 preliminaries, with the Brazil countervailing duty final aligned to them; none had been published in the Federal Register by October 12, 2026. Duty orders follow only if Commerce and the ITC both make final affirmative determinations.',
   None, None, 'Brazil, Norway', ['fr-2026-11617', 'fr-2026-10523', 'fr-2026-10527', 'fr-2026-05805'])
ch('section-301-nicaragua-scheduled-2027-01-01', 'pending', '2026-10-07', 'Announced', 'Section 301 tariff on Nicaragua phases in from 2027',
   'Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29), on every Chapter 47 line. The rate is 0% in 2026.',
   None, '+10% to +15%', 'Nicaragua', ['fr-2025-22690', 'fr-2025-23892', 'hts-chapter-99', 'hts-now'])
ch('cn-301-continued', 'reference', '2026-10-07', 'Published', 'China Section 301 duties continue during the four-year review',
   'USTR received requests to continue the 2018 China actions, so they did not terminate on their 2026 anniversaries and remain in effect pending the statutory review. The 25% List 3 duty on Chinese pulp and recovered paper continues.',
   None, None, 'China', ['fr-2026-20510'])
ch('s338-scope', 'reference', '2026-09-15', 'Effective', 'Section 338 list on Canada modified; dissolving pulp stays covered',
   'Proclamation 11065 added and removed products in the Section 338 motor-vehicles list and made the 50% apply on top of Section 232 duties. Dissolving pulp (4702.00.00) remains in U.S. note 51(b)(3).',
   None, '+50% (4702)', 'Canada', ['procl-11065', 'csms-69851916', 'hts-chapter-99'])
ch('section-338-canada-2026-08-22', 'extraDuty', '2026-08-22', 'Effective', 'Section 338: 50% on Canadian dissolving pulp',
   'Proclamation 11048 (July 20, 2026) imposed a 50% duty on products of Canada in the list of U.S. note 51(b)(3) (9903.03.14), including dissolving pulp (4702.00.00), in response to Canada\'s motor-vehicle tariff scheme. Proclamation 11056 moved the start from August 19 to August 22, 2026. The duty applies even when USMCA is claimed.',
   'None', '+50%', 'Canada', ['procl-11048', 'procl-11056', 'csms-69606660', 'hts-chapter-99'])
ch('section-301-2026-60-economies-2026-07-24', 'extraDuty', '2026-07-24', 'Effective', '2026 Section 301 duties on 60 economies; kraft pulp exempt',
   'The 10% or 12.5% Section 301 duties on 60 economies (9903.05.20–9903.05.84) took effect. In Chapter 47 they reach 21 of 26 lines: kraft pulp of 4703.11, 4703.21 and 4703.29 is on the general exemption list (U.S. note 52(b), 9903.05.86). Canadian and Mexican goods entered under USMCA are exempt (notes 52(g)–(h)).',
   None, '+10% to +12.5% (kraft 4703.11/.21/.29 exempt)', '60 economies', ['fr-2026-15181', 'fr-2026-15274', 'hts-chapter-99'])
ch('s122-end', 'extraDuty', '2026-07-23', 'Expired', 'Section 122 surcharge expired',
   'The 150-day 10% surcharge (9903.03.01) expired at the close of July 23, 2026.',
   '+10%', 'None', 'All', ['procl-11012', 'hts-chapter-99'])
ch('section-301-brazil-2026-07-22', 'extraDuty', '2026-07-22', 'Effective', 'Brazil Section 301: 25% on mechanical pulp, dissolving pulp and recovered paper',
   'The 25% Section 301 duty on goods of Brazil (9903.05.01) took effect. All subheadings of 4703–4706 are on its exemption list (U.S. note 50(a)(ii), 9903.05.03), so in Chapter 47 it reaches 9 lines: 4701, 4702 and 4707.',
   'None', '+25% (4701, 4702, 4707)', 'Brazil', ['fr-2026-14542', 'hts-chapter-99'])
ch('usmca-review', 'reference', '2026-07-01', 'Announced', 'USMCA joint review: not renewed, still in force',
   'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.',
   None, None, 'Canada, Mexico', ['ustr-usmca-review'])
ch('hpdp-ad-prelim', 'reference', '2026-05-27', 'Published', 'Preliminary antidumping duties on high purity dissolving pulp',
   'Commerce preliminarily found dumping of high purity dissolving pulp (at least 90% alpha cellulose and 90% brightness; viscosity under 455 mL/g and cotton linters pulp excluded) and ordered cash deposits: Brazil 7.20% for Bracell and all others (6.09% while the countervailing provisional measures apply), Norway 6.54% for Borregaard and all others. Subject pulp enters mainly under 4702.00.00.20 and .40, and may enter under 4706.30 or 4706.92.',
   None, 'Brazil 7.20%, Norway 6.54% (preliminary)', 'Brazil, Norway', ['fr-2026-10523', 'fr-2026-10527'])
ch('hpdp-cvd-prelim', 'reference', '2026-03-25', 'Published', 'Preliminary countervailing duty on high purity dissolving pulp from Brazil',
   'Commerce preliminarily found countervailable subsidies of 3.67% for Bracell Bahia Specialty Cellulose and all others, and aligned the final countervailing duty determination with the final antidumping determination.',
   None, '3.67% (preliminary)', 'Brazil', ['fr-2026-05805'])
ch('s122-start', 'extraDuty', '2026-02-24', 'Effective', 'Section 122 surcharge replaces the IEEPA tariffs; kraft pulp exempt',
   'A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. Kraft pulp of 4703.11, 4703.21 and 4703.29 was on the product exemption list (9903.03.03), and Canadian and Mexican goods entered under USMCA were exempt (9903.03.07, 9903.03.08). Other pulps and recovered paper paid 10%.',
   'Varied by country', '+10% (kraft 4703.11/.21/.29 and USMCA goods exempt)', 'All', ['procl-11012', 'hts-chapter-99'])
ch('ieepa-end', 'extraDuty', '2026-02-24', 'Effective', 'All IEEPA tariffs end',
   'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:01 a.m. ET on February 24, 2026.',
   'Varied by country', 'None', 'All', ['scotus-24-1287', 'eo-14389', 'csms-67834313'])
ch('timber-232', 'reference', '2025-10-14', 'Effective', 'Section 232 timber and lumber duties do not cover pulp',
   'Proclamation 10976 imposed Section 232 duties on softwood timber and lumber, upholstered wooden furniture and kitchen cabinets and vanities (U.S. note 37, 9903.76.xx). No Chapter 47 line is listed in note 37, so wood pulp and recovered paper pay no Section 232 duty.',
   None, None, 'All', ['procl-10976', 'hts-chapter-99'])
ch('hpdp-itc-prelim', 'reference', '2025-09-30', 'Published', 'ITC: reasonable indication of injury from dissolving pulp imports',
   'The ITC found a reasonable indication that U.S. industry is materially injured by imports of high purity dissolving pulp from Brazil and Norway (subheading 4702.00.00), so Commerce\'s investigations continued.',
   None, None, 'Brazil, Norway', ['fr-2025-19027'])
ch('kraft-reciprocal-exempt', 'extraDuty', '2025-09-08', 'Effective', 'Kraft pulp exempted from the reciprocal tariff',
   'Executive Order 14346 modified the reciprocal-tariff exemption list (U.S. note 2(v)(iii), 9903.01.32), adding unbleached softwood kraft (4703.11) and bleached softwood and hardwood kraft (4703.21, 4703.29). Other pulps and recovered paper kept paying until the IEEPA duties ended.',
   '+10% or more', 'Exempt', 'All countries subject to the reciprocal tariff', ['eo-14346', 'hts-2025r22-cr'])
ch('hpdp-initiation', 'reference', '2025-09-08', 'Published', 'AD/CVD investigations on high purity dissolving pulp begin',
   'Commerce initiated antidumping investigations on high purity dissolving pulp from Brazil and Norway and a countervailing duty investigation on Brazil, on a petition filed by a U.S. producer and the United Steelworkers union; the ITC instituted its investigations on August 15, 2025.',
   None, None, 'Brazil, Norway', ['fr-2025-17129', 'fr-2025-17224', 'fr-2025-15518'])
ch('reciprocal-country-rates', 'extraDuty', '2025-08-07', 'Effective', 'Country-specific reciprocal rates take effect',
   'Executive Order 14326 replaced the 10% baseline with country-specific reciprocal rates for many partners (for example 15% for the EU, all-inclusive). Pulp and recovered paper paid them until kraft grades were exempted on September 8, 2025; the rest until February 24, 2026.',
   '+10%', 'Country rates (ended)', 'All except Canada, Mexico', ['eo-14326'])
ch('brazil-ieepa-40', 'extraDuty', '2025-08-06', 'Effective', 'Brazil: 40% IEEPA duty; wood pulp excepted',
   'Executive Order 14323 added a 40% duty on products of Brazil (9903.01.77). Its Annex I exceptions included wood pulp: every subheading of 4702 through 4706 (U.S. note 2(x)(iii)). Mechanical pulp (4701) and recovered paper (4707) paid it, on top of the reciprocal tariff. Ended February 24, 2026.',
   'None', '+40% on 4701 and 4707 (ended)', 'Brazil', ['eo-14323'])
ch('ca-amended', 'extraDuty', '2025-08-01', 'Effective', 'Canada additional duty raised to 35%',
   'Raised the IEEPA duty on non-USMCA Canadian goods, including pulp and recovered paper, from 25% to 35% (9903.01.10). Ended February 24, 2026.',
   '+25%', '+35% (ended)', 'Canada', ['eo-14325'])
ch('cn-ieepa', 'extraDuty', '2025-05-14', 'Effective', 'China IEEPA duties: reciprocal rate cut to 10%',
   'Chinese pulp and recovered paper paid IEEPA duties on top of List 3: a fentanyl-related 10% from February 4, 2025 (20% from March 4, back to 10% from November 10, 2025) and a reciprocal duty that rose to 125% in April 2025 and was cut to 10% from May 14, 2025. All ended February 24, 2026.',
   '+125% reciprocal', '+10% reciprocal (ended)', 'China', ['eo-14195', 'eo-14228', 'eo-14259', 'eo-14266', 'eo-14298', 'eo-14357'])
ch('reciprocal', 'extraDuty', '2025-04-02', 'Signed', 'Reciprocal tariff covers pulp and recovered paper',
   '10% baseline (9903.01.25) on products of all countries except Canada and Mexico from April 5, 2025. No Chapter 47 line was on the Annex II exemption list, so all pulp and recovered paper paid it until kraft grades were exempted on September 8, 2025. Ended February 24, 2026.',
   'None', '+10% or more (ended)', 'All except Canada, Mexico', ['eo-14257'])
ch('usmca-exempt', 'extraDuty', '2025-03-06', 'Signed', 'USMCA goods exempted from the Canada and Mexico duties',
   'From March 7, 2025, goods entered under USMCA were exempt from the IEEPA duties on Canada and Mexico. Non-USMCA pulp and recovered paper kept paying. Ended February 24, 2026.',
   '+25%', '+25%, USMCA goods exempt (ended)', 'Canada, Mexico', ['eo-14231', 'eo-14232'])
ch('ca-mx-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duties on products of Canada and Mexico',
   '+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01), in force from March 4, 2025, including pulp and recovered paper. Ended February 24, 2026.',
   'None', '+25% (ended)', 'Canada, Mexico', ['eo-14193', 'eo-14194'])
tu['changes'] = C

# Sources: keep the generated ones, add the new ones (no duplicates).
have = {s['id'] for s in tu['sources']}
for s in NEW_SOURCES:
    if s['id'] not in have:
        tu['sources'].append(s)
        have.add(s['id'])

# ---------------------------------------------------------------------------------------------------------------------
# Understand industry
# ---------------------------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
ui['h1'] = 'HTS Chapter 47: Pulp of Wood or of Other Fibrous Cellulosic Material; Recovered (Waste and Scrap) Paper or Paperboard — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Wood Pulp Imports by Country & Grade: Canada, Brazil, Kraft, Dissolving Pulp (HTS Ch. 47) | KoalaGains',
    'shortDescription': 'Where U.S. pulp and recovered paper imports come from, 2020–2025: $4.14B in 2025, 47% from Canada and 36% from Brazil, 80% bleached kraft pulp. By country, by product and over time, from UN Comtrade.',
    'keywords': ['us pulp imports', 'pulp imports', 'wood pulp imports by country', 'us pulp imports from canada', 'brazil pulp exports to us',
                 'recovered paper imports', 'HTS Chapter 47 import statistics'],
}
for s in ui['stats']:
    if s['label'] == 'Largest product':
        s['note'] = 'Bleached or semibleached softwood kraft pulp (4703.21)'
ui['why'] = (
    'U.S. imports of Chapter 47 goods were **$4.14B in 2025**, down 12.2% from $4.72B in 2024 and below the 2022 peak of $5.16B. Two suppliers '
    'dominate: **Canada** ($1.93B, 47%), mostly kraft pulp ($1.47B in heading 4703) plus sulfite pulp ($278M), semichemical pulp ($78M) and '
    'almost all recovered paper ($94.9M), and **Brazil** ($1.47B, 36%), mostly eucalyptus and other kraft pulp ($1.30B) plus dissolving pulp ($170M). '
    'Sweden, Uruguay and Finland add $160M–$228M each, nearly all kraft pulp; South Africa and Norway mainly ship dissolving pulp.\n\n'
    'By product, bleached softwood kraft (4703.21, $1.80B) and bleached hardwood kraft (4703.29, $1.52B) are **80%** of the total. These grades and '
    'unbleached softwood kraft (4703.11) are exempt from the 2026 Section 301 and Brazil Section 301 duties, so most of the trade enters Free; the '
    'extra duties fall on smaller flows: dissolving pulp ($232M, down from $327M in 2024), sulfite and semichemical pulp, and recovered paper, '
    'whose imports fell from $160M to $99.8M. Dissolving pulp from Brazil and Norway has faced antidumping and countervailing duty investigations '
    'since September 2025. Imports from China, which pays the 25% List 3 duty, were $0.8M.\n\n'
    '2025 is the latest full year of U.S. trade data, so the 2026 duties are not yet visible in these figures. Duty-collected figures aren\'t '
    'available from an official source yet.'
)
ui['sources'] = [
    ui['sources'][0],
    {'label': 'Federal Register 90 FR 43168 (antidumping investigations on high purity dissolving pulp from Brazil and Norway, September 8, 2025)',
     'url': FR + '2025/09/08/2025-17129/high-purity-dissolving-pulp-from-brazil-and-norway-initiation-of-less-than-fair-value-investigations'},
]

# ---------------------------------------------------------------------------------------------------------------------
# Industry areas (rates by country)
# ---------------------------------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['seo'] = {
    'title': 'Wood Pulp Tariff Rates by Country: Canada, Brazil, Sweden, Finland, Uruguay, China (HTS Ch. 47) | KoalaGains',
    'shortDescription': 'The total U.S. tariff on pulp and recovered paper by country and grade: Free for kraft pulp from every supplier but China; 10% or 12.5% on other pulps from the 60 Section 301 economies; 37.5% on Brazilian dissolving pulp and recovered paper; 50% on Canadian dissolving pulp.',
    'keywords': ['tariffs on canadian pulp', 'pulp tariffs canada', 'brazil pulp tariff', 'eucalyptus pulp tariff', 'nbsk tariff', 'wood pulp tariff by country',
                 'recovered paper tariff'],
}
ia['intro'] = (
    'Each cell below is the base rate for that product group plus the extra duties for that country, minus any preference, from the current tariff '
    'schedule. Every Chapter 47 line is Free at base, so the totals are the extra duties alone.\n\n'
    'The grade matters as much as the country. **Kraft pulp in 4703.11, 4703.21 and 4703.29** (the bulk of the trade) is exempt from the 2026 Section '
    '301 duties and Brazil\'s 25%, so it is Free from every supplier except China; the kraft column shows "Free · 12.5%" because unbleached hardwood '
    'kraft (4703.19) is not exempt. Other pulps and recovered paper pay 10% or 12.5% from the 60 Section 301 economies (EU: 10% in place of Free), '
    'unless Canadian or Mexican goods qualify for USMCA. Brazil adds 25% on mechanical pulp, dissolving pulp and recovered paper, China pays 25% '
    '(List 3) plus 12.5%, and Canadian dissolving pulp pays 50% under Section 338 with or without USMCA. Antidumping and countervailing duties on '
    'high purity dissolving pulp from Brazil and Norway are **not** included.'
)
LABELS = {
    'Canada': 'Kraft pulp 4703.11/.21/.29 Free. Other pulps and recovered paper: Free with USMCA (note 52(g), 9903.05.93), +10% without (9903.05.29). Dissolving pulp (4702): +50% Section 338 (9903.03.14) even with USMCA, 60% without. The 2025 IEEPA duty (35%) ended February 24, 2026.',
    'Brazil': 'Kraft pulp 4703.11/.21/.29 Free. Other 4703–4706 pulps +12.5% (9903.05.27). Mechanical pulp (4701), dissolving pulp (4702) and recovered paper (4707) +12.5% and +25% Brazil Section 301 (9903.05.01) = 37.5%. Preliminary AD/CVD on high purity dissolving pulp not shown.',
    'Sweden': 'EU: kraft pulp 4703.11/.21/.29 Free (note 52(b)); every other line 10% in place of the Free base rate (9903.05.39). The 15% IEEPA reciprocal rate ended February 24, 2026.',
    'Uruguay': 'Kraft pulp 4703.11/.21/.29 Free (note 52(b)); every other line +12.5% (9903.05.82).',
    'Finland': 'EU: kraft pulp 4703.11/.21/.29 Free (note 52(b)); every other line 10% in place of the Free base rate (9903.05.39). The 15% IEEPA reciprocal rate ended February 24, 2026.',
    'South Africa': 'Kraft pulp 4703.11/.21/.29 Free (note 52(b)); every other line, including dissolving pulp, +12.5% (9903.05.69). AGOA does not remove it.',
    'Norway': 'Kraft pulp 4703.11/.21/.29 Free (note 52(b)); every other line +12.5% (9903.05.60). Preliminary antidumping deposit on high purity dissolving pulp (6.54%) not shown.',
    'Chile': 'Kraft pulp 4703.11/.21/.29 Free (note 52(b)); every other line +12.5% (9903.05.30), with or without a U.S.–Chile FTA claim.',
    'Mexico': 'Kraft pulp 4703.11/.21/.29 Free. Other pulps and recovered paper: Free with USMCA (note 52(h), 9903.05.94), +10% without (9903.05.55).',
    'China': 'Base rate (Free) + 25% Section 301 List 3 (9903.88.03) on every line + 12.5% 2026 Section 301 (9903.05.31) on every line except kraft pulp 4703.11/.21/.29. The IEEPA duties ended February 24, 2026.',
    'Any other country': 'Free for countries outside the 60 Section 301 economies; 10% or 12.5% for the other listed economies on every line except kraft pulp 4703.11/.21/.29. Nicaragua\'s Section 301 duty is 0% until January 1, 2027.',
}
for c in ia['countries']:
    c['rule']['label'] = LABELS[c['country']]
ia['assumptions'] = [a for a in ia['assumptions'] if not a.startswith('TODO')]
ia['assumptions'][1] = 'Ranges like "Free · 12.5%" mean the group has lines with different totals; select a cell to see which lines carry which rate.'
ia['assumptions'] += [
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.',
    'No Section 232 duty is applied: the timber and lumber action (U.S. note 37, Proclamation 10976) lists no Chapter 47 line.',
    'Antidumping and countervailing duties are not included. High purity dissolving pulp from Brazil (preliminary AD 7.20% and CVD 3.67%) and Norway (preliminary AD 6.54%) is under investigation; final determinations are pending.',
    'Section 338 (9903.03.14) applies to Canadian dissolving pulp on both sides of the Canada row, because U.S. note 51(a) charges it even when USMCA is claimed.',
]
ia['exemptionCheck'] = (
    'Read U.S. notes 2, 20, 29, 37, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Only three Chapter 47 subheadings (4703.11, '
    '4703.21, 4703.29) are on the 2026 Section 301 general exemption list (note 52(b), 9903.05.86); none is on the note 52(c)–(f) lists or any country '
    'list in note 52(j). All of 4703, 4704, 4705 and 4706 are on the Brazil exemption list (note 50(a)(ii), 9903.05.03); 4701, 4702 and 4707 are not. '
    'Only 4702.00.00 is on the Canada Section 338 lists (note 51(b)(3)). All 21 Chapter 47 subheadings are on China Section 301 List 3 (note 20(f)), '
    'with no product exclusion in effect. No Chapter 47 line is in the Section 232 timber and lumber note (note 37).'
)
ia['lastCheckedAt'] = TODAY
have = {s['id'] for s in ia['sources']}
for s in NEW_SOURCES:
    if s['id'] in ('procl-10976', 'fr-2026-10523', 'fr-2026-10527', 'fr-2026-05805', 'eo-14389', 'procl-11012') and s['id'] not in have:
        ia['sources'].append(s)

# ---------------------------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------------------------
te = d['tariffEngineering']
ECFR = 'https://www.ecfr.gov/current/title-19/'
te['seo'] = {
    'title': 'Importing Wood Pulp & Recovered Paper: Rules, AD/CVD and Legal Ways to Lower Duty (HTS Ch. 47) | KoalaGains',
    'shortDescription': 'Tariff engineering for HTS Chapter 47: classify kraft vs dissolving vs sulfite pulp correctly (the 2026 Section 301 exemption turns on it), claim USMCA, check the dissolving pulp AD/CVD scope, use drawback, and meet the marking and USMCA certification rules.',
    'keywords': ['tariff engineering wood pulp', 'HTS Chapter 47 tariff engineering', 'dissolving pulp classification', 'USMCA pulp certificate',
                 'pulp duty drawback', 'high purity dissolving pulp scope', 'country of origin marking waste paper'],
}
te['intro'] = (
    'Every Chapter 47 line is **Free** under the general rate, so the levers are about the extra duties, and those turn on two facts: **origin** and '
    '**grade**. Kraft pulp in 4703.11, 4703.21 and 4703.29 is exempt from the 2026 Section 301 and Brazil Section 301 duties; dissolving pulp '
    '(4702) is not, and from Canada it also pays 50% under Section 338. So the first lever is classifying the pulp correctly, by pulping process, '
    'wood, bleaching and the dissolving-grade test in chapter note 1, ideally with a binding CBP ruling.\n\n'
    'Then: claim USMCA for Canadian and Mexican goods, check whether dissolving pulp from Brazil or Norway falls inside the antidumping and '
    'countervailing duty scope, and recover duties by drawback when the pulp or the products made from it are exported. Each rule and lever links '
    'to its regulation.'
)
te['lastCheckedAt'] = TODAY
te['regulationsAsOf'] = '2026-10-08'
te['levers'] = [
    {'id': 'classify-grade', 'title': 'Classify the pulp grade correctly: three kraft subheadings are exempt',
     'saves': '10% or 12.5% (2026 Section 301) and, for Brazil, 25%: kraft pulp of 4703.11, 4703.21 and 4703.29 pays none of them, while unbleached hardwood kraft (4703.19), sulfite, semichemical and dissolving pulp do',
     'appliesTo': 'Headings 4702, 4703, 4704 and 4705',
     'document': 'Mill specification sheets showing the pulping process (soda/sulfate, sulfite, mechanical-chemical), the wood (coniferous or not) and the bleaching; for 4702 the chapter note 1 test (insoluble fraction in 18% NaOH of at least 92% for sulfate or soda pulp, 88% for sulfite, plus ash of at most 0.15% for sulfite). A binding ruling under 19 CFR part 177 settles it before import; CBP ruling N264975 classified bleached softwood and hardwood kraft in 4703.21.00.40 and 4703.29.00.40.',
     'caveat': 'Classification follows what the pulp is, not what is declared: a pulp that meets the note 1 dissolving-grade test is 4702 whatever its end use. Fluff pulp has no separate line and is classified by the same tests.',
     'citations': [{'label': 'HTSUS Chapter 47, note 1', 'url': CH47},
                   {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 50(a)(ii) and 52(b)', 'url': CH99},
                   {'label': '19 CFR part 177 (rulings)', 'url': ECFR + 'part-177'},
                   {'label': 'CBP ruling NY N264975', 'url': 'https://rulings.cbp.gov/ruling/N264975'}]},
    {'id': 'usmca', 'title': 'Claim USMCA for Canadian and Mexican pulp and recovered paper',
     'saves': '10% of value: the 2026 Section 301 duty on Canada (9903.05.29) or Mexico (9903.05.55) on every line except the exempt kraft grades',
     'appliesTo': 'Originating goods of Canada and Mexico (all lines except 4703.11, 4703.21, 4703.29, which are exempt anyway)',
     'document': 'A USMCA certification of origin from the importer, exporter or producer, in the importer\'s possession when the claim is made; it need not follow a prescribed format (19 CFR 182.12). Rules of origin: General Note 11.',
     'caveat': 'A USMCA claim does not remove the 50% Section 338 duty on Canadian dissolving pulp (U.S. note 51(a)). The USMCA was not renewed at the July 1, 2026 joint review but remains in force.',
     'citations': [{'label': '19 CFR 182.12', 'url': ECFR + 'section-182.12'},
                   {'label': 'HTSUS General Note 11 (USMCA)', 'url': GN},
                   {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 51(a) and 52(g)–(h)', 'url': CH99},
                   {'label': 'USTR statement on the USMCA joint review (July 1, 2026)', 'url': reuse['ustr-usmca-review']['url']}]},
    {'id': 'adcvd-scope', 'title': 'Check the dissolving pulp AD/CVD scope before buying from Brazil or Norway',
     'saves': 'The preliminary antidumping cash deposit (Brazil 7.20%, Norway 6.54%) and the Brazil countervailing rate (3.67%), when the pulp is outside the scope',
     'appliesTo': 'Dissolving pulp of Brazil and Norway (4702.00.00.20, 4702.00.00.40; may also enter under 4706.30 or 4706.92)',
     'document': 'The written scope decides, not the HTS number: it covers dissolving pulp with at least 90% alpha cellulose and at least 90% brightness, and excludes pulp with an intrinsic viscosity under 455 mL/g and cotton linters pulp of at least 90% cotton linter fibers. When unsure, ask Commerce for a scope ruling.',
     'caveat': 'Rates are preliminary and company-specific; final determinations are pending. Pulp finished, blended or repackaged in a third country stays inside the scope.',
     'citations': [{'label': '91 FR 31418 (Brazil, preliminary AD, scope)', 'url': NEW_SOURCES[9]['url']},
                   {'label': '91 FR 31413 (Norway, preliminary AD)', 'url': NEW_SOURCES[10]['url']},
                   {'label': '91 FR 14524 (Brazil, preliminary CVD)', 'url': NEW_SOURCES[8]['url']},
                   {'label': '19 CFR 351.225 (scope rulings)', 'url': ECFR + 'section-351.225'}]},
    {'id': 'drawback', 'title': 'Claim drawback when the pulp, or paper made from it, is exported',
     'saves': 'Generally 99% of the eligible duties paid (ordinary customs duties, 19 CFR 191.3(a)) on pulp that is re-exported or used to make exported goods',
     'appliesTo': 'All lines that paid an extra duty (most often dissolving pulp and recovered paper)',
     'document': 'A drawback claim to CBP with the import and export records (19 CFR part 191); the claim is generally 99% of the eligible duties (19 CFR 191.51).',
     'caveat': 'Antidumping and countervailing duties are not refundable as drawback (19 CFR 191.3(b)(3)).',
     'citations': [{'label': '19 CFR part 191', 'url': ECFR + 'part-191'},
                   {'label': '19 CFR 191.3', 'url': ECFR + 'section-191.3'},
                   {'label': '19 CFR 191.51', 'url': ECFR + 'section-191.51'}]},
]
te['rules'] = [
    {'id': 'marking', 'agency': 'CBP',
     'title': 'Country-of-origin marking: pulp imported for the importer\'s own processing can be excepted (19 CFR 134.32(f)–(g)); "scrap and waste" is on the J-list (19 CFR 134.33). The outermost container must still show the origin (19 CFR 134.22(a))',
     'citations': [{'label': '19 CFR 134.32', 'url': ECFR + 'section-134.32'}, {'label': '19 CFR 134.33', 'url': ECFR + 'section-134.33'},
                   {'label': '19 CFR 134.22', 'url': ECFR + 'section-134.22'}]},
    {'id': 'usmca-cert', 'agency': 'CBP',
     'title': 'USMCA claims: a certification of origin in the importer\'s possession, provided to CBP on request',
     'citations': [{'label': '19 CFR 182.12', 'url': ECFR + 'section-182.12'}, {'label': 'HTSUS General Note 11', 'url': GN}]},
    {'id': 's338-canada', 'agency': 'CBP',
     'title': 'Canadian dissolving pulp (4702.00.00): report 9903.03.14 and pay the 50% Section 338 duty, also when USMCA is claimed',
     'citations': [{'label': 'HTSUS Ch. 99, subch. III, U.S. note 51', 'url': CH99},
                   {'label': 'Proclamation 11048 (91 FR 46663)', 'url': NEW_SOURCES[3]['url']}]},
    {'id': 'adcvd-hpdp', 'agency': 'Commerce (ITA) / CBP',
     'title': 'High purity dissolving pulp from Brazil and Norway: antidumping (and, for Brazil, countervailing) cash deposits at the preliminary rates; not in the tariff calculator',
     'citations': [{'label': '91 FR 31418 (Brazil AD)', 'url': NEW_SOURCES[9]['url']}, {'label': '91 FR 31413 (Norway AD)', 'url': NEW_SOURCES[10]['url']},
                   {'label': '91 FR 14524 (Brazil CVD)', 'url': NEW_SOURCES[8]['url']}]},
    {'id': 'lacey', 'agency': 'USDA APHIS',
     'title': 'Lacey Act: plants and plant products taken or traded in violation of law may not be imported (16 U.S.C. 3372(a)); the plant import declaration (16 U.S.C. 3372(f)) is enforced by HTS code under APHIS\'s phase-in schedule',
     'citations': [{'label': '16 U.S.C. 3372', 'url': 'https://www.govinfo.gov/content/pkg/USCODE-2024-title16/html/USCODE-2024-title16-chap53-sec3372.htm'},
                   {'label': 'APHIS notice, 89 FR 47122 (May 31, 2024)', 'url': FR + '2024/05/31/2024-11901/implementation-of-revised-lacey-act-provisions'}]},
]
NOTES = {
    '4701': 'Wood pulp: origin marking and USMCA certification as needed; the Lacey Act covers the wood it is made from.',
    '4702': 'The most regulated group: Canadian dissolving pulp pays 50% under Section 338, and high purity grades from Brazil and Norway are under AD/CVD investigation.',
    '4703': 'Kraft pulp of 4703.11, 4703.21 and 4703.29 is exempt from both 2026 Section 301 actions; 4703.19 is not. Document the grade.',
    '4704': 'Sulfite pulp is not on the 2026 Section 301 exemption list; USMCA removes the duty for Canadian and Mexican goods.',
    '4705': 'Same rules as sulfite pulp: not exempt from the 2026 Section 301 duty; USMCA removes it for Canadian and Mexican goods.',
    '4706': 'Cotton linters, bamboo and recycled-fiber pulps. High purity dissolving pulp can enter under 4706.30 or 4706.92 and is then inside the AD/CVD scope.',
    '4707': 'Recovered paper is "scrap and waste" on the marking J-list, but its container must show the origin. USMCA removes the 10% for Canadian and Mexican goods.',
}
RULES = {'4701': ['marking', 'usmca-cert', 'lacey'], '4702': ['marking', 'usmca-cert', 'lacey', 's338-canada', 'adcvd-hpdp'],
         '4703': ['marking', 'usmca-cert', 'lacey'], '4704': ['marking', 'usmca-cert', 'lacey'], '4705': ['marking', 'usmca-cert', 'lacey'],
         '4706': ['marking', 'usmca-cert'], '4707': ['marking', 'usmca-cert']}
for g in te['groups']:
    g['label'] = GROUPS[g['heading']][0]
    g['ruleIds'] = RULES[g['heading']]
    g['note'] = NOTES[g['heading']]
for l in te['lines']:
    h = l['hts'][:4]
    rules = list(RULES[h])
    levers = ['usmca', 'drawback']
    if h in ('4702', '4703', '4704', '4705'):
        levers.insert(0, 'classify-grade')
    if h == '4702' or l['hts'].startswith('4706.30') or l['hts'].startswith('4706.92'):
        levers.append('adcvd-scope')
        if 'adcvd-hpdp' not in rules:
            rules.append('adcvd-hpdp')
    l['ruleIds'], l['leverIds'] = rules, levers
te['disclaimer'] = ('A checklist of where the rules are, with links to the regulations; not legal advice. AD/CVD rates are preliminary and '
                    'company-specific; check Commerce\'s latest notice and CBP\'s cash-deposit instructions before importing.')

# ---------------------------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['seo'] = {
    'title': 'Wood Pulp Tariffs FAQ: Canada, Brazil, Dissolving Pulp, HS Codes 4703 & 4707 (HTS Ch. 47) | KoalaGains',
    'shortDescription': 'Answers to what people search about pulp tariffs: tariffs on Canadian pulp, Brazil pulp tariff, US tariffs on pulp and paper, HS codes for wood pulp, fluff pulp and waste paper, dissolving pulp duties and where U.S. pulp imports come from.',
    'keywords': ['tariffs on canadian pulp', 'pulp tariffs canada', 'brazil pulp tariff', 'us tariffs on pulp', 'pulp and paper tariffs', 'hs code for wood pulp',
                 'hs code 4703', 'hs code for fluff pulp', 'hs code for waste paper', '4707 hs code import duty', 'what is dissolving pulp', 'us pulp imports',
                 'hts chapter 47'],
}
fc['intro'] = 'Straight answers to the most common questions about U.S. tariffs on wood pulp and recovered paper, by country, by grade and by HS code. Each answer links to the page with the full detail.'
fc['keyTakeaways'] = [
    'Every Chapter 47 line is Free under the general rate. Kraft pulp in 4703.11, 4703.21 and 4703.29 (NBSK, eucalyptus and other bleached kraft, 82% of 2025 imports) is also exempt from the 2026 Section 301 and Brazil duties, so it enters Free from every supplier except China.',
    'Other pulps and recovered paper pay 10% or 12.5% from the 60 Section 301 economies (Canadian and Mexican goods are exempt with USMCA); Brazil adds 25% on mechanical pulp, dissolving pulp and recovered paper; China pays 25% List 3 plus 12.5%.',
    'Dissolving pulp is the most taxed grade: 50% for Canada under Section 338 even with USMCA, 37.5% for Brazil plus preliminary AD/CVD on high purity grades, and preliminary antidumping duties on Norway. The 2025 IEEPA duties ended February 24, 2026.',
]
fc['lastCheckedAt'] = TODAY
fc['questionSource'] = 'Google search suggestions (United States, English), collected October 12, 2026'
fc['faqs'] = [
    {'id': 'canada', 'question': 'Are there U.S. tariffs on Canadian pulp?',
     'searchedAs': ['tariffs on canadian pulp', 'us tariffs on canadian pulp', 'pulp tariffs canada', 'canada pulp tariffs', 'pulp and paper tariffs canada'],
     'answer': 'Mostly no. Canadian kraft pulp in 4703.11, 4703.21 and 4703.29 (NBSK and bleached hardwood kraft) is Free and exempt from the 10% 2026 Section 301 duty on Canada (U.S. note 52(b)). Other Canadian pulp and recovered paper pay that 10% (9903.05.29) only without a USMCA claim. The exception is dissolving pulp (4702): since August 22, 2026 it pays 50% under Section 338 (9903.03.14), even with a USMCA claim, and 60% without one. The 2025 IEEPA duties on non-USMCA Canadian goods (25%, then 35%) ended February 24, 2026.',
     'link': 'industry-areas'},
    {'id': 'brazil', 'question': 'Is there a tariff on pulp from Brazil?',
     'searchedAs': ['brazil pulp tariff'],
     'answer': 'Not on bleached eucalyptus and other kraft pulp in 4703.11, 4703.21 and 4703.29: those lines are exempt from both Brazil\'s 25% Section 301 duty (note 50(a)(ii)) and the 12.5% 2026 Section 301 duty (note 52(b)). Unbleached hardwood kraft (4703.19), sulfite, semichemical and other pulps of 4704–4706 pay 12.5%. Dissolving pulp (4702), mechanical pulp (4701) and recovered paper (4707) pay 37.5%, and high purity dissolving pulp also carries preliminary antidumping (7.20%) and countervailing (3.67%) rates. Brazil shipped $1.47B of Chapter 47 goods to the U.S. in 2025.',
     'link': 'industry-areas'},
    {'id': 'wood-pulp-tariff', 'question': 'What is the U.S. tariff on wood pulp?',
     'searchedAs': ['wood pulp tariffs', 'us pulp tariffs', 'us tariffs on pulp', 'tariffs on pulp', 'paper pulp tariffs'],
     'answer': 'The general (MFN) rate is Free on all 26 Chapter 47 lines, and so is Column 2. Extra duties depend on origin and grade: kraft pulp of 4703.11, 4703.21 and 4703.29 is exempt from the 2026 Section 301 duties; other pulps and recovered paper pay 10% or 12.5% from the 60 Section 301 economies (EU: 10% in place of Free); Brazil pays another 25% on 4701, 4702 and 4707; China pays 25% (List 3) plus 12.5%; Canadian dissolving pulp pays 50%. Countries outside the 60 economies pay nothing extra.',
     'link': ''},
    {'id': 'pulp-and-paper', 'question': 'Do the pulp tariffs also cover paper?',
     'searchedAs': ['pulp and paper tariffs', 'tariffs on pulp and paper', 'us tariffs on pulp and paper', 'tariffs pulp and paper'],
     'answer': 'No. Chapter 47 covers only pulp and recovered (waste and scrap) paper. Paper and paperboard are in Chapter 48, with their own rates and exemption lists, so a pulp exemption does not carry over. The 2026 Section 301 exemption list (note 52(b)) names only three Chapter 47 subheadings: 4703.11, 4703.21 and 4703.29.',
     'link': 'tariff-updates'},
    {'id': 'hs-wood-pulp', 'question': 'What is the HS code for wood pulp?',
     'searchedAs': ['hs code for wood pulp', 'hs code for paper pulp', 'hs code for pulp', 'hts code for wood pulp'],
     'answer': 'Chapter 47, by process: 4701 mechanical pulp, 4702 chemical pulp of dissolving grades, 4703 soda or sulfate (kraft) pulp, 4704 sulfite pulp, 4705 pulp made by combined mechanical and chemical processes, and 4706 pulps from recovered paper, cotton linters, bamboo and other fibrous material. Each splits by wood type and bleaching into 26 ten-digit U.S. lines, all Free. Fruit pulps are food preparations, not Chapter 47.',
     'link': ''},
    {'id': 'hs-4703', 'question': 'What is HS code 4703 (4703.21, 4703.29)?',
     'searchedAs': ['hs code 4703', 'hs code 4703.21', 'hs code 4703.29'],
     'answer': '4703 is chemical wood pulp made by the soda or sulfate (kraft) process, other than dissolving grades: 4703.11 unbleached softwood, 4703.19 unbleached hardwood, 4703.21 semibleached or bleached softwood (U.S. suffix .20 semibleached, .40 bleached) and 4703.29 semibleached or bleached hardwood, such as eucalyptus. All are Free; 4703.11, .21 and .29 are also exempt from the 2026 Section 301 and Brazil duties. 4703.21 and 4703.29 were 80% of U.S. Chapter 47 imports in 2025.',
     'link': ''},
    {'id': 'hs-fluff', 'question': 'What is the HS code for fluff pulp?',
     'searchedAs': ['hs code for fluff pulp'],
     'answer': 'The HTS has no separate line for fluff pulp; it is classified like any other pulp, by pulping process, wood and bleaching. A bleached softwood kraft (sulfate) pulp falls in 4703.21.00.40, which CBP confirmed for bleached softwood kraft in ruling N264975. That subheading is Free and exempt from the 2026 Section 301 duties. A pulp that meets the dissolving-grade test of chapter note 1 would be 4702 instead; ask CBP for a binding ruling when unsure.',
     'link': 'tariff-engineering'},
    {'id': 'hs-waste-paper', 'question': 'What is the HS code for waste paper or recovered paper?',
     'searchedAs': ['hs code for waste paper', 'hs code for recycled paper', 'hs code for scrap paper', 'hs code for waste paper corrugated box', 'hs code for paper waste scrap', 'waste paper hs code', 'waste paper tariff code'],
     'answer': 'Heading 4707, recovered (waste and scrap) paper or paperboard: 4707.10 unbleached kraft or corrugated paper and board (old corrugated containers, OCC), 4707.20 paper made mainly of bleached chemical pulp, not colored in the mass (U.S. suffix .20 high-grade deinking paper), 4707.30 paper made mainly of mechanical pulp such as newspapers and magazines (suffix .20 newsprint), and 4707.90 other, including unsorted waste. All are Free at base.',
     'link': ''},
    {'id': 'hs-4707-duty', 'question': 'What is the import duty on HS 4707 recovered paper?',
     'searchedAs': ['4707 hs code import duty', 'hs code 4707', 'hs code 4707.10', 'hs code 4707.90', 'hs code 4707.30', 'hs code 4707.20'],
     'answer': 'The base rate is Free, but 4707 is not on the 2026 Section 301 exemption list. Canadian and Mexican recovered paper is Free with a USMCA claim and 10% without; EU goods pay 10%; other Section 301 economies 10% or 12.5%; Brazil 37.5% (25% + 12.5%); China 37.5% (List 3 25% + 12.5%); other countries nothing. Canada supplied $94.9M of the $99.8M imported in 2025.',
     'link': 'industry-areas'},
    {'id': 'dissolving', 'question': 'What is dissolving pulp, and what duties apply to it?',
     'searchedAs': ['what is dissolving pulp', 'dissolving pulp vs kraft pulp'],
     'answer': 'Dissolving pulp (4702) is chemical wood pulp that meets the test in chapter note 1: an insoluble fraction of at least 92% (soda or sulfate pulp) or 88% (sulfite pulp) after an hour in 18% caustic soda. Paper-grade kraft pulp is 4703. Dissolving pulp is Free at base but on no exemption list: Canada pays 50% (Section 338), Brazil and China 37.5%, the EU 10%, Norway and South Africa 12.5%. High purity grades from Brazil and Norway also carry preliminary AD/CVD; final decisions are pending.',
     'link': 'tariff-updates'},
    {'id': 'imports', 'question': 'Where does the U.S. import pulp from?',
     'searchedAs': ['us pulp imports', 'pulp imports'],
     'answer': 'Mostly Canada and Brazil: 82% of the $4.14B of Chapter 47 goods imported in 2025. Canada ($1.93B) ships kraft, sulfite and semichemical pulp and nearly all recovered paper; Brazil ($1.47B) mainly eucalyptus kraft and dissolving pulp. Next come Sweden ($228M), Uruguay ($225M), Finland ($160M), South Africa ($35M), Norway ($20M) and Chile ($17M). Imports fell 12.2% from 2024.',
     'link': 'understand-industry'},
    {'id': 'hts-47', 'question': 'What does HTS Chapter 47 cover?',
     'searchedAs': ['hts chapter 47'],
     'answer': 'HTS Chapter 47, "Pulp of wood or of other fibrous cellulosic material; recovered (waste and scrap) paper or paperboard", is in Section X with paper (Chapter 48) and printed matter (Chapter 49). It has 7 headings (4701–4707) and 26 ten-digit U.S. lines, all Free under the general rate: wood pulps by process, pulps of other fibers and recovered paper. Paper and paperboard themselves are in Chapter 48.',
     'link': ''},
    {'id': 'lumber-232', 'question': 'Do the Section 232 lumber tariffs apply to wood pulp?',
     'searchedAs': ['wood pulp tariffs'],
     'answer': 'No. The Section 232 timber and lumber duties (Proclamation 10976, U.S. note 37, headings 9903.76.xx) cover softwood timber and lumber, upholstered wooden furniture and kitchen cabinets and vanities. No Chapter 47 line is listed, so wood pulp and recovered paper pay no Section 232 duty. Canadian dissolving pulp pays a different duty: 50% under Section 338.',
     'link': 'tariff-updates'},
]

# ---------------------------------------------------------------------------------------------------------------------
json.dump(d, open(out, 'w'), ensure_ascii=False, indent=2)
print('wrote', out)
