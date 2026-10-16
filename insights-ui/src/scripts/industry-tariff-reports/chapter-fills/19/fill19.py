#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 19 content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill19.py <generated.json> <out.json>
Re-runnable: run it on every fresh generator output (the data parts come from the generator).
Facts below were checked against HTSUS 2026 Revision 21 (Chapters 4, 17, 19, 98, 99, General Notes),
the Federal Register, eCFR (up to date as of 2026-10-08), fda.gov and UN Comtrade (retrieved 2026-10-12).
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import json
import re
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
WT = IU

d = json.load(open(SRC))
TODAY = d['asOf']

CH19_PDF = 'https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2019'
CH17_PDF = 'https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2017'
CH04_PDF = 'https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%204'
CH98_PDF = 'https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2098'
CH99_PDF = 'https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2099'
GN_PDF = 'https://hts.usitc.gov/reststop/file?release=currentRelease&filename=General%20Notes'
ECFR = 'https://www.ecfr.gov/current/'


def fmt_usd(n):
    if n >= 1e9:
        return f'${n / 1e9:.2f}B'
    if n >= 1e8:
        return f'${n / 1e6:.0f}M'
    if n >= 1e6:
        return f'${n / 1e6:.1f}M'
    return f'${n / 1e3:.0f}K'


# ---------------------------------------------------------------------------------------------------
# Source pool: generator sources + those already used in Chapter 21 + new Chapter 19 sources
# ---------------------------------------------------------------------------------------------------
ref21 = json.load(open(f'{WT}/src/tariff-data/chapters/21-misc-edible-preparations.json'))
POOL = {}
for page in (ref21['tariffUpdates'], ref21['industryAreas']):
    for s in page['sources']:
        POOL.setdefault(s['id'], s)
for page in (d['tariffUpdates'], d['industryAreas']):
    for s in page['sources']:
        POOL[s['id']] = s


def fr_src(sid, citation, document, title, published, url, signed=None, publisher='Federal Register'):
    POOL[sid] = {
        'id': sid,
        'publisher': publisher,
        'citation': citation,
        'document': document,
        'title': title,
        'signed': signed,
        'published': published,
        'url': url,
    }


fr_src(
    'fr-2024-22179',
    '89 FR 79255',
    'Notice (Commerce/ITA)',
    'Certain Pasta From Italy and the Republic of Türkiye: Continuation of Antidumping Duty Orders and Countervailing Duty Orders',
    '2024-09-27',
    'https://www.federalregister.gov/documents/2024/09/27/2024-22179/certain-pasta-from-italy-and-the-republic-of-trkiye-continuation-of-antidumping-duty-orders-and',
)
fr_src(
    'fr-2025-16911',
    '90 FR 42743',
    'Notice (Commerce/ITA)',
    'Certain Pasta From Italy: Preliminary Results and Rescission, in Part, of Antidumping Duty Administrative Review; 2023-2024',
    '2025-09-04',
    'https://www.federalregister.gov/documents/2025/09/04/2025-16911/certain-pasta-from-italy-preliminary-results-and-rescission-in-part-of-antidumping-duty',
)
fr_src(
    'fr-2026-05099',
    '91 FR 12582',
    'Notice (Commerce/ITA)',
    'Certain Pasta From Italy: Final Results of Antidumping Duty Administrative Review; 2023-2024',
    '2026-03-16',
    'https://www.federalregister.gov/documents/2026/03/16/2026-05099/certain-pasta-from-italy-final-results-of-antidumping-duty-administrative-review-2023-2024',
)
fr_src(
    'fr-2026-15014',
    '91 FR 46770',
    'Notice (Commerce/ITA)',
    'Certain Pasta From Italy: Final Results of Countervailing Duty Administrative Review; 2023',
    '2026-07-24',
    'https://www.federalregister.gov/documents/2026/07/24/2026-15014/certain-pasta-from-italy-final-results-of-countervailing-duty-administrative-review-2023',
)
fr_src(
    'fr-2026-18185',
    '91 FR 56836',
    'Notice (Commerce/ITA)',
    'Initiation of Antidumping and Countervailing Duty Administrative Reviews',
    '2026-09-04',
    'https://www.federalregister.gov/documents/2026/09/04/2026-18185/initiation-of-antidumping-and-countervailing-duty-administrative-reviews',
)
fr_src(
    'pl-117-160',
    'Pub. L. 117-160, 136 Stat. 1345',
    'Public Law',
    'To amend the Harmonized Tariff Schedule of the United States to suspend temporarily rates of duty on imports of infant formula products, and for other purposes',
    '2022-07-21',
    'https://www.congress.gov/117/plaws/publ160/PLAW-117publ160.pdf',
    signed='2022-07-21',
    publisher='U.S. Congress',
)
fr_src(
    'fda-if-transition',
    '87 FR 60696',
    'Notice (FDA)',
    'Infant Formula Transition Plan for Exercise of Enforcement Discretion: Guidance for Industry; Availability',
    '2022-10-06',
    'https://www.federalregister.gov/documents/2022/10/06/2022-21794/infant-formula-transition-plan-for-exercise-of-enforcement-discretion-guidance-for-industry',
)
fr_src(
    'fda-if-discretion',
    'FDA web page (content current as of November 25, 2025)',
    'Web page',
    'Enforcement Discretion to Manufacturers to Increase Infant Formula Supplies',
    '2025-11-25',
    'https://www.fda.gov/food/infant-formula-guidance-documents-regulatory-information/enforcement-discretion-manufacturers-increase-infant-formula-supplies',
    publisher='FDA',
)
fr_src(
    'fda-stork-speed',
    'FDA press announcement',
    'Press announcement',
    'HHS, FDA Announce Operation Stork Speed to Expand Options for Safe, Reliable, and Nutritious Infant Formula for American Families',
    '2025-03-18',
    'https://www.fda.gov/news-events/press-announcements/hhs-fda-announce-operation-stork-speed-expand-options-safe-reliable-and-nutritious-infant-formula',
    publisher='FDA',
)

# The FDA transition-plan notice's FR citation is read from the API (kept accurate on re-runs).
try:
    import urllib.request

    meta = json.loads(
        urllib.request.urlopen(
            'https://www.federalregister.gov/api/v1/documents/2022-21794.json?fields[]=citation&fields[]=publication_date', timeout=30
        ).read()
    )
    POOL['fda-if-transition']['citation'] = meta['citation']
    POOL['fda-if-transition']['published'] = meta['publication_date']
except Exception as e:  # offline: keep the value above
    print('WARN: could not refresh 2022-21794 citation:', e)


def set_sources(page, ids):
    seen, out = set(), []
    for i in ids:
        if i in seen:
            continue
        seen.add(i)
        out.append(json.loads(json.dumps(POOL[i])))
    page['sources'] = out


# ---------------------------------------------------------------------------------------------------
# Trade figures
# ---------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
Y, PY = ui['latestYear'], ui['priorYear']
total = next(r['totalUsd'] for r in ui['byYear'] if r['year'] == Y)
prior_total = next(r['totalUsd'] for r in ui['byYear'] if r['year'] == PY)
total_2020 = next(r['totalUsd'] for r in ui['byYear'] if r['year'] == 2020)
by_c = {c['country']: c for c in ui['byCountry']}
trade = json.load(open(f'{WT}/src/tariff-data/trade/chapter-19.json'))
by_h = {h['heading']: h['byYear'] for h in trade['byHeading']}
by_hs6 = {h['hs6']: h for h in trade['byHs6']}
hc = {(r['heading'], r['country']): r['importsUsd'] for r in trade['byHeadingCountry']}


def imp(country):
    return by_c[country]['importsUsd'] if country in by_c else next(c['importsUsd'] for c in trade['byCountry'] if c['country'] == country)


def share(n):
    return round(n / total * 100)


CA, MX, IT, KR, FR = imp('Canada'), imp('Mexico'), imp('Italy'), imp('Rep. of Korea'), imp('France')
H1905 = by_h['1905'][str(Y)]
H1902 = by_h['1902'][str(Y)]
H1901 = by_h['1901'][str(Y)]
H1904 = by_h['1904'][str(Y)]
CA1905 = hc[('1905', 'Canada')]
MX1905 = hc[('1905', 'Mexico')]
IT1902 = hc[('1902', 'Italy')]
KR1902 = hc[('1902', 'Rep. of Korea')]
chg = (total - prior_total) / prior_total * 100
assert abs(total - 16118524239) < 1, 'trade data changed: re-check the prose figures'

# ---------------------------------------------------------------------------------------------------
# Labels
# ---------------------------------------------------------------------------------------------------
LABELS = {
    '1901': ('Malt extract; infant formula, mixes & doughs, dairy and cereal food preparations', 'Infant formula, mixes & malt'),
    '1902': ('Pasta, noodles & couscous', 'Pasta & noodles'),
    '1903': ('Tapioca and tapioca substitutes', 'Tapioca'),
    '1904': ('Breakfast cereals, muesli, bulgur & prepared grains', 'Breakfast cereals'),
    '1905': ("Bread, pastry, cakes, biscuits & other bakers' wares", "Bakers' wares"),
}
for g in d['overview']['productGroups']:
    g['label'] = LABELS[g['heading']][0]
for g in d['industryAreas']['groups']:
    g['label'], g['shortLabel'] = LABELS[g['heading']]
for g in d['tariffEngineering']['groups']:
    g['label'] = LABELS[g['heading']][0]

# ===================================================================================================
# OVERVIEW
# ===================================================================================================
ov = d['overview']
ov['h1'] = "HTS Chapter 19: Preparations of Cereals, Flour, Starch or Milk; Bakers' Wares — Tariff Rates"
ov['seo']['title'] = 'HTS Chapter 19 Tariff Rates: Pasta, Biscuits, Bread, Cereal & Infant Formula Import Duties | KoalaGains'
ov['seo']['shortDescription'] = (
    'Searchable duty table for all 111 HTS Chapter 19 tariff lines — infant formula (1901.10), cake mixes and doughs, '
    'pasta and noodles, breakfast cereals, biscuits, bread and pastry. General, FTA and Column 2 rates, dairy and sugar '
    'quota tiers, the 2026 Section 301 duties by country and the Italian pasta AD/CVD orders.'
)
ov['seo']['keywords'] = [
    'HTS Chapter 19',
    "preparations of cereals, flour, starch or milk; bakers' wares tariff",
    "preparations of cereals, flour, starch or milk; bakers' wares import duty rates",
    'hts chapter 19 tariff updates',
    'italian pasta import duty',
    'infant formula import duty',
    'hs code 1905.90',
    'sweet biscuits tariff',
    'breakfast cereals tariff',
    'pasta and couscous customs duty',
    'usmca chapter 19 tariff rates',
]
ov['intro'] = (
    "Chapter 19 covers food made from cereals, flour, starch or milk: **infant formula** and other preparations of heading 1901, "
    "cake mixes and doughs, **pasta and noodles**, tapioca, **breakfast cereals**, and **bread, biscuits, cakes and pastry**. "
    "Its **111 tariff lines** run from Free on dry pasta, bread and sweet biscuits to $1.035/kg + 14.9% on over-quota infant formula "
    "and $1.128/kg on over-quota margarine cheese.\n\n"
    f"The U.S. imported **{fmt_usd(total)}** of these goods in {Y}, and {share(H1905)}% of it was bakers' wares (heading 1905). "
    f"**Canada** ({fmt_usd(CA)}) and **Mexico** ({fmt_usd(MX)}) supplied {share(CA + MX)}%, then **Italy** ({fmt_usd(IT)}, mostly pasta) "
    f"and **South Korea** ({fmt_usd(KR)}, mostly noodles). On top of the base rate comes an **extra duty by country**: since July 24, 2026 "
    "a Section 301 tariff on 60 economies — 10% in total for EU goods, 12.5% in total for South Korea, +10% for the UK and India, "
    "+12.5% for Türkiye and Thailand, +20% for China (+37.5% on dry pasta, noodles and bread under List 3) and +37.5% for Brazil. "
    "USMCA-qualifying goods from Canada and Mexico are exempt — except four Canadian sugar mix and dough lines (1901.20.25, .35, .60, .70) "
    "that pay a 50% Section 338 duty even under USMCA. Tapioca is exempt for everyone.\n\n"
    "Dairy- and sugar-containing preparations of heading 1901 are under **tariff-rate quotas**: a low rate inside the quota and a high "
    "per-kilogram rate above it, with separate FTA quotas for Canada, Australia, Colombia and others. Dry pasta from Italy and Türkiye "
    "also carries **antidumping and countervailing duties** set by producer, which are collected on top and are not in the rate grid."
)

BLURBS = {
    '1901': (
        "Infant formula (1901.10), cake and bread mixes and doughs (1901.20), malt extract, puddings and dairy or cereal food preparations "
        "(1901.90). Most lines with over 10% milk solids or over 10% cane or beet sugar are quota lines: 10%–17.5% inside the quota, "
        "up to $1.035/kg + 14.9% above it. Plain mixes are 8.5%, other food preparations 6.4%, ready-to-eat puddings Free."
    ),
    '1902': (
        "Dry pasta and noodles made only of pasta (1902.11.20, 1902.19.20) are Free; pasta with sauce, stuffed pasta (ravioli, dumplings), "
        "cooked and instant noodles (1902.30) and couscous pay 6.4%. Non-egg dry pasta from Italy and Türkiye also owes antidumping and "
        "countervailing duties."
    ),
    '1903': "Tapioca and pearls from arrowroot, cassava or sago are Free; other starch substitutes pay 0.8¢/kg. Both are exempt from the 2026 Section 301 duties.",
    '1904': (
        "Corn flakes and puffed or roasted cereals (1904.10) pay 1.1%; muesli-type mixes of unroasted flakes 5.6% (airtight containers) "
        "or 14.9%; bulgur 14%; pre-cooked and other prepared grains (1904.90) 14%."
    ),
    '1905': (
        "Bread, pastry, cakes, sweet biscuits, cookies, crackers, waffles, wafers, gingerbread, rusks and crispbread are all Free. "
        "Only 1905.90.90 pays 4.5%: corn chips and similar savory snacks, pizza and quiche, communion wafers and rice paper."
    ),
}
SEARCH = {
    '1901': ['infant formula', 'baby formula', 'cake mix', 'pancake mix', 'dough', 'malt extract', 'pudding', 'dulce de leche', 'milk powder blend', 'baby cereal'],
    '1902': ['pasta', 'spaghetti', 'egg noodles', 'instant noodles', 'ramen', 'rice noodles', 'ravioli', 'dumplings', 'gnocchi', 'couscous'],
    '1903': ['tapioca', 'tapioca pearls', 'boba', 'sago'],
    '1904': ['breakfast cereal', 'corn flakes', 'granola', 'muesli', 'puffed rice', 'bulgur', 'instant rice'],
    '1905': ['bread', 'cookies', 'biscuits', 'crackers', 'cake', 'pastry', 'croissant', 'wafers', 'tortillas', 'pizza', 'corn chips', 'pretzels'],
}
for g in ov['productGroups']:
    g['blurb'] = BLURBS[g['heading']]
    g['searchExamples'] = SEARCH[g['heading']]

ov['workedExamples'] = [
    {
        'title': 'Dry pasta from Italy',
        'line': '1902.19.20',
        'body': (
            "Non-egg dry pasta is Free under the general rate. For EU goods with a base rate under 10%, the 2026 Section 301 action charges "
            "10% in total (9903.05.39), so a $100,000 container pays **$10,000**. Retail-size packs (up to 5 lb 4 oz) are also under the "
            "1996 antidumping and countervailing duty orders, which CBP collects as cash deposits by producer: for example 2.65% (La Molisana) "
            "or 7.00% (Garofalo) antidumping from March 16, 2026, 5.21% for the other reviewed firms and 15.45% for firms never reviewed, "
            "plus a countervailing deposit such as 3.32% for De Matteis. Certified organic and gluten-free pasta are outside the orders."
        ),
    },
    {
        'title': 'Cookies from Canada',
        'line': '1905.31.00',
        'body': (
            "Sweet biscuits are Free. Cookies that meet the USMCA rule (a change from any other chapter, so flour and sugar may be imported) "
            "and are entered under USMCA pay **nothing** (9903.05.93). A non-qualifying shipment pays the 10% Section 301 duty on Canada "
            "(9903.05.29): $5,000 on $50,000. No Chapter 19 bakers' ware is on a Canada Section 338 list or the September 29, 2026 import bans."
        ),
    },
    {
        'title': 'Infant formula from Germany',
        'line': '1901.10.16.00',
        'body': (
            "Retail infant formula with over 10% milk solids that contains oligosaccharides has a 100-tonne yearly quota (Chapter 19 note 2): "
            "17.5% inside it (1901.10.11), **$1.035/kg + 14.9%** above it. The quota is small, so most commercial shipments pay the over-quota "
            "rate. Because that rate already works out above 10%, the EU Section 301 rate adds nothing. A 1,000 kg, $20,000 shipment pays "
            "$1,035 + $2,980 = **$4,015**. FDA rules (21 CFR parts 106 and 107, and a new infant formula notification) apply before it can be sold."
        ),
    },
    {
        'title': 'Instant noodles from South Korea',
        'line': '1902.30.00',
        'body': (
            "Instant and other prepared noodles are 6.4%, Free under the U.S.–Korea FTA (KR). South Korea's Section 301 rate is 12.5% in "
            "total when the rate is lower (9903.05.71), so KORUS noodles pay **12.5%** — $6,250 on $50,000. From China the same noodles pay "
            "6.4% + 12.5% + 25% (List 3) = 43.9%."
        ),
    },
]

ov['tradeSnapshot']['coverageNote'] = 'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade.'
ov['tradeSnapshot']['biggestLines'] = [
    {'hts': '1905.90', 'label': "Bread, pastry, cakes and other bakers' wares n.e.s. (incl. pizza, snack chips)"},
    {'hts': '1905.31', 'label': 'Sweet biscuits (cookies)'},
    {'hts': '1905.32', 'label': 'Waffles and wafers'},
    {'hts': '1902.19', 'label': 'Uncooked pasta, not containing eggs'},
]

ov['notes']['chapterNotes'] = (
    "**Note 1.** This chapter does not cover: (a) except for stuffed products of heading 1902, food preparations containing more than 20 percent "
    "by weight of sausage, meat, meat offal, blood, insects, fish or crustaceans, molluscs or other aquatic invertebrates (chapter 16); "
    "(b) biscuits or other articles made from flour or starch, specially prepared for animal feeding (heading 2309); or (c) medicaments or other "
    "products of chapter 30.\n\n"
    "**Note 2.** For heading 1901, \"groats\" means cereal groats of chapter 11, and \"flour\" and \"meal\" mean cereal flour and meal of chapter 11 "
    "and flour, meal and powder of vegetable origin of any chapter, other than of dried vegetables (0712), potatoes (1105) or dried leguminous "
    "vegetables (1106).\n\n"
    "**Note 3.** Heading 1904 does not cover preparations containing more than 6 percent by weight of cocoa (totally defatted basis) or completely "
    "coated with chocolate or other cocoa preparations of heading 1806.\n\n"
    "**Note 4.** In heading 1904, \"otherwise prepared\" means prepared or processed beyond what the headings and notes of chapters 10 and 11 provide for."
)
ov['notes']['additionalUsNotes'] = (
    "**Note 1.** \"Mixes and doughs described in additional U.S. note 1 to chapter 19\" are articles with over 10 percent by dry weight of cane or beet "
    "sugar, except retail-packed non-crystalline articles, blended syrups for further processing, and articles over 65 percent sugar for further processing.\n\n"
    "**Note 2.** Quota for FDA-approved infant formula containing oligosaccharides under 1901.10.11 and 1901.10.33: **100 metric tons** a calendar year "
    "(Mexico excluded).\n\n"
    "**Note 3.** Quota for those mixes and doughs under 1901.20.30 and 1901.20.65: **5,398 metric tons** from October 1 to September 30 (Mexico excluded).\n\n"
    "**Other quotas that reach this chapter** are set in the notes to Chapter 4 (dairy: note 10, 4,105,000 kg a year for \"dairy products described in "
    "additional U.S. note 1 to chapter 4\"; note 23, margarine cheese, with USDA import licenses) and Chapter 17 (sugar: note 8, 64,709 tonnes from October 1 "
    "for articles over 10% sugar; note 7, articles over 65% sugar, set at **none**). Lines \"described in general note 15\" are for samples, government and "
    "personal-use entries outside the quotas."
)

# ===================================================================================================
# TARIFF UPDATES
# ===================================================================================================
tu = d['tariffUpdates']
tu['h1'] = "HTS Chapter 19: Preparations of Cereals, Flour, Starch or Milk; Bakers' Wares — Tariff Updates"
tu['seo']['title'] = 'HTS Chapter 19 Tariff Updates — Pasta, Bakery, Cereal & Infant Formula Duties Since January 2025 | KoalaGains'
tu['seo']['shortDescription'] = (
    'What changed for HTS Chapter 19 (pasta, biscuits, bread, breakfast cereals, infant formula) since January 2025: base rates on all 111 lines, '
    'the end of the IEEPA and Section 122 duties, the 2026 Section 301 tariffs, Canada Section 338 on mixes and doughs, and the Italian pasta '
    'AD/CVD reviews — with Federal Register citations.'
)
tu['seo']['keywords'] = [
    'HTS Chapter 19 tariff updates',
    "preparations of cereals, flour, starch or milk; bakers' wares tariff updates",
    'section 301 tariffs on baked goods',
    'italian pasta tariff',
    'pasta antidumping duty italy',
    'canada tariff on hts chapter 19',
    'usmca bakers wares import duty',
    'breakfast cereals tariff updates',
]
tu['intro'] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current "
    "**2026 Revision 21** (in force October 9, 2026). No Chapter 19 base rate changed: 101 of the 111 lines are the same, and the other 10 are "
    "new statistical splits for certified organic products (dry pasta, cereals, sweet biscuits and bread) that carry their parent line's rate.\n\n"
    "Everything that changed came on top of the base rate. The 2025 IEEPA duties (Canada +35%, Mexico +25%, the reciprocal tariff on everyone else) "
    "**ended on February 24, 2026**, and the 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026**, goods "
    "from 60 economies pay a **Section 301 tariff of 10% or 12.5%**; only tapioca (1903) is on its general exemption list. China pays more because "
    "older Section 301 duties stack on top (25% on dry pasta, noodles, bread and 1901.90.91 under List 3; 7.5% on the rest), and Brazil adds a "
    "separate 25%. **USMCA-qualifying goods from Canada and Mexico are still exempt**, but four Canadian sugar mix and dough lines pay the 50% "
    "Section 338 duty since August 22, 2026 whether or not they qualify.\n\n"
    "Separately, Commerce cut the antidumping deposit rates on **Italian pasta** in its final 2023–2024 review (March 16, 2026: 2.65%–7.00%, after "
    "a preliminary 91.74%) and set new countervailing rates on July 24, 2026."
)
tu['scope'] = (
    "Measures that reach Chapter 19 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 tariff, the older China "
    "Section 301 lists, the Canada Section 338 duties on four 1901.20 lines, the 2025–2026 IEEPA and Section 122 duties that have ended, the scheduled "
    "Nicaragua tariff, and the antidumping and countervailing duty orders on pasta from Italy and Türkiye. Infant formula policy (FDA) and quota rules "
    "are on Duty-saving rules. For the rate each supplier pays, see Rates by country."
)

S301_EXEMPT = (
    "Tapioca (1903.00.20, 1903.00.40) is on the general exemption list (U.S. note 52(b), 9903.05.86), and bakers' wares for religious purposes only "
    "(communion wafers and similar, 1905.90.10 and 1905.90.90) are exempt by description (note 52(c), 9903.05.87). No other Chapter 19 line is exempt."
)
IEEPA_END = 'The IEEPA reciprocal duty ended February 24, 2026, and the Section 122 surcharge expired July 23, 2026.'
FTA_NOTE = 'An FTA claim removes the base rate but not the Section 301 duty (U.S. note 52(a)).'

INEFFECT = {
    'ca-section-301': (
        "USMCA-qualifying goods entered under USMCA pay no Section 301 duty (9903.05.93). "
        + S301_EXEMPT
        + " The 2025 IEEPA duty on Canada (+35%, 9903.01.10) ended February 24, 2026. **Section 338:** four Chapter 19 lines are on the 2026 Canada lists "
        "(U.S. note 51(b)) and pay +50% even when entered under USMCA (note 51(a)): 1901.20.35 (dairy list, 9903.03.13, Proclamation 11047) and 1901.20.25, "
        "1901.20.60, 1901.20.70 (the list named for motor vehicles, 9903.03.14, Proclamation 11048) — the over-quota mixes and doughs with over 10% or over 65% "
        "sugar. The duty also applies to goods entered under Canada's USMCA quotas in Chapter 98 subchapter XXIII. None of the four is in the Annex to "
        "Proclamation 11062, so the September 29, 2026 dairy import ban does not reach Chapter 19.",
        "USMCA bread, cookies, pasta, cereal and infant formula from Canada pay $0 extra; non-qualifying goods pay the base rate plus 10%. On the dairy and "
        "sugar quota lines, USMCA goods are Free inside Canada's quotas (2026: 1,919 t of \"other dairy products\" under 9823.08.02, 9,600 t of "
        "sugar-containing products under 9823.10.02) and pay the over-quota rate plus 10% above them. Sugar mixes and doughs under 1901.20.25/.35/.60/.70 "
        "pay 50% inside Canada's quota and 42.3¢/kg + 68.5% above it.",
        '2026-08-22',
        'procl-11048',
    ),
    'mx-section-301': (
        "USMCA-qualifying goods entered under USMCA pay no Section 301 duty (9903.05.94). " + S301_EXEMPT + " The 2025 IEEPA duty on Mexico (+25%, 9903.01.01) "
        "ended February 24, 2026.",
        "USMCA-qualifying Mexican bread, tortillas, cookies and cereal pay nothing — and the dairy and sugar quota lines are Free for Mexico with no quantity "
        "limit (9823.xx.01). Goods that do not qualify pay the base rate plus 10%.",
        None,
        None,
    ),
    'eu-section-301': (
        "For EU goods whose base rate (or its ad valorem equivalent) is under 10%, the total is 10% (9903.05.39); at or above 10%, nothing is added "
        "(9903.05.38, U.S. note 52(k)). " + S301_EXEMPT + " This replaced the 15% IEEPA reciprocal rate (9903.02.20), which ended February 24, 2026. "
        "Pasta from Italy also owes antidumping and countervailing duties (see the change log).",
        "Italian pasta, French pastry and German biscuits (Free or 6.4% base) pay 10% in total — $10,000 on a $100,000 shipment. Over-quota dairy and sugar "
        "lines whose per-kilogram rate already works out above 10% pay only that rate.",
        None,
        None,
    ),
    'kr-section-301': (
        "For Korean goods whose rate (or its ad valorem equivalent) is under 12.5%, the total is 12.5% (9903.05.71); at or above, nothing is added (U.S. note 52(k)). "
        "Every Chapter 19 line lists KORUS (KR), so a KORUS claim makes the base rate Free and the total 12.5%. " + S301_EXEMPT + " " + IEEPA_END,
        "Korean instant noodles, snacks and cereal pay 12.5% of value in total, with or without the KORUS claim.",
        None,
        None,
    ),
    'th-section-301': (
        "Base rate + 12.5% (9903.05.77). " + S301_EXEMPT + " " + IEEPA_END,
        "Thai rice noodles (6.4% when prepared) pay 18.9%; dry noodles of pasta only and biscuits (Free) pay 12.5%; tapioca pearls stay Free.",
        None,
        None,
    ),
    'in-section-301': (
        "Base rate + 10% (9903.05.44). " + S301_EXEMPT + " GSP (A) has been expired since December 31, 2020. " + IEEPA_END,
        "Indian biscuits and bread (Free) pay 10%; snack chips (4.5%) 14.5%; prepared foods at 6.4% pay 16.4%.",
        None,
        None,
    ),
    'gb-section-301': (
        "Base rate + 10% (9903.05.81). " + S301_EXEMPT + " " + IEEPA_END,
        "British biscuits and cakes (Free) pay 10%; breakfast cereals (1.1%) 11.1%; over-quota dairy preparations the over-quota rate plus 10%.",
        None,
        None,
    ),
    'cn-section-301': (
        "Two Section 301 duties stack: +12.5% under the 2026 action (9903.05.31, from July 24, 2026) and an older one — +25% under List 3 (9903.88.03) on "
        "1901.90.91 (other food preparations), 1902.19.20 and 1902.19.40 (dry pasta and noodles without egg), 1902.20 (stuffed pasta, dumplings), 1902.30 "
        "(other pasta, instant noodles) and 1905.90.10 (bread, pastry, cakes), or +7.5% under List 4A (9903.88.15, 7.5% since February 14, 2020) on every "
        "other line. Tapioca skips the 12.5% but still pays List 4A. No China exclusion in effect (note 20(vvv)–(www)) names a Chapter 19 product. The IEEPA "
        "duties on China ended February 24, 2026.",
        "Chinese noodles and dumplings (6.4%) pay 43.9%, dry noodles and bread (Free) 37.5%, sweet biscuits (Free) 20%, tapioca pearls 7.5%.",
        None,
        None,
    ),
    'tr-section-301': (
        "Base rate + 12.5% (9903.05.79). " + S301_EXEMPT + " Non-egg dry pasta from Türkiye is also under the 1996 antidumping and countervailing duty orders "
        "(A-489-805, C-489-806), continued on September 19, 2024; deposits are company-specific. " + IEEPA_END,
        "Turkish dry pasta and biscuits (Free) pay 12.5% plus, for pasta, any AD/CVD deposit; other pasta (6.4%) 18.9%.",
        None,
        None,
    ),
    'au-section-301': (
        "Base rate + 12.5% (9903.05.23). " + S301_EXEMPT + " " + FTA_NOTE + " Australian dairy preparations, including infant formula, have their own FTA quota "
        "(9822.04.25, U.S. note 13 to subchapter XXII; Free with a valid Australian export certificate), and above it pay the over-quota rate. The sugar mix "
        "and dough lines do not list AU. " + IEEPA_END,
        "Australian bakery, pasta and cereal enter Free under the FTA and pay 12.5%. Infant formula pays 12.5% within Australia's FTA quota and "
        "$1.035/kg + 27.4% above it.",
        None,
        None,
    ),
    'co-section-301': (
        "Base rate + 12.5% (9903.05.32). " + S301_EXEMPT + " " + FTA_NOTE + " Sugar-containing quota lines are Free within Colombia's TPA sugar quota "
        "(9822.08.01) and pay the base rate above it; the dairy quota lines (9918.04.60–9918.04.80) and margarine cheese (9918.04.50–9918.04.59) are Free "
        "at any quantity in 2026. " + IEEPA_END,
        "Colombian bakery and dairy preparations pay 12.5%; sugar mixes pay 12.5% within the sugar quota and 42.3¢/kg + 21% above it.",
        None,
        None,
    ),
    'br-section-301': (
        "+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 (9903.05.27). Tapioca "
        "(1903.00.20, 1903.00.40) is on both exemption lists (U.S. notes 50(a)(ii) and 52(b)); religious-purpose bakers' wares are exempt by description "
        "(9903.05.04, 9903.05.87). The IEEPA duties on Brazil (including the 40% under 9903.01.77) ended February 24, 2026.",
        "Brazilian tapioca stays Free; biscuits and bread (Free) pay 37.5%; prepared foods at 6.4% pay 43.9%.",
        None,
        None,
    ),
    'ch-section-301': (
        "For Swiss goods whose base rate (or its ad valorem equivalent) is under 12.5%, the total is 12.5% (9903.05.74); at or above, nothing is added "
        "(U.S. note 52(k)). " + S301_EXEMPT + " " + IEEPA_END,
        "Swiss biscuits, crispbread and pastry (Free) pay 12.5%; bulgur and muesli at 14% or 14.9% pay only their base rate.",
        None,
        None,
    ),
    'other-section-301': (
        "Rates by country: Japan 12.5% in total and Taiwan 10% in total when the base rate is lower (9903.05.49, 9903.05.76); Vietnam, the Philippines, "
        "Israel and New Zealand +12.5%; Malaysia, Indonesia, Pakistan and Bangladesh +10%. " + S301_EXEMPT + " No Chapter 19 line is on a country exception "
        "list in U.S. note 52(j). Countries outside the 60 economies pay no extra duty.",
        "A 6.4% noodle product from Vietnam pays 18.9%, from Malaysia 16.4%, from Japan 12.5%; from a country outside the 60 (for example Ukraine) only the base rate.",
        None,
        None,
    ),
}
for e in tu['inEffect']:
    ex, wm, eff, effsrc = INEFFECT[e['id']]
    e['exemption'], e['whatItMeans'] = ex, wm
    if eff:
        e['effectiveFrom'], e['effectiveSourceId'] = eff, effsrc
    if e['id'] in ('tr-section-301', 'eu-section-301') and 'fr-2024-22179' not in e['sourceIds']:
        e['sourceIds'].insert(-1, 'fr-2024-22179')
    if e['id'] == 'eu-section-301':
        for s in ('fr-2026-05099', 'fr-2026-15014'):
            e['sourceIds'].insert(-1, s)
    if e['id'] == 'ca-section-301':
        for s in ('procl-11062', 'hts-ch98-usmca', 'eo-14389'):
            if s not in e['sourceIds']:
                e['sourceIds'].insert(-1, s)
    if e['id'] == 'mx-section-301':
        for s in ('hts-ch98-usmca', 'eo-14389'):
            e['sourceIds'].insert(-1, s)
    if e['id'] in ('au-section-301', 'co-section-301'):
        e['sourceIds'].insert(-1, 'hts-ch98-usmca')
    if e['id'] == 'other-section-301':
        e['country'] = 'Other Section 301 economies (incl. Japan, Taiwan, Vietnam, Israel, the Philippines, Malaysia, Indonesia, New Zealand)'
        e['now'] = '+10% or +12.5%, or 10%–12.5% in total'
    if e['id'] == 'ca-section-301':
        e['measure'] = 'Section 301 tariff (2026, forced-labor investigations) + Section 338 (Canada) on four 1901.20 lines'
        e['now'] = '+10% (USMCA goods exempt); +50% on 1901.20.25/.35/.60/.70 even under USMCA'

# Change log (newest first) -----------------------------------------------------------------------
gen_changes = {c['id']: c for c in tu['changes']}
base = gen_changes['base-rates']
base['title'] = 'No Chapter 19 base-rate changes'
base['detail'] = (
    "All 111 Chapter 19 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition. Ten statistical "
    "lines are new — certified organic and other splits of 1902.19.20 (dry pasta, EU and non-EU), 1904.10.00 (prepared cereals), 1905.31.00 "
    "(sweet biscuits) and 1905.90.10 (bread and pastry) — and take their 8-digit parent's rate (Free or 1.1%)."
)
nic = gen_changes['section-301-nicaragua-scheduled-2027-01-01']
nic['title'] = 'Scheduled: Section 301 tariff on products of Nicaragua'
nic['detail'] = (
    "Products of Nicaragua that pay the column 1-general rate (that is, not entered under CAFTA-DR) will pay +10% (9903.89.01) from January 1, 2027 "
    "and +15% from January 1, 2028. CAFTA-DR originating goods are not covered (U.S. note 29). Today Nicaragua pays the 12.5% 2026 Section 301 duty (9903.05.58)."
)
c338 = gen_changes['section-338-canada-2026-08-22']
c338['title'] = 'Canada Section 338 duties take effect on four mix and dough lines'
c338['detail'] = (
    "50% on Canadian goods on three lists (9903.03.12–9903.03.14) took effect after a 3-day suspension lapsed. Four Chapter 19 lines are listed: "
    "1901.20.35 on the dairy list (note 51(b)(2), 9903.03.13) and 1901.20.25, 1901.20.60 and 1901.20.70 on the list named for motor vehicles "
    "(note 51(b)(3), 9903.03.14). The duty applies even to goods entered under USMCA or Canada's USMCA quotas (U.S. note 51(a))."
)
c338['countries'] = 'Canada'
s301 = gen_changes['section-301-2026-60-economies-2026-07-24']
s301['title'] = 'Section 301 tariffs on 60 economies cover Chapter 19'
s301['detail'] = (
    "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). Only tapioca (1903.00.20, 1903.00.40) is on the general exemption list in "
    "U.S. note 52(b); religious-purpose bakers' wares are exempt by description (note 52(c)). EU goods pay 10% in total; Japan, South Korea and "
    "Switzerland 12.5% in total. USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94)."
)
br = gen_changes['section-301-brazil-2026-07-22']
br['title'] = 'Section 301 tariff on products of Brazil'
br['detail'] = (
    "25% on all goods of Brazil (9903.05.01). The exemption list (U.S. note 50(a)(ii)) covers tapioca (1903.00.20, 1903.00.40), and religious-purpose "
    "bakers' wares are exempt by description (note 50(a)(iii)). From July 24 the 12.5% forced-labor tariff (9903.05.27) is added on top."
)


def change(cid, ctype, date, label, title, detail, before, now, countries, sids):
    return {
        'id': cid,
        'type': ctype,
        'date': date,
        'dateLabel': label,
        'title': title,
        'detail': detail,
        'before': before,
        'now': now,
        'countries': countries,
        'sourceIds': sids,
    }


extra = [
    change(
        'pasta-reviews-2026',
        'reference',
        '2026-09-04',
        'Initiated',
        'New reviews of the Italian pasta orders',
        "Commerce initiated administrative reviews of the antidumping order on pasta from Italy for July 2025–June 2026 (A-475-818) and of the "
        "countervailing duty order for calendar 2025 (C-475-819). Current deposit rates stay in place until those reviews are final.",
        None,
        None,
        'Italy',
        ['fr-2026-18185'],
    ),
    change(
        'ca-dairy-ban',
        'reference',
        '2026-09-29',
        'Effective',
        'Canada dairy import ban does not reach Chapter 19',
        "From September 29, 2026 certain Canadian dairy products moved from the 50% Section 338 duty to an import ban (Proclamation 11062). The Annex "
        "names products in Chapters 4, 17 and 22 only; 1901.20.35, the one Chapter 19 line on the dairy duty list, still pays the 50% duty and is not banned.",
        None,
        None,
        'Canada',
        ['procl-11062', 'hts-now'],
    ),
    change(
        'pasta-cvd-final-2026',
        'reference',
        '2026-07-24',
        'Effective',
        'Italian pasta: final countervailing duty rates for 2023',
        "Commerce's final results of the 2023 review set countervailable subsidy rates of 3.32% for De Matteis and 3.21% for Granoro (Pastificio Attilio "
        "Mastromauro), and 3.32% for the two non-examined firms (Antiche Tradizioni di Gragnano, Pastificio Sgambaro). Cash deposits at these rates apply "
        "to entries from July 24, 2026; other firms keep their last rate.",
        None,
        '3.21%–3.32% (reviewed firms)',
        'Italy',
        ['fr-2026-15014'],
    ),
    change(
        's122-end',
        'extraDuty',
        '2026-07-23',
        'Expired',
        'Section 122 import surcharge expired',
        'The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.',
        '+10%',
        'None',
        'All',
        ['procl-11012', 'hts-now'],
    ),
    change(
        'usmca-review',
        'reference',
        '2026-07-01',
        'Announced',
        'USMCA joint review: not renewed, still in force',
        "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the "
        "issues or until termination, so USMCA claims (SPI S, S+) and the Canada and Mexico quota provisions in Chapter 98 subchapter XXIII still apply.",
        None,
        None,
        'Canada, Mexico',
        ['ustr-usmca-review'],
    ),
    change(
        'pasta-ad-final-2026',
        'reference',
        '2026-03-16',
        'Effective',
        'Italian pasta: final antidumping rates far below the preliminary 91.74%',
        "In the final results of the July 2023–June 2024 review, Commerce set dumping margins of 2.65% for La Molisana, 7.00% for Pastificio Lucio "
        "Garofalo and 5.21% for the 11 non-selected companies, replacing the preliminary 91.74%. These are the cash deposit rates from March 16, 2026; "
        "firms never individually reviewed keep the 15.45% all-others rate. Gluten-free and EU-certified organic pasta are outside the order.",
        '91.74% (preliminary)',
        '2.65%–7.00%',
        'Italy',
        ['fr-2026-05099', 'fr-2025-16911', 'fr-2024-22179'],
    ),
    change(
        's122-start',
        'extraDuty',
        '2026-02-24',
        'Effective',
        'Section 122 surcharge replaces the IEEPA tariffs',
        "10% on products of all countries (9903.03.01) until July 23, 2026. Tapioca (1903.00.20, 1903.00.40) was on the product exemption list "
        "(9903.03.03), and religious-purpose bakers' wares were exempt by description (9903.03.04). USMCA-qualifying goods from Canada and Mexico "
        "were exempt (9903.03.07, 9903.03.08).",
        'None',
        '+10% (until July 23, 2026)',
        'All',
        ['procl-11012', 'hts-now'],
    ),
    change(
        'ieepa-end',
        'extraDuty',
        '2026-02-24',
        'Effective',
        'All IEEPA tariffs end',
        "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 "
        "ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 a.m. ET on February 24. "
        "The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.",
        'Varied by country',
        'None',
        'All',
        ['scotus-24-1287', 'eo-14389', 'csms-67834313'],
    ),
    change(
        'agoa-renewed',
        'reference',
        '2026-02-03',
        'Signed',
        'AGOA reauthorized through December 31, 2026',
        "The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025. AGOA (SPI D) makes most dutiable "
        "Chapter 19 lines Free for listed sub-Saharan countries; the over-quota dairy and sugar lines do not list D. GSP (SPI A, A*, A+) remains expired "
        "since December 31, 2020.",
        'Lapsed (from September 30, 2025)',
        'In force to December 31, 2026',
        'AGOA beneficiary countries',
        ['ustr-agoa-2026', 'crs-agoa', 'procl-11030', 'cbp-gsp', 'hts-now'],
    ),
    change(
        'infant-formula-transition-end',
        'reference',
        '2025-10-18',
        'Ended',
        "FDA's infant formula transition plan guidance ran to October 18, 2025",
        "The 2022 guidance let infant formula made abroad stay on the U.S. market under FDA enforcement discretion while makers worked toward full "
        "compliance; it was in effect until October 18, 2025. FDA's page lists six manufacturers (Bubs Australia, Danone, Kendal Nutricare, The a2 Milk "
        "Company, Reckitt/Mead Johnson and Vitaflo) whose products stayed in the plan and that filed new infant formula submissions by the July 15, 2025 "
        "deadline. This is an FDA marketing rule; it never changed the tariff.",
        None,
        None,
        'All',
        ['fda-if-transition', 'fda-if-discretion'],
    ),
    change(
        'pasta-ad-prelim-2025',
        'reference',
        '2025-09-04',
        'Published',
        'Italian pasta: preliminary antidumping rate of 91.74%',
        "Commerce preliminarily found that the two examined Italian producers, La Molisana and Garofalo, had not cooperated and assigned 91.74% to them and "
        "to 11 other producers for July 2023–June 2024. It was a preliminary rate and was never collected as a deposit; the final results on March 16, 2026 "
        "replaced it with 2.65%–7.00%.",
        None,
        '91.74% (preliminary, not in force)',
        'Italy',
        ['fr-2025-16911'],
    ),
    change(
        'ca-amended',
        'extraDuty',
        '2025-07-31',
        'Signed',
        'Canada additional duty raised to 35%',
        'Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.',
        '+25%',
        '+35% (ended)',
        'Canada',
        ['eo-14325'],
    ),
    change(
        'reciprocal',
        'extraDuty',
        '2025-04-02',
        'Signed',
        'Reciprocal tariff on products of all countries',
        "10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. Tapioca was on the exemption list (U.S. note 2(v)(iii)). "
        "Ended February 24, 2026.",
        'None',
        '+10% or more (ended)',
        'All except Canada, Mexico',
        ['eo-14257', 'hts-now'],
    ),
    change(
        'infant-formula-stork-speed',
        'reference',
        '2025-03-18',
        'Announced',
        'Operation Stork Speed (FDA infant formula review)',
        "HHS and FDA announced a review of infant formula nutrient requirements, more contaminant testing and steps to encourage new manufacturers, and "
        "kept the personal-importation policy for infant formula begun in 2022. No tariff change.",
        None,
        None,
        'All',
        ['fda-stork-speed'],
    ),
    change(
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
    change(
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
all_changes = list(gen_changes.values()) + extra
all_changes.sort(key=lambda c: c['date'], reverse=True)
tu['changes'] = all_changes

tu['stats'] = [
    {'label': 'Base rates unchanged', 'value': '101 of 111 lines'},
    {'label': 'New or renumbered lines', 'value': '10 of 111', 'note': 'organic statistical splits'},
    {'label': 'Extra duties in effect', 'value': str(len(tu['inEffect']))},
    {'label': 'Compared', 'value': '2025 Basic → Rev 21'},
    {'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'},
]

used = {'hts-now', 'hts-before', 'hts-now-cr'}
for e in tu['inEffect']:
    used.update(e['sourceIds'])
for c in tu['changes']:
    used.update(c['sourceIds'])
order = [s['id'] for s in tu['sources']] + [k for k in POOL if k not in [s['id'] for s in tu['sources']]]
set_sources(tu, [k for k in order if k in used])

# ===================================================================================================
# UNDERSTAND INDUSTRY
# ===================================================================================================
ui['h1'] = "HTS Chapter 19: Preparations of Cereals, Flour, Starch or Milk; Bakers' Wares — U.S. Import Statistics"
ui['seo']['title'] = 'HTS Chapter 19 Import Statistics: Bakery, Pasta, Cereal & Infant Formula Imports by Country | KoalaGains'
ui['seo']['shortDescription'] = (
    f"U.S. imports of cereal, flour and milk preparations and bakers' wares 2020–{Y}: by country, by product and over time. "
    f"{fmt_usd(total)} in {Y}, {share(CA + MX)}% from Canada and Mexico; bread, biscuits and other bakers' wares are {share(H1905)}% of the total."
)
ui['seo']['keywords'] = [
    'HTS Chapter 19 import statistics',
    'us bakery imports by country',
    'italian pasta imports us',
    'bakery and cereals trade impact',
    'hts 1905.10 crispbreads tariff',
    'us imports of biscuits and cookies',
    'canada bakery exports to us',
]
for c in ui['byCountry']:
    if c['mainHeading'] in LABELS:
        c['mainHeadingLabel'] = LABELS[c['mainHeading']][0]
    if c['country'] == 'Rep. of Korea':
        c['country'] = 'South Korea'
for r in ui['byHeadingCountry']:
    if r['country'] == 'Rep. of Korea':
        r['country'] = 'South Korea'
HS6_LABEL = {
    '1905.90': "Bread, pastry, cakes and other bakers' wares n.e.s.; communion wafers, rice paper",
    '1905.31': 'Sweet biscuits (cookies)',
    '1905.32': 'Waffles and wafers',
    '1902.19': 'Pasta, uncooked, not stuffed, without eggs',
    '1901.90': 'Malt extract and food preparations of flour, starch or milk n.e.s.',
    '1902.30': 'Other pasta (cooked, instant noodles)',
    '1901.20': "Mixes and doughs for bakers' wares",
    '1904.10': 'Prepared foods from swelling or roasting cereals (corn flakes, puffed cereals)',
    '1904.90': 'Cereals in grain form, pre-cooked or otherwise prepared',
    '1901.10': 'Preparations for infants or young children, retail (infant formula)',
    '1902.20': 'Stuffed pasta (ravioli, dumplings)',
    '1905.40': 'Rusks, toasted bread and similar toasted products',
    '1905.20': 'Gingerbread and the like',
    '1904.20': 'Prepared foods from unroasted cereal flakes (muesli)',
    '1902.11': 'Pasta, uncooked, containing eggs',
    '1903.00': 'Tapioca and substitutes',
    '1905.10': 'Crispbread',
    '1902.40': 'Couscous',
    '1904.30': 'Bulgur wheat',
}
for l in ui['byLine']:
    if l['hs6'] in HS6_LABEL:
        l['description'] = HS6_LABEL[l['hs6']]
        l['searchText'] = f"{l['hs6'].replace('.', '')} {l['hs6']} {l['description'].lower()} {LABELS[l['heading']][0].lower()}"
for s in ui['stats']:
    if s['label'] == 'Largest product':
        s['note'] = "Bread, pastry, cakes and other bakers' wares n.e.s. (1905.90)"
    if s['label'].startswith('Top 2') or 'share' in s['label']:
        pass
ui['byYearCaption'] = f'U.S. imports of Chapter 19 goods each year, split into the two USMCA partners (Canada and Mexico) and everyone else.'
hs = lambda k: by_hs6[k.replace('.', '')]
infant = hs('1901.10')
ui['why'] = (
    f"U.S. imports of Chapter 19 goods were **{fmt_usd(total)} in {Y}**, {abs(chg):.1f}% less than the {fmt_usd(prior_total)} of {PY} and up from "
    f"{fmt_usd(total_2020)} in 2020. Bakers' wares dominate: heading 1905 was {fmt_usd(H1905)} ({share(H1905)}%), led by bread, pastry, cakes and "
    f"snacks (1905.90, {fmt_usd(hs('1905.90')['importsUsd'])}) and sweet biscuits (1905.31, {fmt_usd(hs('1905.31')['importsUsd'])}). Pasta and noodles "
    f"(heading 1902) were {fmt_usd(H1902)}, the preparations of heading 1901 {fmt_usd(H1901)} and breakfast cereals (1904) {fmt_usd(H1904)}.\n\n"
    f"**Canada** is by far the largest supplier ({fmt_usd(CA)}, {share(CA)}%), {fmt_usd(CA1905)} of it bakers' wares; **Mexico** ({fmt_usd(MX)}) is "
    f"second, also mostly bakery ({fmt_usd(MX1905)}). Both pay no extra duty on USMCA-qualifying goods. **Italy** ({fmt_usd(IT)}) ships mostly pasta "
    f"({fmt_usd(IT1902)}), which pays 10% under the 2026 Section 301 action plus producer-specific antidumping and countervailing deposits. "
    f"**South Korea** ({fmt_usd(KR)}) is mostly noodles ({fmt_usd(KR1902)}). Infant formula and other retail preparations for infants and young "
    f"children (1901.10) were {fmt_usd(infant['importsUsd'])}, down from {fmt_usd(infant['priorImportsUsd'])}.\n\n"
    f"The figures are annual and stop at {Y}, before the 2026 tariff changes (the end of the IEEPA duties in February, the Section 301 tariffs from "
    "July 24 and the Canada Section 338 duties from August 22, 2026); they do not show what those changes did. Duty-collected figures are not "
    "available from an official source yet."
)
ui['sources'] = [
    {'label': f'UN Comtrade (public API), United States imports, HS chapter 19 (retrieved {trade["retrievedAt"]})', 'url': 'https://comtradeplus.un.org/'},
    {'label': 'HTSUS 2026 Revision 21, Chapter 99, U.S. notes 51–52 (Section 338 and Section 301 lists)', 'url': CH99_PDF},
]
ui['coverageNote'] = 'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade.'
ov['tradeSnapshot']['topCountries'] = [{'name': 'South Korea' if c['name'] == 'Rep. of Korea' else c['name'], 'importsUsd': c['importsUsd']} for c in ov['tradeSnapshot']['topCountries']]

# ===================================================================================================
# INDUSTRY AREAS (rates by country)
# ===================================================================================================
ia = d['industryAreas']
ia['h1'] = "HTS Chapter 19: Preparations of Cereals, Flour, Starch or Milk; Bakers' Wares — Tariff Rates by Country"
ia['seo']['title'] = 'HTS Chapter 19 Tariff Rates by Country — Pasta, Bakery, Cereal & Infant Formula from Canada, Mexico, Italy, Korea | KoalaGains'
ia['seo']['shortDescription'] = (
    'The total U.S. tariff on Chapter 19 goods — bread, biscuits, pasta, noodles, breakfast cereals, infant formula and mixes — by country and '
    'product group: base rate plus the 2026 Section 301 duty, with USMCA, EU, FTA quota and Canada Section 338 rules applied.'
)
ia['seo']['keywords'] = [
    'HTS Chapter 19 tariff rates by country',
    "us tariff on preparations of cereals, flour, starch or milk; bakers' wares",
    'italian pasta tariff',
    'south korean instant noodles customs duty',
    'dairy mixes import duty',
    'usmca chapter 19 tariff',
    'french pastries import duty rates',
    'china tariff on pasta',
]
ia['intro'] = (
    "The total rate on Chapter 19 goods depends as much on **where they come from** as on what they are. Each cell below is the base rate for that "
    "product group plus the extra duty for that country, minus any preference — taken from the current tariff schedule.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is the **Section 301 tariff on 60 economies** that started July 24, 2026. "
    "**USMCA-qualifying goods from Canada and Mexico pay no extra duty** (except Canada's four Section 338 mix and dough lines, 50%), **EU goods pay 10%** "
    "in place of a lower base rate, **South Korea 12.5%** in total, most other large suppliers add 10% or 12.5%, **China adds 20% — 37.5% on dry pasta, "
    "noodles, dumplings and bread** — and Brazil adds 37.5%. Tapioca is exempt for everyone. On the dairy and sugar quota lines the cell shows the "
    "over-quota rate, except where an FTA sets its own quota: there it shows both tiers — for example Free within Canada's USMCA quotas and the "
    "over-quota rate plus 10% above them. Antidumping and countervailing duties on pasta from Italy and Türkiye are producer-specific and are not in the cells."
)
EU_LABEL = (
    "EU: 10% in total in place of the base rate when the base rate (or its ad valorem equivalent) is under 10% (9903.05.39); nothing added at or above 10%. "
    "Tapioca is exempt (note 52(b))."
)
RULE_LABELS = {
    'Canada': (
        "USMCA-qualifying: no extra duty (9903.05.93), and the dairy and sugar quota lines are Free inside Canada's USMCA quotas (9823.04, 9823.08, 9823.10); "
        "above them the over-quota rate plus the 10% Section 301 duty (9903.05.29), since note 52(g) relieves only goods entered free under USMCA. "
        "Section 338: 1901.20.35 (9903.03.13) and 1901.20.25, 1901.20.60, 1901.20.70 (9903.03.14) pay +50% even under USMCA. Otherwise base rate + 10% "
        "(9903.05.29). Tapioca is exempt from Section 301. The 35% IEEPA duty ended February 24, 2026."
    ),
    'Mexico': (
        "USMCA-qualifying: no extra duty (9903.05.94), and the dairy and sugar quota lines are Free with no quantity limit (9823.xx.01). Otherwise base rate "
        "+ 10% Section 301 (9903.05.55). Tapioca is exempt. The 25% IEEPA duty ended February 24, 2026."
    ),
    'Italy': EU_LABEL + " Non-egg dry pasta also owes producer-specific antidumping and countervailing deposits, not shown.",
    'France': EU_LABEL,
    'Germany': EU_LABEL,
    'South Korea': (
        "South Korea: 12.5% in total when the rate (or its ad valorem equivalent) is lower (9903.05.71); every Chapter 19 line lists KORUS (KR), so the "
        "total is 12.5%. Tapioca is exempt."
    ),
    'Thailand': 'Base rate + 12.5% Section 301 (9903.05.77). Tapioca is exempt (note 52(b)).',
    'India': 'Base rate + 10% Section 301 (9903.05.44). Tapioca is exempt (note 52(b)). GSP has been expired since December 31, 2020.',
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81). Tapioca is exempt (note 52(b)).',
    'China': (
        "Base rate + 12.5% Section 301 (9903.05.31) + 7.5% List 4A (9903.88.15) on most lines, or + 25% List 3 (9903.88.03) on 1901.90.91, dry pasta "
        "and noodles without egg (1902.19), stuffed pasta (1902.20), other pasta (1902.30) and bread and pastry (1905.90.10). Tapioca pays only the 7.5%."
    ),
    'Türkiye (Turkey)': (
        "Base rate + 12.5% Section 301 (9903.05.79). Tapioca is exempt (note 52(b)). Non-egg dry pasta also owes antidumping and countervailing deposits "
        "(A-489-805, C-489-806), not shown."
    ),
    'Australia': (
        "Base rate + 12.5% Section 301 (9903.05.23); U.S.–Australia FTA (AU) rates applied where the line has one, but the Section 301 duty still applies "
        "(U.S. note 52(a)). Dairy preparations are Free within Australia's FTA quota (9822.04.25) and pay the over-quota rate above it; the sugar mix lines "
        "and the in-quota lines that do not list AU pay the base rate. Tapioca is exempt."
    ),
    'Colombia': (
        "Base rate + 12.5% Section 301 (9903.05.32); U.S.–Colombia TPA (CO) rates applied, but the Section 301 duty still applies (U.S. note 52(a)). Sugar "
        "mix lines are Free within Colombia's sugar quota (9822.08.01) and pay the base rate above it; the dairy and margarine cheese quota lines "
        "(9918.04.50–9918.04.80) are Free at any quantity, so they pay only the 12.5%. Tapioca is exempt."
    ),
    'Brazil': (
        "Base rate + 25% (9903.05.01) + 12.5% (9903.05.27) = +37.5%. Tapioca is on both exemption lists (U.S. notes 50(a)(ii), 52(b)); religious-purpose "
        "bakers' wares are exempt by description (not applied)."
    ),
    'Switzerland': (
        "Switzerland: 12.5% in total when the base rate (or its ad valorem equivalent) is lower (9903.05.74); nothing added at or above. Tapioca is exempt."
    ),
    'Any other country': (
        "Countries outside the 60 Section 301 economies pay only the base rate. The 60 pay +10% or +12.5% (9903.05.20–9903.05.84), or 10%–12.5% in total "
        "for the EU, Japan, South Korea, Switzerland and Taiwan; China and Brazil pay more. No Chapter 19 line is on a country exception list (U.S. note 52(j))."
    ),
}
for c in ia['countries']:
    c['rule']['label'] = RULE_LABELS[c['country']]
    if c['country'] in ('Canada', 'Mexico', 'Australia', 'Colombia') and 'hts-ch98-usmca' not in c['rule']['sourceIds']:
        c['rule']['sourceIds'].insert(-1, 'hts-ch98-usmca')
    if c['country'] in ('Canada', 'Mexico') and 'eo-14389' not in c['rule']['sourceIds']:
        c['rule']['sourceIds'].insert(-1, 'eo-14389')
    if c['country'] in ('Italy', 'Türkiye (Turkey)'):
        c['rule']['sourceIds'].insert(-1, 'fr-2024-22179')
for a_i, a in enumerate(ia['assumptions']):
    if a.startswith('TODO: add the chapter-specific'):
        ia['assumptions'][a_i] = (
            "Quota lines: where a product has an in-quota and an over-quota line, both are in the group; the over-quota rates (for example "
            "$1.035/kg + 14.9% on infant formula or 42.3¢/kg + 8.5% on sugar mixes) apply once the quota is filled, and the quota for articles over 65% "
            "sugar is set at none (Chapter 17 additional U.S. note 7)."
        )
ia['assumptions'] = [a for a in ia['assumptions'] if not a.startswith('TODO')]
ia['assumptions'] += [
    "FTA quota lines are priced per tier, the way the calculator asks. USMCA: goods of Mexico are Free with no limit (9823.xx.01); goods of Canada are "
    "Free within Canada's 2026 USMCA quotas and above them pay the over-quota rate printed in Chapter 98 subchapter XXIII plus the 10% Section 301 duty, "
    "because U.S. note 52(g) relieves only goods entered free under USMCA. Australia: Free within its FTA dairy quota (9822.04.25), plus 12.5%. "
    "Colombia: Free within its sugar quota (9822.08.01), plus 12.5%.",
    "Canada Section 338: the 50% on 1901.20.25, 1901.20.35, 1901.20.60 and 1901.20.70 is applied on both sides of the USMCA toggle, inside and above "
    "the quota, because U.S. note 51(a) applies it even when a special rate is claimed.",
    "EU, Japan, South Korea and Switzerland: the 10% or 12.5% total applies when the base rate, or its ad valorem equivalent, is lower. Per-kilogram base "
    "rates are compared at the $10,000 / 1,000 kg test shipment ($10 per kg), so a cheaper product can end up paying only its per-kilogram rate.",
    "Antidumping and countervailing duties (pasta from Italy and Türkiye) depend on the producer and are not in the cells.",
    "Price-based special safeguard duties (Chapter 99 subchapter IV, 9904.04.50–9904.19.19) can add a per-kilogram charge to low-priced over-quota "
    "dairy and sugar goods; they do not apply to Canada, Mexico, Australia, South Korea, Colombia and the other FTA partners listed in subchapter IV "
    "note 1, and are not applied in the matrix.",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) "
    "expired July 23, 2026; neither is applied.",
]
ia['exemptionCheck'] = (
    "Read U.S. notes 20, 29, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 general exemption list (note 52(b), "
    "9903.05.86) has two Chapter 19 subheadings, 1903.00.20 and 1903.00.40 (tapioca); note 52(c) adds religious-purpose bakers' wares of 1905.90.10 and "
    "1905.90.90 by description. The Brazil list (note 50(a)(ii)) has the same two tapioca lines, and note 50(a)(iii) the same religious-purpose goods. "
    "No Chapter 19 line is on a country exception list in note 52(j). Canada Section 338 (note 51(b)): 1901.20.35 is on the dairy list (b)(2) and "
    "1901.20.25, 1901.20.60 and 1901.20.70 on list (b)(3); none is in the Proclamation 11062 import-ban Annex. China: List 3 (note 20(f)) covers 1901.90.91, "
    "1902.19.20, 1902.19.40, 1902.20.00, 1902.30.00 and 1905.90.10, List 4A (note 20(s)(i)) the other Chapter 19 subheadings, and no China product "
    "exclusion still in force (note 20(vvv)–(www)) names a Chapter 19 product. Sweet biscuits (1905.31.00) and waffles and wafers (1905.32.00) appear only "
    "on the large-civil-aircraft lists (note 21(l), (n), 9903.89.37, 9903.89.43), which have not applied since 2021 (note 21(w)–(x))."
)
ia_ids = ['hts-now']
for c in ia['countries']:
    ia_ids += c['rule']['sourceIds']
set_sources(ia, ia_ids)

# ===================================================================================================
# TARIFF ENGINEERING
# ===================================================================================================
te = d['tariffEngineering']
te['h1'] = "HTS Chapter 19: Preparations of Cereals, Flour, Starch or Milk; Bakers' Wares — Import Documents & Ways to Lower Duty"
te['seo']['title'] = 'Importing Pasta, Bakery, Cereal & Infant Formula: FDA Rules, Quotas & Legal Ways to Lower Duty (HTS Ch. 19) | KoalaGains'
te['seo']['shortDescription'] = (
    'The FDA, USDA and CBP rules for each HTS Chapter 19 line — infant formula (21 CFR 106/107), FSVP, prior notice, labeling, dairy quota licenses, '
    'AD/CVD on pasta — and the legal ways to pay less: USMCA, other FTAs, quota entries, General Note 15, drawback and binding rulings.'
)
te['seo']['keywords'] = [
    'chapter 19 tariff engineering',
    'import infant formula FDA requirements',
    'usmca origin validation for baked goods',
    'usmca rules of origin bakery',
    'dairy tariff-rate quota mixes and doughs',
    'pasta antidumping cash deposit',
    'FSVP bakery products',
]
te['intro'] = (
    "Chapter 19 goods are food, so **FDA decides whether a shipment can be sold**: the foreign plant must be registered, prior notice must be filed "
    "before arrival, and the U.S. importer needs a foreign supplier verification program. **Infant formula** has its own regime — nutrient, quality "
    "control and labeling rules (21 CFR parts 106 and 107) and a new infant formula notification before marketing. Products with meat, such as some "
    "stuffed pasta and dumplings, can fall under USDA FSIS; in-quota margarine cheese needs a USDA dairy import license.\n\n"
    "The ways to pay less are written into the schedule: claim **USMCA** or another **FTA**, enter dairy and sugar goods **inside a quota** (or under a "
    "**General Note 15** exclusion), and recover duty through **drawback** when the goods are exported. For Italian and Turkish dry pasta, the producer's "
    "antidumping and countervailing rate matters as much as the tariff. Each lever depends on a document, listed below with its regulation."
)
te['regulationsAsOf'] = '2026-10-08'
rows = {r['hts']: r for r in ov['rateTable']['rows'] if r['hts']}
GN15 = sorted({h[:10] for h, r in rows.items() if 'general note 15' in r['description']})
te['levers'] = [
    {
        'id': 'usmca',
        'title': 'Claim USMCA on goods from Canada or Mexico',
        'saves': "The Section 301 duty — 10% of value — plus the base rate; on the dairy and sugar quota lines, Free for Mexico at any quantity and Free inside Canada's USMCA quotas",
        'appliesTo': 'All 111 lines, for goods that meet the Chapter 19 rules of origin in General Note 11',
        'document': 'A certification of origin from the importer, exporter or producer. It need not follow a prescribed format; it can be on the invoice or another document, and CBP can ask for it.',
        'caveat': (
            "The rules are generous for bakery and pasta — headings 1902–1905 need only a change from any other chapter, so imported flour, semolina and "
            "sugar are allowed — but dairy-based preparations of 1901.10, 1901.20 and 1901.90 may not use non-originating Chapter 4 dairy. Canada's quotas in "
            "2026: 1,919 t of other dairy products (9823.08.02) and 9,600 t of sugar-containing products (9823.10.02, with a Canadian export certificate when "
            "USTR requires one); above them Canada pays the over-quota rate plus 10%. USMCA does not lift the 50% Section 338 duty on 1901.20.25, .35, .60 and "
            ".70 (U.S. note 51(a)). The USMCA was not renewed at the July 1, 2026 joint review but remains in force."
        ),
        'citations': [
            {'label': '19 CFR 182.12', 'url': ECFR + 'title-19/section-182.12'},
            {'label': 'HTSUS General Note 11 (USMCA rules of origin, Chapter 19)', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 98, subch. XXIII (USMCA quotas, 9823)', 'url': CH98_PDF},
            {'label': 'HTSUS Ch. 99, U.S. notes 51–52 (9903.05.93 / 9903.05.94, 9903.03.13–9903.03.14)', 'url': CH99_PDF},
            {'label': 'USTR statement on the USMCA joint review (July 1, 2026)', 'url': POOL['ustr-usmca-review']['url']},
            {'label': 'CBP: USMCA', 'url': 'https://www.cbp.gov/trade/priority-issues/trade-agreements/free-trade-agreements/USMCA'},
        ],
    },
    {
        'id': 'fta',
        'title': 'Claim another free trade agreement',
        'saves': (
            "The base rate — for example 6.4% on noodles and stuffed pasta, 14% on bulgur, 14.9% on infant formula outside the quota system — on goods from "
            "Australia, Bahrain, Chile, Colombia, Israel, Jordan, South Korea, Morocco, Oman, Panama, Peru, Singapore and the CAFTA-DR countries"
        ),
        'appliesTo': (
            "Most dutiable lines; on the over-quota dairy and sugar lines only some partners are Free, others have their own quotas in Chapter 98 subchapter "
            "XXII (9822) or Chapter 99 — Australia's dairy quota 9822.04.25, Colombia's sugar quota 9822.08.01"
        ),
        'document': 'The origin proof each agreement requires (a certification or declaration of origin) and records to back it up.',
        'caveat': (
            "An FTA removes the base rate but not the 2026 Section 301 duty for the 60 economies, which applies even when a special rate is claimed (U.S. note "
            "52(a)); most of these partners are in the 60. For dairy preparations the FTA rules usually forbid non-originating Chapter 4 dairy. GSP (A, A*, A+) "
            "has been expired since December 31, 2020; AGOA (D) runs to December 31, 2026."
        ),
        'citations': [
            {'label': 'HTSUS General Notes 3(c) and 8–34', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 98, subch. XXII (FTA quotas, 9822)', 'url': CH98_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'quota',
        'title': 'Enter dairy and sugar preparations inside the tariff-rate quota',
        'saves': (
            "The gap between the in-quota and over-quota rate: infant formula 17.5% instead of $1.035/kg + 14.9%; dairy preparations 16% instead of "
            "$1.035/kg + 13.6%; sugar mixes and doughs 10% instead of 42.3¢/kg + 8.5%; margarine cheese 10% instead of $1.128/kg"
        ),
        'appliesTo': 'The paired in-quota and over-quota lines in 1901.10, 1901.20 and 1901.90',
        'document': (
            "In-quota margarine cheese (1901.90.34) needs a USDA dairy import license (Chapter 4 additional U.S. note 23; 7 CFR part 6). The other quotas are "
            "filled at CBP in order of entry; check the quota status before shipping."
        ),
        'caveat': (
            "The quotas are small: infant formula with oligosaccharides 100 t a year (Chapter 19 note 2); mixes and doughs 5,398 t from October 1 (note 3); "
            "\"dairy products described in additional U.S. note 1 to chapter 4\" 4,105,000 kg a year, shared with many other dairy goods (Chapter 4 note 10); "
            "articles over 10% sugar 64,709 t from October 1 (Chapter 17 note 8); articles over 65% sugar none (note 7). Mexico is outside these quotas because "
            "its goods are Free under USMCA. Low-priced over-quota goods can also owe a special safeguard duty (Chapter 99 subchapter IV) unless they come from "
            "an exempt FTA partner."
        ),
        'citations': [
            {'label': 'HTSUS Ch. 19, additional U.S. notes 1–3', 'url': CH19_PDF},
            {'label': 'HTSUS Ch. 4, additional U.S. notes 1, 10, 23', 'url': CH04_PDF},
            {'label': 'HTSUS Ch. 17, additional U.S. notes 7–8', 'url': CH17_PDF},
            {'label': '7 CFR part 6 (dairy import licensing)', 'url': ECFR + 'title-7/part-6'},
            {'label': '19 CFR part 132 (quotas)', 'url': ECFR + 'title-19/part-132'},
            {'label': 'CBP: tariff-rate quotas', 'url': 'https://www.cbp.gov/trade/quota/tariff-rate-quotas'},
            {'label': 'HTSUS Ch. 99, subch. IV (special safeguards)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'gn15',
        'title': 'Use a General Note 15 entry for samples, government or personal-use goods',
        'saves': 'The over-quota rate: these entries use the "described in general note 15" lines at the in-quota rate and are not counted against the quota',
        'appliesTo': 'The quota products: ' + ', '.join(GN15),
        'document': (
            "Proof of the qualifying purpose: goods for a U.S. government agency; personal-use shipments of 5 kg or less; or samples, trade-fair, research or "
            "embassy goods that will not enter U.S. commerce, with written USDA approval presented at entry."
        ),
        'caveat': 'Commercial goods do not qualify. Ask USDA for approval (identifying the product, quantity and use) before the goods ship.',
        'citations': [{'label': 'HTSUS General Note 15', 'url': GN_PDF}],
    },
    {
        'id': 'adcvd',
        'title': "Check the producer's antidumping and countervailing rate before buying Italian or Turkish pasta",
        'saves': (
            "The difference between producer rates: Italian non-egg dry pasta pays antidumping deposits from 2.65% (La Molisana) to 15.45% (firms never "
            "reviewed), plus a countervailing deposit (for example 3.21%–3.32% for the firms reviewed for 2023); gluten-free and EU-certified organic pasta are "
            "outside the order"
        ),
        'appliesTo': 'Non-egg dry pasta in retail packs of 5 lb 4 oz or less (1902.19.20; 1901.90.91 for Italy) from Italy or Türkiye',
        'document': (
            "The producer and exporter names on the entry, and for organic pasta from Italy the EU organic certificate (USDA National Organic Program "
            "equivalence), kept and shown to CBP on request."
        ),
        'caveat': (
            "Deposits are estimates; the final duty is set in later reviews (reviews of July 2025–June 2026 and of 2025 began September 4, 2026). Commerce's "
            "written scope, not the HTS number, decides what is covered."
        ),
        'citations': [
            {'label': '89 FR 79255 (continuation of the orders, scope)', 'url': POOL['fr-2024-22179']['url']},
            {'label': '91 FR 12582 (final AD results, March 16, 2026)', 'url': POOL['fr-2026-05099']['url']},
            {'label': '91 FR 46770 (final CVD results, July 24, 2026)', 'url': POOL['fr-2026-15014']['url']},
            {'label': '19 CFR part 351', 'url': ECFR + 'title-19/part-351'},
        ],
    },
    {
        'id': 'drawback',
        'title': 'Recover duty on goods you export',
        'saves': 'Up to 99% of the duties paid, when the imported goods (or goods made from them) are exported or destroyed',
        'appliesTo': 'Any dutiable line',
        'document': 'A drawback claim to CBP with import and export records.',
        'caveat': 'Claims have filing deadlines and record-keeping rules; antidumping and countervailing duties cannot be recovered by drawback, and CBP decides whether a given Chapter 99 duty is eligible.',
        'citations': [{'label': '19 CFR part 190', 'url': ECFR + 'title-19/part-190'}],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding ruling before you import',
        'saves': (
            "Certainty: a ruling fixes the classification — sweet biscuit (1905.31, Free) versus snack (1905.90.90, 4.5%), dry pasta (Free) versus pasta with "
            "sauce (6.4%), infant formula on a quota line versus 1901.10.29 — before the goods arrive"
        ),
        'appliesTo': 'Any line where the recipe, milk-solids or sugar content, or packaging decides the rate',
        'document': 'A ruling request to CBP describing the product, its ingredients (with percentages) and packaging.',
        'caveat': 'Rulings apply to the transaction described; a reformulated product may need a new one.',
        'citations': [{'label': '19 CFR part 177', 'url': ECFR + 'title-19/part-177'}],
    },
]
te['rules'] = [
    {'id': 'fda-registration', 'agency': 'FDA', 'title': 'Food facility registration for the foreign plant that makes, packs or holds the food', 'citations': [{'label': '21 CFR 1.225', 'url': ECFR + 'title-21/section-1.225'}]},
    {
        'id': 'fda-prior-notice',
        'agency': 'FDA',
        'title': 'Prior notice of imported food, filed before the shipment arrives',
        'citations': [{'label': '21 CFR part 1, subpart I', 'url': ECFR + 'title-21/chapter-I/subchapter-A/part-1/subpart-I'}],
    },
    {
        'id': 'fda-fsvp',
        'agency': 'FDA',
        'title': 'Foreign Supplier Verification Program (FSVP) kept by the U.S. importer',
        'citations': [
            {'label': '21 CFR part 1, subpart L', 'url': ECFR + 'title-21/chapter-I/subchapter-A/part-1/subpart-L'},
            {'label': 'FDA: FSVP final rule', 'url': 'https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-foreign-supplier-verification-programs-fsvp-importers-food-humans-and-animals'},
        ],
    },
    {'id': 'fda-labeling', 'agency': 'FDA', 'title': 'Food labeling: English label, ingredient list, Nutrition Facts, major allergens (wheat, milk, egg, soy, sesame)', 'citations': [{'label': '21 CFR part 101', 'url': ECFR + 'title-21/part-101'}]},
    {
        'id': 'fda-pchf',
        'agency': 'FDA',
        'title': 'Current good manufacturing practice and preventive controls at the foreign food plant',
        'citations': [{'label': '21 CFR part 117', 'url': ECFR + 'title-21/part-117'}],
    },
    {
        'id': 'fda-additives',
        'agency': 'FDA',
        'title': 'Food and color additives must be approved for the use (or GRAS); colors from the listed color additives',
        'citations': [{'label': '21 CFR part 170', 'url': ECFR + 'title-21/part-170'}, {'label': '21 CFR part 73', 'url': ECFR + 'title-21/part-73'}],
    },
    {
        'id': 'fda-standards',
        'agency': 'FDA',
        'title': 'Standards of identity: products sold as "macaroni", "spaghetti", "noodles" or "enriched bread" must meet the federal standard',
        'citations': [{'label': '21 CFR part 139 (macaroni and noodle products)', 'url': ECFR + 'title-21/part-139'}, {'label': '21 CFR part 136 (bakery products)', 'url': ECFR + 'title-21/part-136'}],
    },
    {
        'id': 'fda-lacf',
        'agency': 'FDA',
        'title': 'Canned pasta and other shelf-stable low-acid or acidified foods: plant registration and process filing',
        'citations': [
            {'label': '21 CFR part 108', 'url': ECFR + 'title-21/part-108'},
            {'label': '21 CFR part 113', 'url': ECFR + 'title-21/part-113'},
            {'label': '21 CFR part 114', 'url': ECFR + 'title-21/part-114'},
        ],
    },
    {
        'id': 'fda-infant-formula',
        'agency': 'FDA',
        'title': (
            "Infant formula: cGMP, quality control and records (21 CFR 106), nutrient, labeling and exempt-formula rules (21 CFR 107), and a new infant "
            "formula notification at least 90 days before marketing (FD&C Act sec. 412). The 2022 enforcement-discretion transition plan for formula made "
            "abroad ran to October 18, 2025"
        ),
        'citations': [
            {'label': '21 CFR part 106', 'url': ECFR + 'title-21/part-106'},
            {'label': '21 CFR part 107', 'url': ECFR + 'title-21/part-107'},
            {'label': '21 U.S.C. 350a (FD&C Act sec. 412)', 'url': 'https://www.govinfo.gov/content/pkg/USCODE-2024-title21/html/USCODE-2024-title21-chap9-subchapIV-sec350a.htm'},
            {'label': 'FDA: infant formula transition plan guidance (87 FR, October 6, 2022)', 'url': POOL['fda-if-transition']['url']},
            {'label': 'FDA: enforcement discretion for infant formula', 'url': POOL['fda-if-discretion']['url']},
        ],
    },
    {
        'id': 'fsis-meat',
        'agency': 'USDA FSIS',
        'title': 'Stuffed pasta, dumplings and other products containing meat or poultry may be FSIS products: eligible country and plant, reinspection at entry',
        'citations': [{'label': '9 CFR part 327', 'url': ECFR + 'title-9/part-327'}, {'label': '9 CFR part 381, subpart T', 'url': ECFR + 'title-9/part-381/subpart-T'}],
    },
    {
        'id': 'usda-dairy-license',
        'agency': 'USDA',
        'title': 'In-quota margarine cheese (1901.90.34) needs a dairy import license',
        'citations': [{'label': '7 CFR part 6', 'url': ECFR + 'title-7/part-6'}, {'label': 'HTSUS Ch. 4, additional U.S. note 23', 'url': CH04_PDF}],
    },
    {
        'id': 'cbp-quota',
        'agency': 'CBP',
        'title': 'Tariff-rate quota: in-quota rate only while the quota is open; over-quota rate afterwards',
        'citations': [
            {'label': '19 CFR part 132', 'url': ECFR + 'title-19/part-132'},
            {'label': 'CBP: tariff-rate quotas', 'url': 'https://www.cbp.gov/trade/quota/tariff-rate-quotas'},
            {'label': 'HTSUS Ch. 19, additional U.S. notes 2–3', 'url': CH19_PDF},
        ],
    },
    {
        'id': 'ita-adcvd',
        'agency': 'Commerce / CBP',
        'title': 'Antidumping and countervailing duty cash deposits on non-egg dry pasta from Italy and Türkiye (entry type 03)',
        'citations': [
            {'label': '19 CFR part 351', 'url': ECFR + 'title-19/part-351'},
            {'label': '89 FR 79255 (orders continued, scope)', 'url': POOL['fr-2024-22179']['url']},
            {'label': 'CBP: antidumping and countervailing duties', 'url': 'https://www.cbp.gov/trade/priority-issues/adcvd'},
        ],
    },
]
BASE_RULES = ['fda-registration', 'fda-prior-notice', 'fda-fsvp', 'fda-labeling', 'fda-pchf', 'fda-additives']
GROUP_RULES = {
    '1901': BASE_RULES + ['fda-infant-formula', 'cbp-quota', 'usda-dairy-license'],
    '1902': BASE_RULES + ['fda-standards', 'fda-lacf', 'fsis-meat', 'ita-adcvd'],
    '1903': BASE_RULES,
    '1904': BASE_RULES,
    '1905': BASE_RULES + ['fda-standards', 'fsis-meat'],
}
GROUP_NOTES = {
    '1901': (
        "Infant formula (1901.10) follows 21 CFR parts 106 and 107 and needs an FDA new infant formula notification. Lines with over 10% milk solids or "
        "over 10% cane or beet sugar are quota lines (Chapter 4 note 10, Chapter 17 notes 7–8, Chapter 19 notes 2–3); in-quota margarine cheese needs a "
        "USDA license. 1901.20.25, .35, .60 and .70 from Canada pay the 50% Section 338 duty."
    ),
    '1902': (
        "Non-egg dry pasta from Italy and Türkiye is under antidumping and countervailing duty orders. Products labeled macaroni, spaghetti or noodles must "
        "meet 21 CFR part 139; canned pasta is a low-acid food; ravioli or dumplings with meat can be FSIS products."
    ),
    '1903': 'Tapioca is exempt from the 2026 Section 301 and Brazil duties (only China\'s 7.5% List 4A applies).',
    '1904': 'Products with over 6% cocoa (defatted basis) or fully coated with chocolate are heading 1806, not 1904 (Chapter 19 note 3).',
    '1905': (
        "Breads labeled \"enriched\" must meet the standard in 21 CFR part 136. Pizza, quiche and other bakers' wares with meat can be FSIS products. "
        "Religious-purpose communion wafers are exempt from the Section 301 duties by description."
    ),
}
for g in te['groups']:
    g['ruleIds'] = GROUP_RULES[g['heading']]
    g['note'] = GROUP_NOTES[g['heading']]

rows = {r['hts']: r for r in ov['rateTable']['rows'] if r['hts']}
QUOTA_LINES = set()
for h, r in rows.items():
    eff = r['effectiveGeneral'] or ''
    path = ' '.join(r['ancestorPath']) + ' ' + r['description']
    if re.search(r'additional U\.S\. note|general note 15', path) or '/kg +' in eff or eff == '$1.128/kg':
        QUOTA_LINES.add(h)
GN15 = sorted({h[:10] for h, r in rows.items() if 'general note 15' in r['description']})
for l in te['lines']:
    h = l['hts']
    head = h[:4]
    r = rows[h]
    rule_ids = list(BASE_RULES)
    lever = ['usmca']
    if r['dutiable']:
        lever.append('fta')
    if head == '1901':
        if h.startswith('1901.10'):
            rule_ids.append('fda-infant-formula')
        if h in QUOTA_LINES:
            rule_ids.append('cbp-quota')
            lever.append('quota')
        if h.startswith('1901.90.34'):
            rule_ids.append('usda-dairy-license')
        if 'general note 15' in r['description']:
            lever.append('gn15')
    if head == '1902':
        if h.startswith(('1902.11.20', '1902.19.20', '1902.11.40', '1902.19.40', '1902.30')):
            rule_ids.append('fda-standards')
        if h.startswith(('1902.20', '1902.30')) and h.endswith('.20'):
            rule_ids.append('fda-lacf')
        if h.startswith('1902.20'):
            rule_ids.append('fsis-meat')
        if h.startswith('1902.19.20'):
            rule_ids.append('ita-adcvd')
            lever.append('adcvd')
    if head == '1905':
        if h.startswith('1905.90.10'):
            rule_ids.append('fda-standards')
        if h.startswith('1905.90.90.60'):
            rule_ids.append('fsis-meat')
    if h.startswith('1901.90.91'):
        rule_ids.append('ita-adcvd')
        lever.append('adcvd')
    if r['dutiable']:
        lever.append('drawback')
    lever.append('ruling')
    l['ruleIds'] = list(dict.fromkeys(rule_ids))
    l['leverIds'] = list(dict.fromkeys(lever))
te['disclaimer'] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. FDA and USDA requirements depend on the product's ingredients "
    "and form; check the agency before each new product, CBP for quota status before each quota-sensitive shipment, and Commerce's current deposit rate "
    "before each pasta purchase from Italy or Türkiye."
)

# ===================================================================================================
# FINAL CONCLUSION (FAQ)
# ===================================================================================================
fc = d['finalConclusion']
fc['h1'] = "HTS Chapter 19: Preparations of Cereals, Flour, Starch or Milk; Bakers' Wares — Tariff FAQ"
fc['seo']['title'] = 'Chapter 19 Tariff FAQ: HS Codes & U.S. Tariffs for Biscuits, Pasta, Noodles, Bread, Cereal & Infant Formula | KoalaGains'
fc['seo']['shortDescription'] = (
    'Answers to what people search about HTS Chapter 19: the HS code for biscuits, cookies, pasta, instant noodles, bread, cake, breakfast cereal and '
    'infant formula — and the U.S. tariff on each by country in 2026, including the Italian pasta duties.'
)
fc['seo']['keywords'] = [
    'hs code for biscuits',
    'hs code for cookies',
    'tariff on pasta from italy',
    'italian pasta tariff',
    'hs code for pasta',
    'hs code for instant noodles',
    'hs code for infant formula',
    'tariffs on baby formula',
    'hs code for breakfast cereal',
    'hs code 1905.90',
    'hs code 1901',
    'hs code for bread',
    'hs code for couscous',
    'hs code for malt extract',
]
fc['intro'] = (
    "Straight answers to the most common questions about importing Chapter 19 goods into the U.S. — HS codes, tariffs by country, quota rules and the "
    "pasta antidumping duties. Each answer links to the page with the full detail."
)
fc['keyTakeaways'] = [
    f"Bakers' wares are {share(H1905)}% of Chapter 19 imports, and almost all of them — bread, cookies, cakes, pastry, crackers, wafers — have a Free base rate; "
    "only snack chips, pizza and quiche (1905.90.90) pay 4.5%.",
    "The 2025 IEEPA tariffs ended on February 24, 2026. Since July 24, 2026 the extra duty is a Section 301 tariff: 10% in total for the EU, 12.5% in total "
    "for South Korea, +10% or +12.5% for most other large suppliers, +20% for China (+37.5% on pasta, noodles and bread) and +37.5% for Brazil. USMCA-qualifying "
    "goods pay nothing extra, and tapioca is exempt for everyone.",
    "Canada: four sugar mix and dough lines (1901.20.25, .35, .60, .70) pay a 50% Section 338 duty even under USMCA; no Chapter 19 line is on the "
    "September 29, 2026 import bans.",
    "Infant formula and other dairy or sugar preparations of heading 1901 are under small tariff-rate quotas; above them the rate rises to as much as "
    "$1.035/kg + 14.9%.",
    "Non-egg dry pasta from Italy and Türkiye also owes antidumping and countervailing deposits by producer: the 2026 final Italian rates are 2.65%–7.00% "
    "antidumping (15.45% for firms never reviewed), not the 91.74% proposed in 2025.",
]
fc['questionSource'] = 'Google search suggestions (U.S. English), collected October 12, 2026'
fc['faqs'] = [
    {
        'id': 'hs-biscuits',
        'question': 'What is the HS code for biscuits and cookies?',
        'searchedAs': ['hs code for biscuits', 'hs code for sweet biscuits', 'hs code for cookies', 'hs tariff code for cookies', 'hs code for butter cookies', 'tariff code for biscuits'],
        'answer': (
            "Sweet biscuits and cookies are 1905.31.00, Free under the general rate (statistical suffixes split frozen, peanut-containing and organic). "
            "Waffles and wafers are 1905.32.00, also Free; unsweetened biscuits and crackers fall in 1905.90.10 (Free). The extra duty depends on the country: "
            "none for USMCA-qualifying cookies from Canada or Mexico, 10% for the EU and the UK, 12.5% for South Korea and Türkiye, 20% for China and 37.5% for Brazil."
        ),
        'link': 'industry-areas',
    },
    {
        'id': 'italian-pasta-tariff',
        'question': 'What is the U.S. tariff on Italian pasta?',
        'searchedAs': ['tariff on pasta from italy', 'tariff on italian pasta', 'us tariffs on italian pasta', 'italian pasta tariff', '107 tariff on pasta', 'pasta tariff 107'],
        'answer': (
            "Dry pasta (1902.19.20) has a Free base rate, and since July 24, 2026 EU goods pay 10% in total under Section 301 (9903.05.39). Retail packs of "
            "non-egg dry pasta are also under 1996 antidumping and countervailing duty orders. The \"107%\" figure came from Commerce's preliminary 91.74% "
            "antidumping rate of September 2025 plus the then 15% EU tariff; the final results on March 16, 2026 set 2.65% (La Molisana), 7.00% (Garofalo) and "
            "5.21% for 11 other firms, and countervailing rates of 3.21%–3.32% followed on July 24, 2026. Firms never reviewed pay 15.45% antidumping. Gluten-free "
            "and EU-certified organic pasta are outside the orders."
        ),
        'link': 'tariff-updates',
    },
    {
        'id': 'hs-pasta',
        'question': 'What is the HS code for pasta and noodles?',
        'searchedAs': ['hs code for pasta', 'hs code for dry pasta', 'hs code for spaghetti', 'hs code for noodles', 'hs code 1902', 'hs code 1902.19'],
        'answer': (
            "Heading 1902. Uncooked pasta and noodles with egg are 1902.11, without egg 1902.19: Free when the product is exclusively pasta (1902.11.20, "
            "1902.19.20), 6.4% when packed with a sauce or otherwise prepared (1902.11.40, 1902.19.40). Stuffed pasta such as ravioli and dumplings is 1902.20 "
            "(6.4%), cooked and other pasta 1902.30 (6.4%) and couscous 1902.40 (6.4%). Pasta sauce on its own is Chapter 21 (2103.90)."
        ),
        'link': '',
    },
    {
        'id': 'instant-noodles',
        'question': 'What is the HS code and tariff for instant noodles and ramen?',
        'searchedAs': ['hs code for instant noodles', 'hs code for cup noodles', 'hs code for ramen noodles', 'tariff code for instant noodles', 'hs code for rice noodles'],
        'answer': (
            "Instant (pre-cooked) noodles, including cup noodles and ramen with a seasoning sachet, are usually 1902.30.00 at 6.4%. Plain dry rice or wheat "
            "noodles that are only pasta are 1902.19.20 (Free). From South Korea, KORUS makes 1902.30 Free and the 12.5% Korea total applies; from Thailand or "
            "Vietnam 6.4% + 12.5% = 18.9%; from China 6.4% + 12.5% + 25% = 43.9%; from Japan 12.5% in total."
        ),
        'link': 'industry-areas',
    },
    {
        'id': 'hs-infant-formula',
        'question': 'What is the HS code for infant formula?',
        'searchedAs': ['hs code for infant formula', 'hs code for baby formula', 'hs tariff code for baby formula', 'hs code for infant formula milk powder', 'hs code for baby milk powder'],
        'answer': (
            "Infant formula put up for retail sale is subheading 1901.10. The U.S. line depends on milk solids, oligosaccharides and quota status: formula with "
            "over 10% milk solids containing oligosaccharides is 1901.10.11 inside a 100-tonne yearly quota (17.5%) or 1901.10.16 above it ($1.035/kg + 14.9%); "
            "formula with other dairy content is 1901.10.21/.26 on the Chapter 4 dairy quota; other formula is 1901.10.29 or 1901.10.49 (14.9%). Preparations "
            "for young children are 1901.10.52–1901.10.91. Bulk infant formula base powder is 1901.90 (for example 1901.90.62), and plain milk powder Chapter 4."
        ),
        'link': '',
    },
    {
        'id': 'infant-formula-tariff',
        'question': 'Are there tariffs on baby formula?',
        'searchedAs': ['tariffs on baby formula', 'are there tariffs on baby formula', 'tariff on baby formula', 'tariff on infant formula'],
        'answer': (
            "Yes. The base rate is 14.9%–17.5%, or $1.035/kg + 14.9% above the quotas, and the 2026 Section 301 duty applies by country (EU formula already "
            "above 10% pays nothing more; Australia 12.5% within its FTA dairy quota and the over-quota rate plus 12.5% above it; USMCA formula from Mexico is Free, from Canada Free inside "
            "Canada's dairy quota). The 2022 duty suspension under the Formula Act (Pub. L. 117-160, 9903.19.19–9903.19.23) expired December 31, 2022. Separately, "
            "FDA must accept the formula: 21 CFR parts 106 and 107, and the 2022 enforcement-discretion transition plan for imported formula ran to October 18, 2025."
        ),
        'link': 'tariff-engineering',
    },
    {
        'id': 'breakfast-cereal',
        'question': 'What is the HS code for breakfast cereal and granola?',
        'searchedAs': ['hs code for breakfast cereal', 'cereal hs code', 'hs code for granola', 'hs code for granola cereal', 'hs code for muesli', 'tariffs on cereal'],
        'answer': (
            "Cereals made by puffing or roasting, such as corn flakes and puffed rice, are 1904.10.00 (1.1%). Muesli-type mixes of unroasted flakes are 1904.20 "
            "(5.6% in airtight containers, 14.9% otherwise). Granola follows the same test — 1904.10 if all its flakes are roasted or puffed, 1904.20 if it contains "
            "unroasted flakes — and a CBP ruling settles a specific recipe. Cereal with over "
            "6% cocoa or fully chocolate-coated moves to heading 1806. Most cereal from Canada and Mexico is Free under USMCA; from the EU it pays 10%."
        ),
        'link': '',
    },
    {
        'id': 'hs-1905-90',
        'question': 'What is HTS code 1905.90?',
        'searchedAs': ['hs code 1905.90', 'hts code 1905.90', 'hts 1905.90', 'hs code 1905', 'hts code 1905'],
        'answer': (
            f"1905.90 is \"other\" bakers' wares and the largest Chapter 19 product: {fmt_usd(hs('1905.90')['importsUsd'])} of U.S. imports in {Y}. 1905.90.10 "
            "(Free) covers bread, pastry, cakes, biscuits and similar baked products and puddings — split into frozen, sweet pastry, bread, organic and other. "
            "1905.90.90 (4.5%) covers corn chips and similar savory snacks, pizza and quiche, communion wafers, rice paper and empty cachets. Headings 1905.10–1905.40 "
            "are crispbread, gingerbread, sweet biscuits, waffles and wafers, and rusks — all Free."
        ),
        'link': '',
    },
    {
        'id': 'hs-1901',
        'question': 'What does HS code 1901 cover?',
        'searchedAs': ['hs code 1901', 'hs code 1901.90', 'hs code 1901.20', 'hs code 1901.10', '1901 hs code description'],
        'answer': (
            "Heading 1901 is malt extract and food preparations of flour, groats, meal, starch or malt extract (under 40% cocoa) and of milk products (under 5% "
            "cocoa) not covered elsewhere. 1901.10 is retail preparations for infants and young children (infant formula), 1901.20 mixes and doughs for bakers' "
            "wares (cake, pancake and bread mixes, frozen dough), and 1901.90 malt extract, puddings, cajeta, margarine cheese and other "
            "dairy or cereal preparations. Most lines with over 10% milk solids or cane or beet sugar are quota lines."
        ),
        'link': '',
    },
    {
        'id': 'bread-cake',
        'question': 'What is the HS code for bread, cake and pastry — and for cake mix?',
        'searchedAs': ['hs code for bread', 'hs code for cake', 'hs code for pastry', 'hs code for frozen pastry', 'hs code for bakery products', 'hs code for cake mix'],
        'answer': (
            "Finished bread, cakes, pastry and croissants (fresh or frozen) are 1905.90.10, Free. Cake, bread and pancake mixes and unbaked doughs are 1901.20: "
            "8.5% for plain mixes, or the quota lines when they contain over 25% butterfat or over 10% cane or beet sugar (10% in quota, 42.3¢/kg + 8.5% above). "
            "Bread flour is Chapter 11."
        ),
        'link': '',
    },
    {
        'id': 'crackers-wafers',
        'question': 'What is the HS code for crackers and wafers?',
        'searchedAs': ['hs code for crackers', 'hs code for cream crackers', 'hs code for wafers', 'hs code for wafers biscuits', 'hs code for communion wafers'],
        'answer': (
            "Waffles and wafers, including wafer biscuits, are 1905.32.00 (Free). Unsweetened crackers are biscuits of 1905.90.10 (Free); crisp savory snacks "
            "such as corn chips are 1905.90.90.30 (4.5%). Communion wafers are 1905.90.90 (4.5%) and, when for religious purposes only, are exempt from the 2026 "
            "Section 301 duties."
        ),
        'link': '',
    },
    {
        'id': 'pizza-tortillas',
        'question': 'What is the HS code for pizza and tortillas?',
        'searchedAs': ['hs code for pizza', 'hs code for frozen pizza', 'hs code for tortillas', 'hs code for tortilla wrap', 'hs code for tortilla chips'],
        'answer': (
            "Pizza and quiche, frozen or not, are 1905.90.90.60 (4.5%), unless over 20% of the weight is meat or fish, which moves them to Chapter 16; a pizza with meat can also be a USDA FSIS product. Flour and corn tortillas are bakers' wares "
            "of 1905.90.10 (Free), and tortilla chips are crisp savory snacks of 1905.90.90.30 (4.5%). USMCA-qualifying tortillas and chips from Mexico pay nothing extra."
        ),
        'link': 'tariff-engineering',
    },
    {
        'id': 'couscous-tapioca',
        'question': 'What is the HS code for couscous and tapioca pearls?',
        'searchedAs': ['hs code for couscous', 'hs tariff code for couscous', 'hs code for tapioca', 'hs code for tapioca pearl'],
        'answer': (
            "Couscous is 1902.40.00 (6.4%). Tapioca pearls and flakes of cassava, arrowroot or sago are 1903.00.20 (Free), other starch substitutes 1903.00.40 "
            "(0.8¢/kg). Tapioca is exempt from the 2026 Section 301 and Brazil duties. Tapioca starch itself is heading 1108, not Chapter 19."
        ),
        'link': '',
    },
    {
        'id': 'malt-extract',
        'question': 'What is the HS code for malt extract?',
        'searchedAs': ['hs code for malt extract', 'hs code for malt extract powder', 'hs code for liquid malt extract'],
        'answer': (
            "Malt extract is 1901.90: fluid malt extract 1901.90.10 (3.2¢/liter) and solid or condensed (powder) 1901.90.20 (9.6%). Malt itself is heading 1107. "
            "Both lines are Free for USMCA and most FTA partners, but the 2026 Section 301 duty still applies to FTA partners in the 60 economies."
        ),
        'link': '',
    },
    {
        'id': 'chapter-19',
        'question': 'What does HTSUS Chapter 19 cover?',
        'searchedAs': ['chapter 19 hts', 'htsus chapter 19', 'hs code 1902', 'hs code 1905'],
        'answer': (
            "Chapter 19 is \"Preparations of cereals, flour, starch or milk; bakers' wares\": heading 1901 (malt extract, infant formula, mixes and doughs, dairy "
            "and cereal preparations), 1902 (pasta and couscous), 1903 (tapioca), 1904 (breakfast cereals, bulgur, prepared grains) and 1905 (bread, biscuits, "
            f"cakes, pastry and other bakers' wares). It has 111 U.S. tariff lines, and the U.S. imported {fmt_usd(total)} of these goods in {Y}."
        ),
        'link': '',
    },
]

# ===================================================================================================
# Root
# ===================================================================================================
d['sources'] = [
    {'label': 'Harmonized Tariff Schedule of the United States', 'url': 'https://hts.usitc.gov/', 'note': 'rate table rows (2026 Revision 21)'},
    {'label': 'UN Comtrade', 'url': 'https://comtradeplus.un.org/', 'note': f'{Y} import figures'},
    {'label': 'Federal Register', 'url': 'https://www.federalregister.gov/', 'note': 'tariff actions and AD/CVD notices'},
    {'label': 'eCFR', 'url': 'https://www.ecfr.gov/', 'note': 'agency entry rules (up to date as of 2026-10-08)'},
]


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
