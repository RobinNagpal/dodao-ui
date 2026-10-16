"""Fills the writer TODOs of the generated Chapter 18 content file (run after pnpm tariff:generate-chapter)."""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU, OUT  # noqa: E402,F401

import json
import sys

ROOT = IU + '/src/tariff-data/chapters/'
PATH = OUT  # run.sh copies the generated file here; filled in place
d = json.load(open(PATH))
ch01 = json.load(open(ROOT + '01-live-animals.json'))
ch02 = json.load(open(ROOT + '02-meat-and-offal.json'))

TODAY = d['asOf']
HTS_URL = 'https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_21_json.json'
CH18_URL = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2018'
CH17_URL = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2017'
CH98_URL = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
CH99_URL = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
GN_URL = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
CBP_TRQ = 'https://www.cbp.gov/trade/quota/tariff-rate-quotas'


def src_from(doc, sid):
    for page in ('tariffUpdates', 'industryAreas'):
        for s in doc.get(page, {}).get('sources', []):
            if s['id'] == sid:
                return dict(s)
    raise KeyError(sid)


def add_sources(page, ids, doc_from=None):
    have = {s['id'] for s in page['sources']}
    for sid in ids:
        if sid in have:
            continue
        s = None
        for doc in (ch01, ch02):
            try:
                s = src_from(doc, sid)
                break
            except KeyError:
                pass
        if s is None:
            s = EXTRA[sid]
        page['sources'].append(s)
        have.add(sid)


EXTRA = {
    'eo-14326': {
        'id': 'eo-14326',
        'publisher': 'Federal Register',
        'citation': '90 FR 37963',
        'document': 'Executive Order 14326',
        'title': 'Further Modifying the Reciprocal Tariff Rates',
        'signed': '2025-07-31',
        'published': '2025-08-06',
        'url': 'https://www.federalregister.gov/documents/2025/08/06/2025-15010/further-modifying-the-reciprocal-tariff-rates',
    },
    'hts-ch18': {
        'id': 'hts-ch18',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 18',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 18: Cocoa and Cocoa Preparations',
        'signed': None,
        'published': '2026-10-07',
        'url': CH18_URL,
    },
    'hts-ch17': {
        'id': 'hts-ch17',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 17',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 17: Sugars and Sugar Confectionery',
        'signed': None,
        'published': '2026-10-07',
        'url': CH17_URL,
    },
    'cbp-trq': {
        'id': 'cbp-trq',
        'publisher': 'CBP',
        'citation': 'CBP web page (modified August 6, 2026)',
        'document': 'Web page',
        'title': 'Tariff Rate Quotas (commodity status reports)',
        'signed': None,
        'published': '2026-08-06',
        'url': CBP_TRQ,
    },
}

# ---------------------------------------------------------------- overview
o = d['overview']
o['seo']['title'] = 'HTS Chapter 18: Cocoa and Cocoa Preparations — Tariff Rates & Import Duties | KoalaGains'
o['seo']['shortDescription'] = (
    'Searchable duty table for all 91 HTS Chapter 18 lines: cocoa beans, cocoa paste, cocoa butter, cocoa powder and chocolate. '
    'General, FTA and Column 2 rates, the chocolate and sweetened-cocoa quotas, and the 2026 Section 301 duties by country '
    '(cocoa beans, butter and powder are exempt).'
)
o['seo']['keywords'] = [
    'HTS Chapter 18',
    'cocoa and cocoa preparations tariff',
    'import duty on cocoa',
    'tariff on cocoa beans',
    'cocoa butter tariff code',
    'cocoa powder tariff',
    'chocolate tariff code',
    'raw cocoa beans tariff rates',
    'bulk chocolate tariff-rate quota',
    'cocoa tariffs 2026',
]
o['intro'] = (
    'Chapter 18 covers cocoa from bean to bar: cocoa beans (1801), shells (1802), cocoa paste or liquor (1803), cocoa butter (1804), '
    'unsweetened cocoa powder (1805) and chocolate and other food preparations containing cocoa (1806). It has **91 tariff lines**, '
    'and the duty depends almost entirely on which side of that split a product falls.\n\n'
    '**Cocoa ingredients enter free or nearly free.** Beans, shells, butter and natural cocoa paste are Free; defatted paste is 0.2¢/kg '
    'and unsweetened powder 0.52¢/kg. Lines 1801–1805 are on the exemption lists of the 2026 Section 301 tariffs (U.S. note 52(b)) '
    'and the Brazil tariff, so no country pays an extra duty on them except China (7.5%, List 4A). They were $7.46B of the $13.32B '
    'the U.S. imported in 2025, mostly from Côte d\'Ivoire, Ecuador, Ghana, Indonesia and Malaysia.\n\n'
    '**Chocolate (1806) is where the duty is.** Retail bars and candy pay 5.6% or 6%. Bulk chocolate, chocolate crumb and sweetened '
    'cocoa powder sit under tariff-rate quotas: inside the quota they pay 3.5%–10% or Free, above it up to 52.8¢/kg + 8.5%. Since '
    '**July 24, 2026** chocolate from 60 economies also pays a Section 301 duty: 10% in total for the EU, 12.5% in total for '
    'Switzerland, +10% or +12.5% for most others, +20% for China and +37.5% for Brazil. USMCA-qualifying chocolate from Canada '
    'and Mexico, which shipped $3.76B of it in 2025, pays no Section 301 duty.'
)

o['stats'] = [s for s in o['stats']]
for s in o['stats']:
    if s['label'] == 'Lines with an extra duty for some origins':
        s['note'] = 'China List 4A reaches all 91; the 2026 Section 301 duties reach the 83 chocolate lines (1806) only'

BLURBS = {
    '1801': (
        'Raw or roasted cocoa beans, whole or broken (cocoa nibs are broken beans). Free for every country, and exempt from the 2026 '
        'Section 301 and Brazil duties. The largest product in the chapter: $2.82B in 2025.',
        ['cocoa beans', 'cacao beans', 'cocoa nibs', 'cacao nibs', 'raw cocoa', 'organic cocoa beans'],
    ),
    '1802': (
        'Cocoa shells, husks, skins and other cocoa waste. Free, and exempt from the 2026 Section 301 duties. A very small trade.',
        ['cocoa shells', 'cocoa husks', 'cacao husk', 'cocoa waste'],
    ),
    '1803': (
        'Cocoa paste (cocoa mass or chocolate liquor). Natural paste is Free; defatted paste is 0.2¢/kg, Free with most FTAs and AGOA. '
        'Exempt from the 2026 Section 301 duties.',
        ['cocoa paste', 'cocoa mass', 'cocoa liquor', 'chocolate liquor', 'cocoa cake'],
    ),
    '1804': (
        'Cocoa butter, fat and oil. Free for every country and exempt from the 2026 Section 301 duties; most comes from Indonesia and '
        'Malaysia.',
        ['cocoa butter', 'cocoa fat', 'cocoa oil', 'cacao butter'],
    ),
    '1805': (
        'Cocoa powder without added sugar or sweetener: 0.52¢/kg, Free under most FTAs and AGOA. Exempt from the 2026 Section 301 '
        'duties. Sweetened cocoa powder is in 1806.10.',
        ['cocoa powder', 'unsweetened cocoa', 'cacao powder', 'organic cocoa powder', 'dutch process cocoa'],
    ),
    '1806': (
        'Chocolate and other food preparations containing cocoa: bars, filled chocolates, chocolate candy, bulk chocolate, chocolate '
        'crumb, coatings and sweetened cocoa powder. Retail bars pay 5.6% or 6%; bulk and sweetened products are under tariff-rate '
        'quotas, with over-quota rates up to 52.8¢/kg + 8.5%. The only heading that pays the 2026 Section 301 duties.',
        ['chocolate', 'chocolate bar', 'milk chocolate', 'dark chocolate', 'chocolate candy', 'chocolate chips', 'couverture',
         'chocolate crumb', 'sweetened cocoa powder', 'hot chocolate mix', 'confectioners coating'],
    ),
}
for g in o['productGroups']:
    g['blurb'], g['searchExamples'] = BLURBS[g['heading']]

o['workedExamples'] = [
    {
        'title': '20 t of cocoa butter from Indonesia',
        'line': '1804.00.00.00',
        'body': (
            'Cocoa butter is Free under the general rate. Indonesia is one of the 60 economies in the 2026 Section 301 action (+10%, '
            '9903.05.45), but 1804 is on the exemption list in U.S. note 52(b) (9903.05.86). Duty owed: **$0**.'
        ),
    },
    {
        'title': '$20,000 of chocolate bars from Belgium',
        'line': '1806.32.90.90',
        'body': (
            'Unfilled bars pay a 6% base rate. For EU goods with a base rate under 10%, the 2026 Section 301 action charges **10% in '
            'place of the base rate** (9903.05.39): $20,000 × 10% = **$2,000**, instead of $1,200 before July 24, 2026. The same bars '
            'from Switzerland pay 12.5% ($2,500), from the UK 6% + 10% = 16% ($3,200).'
        ),
    },
    {
        'title': '$50,000 of filled chocolates from Ontario',
        'line': '1806.31.00.80',
        'body': (
            'Filled chocolate is 5.6%. If the chocolates qualify as originating under USMCA (SPI **S**), they are Free and the 10% '
            'Section 301 duty on Canadian goods does not apply (9903.05.93): **$0**. If they do not qualify, they pay 5.6% + 10% = '
            '15.6%, **$7,800**. Bulk chocolate lines are different: Canada has duty-free access there only within its USMCA quotas '
            '(9823.08.02, 9823.10.02).'
        ),
    },
]

ts = o['tradeSnapshot']
ts['totalDutyCollectedUsd'] = None
ts['effectiveDutyRateNote'] = "Duty-collected figures aren't available from an official source yet."
ts['coverageNote'] = (
    'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade; 2025 is the latest '
    'full year.'
)

o['notes']['chapterNotes'] = (
    '**Note 1.** This chapter does not cover: (a) food preparations containing more than 20 percent by weight of sausage, meat, meat '
    'offal, blood, insects, fish or crustaceans, molluscs or other aquatic invertebrates, or any combination thereof (chapter 16); '
    '(b) preparations of headings 0403, 1901, 1902, 1904, 1905, 2105, 2202, 2208, 3003 or 3004.\n\n'
    '**Note 2.** Heading 1806 includes sugar confectionery containing cocoa, and, subject to note 1 to this chapter, other food '
    'preparations containing cocoa.'
)
o['notes']['additionalUsNotes'] = (
    '**Note 1 (sweetened cocoa powder quota).** Cocoa powder containing over 10 percent by dry weight of sugars derived from sugar '
    'cane or sugar beets (with stated exceptions for retail-ready articles, blended syrups and articles over 65 percent sugar), entered '
    'under 1806.10.10, 1806.10.34 and 1806.10.65 in the 12 months from October 1 to September 30, may not exceed **2,313 metric '
    'tons**. Products of Mexico are not included in this quantitative limitation.\n\n'
    '**Note 2 (chocolate over 5.5% butterfat).** Chocolate containing over 5.5 percent by weight of butterfat (excluding articles for '
    'consumption at retail as candy or confection), entered under 1806.20.24, 1806.32.04 and 1806.90.15 in any calendar year, may '
    'not exceed **26,167,700 kg**, with minimum access for Ireland (4,286,491 kg), the United Kingdom (3,379,297 kg), the Netherlands '
    '(45,359 kg), Australia (2,000,000 kg) and New Zealand (1 kg). Products of Mexico are not included.\n\n'
    '**Note 3 (chocolate and low fat chocolate crumb, 5.5% butterfat or less).** Entered under 1806.20.34, 1806.20.85, 1806.32.14 '
    'and 1806.90.25 in any calendar year, may not exceed **2,122,834 kg**, with minimum access for Ireland (1,700,988 kg), the United '
    'Kingdom (421,845 kg) and New Zealand (1 kg). Products of Mexico are not included.\n\n'
    '**Statistical note 1.** The unit "kg cmsc" (kilograms cows\' milk solids content) includes all cows\' milk components other than '
    'water.\n\n'
    'Other Chapter 18 lines count against quotas set in other chapters: additional U.S. notes 7, 8 and 9 to chapter 17 (sugar-containing '
    'products; note 8 allows 64,709 metric tons a year, notes 7 and 9 allow none) and additional U.S. note 10 to chapter 4 (dairy).'
)

# ---------------------------------------------------------------- tariffUpdates
t = d['tariffUpdates']
t['seo']['title'] = 'HTS Chapter 18 Cocoa & Chocolate Tariff Updates 2026 — What Changed Since January 2025 | KoalaGains'
t['seo']['shortDescription'] = (
    'What changed for HTS Chapter 18 (cocoa and chocolate) since January 2025: cocoa exempted from the reciprocal tariff, the end of the '
    'IEEPA and Section 122 duties, and the 2026 Section 301 tariffs on chocolate by country, with Federal Register citations.'
)
t['seo']['keywords'] = [
    'HTS Chapter 18 tariff updates',
    'cocoa tariff exemption',
    'cocoa tariffs trump',
    'chocolate tariffs 2026',
    'section 301 tariff chocolate',
    'canada tariff on chocolate',
    'section 122 tariff cocoa',
    'usmca cocoa exemptions',
]
t['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current '
    '**2026 Revision 21** (in force October 9, 2026). No Chapter 18 general rate changed between them. Sixteen statistical lines are '
    'new (organic cocoa beans, cocoa powder and chocolate are now reported separately, at the same rates), and on 19 over-quota '
    'chocolate lines the last staged Colombia and Panama FTA rates were removed.\n\n'
    'The extra duties are what moved. The 2025 IEEPA tariffs hit cocoa until **November 13, 2025**, when cocoa beans, paste, butter and '
    'unsweetened powder (1801–1805) were exempted; chocolate kept paying until all IEEPA duties **ended on February 24, 2026**. The 10% '
    'Section 122 surcharge that followed also spared 1801–1805 and expired on July 23, 2026. Since **July 24, 2026** a Section 301 '
    'tariff of 10% or 12.5% applies to products of 60 economies, but again **only to chocolate (1806)**: cocoa ingredients are on the '
    'exemption list. China pays 20% on chocolate (7.5% on cocoa, List 4A) and Brazil 37.5% on chocolate. **USMCA-qualifying goods from '
    'Canada and Mexico are exempt.**'
)
t['scope'] = (
    'Measures that reach Chapter 18 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 tariff, '
    'China Section 301 List 4A, the scheduled Nicaragua duty, and the 2025–2026 IEEPA and Section 122 duties that have ended. '
    'Côte d\'Ivoire, Ghana and Cameroon, three of the largest cocoa suppliers, are not among the 60 economies. For the rate each '
    'supplier pays, see Rates by country.'
)
for s in t['stats']:
    if s['label'] == 'Base rates unchanged':
        s['value'] = '91 of 91 lines'
        s['note'] = 'General rates; 16 lines are new statistical splits'
t['stats'] = [s for s in t['stats'] if s['label'] != 'New or renumbered lines']
t['stats'].append({'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'})

COCOA_EXEMPT = (
    'Cocoa beans, shells, paste, butter and unsweetened powder (1801–1805, 8 lines) are on the general exemption list (U.S. note 52(b), '
    '9903.05.86), so the duty reaches only the 83 chocolate lines of 1806.'
)
IEEPA_END = 'The IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026.'
EX = {
    'ca-section-301': (
        COCOA_EXEMPT + ' Goods of Canada entered free under USMCA pay no Section 301 duty (U.S. note 52(g), 9903.05.93). On the 32 '
        'over-quota chocolate lines Canada\'s free entry is limited to its USMCA quotas (9823.08.02: 1,919 t in 2026; 9823.10.02: '
        '9,600 t a year); above them the over-quota rate applies. The 35% IEEPA duty on Canada (9903.01.10) ended February 24, 2026. '
        'No Chapter 18 line is on the Canada Section 338 lists (U.S. note 51).',
        'USMCA-qualifying Canadian chocolate bars pay $0. Bars that do not qualify pay the base rate plus 10%: 6% + 10% = 16% on '
        'unfilled bars. Canada shipped $3.07B of chocolate in 2025, the largest lane in the chapter.',
        ['eo-14389', 'hts-ch98'],
    ),
    'mx-section-301': (
        COCOA_EXEMPT + ' Goods of Mexico entered free under USMCA pay no Section 301 duty (U.S. note 52(h), 9903.05.94). Mexican '
        'chocolate on the over-quota lines enters Free under 9823.08.01 and 9823.10.01, with no quantity limit. The 25% IEEPA duty on '
        'Mexico (9903.01.01) ended February 24, 2026.',
        'USMCA-qualifying Mexican chocolate pays $0 on every line. Chocolate that does not qualify pays the base rate plus 10% of value.',
        ['eo-14389', 'hts-ch98'],
    ),
    'eu-section-301': (
        COCOA_EXEMPT + ' For EU goods whose base rate (or its ad valorem equivalent) is under 10%, the total is 10% (9903.05.39); '
        'otherwise the base rate applies. The EU exception list (9903.05.97) names no Chapter 18 line. This replaced the 15% IEEPA '
        'reciprocal rate (9903.02.20), which ended February 24, 2026.',
        'A $20,000 pallet of Belgian or German chocolate bars (6% base) pays $2,000 (10%). Cocoa powder from the Netherlands still '
        'pays only 0.52¢/kg.',
        ['eo-14389'],
    ),
    'ch-section-301': (
        COCOA_EXEMPT + ' For Swiss goods whose base rate is under 12.5%, the total is 12.5% (9903.05.74). The Swiss exception list '
        '(9903.05.98) names no Chapter 18 line. The IEEPA duty on Switzerland (39%, later 15% in total) ended February 24, 2026.',
        'Swiss chocolate bars pay 12.5% of value instead of the 6% base rate: $2,500 on a $20,000 shipment.',
        ['eo-14389', 'eo-14326'],
    ),
    'gb-section-301': (
        COCOA_EXEMPT + ' The UK exception list (9903.05.96) names no Chapter 18 line. ' + IEEPA_END,
        'UK chocolate bars pay 6% + 10% = 16% of value.',
        ['eo-14389', 'procl-11012'],
    ),
    'cn-section-301': (
        'Two Section 301 duties stack on chocolate: +12.5% under the 2026 action (9903.05.31) and +7.5% under List 4A (9903.88.15), '
        'which covers all 78 Chapter 18 subheadings and has been 7.5% since February 14, 2020. Cocoa beans, paste, butter and powder '
        '(1801–1805) are exempt from the 2026 action (U.S. note 52(b)) but still pay the 7.5% List 4A duty. The IEEPA duty on China '
        'ended February 24, 2026.',
        'Chocolate bars from China pay 6% + 20% = 26%; cocoa butter from China pays 7.5%.',
        ['eo-14389'],
    ),
    'br-section-301': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the forced-labor action from July 24, 2026 '
        '(9903.05.27). Cocoa beans, paste, butter and powder (1801–1805) are on both exemption lists (U.S. note 50(a)(ii), 9903.05.03, '
        'and U.S. note 52(b), 9903.05.86), so only chocolate pays. The 40% IEEPA duty on Brazil ended February 24, 2026.',
        'Brazilian cocoa butter ($94M in 2025) pays nothing extra; Brazilian chocolate bars pay 6% + 37.5% = 43.5%.',
        ['eo-14389'],
    ),
    'ec-section-301': (
        COCOA_EXEMPT + ' The 15% IEEPA reciprocal duty on Ecuador (9903.02.17) ended February 24, 2026; cocoa was exempt from it '
        'from November 13, 2025.',
        'Ecuador\'s cocoa beans ($965M in 2025, the largest bean lane) pay nothing. Ecuadorian chocolate pays its base rate plus 10%.',
        ['eo-14389', 'eo-14360'],
    ),
    'my-section-301': (
        COCOA_EXEMPT + ' The 19% IEEPA reciprocal duty on Malaysia (9903.02.39) ended February 24, 2026; cocoa was exempt from it '
        'from November 13, 2025.',
        'Malaysian cocoa butter ($644M in 2025) and cocoa paste pay nothing; Malaysian chocolate pays its base rate plus 10%.',
        ['eo-14389', 'eo-14360'],
    ),
    'id-section-301': (
        COCOA_EXEMPT + ' The 19% IEEPA reciprocal duty on Indonesia (9903.02.27) ended February 24, 2026; cocoa was exempt from it '
        'from November 13, 2025.',
        'Indonesian cocoa butter ($736M in 2025, the largest butter lane) pays nothing extra.',
        ['eo-14389', 'eo-14360'],
    ),
    'pe-section-301': (
        COCOA_EXEMPT + ' A Peru TPA claim (SPI PE) removes the base rate but not the Section 301 duty (U.S. note 52(a)). '
        + IEEPA_END,
        'Peruvian cocoa beans and butter pay nothing; Peruvian chocolate bars claimed under the Peru TPA pay 12.5%.',
        ['eo-14389', 'procl-11012'],
    ),
    'other-section-301': (
        COCOA_EXEMPT + ' Nigeria, the Dominican Republic and Colombia pay +12.5%, Türkiye +12.5%, India +10%; Japan and South Korea '
        'pay 12.5% in total and Taiwan 10% in total when the base rate is lower. None of the country exception lists in U.S. note 52(j) '
        'names a Chapter 18 line. Countries outside the 60 economies, including Côte d\'Ivoire, Ghana and Cameroon, pay no extra duty. '
        + IEEPA_END,
        'Nigerian cocoa beans pay nothing extra; Turkish chocolate bars pay 6% + 12.5% = 18.5%.',
        ['eo-14389', 'procl-11012'],
    ),
}
for e in t['inEffect']:
    ex, wim, extra = EX[e['id']]
    e['exemption'] = ex
    e['whatItMeans'] = wim
    for sid in extra:
        if sid not in e['sourceIds']:
            e['sourceIds'].insert(len(e['sourceIds']) - 1, sid)

# Change log (newest first)
gen_changes = {c['id']: c for c in t['changes']}
base = gen_changes['base-rates']
base.update(
    {
        'title': 'No Chapter 18 general-rate changes',
        'detail': (
            'All 91 Chapter 18 lines carry the same General and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition. Sixteen '
            'statistical lines are new because organic cocoa beans (1801.00.00.10), cocoa powder (1805.00.00.10) and several chocolate '
            'lines are now reported separately, at the same rates. On 19 over-quota chocolate lines (for example 1806.20.26 and '
            '1806.90.10) the remaining staged Colombia and Panama FTA rates, such as 2.4¢/kg + 0.2%, were removed from the special column.'
        ),
    }
)
s301 = gen_changes['section-301-2026-60-economies-2026-07-24']
s301.update(
    {
        'title': 'Section 301 tariffs on 60 economies — chocolate pays, cocoa exempt',
        'detail': (
            '10% or 12.5% on products of 60 economies (9903.05.20–9903.05.84). Cocoa beans, shells, paste, butter and unsweetened powder '
            '(1801–1805) are on the general exemption list (U.S. note 52(b), 9903.05.86); the 83 chocolate lines of 1806 pay. EU goods pay '
            '10% in total and Swiss goods 12.5% in total when the base rate is lower. USMCA-qualifying goods from Canada and Mexico are '
            'exempt (9903.05.93, 9903.05.94). Côte d\'Ivoire and Ghana are not among the 60.'
        ),
        'before': 'None',
        'now': '+10% / +12.5% (chocolate)',
        'countries': '60 economies',
    }
)
br = gen_changes['section-301-brazil-2026-07-22']
br.update(
    {
        'title': 'Section 301 tariff on products of Brazil — cocoa exempt',
        'detail': (
            '25% on goods of Brazil (9903.05.01). Cocoa beans, paste, butter and powder (1801–1805) are on the exemption list (U.S. note '
            '50(a)(ii), 9903.05.03). From July 24 the 12.5% forced-labor tariff (9903.05.27) stacks on top for chocolate, which then '
            'pays 37.5% on top of its base rate.'
        ),
        'before': 'None',
    }
)
ni = {
    'id': 'ni-301',
    'type': 'pending',
    'date': '2025-12-29',
    'dateLabel': 'Published',
    'title': 'Nicaragua Section 301 duty: 10% from 2027, 15% from 2028',
    'detail': (
        'USTR set a phased duty on products of Nicaragua (9903.89.01): 0% in 2026, 10% from January 1, 2027 and 15% from January 1, '
        '2028. It reaches every Chapter 18 line, but not goods that originate under CAFTA-DR (U.S. note 29).'
    ),
    'before': 'None',
    'now': '+10% (2027), +15% (2028)',
    'countries': 'Nicaragua',
    'sourceIds': ['fr-2025-22690', 'fr-2025-23892', 'hts-chapter-99'],
}


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


changes = [
    base,
    ch(
        'ca-338',
        'reference',
        '2026-09-29',
        'Effective',
        'Canada Section 338 dairy duties and bans do not reach chocolate',
        (
            '50% duties on certain Canadian alcoholic beverages, dairy products and motor vehicles (9903.03.12–9903.03.14) took effect '
            'August 22, 2026, and some of those products moved to an import ban from September 29, 2026. No Chapter 18 line, including '
            'milk chocolate and chocolate crumb, is on the lists in U.S. note 51.'
        ),
        None,
        None,
        'Canada',
        ['procl-11047', 'procl-11062', 'hts-now'],
    ),
    s301,
    ch(
        's122-end',
        'extraDuty',
        '2026-07-23',
        'Expired',
        'Section 122 import surcharge expired',
        'The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.',
        '+10% (chocolate)',
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
        (
            'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending '
            'resolution of the issues or until termination, so USMCA claims (SPI S, S+) still apply to Canadian and Mexican chocolate.'
        ),
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
        'Section 122 surcharge replaces the IEEPA tariffs — cocoa exempt',
        (
            '10% on products of all countries (9903.03.01) until July 23, 2026. Cocoa beans, shells, paste, butter and unsweetened powder '
            '(1801–1805) were on the product exemption list (9903.03.03); chocolate (1806) paid it. USMCA-qualifying goods from Canada '
            'and Mexico were exempt (9903.03.07, 9903.03.08).'
        ),
        'None',
        '+10% on chocolate (until July 23, 2026)',
        'All',
        ['procl-11012', 'hts-now'],
    ),
    ch(
        'ieepa-end',
        'extraDuty',
        '2026-02-24',
        'Effective',
        'All IEEPA tariffs end',
        (
            'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, '
            'Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods '
            'entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no '
            'longer in effect.'
        ),
        'Varied by country',
        'None',
        'All',
        ['scotus-24-1287', 'eo-14389', 'csms-67834313'],
    ),
    ch(
        'agoa-renewed',
        'reference',
        '2026-02-03',
        'Signed',
        'AGOA reauthorized through December 31, 2026',
        (
            'The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025, when it had '
            'lapsed. AGOA (SPI D) makes defatted cocoa paste, cocoa powder and most non-quota chocolate lines Free for listed sub-Saharan '
            'countries, including Côte d\'Ivoire, Ghana and Nigeria (General Note 16 in Revision 21). It is not available on the over-quota '
            'chocolate lines. GSP (SPI A, A*, A+) remains expired since December 31, 2020.'
        ),
        'Lapsed (from September 30, 2025)',
        'In force to December 31, 2026',
        'AGOA beneficiary countries',
        ['ustr-agoa-2026', 'crs-agoa', 'procl-11030', 'cbp-gsp', 'hts-now'],
    ),
    ni,
    ch(
        'ag-exemption',
        'extraDuty',
        '2025-11-13',
        'Effective',
        'Cocoa taken out of the reciprocal tariff; chocolate stays in',
        (
            'Executive Order 14360 added cocoa beans, shells, paste, butter and unsweetened powder (1801.00, 1802.00, 1803.10, 1803.20, '
            '1804.00, 1805.00) to the reciprocal-tariff exemption list (U.S. note 2(v)(iii), 9903.01.32), for goods entered from 12:01 a.m. '
            'EST on November 13, 2025. No 1806 line was added, so chocolate kept paying the reciprocal rate until February 24, 2026.'
        ),
        '+10% to +19% on cocoa',
        'Exempt (cocoa only)',
        'All countries subject to the reciprocal tariff',
        ['eo-14360', 'hts-now'],
    ),
    ch(
        'reciprocal-rates',
        'extraDuty',
        '2025-08-07',
        'Effective',
        'Country reciprocal rates for the big cocoa suppliers',
        (
            'Executive Order 14326 replaced the 10% baseline with country rates for goods entered from August 7, 2025: +15% for Côte '
            'd\'Ivoire, Ghana, Ecuador, Nigeria and Cameroon, +19% for Indonesia and Malaysia, +39% for Switzerland (9903.02.xx). Cocoa '
            'paid them until November 13, 2025, chocolate until February 24, 2026.'
        ),
        '+10%',
        '+15% to +39% (ended)',
        'Côte d\'Ivoire, Ghana, Ecuador, Nigeria, Cameroon, Indonesia, Malaysia, Switzerland',
        ['eo-14326', 'hts-now'],
    ),
    ch(
        'ca-amended',
        'extraDuty',
        '2025-07-31',
        'Signed',
        'Canada additional duty raised to 35%',
        'Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). USMCA-qualifying chocolate stayed exempt. Ended February 24, 2026.',
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
        (
            '10% baseline (9903.01.25) and later country rates (9903.02.xx) on cocoa and chocolate alike; Canada and Mexico excluded. '
            'Ended February 24, 2026.'
        ),
        'None',
        '+10% or more (ended)',
        'All except Canada, Mexico',
        ['eo-14257'],
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
t['changes'] = changes
need = set()
for c in t['changes']:
    need.update(c['sourceIds'])
for e in t['inEffect']:
    need.update(e['sourceIds'])
add_sources(t, sorted(need))
# drop sources no longer used (the generator added them for the Nicaragua entries)
for s in t['stats']:
    if s['label'] == 'Extra duties in effect':
        s['value'] = str(len(t['inEffect']))
        s['note'] = 'All on chocolate (1806) only, except China List 4A'

# ---------------------------------------------------------------- understandIndustry
u = d['understandIndustry']
u['h1'] = 'HTS Chapter 18: Cocoa and Cocoa Preparations — U.S. Import Statistics'
u['seo']['title'] = 'HTS Chapter 18 Cocoa & Chocolate Import Statistics by Country & Product | KoalaGains'
u['seo']['shortDescription'] = (
    'U.S. cocoa and chocolate imports 2020–2025 by country, by product and over time: $13.32B in 2025, up 61% as cocoa bean and '
    'butter prices and volumes rose. Canada leads on chocolate; Côte d\'Ivoire, Ecuador and Ghana on beans.'
)
u['seo']['keywords'] = [
    'us cocoa imports by country',
    'us chocolate imports by country',
    'where does the us get cocoa beans from',
    'where does the us get most of its chocolate',
    'HTS Chapter 18 import statistics',
    'cocoa butter imports Indonesia Malaysia',
    'cote d\'ivoire raw cocoa beans trade',
]
u['effectiveDuty']['dutyPaidUsd'] = None
u['effectiveDuty']['note'] = (
    "Duty-collected figures aren't available from an official source yet. Cocoa ingredients (56% of 2025 imports) are Free or "
    'nearly free, and most Canadian and Mexican chocolate enters free under USMCA, so the duty falls mainly on chocolate from '
    'other countries.'
)
u['why'] = (
    'U.S. imports of cocoa and chocolate rose from **$8.25B in 2024 to $13.32B in 2025** (+61%). Almost all of the increase is in cocoa '
    'ingredients, and it is both price and volume. Cocoa beans rose from $1.13B to $2.82B: the quantity grew from 198,174 t to 322,247 t '
    'and the average value from $5.73 to $8.76 per kg (in 2023 it was $2.99). Cocoa butter rose from $1.09B to $2.25B, with 88,225 t '
    'becoming 117,015 t at $19.24 instead of $12.35 per kg. Chocolate (1806) grew more slowly, from $4.92B to $5.86B, on almost the same '
    'tonnage (757,316 t to 760,127 t).\n\n'
    'The two halves of the chapter come from different places. **Beans, paste and butter come from the tropics**: Ecuador ($965M), Côte '
    'd\'Ivoire ($728M) and Ghana ($439M) for beans, Côte d\'Ivoire for paste, Indonesia and Malaysia for butter. **Chocolate comes from '
    'North America and Europe**: Canada alone shipped $3.07B, then Mexico ($683M), Belgium, Germany, Türkiye and Italy.\n\n'
    'The tariff schedule explains little of the 2025 jump: cocoa ingredients were Free or nearly free all year, and cocoa was exempted '
    'from the reciprocal tariff on November 13, 2025. Duty matters for chocolate, where most volume comes from Canada and Mexico under '
    'USMCA. 2025 is the latest full year of U.S. trade data.'
)
u['sources'] = [
    {'label': 'UN Comtrade (public API), United States imports, HS chapter 18 (retrieved 2026-10-11)', 'url': 'https://comtradeplus.un.org/'},
    {
        'label': 'UN Comtrade (public API), United States imports of HS 1801, 1804 and 1806, 2023–2025: value and net weight (retrieved 2026-10-11)',
        'url': 'https://comtradeplus.un.org/',
    },
    {
        'label': 'Federal Register 90 FR 54091 (Executive Order 14360, cocoa exempted from the reciprocal tariff)',
        'url': 'https://www.federalregister.gov/documents/2025/11/25/2025-21203/modifying-the-scope-of-the-reciprocal-tariffs-with-respect-to-certain-agricultural-products',
    },
]
u['coverageNote'] = (
    'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. Per-kg values are '
    'import value divided by net weight.'
)

# ---------------------------------------------------------------- industryAreas
a = d['industryAreas']
a['seo']['title'] = 'HTS Chapter 18 Cocoa & Chocolate Tariff Rates by Country — Canada, Côte d\'Ivoire, EU, Switzerland | KoalaGains'
a['seo']['shortDescription'] = (
    'The total U.S. tariff on cocoa beans, cocoa butter, cocoa powder and chocolate by country: base rate plus the 2026 Section 301 '
    'duty, with USMCA, AGOA and EU rules applied. Canada, Côte d\'Ivoire, Ecuador, Malaysia, Indonesia, Mexico, Ghana, Belgium and more.'
)
a['seo']['keywords'] = [
    'cocoa and cocoa preparations import duty rates',
    'canada tariff on chocolate',
    'tariffs on belgian chocolate',
    'tariffs on swiss chocolate',
    'sub-saharan africa cocoa bean import duty',
    'cocoa butter and paste tariff rates',
    'usmca tariff on cocoa and cocoa preparations',
    'HTS Chapter 18 tariff rates by country',
]
a['intro'] = (
    'For cocoa the total rate depends on **what** you import as much as **where** it comes from. Each cell below is the base rate for '
    'that product group plus the extra duty for that country, minus any preference, taken from the current tariff schedule.\n\n'
    '**Cocoa beans, paste, butter and powder (1801–1805) pay no extra duty from any country except China** (7.5%), because they are on '
    'the Section 301 exemption list. **Chocolate (1806) is where countries differ**: USMCA-qualifying chocolate from Canada and Mexico '
    'enters free, the EU pays 10% and Switzerland 12.5% in place of the base rate, the UK, Ecuador, Malaysia and Indonesia add 10%, '
    'Peru 12.5%, China 20% and Brazil 37.5%. Côte d\'Ivoire and Ghana are not among the 60 Section 301 economies and can claim AGOA, so '
    'their chocolate pays the base rate or nothing.'
)
RULES = {
    'Canada': (
        'USMCA-qualifying: free, no extra duty (9903.05.93); on the 32 over-quota chocolate lines free only within Canada\'s USMCA quotas '
        '(9823.08.02, 9823.10.02). Otherwise base rate + 10% Section 301 (9903.05.29) on chocolate; cocoa ingredients are exempt. The 35% '
        'IEEPA duty ended February 24, 2026.',
        ['eo-14389', 'hts-ch98'],
    ),
    'Mexico': (
        'USMCA-qualifying: free on every line, including the over-quota chocolate lines (9823.08.01, 9823.10.01), and no extra duty '
        '(9903.05.94). Otherwise base rate + 10% Section 301 (9903.05.55) on chocolate; cocoa ingredients are exempt. The 25% IEEPA duty '
        'ended February 24, 2026.',
        ['eo-14389', 'hts-ch98'],
    ),
    "Côte d'Ivoire": (
        'Not one of the 60 Section 301 economies: base rate only, Free under AGOA (D) where the line offers it (in force through December '
        '31, 2026). The 15% IEEPA reciprocal duty ended February 24, 2026 (cocoa was exempt from November 13, 2025).',
        ['ustr-agoa-2026', 'eo-14389'],
    ),
    'Ghana': (
        'Not one of the 60 Section 301 economies: base rate only, Free under AGOA (D) where the line offers it (in force through December '
        '31, 2026). The 15% IEEPA reciprocal duty ended February 24, 2026 (cocoa was exempt from November 13, 2025).',
        ['ustr-agoa-2026', 'eo-14389'],
    ),
    'Ecuador': ('Base rate + 10% Section 301 (9903.05.35) on chocolate; cocoa ingredients are exempt (9903.05.86). The 15% IEEPA reciprocal duty ended February 24, 2026.', ['eo-14389']),
    'Malaysia': ('Base rate + 10% Section 301 (9903.05.54) on chocolate; cocoa ingredients are exempt (9903.05.86). The 19% IEEPA reciprocal duty ended February 24, 2026.', ['eo-14389']),
    'Indonesia': ('Base rate + 10% Section 301 (9903.05.45) on chocolate; cocoa ingredients are exempt (9903.05.86). The 19% IEEPA reciprocal duty ended February 24, 2026.', ['eo-14389']),
    'Netherlands': ('EU: 10% in place of the base rate when the base rate is lower (9903.05.39), on chocolate only; cocoa ingredients pay their base rate (9903.05.86). The 15% IEEPA rate ended February 24, 2026.', ['eo-14389']),
    'Belgium': ('EU: 10% in place of the base rate when the base rate is lower (9903.05.39), on chocolate only; cocoa ingredients pay their base rate (9903.05.86). The 15% IEEPA rate ended February 24, 2026.', ['eo-14389']),
    'Germany': ('EU: 10% in place of the base rate when the base rate is lower (9903.05.39), on chocolate only; cocoa ingredients pay their base rate (9903.05.86). The 15% IEEPA rate ended February 24, 2026.', ['eo-14389']),
    'Peru': ('Free under the Peru TPA (PE) where the line offers it, + 12.5% Section 301 (9903.05.63) on chocolate; cocoa ingredients are exempt (9903.05.86).', ['eo-14389']),
    'Switzerland': ('12.5% in place of the base rate when the base rate is lower (9903.05.74), on chocolate only; cocoa ingredients pay their base rate (9903.05.86). The IEEPA duty ended February 24, 2026.', ['eo-14389']),
    'China': ('Base rate + 7.5% List 4A (9903.88.15) on every line, + 12.5% (9903.05.31) on chocolate: 20% extra on chocolate, 7.5% on cocoa ingredients.', ['eo-14389']),
    'Brazil': ('Base rate + 25% (9903.05.01) + 12.5% (9903.05.27) on chocolate: 37.5% extra; cocoa ingredients are on both exemption lists (9903.05.03, 9903.05.86).', ['eo-14389']),
    'United Kingdom': ('Base rate + 10% Section 301 (9903.05.81) on chocolate; cocoa ingredients are exempt (9903.05.86). The UK exception list names no Chapter 18 line.', ['eo-14389']),
    'Any other country': (
        'Countries outside the 60 Section 301 economies (for example Cameroon) pay only the base rate; the others pay up to +12.5% on '
        'chocolate (9903.05.20–9903.05.84). Cocoa ingredients pay no extra duty from any of them.',
        ['eo-14389'],
    ),
}
for c in a['countries']:
    label, extra = RULES[c['country']]
    c['rule']['label'] = label
    for sid in extra:
        if sid not in c['rule']['sourceIds']:
            c['rule']['sourceIds'].append(sid)
for g in a['groups']:
    if g['heading'] == '1806':
        g['shortLabel'] = 'Chocolate'
    if g['heading'] == '1805':
        g['label'] = 'Cocoa powder, unsweetened'
a['assumptions'] = [x for x in a['assumptions'] if 'TODO' not in x]
for i, x in enumerate(a['assumptions']):
    if x.startswith('Preferences:'):
        a['assumptions'][i] = (
            'Preferences: USMCA (S) is applied for Canada and Mexico on the "USMCA-qualifying" side; AGOA (D) for Côte d\'Ivoire and '
            'Ghana; the Peru TPA (PE) for Peru. AGOA was reauthorized on February 3, 2026 through December 31, 2026 (P.L. 119-75; USTR). '
            'GSP (A, A*, A+) has been expired since December 31, 2020 and is not applied. An FTA claim removes the base rate but not the '
            'Section 301 duty (U.S. note 52(a)).'
        )
a['assumptions'] += [
    'Quota lines: most chocolate products come in pairs, an in-quota line (Free to 10%) and an over-quota "Other" line (for example '
    '37.2¢/kg + 4.3%). Which one applies depends on whether the quota in additional U.S. notes 1–3 to Chapter 18, notes 7–9 to Chapter 17 '
    'or note 10 to Chapter 4 is still open on the entry date; check CBP\'s quota status. Select a cell to see the lines.',
    'Canada and Mexico on the 32 over-quota chocolate lines: the USMCA rate is set in Chapter 98 and shown as "See 9823… (quota)". '
    'Mexican goods are Free there without a limit (9823.08.01, 9823.10.01). Canadian goods are Free only up to 1,919 t in 2026 for '
    'dairy-containing chocolate (9823.08.02) and 9,600 t a year for sugar-containing products (9823.10.02); above that the over-quota '
    'rate applies, and the Section 301 relief covers only goods entered free (U.S. note 52(g)).',
    'EU and Swiss floors: 10% (EU) or 12.5% (Switzerland) replaces the base rate when the base rate or its ad valorem equivalent is '
    'lower. For compound over-quota rates the equivalent depends on the shipment\'s value per kg; the cells use $10 per kg, so cheaper '
    'chocolate can end up paying the over-quota rate instead.',
    'Over-quota sugar and dairy chocolate lines can also owe a special agricultural safeguard duty (Chapter 99 subchapter IV, 9904.17 '
    'and 9904.18) during a quantity-based safeguard period announced by the Secretary of Agriculture, or based on the entry\'s value; '
    'it is not applied here.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 '
    'surcharge (9903.03.01) expired July 23, 2026; neither is applied.',
]
a['exemptionCheck'] = (
    'Read U.S. notes 2, 20, 29, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Headings 1801.00, 1802.00, 1803.10, '
    '1803.20, 1804.00 and 1805.00 are on the Section 301 general exemption list (note 52(b), 9903.05.86) and the Brazil exemption list '
    '(note 50(a)(ii), 9903.05.03), and were on the Section 122 exemption list (9903.03.03) and, from November 13, 2025, the reciprocal '
    'tariff exemption list (note 2(v)(iii), 9903.01.32). No 1806 line is on any of those lists, on the country exception lists in note '
    '52(j) (UK, EU, Switzerland, Malaysia and others) or on the Canada Section 338 lists (note 51). All 78 Chapter 18 subheadings are on '
    'China Section 301 List 4A (note 20(s)(i)). The Nicaragua duty (note 29) excludes CAFTA-DR originating goods.'
)
need = set()
for c in a['countries']:
    need.update(c['rule']['sourceIds'])
add_sources(a, sorted(need))

# ---------------------------------------------------------------- tariffEngineering
e = d['tariffEngineering']
e['seo']['title'] = 'Importing Cocoa & Chocolate: FDA Rules, Quotas & Legal Ways to Lower Duty (HTS Ch. 18) | KoalaGains'
e['seo']['shortDescription'] = (
    'The FDA, CBP and quota rules for each HTS Chapter 18 line — prior notice, food facility registration, FSVP, chocolate standards of '
    'identity, sugar and dairy tariff-rate quotas — and the legal ways to pay less: USMCA, in-quota entry, AGOA, drawback.'
)
e['seo']['keywords'] = [
    'import chocolate into the us requirements',
    'FDA prior notice chocolate',
    'chocolate standard of identity 21 CFR 163',
    'usmca chocolate origin rules',
    'chocolate tariff rate quota',
    'sweetened cocoa powder import duty',
    'hts chapter 18 tariff engineering',
    'cocoa duty drawback',
]
e['intro'] = (
    'Cocoa and chocolate are food, so every shipment goes through FDA: **prior notice before arrival, a registered foreign facility and an '
    'importer with a Foreign Supplier Verification Program**. Chocolate sold as "milk chocolate" or "white chocolate" must also meet the '
    'FDA standard of identity for that name.\n\n'
    'The ways to pay less are written into the schedule: claim **USMCA** or **AGOA**, enter **bulk chocolate and sweetened cocoa inside '
    'its quota** rather than at the over-quota rate, or import **cocoa ingredients**, which are exempt from the 2026 Section 301 duties, '
    'and make the chocolate yourself. Each one depends on a document, listed below with its regulation.'
)
e['regulationsAsOf'] = '2026-10-08'
e['levers'] = [
    {
        'id': 'usmca',
        'title': 'Claim USMCA on chocolate from Canada or Mexico',
        'saves': 'The 10% Section 301 duty plus the base rate: 6% + 10% on unfilled bars, or an over-quota rate such as 37.2¢/kg + 4.3% (Mexico, and Canada within its quotas)',
        'appliesTo': 'Chocolate (1806) and the dutiable cocoa lines, for goods that originate under USMCA',
        'document': (
            'A certification of origin from the importer, exporter or producer, on the invoice or any other document. The origin rule for '
            'heading 1806 is a change of heading or subheading: chocolate made in Canada or Mexico from imported cocoa paste, butter or '
            'powder can qualify (sweetened cocoa powder of 1806.10 has a 35% limit on non-originating sugar and cocoa powder). Cocoa '
            'paste, butter and powder (1801–1805) qualify only when made from inputs of another chapter, so pressing imported beans in '
            'Canada does not make the butter originating.'
        ),
        'caveat': (
            'On the 32 over-quota chocolate lines Canada\'s duty-free access is capped (9823.08.02: 1,919 t in 2026; 9823.10.02: 9,600 t a '
            'year, with a Canadian export certificate when USTR requires one); Mexico\'s is not. The USMCA was not renewed at the July 1, '
            '2026 joint review but remains in force.'
        ),
        'citations': [
            {'label': '19 CFR 182.12', 'url': 'https://www.ecfr.gov/current/title-19/section-182.12'},
            {'label': 'HTSUS General Note 11 (USMCA rules of origin, Chapter 18)', 'url': GN_URL},
            {'label': 'HTSUS Ch. 98, subch. XXIII, U.S. notes 8 and 10', 'url': CH98_URL},
            {'label': 'HTSUS 9903.05.93 / 9903.05.94', 'url': CH99_URL},
            {
                'label': 'USTR statement on the USMCA joint review (July 1, 2026)',
                'url': 'https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review',
            },
        ],
    },
    {
        'id': 'in-quota',
        'title': 'Enter bulk chocolate, crumb and sweetened cocoa inside the quota',
        'saves': 'The over-quota rate: for example 5% instead of 37.2¢/kg + 4.3% on chocolate over 5.5% butterfat, or 10% instead of 33.6¢/kg on sweetened cocoa powder',
        'appliesTo': 'The in-quota lines of 1806 ("Described in additional U.S. note …") and their over-quota "Other" counterparts',
        'document': (
            'Entry under the in-quota statistical number while the quota is open; CBP reports the fill status. For the sugar-containing '
            'products quota of additional U.S. note 8 to Chapter 17, an export certificate from the exporting country is required when '
            'that country uses them (15 CFR part 2015).'
        ),
        'caveat': (
            'Quotas fill during the year and some are tiny: 2,313 t a year for sweetened cocoa powder, 2,122,834 kg for low-butterfat '
            'chocolate and crumb, none at all under notes 7 and 9 to Chapter 17. Products of Mexico are excluded from the Chapter 18 '
            'quotas (they use USMCA instead). The Section 301 duty for the country applies either way.'
        ),
        'citations': [
            {'label': 'HTSUS Ch. 18, Additional U.S. Notes 1–3', 'url': CH18_URL},
            {'label': 'HTSUS Ch. 17, Additional U.S. Notes 7–9', 'url': CH17_URL},
            {'label': '15 CFR part 2015', 'url': 'https://www.ecfr.gov/current/title-15/part-2015'},
            {'label': 'CBP: Tariff Rate Quotas (August 6, 2026)', 'url': CBP_TRQ},
        ],
    },
    {
        'id': 'agoa',
        'title': 'Claim AGOA on cocoa products and chocolate from sub-Saharan Africa',
        'saves': 'The base rate: 0.2¢/kg on defatted paste, 0.52¢/kg on cocoa powder, 5.6% or 6% on chocolate bars',
        'appliesTo': 'Lines whose special column lists D, for goods of the countries in General Note 16 (including Côte d\'Ivoire, Ghana and Nigeria)',
        'document': (
            'Evidence that the goods are the growth, product or manufacture of a beneficiary country and meet the 35% value-content rule, '
            'imported directly.'
        ),
        'caveat': (
            'AGOA runs through December 31, 2026 (P.L. 119-75). It does not cover the over-quota chocolate lines, and it does not lift a '
            'Section 301 duty: Nigeria, unlike Côte d\'Ivoire and Ghana, is one of the 60 economies (+12.5% on chocolate).'
        ),
        'citations': [
            {'label': 'HTSUS General Note 16', 'url': GN_URL},
            {
                'label': 'USTR statement on the AGOA reauthorization (February 3, 2026)',
                'url': 'https://ustr.gov/about/policy-offices/press-office/press-releases/2026/february/statement-ambassador-jamieson-greer-reauthorization-african-growth-and-opportunity-act',
            },
        ],
    },
    {
        'id': 'fta',
        'title': 'Claim another FTA (Peru, Colombia, Korea, Singapore and others)',
        'saves': 'The base rate on most non-quota lines; on 19 over-quota lines the last staged Colombia and Panama rates have been removed',
        'appliesTo': 'Lines whose special column lists the agreement\'s code',
        'document': 'The origin certification or documentation the agreement requires (19 CFR part 10 and the agreement\'s General Note).',
        'caveat': 'An FTA claim removes the base rate but not the Section 301 duty (U.S. note 52(a)): Peruvian chocolate still pays 12.5%. GSP (A, A*, A+) has been expired since December 31, 2020.',
        'citations': [
            {'label': 'HTSUS General Notes', 'url': GN_URL},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a)', 'url': CH99_URL},
            {'label': 'CBP: Generalized System of Preferences', 'url': 'https://www.cbp.gov/trade/priority-issues/trade-agreements/special-trade-legislation/generalized-system-preferences'},
        ],
    },
    {
        'id': 'ingredients',
        'title': 'Import cocoa ingredients, not finished chocolate',
        'saves': 'The 2026 Section 301 duty (10%–12.5%, 37.5% for Brazil) and the chocolate base rate',
        'appliesTo': 'Businesses that can make chocolate in the U.S. from beans, paste, butter or powder (1801–1805)',
        'document': 'Ordinary entry under the 1801–1805 line; the exemption in U.S. note 52(b) applies automatically to those headings.',
        'caveat': 'China still pays 7.5% (List 4A) on cocoa ingredients. Chocolate made in the U.S. must meet the same FDA standards of identity as imported chocolate.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(b) (9903.05.86)', 'url': CH99_URL},
            {'label': '21 CFR part 163', 'url': 'https://www.ecfr.gov/current/title-21/part-163'},
        ],
    },
    {
        'id': 'bulk-block',
        'title': 'Buy bulk chocolate in blocks of 4.5 kg or more',
        'saves': 'The base rate: blocks or slabs of 4.5 kg or more each (1806.20.20) are Free, against 4.3%–8.5% or a quota rate for other bulk chocolate',
        'appliesTo': 'Bulk chocolate of 1806.20 bought by confectioners and bakers',
        'document': 'Commercial invoice and packing list showing the block weight; a ruling if the classification is unclear.',
        'caveat': 'The Section 301 duty for the country still applies (EU 10%, Canada 10% unless USMCA). Classification follows the goods as imported, not how they are labeled.',
        'citations': [
            {'label': 'HTSUS 1806.20.20', 'url': CH18_URL},
            {'label': '19 CFR part 177', 'url': 'https://www.ecfr.gov/current/title-19/part-177'},
        ],
    },
    {
        'id': 'drawback',
        'title': 'Claim drawback on chocolate you export again',
        'saves': 'Up to 99% of the duty paid on imported goods that are exported or used to make exported goods',
        'appliesTo': 'Dutiable chocolate and cocoa products that leave the United States',
        'document': 'A drawback claim filed with CBP within 5 years of import, with proof of export and, for manufacturing drawback, a ruling or privilege.',
        'caveat': 'Check with CBP whether each Chapter 99 duty on your entry is eligible. Records of import, use and export must be kept.',
        'citations': [{'label': '19 CFR part 190', 'url': 'https://www.ecfr.gov/current/title-19/part-190'}],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding ruling before you import',
        'saves': 'Certainty: the sugar, butterfat and milk-solids content decides which quota line, and which rate, applies',
        'appliesTo': 'Any 1806 product where the composition or form decides the line',
        'document': 'A ruling request to CBP describing the product, its composition and its packaging.',
        'caveat': 'Rulings apply to the product described; a new recipe may need its own.',
        'citations': [{'label': '19 CFR part 177', 'url': 'https://www.ecfr.gov/current/title-19/part-177'}],
    },
]
e['rules'] = [
    {
        'id': 'fda-prior-notice',
        'agency': 'FDA',
        'title': 'Prior notice of imported food: submitted and confirmed before arrival (2 hours by road, 4 by rail or air, 8 by water)',
        'citations': [
            {'label': '21 CFR 1.279', 'url': 'https://www.ecfr.gov/current/title-21/section-1.279'},
            {'label': '21 CFR 1.281', 'url': 'https://www.ecfr.gov/current/title-21/section-1.281'},
        ],
    },
    {
        'id': 'fda-registration',
        'agency': 'FDA',
        'title': 'Food facility registration: the foreign facility that manufactures, processes, packs or holds the food must be registered with FDA',
        'citations': [
            {'label': '21 CFR 1.225', 'url': 'https://www.ecfr.gov/current/title-21/section-1.225'},
            {'label': 'FDA: Registration of Food Facilities', 'url': 'https://www.fda.gov/food/guidance-regulation-food-and-dietary-supplements/registration-food-facilities-and-other-submissions'},
        ],
    },
    {
        'id': 'fda-fsvp',
        'agency': 'FDA',
        'title': 'Foreign Supplier Verification Program: the U.S. importer must verify that each foreign supplier meets U.S. food-safety standards',
        'citations': [
            {'label': '21 CFR part 1, subpart L', 'url': 'https://www.ecfr.gov/current/title-21/part-1/subpart-L'},
            {'label': 'FDA: FSVP final rule', 'url': 'https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-foreign-supplier-verification-programs-fsvp-importers-food-humans-and-animals'},
        ],
    },
    {
        'id': 'fda-identity',
        'agency': 'FDA',
        'title': 'Standards of identity for cacao products: a product sold as cocoa, chocolate liquor, sweet, milk or white chocolate must meet the composition rules (e.g. milk chocolate ≥ 10% chocolate liquor and ≥ 12% milk solids)',
        'citations': [
            {'label': '21 CFR part 163', 'url': 'https://www.ecfr.gov/current/title-21/part-163'},
            {'label': '21 CFR 163.130 (milk chocolate)', 'url': 'https://www.ecfr.gov/current/title-21/section-163.130'},
            {'label': '21 CFR 163.123 (sweet chocolate)', 'url': 'https://www.ecfr.gov/current/title-21/section-163.123'},
            {'label': '21 CFR 163.124 (white chocolate)', 'url': 'https://www.ecfr.gov/current/title-21/section-163.124'},
        ],
    },
    {
        'id': 'fda-labeling',
        'agency': 'FDA',
        'title': 'Food labeling for packaged products: statement of identity, ingredient list and nutrition facts',
        'citations': [
            {'label': '21 CFR part 101', 'url': 'https://www.ecfr.gov/current/title-21/part-101'},
            {'label': '21 CFR 101.4', 'url': 'https://www.ecfr.gov/current/title-21/section-101.4'},
        ],
    },
    {
        'id': 'cbp-marking',
        'agency': 'CBP',
        'title': 'Country-of-origin marking on the goods or their container',
        'citations': [{'label': '19 CFR part 134', 'url': 'https://www.ecfr.gov/current/title-19/part-134'}],
    },
    {
        'id': 'cbp-trq',
        'agency': 'CBP',
        'title': 'Tariff-rate quota lines: in-quota entry only while the quota is open (check CBP fill status); export certificates for the sugar-containing products quota where required; possible agricultural safeguard duty on over-quota lines',
        'citations': [
            {'label': 'CBP: Tariff Rate Quotas (August 6, 2026)', 'url': CBP_TRQ},
            {'label': 'HTSUS Ch. 18, Additional U.S. Notes 1–3', 'url': CH18_URL},
            {'label': 'HTSUS Ch. 17, Additional U.S. Notes 7–9', 'url': CH17_URL},
            {'label': '15 CFR part 2015', 'url': 'https://www.ecfr.gov/current/title-15/part-2015'},
        ],
    },
]
GROUP_NOTES = {
    '1801': 'Raw beans are a food under FDA rules even though they will be processed: prior notice, a registered facility and FSVP apply. Free for every country; only China pays an extra 7.5%.',
    '1802': 'Shells and husks imported for food or feed use follow the same FDA rules. Free, and no extra duty except China (7.5%).',
    '1803': 'Chocolate liquor sold as such must meet 21 CFR 163.111 (50%–60% cacao fat).',
    '1804': 'Cocoa butter is an ingredient; the standards of identity in 21 CFR part 163 govern the chocolate it goes into, not the butter itself.',
    '1805': 'Cocoa sold as "cocoa", "breakfast cocoa" or "lowfat cocoa" must meet 21 CFR 163.112–163.114.',
    '1806': 'Most products come in quota pairs: the in-quota line (Free to 10%) and the over-quota "Other" line (up to 52.8¢/kg + 8.5%). Sugar content, butterfat content, milk solids and whether the product is for retail sale decide the line.',
}
FDA_ALL = ['fda-prior-notice', 'fda-registration', 'fda-fsvp', 'cbp-marking']
for g in e['groups']:
    rules = list(FDA_ALL)
    if g['heading'] in ('1803', '1805', '1806'):
        rules.append('fda-identity')
    if g['heading'] in ('1805', '1806'):
        rules.append('fda-labeling')
    if g['heading'] == '1806':
        rules.append('cbp-trq')
    g['ruleIds'] = rules
    g['note'] = GROUP_NOTES[g['heading']]

rows = {r['hts']: r for r in o['rateTable']['rows'] if r['hts']}
for line in e['lines']:
    h = line['heading']
    r = rows.get(line['hts'], {})
    gen = (r.get('effectiveGeneral') or '')
    special = r.get('effectiveSpecial') or ''
    rules = list(FDA_ALL)
    if h in ('1803', '1805', '1806'):
        rules.append('fda-identity')
    if h in ('1805', '1806'):
        rules.append('fda-labeling')
    desc_all = ' '.join(r.get('ancestorPath', [])) + ' ' + line['description']
    quota = h == '1806' and ('additional U.S. note' in desc_all or '¢' in gen or 'general note 15' in desc_all)
    if quota:
        rules.append('cbp-trq')
    levers = []
    dutiable = gen not in ('Free', '')
    if h == '1806' or dutiable:
        levers.append('usmca')
    if quota and h == '1806':
        levers.append('in-quota')
    if 'D' in [x.strip() for x in special.replace('Free (', '').split(')')[0].split(',')] and dutiable:
        levers.append('agoa')
    if dutiable and any(k in special for k in ('PE', 'KR', 'SG', 'CO', 'CL', 'AU', 'P')):
        levers.append('fta')
    if h == '1806':
        levers.append('ingredients')
        if line['hts'].startswith('1806.20'):
            levers.append('bulk-block')
        levers += ['drawback', 'ruling']
    line['ruleIds'] = rules
    line['leverIds'] = levers
e['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations — not legal advice. Quota fill status changes daily and FDA can '
    'refuse or detain a shipment that fails its rules; check CBP and FDA before each shipment.'
)

# ---------------------------------------------------------------- finalConclusion
f = d['finalConclusion']
f['seo']['title'] = 'Cocoa & Chocolate Tariffs FAQ: Cocoa Beans, Canada, Belgian & Swiss Chocolate, HS Codes (HTS Ch. 18) | KoalaGains'
f['seo']['shortDescription'] = (
    'Answers to what people search about cocoa and chocolate tariffs: is there a tariff on cocoa beans or cocoa powder, chocolate from '
    'Canada, Belgium and Switzerland, the 2025 cocoa tariff exemption, HS codes for cocoa and chocolate, and where U.S. cocoa comes from.'
)
f['seo']['keywords'] = [
    'is there a tariff on cocoa beans',
    'is there a tariff on cocoa powder',
    'tariffs on chocolate from canada',
    'tariffs on belgian chocolate',
    'tariffs on swiss chocolate',
    'cocoa tariff exemption',
    'trump tariff cocoa',
    'hs code for cocoa powder',
    'hs code for chocolate',
    'where does the us get cocoa beans from',
    'mexico cocoa import duty',
    'cote d\'ivoire agoa cocoa exemptions',
]
f['intro'] = (
    'Straight answers to the most common questions about importing cocoa and chocolate into the U.S. — tariffs by product and country, '
    'HS codes and where the trade comes from. Each answer links to the page with the full detail.'
)
f['keyTakeaways'] = [
    'Cocoa beans, paste, butter and unsweetened powder (1801–1805) are Free or nearly free and exempt from the 2026 Section 301 and '
    'Brazil duties; only China pays an extra 7.5%.',
    'Chocolate (1806) pays a base rate (6% on most bars) and, since July 24, 2026, a Section 301 duty for 60 economies: 10% in total for '
    'the EU, 12.5% for Switzerland, +10% for the UK, +20% for China, +37.5% for Brazil.',
    'USMCA-qualifying chocolate from Canada and Mexico enters free, but Canada\'s free access on bulk chocolate and sweetened products '
    'is capped by quota. Côte d\'Ivoire and Ghana pay no extra duty and can claim AGOA through December 31, 2026.',
    'The 2025 IEEPA tariffs ended February 24, 2026; cocoa had already been exempted on November 13, 2025.',
]
f['questionSource'] = 'Google search suggestions collected October 11, 2026, plus the search terms the previous version of these pages targeted (for example "mexico cocoa import duty")'
f['faqs'] = [
    {
        'id': 'cocoa-beans',
        'question': 'Is there a tariff on cocoa beans?',
        'searchedAs': ['tariff on cocoa beans', 'is there a tariff on cocoa beans', 'us tariffs on cocoa beans', 'are there tariffs on cocoa beans'],
        'answer': (
            'No, for almost every country. Cocoa beans (1801.00) have a Free base rate and are on the exemption list of the 2026 Section 301 '
            'tariffs (U.S. note 52(b), 9903.05.86) and the Brazil tariff, so Ecuador, Côte d\'Ivoire, Ghana and every other supplier pay $0. '
            'Only beans from China pay 7.5% (Section 301 List 4A). The U.S. imported $2.82B of cocoa beans in 2025.'
        ),
        'link': 'industry-areas',
    },
    {
        'id': 'cocoa-powder',
        'question': 'Is there a tariff on cocoa powder?',
        'searchedAs': ['is there a tariff on cocoa powder', 'tariffs on cocoa powder', 'cocoa powder tariff'],
        'answer': (
            'Unsweetened cocoa powder (1805.00) pays 0.52¢/kg, which is Free with most FTA claims and AGOA, and it is exempt from the 2026 '
            'Section 301 duties. Sweetened cocoa powder is chocolate (1806.10): inside its quotas it pays Free or 10%, above them 21.7¢/kg '
            'or 33.6¢/kg, plus any Section 301 duty for the country.'
        ),
        'link': '',
    },
    {
        'id': 'canada-chocolate',
        'question': 'Are there tariffs on chocolate from Canada?',
        'searchedAs': ['tariffs on chocolate from canada', 'chocolate tariff canada'],
        'answer': (
            'Not on USMCA-qualifying chocolate: it enters free and is exempt from the 10% Section 301 duty on Canadian goods (9903.05.93). '
            'On bulk dairy and sugar chocolate lines, Canada\'s free access is capped by USMCA quotas (1,919 t in 2026 and 9,600 t a year). '
            'Chocolate that doesn\'t qualify pays its base rate plus 10%, for example 6% + 10% = 16% on unfilled bars. The 35% IEEPA duty '
            'ended on February 24, 2026. Canada shipped $3.07B of chocolate to the U.S. in 2025.'
        ),
        'link': 'industry-areas',
    },
    {
        'id': 'mexico-chocolate',
        'question': 'Is there an import duty on cocoa and chocolate from Mexico?',
        'searchedAs': ['mexico cocoa import duty', 'usmca cocoa origin rules', 'chocolate tariffs us'],
        'answer': (
            'USMCA-qualifying cocoa products and chocolate from Mexico enter free on every line, with no quota limit on the bulk chocolate '
            'lines (9823.08.01, 9823.10.01) and no Section 301 duty (9903.05.94). Goods that don\'t qualify pay the base rate, plus 10% on '
            'chocolate. Chocolate made in Mexico from imported cocoa paste or butter can qualify; cocoa butter pressed in Mexico from '
            'imported beans cannot. Mexico shipped $683M of chocolate in 2025.'
        ),
        'link': 'tariff-engineering',
    },
    {
        'id': 'eu-chocolate',
        'question': 'What is the tariff on Belgian or European chocolate?',
        'searchedAs': ['tariffs on belgian chocolate', 'us tariffs on chocolate', 'tariffs on chocolate', 'trump tariffs on chocolate'],
        'answer': (
            '10% of value since July 24, 2026. For EU products whose base rate is under 10%, the Section 301 action charges 10% in place '
            'of the base rate (9903.05.39), and chocolate bars are 5.6% or 6% at base. A $20,000 pallet of Belgian bars pays $2,000. The 15% '
            'reciprocal rate of 2025 ended on February 24, 2026.'
        ),
        'link': 'industry-areas',
    },
    {
        'id': 'swiss-chocolate',
        'question': 'What is the tariff on Swiss chocolate?',
        'searchedAs': ['tariffs on swiss chocolate', 'tariffs on lindt chocolate'],
        'answer': (
            '12.5% of value for chocolate made in Switzerland: the Section 301 action charges 12.5% in place of the base rate when the base '
            'rate is lower (9903.05.74), and the Swiss exception list names no chocolate. The rate follows the country where the chocolate '
            'was made, not the brand. The 39% IEEPA rate of 2025 ended on February 24, 2026.'
        ),
        'link': 'industry-areas',
    },
    {
        'id': 'exemption',
        'question': 'Did Trump exempt cocoa from tariffs?',
        'searchedAs': ['cocoa tariff exemption', 'trump tariff cocoa', 'cocoa tariffs trump', 'cocoa tariffs us'],
        'answer': (
            'Yes, cocoa but not chocolate. Executive Order 14360 exempted cocoa beans, shells, paste, butter and unsweetened powder from the '
            'reciprocal tariffs from November 13, 2025; chocolate kept paying until all IEEPA tariffs ended on February 24, 2026. The same '
            'cocoa lines were exempt from the 2026 Section 122 surcharge and are exempt from the 2026 Section 301 duties, which do apply '
            'to chocolate.'
        ),
        'link': 'tariff-updates',
    },
    {
        'id': 'hs-cocoa',
        'question': 'What are the HS codes for cocoa beans, cocoa powder and cocoa butter?',
        'searchedAs': ['hs code for cocoa powder', 'hs code for cocoa beans', 'hs code for cocoa butter', 'cocoa butter tariff code', 'cocoa powder tariff code', 'hs code for cocoa nibs', 'hs code for cocoa mass'],
        'answer': (
            'Cocoa beans, whole or broken (which includes cocoa nibs), are 1801.00; shells and husks 1802.00; cocoa paste or mass 1803 '
            '(1803.10 not defatted, 1803.20 defatted); cocoa butter 1804.00; cocoa powder without added sugar 1805.00. Sweetened cocoa '
            'powder is 1806.10. Organic beans and powder have their own 10-digit lines (1801.00.00.10, 1805.00.00.10).'
        ),
        'link': '',
    },
    {
        'id': 'hs-chocolate',
        'question': 'What is the HS code for chocolate?',
        'searchedAs': ['hs code for chocolate', 'hs code for chocolate bars', 'tariff code for chocolate', 'chocolate tariff code', 'hs code for chocolate candy'],
        'answer': (
            'Heading 1806. Chocolate bars and blocks are 1806.31 if filled (5.6%) and 1806.32 if not filled (most at 6%); chocolate candy '
            'and other preparations not in bars are 1806.90 (mostly 6%); bulk chocolate over 2 kg is 1806.20 (Free in blocks of 4.5 kg or '
            'more); sweetened cocoa powder is 1806.10. Products with more sugar, butterfat or milk solids fall on quota lines.'
        ),
        'link': '',
    },
    {
        'id': 'where-from',
        'question': 'Where does the U.S. get its cocoa and chocolate from?',
        'searchedAs': ['where does the us get cocoa beans from', 'where does the us get most of its cocoa', 'where does the us get most of its chocolate', 'us cocoa imports by country', 'us chocolate imports by country'],
        'answer': (
            'Cocoa beans mostly come from Ecuador ($965M in 2025), Côte d\'Ivoire ($728M) and Ghana ($439M); cocoa butter from Indonesia and '
            'Malaysia; cocoa powder from the Netherlands. Chocolate mostly comes from Canada ($3.07B) and Mexico ($683M), then Belgium and '
            'Germany. In total the U.S. imported $13.32B of Chapter 18 goods in 2025, up from $8.25B in 2024.'
        ),
        'link': 'understand-industry',
    },
    {
        'id': 'ivory-coast',
        'question': 'Is there a tariff on cocoa and chocolate from Côte d\'Ivoire (Ivory Coast)?',
        'searchedAs': ['tariff on cocoa', 'us tariff on cocoa', 'is there a tariff on cocoa', 'cote d\'ivoire agoa cocoa exemptions'],
        'answer': (
            'Côte d\'Ivoire is not one of the 60 economies in the 2026 Section 301 action, so it pays only base rates: Free on beans, paste '
            'and butter, and Free under AGOA on cocoa powder and most non-quota chocolate lines (AGOA runs through December 31, 2026). The 15% '
            'IEEPA reciprocal duty ended on February 24, 2026; cocoa had been exempt from it since November 13, 2025.'
        ),
        'link': 'industry-areas',
    },
]

json.dump(d, open(PATH, 'w'), ensure_ascii=False, indent=2)
print('ok')
