# Trade-dependent text for Chapter 95 — exec'd from fill95.py (shares its globals).
Y = ui['latestYear']
PY = ui['priorYear']
year_tot = {r['year']: r['totalUsd'] for r in ui['byYear']}
total, prior_total = year_tot[Y], year_tot[PY]
by_line = {x['hs6']: x for x in ui['byLine']}
trade = json.load(open(f'{WT}/src/tariff-data/trade/chapter-95.json'))
by_c_all = {c['country']: c for c in trade['byCountry']}
by_h = {h['heading']: h['byYear'] for h in trade['byHeading']}
ranked = sorted(trade['byCountry'], key=lambda c: -c['importsUsd'])

NICE = {'Viet Nam': 'Vietnam', 'Other Asia, nes': 'Taiwan', 'China, Hong Kong SAR': 'Hong Kong', 'Rep. of Korea': 'South Korea', 'Czechia': 'Czechia'}


def nice(name):
    return NICE.get(name, name)


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
TW = 'Other Asia, nes'

ui['byYearPartners'] = [nice(p) for p in ui['byYearPartners']]
partners = ui['byYearPartners']
ui['byYearCaption'] = (
    f'U.S. imports of Chapter 95 goods each year, split into the two largest {Y} suppliers ({partners[0]} and {partners[1]}) and everyone else.'
)
for s in ui['stats']:
    for k, v in NICE.items():
        s['label'] = s['label'].replace(k, v)
for c in ov['tradeSnapshot']['topCountries']:
    c['name'] = nice(c['name'])
for s in ov['stats']:
    for k, v in NICE.items():
        s['label'] = s['label'].replace(k, v)
for c in ui['byCountry']:
    if c.get('mainHeading') in GROUP_LABELS:
        c['mainHeadingLabel'] = GROUP_LABELS[c['mainHeading']][0]
for x in ui['byLine']:
    x['searchText'] = x['searchText'].replace('…', '')

ui['valueBasis'] = ui.get('valueBasis') if ui.get('valueBasis') and 'TODO' not in ui['valueBasis'] else (
    'CIF value (customs value plus freight and insurance), U.S. imports as reported to UN Comtrade'
)
ui['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar years '
    f'{min(year_tot)}–{Y}. "Other Asia, nes" is how UN Comtrade reports Taiwan.'
)
snap = ov['tradeSnapshot']
snap['source'] = f'UN Comtrade, United States imports, HS chapter 95 ({Y})'
snap['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar {Y} — before the '
    '2026 tariff changes.'
)

top = [c for c in ranked if c['country'] not in ('World',)][:6]
top_names = [nice(c['country']) for c in top]


hc = {(x['heading'], x['country']): x['importsUsd'] for x in trade['byHeadingCountry']}
h9503, h9504, h9505, h9506 = hshare('9503'), hshare('9504'), hshare('9505'), hshare('9506')
consoles = by_line['9504.50']['importsUsd']
TRADE_PARAGRAPH = (
    f'The U.S. imported **{fmt_usd(total)}** of Chapter 95 goods in {Y}, {abs(round((total / prior_total - 1) * 100, 1))}% less than in {PY}. '
    f'**China** still supplied {fmt_usd(imp("China"))} ({pct("China")}%), but that was down {abs(chg("China"))}% in a year; **Vietnam** more '
    f'than doubled to {fmt_usd(imp(VN))}, ahead of Mexico ({fmt_usd(imp("Mexico"))}), Taiwan ({fmt_usd(imp(TW))}) and Japan '
    f'({fmt_usd(imp("Japan"))}). Toys (9503) were {fmt_usd(h9503)} and video game consoles (9504.50) {fmt_usd(consoles)}.\n\n'
)
ov['intro'] = ov['intro'].replace('__TRADE_PARAGRAPH__', TRADE_PARAGRAPH)

ui['seo'] = {
    'title': 'U.S. Toy Imports by Country — Toys, Video Game Consoles & Sporting Goods from China, Vietnam, Mexico (HTS Chapter 95 Trade '
    'Statistics) | KoalaGains',
    'shortDescription': f'U.S. imports of HTS Chapter 95 toys, games and sports equipment: {fmt_usd(total)} in {Y}, with China down '
    f'{abs(chg("China"))}% and Vietnam up {chg(VN)}%. Who supplies toys, video game consoles, Christmas decorations, sporting goods and fishing '
    'tackle, by product and year, from UN Comtrade.',
    'keywords': [
        'us toy imports by country',
        'toy imports from china',
        'toy imports from vietnam',
        'video game console imports',
        'sporting goods imports',
        'toy supply chain',
        'hts chapter 95 trade statistics',
        'christmas decorations imports',
    ],
}
ui['why'] = (
    f'U.S. imports of toys, games and sports equipment were **{fmt_usd(total)} in {Y}**, {abs(round((total / prior_total - 1) * 100, 1))}% '
    f'less than the {fmt_usd(prior_total)} of {PY} and well below the {fmt_usd(year_tot[2022])} peak of 2022. Toys, dolls and puzzles '
    f'(heading 9503) were the largest group at {fmt_usd(h9503)} ({round(h9503 / total * 100)}%), followed by video game consoles, card, '
    f'board and arcade games (9504, {fmt_usd(h9504)}, of which consoles {fmt_usd(consoles)}), sports and exercise equipment (9506, '
    f'{fmt_usd(h9506)}) and Christmas and festive articles (9505, {fmt_usd(h9505)}).\n\n'
    f'The supplier map moved fast in {Y}. **China** fell {abs(chg("China"))}% to {fmt_usd(imp("China"))}, from {fmt_usd(imp_year("China", PY))} '
    f'in {PY}, in a year when Chinese goods paid IEEPA duties of up to 145% (April–May {Y}), but still shipped {fmt_usd(hc[("9503", "China")])} of '
    f'toys and {fmt_usd(hc[("9505", "China")])} of the {fmt_usd(h9505)} of Christmas and festive articles. **Vietnam** rose '
    f'{chg(VN)}% to {fmt_usd(imp(VN))} and became the largest supplier of heading 9504 ({fmt_usd(hc[("9504", VN)])} of consoles, card and other games) and '
    f'the second for toys ({fmt_usd(hc[("9503", VN)])}). **Mexico** ({fmt_usd(imp("Mexico"))}, {signed(chg("Mexico"))}) ships mostly toys; '
    f'**Taiwan** ({fmt_usd(imp(TW))}) mostly exercise and other sports equipment; **Japan** ({fmt_usd(imp("Japan"))}, {signed(chg("Japan"))}) '
    f'mostly heading 9504 games and consoles. Indonesia ({fmt_usd(imp("Indonesia"))}), Cambodia ({fmt_usd(imp("Cambodia"))}, {signed(chg("Cambodia"))}), '
    f'Thailand ({fmt_usd(imp("Thailand"))}) and Malaysia ({fmt_usd(imp("Malaysia"))}) all grew. Canada supplied {fmt_usd(imp("Canada"))}, '
    f'mostly sports equipment.\n\n'
    f'The figures are annual and stop at {Y}, before the 2026 tariff changes (the end of the IEEPA duties in February, the Section 301 '
    'tariffs from July 24, 2026 and the Canada Section 338 duty from August 22); they do not show what those changes did. Duty-collected '
    'figures are not available from an official source yet.'
)
