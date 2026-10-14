#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 17 content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill17.py <generated.json> <out.json>
Re-runnable: every regeneration of the data parts is followed by this script (it only reads the generated file).
Facts come from the official documents saved in this folder (fr/*.txt, live/*.txt) and the HTSUS 2026 Revision 21
chapter 17 / 98 / 99 / General Notes text in the shared scratchpad.
"""
import glob
import json
import re
import sys
from collections import OrderedDict

SRC, OUT = sys.argv[1], sys.argv[2]
WT = '/Users/robin/projects/worktrees/chapter-migration-1812-b1/insights-ui'
CH = f'{WT}/src/tariff-data/chapters'

d = json.load(open(SRC))
TODAY = d['asOf']

REV = '2026HTSRev21'
HTS_NOW_URL = 'https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_21_json.json'
CH17_PDF = f'https://hts.usitc.gov/reststop/file?release={REV}&filename=Chapter%2017'
CH98_PDF = f'https://hts.usitc.gov/reststop/file?release={REV}&filename=Chapter%2098'
CH99_PDF = f'https://hts.usitc.gov/reststop/file?release={REV}&filename=Chapter%2099'
GN_PDF = f'https://hts.usitc.gov/reststop/file?release={REV}&filename=General%20Notes'
FR = 'https://www.federalregister.gov/documents'


def fmt_usd(n):
    if n >= 1e9:
        return f'${n / 1e9:.2f}B'
    if n >= 1e6:
        return f'${n / 1e6:.0f}M' if n >= 1e8 else f'${n / 1e6:.1f}M'
    return f'${n / 1e3:.0f}K'


def pct(a, b):
    return round(a / b * 100) if b else 0


# ---------------------------------------------------------------------------------------------------
# Sources: reuse the exact objects other migrated chapters already verified, and add the sugar documents.
# ---------------------------------------------------------------------------------------------------
REUSE = [
    'eo-14193', 'eo-14194', 'eo-14257', 'eo-14325', 'eo-14323', 'eo-14389', 'scotus-24-1287', 'csms-67834313', 'procl-11012',
    'ustr-usmca-review', 'procl-11062', 'ustr-agoa-2026', 'crs-agoa', 'procl-11030', 'cbp-gsp', 'fas-safeguard-2026', 'hts-ch98',
    'procl-11064', 'csms-69851916',
]
reuse = {}
for f in sorted(glob.glob(f'{CH}/*.json')):
    if '17-sugars' in f:
        continue
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            if s.get('id') in REUSE and s['id'] not in reuse:
                reuse[s['id']] = s
missing = [i for i in REUSE if i not in reuse]
assert not missing, missing


def src(id_, publisher, citation, document, title, published, url, signed=None):
    return {'id': id_, 'publisher': publisher, 'citation': citation, 'document': document, 'title': title, 'signed': signed,
            'published': published, 'url': url}


NEW = {
    'hts-ch17': src('hts-ch17', 'USITC', 'HTSUS 2026 Revision 21, Chapter 17', 'Harmonized Tariff Schedule',
                    'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 17: Sugars and Sugar Confectionery '
                    '(subheading notes, additional U.S. notes 1–11)', '2026-10-07', CH17_PDF),
    'hts-gn': src('hts-gn', 'USITC', 'HTSUS 2026 Revision 21, General Notes', 'Harmonized Tariff Schedule',
                  'Harmonized Tariff Schedule of the United States (2026 Revision 21), General Notes (GN 11 USMCA rules of origin, GN 15 '
                  'quota exclusions)', '2026-10-07', GN_PDF),
    'fas-trq-fy2027': src('fas-trq-fy2027', 'Federal Register', '91 FR 43080', 'Notice (USDA Foreign Agricultural Service)',
                          'Determination of Total Amounts of Fiscal Year 2027 WTO Tariff-Rate Quotas for Raw Cane Sugar and Certain '
                          'Sugars, Syrups and Molasses', '2026-07-14',
                          f'{FR}/2026/07/14/2026-14096/determination-of-total-amounts-of-fiscal-year-2027-wto-tariff-rate-quotas-for-raw-cane-sugar-and'),
    'ustr-trq-fy2027': src('ustr-trq-fy2027', 'Federal Register', '91 FR 46822', 'Notice (USTR)',
                           'Fiscal Year 2027 Tariff-Rate Quota Allocations for Raw Cane Sugar, Refined Sugar, and Sugar-Containing Products',
                           '2026-07-24',
                           f'{FR}/2026/07/24/2026-15050/fiscal-year-2027-tariff-rate-quota-allocations-for-raw-cane-sugar-refined-sugar-and-sugar-containing'),
    'ustr-trq-fy2027-b': src('ustr-trq-fy2027-b', 'Federal Register', '91 FR 60487', 'Notice (USTR)',
                             'Fiscal Year 2027 Tariff-Rate Quota Allocations for Raw Cane Sugar (remaining 55,993 MTRV)', '2026-09-23',
                             f'{FR}/2026/09/23/2026-19399/fiscal-year-2027-tariff-rate-quota-allocations-for-raw-cane-sugar'),
    'ccc-oaq-fy2027': src('ccc-oaq-fy2027', 'Federal Register', '91 FR 62459', 'Notice (USDA Commodity Credit Corporation)',
                          'Domestic Sugar Program — FY 2026 Reassignment and FY 2027 Overall Sugar Marketing Allotment, Cane Sugar and Beet '
                          'Sugar Marketing Allotments and Processor Allocations', '2026-10-01',
                          f'{FR}/2026/10/01/2026-20118/domestic-sugar-program--fy-2026-reassignment-and-fy-2027-overall-sugar-marketing-allotment-cane'),
    'ccc-sugar-obbba': src('ccc-sugar-obbba', 'Federal Register', '91 FR 42313', 'Rule (USDA Commodity Credit Corporation)',
                           'Supplemental Disaster Assistance Programs, Marketing Assistance Loans, and Sugar Provisions', '2026-07-09',
                           f'{FR}/2026/07/09/2026-13878/supplemental-disaster-assistance-programs-marketing-assistance-loans-and-sugar-provisions'),
    'ita-mx-ad-cont': src('ita-mx-ad-cont', 'Federal Register', '90 FR 45182', 'Notice (Commerce, ITA) A-201-845',
                          'Sugar From Mexico: Continuation of Suspension of the Antidumping Duty Investigation', '2025-09-19',
                          f'{FR}/2025/09/19/2025-18222/sugar-from-mexico-continuation-of-suspension-of-the-antidumping-duty-investigation'),
    'ita-mx-cvd-cont': src('ita-mx-cvd-cont', 'Federal Register', '90 FR 45189', 'Notice (Commerce, ITA) C-201-846',
                           'Sugar From Mexico: Continuation of Suspension of the Countervailing Duty Investigation', '2025-09-19',
                           f'{FR}/2025/09/19/2025-18223/sugar-from-mexico-continuation-of-suspension-of-the-countervailing-duty-investigation'),
    'usitc-mx-sunset': src('usitc-mx-sunset', 'Federal Register', '90 FR 43474', 'Notice (USITC) 701-TA-513 and 731-TA-1249',
                           'Sugar From Mexico; Determinations (second five-year reviews)', '2025-09-09',
                           f'{FR}/2025/09/09/2025-17291/sugar-from-mexico-determinations'),
    'ita-mx-ad-ar': src('ita-mx-ad-ar', 'Federal Register', '90 FR 59505', 'Notice (Commerce, ITA) A-201-845',
                        'Agreement Suspending the Antidumping Duty Investigation on Sugar From Mexico: Final Results of the 2022-2023 '
                        'Administrative Review', '2025-12-19',
                        f'{FR}/2025/12/19/2025-23327/agreement-suspending-the-antidumping-duty-investigation-on-sugar-from-mexico-final-results-of-the'),
    'ita-mx-cvd-ar': src('ita-mx-cvd-ar', 'Federal Register', '90 FR 24785', 'Notice (Commerce, ITA) C-201-846',
                         'Agreement Suspending the Countervailing Duty Investigation on Sugar From Mexico: Final Results of the 2023 '
                         'Administrative Review', '2025-06-12',
                         f'{FR}/2025/06/12/2025-10733/agreement-suspending-the-countervailing-duty-investigation-on-sugar-from-mexico-final-results-of-the'),
    'ita-mx-ad-amend': src('ita-mx-ad-amend', 'Federal Register', '85 FR 3620', 'Notice (Commerce, ITA) A-201-845',
                           'Sugar From Mexico: Amendment to the Agreement Suspending the Antidumping Duty Investigation', '2020-01-22',
                           f'{FR}/2020/01/22/2020-00970/sugar-from-mexico-amendment-to-the-agreement-suspending-the-antidumping-duty-investigation'),
    'ita-mx-cvd-amend': src('ita-mx-cvd-amend', 'Federal Register', '85 FR 3613', 'Notice (Commerce, ITA) C-201-846',
                            'Sugar From Mexico: Amendment to the Agreement Suspending the Countervailing Duty Investigation', '2020-01-22',
                            f'{FR}/2020/01/22/2020-00972/sugar-from-mexico-amendment-to-the-agreement-suspending-the-countervailing-duty-investigation'),
    'ita-ar-init-2026': src('ita-ar-init-2026', 'Federal Register', '91 FR 8186', 'Notice (Commerce, ITA)',
                            'Initiation of Antidumping and Countervailing Duty Administrative Reviews (includes the sugar from Mexico '
                            'suspension agreements)', '2026-02-20',
                            f'{FR}/2026/02/20/2026-03417/initiation-of-antidumping-and-countervailing-duty-administrative-reviews'),
}


def add_sources(page, ids):
    have = {s['id'] for s in page['sources']}
    for i in ids:
        s = NEW.get(i) or reuse[i]
        if s['id'] not in have:
            page['sources'].append(json.loads(json.dumps(s)))
            have.add(s['id'])


# ---------------------------------------------------------------------------------------------------
# Chapter + headings
# ---------------------------------------------------------------------------------------------------
TITLE = 'Sugars and Sugar Confectionery'
d['chapter']['title'] = TITLE
for page in ('overview', 'tariffUpdates', 'understandIndustry', 'industryAreas', 'tariffEngineering', 'finalConclusion'):
    p = d[page]
    if isinstance(p.get('h1'), str):
        p['h1'] = p['h1'].replace('Sugars and sugar confectionery', TITLE)

GROUP_LABELS = {
    '1701': ('Cane & beet sugar — raw, refined and flavored', 'Cane & beet sugar'),
    '1702': ('Other sugars & syrups — lactose, maple, glucose, fructose, invert sugar', 'Other sugars & syrups'),
    '1703': ('Molasses', 'Molasses'),
    '1704': ('Sugar confectionery — candy, chewing gum, white chocolate', 'Candy & chewing gum'),
}

BLURBS = {
    '1701': (
        'Raw and refined cane or beet sugar is a tariff-rate quota product, and its in-quota rate depends on the **polarity** (the sugar degree on '
        'the polarimeter). Raw cane sugar inside the WTO quota pays 1.4606¢/kg at 100°, 0.020668¢/kg less for each degree under 100 — about '
        '1.38¢/kg at the usual 96°. Above the quota it pays 33.87¢/kg (raw cane) or 35.74¢/kg (beet and refined sugar). Flavored or colored '
        'sugar with over 65% or 10% sugar is 6% inside its quota and 33.9¢/kg + 5.1% above it.',
        ['raw cane sugar', 'refined sugar', 'white sugar', 'brown sugar', 'beet sugar', 'organic sugar', 'turbinado', 'sugar cubes',
         'powdered sugar'],
    ),
    '1702': (
        'Maple syrup and maple sugar are Free (1702.20.40). Glucose syrup is 2.2¢/kg, fructose syrup 5.1%, chemically pure fructose 9.6%, lactose '
        '6.4% and invert molasses 0.35¢ a liter. Blended syrups and sugar-rich articles made for further processing have quotas set at zero, so '
        'they pay the over-quota rate: 16.9¢ or 33.9¢ per kg of total sugars + 5.1%.',
        ['maple syrup', 'maple sugar', 'glucose syrup', 'corn syrup', 'fructose', 'lactose', 'caramel', 'invert sugar', 'golden syrup'],
    ),
    '1703': (
        'Cane and beet molasses pay 0.35¢ a liter when imported to extract sugar or for human consumption, and 0.01¢ per kg of total sugars '
        'otherwise (mostly animal feed). Molasses from Canada can no longer be imported since September 29, 2026.',
        ['molasses', 'cane molasses', 'blackstrap molasses', 'beet molasses'],
    ),
    '1704': (
        'Candy without cocoa — hard candy, gummies, lollipops, marshmallows, licorice, white chocolate — is mostly 1704.90.35 at 5.6%. Chewing '
        'gum is 4%, candied nuts 4.5% and cough drops Free. Confections made for further processing with over 65% or 10% sugar are 12.2% '
        'inside their quota and 40¢/kg + 10.4% above it.',
        ['hard candy', 'gummies', 'lollipop', 'marshmallow', 'licorice', 'chewing gum', 'bubble gum', 'white chocolate', 'cough drops',
         'cotton candy'],
    ),
}

ov = d['overview']
for g in ov['productGroups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['blurb'], g['searchExamples'] = BLURBS[g['heading']]

# ---------------------------------------------------------------------------------------------------
# Trade figures
# ---------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
Y, PY = ui['latestYear'], ui['priorYear']
total = next(r['totalUsd'] for r in ui['byYear'] if r['year'] == Y)
prior_total = next(r['totalUsd'] for r in ui['byYear'] if r['year'] == PY)
by_c = {c['country']: c for c in ui['byCountry']}
by_line = {x['hs6']: x for x in ui['byLine']}
mx, ca, br = by_c['Mexico'], by_c['Canada'], by_c['Brazil']

# ---------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------
ov['seo']['title'] = 'HTS Chapter 17: Sugars and Sugar Confectionery Tariff Rates 2026 — Sugar Quotas, Candy & Syrup Duties | KoalaGains'
ov['seo']['shortDescription'] = (
    'Searchable duty table for all 92 HTS Chapter 17 lines — raw and refined sugar (priced by polarity), maple and glucose syrup, molasses, '
    'candy and chewing gum. General, FTA and Column 2 rates, the sugar tariff-rate quotas and the 2026 extra duties by country.'
)
ov['seo']['keywords'] = [
    'HTS Chapter 17',
    'sugars and sugar confectionery tariff',
    'sugars and sugar confectionery import duty rates',
    'sugar tariff rate quota',
    'raw cane sugar import duty',
    'hts 1701.14 raw cane sugar duty',
    'candy tariff code',
    'brazil sugar import duties',
    'tariff-rate quotas on refined sugars',
]
ov['intro'] = (
    'Chapter 17 covers cane and beet sugar, the other sugars and syrups (maple, glucose, fructose, lactose), molasses and sugar confectionery '
    'that contains no cocoa — hard candy, gummies, chewing gum and white chocolate. Its **92 tariff lines** split into two worlds. **Candy and '
    'most syrups** carry ordinary rates (Free to 12.2%). **Sugar** sits under the U.S. sugar program: a **tariff-rate quota** lets a fixed '
    'quantity in at a low rate — for raw sugar a per-kilogram rate that falls with the sugar\'s **polarity** — and everything above it pays '
    '33.87¢ to 35.74¢ a kilogram.\n\n'
    f'The U.S. imported **{fmt_usd(total)}** of these goods in {Y}; **Mexico** ({fmt_usd(mx["importsUsd"])}) and **Canada** '
    f'({fmt_usd(ca["importsUsd"])}) supplied {pct(mx["importsUsd"] + ca["importsUsd"], total)}%, mostly candy. On top of the base rate comes an '
    '**extra duty by country**: since July 24, 2026 a Section 301 tariff on 60 economies (10% in total for the EU, +10% or +12.5% for most '
    'others, more for China), with in-quota raw and refined sugar exempt; **Brazil** adds 25% on every line, in-quota sugar included. '
    'USMCA-qualifying goods from Canada and Mexico pay no Section 301 duty, but seven Canadian lactose, syrup and blend lines pay a 50% Section '
    '338 duty and Canadian molasses is banned.'
)
ov['workedExamples'] = [
    {
        'title': 'Raw cane sugar from the Philippines, inside the quota',
        'line': '1701.14.10.40',
        'body': 'The Philippines holds the second-largest raw cane sugar allocation for fiscal 2027 (154,386 metric tons raw value). Inside the '
        'quota the rate is 1.4606¢/kg less 0.020668¢/kg for each degree of polarity under 100. At 96°: 1.4606 − 4 × 0.020668 = 1.3779¢/kg, so '
        '20,000 kg pays **$275.59**. 1701.14.10 is on the Section 301 exemption list (U.S. note 52(b)), so nothing is added. The same sugar '
        'without a quota certificate enters under 1701.14.50 at 33.87¢/kg plus 12.5% of value — $6,774 plus $1,250 on a $10,000 shipment.',
    },
    {
        'title': 'Hard candy from China',
        'line': '1704.90.35',
        'body': 'Hard candy, gummies and lollipops have a 5.6% general rate. China pays two Section 301 duties on top: +12.5% under the 2026 action '
        '(9903.05.31) and +25% because 1704.90.35 is on List 3 (9903.88.03). That is **43.1%**: $21,550 on a $50,000 shipment. The same candy '
        'from Mexico is Free when it qualifies for USMCA (1704 needs only a change from another heading) and 15.6% when it does not.',
    },
    {
        'title': 'Maple syrup from Canada',
        'line': '1702.20.40',
        'body': 'Pure maple syrup and maple sugar are Free under the general rate. Maple syrup is not on the Canada Section 338 lists, so a '
        'USMCA-qualifying shipment pays **nothing**. Syrup that does not qualify for USMCA pays the 10% Section 301 duty for Canada '
        '(9903.05.29). Blended maple syrups made for further processing are different: they fall on 1702.20.28 at 16.9¢ per kg of total sugars '
        '+ 5.1%.',
    },
]
snap = ov['tradeSnapshot']
snap['coverageNote'] = 'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade.'

ov['notes']['chapterNotes'] = (
    '**Note 1.** This chapter does not cover: (a) sugar confectionery containing cocoa (heading 1806); (b) chemically pure sugars (other than '
    'sucrose, lactose, maltose, glucose and fructose) or other products of heading 2940; or (c) medicaments or other products of chapter 30.\n\n'
    '**Subheading note 1.** For subheadings 1701.12, 1701.13 and 1701.14, "raw sugar" means sugar whose sucrose content by weight, in the dry '
    'state, corresponds to a polarimeter reading of less than 99.5 degrees.\n\n'
    '**Subheading note 2.** Subheading 1701.13 covers only cane sugar obtained without centrifugation, with a polarimeter reading of 69° or '
    'more but less than 93°, containing only natural anhedral microcrystals surrounded by residues of molasses and other constituents of sugar '
    'cane.'
)
ov['notes']['additionalUsNotes'] = (
    '**Note 1.** "Degree" in the rates of duty means sugar degree as determined by a polarimetric test — the polarity that the raw-sugar rates '
    'are graded by.\n\n'
    '**Notes 2–4** define the articles with over 65% sugar (note 2), over 10% sugar (note 3) and blended syrups (note 4) that are not prepared '
    'for the final consumer.\n\n'
    '**Note 5.** The WTO tariff-rate quotas: raw cane sugar (1701.13.10, 1701.14.10) of not less than 1,117,195 metric tons raw value a fiscal '
    'year, and other sugars, syrups and molasses (1701.12.10, 1701.91.10, 1701.99.10, 1702.90.10, 2106.90.44) of not less than 22,000 metric '
    'tons, set by the Secretary of Agriculture and allocated among countries by USTR. "Raw value" is the equivalent in sugar testing 96° by the '
    'polariscope.\n\n'
    '**Note 6.** Raw cane sugar under 1701.13.20 and 1701.14.20 may be entered only to make polyhydric alcohols (not for use as a sugar '
    'substitute in food), to be refined and re-exported, or to substitute for domestic raw sugar that is exported — under USDA licenses.\n\n'
    '**Note 7.** The quota for articles over 65% sugar (note 2) is **none**. **Note 8.** The quota for articles over 10% sugar (note 3) is '
    '64,709 metric tons a year from October 1 (goods of Mexico excluded). **Note 9.** The quota for blended syrups (note 4) is **none**.\n\n'
    '**Note 10.** Heading 1703 excludes products with soluble non-sugar solids of 6% or less of total soluble solids. **Note 11.** "Cough '
    'drops" (1704.90.25) must contain at least 5 mg of menthol, eucalyptol or both per dose.'
)

# ---------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['seo'] = {
    'title': 'HTS Chapter 17 Sugar & Candy Tariff Updates 2026 — Section 301, Sugar Quotas, Mexico Suspension Agreements | KoalaGains',
    'shortDescription': 'What changed for HTS Chapter 17 (sugar, syrups, molasses, candy) since January 2025: base rates on all 92 lines, the end '
    'of the IEEPA and Section 122 duties, the 2026 Section 301 tariffs, Canada Section 338, the FY 2027 sugar quotas and the Mexico sugar '
    'suspension agreements — with Federal Register citations.',
    'keywords': [
        'HTS Chapter 17 tariff updates',
        'sugars and sugar confectionery tariff updates',
        'mexico tariff on sugar',
        'us mexico sugar suspension agreement',
        'brazil sugar import duty',
        'fiscal year 2027 raw cane sugar quota allocations',
        'section 301 tariff on candy',
        'canada section 338 molasses',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 '
    'Revision 21** (in force October 9, 2026). No Chapter 17 base rate changed: 90 of the 92 lines are the same, and the other 2 are new '
    'statistical splits of 1702.90.90 (certified organic and other) that carry their parent\'s 5.1%. The sugar quota system — in-quota and '
    'over-quota lines, the polarity-graded raw-sugar rates — is unchanged.\n\n'
    'What changed came on top of the base rate, as extra duties set by country. The 2025 IEEPA duties (Canada +35%, Mexico +25%, Brazil +40%, '
    'the reciprocal tariff on everyone else) **ended on February 24, 2026**, and the 10% Section 122 surcharge that replaced them — no sugar '
    'or candy line was on its exemption list — expired on July 23, 2026. Since **July 24, 2026**, goods from 60 economies pay a **Section 301 '
    'tariff of 10% or 12.5%**; the in-quota raw and refined sugar lines are on its exemption list, the over-quota lines and candy are not. '
    'Brazil adds a separate **25%** on every Chapter 17 line, and since August 22, 2026 seven Canadian lactose and syrup lines pay a **50% '
    'Section 338 duty**, with Canadian molasses and invert molasses **banned** from September 29. **USMCA-qualifying goods from Canada and '
    'Mexico are exempt from the Section 301 duty.** Sugar from Mexico remains under the **antidumping and countervailing duty suspension '
    'agreements**, continued for five more years in September 2025.'
)
tu['scope'] = (
    'Measures that reach Chapter 17 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 tariff, the older China '
    'Section 301 lists, the Canada Section 338 dairy-list duty and import ban, the 2025–2026 IEEPA and Section 122 duties that have ended, the '
    'sugar tariff-rate quotas and their FY 2027 allocations, and the suspension agreements on sugar from Mexico. For the rate each supplier pays, '
    'see Rates by country.'
)

EXEMPT_52B = (
    'In-quota raw and refined sugar is exempt for every country (U.S. note 52(b), 9903.05.86): 1701.12.10, 1701.13.10, 1701.14.10, 1701.91.10, '
    '1701.99.10 and 1702.90.10. The over-quota sugar lines, the general note 15 and re-export lines, syrups, molasses and candy are not on '
    'the list.'
)
IEEPA_END = 'The 2025 IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026.'

IN_EFFECT_TEXT = {
    'Mexico': (
        'USMCA-qualifying goods entered under USMCA pay no Section 301 duty (9903.05.94). ' + EXEMPT_52B + ' Mexican sugar is Free under USMCA '
        'with no quantity limit (9823.09.01), but it is covered by the 2014 antidumping and countervailing duty suspension agreements (A-201-845, '
        'C-201-846), continued in September 2025: Mexican producers sell within export limits and above reference prices, and every entry '
        'needs a Mexican export license. The 25% IEEPA duty on non-USMCA Mexican goods ended February 24, 2026.',
        'USMCA candy, sugar and syrups from Mexico pay $0 in duty. Goods that do not qualify pay the base rate plus 10% of value; Mexican sugar '
        'must still meet the suspension agreements\' limits, or the suspended antidumping and countervailing duty investigations could resume.',
    ),
    'Canada': (
        'USMCA-qualifying goods entered under USMCA pay no Section 301 duty (9903.05.93). ' + EXEMPT_52B + ' Separately, the Section 338 dairy '
        'list (U.S. note 51(b)(2), 9903.03.13) puts +50% on twelve Chapter 17 subheadings — lactose (1702.11, 1702.19), blended syrups '
        '(1702.30.28, 1702.40.28, 1702.60.28, 1702.90.58), articles over 65% sugar (1702.90.68), invert molasses (1702.90.35) and molasses '
        '(1703.10.30, 1703.10.50, 1703.90.30, 1703.90.50) — even when USMCA is claimed. Since September 29, 2026 five of them (invert molasses and '
        'the four molasses lines) are banned instead (Proclamation 11062). The 35% IEEPA duty ended February 24, 2026.',
        'USMCA candy, maple syrup and sugar from Canada pay no extra duty (sugar is Free only inside Canada\'s 9,600-tonne USMCA quota; above '
        'it, the over-quota rate plus 10%); lactose '
        'and the blended syrup lines pay 50% on top of their rate; Canadian molasses cannot be imported. Non-USMCA goods pay the base rate plus '
        '10%.',
    ),
    'Brazil': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) on every Chapter 17 line — the Brazil exemption list (U.S. note 50(a)(ii)) '
        'has no Chapter 17 subheading — and +12.5% under the 2026 action from July 24, 2026 (9903.05.27), which skips the note 52(b) in-quota '
        'sugar lines. The 40% IEEPA duty on Brazil (9903.01.77) and the 10% reciprocal duty ended February 24, 2026.',
        'Brazil\'s 100,000-tonne raw cane sugar quota pays the polarity rate plus 25% of value; above the quota raw sugar pays 33.87¢/kg plus '
        '37.5%; Brazilian candy pays 43.1%.',
    ),
    'China': (
        'Two Section 301 duties stack: +12.5% under the 2026 action (9903.05.31, from July 24, 2026) and an older one — +25% under List 3 '
        '(9903.88.03) on refined sugar 1701.99.10 and 1701.99.50, other sugars 1702.90.90 and candy 1704.90.35 and 1704.90.90, or +7.5% under '
        'List 4A (9903.88.15, since February 14, 2020) on the other lines. The note 52(b) in-quota sugar lines skip the 12.5% but not the List 3 '
        'or 4A duty. The candy-lollipop exclusion in U.S. note 20(nn) has expired. USTR continued the China actions on October 7, 2026. The '
        'IEEPA duties on China ended February 24, 2026.',
        'Hard candy and gummies (1704.90.35) from China pay 43.1%, chewing gum 24%, glucose syrup 2.2¢/kg + 20%.',
    ),
    'European Union': (
        'For EU goods whose base rate (or its ad valorem equivalent) is under 10%, the total is 10% (9903.05.39); at or above 10%, nothing is '
        'added (9903.05.38, U.S. note 52(k)). ' + EXEMPT_52B + ' This replaced the 15% IEEPA reciprocal rate, which ended February 24, 2026.',
        'Most EU candy and chewing gum (4%–5.6% base) pays 10% in total; 12.2% confections stay at 12.2%. EU sugar above the quota pays its '
        'per-kilogram rate — 35.74¢/kg is far above 10% of the value of sugar.',
    ),
    'Türkiye (Turkey)': (
        'Base rate + 12.5% (9903.05.79). ' + EXEMPT_52B + ' ' + IEEPA_END,
        'Turkish candy (1704.90.35) pays 18.1%; chewing gum 16.5%.',
    ),
    'Guatemala': (
        'Base rate + 10% (9903.05.40). ' + EXEMPT_52B + ' CAFTA-DR (P) removes the base rate on most lines and gives Guatemala its own sugar '
        'quota (9822.05.20, U.S. note 25 to subchapter XXII of chapter 98), but not the Section 301 duty (U.S. note 52(a)). ' + IEEPA_END,
        'CAFTA-DR sugar inside Guatemala\'s FTA quota pays 10% of value; raw sugar inside its WTO allocation (54,893 t for FY 2027) pays only the '
        'polarity rate.',
    ),
    'Colombia': (
        'Base rate + 12.5% (9903.05.32). ' + EXEMPT_52B + ' The U.S.–Colombia TPA (CO) removes the base rate and gives Colombia a sugar quota '
        '(9822.08.01), but not the Section 301 duty (U.S. note 52(a)). ' + IEEPA_END,
        'Colombian sugar inside the TPA quota pays 12.5% of value; inside its WTO raw-sugar allocation, only the polarity rate.',
    ),
    'Dominican Republic': (
        'Base rate + 12.5% (9903.05.34). ' + EXEMPT_52B + ' CAFTA-DR (P) removes the base rate on most lines and adds an FTA sugar quota '
        '(9822.05.20), but not the Section 301 duty. ' + IEEPA_END,
        'The Dominican Republic holds the largest FY 2027 raw cane sugar allocation (201,274 t); that sugar pays only the polarity rate.',
    ),
    'El Salvador': (
        'Base rate + 10% (9903.05.37). ' + EXEMPT_52B + ' CAFTA-DR (P) removes the base rate and adds an FTA sugar quota (9822.05.20), but not '
        'the Section 301 duty. ' + IEEPA_END,
        'Raw sugar inside El Salvador\'s WTO allocation (29,734 t for FY 2027) pays only the polarity rate; CAFTA-DR sugar inside its FTA quota '
        'pays 10% of value.',
    ),
    'Australia': (
        'Base rate + 12.5% (9903.05.23). ' + EXEMPT_52B + ' The U.S.–Australia FTA (AU) does not cover the quota sugar lines; Australian raw sugar '
        'enters under its WTO allocation. ' + IEEPA_END,
        'Australia\'s FY 2027 raw cane sugar allocation (94,919 t) pays only the polarity rate; Australian candy is Free under the FTA but pays '
        '12.5%.',
    ),
    'United Kingdom': (
        'Base rate + 10% (9903.05.81). ' + EXEMPT_52B + ' The UK exception list (9903.05.96) has no Chapter 17 line. ' + IEEPA_END,
        'British candy (5.6% base) pays 15.6%; chewing gum 14%.',
    ),
    'Peru': (
        'Base rate + 12.5% (9903.05.63). ' + EXEMPT_52B + ' The U.S.–Peru TPA (PE) removes the base rate and adds a sugar quota (9822.06.10), '
        'but not the Section 301 duty. ' + IEEPA_END,
        'Raw sugar inside Peru\'s WTO allocation (46,887 t for FY 2027) pays only the polarity rate.',
    ),
    'Philippines': (
        'Base rate + 12.5% (9903.05.64). ' + EXEMPT_52B + ' ' + IEEPA_END,
        'The Philippines\' FY 2027 raw cane sugar allocation (154,386 t) pays only the polarity rate, about 1.38¢/kg at 96°; above it, '
        '33.87¢/kg + 12.5%.',
    ),
}
OTHER_TEXT = (
    'Rates by country: Japan, South Korea and Switzerland pay 12.5% in total and Taiwan 10% in total when the base rate is lower (9903.05.49, '
    '9903.05.71, 9903.05.74, 9903.05.76); Thailand, Vietnam and South Africa +12.5%; India, Argentina, Indonesia, Pakistan and Malaysia +10%. '
    + EXEMPT_52B + ' The country exception lists in U.S. note 52(j) name no Chapter 17 line. Countries outside the 60 economies pay only the '
    'base rate.',
    'Raw sugar inside a WTO allocation pays only the polarity rate whatever the country; candy from India pays 15.6%, from Thailand 18.1%; '
    'from a country outside the 60 (for example Mauritius or Eswatini) only the base rate.',
)
for e in tu['inEffect']:
    key = e['country']
    if key in IN_EFFECT_TEXT:
        e['exemption'], e['whatItMeans'] = IN_EFFECT_TEXT[key]
    elif key.startswith('Other'):
        e['country'] = 'Other Section 301 economies (incl. Japan, South Korea, Taiwan, Thailand, India, Argentina, Indonesia, South Africa)'
        e['exemption'], e['whatItMeans'] = OTHER_TEXT
    else:
        raise SystemExit(f'no inEffect text for {key}')
    if e['country'] == 'European Union':
        e['measure'] = 'Section 301 tariff (forced-labor investigations), EU rate'
    elif e['measure'] == 'Section 301 (2026, 60 economies)':
        e['measure'] = 'Section 301 tariff (forced-labor investigations)'
    elif e['country'] == 'China':
        e['measure'] = 'Section 301 tariffs: 2026 action plus List 3 or List 4A'
    elif e['country'] == 'Brazil':
        e['measure'] = 'Section 301 tariffs: Brazil action plus 2026 forced-labor action'
    elif e['country'] == 'Canada':
        e['measure'] = 'Section 301 tariff plus Section 338 dairy-list duty'
    if e['country'] == 'Mexico':
        for sid in ('ita-mx-ad-cont', 'ita-mx-cvd-cont'):
            if sid not in e['sourceIds']:
                e['sourceIds'].insert(-1, sid)
    if e['country'] == 'Canada' and 'procl-11062' not in e['sourceIds']:
        e['sourceIds'].insert(-1, 'procl-11062')
    if e['country'] in ('Guatemala', 'Colombia', 'Dominican Republic', 'El Salvador', 'Australia', 'Peru', 'Philippines'):
        for sid in ('ustr-trq-fy2027', 'ustr-trq-fy2027-b'):
            if sid not in e['sourceIds']:
                e['sourceIds'].insert(-1, sid)
    if e['country'] == 'Brazil' and 'ustr-trq-fy2027' not in e['sourceIds']:
        e['sourceIds'].insert(-1, 'ustr-trq-fy2027')
    if e['country'] in ('Brazil',) and 'eo-14323' not in e['sourceIds']:
        e['sourceIds'].insert(-1, 'eo-14323')

CHANGE_DETAIL = {
    'section-301-2026-60-economies-2026-07-24': (
        'Section 301 tariffs on 60 economies cover Chapter 17',
        '10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). The six in-quota raw and refined sugar subheadings — 1701.12.10, '
        '1701.13.10, 1701.14.10, 1701.91.10, 1701.99.10 and 1702.90.10 — are on the general exemption list (U.S. note 52(b), 9903.05.86); '
        'over-quota sugar, syrups, molasses and candy are not. EU goods pay 10% in total; Japan, South Korea and Switzerland 12.5% in total. '
        'USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94), and a special rate under another FTA does not '
        'remove the duty (note 52(a)).',
    ),
    'section-301-brazil-2026-07-22': (
        'Section 301 tariff on products of Brazil',
        '25% on all goods of Brazil (9903.05.01). The exemption list in U.S. note 50(a)(ii) has no Chapter 17 subheading, so Brazilian sugar pays '
        'it even inside Brazil\'s raw cane sugar quota. From July 24 the 12.5% forced-labor tariff (9903.05.27) is added on top, except on the '
        'note 52(b) in-quota sugar lines.',
    ),
    'section-301-nicaragua-scheduled-2027-01-01': (
        'Scheduled: Section 301 tariff on products of Nicaragua',
        'Products of Nicaragua that pay the column 1-general rate (that is, not entered under CAFTA-DR) will pay +10% (9903.89.01) from January '
        '1, 2027 and +15% from January 1, 2028. CAFTA-DR originating goods — including sugar entered under Nicaragua\'s FTA quota — are not '
        'covered (U.S. note 29). Today Nicaragua pays the 12.5% 2026 Section 301 duty (9903.05.58), and its WTO raw sugar allocation is exempt '
        'from it.',
    ),
    'section-338-canada-2026-08-22': (
        'Canada Section 338 dairy-list duty reaches twelve Chapter 17 subheadings',
        '50% on Canadian products on the dairy list (U.S. note 51(b)(2), 9903.03.13) took effect after the 3-day suspension lapsed. In Chapter 17 '
        'the list covers lactose (1702.11.00, 1702.19.00), blended syrups (1702.30.28, 1702.40.28, 1702.60.28, 1702.90.58), articles over 65% '
        'sugar (1702.90.68), invert molasses (1702.90.35) and molasses (1703.10.30, 1703.10.50, 1703.90.30, 1703.90.50). It applies even to goods '
        'that qualify for USMCA. Canadian sugar, maple syrup and candy are not on it.',
    ),
}
for c in tu['changes']:
    if c['id'] in CHANGE_DETAIL:
        c['title'], c['detail'] = CHANGE_DETAIL[c['id']]
    if c['id'] == 'base-rates':
        c['title'] = 'No Chapter 17 base-rate changes'
        c['detail'] = (
            'All 92 Chapter 17 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition, '
            'including the polarity-graded raw-sugar rates and every in-quota / over-quota pair. The two new statistical lines — '
            '1702.90.90.20 (certified organic) and 1702.90.90.50 (other) — split 1702.90.90 and keep its 5.1% rate.'
        )
    for sid in ('hts-now-cr',):
        pass


def ch(id_, type_, date, label, title, detail, before, now, countries, ids):
    return {'id': id_, 'type': type_, 'date': date, 'dateLabel': label, 'title': title, 'detail': detail, 'before': before, 'now': now,
            'countries': countries, 'sourceIds': ids}


EXTRA_CHANGES = [
    ch('fy2027-trq-opens', 'reference', '2026-10-01', 'Effective', 'FY 2027 sugar quotas open',
       'The fiscal 2027 tariff-rate quotas opened: raw cane sugar 1,117,195 metric tons raw value (the WTO minimum), refined sugar 22,000 '
       'MTRV (10,300 for Canada, 2,954 for Mexico, 7,090 first-come first-served, plus 1,656 of specialty sugar first-come first-served) and '
       '64,709 metric tons of sugar-containing products under note 8 (59,250 for Canada). The same day USDA set the FY 2027 domestic overall '
       'allotment quantity at 10,574,850 short tons raw value, 85% of forecast U.S. consumption.',
       None, None, 'All', ['fas-trq-fy2027', 'ustr-trq-fy2027', 'ccc-oaq-fy2027']),
    ch('ca-ban', 'extraDuty', '2026-09-29', 'Effective', 'Canadian molasses and invert molasses banned',
       'Proclamation 11062 moved certain Canadian dairy-list products from the 50% Section 338 duty to an import ban for goods imported from '
       '12:01 a.m. ET on September 29, 2026. In Chapter 17 that is invert molasses (1702.90.35) and the four molasses lines (1703.10.30, '
       '1703.10.50, 1703.90.30, 1703.90.50); goods imported before that date and entered later still pay the 50%. The other seven Chapter 17 '
       'subheadings on the dairy list keep the 50% duty.',
       '+50%', 'Import banned', 'Canada', ['procl-11062', 'procl-11064', 'csms-69851916', 'hts-now']),
    ch('fy2027-trq-rest', 'reference', '2026-09-23', 'Announced', 'Rest of the FY 2027 raw sugar quota allocated',
       'USTR allocated the remaining 55,993 MTRV of the raw cane sugar quota among 28 countries, on top of the July allocations — for '
       'example +11,931 t for the Dominican Republic, +9,151 t for the Philippines and +5,626 t for Australia. Brazil and Mexico received no '
       'addition.',
       None, None, 'Raw sugar quota holders', ['ustr-trq-fy2027-b']),
    ch('fy2027-trq-alloc', 'reference', '2026-07-24', 'Announced', 'FY 2027 sugar quota allocations by country',
       'USTR allocated 1,061,202 MTRV of the 1,117,195 MTRV raw cane sugar quota among 39 countries — the Dominican Republic 189,343 t, the '
       'Philippines 145,235 t, Brazil 100,000 t, Australia 89,293 t, Guatemala 51,639 t, Argentina 46,260 t, Peru 44,108 t — and split the '
       'refined and sugar-containing product quotas. Imports from countries with an allocation need a certificate of quota eligibility.',
       None, None, 'Raw sugar quota holders', ['ustr-trq-fy2027', 'fas-trq-fy2027']),
    ch('s122-end', 'extraDuty', '2026-07-23', 'Expired', 'Section 122 import surcharge expired',
       'The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.', '+10%', 'None', 'All', ['procl-11012', 'hts-now']),
    ch('ccc-obbba', 'reference', '2026-07-09', 'Effective', 'Domestic sugar program extended through crop year 2031',
       'USDA amended the sugar program rules (7 CFR part 1435) to carry out the One Big Beautiful Bill Act: the program — loans, marketing '
       'allotments and the import quotas that support it — runs through crop year 2031, with higher raw cane and refined beet sugar loan rates. '
       'Import tariffs did not change.',
       None, None, 'All', ['ccc-sugar-obbba']),
    ch('usmca-review', 'reference', '2026-07-01', 'Announced', 'USMCA joint review: not renewed, still in force',
       'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of '
       'the issues or until termination, so USMCA claims (SPI S, S+), Mexico\'s unlimited sugar access (9823.09.01) and Canada\'s USMCA sugar '
       'quotas (9823.09, 9823.10) still apply.',
       None, None, 'Canada, Mexico', ['ustr-usmca-review']),
    ch('s122-start', 'extraDuty', '2026-02-24', 'Effective', 'Section 122 surcharge replaces the IEEPA tariffs',
       '10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 17 line was on the product exemption list (9903.03.03). '
       'USMCA-qualifying goods from Canada and Mexico were exempt.',
       'None', '+10% (until July 23, 2026)', 'All', ['procl-11012', 'hts-now']),
    ch('ieepa-end', 'extraDuty', '2026-02-24', 'Effective', 'All IEEPA tariffs end',
       'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive '
       'Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 '
       'a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.',
       'Varied by country', 'None', 'All', ['scotus-24-1287', 'eo-14389', 'csms-67834313']),
    ch('mx-ar-2026', 'reference', '2026-02-20', 'Announced', 'New annual reviews of the Mexico sugar agreements',
       'Commerce opened the next administrative reviews of the sugar from Mexico suspension agreements: December 1, 2024 – November 30, 2025 '
       '(antidumping, A-201-845) and calendar 2025 (countervailing, C-201-846). Results are pending.',
       None, None, 'Mexico', ['ita-ar-init-2026']),
    ch('agoa-renewed', 'reference', '2026-02-03', 'Signed', 'AGOA reauthorized through December 31, 2026',
       'The Consolidated Appropriations Act, 2026 renewed AGOA retroactively from September 30, 2025. AGOA (SPI D) makes the in-quota and '
       'general note 15 sugar lines and most candy Free for listed sub-Saharan countries; the over-quota sugar lines do not list D. GSP (SPI A, '
       'A*, A+) remains expired since December 31, 2020.',
       'Lapsed (from September 30, 2025)', 'In force to December 31, 2026', 'AGOA beneficiary countries',
       ['ustr-agoa-2026', 'crs-agoa', 'procl-11030', 'cbp-gsp', 'hts-now']),
    ch('mx-ad-ar', 'reference', '2025-12-19', 'Announced', 'Mexico sugar antidumping agreement review (2022–2023)',
       'Commerce found the antidumping suspension agreement met the statutory requirements for December 2022 – November 2023, but that one '
       'producer group did not eliminate at least 85% of the dumping found in the investigation, and said it would take steps to remedy the '
       'noncompliance. The agreement stays in force.',
       None, None, 'Mexico', ['ita-mx-ad-ar']),
    ch('mx-continued', 'reference', '2025-09-09', 'Effective', 'Mexico sugar suspension agreements continued',
       'After the second five-year (sunset) reviews, the USITC found that ending the suspended investigations would likely lead to renewed '
       'injury, and Commerce continued both agreements. They cover raw and refined sugar of all polarities (1701 and 1702.90.40), set export '
       'limits and minimum reference prices ($0.28 a pound for refined sugar, $0.23 for other sugar, FOB plant, under the 2020 amendments) and '
       'require a Mexican export license for every entry. Sugar under the USDA re-export and polyhydric alcohol programs is outside their '
       'scope.',
       None, None, 'Mexico', ['usitc-mx-sunset', 'ita-mx-ad-cont', 'ita-mx-cvd-cont', 'ita-mx-ad-amend', 'ita-mx-cvd-amend']),
    ch('br-40', 'extraDuty', '2025-08-06', 'Effective', '40% IEEPA duty on products of Brazil',
       '+40% on most products of Brazil (9903.01.77) on top of the 10% reciprocal duty. Ended February 24, 2026.', 'None', '+40% (ended)',
       'Brazil', ['eo-14323']),
    ch('ca-amended', 'extraDuty', '2025-07-31', 'Signed', 'Canada additional duty raised to 35%',
       'Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.', '+25%', '+35% (ended)', 'Canada',
       ['eo-14325']),
    ch('reciprocal', 'extraDuty', '2025-04-02', 'Signed', 'Reciprocal tariff on products of all countries',
       '10% baseline (9903.01.25) and higher country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 17 line was on the agricultural '
       'exemption list added in November 2025 (U.S. note 2(v)(iii)). Ended February 24, 2026.', 'None', '+10% or more (ended)',
       'All except Canada, Mexico', ['eo-14257']),
    ch('mx-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Mexico',
       '+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods — most Mexican sugar and candy — were exempt (9903.01.04). Ended February '
       '24, 2026.', 'None', '+25% (ended)', 'Mexico', ['eo-14194']),
    ch('ca-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Canada',
       '+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, 2026.',
       'None', '+25% (ended)', 'Canada', ['eo-14193']),
]
have_ids = {c['id'] for c in tu['changes']}
tu['changes'] += [c for c in EXTRA_CHANGES if c['id'] not in have_ids]
tu['changes'].sort(key=lambda c: c['date'], reverse=True)
add_sources(tu, [
    'hts-ch17', 'hts-ch98', 'fas-trq-fy2027', 'ustr-trq-fy2027', 'ustr-trq-fy2027-b', 'ccc-oaq-fy2027', 'ccc-sugar-obbba', 'ita-mx-ad-cont',
    'ita-mx-cvd-cont', 'usitc-mx-sunset', 'ita-mx-ad-ar', 'ita-mx-ad-amend', 'ita-mx-cvd-amend', 'ita-ar-init-2026', 'procl-11062',
    'procl-11064', 'csms-69851916', 'procl-11012', 'ustr-usmca-review', 'scotus-24-1287', 'eo-14389', 'csms-67834313', 'ustr-agoa-2026',
    'crs-agoa', 'procl-11030', 'cbp-gsp', 'eo-14323', 'eo-14325', 'eo-14257', 'eo-14194', 'eo-14193',
])
stats = [s for s in tu['stats'] if s['label'] != 'IEEPA duties']
stats.append({'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'})
tu['stats'] = stats

# ---------------------------------------------------------------------------------------------------
# Industry areas (matrix)
# ---------------------------------------------------------------------------------------------------
ia = d['industryAreas']
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]

NOTE52B_SHORT = 'In-quota raw and refined sugar (the six note 52(b) subheadings) is exempt.'
RULE_LABELS = {
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94), and sugar is Free with no quantity limit (9823.09.01) — within the export limits '
    'and reference prices of the antidumping and countervailing duty suspension agreements. Otherwise base rate + 10% Section 301 '
    '(9903.05.55). ' + NOTE52B_SHORT + ' The 25% IEEPA duty ended February 24, 2026.',
    'Canada': 'USMCA-qualifying: no Section 301 duty (9903.05.93); sugar is Free only inside Canada\'s 9,600-tonne USMCA quota (9823.09.02) and '
    'pays the over-quota rate plus the 10% Section 301 duty above it (note 52(g) covers only goods entered free of duty). Lactose, blended syrups and articles over 65% sugar on the Section 338 dairy list pay +50% '
    '(9903.03.13) even with USMCA, and Canadian molasses and invert molasses are banned from September 29, 2026. Otherwise base rate + 10% '
    'Section 301 (9903.05.29). The 35% IEEPA duty ended February 24, 2026.',
    'Brazil': 'Base rate + 25% (9903.05.01) + 12.5% (9903.05.27) = +37.5%. The Brazil exemption list (U.S. note 50(a)(ii)) has no Chapter 17 '
    'line; in-quota raw and refined sugar skips only the 12.5% (note 52(b)), so it pays the polarity rate + 25%.',
    'China': 'Base rate + 12.5% Section 301 (9903.05.31) + 7.5% List 4A (9903.88.15) on most lines, or + 25% List 3 (9903.88.03) on refined '
    'sugar (1701.99), 1702.90.90 and candy (1704.90.35, 1704.90.90). ' + NOTE52B_SHORT.replace('is exempt', 'pays only the List 3 or 4A duty'),
    'Germany': 'EU: 10% in total in place of the base rate when the base rate (or its ad valorem equivalent) is under 10% (9903.05.39); nothing '
    'added at or above 10%. ' + NOTE52B_SHORT + ' At real sugar prices the over-quota per-kilogram rates are well above 10%, so EU sugar pays '
    'those rates.',
    'Spain': 'EU: 10% in total in place of the base rate when the base rate (or its ad valorem equivalent) is under 10% (9903.05.39); nothing '
    'added at or above 10%. ' + NOTE52B_SHORT,
    'Guatemala': 'Base rate + 10% Section 301 (9903.05.40). CAFTA-DR (P) rates applied where the line has one, including Guatemala\'s FTA sugar '
    'quota (9822.05.20); the Section 301 duty still applies (U.S. note 52(a)). ' + NOTE52B_SHORT,
    'El Salvador': 'Base rate + 10% Section 301 (9903.05.37). CAFTA-DR (P) rates applied where the line has one, including El Salvador\'s FTA sugar '
    'quota (9822.05.20); the Section 301 duty still applies. ' + NOTE52B_SHORT,
    'Dominican Republic': 'Base rate + 12.5% Section 301 (9903.05.34). CAFTA-DR (P) rates applied where the line has one, including the FTA sugar '
    'quota (9822.05.20); the Section 301 duty still applies. ' + NOTE52B_SHORT,
    'Colombia': 'Base rate + 12.5% Section 301 (9903.05.32); U.S.–Colombia TPA (CO) rates applied where the line has one, including the TPA '
    'sugar quota (9822.08.01); the Section 301 duty still applies (U.S. note 52(a)). ' + NOTE52B_SHORT,
    'Peru': 'Base rate + 12.5% Section 301 (9903.05.63); U.S.–Peru TPA (PE) rates applied where the line has one, including the TPA sugar quota '
    '(9822.06.10); the Section 301 duty still applies. ' + NOTE52B_SHORT,
    'Australia': 'Base rate + 12.5% Section 301 (9903.05.23); U.S.–Australia FTA (AU) rates applied where the line has one — not on the '
    'over-quota sugar lines, which have no AU rate. ' + NOTE52B_SHORT,
    'Türkiye (Turkey)': 'Base rate + 12.5% Section 301 (9903.05.79). ' + NOTE52B_SHORT,
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81). ' + NOTE52B_SHORT + ' The UK exception list (9903.05.96) has no Chapter 17 '
    'line.',
    'Philippines': 'Base rate + 12.5% Section 301 (9903.05.64). ' + NOTE52B_SHORT + ' Raw sugar inside the Philippines\' WTO allocation pays '
    'only the polarity rate.',
    'Any other country': 'Countries outside the 60 Section 301 economies pay only the base rate. The 60 pay +10% or +12.5% (9903.05.20–9903.05.84), '
    'or 10%–12.5% in total for the EU, Japan, South Korea, Switzerland and Taiwan; Brazil pays +37.5% and China +20% or +37.5%. In-quota '
    'raw and refined sugar is exempt for all of them (note 52(b)); no Chapter 17 line is on a country exception list in note 52(j).',
}
for c in ia['countries']:
    if c['country'] not in RULE_LABELS:
        raise SystemExit(f'no rule label for {c["country"]}')
    c['rule']['label'] = RULE_LABELS[c['country']]
    ids = c['rule']['sourceIds']
    extra = []
    if c['country'] == 'Mexico':
        extra = ['hts-ch98', 'ita-mx-ad-cont', 'ita-mx-cvd-cont', 'eo-14389']
    elif c['country'] == 'Canada':
        extra = ['hts-ch98', 'procl-11062', 'eo-14389']
    elif c['country'] == 'Brazil':
        extra = ['eo-14389']
    elif c['country'] in ('Guatemala', 'El Salvador', 'Dominican Republic', 'Colombia', 'Peru'):
        extra = ['hts-ch98']
    for sid in extra:
        if sid not in ids:
            ids.insert(-1, sid)

add_sources(ia, ['hts-ch98', 'ita-mx-ad-cont', 'ita-mx-cvd-cont', 'procl-11062', 'eo-14389', 'hts-ch17', 'ustr-trq-fy2027',
                 'fas-safeguard-2026'])

ia['seo'] = {
    'title': 'HTS Chapter 17 Tariff Rates by Country — Sugar, Syrups & Candy from Mexico, Canada, Brazil, China, EU | KoalaGains',
    'shortDescription': 'The total U.S. tariff on Chapter 17 goods — raw and refined sugar, maple and glucose syrup, molasses, candy and chewing '
    'gum — by country and product group: base rate plus the 2026 Section 301 duty, with USMCA, CAFTA-DR, quota and Section 338 rules applied.',
    'keywords': [
        'sugars and sugar confectionery tariff by country',
        'HTS Chapter 17 tariff rates by country',
        'usmca tariff on sugars and sugar confectionery',
        'mexico sugar tariff',
        'sugar tariff brazil',
        'dominican republic raw sugar quota',
        'chewing gum customs duty',
        'white chocolate import duty',
    ],
}
ia['intro'] = (
    'The total rate on Chapter 17 goods depends as much on **where they come from** as on what they are. Each cell below is the base rate for that '
    'product group plus the extra duty for that country, minus any preference — taken from the current tariff schedule.\n\n'
    'Since the IEEPA duties ended on February 24, 2026, the extra duty is the **Section 301 tariff on 60 economies** that started July 24, 2026. '
    '**USMCA-qualifying goods from Canada and Mexico pay no Section 301 duty**, **EU goods pay 10%** in place of a lower base rate, most other '
    'large suppliers add 10% or 12.5%, **China adds 20% — 37.5% on refined sugar and most candy** — and **Brazil adds 37.5%**. **In-quota raw '
    'and refined sugar is exempt** for every country except Brazil\'s 25%, and Canadian lactose and syrup blends pay a 50% Section 338 duty. '
    'Raw-sugar cells show the polarity rate at 100°, its highest amount; at the usual 96° it is a little lower.'
)
assumptions = [a for a in ia['assumptions'] if 'TODO' not in a]
assumptions += [
    'Polarity: the raw and in-quota refined sugar rates fall with the sugar\'s polarity (for example 1.4606¢/kg less 0.020668¢/kg for each '
    'degree under 100). Cells show the rate at 100°, its highest amount; the tariff calculator asks for the polarity and prices it exactly '
    '(CBP takes estimated duties at not less than 96° unless the invoice shows a lower grade, 19 CFR 151.22).',
    'Quota lines: each sugar group has paired lines — an in-quota line (additional U.S. note 5, entered with a certificate of quota '
    'eligibility from a country with an allocation) and an over-quota "Other" line at 33.87¢–35.74¢/kg. Both are in the group; the importer '
    'picks the line by quota status. The quotas for articles over 65% sugar (note 7) and blended syrups (note 9) are zero, so those goods pay '
    'the over-quota rate.',
    'FTA sugar quotas (CAFTA-DR, Colombia, Peru, Panama, Morocco) are priced per tier: Free inside the FTA quota in Chapter 98 subchapter XXII '
    '(9822), the general rate above it. USMCA: goods of Mexico are Free with no limit (9823.09.01, 9823.10.01); goods of Canada are Free inside '
    'Canada\'s quotas and pay the over-quota rate printed in 9823 above them.',
    'EU and Japan: the 10% (EU) or 12.5% (Japan) total applies when the base rate, or its ad valorem equivalent, is lower. Per-kilogram base '
    'rates are compared at the $10,000 / 1,000 kg test shipment ($10 per kg); sugar trades far below $10 a kilogram, so at real prices the '
    'per-kilogram sugar rates are higher than 10% and the EU pays them instead.',
    'Price-based special safeguard duties (Chapter 99 subchapter IV, 9904.17) can add up to 21.6¢/kg to low-priced over-quota sugar and up to '
    '25.7¢/kg to low-priced sugar-containing articles; they do not apply to goods of FTA partners listed there and are not applied in the '
    'matrix.',
    'Sugar from Mexico is under antidumping and countervailing duty suspension agreements (export limits, reference prices, export licenses). '
    'No antidumping or countervailing duty is collected while they are in force, so the matrix shows none.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied.',
]
ia['assumptions'] = assumptions
ia['exemptionCheck'] = (
    'Read U.S. notes 20, 29, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 general exemption list (note 52(b), '
    '9903.05.86) has six Chapter 17 subheadings — the in-quota lines 1701.12.10, 1701.13.10, 1701.14.10, 1701.91.10, 1701.99.10 and 1702.90.10; '
    'note 52(c) names no Chapter 17 product, and no Chapter 17 line is on the country exception lists in note 52(j). The Brazil list (note '
    '50(a)(ii)) has no Chapter 17 subheading. The Canada Section 338 dairy list (note 51(b)(2), 9903.03.13) has twelve: 1702.11.00, 1702.19.00, '
    '1702.30.28, 1702.40.28, 1702.60.28, 1702.90.35, 1702.90.58, 1702.90.68, 1703.10.30, 1703.10.50, 1703.90.30 and 1703.90.50; the alcohol and '
    'other-products lists (9903.03.12, 9903.03.14) have none. On the China side, List 3 (note 20(f)) covers 1701.99.10, 1701.99.50, 1702.90.90, '
    '1704.90.35 and 1704.90.90, List 4A (note 20(s)(i)) the other Chapter 17 subheadings, and the one Chapter 17 product exclusion (a candy '
    'lollipop, note 20(nn)(1)) has expired. No Chapter 17 line was on the Section 122 exemption list (9903.03.03) or the November 2025 '
    'reciprocal-tariff agricultural list (note 2(v)(iii)).'
)

# ---------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['seo'] = {
    'title': 'Importing Sugar, Syrups & Candy: Quota Certificates, FDA Rules & Legal Ways to Lower Duty (HTS Ch. 17) | KoalaGains',
    'shortDescription': 'The USTR, USDA, CBP, Commerce and FDA rules for each HTS Chapter 17 line — sugar quota certificates, re-export '
    'licenses, the Mexico suspension agreements, polarity testing, candy safety and labeling — and the legal ways to pay less: USMCA, FTA sugar '
    'quotas, the WTO quota, re-export programs and drawback.',
    'keywords': [
        'hts chapter 17 tariff engineering',
        'usmca origin rules sugar',
        'us sugar re export program',
        'certificate of quota eligibility sugar',
        'import candy fda requirements',
        'sugar tariff rate quota',
        'hts 1704 non-cocoa sugar confectionery',
    ],
}
te['intro'] = (
    'Two sets of rules decide what a Chapter 17 import costs. **Sugar** is managed by the U.S. sugar program: USDA sets the quota quantities, '
    'USTR allocates the raw sugar quota among countries and certifies it with certificates of quota eligibility, CBP fills the quotas and tests '
    'polarity, and sugar from Mexico must follow the Commerce suspension agreements. **Candy, syrups and other sugars** are food, so **FDA '
    'decides whether a shipment can be sold**: the foreign plant must be registered, prior notice filed and a foreign supplier verification '
    'program kept — and confectionery has its own hazards, from embedded toys to lead and choking-risk jelly cups.\n\n'
    'The ways to pay less are written into the schedule: claim **USMCA** or another **FTA** and its sugar quota, enter raw sugar **inside the '
    'WTO quota** with a certificate, use the USDA **re-export and polyhydric alcohol programs**, and recover duty through **drawback**. Each '
    'lever depends on a document, listed below with its regulation.'
)
te['regulationsAsOf'] = '2026-10-08'

ECFR = 'https://www.ecfr.gov/current'
USTR_SUGAR = 'https://ustr.gov/issue-areas/agriculture/sugar'
CBP_TRQ = 'https://www.cbp.gov/trade/quota/tariff-rate-quotas'
te['levers'] = [
    {
        'id': 'usmca',
        'title': 'Claim USMCA on goods from Canada or Mexico',
        'saves': 'The Section 301 duty — 10% of value — plus the base rate: Mexican sugar is Free with no quantity limit; Canadian sugar is Free '
        'inside Canada\'s 9,600-tonne quota; USMCA candy, syrups and molasses are Free',
        'appliesTo': 'All 92 lines, for goods that meet the Chapter 17 rules of origin in General Note 11',
        'document': 'A certification of origin from the importer, exporter or producer, with the data elements in 19 CFR 182.12; it can be on the '
        'invoice or another document, and CBP can ask for it.',
        'caveat': 'Sugar, syrups and molasses (1701–1703) qualify only if made from cane or beet grown in the USMCA region (a change from another '
        'chapter), so sugar refined from imported raw sugar does not — except Canada\'s extra refined quota (9823.09.09). Candy (1704) needs '
        'only a change from another heading. USMCA does not remove the Section 338 duty on Canadian dairy-list lines, and Mexican sugar must stay '
        'within the suspension agreements. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.',
        'citations': [
            {'label': '19 CFR 182.12', 'url': f'{ECFR}/title-19/section-182.12'},
            {'label': 'HTSUS General Note 11 (USMCA rules of origin, Chapter 17)', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 98, subch. XXIII, U.S. notes 9–10 (USMCA sugar)', 'url': CH98_PDF},
            {'label': 'HTSUS 9903.05.93 / 9903.05.94', 'url': HTS_NOW_URL},
            {'label': 'USTR statement on the USMCA joint review (July 1, 2026)', 'url': reuse['ustr-usmca-review']['url']},
        ],
    },
    {
        'id': 'fta-quota',
        'title': 'Claim another FTA, including its sugar quota',
        'saves': 'The over-quota rate (33.87¢–35.74¢/kg, or 33.9¢/kg + 5.1% on sugar blends) inside the FTA sugar quotas of CAFTA-DR, Colombia, '
        'Peru, Panama and Morocco; the base rate on candy and syrups from Australia, Bahrain, Chile, Israel, Jordan, Korea, Oman, Singapore and the '
        'other FTA partners',
        'appliesTo': 'Dutiable lines; on the over-quota sugar lines only Bahrain, Chile, Jordan, Korea, Oman and Singapore are Free without a quota',
        'document': 'The origin certification or declaration each agreement requires; FTA sugar quotas are filled at CBP, and some need a USTR '
        'certificate of eligibility.',
        'caveat': 'The FTA quotas are small and tied to each partner\'s sugar trade surplus — for 2026, up to 55,460 t for Guatemala and 40,120 t '
        'for El Salvador under CAFTA-DR. An FTA removes the base rate but not the 2026 Section 301 duty for the 60 economies (U.S. note 52(a)). '
        'GSP (A, A*, A+) has been expired since December 31, 2020.',
        'citations': [
            {'label': 'HTSUS General Notes 3(c) and 8–34', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 98, subch. XXII, U.S. notes 6, 23–25 (FTA sugar quotas, 9822)', 'url': CH98_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'wto-quota',
        'title': 'Enter raw or refined sugar inside the WTO tariff-rate quota',
        'saves': 'About 32.5¢/kg on raw cane sugar (1.38¢/kg at 96° instead of 33.87¢/kg) and about 32¢/kg on refined sugar (3.66¢/kg instead '
        'of 35.74¢/kg) — plus the 10%–12.5% Section 301 duty, because the in-quota lines are exempt from it',
        'appliesTo': 'Raw cane sugar (1701.13.10, 1701.14.10) from the 39 countries with an FY 2027 allocation; refined and specialty sugar '
        '(1701.12.10, 1701.91.10, 1701.99.10, 1702.90.10) under the Canada and Mexico allocations or first-come first-served',
        'document': 'A certificate of quota eligibility issued by the exporting country\'s certifying authority, presented at entry for sugar from '
        'a country with an allocation; specialty sugar needs a USTR specialty sugar certificate.',
        'caveat': 'The raw sugar quota is allocated by country — 1,117,195 MTRV for FY 2027 (October 1, 2026 – September 30, 2027), the '
        'Dominican Republic, the Philippines, Brazil and Australia holding the largest shares. Brazil\'s quota sugar still pays the 25% Brazil '
        'Section 301 duty. The refined first-come first-served quota (7,090 MTRV) and specialty sugar (1,656 MTRV) fill fast.',
        'citations': [
            {'label': '15 CFR part 2011, subpart A (certificates of quota eligibility)', 'url': f'{ECFR}/title-15/part-2011/subpart-A'},
            {'label': '15 CFR part 2011, subpart B (specialty sugar)', 'url': f'{ECFR}/title-15/part-2011/subpart-B'},
            {'label': 'HTSUS Ch. 17, additional U.S. note 5', 'url': CH17_PDF},
            {'label': 'USTR FY 2027 sugar allocations (91 FR 46822; 91 FR 60487)', 'url': NEW['ustr-trq-fy2027']['url']},
            {'label': 'USTR: Sugar', 'url': USTR_SUGAR},
        ],
    },
    {
        'id': 're-export',
        'title': 'Use the USDA re-export and polyhydric alcohol programs',
        'saves': 'The over-quota rate: raw sugar for refining and re-export, for sugar-containing products that are exported, or for making '
        'polyhydric alcohols enters under 1701.13.20 / 1701.14.20 at the in-quota polarity rate, outside the quota',
        'appliesTo': '1701.13.20 and 1701.14.20 (raw cane sugar under additional U.S. note 6), and the refined sugar that licensed refiners export',
        'document': 'A USDA license under 7 CFR part 1530 (the refiner, manufacturer or polyhydric alcohol producer holds it), with the program\'s '
        'records and bond.',
        'caveat': 'The sugar must be refined and exported, used in exported products, or turned into polyhydric alcohols (not a sugar substitute for '
        'food) within the program\'s time limits; licenses are charged and credited. Sugar under these programs is outside the scope of the '
        'Mexico suspension agreements.',
        'citations': [
            {'label': '7 CFR part 1530', 'url': f'{ECFR}/title-7/part-1530'},
            {'label': 'HTSUS Ch. 17, additional U.S. note 6', 'url': CH17_PDF},
        ],
    },
    {
        'id': 'gn15',
        'title': 'Use a General Note 15 entry for samples, government or personal-use goods',
        'saves': 'The over-quota rate: these entries use the "described in general note 15" lines at the in-quota rate and are not counted against '
        'the quota',
        'appliesTo': 'The general note 15 lines: 1701.12.05, 1701.13.05, 1701.14.05, 1701.91.05, 1701.91.42, 1701.91.52, 1701.99.05, 1702.20.22, '
        '1702.30.22, 1702.40.22, 1702.60.22, 1702.90.05, 1702.90.52, 1704.90.52',
        'document': 'Proof of the qualifying purpose: goods for a U.S. government agency; personal-use shipments of 5 kg or less; or samples, '
        'trade-fair, research or embassy goods that will not enter U.S. commerce, with written USDA approval presented at entry.',
        'caveat': 'Commercial goods do not qualify. Ask USDA for approval (identifying the product, quantity and use) before the goods ship.',
        'citations': [{'label': 'HTSUS General Note 15', 'url': GN_PDF}],
    },
    {
        'id': 'drawback',
        'title': 'Recover duty on goods you export',
        'saves': 'Up to 99% of the duties paid, when the imported goods (or goods made from them, such as candy made with imported sugar) are '
        'exported or destroyed',
        'appliesTo': 'Any dutiable line',
        'document': 'A drawback claim to CBP with import and export records.',
        'caveat': 'Claims have filing deadlines and record-keeping rules; check with CBP whether a given Chapter 99 duty is eligible before '
        'relying on it. Sugar already under a USDA re-export license cannot also earn drawback on the same use.',
        'citations': [{'label': '19 CFR part 190', 'url': f'{ECFR}/title-19/part-190'}],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding ruling before you import',
        'saves': 'Certainty: a ruling fixes the classification — raw versus refined sugar, a blended syrup versus maple syrup, a sugar-rich '
        'article for further processing versus retail candy, white chocolate versus chocolate (1806) — before the goods arrive',
        'appliesTo': 'Any line where the formula, polarity or packaging decides the rate',
        'document': 'A ruling request to CBP describing the product, its ingredients, sugar content and packaging.',
        'caveat': 'Rulings apply to the transaction described; a reformulated product may need a new one.',
        'citations': [{'label': '19 CFR part 177', 'url': f'{ECFR}/title-19/part-177'}],
    },
]
FDA_FSVP_PAGE = 'https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-foreign-supplier-verification-programs-fsvp-importers-food-humans-and-animals'
IA = 'https://www.accessdata.fda.gov/cms_ia'
te['rules'] = [
    {
        'id': 'fda-registration',
        'agency': 'FDA',
        'title': 'Food facility registration for the foreign plant that makes, packs or holds the sugar, syrup or candy',
        'citations': [{'label': '21 CFR 1.225', 'url': f'{ECFR}/title-21/section-1.225'}],
    },
    {
        'id': 'fda-prior-notice',
        'agency': 'FDA',
        'title': 'Prior notice of imported food, filed before the shipment arrives',
        'citations': [{'label': '21 CFR part 1, subpart I', 'url': f'{ECFR}/title-21/chapter-I/subchapter-A/part-1/subpart-I'}],
    },
    {
        'id': 'fda-fsvp',
        'agency': 'FDA',
        'title': 'Foreign Supplier Verification Program (FSVP) kept by the U.S. importer',
        'citations': [
            {'label': '21 CFR part 1, subpart L', 'url': f'{ECFR}/title-21/chapter-I/subchapter-A/part-1/subpart-L'},
            {'label': 'FDA: FSVP final rule', 'url': FDA_FSVP_PAGE},
        ],
    },
    {
        'id': 'fda-pchf',
        'agency': 'FDA',
        'title': 'Current good manufacturing practice and preventive controls at the foreign plant',
        'citations': [{'label': '21 CFR part 117', 'url': f'{ECFR}/title-21/part-117'}],
    },
    {
        'id': 'fda-labeling',
        'agency': 'FDA',
        'title': 'Food labeling for retail packs: English label, ingredient list, Nutrition Facts with added sugars, major allergens',
        'citations': [
            {'label': '21 CFR part 101', 'url': f'{ECFR}/title-21/part-101'},
            {'label': '21 CFR 101.9', 'url': f'{ECFR}/title-21/section-101.9'},
        ],
    },
    {
        'id': 'fda-colors',
        'agency': 'FDA',
        'title': 'Colored candy and sugar: only listed color additives, certified where required; illegal or undeclared colors are detained',
        'citations': [
            {'label': '21 CFR part 73', 'url': f'{ECFR}/title-21/part-73'},
            {'label': '21 CFR part 74', 'url': f'{ECFR}/title-21/part-74'},
            {'label': 'FDA Import Alert 45-02', 'url': f'{IA}/importalert_118.html'},
        ],
    },
    {
        'id': 'fda-confectionery',
        'agency': 'FDA',
        'title': 'Confectionery with an embedded non-nutritive object (a toy inside candy) is adulterated; such products are detained',
        'citations': [
            {'label': '21 U.S.C. 342(d)', 'url': 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title21-section342&num=0&edition=prelim'},
            {'label': 'FDA Import Alert 34-02', 'url': f'{IA}/importalert_107.html'},
        ],
    },
    {
        'id': 'fda-jelly',
        'agency': 'FDA',
        'title': 'Mini-cup gel and jelly candies of firm consistency (choking risk) are detained without examination',
        'citations': [{'label': 'FDA Import Alert 33-15', 'url': f'{IA}/importalert_105.html'}],
    },
    {
        'id': 'fda-lead',
        'agency': 'FDA',
        'title': 'Lead and other toxic elements: candy and its ingredients with heavy-metal contamination can be detained',
        'citations': [
            {'label': 'FDA Import Alert 99-42', 'url': f'{IA}/importalert_1167.html'},
            {'label': 'FDA: Lead in food and foodwares', 'url': 'https://www.fda.gov/food/environmental-contaminants-food/lead-food-and-foodwares'},
        ],
    },
    {
        'id': 'ustr-cqe',
        'agency': 'USTR / CBP',
        'title': 'In-quota raw and refined sugar from a country with an allocation needs a certificate of quota eligibility; specialty sugar needs '
        'a specialty sugar certificate',
        'citations': [
            {'label': '15 CFR part 2011', 'url': f'{ECFR}/title-15/part-2011'},
            {'label': 'HTSUS Ch. 17, additional U.S. note 5', 'url': CH17_PDF},
        ],
    },
    {
        'id': 'usda-reexport',
        'agency': 'USDA',
        'title': 'Raw sugar under 1701.13.20 / 1701.14.20 only for refining and re-export, exported products or polyhydric alcohols, under a USDA '
        'license',
        'citations': [
            {'label': '7 CFR part 1530', 'url': f'{ECFR}/title-7/part-1530'},
            {'label': 'HTSUS Ch. 17, additional U.S. note 6', 'url': CH17_PDF},
        ],
    },
    {
        'id': 'cbp-quota',
        'agency': 'CBP',
        'title': 'Tariff-rate quota: in-quota rate only while the quota is open; over-quota rate afterwards; Canadian sugar-containing products '
        'may need an export certificate',
        'citations': [
            {'label': '19 CFR part 132', 'url': f'{ECFR}/title-19/part-132'},
            {'label': '19 CFR 132.17', 'url': f'{ECFR}/title-19/section-132.17'},
            {'label': 'CBP: tariff-rate quotas', 'url': CBP_TRQ},
        ],
    },
    {
        'id': 'cbp-polarity',
        'agency': 'CBP',
        'title': 'Raw sugar is sampled and tested for polarity; estimated duties are taken at not less than 96° unless the invoice shows a lower '
        'grade',
        'citations': [
            {'label': '19 CFR 151.22', 'url': f'{ECFR}/title-19/section-151.22'},
            {'label': '19 CFR part 151, subpart B', 'url': f'{ECFR}/title-19/part-151/subpart-B'},
            {'label': 'HTSUS Ch. 17, additional U.S. note 1', 'url': CH17_PDF},
        ],
    },
    {
        'id': 'ita-mexico',
        'agency': 'Commerce (ITA)',
        'title': 'Sugar from Mexico: suspension agreements on antidumping and countervailing duties — export limits, reference prices and a Mexican '
        'export license for each entry',
        'citations': [
            {'label': '90 FR 45182 (A-201-845)', 'url': NEW['ita-mx-ad-cont']['url']},
            {'label': '90 FR 45189 (C-201-846)', 'url': NEW['ita-mx-cvd-cont']['url']},
            {'label': '85 FR 3613 (2020 amendment, export licenses)', 'url': NEW['ita-mx-cvd-amend']['url']},
        ],
    },
    {
        'id': 'usda-safeguard',
        'agency': 'USDA / CBP',
        'title': 'Price- and volume-based special safeguard duties on over-quota sugar and sugar-containing articles',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. IV (9904.17)', 'url': CH99_PDF},
            {'label': 'USDA FAS safeguard trigger levels (91 FR 56419)', 'url': reuse['fas-safeguard-2026']['url']},
        ],
    },
]

BASE_RULES = ['fda-registration', 'fda-prior-notice', 'fda-fsvp', 'fda-pchf', 'fda-labeling']
GROUP_RULES = {
    '1701': BASE_RULES + ['fda-colors', 'ustr-cqe', 'usda-reexport', 'cbp-quota', 'cbp-polarity', 'ita-mexico', 'usda-safeguard'],
    '1702': BASE_RULES + ['ustr-cqe', 'cbp-quota', 'ita-mexico', 'usda-safeguard'],
    '1703': BASE_RULES,
    '1704': BASE_RULES + ['fda-colors', 'fda-confectionery', 'fda-jelly', 'fda-lead', 'cbp-quota', 'usda-safeguard'],
}
GROUP_NOTES = {
    '1701': 'Raw and refined sugar is the core of the U.S. sugar program: in-quota lines need a certificate of quota eligibility, raw sugar is '
    'tested for polarity, sugar from Mexico must follow the suspension agreements, and over-quota sugar can owe a special safeguard duty.',
    '1702': 'Maple syrup, glucose and fructose syrups are ordinary food imports. Blended syrups and sugar-rich articles for further processing '
    'have zero quotas (notes 7 and 9) and pay the over-quota rate; in-quota sugar syrups (1702.90.10) share the refined sugar quota.',
    '1703': 'Molasses has no quota. Edible molasses from Mexico is inside the scope of the suspension agreements; molasses from Canada is banned '
    'since September 29, 2026 (Proclamation 11062).',
    '1704': 'Candy and chewing gum are FDA foods: colors must be listed additives, no embedded toys, no choking-risk jelly cups, and lead is '
    'watched closely. Confections for further processing with over 65% or 10% sugar fall on the quota lines.',
}
for g in te['groups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['ruleIds'] = GROUP_RULES[g['heading']]
    g['note'] = GROUP_NOTES[g['heading']]

IN_QUOTA = {'1701.12.10', '1701.13.10', '1701.14.10', '1701.91.10', '1701.99.10', '1702.90.10'}
NOTE8_IN = {'1701.91.54', '1704.90.74'}
NOTE79_IN = {'1701.91.44', '1702.20.24', '1702.30.24', '1702.40.24', '1702.60.24', '1702.90.54', '1702.90.64', '1704.90.64'}
DAIRY_IN = {'1704.90.54'}
OVER = {'1701.12.50', '1701.13.50', '1701.14.50', '1701.91.30', '1701.99.50', '1702.90.20', '1701.91.48', '1701.91.58', '1702.20.28',
        '1702.30.28', '1702.40.28', '1702.60.28', '1702.90.58', '1702.90.68', '1704.90.58', '1704.90.68', '1704.90.78'}
GN15 = {'1701.12.05', '1701.13.05', '1701.14.05', '1701.91.05', '1701.91.42', '1701.91.52', '1701.99.05', '1702.20.22', '1702.30.22',
        '1702.40.22', '1702.60.22', '1702.90.05', '1702.90.52', '1704.90.52'}
REEXPORT = {'1701.13.20', '1701.14.20'}
MEXICO_SCOPE = {'1701.12.10', '1701.12.50', '1701.13.10', '1701.13.50', '1701.14.10', '1701.14.50', '1701.91.10', '1701.91.30', '1701.99.10',
                '1701.99.50', '1702.90.40'}
POLARITY = {'1701.12.05', '1701.12.10', '1701.13.05', '1701.13.10', '1701.13.20', '1701.14.05', '1701.14.10', '1701.14.20', '1701.91.05',
            '1701.91.10', '1701.99.05', '1701.99.10'}
QUOTA_ANY = IN_QUOTA | NOTE8_IN | NOTE79_IN | DAIRY_IN | OVER
SAFEGUARD = {'1701.12.50', '1701.13.50', '1701.14.50', '1701.91.30', '1701.99.50', '1702.90.20', '1701.91.48', '1702.90.68', '1704.90.68',
             '1701.91.58', '1704.90.78', '1704.90.58'}
RT_GENERAL = {r['hts']: r.get('effectiveGeneral') for r in ov['rateTable']['rows'] if r.get('hts')}
for ln in te['lines']:
    sub = ln['hts'][:10]
    h = ln['hts'][:4]
    rules = list(BASE_RULES)
    if h == '1704' or sub.startswith('1701.91'):
        rules.append('fda-colors')
    if h == '1704':
        rules += ['fda-confectionery', 'fda-jelly', 'fda-lead']
    if sub in IN_QUOTA:
        rules.append('ustr-cqe')
    if sub in REEXPORT:
        rules.append('usda-reexport')
    if sub in QUOTA_ANY:
        rules.append('cbp-quota')
    if sub in POLARITY:
        rules.append('cbp-polarity')
    if sub in MEXICO_SCOPE:
        rules.append('ita-mexico')
    if sub in SAFEGUARD:
        rules.append('usda-safeguard')
    ln['ruleIds'] = rules
    levers = ['usmca']
    general = RT_GENERAL.get(ln['hts'])
    dutiable = general is not None and general.strip().lower() != 'free'
    if dutiable:
        levers.append('fta-quota')
    if (sub in OVER or sub in IN_QUOTA) and sub.startswith(('1701', '1702.90.10', '1702.90.20')):
        levers.append('wto-quota')
    if sub in REEXPORT or sub in {'1701.13.50', '1701.14.50', '1701.13.10', '1701.14.10'}:
        levers.append('re-export')
    if sub in GN15:
        levers.append('gn15')
    if dutiable:
        levers.append('drawback')
    levers.append('ruling')
    ln['leverIds'] = levers
te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations — not legal advice. Quota status, certificate requirements and FDA import '
    'alerts change during the year; check USTR, CBP and FDA before each shipment that depends on them.'
)

# ---------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['seo'] = {
    'title': 'Sugar & Candy Tariff FAQ: Is There a Tariff on Sugar? HS Codes for Sugar, Candy, Gum, Maple Syrup (HTS Ch. 17) | KoalaGains',
    'shortDescription': 'Answers to what people search about HTS Chapter 17: the U.S. tariff on sugar and candy, the sugar tariff-rate quota, the '
    'Mexico sugar suspension agreement, Brazil and Philippine sugar, and the HS codes for sugar, candy, chewing gum, maple syrup, molasses and '
    'glucose syrup.',
    'keywords': [
        'is there a tariff on sugar',
        'us tariff on sugar',
        'sugar tariff rate quota',
        'mexico sugar suspension agreement',
        'sugar tariff brazil',
        'hs code for sugar',
        'is there a tariff on candy',
        'hs code for candy',
        'chewing gum hs code',
        'is canadian maple syrup tariffed',
        'molasses hs code',
        'us sugar program',
    ],
}
fc['intro'] = (
    'Straight answers to the most common questions about importing sugar, syrups and candy into the U.S. — tariffs, quotas and HS codes. Each '
    'answer links to the page with the full detail.'
)
fc['questionSource'] = 'Google search suggestions (U.S. English), collected October 12, 2026'

def heading_top(h, n):
    rows = [r for r in json.load(open(f'{WT}/src/tariff-data/trade/chapter-17.json'))['byHeadingCountry'] if r['heading'] == h]
    rows.sort(key=lambda r: -r['importsUsd'])
    return rows[:n]


top1701 = heading_top('1701', 7)
NAMES = {'Dominican Rep.': 'the Dominican Republic'}
top1701_txt = ', '.join(f'{NAMES.get(r["country"], r["country"])} ({fmt_usd(r["importsUsd"])})' for r in top1701)

fc['faqs'] = [
    {
        'id': 'sugar-tariff',
        'question': 'Is there a tariff on sugar imported into the U.S.?',
        'searchedAs': ['is there a tariff on sugar', 'us tariff on sugar', 'tariff on sugar imports', 'what is the tariff on sugar',
                       'sugar tariffs us', 'is there a tariff on cane sugar'],
        'answer': 'Yes, a two-tier one. Raw cane sugar inside the tariff-rate quota pays 1.4606¢/kg less 0.020668¢/kg for each degree of '
        'polarity under 100 — about 1.38¢/kg (0.625¢ a pound) at the usual 96°; above the quota it pays 33.87¢/kg (about 15.36¢ a pound). '
        'Refined and beet sugar pay 3.6606¢/kg in quota and 35.74¢/kg above it. On top, the 2026 Section 301 duty (10% or 12.5% for 60 '
        'economies) applies to over-quota sugar but not to in-quota sugar, and Brazil pays 25% on both. Mexican sugar is Free under USMCA but '
        'limited by the suspension agreements.',
        'link': 'industry-areas',
    },
    {
        'id': 'hs-sugar',
        'question': 'What is the HS code for sugar?',
        'searchedAs': ['hs code for sugar', 'sugar hs code', 'sugar tariff code', 'hs code sugar icumsa 45', 'brown sugar hs code',
                       'hs code for sugar cubes'],
        'answer': 'Cane and beet sugar is heading 1701. Raw sugar — a polarimeter reading under 99.5° — is 1701.12 (beet), 1701.13 '
        '(non-centrifugal cane sugar of 69° to 93°) or 1701.14 (other raw cane sugar). Sugar with added flavoring or coloring is 1701.91, and '
        'refined white sugar and other sugar is 1701.99. The U.S. 8-digit line then depends on quota status: .05 for general note 15 entries, '
        '.10 inside the quota and .50 (or .30) above it — for example 1701.99.10 or 1701.99.50 for refined sugar, split into specialty, '
        'not-for-further-processing and other sugar at 10 digits.',
        'link': '',
    },
    {
        'id': 'sugar-trq',
        'question': 'How does the U.S. sugar tariff-rate quota work?',
        'searchedAs': ['sugar tariff rate quota', 'us sugar tariff rate quota', 'sugar import quota', 'sugar quotas'],
        'answer': 'USDA sets the quota each fiscal year (October to September) and USTR allocates it. For FY 2027 the raw cane sugar quota is '
        '1,117,195 metric tons raw value, allocated to 39 countries — the Dominican Republic (201,274 t), the Philippines (154,386 t), Brazil '
        '(100,000 t) and Australia (94,919 t) have the most. The refined sugar quota is 22,000 t: 10,300 for Canada, 2,954 for Mexico, 7,090 '
        'first-come first-served and 1,656 for specialty sugar. Quota sugar needs a certificate of quota eligibility from the exporting country; '
        'everything else pays the over-quota rate. FTA partners and Canada have their own sugar quotas, and Mexico has unlimited USMCA access.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'mexico-sugar',
        'question': 'What is the U.S.–Mexico sugar suspension agreement, and is there a tariff on Mexican sugar?',
        'searchedAs': ['mexico sugar suspension agreement', 'us mexico sugar suspension agreement', 'sugar suspension agreement',
                       'mexico tariff on sugar', 'mexico sugar tariff'],
        'answer': 'In 2014 Commerce suspended its antidumping and countervailing duty investigations of sugar from Mexico in exchange for two '
        'agreements, last amended in 2020: Mexican sugar is sold within yearly export limits, above minimum reference prices ($0.28 a pound for '
        'refined sugar and $0.23 for other sugar, FOB plant) and with a Mexican export license for every entry. After the second sunset reviews '
        'they were continued in September 2025. As for the tariff: USMCA sugar from Mexico is Free with no quota (9823.09.01) and pays no '
        'Section 301 duty; non-USMCA goods pay the base rate plus 10%.',
        'link': 'tariff-updates',
    },
    {
        'id': 'brazil-sugar',
        'question': 'What is the U.S. tariff on sugar from Brazil?',
        'searchedAs': ['sugar tariff brazil', 'brazil sugar import duties', 'brazil sugar tariff'],
        'answer': 'Brazil has a 100,000-tonne raw cane sugar quota for FY 2027. That sugar pays the in-quota polarity rate (about 1.38¢/kg at 96°) '
        'plus 25% of value under the Brazil Section 301 action (9903.05.01), which has no sugar exemption; the 12.5% forced-labor duty does not '
        'apply to in-quota sugar. Above the quota Brazilian raw sugar pays 33.87¢/kg plus 37.5%. U.S. imports of Chapter 17 goods from Brazil '
        f'fell {abs(br["changePct"]):.0f}% in {Y} to {fmt_usd(br["importsUsd"])} (UN Comtrade).',
        'link': 'industry-areas',
    },
    {
        'id': 'philippines-sugar',
        'question': 'What is the U.S. tariff on sugar from the Philippines?',
        'searchedAs': ['sugar tariff philippines'],
        'answer': 'The Philippines holds 154,386 metric tons of the FY 2027 raw cane sugar quota. Inside it, the sugar pays only the polarity '
        'rate — 20,000 kg at 96° costs $275.59 — because the in-quota lines are exempt from the Philippines\' 12.5% Section 301 duty (U.S. note '
        '52(b)). Philippine sugar above the quota pays 33.87¢/kg plus 12.5%.',
        'link': 'industry-areas',
    },
    {
        'id': 'candy-tariff',
        'question': 'Is there a tariff on candy?',
        'searchedAs': ['is there a tariff on candy', 'candy tariffs', 'tariff candy', 'halloween candy tariffs', 'candy prices tariffs'],
        'answer': 'Yes. Candy without cocoa (hard candy, gummies, lollipops) is 1704.90.35 at 5.6%. On top comes the Section 301 duty by country '
        'since July 24, 2026: 10% in total for the EU, 15.6% for the UK and India, 18.1% for Türkiye and Thailand, 43.1% for China (12.5% plus '
        '25% under List 3) and Brazil. USMCA-qualifying candy from Mexico and Canada — more than half of U.S. candy imports — is Free. Chocolate '
        'candy is Chapter 18, not Chapter 17.',
        'link': 'industry-areas',
    },
    {
        'id': 'hs-candy',
        'question': 'What is the HS code for candy?',
        'searchedAs': ['hs code for candy', 'candy tariff code', 'hs tariff code for candy', 'hard candy tariff code', 'gummy candy tariff code',
                       'lollipop hs code', 'hs code for sugar confectionery', 'hs code for confectionery'],
        'answer': 'Sugar confectionery without cocoa is heading 1704. Most candy — hard candy, gummies, jellies, lollipops, marshmallows — is '
        '1704.90.35 (5.6%): .20 for retail candy containing peanuts, .50 for other retail candy, .90 for candy not put up for retail sale. '
        'Chewing gum is 1704.10.00, candied nuts 1704.90.10, cough drops 1704.90.25 (Free). Candy that contains cocoa, including chocolate-coated '
        'candy, is heading 1806.',
        'link': '',
    },
    {
        'id': 'chewing-gum',
        'question': 'What is the HS code for chewing gum?',
        'searchedAs': ['chewing gum hs code', 'bubble gum hs code', 'sugar free chewing gum hs code'],
        'answer': 'Chewing gum and bubble gum, whether or not sugar-coated, is 1704.10.00 at 4% (1.2% under the U.S.–Japan Trade Agreement, Free '
        'under most FTAs and USMCA). Sugar-free gum is a different case: CBP has classified sugar-free chewing gum preparations in 2106.90 '
        '(ruling N331050), where the rate is 6.4%.',
        'link': '',
    },
    {
        'id': 'maple-syrup',
        'question': 'Is Canadian maple syrup tariffed, and what is its HS code?',
        'searchedAs': ['maple syrup tariffs', 'maple syrup tariff canada', 'is canadian maple syrup tariffed', 'canadian maple syrup tariff',
                       'hs code for maple syrup', 'tariff code for maple syrup'],
        'answer': 'Maple syrup and maple sugar are 1702.20.40 (Free); the 10-digit lines split maple sugar (.10) and syrup by organic status and '
        'container size (.40 to .70). Maple syrup is not on the Canada Section 338 lists, so USMCA-qualifying Canadian syrup pays nothing; syrup '
        'that does not qualify pays the 10% Section 301 duty for Canada. The 35% IEEPA duty on non-USMCA Canadian goods ended February 24, 2026. '
        'Blended maple syrups for further processing are 1702.20.28 at 16.9¢ per kg of total sugars + 5.1%.',
        'link': '',
    },
    {
        'id': 'molasses',
        'question': 'What is the HS code for molasses?',
        'searchedAs': ['molasses hs code', 'cane molasses hs code', 'beet molasses hs code', 'sugar molasses hs code',
                       'hs code sugarcane molasses'],
        'answer': 'Molasses from sugar extraction or refining is heading 1703: cane molasses 1703.10 and beet and other molasses 1703.90. Within '
        'each, .30 covers molasses imported to extract sugar or for human consumption (0.35¢ a liter) and .50 the rest, mostly feed (0.01¢ per kg '
        'of total sugars). Invert molasses is 1702.90.35. Molasses and invert molasses from Canada have been banned since September 29, 2026.',
        'link': 'tariff-updates',
    },
    {
        'id': 'glucose',
        'question': 'What is the HS code for glucose syrup and glucose powder?',
        'searchedAs': ['hs code for glucose syrup', 'hs code for glucose', 'hs code for glucose powder', 'hs code for glucose liquid'],
        'answer': 'Glucose (dextrose) and glucose syrup with less than 20% fructose in the dry state is 1702.30 — 1702.30.40 at 2.2¢/kg for '
        'ordinary glucose syrup and powder. With 20% to 50% fructose it is 1702.40 (5.1%), and over 50% fructose 1702.60 (5.1%). Blended syrups '
        'for further processing fall on the zero-quota lines 1702.30.28, 1702.40.28 and 1702.60.28 (16.9¢ or 33.9¢ per kg of total sugars + '
        '5.1%). Glucose meters and test strips are medical products classified elsewhere.',
        'link': '',
    },
    {
        'id': 'imports-by-country',
        'question': 'Where does the U.S. import sugar from?',
        'searchedAs': ['us sugar imports by country', 'sugar imports by country', 'sugar imports to us'],
        'answer': f'In {Y} the largest suppliers of cane and beet sugar (heading 1701) were {top1701_txt} (UN Comtrade, CIF value). Across all of '
        f'Chapter 17 — {fmt_usd(total)} — candy is the largest product, and Mexico and Canada supplied '
        f'{pct(mx["importsUsd"] + ca["importsUsd"], total)}%.',
        'link': 'understand-industry',
    },
    {
        'id': 'sugar-program',
        'question': 'What is the U.S. sugar program?',
        'searchedAs': ['us sugar program', 'us federal sugar program', 'us sugar policy', 'us sugar re export program'],
        'answer': 'A USDA program that supports U.S. sugar prices with loans to processors, marketing allotments that cap domestic sales — '
        '10,574,850 short tons raw value for FY 2027, 85% of forecast consumption — and the import tariff-rate quotas. In July 2026 USDA extended '
        'it through crop year 2031 with higher loan rates. Refiners and manufacturers can import sugar outside the quota under the USDA re-export '
        'and polyhydric alcohol programs (7 CFR part 1530) if the sugar, or products made with it, are exported.',
        'link': 'tariff-engineering',
    },
]

fc['keyTakeaways'] = [
    'Sugar is under a tariff-rate quota: raw cane sugar pays about 1.38¢/kg at 96° polarity inside the FY 2027 quota of 1,117,195 metric tons '
    'and 33.87¢/kg above it; refined sugar 3.66¢/kg or 35.74¢/kg.',
    'The 2025 IEEPA tariffs ended on February 24, 2026. Since July 24, 2026 the extra duty is a Section 301 tariff of 10% or 12.5% (10% in total '
    'for the EU, more for China); in-quota raw and refined sugar is exempt, but Brazil pays 25% on every line.',
    'USMCA goods from Mexico pay nothing — Mexican sugar has unlimited USMCA access but stays under the antidumping and countervailing duty '
    'suspension agreements, continued in 2025. Canadian lactose and sugar blends pay a 50% Section 338 duty, and Canadian molasses is banned.',
    'Candy without cocoa is mostly 1704.90.35 at 5.6%; FDA rules on colors, embedded objects, jelly cups and lead decide whether it can be sold.',
]

# ---------------------------------------------------------------------------------------------------
# Understand industry (import statistics)
# ---------------------------------------------------------------------------------------------------
l1704, l1701_14 = by_line['1704.90'], by_line['1701.14']
chg = (total - prior_total) / prior_total * 100
ui['h1'] = 'HTS Chapter 17: Sugars and Sugar Confectionery — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Sugar & Candy Imports by Country 2020–2025 (HTS Ch. 17): Mexico, Canada, Brazil | KoalaGains',
    'shortDescription': f'U.S. imports of sugar, syrups, molasses and candy 2020–{Y} by country, product and year: {fmt_usd(total)} in {Y}, '
    f'down {abs(chg):.1f}%, led by Mexico and Canada; candy (1704.90) is half the total and raw cane sugar fell by a third.',
    'keywords': [
        'us sugar imports by country',
        'HTS Chapter 17 import statistics',
        'sugar imports to us',
        'us candy imports by country',
        'raw cane sugar imports',
        'glucose and fructose import duties',
    ],
}
ui['byYearCaption'] = f'U.S. imports of Chapter 17 goods each year, split into the two largest {Y} suppliers (Mexico and Canada) and everyone else.'
ui['why'] = (
    f'U.S. imports of Chapter 17 goods were **{fmt_usd(total)} in {Y}**, {abs(chg):.1f}% {"less" if chg < 0 else "more"} than the '
    f'{fmt_usd(prior_total)} of {PY}, the peak year. Half of the total is one product: **sugar confectionery without cocoa (1704.90)**, '
    f'{fmt_usd(l1704["importsUsd"])}, flat on the year. The drop came from sugar: **raw cane sugar (1701.14)** fell '
    f'{abs(l1701_14["changePct"]):.0f}% to {fmt_usd(l1701_14["importsUsd"])}, and imports from **Brazil**, mostly raw sugar, fell '
    f'{abs(br["changePct"]):.0f}% to {fmt_usd(br["importsUsd"])}. Raw sugar imports move with the quota and the U.S. crop more than with the '
    'tariff: most of it comes in under country allocations at about 1.38¢/kg.\n\n'
    f'**Mexico** ({fmt_usd(mx["importsUsd"])}, up {mx["changePct"]:.1f}%) and **Canada** ({fmt_usd(ca["importsUsd"])}, up {ca["changePct"]:.1f}%) '
    f'supplied {pct(mx["importsUsd"] + ca["importsUsd"], total)}% of {Y} imports — mostly candy, plus Mexican sugar under USMCA and Canadian '
    'syrups. The figures are annual and stop at ' + str(Y) + ', before the 2026 tariff changes (the end of the IEEPA duties in February, the '
    'Section 301 tariffs from July 24 and the Canada Section 338 duties from August 22, 2026); they do not show what those changes did. '
    'Duty-collected figures aren\'t available from an official source yet.'
)
ui['sources'].append({'label': 'HTSUS 2026 Revision 21, Chapter 17, additional U.S. note 5 (sugar tariff-rate quotas)', 'url': CH17_PDF})
ui['sources'].append({'label': 'Federal Register 91 FR 46822 (USTR FY 2027 sugar quota allocations)', 'url': NEW['ustr-trq-fy2027']['url']})


# ---------------------------------------------------------------------------------------------------
# Write
# ---------------------------------------------------------------------------------------------------
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
