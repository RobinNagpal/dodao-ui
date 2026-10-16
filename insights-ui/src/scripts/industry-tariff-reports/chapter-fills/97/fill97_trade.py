import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

# Understand-industry part of fill97 (exec'd). Figures come from the generated trade block.
# flake8: noqa
GROUP_LINE_LABELS = {
    '9701.10': 'Paintings, drawings and pastels executed by hand (HS 2017 code)',
    '9701.21': 'Paintings, drawings and pastels over 100 years old',
    '9701.22': 'Mosaics over 100 years old',
    '9701.29': 'Collages and similar works over 100 years old',
    '9701.91': 'Paintings, drawings and pastels not over 100 years old',
    '9701.92': 'Mosaics not over 100 years old',
    '9701.99': 'Collages and similar works not over 100 years old',
    '9702.10': 'Original prints over 100 years old',
    '9702.90': 'Original prints not over 100 years old',
    '9703.10': 'Original sculptures over 100 years old',
    '9703.90': 'Original sculptures not over 100 years old',
    '9704.00': 'Stamps, first-day covers and postal stationery',
    '9705.10': "Collectors' pieces of archaeological, ethnographic or historical interest",
    '9705.21': 'Human specimens',
    '9705.22': 'Extinct or endangered species specimens',
    '9705.29': 'Zoological, botanical, mineral and paleontological specimens',
    '9705.31': 'Coins and numismatic pieces over 100 years old',
    '9705.39': 'Other numismatic pieces',
    '9706.10': 'Antiques over 250 years old',
    '9706.90': 'Antiques 100 to 250 years old',
}
ov['tradeSnapshot']['biggestLines'] = [{'hts': l['hs6'], 'label': GROUP_LINE_LABELS.get(l['hs6'], l['description'])} for l in ui['byLine'][:3]]

ui['h1'] = "HTS Chapter 97: Art, Collectors' Pieces & Antiques — U.S. Import Statistics"
c = ui['byCountry']
top3 = c[:3]
lines = ui['byLine']
ui['seo'] = {
    'title': f"U.S. Art & Antiques Imports by Country: {', '.join(x['country'] for x in top3)} (HTS Ch. 97) | KoalaGains",
    'shortDescription': (f"Where U.S. imports of paintings, sculptures, prints, stamps, coins, collectors' pieces and antiques come from, 2020–{Y}: "
                         f"{money(TOTAL)} in {Y}, {pct(CHG)} from {PY}, {share(top3[0]['importsUsd'])} from {top3[0]['country']}. By country, by product and over time, from UN Comtrade."),
    'keywords': ['us art imports by country', 'art imports united states', 'antiques imports by country', 'hts chapter 97 import statistics',
                 'art market imports from france', 'art imports from uk'],
}
for s in ui['stats']:
    if s['label'] == 'Largest product' and lines:
        s['note'] = GROUP_LINE_LABELS.get(lines[0]['hs6'], lines[0]['description']) + f" ({lines[0]['hs6']})"
ui['byYearCaption'] = (f"U.S. imports of Chapter 97 goods each year, split into the two largest {Y} suppliers ({ui['byYearPartners'][0]} and "
                       f"{ui['byYearPartners'][1]}) and everyone else.")
ui['effectiveDuty']['note'] = "Duty-collected figures aren't available from an official source yet."
ui['coverageNote'] = 'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade.'
ui['valueBasis'] = 'CIF value (customs value plus freight and insurance), as reported by the United States to UN Comtrade.'


def cline(x):
    return f"**{x['country']}** {money(x['importsUsd'])} ({x['sharePct']:.0f}%, {pct(x['changePct']) if x.get('changePct') is not None else 'new'})"


BY = sorted(ui['byYear'], key=lambda r: r['year'])
peak = max(BY, key=lambda r: r['totalUsd']) if BY else None
YEARS_NOTE = (f"; the 2020–{Y} peak was {money(peak['totalUsd'])} in {peak['year']}" if peak and peak['year'] != Y else '')
why_countries = ', '.join(cline(x) for x in c[:6])
why_lines = '; '.join(f"{GROUP_LINE_LABELS.get(l['hs6'], l['description']).lower()} ({l['hs6']}) {money(l['importsUsd'])}" for l in lines[:4])
TRADE_RAW = json.load(open(IU + '/src/tariff-data/trade/chapter-97.json'))
RAW_C = {x['country']: x for x in TRADE_RAW['byCountry']}


def line_sum(prefix, key):
    return sum(l[key] for l in lines if l['hs6'].startswith(prefix))


ANT, ANT_P = line_sum('9706', 'importsUsd'), line_sum('9706', 'priorImportsUsd')
PAINT, PAINT_P = line_sum('9701', 'importsUsd'), line_sum('9701', 'priorImportsUsd')
ru = RAW_C.get('Russian Federation')
cn, ca = RAW_C['China'], RAW_C['Canada']
cn_chg = (cn['importsUsd'] / cn['priorImportsUsd'] - 1) * 100
ui['why'] = (
    f"U.S. imports of Chapter 97 goods were **{money(TOTAL)} in {Y}**, {pct(CHG)} from {money(PTOTAL)} in {PY}{YEARS_NOTE}. U.S. import statistics "
    f"record the country of origin, where the work was made, not where it was bought. The largest suppliers were {why_countries}. Together the EU and "
    "the UK supply most of the chapter, and all of it enters Free today.\n\n"
    f"By product, paintings dominate: {why_lines}. Paintings, drawings and other works of 9701 rose {(PAINT / PAINT_P - 1) * 100:.0f}% to {money(PAINT)}, while "
    f"**antiques (9706) fell {(1 - ANT / ANT_P) * 100:.0f}%** to {money(ANT)}: in {Y} antiques were the only Chapter 97 goods that paid the IEEPA "
    "duties, since works of art and collectibles (9701–9705) entered free of them as informational materials.\n\n"
    f"The extra duties that remain fall on small suppliers: **Canada** ({money(ca['importsUsd'])}, now 50% on 16 lines), **China** ({money(cn['importsUsd'])}, "
    f"{pct(cn_chg)}, 7.5%) and **Russia**, whose shipments fell from {money(ru['byYear']['2020'])} in 2020 to {money(ru['importsUsd'])} in {Y} after the 35% rate "
    f"took effect in July 2022. {Y} is the latest full year of U.S. trade data, so it shows neither the 2026 Section 301 exemption nor Canada's Section 338 duty. "
    "Duty-collected figures aren't available from an official source yet."
)
IMPORTS_FAQ = (f"Mostly from Europe: {', '.join(x['country'] + ' ' + money(x['importsUsd']) for x in c[:5])} of the {money(TOTAL)} "
               f"imported in {Y} ({pct(CHG)} from {PY}). Paintings are the largest product. U.S. import statistics record the country of origin, so a French painting bought in London counts as French.")
