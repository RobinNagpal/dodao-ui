#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 33 content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill33.py <generated.json> <out.json>
Re-runnable: every regeneration of the data parts is followed by this script.

Generate with:
  pnpm tariff:generate-chapter --chapter 33 --slug 33-essential-oils-and-cosmetics \
    --title "Essential Oils and Resinoids; Perfumery, Cosmetic or Toilet Preparations" \
    --countries FR,IE,KR,IT,CA,MX,CN,ES,AE,GB,IN,DE,JP,BR,CH --out gen.json --force
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU, use_measures_fr_urls  # noqa: E402,F401

import glob
import json
import sys
from collections import OrderedDict

SRC, OUT = sys.argv[1], sys.argv[2]
WT = IU

d = json.load(open(SRC))

# Official sources already used (and checked) in other chapter files, by id.
REF_SOURCES = {}
for f in sorted(glob.glob(f'{WT}/src/tariff-data/chapters/*.json')):
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            REF_SOURCES.setdefault(s['id'], s)

HTS_NOW_URL = 'https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_21_json.json'
CH33_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2033'
CH30_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2030'
CH98_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
CH99_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
GN_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
USC21_COS = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title21/html/USCODE-2024-title21-chap9-subchapVI.htm'
USC21_381 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title21/html/USCODE-2024-title21-chap9-subchapVIII-sec381.htm'
USC21_355H = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title21/html/USCODE-2024-title21-chap9-subchapV-partA-sec355h.htm'
USC26_5001 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title26/html/USCODE-2024-title26-subtitleE-chap51-subchapA-partI-subpartA-sec5001.htm'
FDA_MOCRA = 'https://www.fda.gov/cosmetics/cosmetics-laws-regulations/modernization-cosmetics-regulation-act-2022-mocra'
FDA_REG = 'https://www.fda.gov/cosmetics/registration-listing-cosmetic-product-facilities-and-products'
FDA_IMPORTERS = 'https://www.fda.gov/cosmetics/cosmetics-international-activities/cosmetics-importers'
FDA_IMPORTING = 'https://www.fda.gov/industry/importing-fda-regulated-products/importing-cosmetics'
FDA_DRUG_OR_COS = 'https://www.fda.gov/cosmetics/cosmetics-laws-regulations/it-cosmetic-drug-or-both-or-it-soap'
FDA_LABEL_GUIDE = 'https://www.fda.gov/cosmetics/cosmetics-labeling-regulations/cosmetics-labeling-guide'
FDA_COLOR_CERT = 'https://www.fda.gov/industry/color-additives/color-certification'
FDA_IA_COS = 'https://www.accessdata.fda.gov/cms_ia/industry_53.html'
FDA_FRAGRANCE = 'https://www.fda.gov/cosmetics/cosmetic-ingredients/fragrances-cosmetics'


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
# Trade figures (from the generated understandIndustry / tradeSnapshot)
# ---------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
Y = ui['latestYear']
PY = ui['priorYear']
year_tot = {r['year']: r['totalUsd'] for r in ui['byYear']}
total, prior_total = year_tot[Y], year_tot[PY]
by_c = {c['country']: c for c in ui['byCountry']}
by_line = {x['hs6']: x for x in ui['byLine']}
by_hc = {(x['heading'], x['country']): x['importsUsd'] for x in ui['byHeadingCountry']}
trade = json.load(open(f'{WT}/src/tariff-data/trade/chapter-33.json'))
by_c_all = {c['country']: c for c in trade['byCountry']}


def imp(country):
    c = by_c_all.get(country)
    return c['importsUsd'] if c else 0


def imp_year(country, year):
    c = by_c_all.get(country)
    return c['byYear'].get(str(year), 0) if c else 0


def chg(country):
    c = by_c_all[country]
    return round((c['importsUsd'] / c['priorImportsUsd'] - 1) * 100, 1)


# ---------------------------------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------------------------------
NEW_SOURCES = {
    'hts-ch33': {
        'id': 'hts-ch33',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 33',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 33: Essential Oils and Resinoids; Perfumery, '
        'Cosmetic or Toilet Preparations',
        'signed': None,
        'published': '2026-10-07',
        'url': CH33_PDF,
    },
    'eo-14345': {
        'id': 'eo-14345',
        'publisher': 'Federal Register',
        'citation': '90 FR 43535',
        'document': 'Executive Order 14345',
        'title': 'Implementing the United States-Japan Agreement',
        'signed': '2025-09-04',
        'published': '2025-09-09',
        'url': 'https://www.federalregister.gov/documents/2025/09/09/2025-17389/implementing-the-united-states-japan-agreement',
    },
    'ita-kr-deal': {
        'id': 'ita-kr-deal',
        'publisher': 'Federal Register',
        'citation': '90 FR 55964',
        'document': 'Notice (USTR / Commerce)',
        'title': 'Implementing Certain Tariff-Related Elements of the U.S.-Korea Strategic Trade and Investment Deal',
        'signed': None,
        'published': '2025-12-04',
        'url': 'https://www.federalregister.gov/documents/2025/12/04/2025-21940/implementing-certain-tariff-related-elements-of-the-us-korea-strategic-trade-and-investment-deal',
    },
    'ita-ch-deal': {
        'id': 'ita-ch-deal',
        'publisher': 'Federal Register',
        'citation': '90 FR 59281',
        'document': 'Notice (USTR / Commerce)',
        'title': 'Implementing Certain Tariff-Related Elements of the Framework for a United States-Switzerland-Liechtenstein Agreement on Fair, '
        'Balanced, and Reciprocal Trade',
        'signed': None,
        'published': '2025-12-18',
        'url': 'https://www.federalregister.gov/documents/2025/12/18/2025-23316/implementing-certain-tariff-related-elements-of-the-framework-for-a-united-states-switzerland-liechtenstein',
    },
    'procl-10947': {
        'id': 'procl-10947',
        'publisher': 'Federal Register',
        'citation': '90 FR 24199',
        'document': 'Proclamation 10947',
        'title': 'Adjusting Imports of Aluminum and Steel Into the United States',
        'signed': '2025-06-03',
        'published': '2025-06-09',
        'url': 'https://www.federalregister.gov/documents/2025/06/09/2025-10524/adjusting-imports-of-aluminum-and-steel-into-the-united-states',
    },
    'procl-11021': {
        'id': 'procl-11021',
        'publisher': 'Federal Register',
        'citation': '91 FR 18201',
        'document': 'Proclamation 11021',
        'title': 'Strengthening Actions Taken To Adjust Imports of Aluminum, Steel, and Copper Into the United States',
        'signed': '2026-04-02',
        'published': '2026-04-09',
        'url': 'https://www.federalregister.gov/documents/2026/04/09/2026-06960/strengthening-actions-taken-to-adjust-imports-of-aluminum-steel-and-copper-into-the-united-states',
    },
    'fda-talc-withdrawal': {
        'id': 'fda-talc-withdrawal',
        'publisher': 'Federal Register',
        'citation': '90 FR 54603',
        'document': 'Proposed rule; withdrawal (FDA)',
        'title': 'Testing Methods for Detecting and Identifying Asbestos in Talc-Containing Cosmetic Products; Withdrawal',
        'signed': None,
        'published': '2025-11-28',
        'url': 'https://www.federalregister.gov/documents/2025/11/28/2025-21407/testing-methods-for-detecting-and-identifying-asbestos-in-talc-containing-cosmetic-products',
    },
    'fda-reg-compliance': {
        'id': 'fda-reg-compliance',
        'publisher': 'Federal Register',
        'citation': '88 FR 77323',
        'document': 'Notice (FDA guidance)',
        'title': 'Compliance Policy for Cosmetic Product Facility Registration and Cosmetic Product Listing; Guidance for Industry; Availability',
        'signed': None,
        'published': '2023-11-09',
        'url': 'https://www.federalregister.gov/documents/2023/11/09/2023-24731/compliance-policy-for-cosmetic-product-facility-registration-and-cosmetic-product-listing-guidance',
    },
    'fda-mocra': {
        'id': 'fda-mocra',
        'publisher': 'FDA',
        'citation': 'FDA web page (content current as of August 10, 2026)',
        'document': 'FDA web page',
        'title': 'Modernization of Cosmetics Regulation Act of 2022 (MoCRA)',
        'signed': None,
        'published': '2026-08-10',
        'url': FDA_MOCRA,
    },
    'fda-reg-listing': {
        'id': 'fda-reg-listing',
        'publisher': 'FDA',
        'citation': 'FDA web page (content current as of September 9, 2026)',
        'document': 'FDA web page',
        'title': 'Registration & Listing of Cosmetic Product Facilities and Products',
        'signed': None,
        'published': '2026-09-09',
        'url': FDA_REG,
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
d['chapter']['title'] = 'Essential Oils and Resinoids; Perfumery, Cosmetic or Toilet Preparations'
SHORT = 'Essential Oils, Perfumes & Cosmetics'

GROUP_LABELS = {
    '3301': ('Essential oils, resinoids & extracted oleoresins', 'Essential oils'),
    '3302': ('Fragrance & flavor mixtures (incl. beverage flavor bases)', 'Fragrance & flavor mixes'),
    '3303': ('Perfumes & toilet waters', 'Perfumes'),
    '3304': ('Makeup, skin care, sunscreen & nail preparations', 'Makeup & skin care'),
    '3305': ('Hair preparations (shampoo, perms, hair spray)', 'Hair care'),
    '3306': ('Oral & dental hygiene (toothpaste, floss, mouthwash)', 'Oral care'),
    '3307': ('Shaving, deodorants, bath, room fragrance & other toiletries', 'Deodorant, shaving & other'),
}

BLURBS = {
    '3301': (
        'Most essential oils are Free — lavender, rosemary, patchouli, sandalwood, tea tree and the rest of 3301.29.51, plus other mints, '
        'bergamot and lime. Orange and grapefruit oil pay 2.7%, lemon oil and extracted oleoresins (paprika, black pepper) 3.8%, peppermint oil '
        '4.2%, eucalyptus 1.8% and orris 1.1%.',
        ['lavender oil', 'tea tree oil', 'peppermint oil', 'orange oil', 'lemon oil', 'eucalyptus oil', 'rosemary oil', 'sandalwood oil', 'oleoresin', 'resinoid'],
    ),
    '3302': (
        'Fragrance compounds and flavor bases used to make other products. Beverage flavor concentrates (3302.10) are Free unless they contain '
        'over 20% alcohol and need only alcohol or water added (8.4¢/kg + 1.9% or 17¢/kg + 1.9%). Perfume oil blends and industrial fragrance '
        'mixtures (3302.90) are Free.',
        ['fragrance oil', 'perfume oil blend', 'fragrance compound', 'flavor concentrate', 'soft drink concentrate', 'beverage flavoring'],
    ),
    '3303': (
        'Perfume, eau de parfum, eau de toilette and cologne: every line is Free at the base rate. What a bottle pays comes from the extra duty '
        'for its origin — 10% in total from France, Italy or Spain, 12.5% from the UAE or Switzerland.',
        ['perfume', 'eau de parfum', 'eau de toilette', 'cologne', 'body mist', 'attar', 'floral water', 'rose water'],
    ),
    '3304': (
        'Lipstick, mascara, foundation, face powder, nail polish, moisturizers, serums, sheet masks and sunscreen: all Free at the base rate. '
        'The 2026 Section 301 duty sets the cost — 12.5% in total for Korean and Japanese skin care, 10% for EU makeup.',
        ['lipstick', 'mascara', 'foundation', 'nail polish', 'face cream', 'serum', 'sheet mask', 'sunscreen', 'petroleum jelly', 'K-beauty'],
    ),
    '3305': (
        'Shampoo, perms and relaxers, hair spray (lacquer) and other hair products (conditioner, hair oil, styling gel, hair dye) are Free at the '
        'base rate.',
        ['shampoo', 'conditioner', 'hair spray', 'hair dye', 'hair oil', 'hair gel', 'relaxer'],
    ),
    '3306': (
        'Toothpaste, dental floss and mouthwash or denture products are Free at the base rate.',
        ['toothpaste', 'dental floss', 'mouthwash', 'denture adhesive', 'whitening strips'],
    ),
    '3307': (
        'The only cosmetic heading with base duties: shaving products and deodorants 4.9%, bath salts 5.8%, other bath products 4.9%, incense '
        '(agarbatti) 2.4%, room fragrance and reed diffusers 6%, and depilatories, contact lens solution and pet shampoos 5.4%.',
        ['deodorant', 'antiperspirant', 'shaving cream', 'aftershave', 'bath salts', 'bath bomb', 'incense', 'room spray', 'reed diffuser', 'hair removal cream'],
    ),
}

ov = d['overview']
ov['h1'] = f'HTS Chapter 33: {SHORT} — Tariff Rates'
for g in ov['productGroups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['blurb'], g['searchExamples'] = BLURBS[g['heading']]

# ---------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------
ov['seo']['title'] = 'HTS Chapter 33 Tariffs 2026: Perfume, Cosmetics & Essential Oil Import Duty Rates by Country | KoalaGains'
ov['seo']['shortDescription'] = (
    'Searchable 2026 U.S. tariff table for all 74 HTS Chapter 33 lines — essential oils, perfume, makeup, skin care, shampoo, toothpaste, '
    'deodorant. Base rates plus the Section 301 duty by country: 10% for French and EU cosmetics, 12.5% for Korean skincare, more for China.'
)
ov['seo']['keywords'] = [
    'hts chapter 33',
    'essential oils and resinoids; perfumery, cosmetic or toilet preparations tariff',
    'cosmetics hs code',
    'tariffs on cosmetics',
    'tariff on french perfume',
    'tariffs on korean skincare',
    'south korean beauty import tariffs',
    'hs code for perfume',
    'hs code for essential oils',
    'usmca cosmetic trade exceptions',
]

c1, c2, c3 = ui['byCountry'][0], ui['byCountry'][1], ui['byCountry'][2]
ov['intro'] = (
    'Chapter 33 covers essential oils, fragrance and flavor bases, perfume, makeup and skin care, hair care, toothpaste and other toiletries. '
    'Its **74 tariff lines** are mostly duty-free: **every perfume, makeup, skin-care, hair and oral-care line is Free** at the base rate, and '
    'only 19 lines — some essential oils, two alcoholic flavor bases and the deodorant, shaving, bath and room-fragrance lines of 3307 — carry '
    'a base duty, from 1.1% to 6%.\n\n'
    f'The U.S. imported **{fmt_usd(total)}** of these goods in {Y}. France ({fmt_usd(c1["importsUsd"])}, mostly perfume), Ireland '
    f'({fmt_usd(c2["importsUsd"])}, mostly beverage flavor concentrates) and South Korea ({fmt_usd(c3["importsUsd"])}, mostly skin care) were '
    'the largest suppliers. What an importer pays now comes from the **extra duty by country**: since July 24, 2026 a Section 301 tariff on 60 '
    'economies — **10% in total for the EU**, **12.5% in total for South Korea, Japan and Switzerland**, +10% or +12.5% for most others, '
    '+20% or +37.5% for China and +37.5% for Brazil. USMCA-qualifying goods from Mexico pay nothing extra; Canadian essential oils, flavor bases, '
    'alcohol-based perfume, lip, eye and nail makeup and some hair products also owe a **50% Section 338 duty that applies even under USMCA**. '
    'At entry, **FDA** checks labels, color additives and drug claims, and since MoCRA the foreign plant must be registered and each product '
    'listed.'
)

ov['workedExamples'] = [
    {
        'title': 'Eau de parfum from France',
        'line': '3303.00.30.00',
        'body': 'Perfume containing alcohol has a Free base rate. For EU goods with a base rate under 10%, the 2026 Section 301 action charges 10% '
        'in total (9903.05.39), so a $100,000 shipment pays **$10,000**. No FDA prior notice is needed for cosmetics, but the label must meet FDA '
        'cosmetic labeling rules, the product must be listed with FDA by the responsible person, and alcohol-based perfume ships as a Class 3 '
        'flammable liquid under DOT hazardous-materials rules.',
    },
    {
        'title': 'Korean skin care (serums, creams, sheet masks)',
        'line': '3304.99.50.00',
        'body': 'Free at the base rate (and Free under KORUS). South Korea pays 12.5% in total when the base rate is lower (9903.05.71), so a '
        '$50,000 shipment of serums and creams pays **$6,250**. A sunscreen in the same shipment is an over-the-counter drug in the U.S.: '
        'same tariff line, but its Korean maker must be registered with FDA as a drug establishment and the product must meet the OTC sunscreen '
        'monograph.',
    },
    {
        'title': 'Lipstick from Canada',
        'line': '3304.10.00.00',
        'body': 'Lipstick is Free and USMCA-qualifying goods are exempt from the 10% Section 301 duty (9903.05.93). But 3304.10.00 is on the '
        'Section 338 list in U.S. note 51(b)(3) (9903.03.14), and that 50% applies even when USMCA is claimed: **$50,000** on a $100,000 '
        'shipment. A non-qualifying shipment pays 10% + 50% = 60%. Canadian skin care (3304.99) and toothpaste are not on the list, so '
        'USMCA-qualifying goods there pay nothing.',
    },
    {
        'title': 'Deodorant from China',
        'line': '3307.20.00.00',
        'body': 'The base rate is 4.9%. China pays +12.5% under the 2026 Section 301 action (9903.05.31) and +25% because 3307.20.00 is on List 3 '
        '(9903.88.03): **42.4%** in total, $4,240 on a $10,000 order. From the EU the same deodorant pays 10% in total; from Mexico under USMCA, '
        'nothing.',
    },
]

snap = ov['tradeSnapshot']
snap['effectiveDutyRateNote'] = 'Duty-collected figures aren’t available from an official source yet.'
snap['totalDutyCollectedUsd'] = None
snap['source'] = f'UN Comtrade, United States imports, HS chapter 33 ({Y})'
snap['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar {Y} — before the '
    '2026 tariff changes.'
)

ov['notes']['chapterNotes'] = (
    '**Note 1.** This chapter does not cover: (a) natural oleoresins or vegetable extracts of heading 1301 or 1302; (b) soap or other products '
    'of heading 3401; or (c) gum, wood or sulfate turpentine or other products of heading 3805.\n\n'
    '**Note 2.** The expression "odoriferous substances" in heading 3302 refers only to the substances of heading 3301, to odoriferous '
    'constituents isolated from those substances or to synthetic aromatics.\n\n'
    '**Note 3.** Headings 3303 to 3307 apply, inter alia, to products, whether or not mixed (other than aqueous distillates and aqueous '
    'solutions of essential oils), suitable for use as goods of these headings and put up in packings of a kind sold by retail for such use.\n\n'
    '**Note 4.** The expression "perfumery, cosmetic or toilet preparations" in heading 3307 applies, inter alia, to the following products: '
    'scented sachets; odoriferous preparations which operate by burning; perfumed papers and papers impregnated or coated with cosmetics; '
    'contact lens or artificial eye solutions; wadding, felt and nonwovens, impregnated, coated or covered with perfume or cosmetics; animal '
    'toilet preparations.'
)
ov['notes']['additionalUsNotes'] = None

for s in ov['stats']:
    if s['label'] == 'Lines with an extra duty for some origins':
        s['note'] = (
            'Section 301 (2026, 60 economies): 74; China lists: 72; Brazil: 72; Canada Section 338: 50 (also on USMCA goods); Russian '
            'aluminum (Section 232): 14'
        )

# ---------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['h1'] = f'HTS Chapter 33: {SHORT} — Tariff Updates'
tu['seo'] = {
    'title': 'HTS Chapter 33 Tariff Updates 2026: Cosmetics, Perfume & K-Beauty Duties Since January 2025 | KoalaGains',
    'shortDescription': 'What changed for HTS Chapter 33 — perfume, cosmetics, skin care, essential oils — since January 2025: the end of the '
    'IEEPA and Section 122 duties, the 2026 Section 301 tariffs (10% EU, 12.5% Korea and Japan), Canada Section 338 and China lists, with '
    'Federal Register citations.',
    'keywords': [
        'hts chapter 33 tariff updates',
        'hts chapter 33 import duty',
        'france tariff on essential oils and resinoids; perfumery, cosmetic or toilet preparations',
        'korean beauty tariffs',
        'korus agreement skincare tariffs',
        'canada usmca cosmetics import duty',
        'section 338 canada tariffs',
        'section 232 cosmetic packaging duties',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 '
    'Revision 21** (in force October 9, 2026). **No Chapter 33 base rate changed**: all 74 lines carry the same General, Special and Column 2 '
    'rates.\n\n'
    'Everything that changed sits on top of the base rate. In 2025 the IEEPA duties reached cosmetics from every country — 15% in total for EU '
    'and Japanese goods from August 2025 and for Korean goods from November 2025, more for China and India — and from August 2025 aerosol and other listed Chapter 33 products also paid '
    'the Section 232 aluminum duty on their aluminum content. The IEEPA duties **ended on February 24, 2026**, the 10% Section 122 surcharge '
    'that replaced them expired on July 23, 2026, and the aluminum duty was narrowed on April 6, 2026 to Russian aluminum only. Since **July '
    '24, 2026** goods from 60 economies pay a **Section 301 tariff**: 10% in total for the EU, 12.5% in total for South Korea, Japan and '
    'Switzerland, +10% or +12.5% for the rest. China also pays its older Section 301 lists (+25% on perfume, makeup, skin, hair and most '
    'oral-care products). Since **August 22, 2026** twenty Chapter 33 subheadings from Canada pay a **50% Section 338 duty**, even under USMCA.'
)
tu['scope'] = (
    'Measures that reach Chapter 33 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 tariff, the China '
    'Section 301 lists, the Canada Section 338 duties, the Section 232 duty on Russian aluminum, and the 2025–2026 IEEPA, Section 122 and '
    'aluminum-derivative duties that have ended. FDA (MoCRA) milestones are listed for reference. For the rate each supplier pays, see Rates by '
    'country.'
)

RELIGIOUS = (
    'Non-citrus essential oils of 3301.29.51 imported for religious purposes only are exempt by description (U.S. note 52(c), 9903.05.87). '
)
NO_52B = 'No Chapter 33 line is on the general exemption list (note 52(b)). '
CA338_LINES = (
    '3301.12.00, 3301.13.00, 3301.19.10, 3301.19.51, 3301.24.00, 3301.25.00, 3301.29.10, 3301.29.20, 3301.29.51, 3301.30.00, 3301.90.10, '
    '3301.90.50, 3302.10.10–3302.10.90, 3303.00.30, 3304.10.00, 3304.20.00, 3304.30.00 and 3305.90.00'
)

IN_EFFECT_TEXT = {
    'European Union': (
        'For EU goods whose base rate (or its ad valorem equivalent) is under 10%, the total is 10% (9903.05.39); at or above 10%, nothing is '
        'added (9903.05.38, U.S. note 52(k)). Every Chapter 33 line is under 10%, so EU perfume, makeup and skin care pay 10% of value. '
        + NO_52B + RELIGIOUS + 'The EU country list in note 52(j)(2) has no Chapter 33 line. This replaced the 15%-in-total IEEPA rate '
        '(9903.02.20), which ended February 24, 2026.',
        'French, Italian, Spanish or Irish perfume, cosmetics and flavor concentrates pay 10% of value — $10,000 on a $100,000 shipment — '
        'instead of 15% in 2025 and Free before that.',
    ),
    'South Korea': (
        'For Korean goods whose rate (or its ad valorem equivalent) is under 12.5%, the total is 12.5% (9903.05.71); at or above, nothing is '
        'added (U.S. note 52(k)). A KORUS claim (KR) makes the dutiable lines Free but the 12.5% total still applies (note '
        '52(a)). ' + NO_52B + 'This replaced the reciprocal tariff, 15% in total from November 14, 2025, which ended February 24, 2026.',
        'Korean skin care, makeup, sheet masks and sunscreen pay 12.5% of value — $1,250 on a $10,000 order.',
    ),
    'Canada': (
        'Two measures. The 2026 Section 301 duty (+10%, 9903.05.29) does not apply to USMCA-qualifying goods (9903.05.93). The Section 338 '
        'duty (+50%, from August 22, 2026) applies to products of Canada in 20 Chapter 33 subheadings — ' + CA338_LINES + ' — under 9903.03.14, '
        'plus 3301.19.10 under 9903.03.12 and 3301.24.00 under 9903.03.13, and U.S. note 51(a) says it applies even when USMCA or another special '
        'rate is claimed. Skin care (3304.91, 3304.99), shampoo, hair spray, toothpaste, floss, mouthwash, 3307 toiletries, non-alcoholic '
        'perfume and 3302.90 fragrance mixtures are not on the lists. The September 29, 2026 Canadian import bans name no Chapter 33 line. '
        'The 35% IEEPA duty on non-USMCA goods (9903.01.10) ended February 24, 2026.',
        'A USMCA-qualifying lipstick, mascara, nail polish, essential oil or beverage flavor base from Canada pays 50%; non-qualifying goods pay '
        '60% (or 10% plus the base rate on lines not on the 338 lists). USMCA skin care and toothpaste from Canada pay nothing.',
    ),
    'Mexico': (
        'USMCA-qualifying goods pay no Section 301 duty (9903.05.94); others pay +10% (9903.05.55). ' + NO_52B + 'The 25% IEEPA duty on '
        'non-USMCA goods (9903.01.01) ended February 24, 2026.',
        'USMCA-qualifying shampoo, toothpaste, deodorant or makeup from Mexico pays nothing; non-qualifying goods pay the base rate plus 10%.',
    ),
    'China': (
        'Two Section 301 duties stack: +12.5% under the 2026 action (9903.05.31) and an older one — +25% under List 3 (9903.88.03) for lemon '
        'oil (3301.13), fragrance mixtures (3302.90), perfume (3303), makeup and skin care (3304), hair preparations (3305), mouthwash and other '
        'oral care (3306.90) and all of 3307; or +7.5% under List 4A (9903.88.15) for the other essential oils, beverage flavor bases (3302.10) '
        'and dental floss. Toothpaste (3306.10.00) and eucalyptus oil (3301.29.10, on the suspended List 4B) pay no older duty. No China '
        'exclusion in effect (note 20(vvv)–(www)) names a Chapter 33 product. The IEEPA duties on China ended February 24, 2026.',
        'Chinese makeup, skin care and perfume pay 37.5%, deodorant 42.4% (4.9% + 12.5% + 25%), most essential oils 20% plus their base rate, '
        'toothpaste 12.5%.',
    ),
    'United Arab Emirates': (
        'Base rate + 12.5% (9903.05.80). ' + NO_52B + RELIGIOUS + 'The 10% IEEPA reciprocal duty ended February 24, 2026.',
        'Perfume and oud fragrances from the UAE (Free base) pay 12.5% of value; room fragrance (6%) pays 18.5%.',
    ),
    'United Kingdom': (
        'Base rate + 10% (9903.05.81). ' + NO_52B + 'The UK exception list (note 52(j)(1), 9903.05.96) has no Chapter 33 line. The 10% '
        'IEEPA reciprocal duty ended February 24, 2026.',
        'UK cosmetics and perfume pay 10%; deodorants and shaving products 14.9%.',
    ),
    'India': (
        'Base rate + 10% (9903.05.44). ' + NO_52B + RELIGIOUS + 'The IEEPA duties on India (25% reciprocal plus 25% from August 27, 2025) '
        'ended in February 2026.',
        'Indian essential oils pay 10% plus their base rate (11.8% for eucalyptus, 10% for Free oils); incense (agarbatti, 2.4%) pays 12.4%.',
    ),
    'Japan': (
        'For Japanese goods whose rate (or its ad valorem equivalent) is under 12.5%, the total is 12.5% (9903.05.49); at or above, nothing is '
        'added (U.S. note 52(k)). ' + NO_52B + 'This replaced the 15%-in-total IEEPA rate (in force from August 7, 2025), which ended February 24, '
        '2026.',
        'Japanese skin care, sunscreen and makeup pay 12.5% of value.',
    ),
    'Brazil': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 (9903.05.27). The '
        'Brazil exemption list (U.S. note 50(a)(ii), 9903.05.03) covers orange oil (3301.12.00) and other 3301.90.50 products, and religious-use '
        'essential oils are exempt by description (9903.05.04); orange oil and 3301.90.50 still pay the 12.5%.',
        'Brazilian orange oil pays 15.2% (2.7% + 12.5%); cosmetics and perfume pay 37.5%.',
    ),
    'Switzerland': (
        'For Swiss goods whose rate (or its ad valorem equivalent) is under 12.5%, the total is 12.5% (9903.05.74). The Switzerland exception '
        'list (note 52(j)(3), 9903.05.98) exempts 3301.19.51 (bergamot, lime and other citrus oils), 3301.29.10 (eucalyptus) and 3301.30.00 '
        '(resinoids). This replaced the reciprocal tariff, 15% in total from November 14, 2025, which ended February 24, 2026.',
        'Swiss perfume, fragrance compounds and cosmetics pay 12.5% of value; the three listed essential-oil lines pay only their base rate.',
    ),
    'Russia': (
        'Russia pays column 2 rates (general note 3(b)) — 75% on most cosmetics — plus +12.5% (9903.05.66). The 14 Chapter 33 subheadings on '
        'the aluminum-derivative list (note 19(k): perfume, nail preparations, other skin care, shampoo, hair spray, other hair and oral-care '
        'products, shaving products, deodorants, room fragrance and 3307.90) also pay +200% under 9903.85.68 — and that heading also reaches '
        'goods of any country made with aluminum smelted or cast in Russia (U.S. note 19(m)(B)).',
        'Russian cosmetics are effectively priced out: column 2 plus 12.5%, and plus 200% for aerosol and other listed products.',
    ),
}
OTHER_TEXT = (
    'Rates by country: Taiwan 10% in total (9903.05.76); Vietnam, Thailand, Turkey, Israel, Australia and others +12.5%; Malaysia, '
    'Indonesia, Argentina and others +10%. ' + NO_52B + RELIGIOUS + 'Country exception lists in U.S. note 52(j) exempt 3301.19.51, 3301.29.10 '
    'and/or 3301.30.00 for Cambodia, Guatemala, El Salvador, Argentina, Taiwan, Indonesia, Ecuador and Jordan. Countries outside the 60 '
    'economies pay no extra duty.',
    'Cosmetics from Vietnam pay 12.5%, from Taiwan 10% in total; from a country outside the 60 only the base rate.',
)
for e in tu['inEffect']:
    key = e['country']
    if key in IN_EFFECT_TEXT:
        e['exemption'], e['whatItMeans'] = IN_EFFECT_TEXT[key]
    elif key.startswith('Other'):
        e['country'] = 'Other Section 301 economies (incl. Taiwan, Vietnam, Thailand, Turkey, Israel, Australia, Malaysia, Indonesia)'
        e['exemption'], e['whatItMeans'] = OTHER_TEXT
    if e['country'] == 'European Union':
        e['measure'] = 'Section 301 tariff (forced-labor investigations), EU rate'
    elif e['country'] == 'Canada':
        e['measure'] = 'Section 301 tariff (non-USMCA goods) + Section 338 duty (all goods on the lists)'
        e['now'] = '+10% (non-USMCA); +50% on 20 subheadings, USMCA or not'
    elif e['country'] == 'China':
        e['measure'] = 'Section 301 tariffs: 2026 action plus List 3 or List 4A'
    elif e['country'] == 'Brazil':
        e['measure'] = 'Section 301 tariffs: Brazil action plus 2026 forced-labor action'
    elif e['country'] == 'Russia':
        e['measure'] = 'Section 301 tariff + Section 232 duty on Russian aluminum (14 subheadings)'
    elif e['measure'] == 'Section 301 (2026, 60 economies)':
        e['measure'] = 'Section 301 tariff (forced-labor investigations)'

CHANGE_DETAIL = {
    'section-338-canada-2026-08-22': (
        'Canada Section 338 duties take effect on 20 Chapter 33 subheadings',
        '50% on listed products of Canada after a 3-day suspension lapsed. Chapter 33 is on all three lists: 3301.19.10 (9903.03.12), '
        '3301.24.00 (9903.03.13) and 18 more subheadings on the motor-vehicle list (9903.03.14) — the other essential oils, beverage flavor '
        'bases, alcohol-based perfume, lip, eye and nail makeup and other hair preparations. Unlike the Section 301 duty, it applies to '
        'USMCA-qualifying goods too (U.S. note 51(a)).',
    ),
    'section-301-2026-60-economies-2026-07-24': (
        'Section 301 tariffs on 60 economies cover all of Chapter 33',
        '10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). No Chapter 33 line is on the general exemption list (note 52(b)); '
        'religious-use essential oils are exempt by description (note 52(c)). EU goods pay 10% in total; South Korea, Japan and Switzerland '
        '12.5% in total. USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94).',
    ),
    'section-301-brazil-2026-07-22': (
        'Section 301 tariff on products of Brazil',
        '25% on all goods of Brazil (9903.05.01). Chapter 33 has two subheadings on the exemption list (U.S. note 50(a)(ii)) — orange oil '
        '(3301.12.00) and 3301.90.50 — plus religious-use essential oils by description. From July 24 the 12.5% forced-labor tariff '
        '(9903.05.27) is added on top.',
    ),
    'section-301-nicaragua-scheduled-2027-01-01': (
        'Scheduled: Section 301 tariff on products of Nicaragua',
        'Products of Nicaragua that pay the column 1-general rate (that is, not entered under CAFTA-DR) will pay +10% (9903.89.01) from January '
        '1, 2027 and +15% from January 1, 2028. Today Nicaragua pays the 12.5% 2026 Section 301 duty (9903.05.58).',
    ),
    'section-232-aluminum-russia-2025-08-18': (
        'Fourteen Chapter 33 subheadings added to the aluminum-derivative list',
        'Commerce added 3303.00.10–.30, 3304.30.00, 3304.99.50, 3305.10.00, 3305.30.00, 3305.90.00, 3306.90.00, 3307.10.10, 3307.10.20, '
        '3307.20.00, 3307.49.00 and 3307.90.00 to the Section 232 aluminum-derivative list (note 19(k)). From every country they paid 50% '
        '(25% for the UK) on the value of their aluminum content (9903.85.08, 9903.85.15; Proclamation 10947) until April 6, 2026; products of Russia, or made with aluminum '
        'smelted or cast in Russia, pay 200% (9903.85.68), and still do.',
    ),
}
for c in tu['changes']:
    if c['id'] in CHANGE_DETAIL:
        c['title'], c['detail'] = CHANGE_DETAIL[c['id']]
    if c['id'] == 'section-232-aluminum-russia-2025-08-18':
        c['now'] = '+50% of aluminum content (ended April 6, 2026); Russia +200%'
        c['countries'] = 'All (Russia only since April 6, 2026)'
        for sid in ('procl-10947',):
            if sid not in c['sourceIds']:
                c['sourceIds'].insert(0, sid)
    if c['id'] == 'base-rates':
        c['title'] = 'No Chapter 33 base-rate changes'
        c['detail'] = (
            'All 74 Chapter 33 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition, and no '
            'line was added, split or renumbered.'
        )

EXTRA_CHANGES = [
    {
        'id': 'cn-301-continue',
        'type': 'reference',
        'date': '2026-10-07',
        'dateLabel': 'Published',
        'title': 'China Section 301 lists continue after the four-year review notice',
        'detail': 'USTR announced that the 2018 China Section 301 actions did not terminate on their 2026 anniversaries because domestic '
        'industries asked for them to continue. For Chapter 33 this keeps +25% (List 3) on perfume, makeup, skin, hair and most oral-care '
        'products and +7.5% (List 4A) on most essential oils and flavor bases.',
        'before': '+25% / +7.5%',
        'now': '+25% / +7.5%',
        'countries': 'China',
        'sourceIds': ['fr-2026-20510'],
    },
    {
        'id': 'ca-bans',
        'type': 'reference',
        'date': '2026-09-29',
        'dateLabel': 'Effective',
        'title': 'Canadian import bans do not reach Chapter 33',
        'detail': 'From September 29, 2026 certain Canadian alcoholic beverages, dairy-scope products and motorcycles moved from the 50% Section '
        '338 duty to an import ban. No Chapter 33 product is banned; 3301.19.10 and 3301.24.00, which sit on the alcoholic-beverage and dairy '
        'duty lists, keep paying 50%.',
        'before': None,
        'now': None,
        'countries': 'Canada',
        'sourceIds': ['procl-11062', 'hts-now'],
    },
    {
        'id': 'ca-338-scope',
        'type': 'reference',
        'date': '2026-09-15',
        'dateLabel': 'Effective',
        'title': 'Canada Section 338 lists revised; Chapter 33 entries unchanged',
        'detail': 'Proclamations 11064 and 11065 added and removed provisions on the 9903.03.12 and 9903.03.14 lists and made the 50% apply in '
        'addition to any Section 232 duty. None of the added or removed provisions is in Chapter 33.',
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
        'resolution of the issues or until termination, so USMCA claims (SPI S) still remove the Section 301 duty on Canadian and Mexican '
        'cosmetics.',
        'before': None,
        'now': None,
        'countries': 'Canada, Mexico',
        'sourceIds': ['ustr-usmca-review'],
    },
    {
        'id': 'al-derivatives-end',
        'type': 'extraDuty',
        'date': '2026-04-06',
        'dateLabel': 'Effective',
        'title': 'Aluminum duty on aerosol and other Chapter 33 products ends (except Russian aluminum)',
        'detail': 'Proclamation 11021 replaced the aluminum and steel derivative lists with new lists of metal articles (U.S. note 16, '
        '9903.82.02–9903.82.26) and terminated 9903.85.08. No Chapter 33 line is on the new lists, so the 50% duty on the aluminum content of '
        'the 14 listed perfume, hair, deodorant and other subheadings stopped. Products of Russia, or made with Russian-smelted or cast '
        'aluminum, still pay 200% (9903.85.68).',
        'before': '+50% of aluminum content',
        'now': 'None (Russian aluminum: +200%)',
        'countries': 'All',
        'sourceIds': ['procl-11021', 'hts-now'],
    },
    {
        'id': 's122-start',
        'type': 'extraDuty',
        'date': '2026-02-24',
        'dateLabel': 'Effective',
        'title': 'Section 122 surcharge replaces the IEEPA tariffs',
        'detail': '10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 33 subheading was on the product exemption list '
        '(9903.03.03); religious-use essential oils were exempt by description (9903.03.04). USMCA-qualifying goods from Canada and Mexico were '
        'exempt.',
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
        'the dutiable Chapter 33 lines — orange, lemon, peppermint and other essential oils, and the 3307 toiletries — Free for listed '
        'sub-Saharan countries. GSP (SPI A, A*) remains expired since December 31, 2020.',
        'before': 'Lapsed (from September 30, 2025)',
        'now': 'In force to December 31, 2026',
        'countries': 'AGOA beneficiary countries',
        'sourceIds': ['ustr-agoa-2026', 'crs-agoa', 'procl-11030', 'cbp-gsp', 'hts-now'],
    },
    {
        'id': 'fda-talc',
        'type': 'reference',
        'date': '2025-11-28',
        'dateLabel': 'Withdrawn',
        'title': 'FDA withdraws its proposed talc asbestos-testing rule',
        'detail': 'MoCRA requires FDA to set standard methods for testing talc-containing cosmetics (face powders, eye shadow) for asbestos. FDA '
        'withdrew the December 2024 proposed rule to consider the comments further before issuing final regulations, so there is no mandatory '
        'testing method yet. No proposed rule on MoCRA\'s fragrance-allergen labeling or cosmetic GMP requirements had been published in the Federal Register by '
        'October 12, 2026.',
        'before': 'Proposed (December 27, 2024)',
        'now': 'Withdrawn',
        'countries': 'All',
        'sourceIds': ['fda-talc-withdrawal', 'fda-mocra'],
    },
    {
        'id': 'ch-deal',
        'type': 'extraDuty',
        'date': '2025-11-14',
        'dateLabel': 'Effective',
        'title': 'Swiss goods: reciprocal tariff becomes 15% in total',
        'detail': 'Under the U.S.–Switzerland–Liechtenstein framework, goods with a column 1 rate under 15% paid 15% in total (base included) '
        'from November 14, 2025 (9903.02.83). Ended February 24, 2026.',
        'before': 'Reciprocal tariff',
        'now': '15% in total (ended)',
        'countries': 'Switzerland, Liechtenstein',
        'sourceIds': ['ita-ch-deal'],
    },
    {
        'id': 'kr-deal',
        'type': 'extraDuty',
        'date': '2025-11-14',
        'dateLabel': 'Effective',
        'title': 'Korean goods: reciprocal tariff becomes 15% in total',
        'detail': 'The notice implementing the U.S.–Korea deal set the reciprocal tariff on Korean goods with a column 1 (General or Special) '
        'rate under 15% at 15% in total, from November 14, 2025. For K-beauty, which is Free at the base rate, that meant 15%. Ended February '
        '24, 2026.',
        'before': 'Reciprocal tariff',
        'now': '15% in total (ended)',
        'countries': 'South Korea',
        'sourceIds': ['ita-kr-deal'],
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
        'id': 'jp-deal',
        'type': 'extraDuty',
        'date': '2025-09-04',
        'dateLabel': 'Signed',
        'title': 'Japanese goods: reciprocal tariff set at 15% in total',
        'detail': 'Executive Order 14345 set the reciprocal tariff on Japanese goods with a column 1 rate under 15% at 15% in total, applied '
        'retroactively to goods entered from August 7, 2025. Ended February 24, 2026.',
        'before': 'Reciprocal tariff',
        'now': '15% in total (ended)',
        'countries': 'Japan',
        'sourceIds': ['eo-14345'],
    },
    {
        'id': 'india-oil',
        'type': 'extraDuty',
        'date': '2025-08-27',
        'dateLabel': 'Effective',
        'title': 'Extra 25% on products of India',
        'detail': 'Executive Order 14329 added 25% on Indian goods (9903.01.84), on top of the 25% reciprocal rate in force since August 7, 2025 '
        '(EO 14326): 50% in all on Indian essential oils and incense. Ended February 7, 2026.',
        'before': '+25%',
        'now': '+50% (ended)',
        'countries': 'India',
        'sourceIds': ['eo-14329', 'eo-14326'],
    },
    {
        'id': 'eu-15',
        'type': 'extraDuty',
        'date': '2025-08-07',
        'dateLabel': 'Effective',
        'title': 'EU goods: reciprocal tariff becomes 15% in total; country rates for others',
        'detail': 'Executive Order 14326 set the reciprocal tariff on EU goods with a column 1 rate under 15% at 15% in total (9903.02.20) — so '
        'French and Italian perfume and cosmetics, Free at the base rate, paid 15% — and replaced the 10% baseline with country rates for other '
        'listed countries. Ended February 24, 2026.',
        'before': '+10%',
        'now': '15% in total for the EU (ended)',
        'countries': 'European Union and listed countries',
        'sourceIds': ['eo-14326'],
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
        'detail': 'Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. Chinese cosmetics '
        'on List 3 then paid 20% + 10% + 25% = 55% on top of the base rate until November 2025. Ended February 24, 2026.',
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
        'detail': 'Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% from April 10, 2025. With the 20% fentanyl duty and '
        'the 25% List 3 duty, Chinese makeup and skin care paid 170% until May 13, 2025.',
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
        'detail': '10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. Chapter 33 products had no exemption '
        'except religious-use essential oils. Ended February 24, 2026.',
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
        'on top of the Section 301 lists. Ended February 24, 2026.',
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
        'id': 'mocra-reg',
        'type': 'reference',
        'date': '2024-07-01',
        'dateLabel': 'Effective',
        'title': 'MoCRA facility registration and product listing enforced',
        'detail': 'Under the Modernization of Cosmetics Regulation Act of 2022, facilities that make or process cosmetics for the U.S. — foreign '
        'plants included — must register with FDA and renew every two years, and the responsible person must list each product. The statutory '
        'deadline was December 29, 2023; FDA did not enforce it until July 1, 2024.',
        'before': 'Voluntary registration',
        'now': 'Required',
        'countries': 'All',
        'sourceIds': ['fda-reg-compliance', 'fda-reg-listing'],
    },
]
have_ids = {c['id'] for c in tu['changes']}
tu['changes'] += [c for c in EXTRA_CHANGES if c['id'] not in have_ids]
tu['changes'].sort(key=lambda c: c['date'], reverse=True)
add_sources(
    tu,
    [
        'procl-10947',
        'procl-11021',
        'procl-11062',
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
        'fda-talc-withdrawal',
        'fda-mocra',
        'ita-ch-deal',
        'ita-kr-deal',
        'eo-14357',
        'eo-14345',
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
        'fda-reg-compliance',
        'fda-reg-listing',
    ],
)

stats = [s for s in tu['stats'] if s['label'] != 'IEEPA duties']
stats.append({'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'})
tu['stats'] = stats

# ---------------------------------------------------------------------------------------------------
# Industry areas (matrix)
# ---------------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['h1'] = f'HTS Chapter 33: {SHORT} — Tariff Rates by Country'
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]

RULE_LABELS = {
    'Canada': 'USMCA-qualifying: no Section 301 duty (9903.05.93); otherwise base rate + 10% (9903.05.29). On top, 50% Section 338 on 20 '
    'subheadings — essential oils, beverage flavor bases, alcohol-based perfume, lip, eye and nail makeup, other hair preparations '
    '(9903.03.12–9903.03.14) — whether or not USMCA is claimed. The 35% IEEPA duty ended February 24, 2026.',
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94). Otherwise base rate + 10% Section 301 (9903.05.55). The 25% IEEPA duty ended '
    'February 24, 2026.',
    'China': 'Base rate + 12.5% Section 301 (9903.05.31) + 25% List 3 (9903.88.03) on perfume, makeup, skin, hair, most oral care, 3307 '
    'toiletries, lemon oil and 3302.90; + 7.5% List 4A (9903.88.15) on the other essential oils, beverage flavor bases and dental floss. '
    'Toothpaste and eucalyptus oil pay only the 12.5%.',
    'South Korea': 'South Korea: 12.5% in total when the rate (or its ad valorem equivalent) is lower (9903.05.71); KORUS (KR) does not lower it. '
    'No Chapter 33 line is exempt.',
    'Japan': 'Japan: 12.5% in total when the rate (or its ad valorem equivalent) is lower (9903.05.49). No Chapter 33 line is exempt.',
    'Switzerland': 'Switzerland: 12.5% in total when the rate is lower (9903.05.74), except 3301.19.51, 3301.29.10 and 3301.30.00 (exception '
    'list, note 52(j)(3), 9903.05.98), which pay only the base rate.',
    'Brazil': 'Base rate + 25% (9903.05.01) + 12.5% (9903.05.27) = +37.5%. Orange oil (3301.12.00) and 3301.90.50 are on the Brazil exemption '
    'list (U.S. note 50(a)(ii)) and pay only the 12.5%.',
    'United Arab Emirates': 'Base rate + 12.5% Section 301 (9903.05.80). No Chapter 33 line is exempt.',
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81). No Chapter 33 line is on the UK exception list.',
    'India': 'Base rate + 10% Section 301 (9903.05.44). No Chapter 33 line is exempt. The IEEPA duties (up to 50%) ended in February 2026.',
}


def rule_label(c):
    r = c['rule']
    name = c['country']
    if name in RULE_LABELS:
        return RULE_LABELS[name]
    if r.get('atLeast'):
        return (
            'Countries outside the 60 Section 301 economies pay only the base rate. The 60 pay +10% or +12.5% (9903.05.20–9903.05.84), or 10%–12.5% '
            'in total for the EU, Japan, South Korea, Switzerland and Taiwan; China pays up to +37.5% and Brazil +37.5%. Exception lists in note '
            '52(j) exempt 3301.19.51, 3301.29.10 and/or 3301.30.00 for some countries. Column 2 countries (Cuba, North Korea, Russia, Belarus) '
            'pay column 2 rates — 75% on most cosmetics.'
        )
    if r['kind'] == 'eu15':
        return 'EU: 10% in total in place of the base rate when the base rate (or its ad valorem equivalent) is under 10% (9903.05.39) — every ' \
            'Chapter 33 line. No Chapter 33 line is on the EU exception list. The 15%-in-total IEEPA rate ended February 24, 2026.'
    x = f"{r['extraPct']:g}"
    return f"Base rate + {x}% Section 301 ({r['ch99Code']})."


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
    'title': 'Cosmetics & Perfume Tariffs by Country 2026 — France, Korea, Italy, Canada, China, UAE (HTS Ch. 33) | KoalaGains',
    'shortDescription': 'The total 2026 U.S. tariff on perfume, makeup, skin care, hair care and essential oils by country: 10% for French and '
    'EU goods, 12.5% for Korea and Japan, up to 42.4% for China, 50% Section 338 on some Canadian goods even under USMCA.',
    'keywords': [
        'eu tariff on essential oils and resinoids; perfumery, cosmetic or toilet preparations',
        'france perfume import duty',
        'tariffs on cosmetics from china',
        'china essential oils customs duty',
        'section 301 botanical extract tariffs',
        'korean cosmetics tariffs',
        'tariffs on cosmetics canada',
        'perfume tariffs canada',
    ],
}
ia['intro'] = (
    'For Chapter 33 the base rate is mostly Free, so **where the goods come from decides the tariff**. Each cell below is the base rate for that '
    'product group plus the extra duty for that country, minus any preference — taken from the current tariff schedule.\n\n'
    'Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** that started July 24, '
    '2026: **EU goods pay 10%** in total (France, Italy, Spain, Ireland, Germany), **South Korea, Japan and Switzerland 12.5%** in total, the UK '
    'and India +10%, the UAE +12.5%. **China adds 37.5% on perfume, makeup and skin care** and **Brazil 37.5%**. USMCA-qualifying goods from '
    'Mexico pay nothing; from Canada they pay nothing except on the **20 subheadings with the 50% Section 338 duty**, which no USMCA claim '
    'removes.'
)
assumptions = [a for a in ia['assumptions'] if 'TODO' not in a]
assumptions += [
    'Canada, "USMCA-qualifying" side: the Section 301 duty is removed (9903.05.93), but the 50% Section 338 duty stays on the 20 listed '
    'subheadings because U.S. note 51(a) applies it even when a special rate is claimed.',
    'Compound rates on alcoholic flavor bases (3302.10.40, 3302.10.50) are compared at the $10,000 / 1,000 kg test shipment ($10 per kg) for '
    'the EU, Japan, Korea and Switzerland "in total" rules, so 8.4¢/kg + 1.9% counts as 2.74%.',
    'Not in the cells: the 200% Section 232 duty on derivative aluminum (9903.85.68), which applies to 14 Chapter 33 subheadings when the goods '
    'are of Russia or contain aluminum smelted or cast in Russia; antidumping or countervailing duties (none in force on Chapter 33 products); '
    'and FDA, EPA or DOT costs.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied. The 2025 aluminum-content duty on 14 Chapter 33 subheadings (9903.85.08) ended '
    'April 6, 2026.',
]
ia['assumptions'] = assumptions
ia['exemptionCheck'] = (
    'Read U.S. notes 16, 19, 20, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 general exemption list '
    '(note 52(b), 9903.05.86) has no Chapter 33 line; note 52(c) exempts religious-use essential oils of 3301.29.51 by description. The country '
    'lists in note 52(j) exempt 3301.19.51, 3301.29.10 and 3301.30.00 for Switzerland, Cambodia, Guatemala, Indonesia, Ecuador, Jordan and '
    'Taiwan, 3301.19.51 for Argentina and 3301.30.00 for El Salvador; the EU, UK and Malaysia lists have none. The Brazil list (note 50(a)(ii)) '
    'has 3301.12.00 and 3301.90.50. The Canada Section 338 lists (note 51(b)) name 20 Chapter 33 subheadings, and no Chapter 33 product is in '
    'the September 29, 2026 import bans. China: List 3 (note 20(f)) and List 4A (note 20(s)) cover every subheading except 3301.29.10 (List 4B, '
    'suspended) and 3306.10.00; the only Chapter 33 exclusion printed (3306.20.0000, dental floss) has expired, and none in force (note '
    '20(vvv)–(www)) names a Chapter 33 product. Section 232: no Chapter 33 line is on the note 16 metal lists; 14 are on the note 19(k) list '
    'that 9903.85.68 still uses for Russian aluminum. The 1999 EU retaliation heading 9903.08.04 (bath preparations, 3307.30.50) is printed '
    'but shaded as expired.'
)

# ---------------------------------------------------------------------------------------------------
# Understand industry
# ---------------------------------------------------------------------------------------------------
ui['h1'] = f'HTS Chapter 33: {SHORT} — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Cosmetics, Perfume & Essential Oil Imports by Country — HTS Chapter 33 Trade Statistics | KoalaGains',
    'shortDescription': f'U.S. imports of HTS Chapter 33 goods: {fmt_usd(total)} in {Y}. Who supplies perfume, skin care, makeup, hair care and '
    'essential oils — France, Ireland, South Korea, Italy, Canada, Mexico, China — with values by product and year from UN Comtrade.',
    'keywords': [
        'hts chapter 33 import duty rates',
        'us tariff on essential oils and resinoids; perfumery, cosmetic or toilet preparations',
        'us cosmetics imports by country',
        'korean beauty imports us',
        'french perfume imports us',
        'customs duty for color cosmetics',
        'mfn tariff on botanical extracts',
        'india essential oils import tax',
    ],
}
ui['byYearCaption'] = (
    'U.S. imports of Chapter 33 goods each year, split into the two largest 2025 suppliers (France and Ireland) and everyone else.'
)
kr, ae, ie, fr, cn, vn = (
    by_c_all['Rep. of Korea'],
    by_c_all['United Arab Emirates'],
    by_c_all['Ireland'],
    by_c_all['France'],
    by_c_all['China'],
    by_c_all['Viet Nam'],
)
ui['why'] = (
    f'U.S. imports of Chapter 33 goods were **{fmt_usd(total)} in {Y}**, {abs(round((total / prior_total - 1) * 100, 1))}% less than the '
    f'{fmt_usd(prior_total)} of {PY} but still {round((total / year_tot[2020] - 1) * 100)}% above 2020. Two products make up half of the total: '
    f'**perfume and toilet waters (3303.00)**, {fmt_usd(by_line["3303.00"]["importsUsd"])}, and **skin care and other beauty preparations '
    f'(3304.99)**, {fmt_usd(by_line["3304.99"]["importsUsd"])}.\n\n'
    f'**France** is the largest supplier ({fmt_usd(fr["importsUsd"])}), two-thirds of it perfume. **Ireland** ({fmt_usd(ie["importsUsd"])}) '
    f'ships almost only heading 3302 — flavor concentrates for the beverage industry — and fell {abs(chg("Ireland"))}% in {Y}, which explains '
    f'most of the chapter\'s drop (3302.10 fell {abs(by_line["3302.10"]["changePct"])}%). Going the other way, **South Korea** grew '
    f'{chg("Rep. of Korea")}% to {fmt_usd(kr["importsUsd"])}, more than three times its 2020 level, almost all skin care and makeup; the '
    f'**United Arab Emirates** grew {chg("United Arab Emirates")}% to {fmt_usd(ae["importsUsd"])} (from {fmt_usd(imp_year("United Arab Emirates", 2020))} in '
    f'2020), nearly all perfume; and **Vietnam** reached {fmt_usd(vn["importsUsd"])}. **China** fell {abs(chg("China"))}% to '
    f'{fmt_usd(cn["importsUsd"])}.\n\n'
    f'Canada ({fmt_usd(imp("Canada"))}) and Mexico ({fmt_usd(imp("Mexico"))}) supplied '
    f'{round((imp("Canada") + imp("Mexico")) / total * 100)}% of {Y} imports. The figures are annual and stop at {Y}, before the 2026 tariff '
    'changes (the end of the IEEPA duties in February, the Section 301 tariffs from July 24, 2026 and the Canada Section 338 duties from August '
    '22); they do not show what those changes did. Duty-collected figures are not available from an official source yet.'
)
ui['effectiveDuty']['note'] = 'Duty-collected figures aren’t available from an official source yet.'
ui['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar years 2020–{Y}. '
    '"Other Asia, nes" is how UN Comtrade reports Taiwan.'
)

# ---------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['h1'] = f'HTS Chapter 33: {SHORT} — Import Documents & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing Cosmetics & Perfume into the U.S.: FDA MoCRA Rules, Labels, Hazmat & Legal Ways to Lower Duty (HTS Ch. 33) | KoalaGains',
    'shortDescription': 'What each HTS Chapter 33 line needs at U.S. entry — MoCRA facility registration and product listing, FDA labeling and '
    'color additives, OTC drug rules for sunscreen and antiperspirants, DOT hazmat for perfume — and the legal ways to pay less: USMCA, origin, '
    'first sale, drawback, FTZ and rulings.',
    'keywords': [
        'importing cosmetics to usa',
        'mocra registration',
        'mocra fda',
        'fda cosmetic import requirements',
        'first-sale-for-export valuation',
        'section 232 aluminum packaging duties',
        'cbp tariff engineering',
        'cosmetics origin relocation',
    ],
}
te['intro'] = (
    'Cosmetics need no FDA approval before they are sold — except their color additives — but **FDA can detain any shipment** that looks '
    'adulterated or misbranded: wrong colors, banned ingredients, microbial contamination, labels not in English, or drug claims. Since MoCRA the '
    'foreign plant must be **registered** with FDA and each product **listed** by the brand owner. Sunscreens, antiperspirants, anticavity '
    'toothpaste and dandruff shampoo are **OTC drugs** in the U.S. and follow drug rules. Cosmetics do not need FDA prior notice, but essential '
    'oils and flavor bases sold for food or drinks do. Alcohol-based perfumes and aerosols ship as **hazardous materials**.\n\n'
    'On cost, most lines are Free at the base rate, so the levers that matter are the ones that change **which extra duty applies** — USMCA for '
    'Mexican and most Canadian goods, the country of origin, the value the duty is charged on (first sale), and getting duty back on '
    're-exports (drawback, foreign-trade zones). Each lever depends on a document, listed below with its regulation.'
)
te['regulationsAsOf'] = '2026-10-08'
te['levers'] = [
    {
        'id': 'usmca',
        'title': 'Claim USMCA on goods from Mexico or Canada',
        'saves': 'The Section 301 duty — 10% of value — plus the base rate (up to 6%) on the 3301 and 3307 lines',
        'appliesTo': 'All 74 lines from Mexico; from Canada, the 54 lines not on the Section 338 lists (skin care, shampoo, hair spray, '
        'toothpaste, 3307 toiletries and others)',
        'document': 'A certification of origin from the importer, exporter or producer, on the invoice or another document, kept ready for CBP.',
        'caveat': 'USMCA does not remove the 50% Section 338 duty on the 20 Canadian subheadings in U.S. note 51(b). The Chapter 33 origin rules '
        'are generous: perfume and fragrance mixtures (3302–3303) qualify if made from materials of any other heading, makeup and hair products '
        '(3304.10–3305.90) from any other subheading, oral care and 3307 toiletries from any other heading; most essential oils need a change '
        'of chapter or 60% regional value content. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.',
        'citations': [
            {'label': '19 CFR 182.12', 'url': ecfr(19, '182.12')},
            {'label': 'HTSUS General Note 11 (USMCA rules of origin, Chapter 33)', 'url': GN_PDF},
            {'label': 'HTSUS 9903.05.93 / 9903.05.94, U.S. notes 51–52', 'url': CH99_PDF},
            {
                'label': 'USTR statement on the USMCA joint review (July 1, 2026)',
                'url': 'https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review',
            },
        ],
    },
    {
        'id': 'origin',
        'title': 'Know the country of origin — and where a product changes it',
        'saves': 'The difference between country rates: 10% in total for the EU, 12.5% for Korea, Japan or Switzerland, 20%–42.4% for China',
        'appliesTo': 'All lines; the gap is widest on the List 3 lines (perfume, makeup, skin, hair, 3307) from China',
        'document': 'Production records showing where the product was last substantially transformed (for example, where the formula was '
        'compounded), and correct country-of-origin marking.',
        'caveat': 'Filling, labeling or packing finished bulk product in another country does not change its origin. The Section 301, 338 and 232 '
        'duties follow the country of origin, and CBP can ask for proof. A binding ruling settles a doubtful case before the goods ship.',
        'citations': [
            {'label': '19 CFR 134.1 (country of origin)', 'url': ecfr(19, '134.1')},
            {'label': '19 CFR part 177 (rulings)', 'url': ecfr_part(19, 177)},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'fta',
        'title': 'Claim a free trade agreement or AGOA on the dutiable lines',
        'saves': 'The base rate on the 19 dutiable lines — up to 6% on room fragrance, 5.8% on bath salts, 4.9% on deodorants and shaving '
        'products, 2.7%–4.2% on citrus and peppermint oils',
        'appliesTo': 'The 3301, 3302.10.40/.50 and 3307 lines that list AU, BH, CL, CO, D, E, IL, JO, KR, MA, OM, P, PA, PE or SG',
        'document': 'The origin proof each agreement requires (a certification or declaration of origin) and records to back it up.',
        'caveat': 'An FTA removes the base rate but not the 2026 Section 301 duty (U.S. note 52(a)); for Korean goods the 12.5% total stays the '
        'same with or without KORUS. AGOA (D) runs to December 31, 2026; GSP (A, A*) has been expired since December 31, 2020.',
        'citations': [
            {'label': 'HTSUS General Notes 3(c) and 8–34', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'first-sale',
        'title': 'Value at the first sale for export when you buy through a middleman',
        'saves': 'Every ad valorem duty is charged on a lower value — the 10%–50% extra duties included — when the factory price to a trading '
        'company or brand owner is lower than the price you pay',
        'appliesTo': 'All lines bought through a distributor or brand owner rather than straight from the maker',
        'document': 'Proof that the first sale was a bona fide sale for export to the United States at arm\'s length: the factory invoice, '
        'contracts and payment records.',
        'caveat': 'Only a sale clearly destined for the U.S. qualifies, and the importer must be able to show the earlier price at entry.',
        'citations': [{'label': '19 CFR 152.103', 'url': ecfr(19, '152.103')}],
    },
    {
        'id': 'drawback',
        'title': 'Recover duty on goods you export or destroy',
        'saves': 'Up to 99% of the duties paid, when the imported goods (or goods made from them, such as perfume compounded from imported '
        'essential oils) are exported or destroyed',
        'appliesTo': 'Any line',
        'document': 'A drawback claim to CBP with import, manufacturing and export records.',
        'caveat': 'Claims have filing deadlines and record-keeping rules; check whether a given Chapter 99 duty is eligible before relying on it.',
        'citations': [{'label': '19 CFR part 190', 'url': ecfr_part(19, 190)}],
    },
    {
        'id': 'ftz',
        'title': 'Hold, fill or relabel goods in a foreign-trade zone',
        'saves': 'No duty on goods re-exported from the zone, and duty deferred until goods leave it for the U.S. market',
        'appliesTo': 'Any line — useful for bulk fragrance and cosmetics that are filled, kitted or relabeled for several markets',
        'document': 'Zone admission (CBP Form 214) and the zone operator\'s inventory records.',
        'caveat': 'Goods entered for U.S. consumption from a zone pay the duties in force on the entry date; FDA rules still apply to goods leaving '
        'the zone.',
        'citations': [{'label': '19 CFR part 146', 'url': ecfr_part(19, 146)}],
    },
    {
        'id': 'ch98',
        'title': 'Use a Chapter 98 provision for U.S. goods coming back',
        'saves': 'All duty on U.S.-made cosmetics returned unchanged (9801.00.10), for example unsold stock sent back by a foreign distributor',
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
        'saves': 'Certainty on the lines where the rate or the extra duty changes: skin care (3304, Free) versus soap (3401) or 3307 toiletries '
        '(up to 6%); perfume (3303, Free) versus room fragrance (3307.49, 6%); hair products on or off the Canada Section 338 list',
        'appliesTo': 'Any line where the formula, use or packaging decides the line',
        'document': 'A ruling request to CBP describing the product, its ingredients, use and packaging.',
        'caveat': 'Medicated shampoos, sunscreens and toothpaste stay in Chapter 33 even with therapeutic properties (Chapter 30, note 1(e)). '
        'Rulings apply to the transaction described; a reformulated product may need a new one.',
        'citations': [
            {'label': '19 CFR part 177', 'url': ecfr_part(19, 177)},
            {'label': 'HTSUS Chapter 33 notes', 'url': CH33_PDF},
            {'label': 'HTSUS Chapter 30, note 1(e)', 'url': CH30_PDF},
        ],
    },
]

te['rules'] = [
    {
        'id': 'fda-entry',
        'agency': 'FDA',
        'title': 'Every entry is screened by FDA through ACE; cosmetics that appear adulterated or misbranded are detained and must be '
        'reconditioned, re-exported or destroyed. No FDA approval is needed except for color additives',
        'citations': [
            {'label': '21 U.S.C. 381 (FD&C Act §801)', 'url': USC21_381},
            {'label': '21 CFR 1.94', 'url': ecfr(21, '1.94')},
            {'label': 'FDA: Importing cosmetics', 'url': FDA_IMPORTING},
            {'label': 'FDA: Cosmetics importers', 'url': FDA_IMPORTERS},
        ],
    },
    {
        'id': 'mocra-registration',
        'agency': 'FDA (MoCRA)',
        'title': 'Facility registration (renewed every two years, U.S. agent for foreign plants) and product listing with ingredients by the '
        'responsible person; an importer that only holds, labels or distributes does not register. FDA issues no registration certificates',
        'citations': [
            {'label': '21 U.S.C. 364, 364c', 'url': USC21_COS},
            {'label': 'FDA: Registration & listing of cosmetic facilities and products', 'url': FDA_REG},
        ],
    },
    {
        'id': 'mocra-duties',
        'agency': 'FDA (MoCRA)',
        'title': 'Responsible person: report serious adverse events within 15 business days, keep safety substantiation records, and put a U.S. '
        'address, phone number or website for adverse-event reports on the label',
        'citations': [
            {'label': '21 U.S.C. 364a, 364d, 364e', 'url': USC21_COS},
            {'label': 'FDA: MoCRA', 'url': FDA_MOCRA},
        ],
    },
    {
        'id': 'fda-labeling',
        'agency': 'FDA / FPLA',
        'title': 'Cosmetic labeling in English: identity, net quantity, name and place of business, ingredients by U.S. common name in '
        'descending order, required warnings (e.g. aerosols); bulk goods for U.S. relabeling can use the 21 CFR 701.9 exemption',
        'citations': [
            {'label': '21 CFR part 701', 'url': ecfr_part(21, 701)},
            {'label': '21 CFR part 740', 'url': ecfr_part(21, 740)},
            {'label': 'FDA: Cosmetics labeling guide', 'url': FDA_LABEL_GUIDE},
        ],
    },
    {
        'id': 'fda-color',
        'agency': 'FDA',
        'title': 'Color additives must be approved for the use (e.g. around the eye); certifiable colors must come from FDA-certified batches, '
        'which FDA checks at entry',
        'citations': [
            {'label': '21 CFR part 73, subpart C', 'url': 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-73/subpart-C'},
            {'label': '21 CFR part 74, subpart C', 'url': 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-74/subpart-C'},
            {'label': '21 CFR part 80', 'url': ecfr_part(21, 80)},
            {'label': 'FDA: Color certification', 'url': FDA_COLOR_CERT},
        ],
    },
    {
        'id': 'fda-prohibited',
        'agency': 'FDA',
        'title': 'Prohibited and restricted ingredients (mercury compounds, bithionol, vinyl chloride and zirconium in aerosols, chloroform, '
        'methylene chloride, prohibited cattle materials and others); FDA import alerts target color violations (53-06), microbial contamination '
        '(53-17) and other adulterated cosmetics (53-21)',
        'citations': [
            {'label': '21 CFR part 700, subpart B', 'url': 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-G/part-700/subpart-B'},
            {'label': 'FDA import alerts for cosmetics', 'url': FDA_IA_COS},
        ],
    },
    {
        'id': 'fda-otc',
        'agency': 'FDA (CDER)',
        'title': 'Products that are also OTC drugs — sunscreens, antiperspirants, anticavity toothpaste and mouthwash, dandruff shampoo, acne '
        'products: the maker registers as a drug establishment and lists the product, which must meet its OTC monograph; claims to treat or '
        'change the body make a "cosmetic" an unapproved drug (import alert 66-41)',
        'citations': [
            {'label': '21 CFR part 207', 'url': ecfr_part(21, 207)},
            {'label': '21 U.S.C. 355h (OTC monographs)', 'url': USC21_355H},
            {'label': 'FDA: Is it a cosmetic, a drug, or both?', 'url': FDA_DRUG_OR_COS},
        ],
    },
    {
        'id': 'fda-food',
        'agency': 'FDA',
        'title': 'Essential oils, oleoresins and flavor bases for food or drinks are food: registered foreign facility, prior notice before '
        'arrival and a foreign supplier verification program. Prior notice applies only to food, not to cosmetics',
        'citations': [
            {'label': '21 CFR 1.225', 'url': ecfr(21, '1.225')},
            {'label': '21 CFR 1.276–1.277 (prior notice)', 'url': ecfr(21, '1.277')},
            {'label': '21 CFR part 1, subpart L (FSVP)', 'url': 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-1/subpart-L'},
        ],
    },
    {
        'id': 'ttb-alcohol',
        'agency': 'TTB / CBP',
        'title': 'Alcohol: spirits fit for beverage use pay federal excise tax at import; flavors imported unfit for beverage use are "imported '
        'free of tax". The separate tax on imported perfumes containing spirits was repealed in 1994',
        'citations': [
            {'label': '26 U.S.C. 5001', 'url': USC26_5001},
            {'label': '27 CFR 19.1 ("alcoholic flavoring materials")', 'url': ecfr(27, '19.1')},
        ],
    },
    {
        'id': 'epa-tsca',
        'agency': 'EPA / CBP',
        'title': 'Essential oils and fragrance mixtures imported for non-cosmetic, non-food use (detergents, candles, industrial products) are '
        'TSCA chemical substances: the importer certifies TSCA compliance at entry',
        'citations': [{'label': '19 CFR 12.121', 'url': ecfr(19, '12.121')}],
    },
    {
        'id': 'epa-fifra',
        'agency': 'EPA',
        'title': 'Room deodorizers, air sanitizers or other products with disinfecting or pest claims are pesticides: EPA registration and a '
        'Notice of Arrival before import',
        'citations': [
            {'label': '19 CFR 12.112', 'url': ecfr(19, '12.112')},
            {'label': '40 CFR 152.15', 'url': ecfr(40, '152.15')},
        ],
    },
    {
        'id': 'dot-hazmat',
        'agency': 'DOT (PHMSA)',
        'title': 'Alcohol-based perfume, cologne and aftershave (UN1266, Class 3), many essential oils and aerosols (UN1950) are hazardous '
        'materials in transport; consumer packs can usually ship as limited quantities',
        'citations': [
            {'label': '49 CFR 172.101', 'url': ecfr(49, '172.101')},
            {'label': '49 CFR 173.150', 'url': ecfr(49, '173.150')},
            {'label': '49 CFR 173.306', 'url': ecfr(49, '173.306')},
        ],
    },
    {
        'id': 'fws-cites',
        'agency': 'U.S. Fish & Wildlife Service',
        'title': 'Ingredients from CITES-listed or protected species — for example agarwood (oud) oil from Aquilaria trees — can need CITES '
        'documents and FWS clearance unless an exemption in the species listing applies',
        'citations': [
            {'label': '50 CFR part 23', 'url': ecfr_part(50, 23)},
            {'label': '50 CFR 14.61', 'url': ecfr(50, '14.61')},
        ],
    },
    {
        'id': 'cbp-ch99',
        'agency': 'CBP',
        'title': 'Report the Chapter 99 headings with the line: the 2026 Section 301 heading for the country, China List 3/4A, Brazil, Canada '
        'Section 338; on the 14 note 19(k) lines, 9903.85.68 (200%) when the aluminum (for example an aerosol can) was smelted or cast in Russia',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 19, 20, 50–52', 'url': CH99_PDF},
            {'label': 'CBP CSMS # 69606660 (Section 338 guidance)', 'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/4261d04'},
        ],
    },
    {
        'id': 'cbp-marking',
        'agency': 'CBP',
        'title': 'Country-of-origin marking in English on the retail container',
        'citations': [{'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')}],
    },
]

COS_RULES = ['fda-entry', 'mocra-registration', 'mocra-duties', 'fda-labeling', 'fda-color', 'fda-prohibited', 'cbp-ch99', 'cbp-marking']
GROUP_RULES = {
    '3301': ['fda-entry', 'fda-food', 'epa-tsca', 'fws-cites', 'dot-hazmat', 'cbp-ch99', 'cbp-marking'],
    '3302': ['fda-entry', 'fda-food', 'ttb-alcohol', 'epa-tsca', 'dot-hazmat', 'cbp-ch99', 'cbp-marking'],
    '3303': COS_RULES + ['dot-hazmat', 'fws-cites'],
    '3304': COS_RULES + ['fda-otc'],
    '3305': COS_RULES + ['fda-otc', 'dot-hazmat'],
    '3306': COS_RULES + ['fda-otc'],
    '3307': COS_RULES + ['fda-otc', 'epa-fifra', 'dot-hazmat'],
}
GROUP_NOTES = {
    '3301': 'Essential oils are cosmetic, food or industrial inputs depending on their use: for food or drinks they need FDA food-facility '
    'registration and prior notice; for industrial use a TSCA certification. Many are flammable. All 3301 subheadings from Canada are on the '
    'Section 338 lists.',
    '3302': 'Beverage flavor bases (3302.10) are food ingredients — prior notice and FSVP apply — and the alcoholic ones (3302.10.20–.90) raise '
    'excise questions. Industrial fragrance compounds (3302.90) need a TSCA certification. 3302.10 from Canada pays the 50% Section 338 duty.',
    '3303': 'Alcohol-based perfume and cologne is a Class 3 flammable liquid in transport. 3303.00.30 from Canada pays the Section 338 duty; all '
    '3303 lines are on the note 19(k) aluminum list used for Russian aluminum.',
    '3304': 'Sunscreens and acne products are OTC drugs as well as cosmetics. Eye products must use colors approved for the eye area. Lip, eye '
    'and nail products from Canada pay the Section 338 duty.',
    '3305': 'Dandruff shampoos are OTC drugs; hair sprays are aerosols. Hair dyes are cosmetics with special coal-tar dye labeling rules (21 CFR '
    '740.18).',
    '3306': 'Anticavity (fluoride) toothpaste and mouthwash are OTC drugs, so the maker must be a registered drug establishment.',
    '3307': 'Antiperspirants are OTC drugs (deodorants alone are cosmetics). Room deodorizers with disinfecting claims are EPA pesticides. '
    'Aerosol deodorants and alcohol-based aftershaves are hazardous materials in transport.',
}
for g in te['groups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['ruleIds'] = GROUP_RULES[g['heading']]
    g['note'] = GROUP_NOTES[g['heading']]

OTC_SUBS = {'3304.99.50', '3305.10.00', '3305.90.00', '3306.10.00', '3306.90.00', '3307.20.00'}
ALCOHOL_FLAVOR = {'3302.10.20', '3302.10.40', '3302.10.50', '3302.10.90'}
HAZMAT_SUBS = {'3303.00.30', '3305.30.00', '3305.90.00', '3307.10.20', '3307.20.00', '3307.49.00', '3302.10.40', '3302.10.50', '3302.90.20'}
FOOD_SUBS_PREFIX = ('3301', '3302.10')
CA338 = set(
    '3301.12.00 3301.13.00 3301.19.10 3301.19.51 3301.24.00 3301.25.00 3301.29.10 3301.29.20 3301.29.51 3301.30.00 3301.90.10 3301.90.50 '
    '3302.10.10 3302.10.20 3302.10.40 3302.10.50 3302.10.90 3303.00.30 3304.10.00 3304.20.00 3304.30.00 3305.90.00'.split()
)
for ln in te['lines']:
    sub = ln['hts'][:10]
    h = ln['heading']
    if h in ('3301', '3302'):
        rules = ['fda-entry']
        if sub.startswith(FOOD_SUBS_PREFIX):
            rules.append('fda-food')
        if sub in ALCOHOL_FLAVOR:
            rules.append('ttb-alcohol')
        rules.append('epa-tsca')
        if h == '3301':
            rules += ['fws-cites', 'dot-hazmat']
        elif sub in HAZMAT_SUBS:
            rules.append('dot-hazmat')
    else:
        rules = list(COS_RULES)
        if sub in OTC_SUBS:
            rules.append('fda-otc')
        if sub in HAZMAT_SUBS:
            rules.append('dot-hazmat')
        if h == '3303':
            rules.append('fws-cites')
        if sub in ('3307.41.00', '3307.49.00'):
            rules.append('epa-fifra')
    rules += [r for r in ('cbp-ch99', 'cbp-marking') if r not in rules]
    ln['ruleIds'] = rules
    dutiable = bool(ln['general'] and ln['general'] != 'Free')
    levers = ['usmca', 'origin']
    if dutiable:
        levers.append('fta')
    levers += ['first-sale', 'drawback', 'ftz', 'ch98', 'ruling']
    ln['leverIds'] = levers

te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations and the tariff schedule — not legal advice. Whether a product is a '
    'cosmetic, a drug or both depends on its claims and ingredients, and the Chapter 99 duties change by Federal Register notice and CBP '
    'guidance; confirm the current headings and the FDA requirements for your product before each shipment.'
)

# ---------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['h1'] = f'HTS Chapter 33: {SHORT} — Tariff FAQ'
fc['seo'] = {
    'title': 'Cosmetics & Perfume Tariff FAQ: Korean Skincare, French Perfume, China, Canada, HS Codes (HTS Ch. 33) | KoalaGains',
    'shortDescription': 'Answers to what people search about U.S. tariffs on cosmetics: Korean skincare and K-beauty, French perfume, makeup '
    'from China and Canada, sunscreen and deodorant, MoCRA registration, and the HS codes for cosmetics, perfume, essential oils, shampoo, '
    'lipstick and toothpaste.',
    'keywords': [
        'tariffs on korean skincare',
        'k beauty tariffs',
        'tariff on french perfume',
        'tariffs on perfume',
        'tariffs on cosmetics from china',
        'tariffs on cosmetics canada',
        'cosmetics hs code',
        'hs code for perfume',
        'hs code for essential oils',
        'hs code for skin care products',
        'mocra registration',
        'french cosmetic tariff impact',
    ],
}
fc['intro'] = (
    'Straight answers to the most common questions about U.S. tariffs and import rules for perfume, cosmetics, skin care and essential oils. '
    'Each answer links to the page with the full detail.'
)
fc['keyTakeaways'] = [
    'Every perfume, makeup, skin-care, hair-care and oral-care line in Chapter 33 is Free at the base rate; only 19 lines (some essential oils, '
    'alcoholic flavor bases and 3307 toiletries) carry 1.1%–6%.',
    'Since July 24, 2026 the cost is the Section 301 duty by country: 10% in total for EU goods, 12.5% in total for South Korea, Japan and '
    'Switzerland, +10% for the UK and India, +12.5% for the UAE.',
    'China pays the most: +12.5% plus +25% (List 3) on perfume, makeup, skin, hair and 3307 products — 37.5% on cosmetics, 42.4% on deodorant.',
    'USMCA-qualifying goods from Mexico pay nothing extra. From Canada, 20 subheadings — essential oils, beverage flavor bases, alcohol-based '
    'perfume, lip, eye and nail makeup, other hair preparations — pay a 50% Section 338 duty even under USMCA.',
    'The IEEPA duties (15% for EU, Japanese and Korean cosmetics in late 2025) ended February 24, 2026; the 10% Section 122 surcharge ended '
    'July 23, 2026; the aluminum duty on aerosol and other cosmetic lines ended April 6, 2026 except for Russian aluminum.',
    'At entry FDA checks labels, color additives, banned ingredients and drug claims; MoCRA requires facility registration and product '
    'listing. Sunscreens, antiperspirants and fluoride toothpaste are OTC drugs.',
]
fc['questionSource'] = 'Google search suggestions (U.S. English), collected October 12, 2026'

v3303 = by_line['3303.00']['importsUsd']
v3304 = by_line['3304.99']['importsUsd']
fc['faqs'] = [
    {
        'id': 'korean-skincare',
        'question': 'Are there tariffs on Korean skincare and K-beauty?',
        'searchedAs': [
            'tariffs on korean skincare',
            'are there tariffs on korean skincare',
            'korean skincare tariffs',
            'korean beauty tariffs',
            'k beauty tariffs',
            'tariffs on k beauty products',
            'korean cosmetics tariffs',
        ],
        'answer': 'Yes. Korean skin care, makeup, sheet masks and sunscreen are Free at the base rate (3304), but since July 24, 2026 South Korea '
        'pays 12.5% in total under the Section 301 action (9903.05.71) — $12.50 on every $100 of value. A KORUS free-trade claim does not lower '
        'it. Between November 14, 2025 and February 24, 2026 the rate was 15% in total under the IEEPA reciprocal tariff, which has ended. '
        f'South Korea supplied {fmt_usd(kr["importsUsd"])} of Chapter 33 goods in {Y}, up {chg("Rep. of Korea")}% on {PY}.',
        'link': 'industry-areas',
    },
    {
        'id': 'french-perfume',
        'question': 'Is there a tariff on French perfume?',
        'searchedAs': [
            'tariff on french perfume',
            'is there a tariff on french perfume',
            'tariff on perfume from france',
            'tariffs on french perfume',
        ],
        'answer': 'Yes: 10% of value. Perfume (3303.00) has a Free base rate, and for EU goods with a base rate under 10% the 2026 Section 301 '
        'action charges 10% in total (9903.05.39), from July 24, 2026. That replaced the 15%-in-total IEEPA rate of August 2025 to '
        'February 24, 2026 and the 10% Section 122 surcharge that ended July 23, 2026. The same 10% applies to perfume from Italy, Spain and '
        f'other EU countries. France supplied {fmt_usd(fr["importsUsd"])} of Chapter 33 goods in {Y}, most of it perfume.',
        'link': 'industry-areas',
    },
    {
        'id': 'perfume-tariffs',
        'question': 'Are there tariffs on perfume imported into the U.S.?',
        'searchedAs': ['tariffs on perfume', 'us tariffs on perfume', 'are there tariffs on perfume', 'tariffs on fragrances', 'perfume tariffs'],
        'answer': 'The base rate on perfume and toilet water is Free, so the tariff is the extra duty for the country of origin: 10% in total '
        'from the EU, 12.5% in total from Switzerland or Japan, +12.5% from the UAE, +10% from the UK, 37.5% from China (12.5% + 25% List 3) '
        'and 37.5% from Brazil. Alcohol-based perfume from Canada pays 50% under Section 338, even under USMCA; from Mexico under USMCA, '
        f'nothing. The U.S. imported {fmt_usd(v3303)} of perfume in {Y}.',
        'link': 'industry-areas',
    },
    {
        'id': 'cosmetics-tariffs',
        'question': 'What is the U.S. tariff on cosmetics and makeup in 2026?',
        'searchedAs': [
            'tariff on cosmetics',
            'us tariff on cosmetics',
            'is there tariffs on cosmetics',
            'tariffs on beauty products',
            'us tariffs on beauty products',
            'makeup tariffs',
            'is makeup tariffed',
        ],
        'answer': 'Makeup, skin care, hair care and toothpaste have a Free base rate; deodorants and shaving products 4.9%, bath salts 5.8%, '
        'room fragrance 6%. On top comes the Section 301 duty by country: 10% in total from the EU, 12.5% in total from South Korea, Japan and '
        'Switzerland, +10% from the UK, India and non-USMCA Mexican or Canadian goods (plus 50% Section 338 on 20 Canadian subheadings), +12.5% from Vietnam, Thailand and the UAE, +37.5% from '
        'China on most cosmetics, +37.5% from Brazil. Countries outside the 60 Section 301 economies pay only the base rate.',
        'link': 'industry-areas',
    },
    {
        'id': 'china-cosmetics',
        'question': 'What are the tariffs on cosmetics from China?',
        'searchedAs': ['tariffs on cosmetics from china', 'are there tariffs on china'],
        'answer': 'Chinese cosmetics pay two Section 301 duties: +12.5% under the 2026 action (9903.05.31) and +25% under List 3 (9903.88.03) '
        'for perfume, makeup, skin care, hair preparations, mouthwash and the 3307 toiletries. So makeup and skin care pay 37.5%, deodorant and '
        'shaving cream 42.4% (4.9% base). Most essential oils and beverage flavor bases are on List 4A (+7.5%), toothpaste on neither list '
        '(12.5% in total). The 2025 IEEPA duties on China ended February 24, 2026.',
        'link': 'industry-areas',
    },
    {
        'id': 'canada-cosmetics',
        'question': 'Are there U.S. tariffs on cosmetics from Canada?',
        'searchedAs': ['tariffs on cosmetics canada', 'tariffs on makeup canada', 'canada tariffs on perfume', 'section 338 canada tariffs'],
        'answer': 'On some. USMCA-qualifying Canadian goods pay no Section 301 duty, but since August 22, 2026 a 50% Section 338 duty applies to '
        '20 Chapter 33 subheadings from Canada — essential oils, beverage flavor bases, alcohol-based perfume (3303.00.30), lipstick (3304.10), '
        'eye makeup (3304.20), nail polish (3304.30) and other hair preparations (3305.90) — whether or not USMCA is claimed. Canadian skin '
        'care, face powder, shampoo, hair spray, toothpaste and deodorant are not on the lists: Free under USMCA, base rate + 10% without it.',
        'link': 'industry-areas',
    },
    {
        'id': 'sunscreen-deodorant',
        'question': 'Are there tariffs on sunscreen and deodorant?',
        'searchedAs': ['tariffs on sunscreen', 'tariffs on deodorant'],
        'answer': 'Sunscreen is classified with skin care in 3304.99.50 (Free base rate) and deodorants and antiperspirants in 3307.20.00 (4.9%). '
        'The country duty comes on top: from the EU both pay 10% in total, from South Korea or Japan 12.5% in total, from China 37.5% '
        '(sunscreen) and 42.4% (deodorant). In the U.S. sunscreens and antiperspirants are also OTC drugs, so the foreign maker must be '
        'registered with FDA as a drug establishment.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'hs-cosmetics',
        'question': 'What is the HS code for cosmetics and skin care products?',
        'searchedAs': [
            'hs code for cosmetics',
            'cosmetics hs code',
            'hs code for cosmetics products',
            'hs code for skin care products',
            'hs code for cosmetics cream',
            'cosmetics tariff code',
        ],
        'answer': 'Cosmetics are heading 3304: lip makeup 3304.10, eye makeup 3304.20, nail preparations 3304.30, powders 3304.91 and everything '
        'else — creams, lotions, serums, masks, sunscreen, foundation — 3304.99 (U.S. line 3304.99.50; petroleum jelly 3304.99.10). Hair '
        'products are 3305, oral care 3306, deodorants, shaving and bath products 3307, perfume 3303.00. All 3304 lines are Free at the base '
        f'rate. The U.S. imported {fmt_usd(v3304)} under 3304.99 in {Y}.',
        'link': '',
    },
    {
        'id': 'hs-perfume',
        'question': 'What is the HS code for perfume?',
        'searchedAs': ['hs code for perfume', 'perfume tariff code', 'hs code for perfume spray', 'hs code for perfume with alcohol', 'hs code for perfume oil'],
        'answer': 'Perfume and toilet water are 3303.00. In the U.S. schedule, perfume containing alcohol (eau de parfum, eau de toilette, '
        'cologne, body spray) is 3303.00.30.00; non-alcoholic perfume such as perfume oil is 3303.00.20.00, and floral waters 3303.00.10.00. All '
        'are Free at the base rate. Perfume oil mixtures sold as bases for making finished perfume go to 3302.90 (3302.90.10.10 or 3302.90.20.10), also Free. Empty perfume bottles are not in '
        'Chapter 33.',
        'link': '',
    },
    {
        'id': 'hs-essential-oils',
        'question': 'What is the HS code for essential oils?',
        'searchedAs': [
            'hs code for essential oils',
            'essential oils tariff code',
            'essential oil hs tariff code',
            'hs code for lavender essential oil',
            'hs code for eucalyptus essential oil',
            'tariffs on essential oils',
        ],
        'answer': 'Heading 3301. Orange oil is 3301.12 (2.7%), lemon 3301.13 (3.8%), peppermint 3301.24 (4.2%), other mints 3301.25 (Free), '
        'eucalyptus 3301.29.10 (1.8%), and most others — lavender (3301.29.51.18), rosemary (.37), lemongrass (.19), sandalwood (.39), tea tree '
        'and other oils (.50) — are 3301.29.51, Free. Blends of essential oils used as fragrance raw material are 3302; diffuser oils sold for '
        'scenting rooms are 3307.49 (6%). The Section 301 duty by country applies on top.',
        'link': '',
    },
    {
        'id': 'hs-personal-care',
        'question': 'What are the HS codes for shampoo, lipstick and toothpaste?',
        'searchedAs': ['hs code for shampoo', 'hs code for lipstick', 'hs code for toothpaste', 'hs code for mouthwash', 'hs code for lip gloss'],
        'answer': 'Shampoo is 3305.10.00.00, lipstick and lip gloss 3304.10.00.00, toothpaste 3306.10.00.00, dental floss 3306.20.00.00 and '
        'mouthwash 3306.90.00.00 — all Free at the base rate. Conditioner and other hair products are 3305.90.00.00. Lipstick and 3305.90 hair '
        'products from Canada pay the 50% Section 338 duty; toothpaste from China pays only the 12.5% Section 301 duty.',
        'link': '',
    },
    {
        'id': 'mocra',
        'question': 'Do I need FDA registration (MoCRA) to import cosmetics?',
        'searchedAs': ['mocra registration', 'mocra fda', 'mocra', 'mocra compliance', 'importing cosmetics to usa'],
        'answer': 'Not as an importer only. Under MoCRA the facility that manufactures or processes the cosmetic — foreign plants included, with a '
        'U.S. agent — must register with FDA and renew every two years, and the responsible person named on the label must list each product '
        'with its ingredients, report serious adverse events within 15 business days and keep safety records. An establishment that only labels, '
        'packs, holds or distributes does not register. FDA does not approve cosmetics (except color additives) and does not issue registration '
        'certificates.',
        'link': 'tariff-engineering',
    },
]

# ---------------------------------------------------------------------------------------------------
use_measures_fr_urls(d)  # the shipped file cites FR documents by measures.json's URLs (hand edit after this script ran; #1863)
json.dump(d, open(OUT, 'w'), ensure_ascii=False, indent=2)
print('wrote', OUT)
