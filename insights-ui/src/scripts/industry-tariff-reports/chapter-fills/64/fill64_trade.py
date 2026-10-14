# Trade-dependent text for Chapter 64 — exec'd from fill64.py (shares its globals).
def nice(name):
    return 'Vietnam' if name == 'Viet Nam' else name


ui['byYearPartners'] = [nice(p) for p in ui['byYearPartners']]
partners = ui['byYearPartners']
ui['byYearCaption'] = (
    f'U.S. imports of Chapter 64 goods each year, split into the two largest {Y} suppliers ({partners[0]} and {partners[1]}) and everyone else.'
)
for s in ui['stats']:
    s['label'] = s['label'].replace('Viet Nam', 'Vietnam')
for c in ov['tradeSnapshot']['topCountries']:
    c['name'] = nice(c['name'])
for s in ov['stats']:
    s['label'] = s['label'].replace('Viet Nam', 'Vietnam')

h6403, h6404, h6402 = hshare('6403'), hshare('6404'), hshare('6402')
eu = imp('Italy') + imp('Germany') + imp('Portugal') + imp('Spain')
ui['why'] = (
    f'U.S. imports of footwear and parts were **{fmt_usd(total)} in {Y}**, {abs(round((total / prior_total - 1) * 100, 1))}% less than the '
    f'{fmt_usd(prior_total)} of {PY} and well below the {fmt_usd(year_tot[2022])} peak of 2022. '
    f'Leather-upper footwear (heading 6403) was the largest group at {fmt_usd(h6403)} ({round(h6403 / total * 100)}%), followed by '
    f'textile-upper footwear (6404, {fmt_usd(h6404)}) and rubber and plastic footwear (6402, {fmt_usd(h6402)}). The largest single product was '
    f'**leather-upper shoes with rubber or plastic soles not covering the ankle (6403.99)**, {fmt_usd(by_line["6403.99"]["importsUsd"])}, then '
    f'**rubber and plastic shoes (6402.99)**, {fmt_usd(by_line["6402.99"]["importsUsd"])}, and **textile athletic shoes (6404.11)**, '
    f'{fmt_usd(by_line["6404.11"]["importsUsd"])}.\n\n'
    f'The supplier map moved away from China. **Vietnam** supplied {fmt_usd(imp(VN))} ({pct(VN)}%, {signed(chg(VN))}), up from '
    f'{fmt_usd(imp_year(VN, 2020))} in 2020, and passed China as the largest supplier for the first time in 2020–{Y}. **China** fell {abs(chg("China"))}% to '
    f'{fmt_usd(imp("China"))}, from {fmt_usd(imp_year("China", PY))} in {PY}. **Indonesia** ({fmt_usd(imp("Indonesia"))}, '
    f'{signed(chg("Indonesia"))}) and **Cambodia** ({fmt_usd(imp("Cambodia"))}, {signed(chg("Cambodia"))}) more than doubled their 2020 '
    f'levels, and Bangladesh ({fmt_usd(imp("Bangladesh"))}, {signed(chg("Bangladesh"))}) and India ({fmt_usd(imp("India"))}) grew too. '
    f'**Italy** ({fmt_usd(imp("Italy"))}), Germany, Portugal and Spain — {fmt_usd(eu)} together — ship mostly leather-upper shoes (6403), as '
    f'do Mexico, India and Bangladesh; most of Vietnam\'s shipments are textile and leather shoes, China\'s rubber, plastic and textile shoes. Mexico '
    f'({fmt_usd(imp("Mexico"))}) and Canada ({fmt_usd(imp("Canada"))}) supplied {round((imp("Canada") + imp("Mexico")) / total * 100, 1)}% of '
    f'{Y} imports, and Brazil {fmt_usd(imp("Brazil"))}.\n\n'
    f'The figures are annual and stop at {Y}, before the 2026 tariff changes (the end of the IEEPA duties in February, the Section 301 tariffs '
    'from July 24, 2026 and the Canada Section 338 duty from August 22); they do not show what those changes did. Duty-collected figures are '
    'not available from an official source yet.'
)

# Generator quirk: heading labels cut off with "…".
for c in ui['byCountry']:
    if c.get('mainHeading') in GROUP_LABELS:
        c['mainHeadingLabel'] = GROUP_LABELS[c['mainHeading']][0]
for x in ui['byLine']:
    x['searchText'] = x['searchText'].replace('…', '')
