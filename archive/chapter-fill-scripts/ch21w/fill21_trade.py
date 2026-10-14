# Executed inside fill21.py when trade data exists (uses ui, Y, PY, total, prior_total, by_c, top, fmt_usd, pct).
def _c(name):
    return by_c[name]


def _line(hs6):
    return next(x for x in ui['byLine'] if x['hs6'] == hs6)


sg, ca, mx, cn, co = _c('Singapore'), _c('Canada'), _c('Mexico'), _c('China'), _c('Colombia')
l2106, l2101 = _line('2106.90'), _line('2101.11')
chg = (total - prior_total) / prior_total * 100
ui['h1'] = 'HTS Chapter 21: Miscellaneous Edible Preparations — U.S. Import Statistics'
ui['seo'] = {
    'title': 'HTS Chapter 21 Import Statistics: Food Preparations, Supplements, Sauces & Coffee Extracts by Country | KoalaGains',
    'shortDescription': f'U.S. imports of miscellaneous edible preparations 2020–{Y}: by country, by product and over time. {fmt_usd(total)} in {Y}, '
    f'led by Singapore and Canada; food preparations (2106.90) are half the total.',
    'keywords': [
        'miscellaneous edible preparations imports by country',
        'HTS Chapter 21 import statistics',
        'US food preparation imports Singapore',
        'hts 2106 imports',
        'US dietary supplement imports',
        'instant coffee imports Colombia Mexico',
    ],
}
ui['valueBasis'] = 'CIF value (customs value plus freight and insurance), as reported by the United States to UN Comtrade.'
ui['byYearCaption'] = (
    f'U.S. imports of Chapter 21 goods each year, split into the two largest {Y} suppliers (Singapore and Canada) and everyone else.'
)
peak = max(ui['byYear'], key=lambda r: r['partnerAUsd'])
ui['why'] = (
    f'U.S. imports of Chapter 21 goods were **{fmt_usd(total)} in {Y}**, {abs(chg):.1f}% {"less" if chg < 0 else "more"} than the '
    f'{fmt_usd(prior_total)} of {PY}. Half of the total is one product: **food preparations not elsewhere specified (2106.90)**, '
    f'{fmt_usd(l2106["importsUsd"])} — the subheading that holds dietary supplements, drink preparations, creamers and syrups. Sauces and '
    f'seasonings (2103.90) come next at {fmt_usd(_line("2103.90")["importsUsd"])}.\n\n'
    f'**Singapore** is the largest supplier ({fmt_usd(sg["importsUsd"])}), and almost all of it is heading 2106. Its shipments fell '
    f'{abs(sg["changePct"]):.1f}% in {Y} and are down from {fmt_usd(peak["partnerAUsd"])} in {peak["year"]}. **China** fell '
    f'{abs(cn["changePct"]):.1f}% to {fmt_usd(cn["importsUsd"])}. Going the other way, coffee extracts and instant coffee (2101.11) rose '
    f'{l2101["changePct"]:.0f}% to {fmt_usd(l2101["importsUsd"])}, and **Colombia**, mostly a coffee-extract supplier, grew {co["changePct"]:.0f}% '
    f'to {fmt_usd(co["importsUsd"])}. Coffee extracts are Free under the general rate and on the 2026 Section 301 exemption list.\n\n'
    f'Canada ({fmt_usd(ca["importsUsd"])}) and Mexico ({fmt_usd(mx["importsUsd"])}) supplied {pct(ca["importsUsd"] + mx["importsUsd"], total)}% '
    f'of {Y} imports; USMCA-qualifying goods from both pay no extra duty. The figures are annual and stop at {Y}, before the 2026 tariff '
    'changes (the end of the IEEPA duties in February and the Section 301 tariffs from July 24, 2026); they do not show what those changes did. '
    'Duty-collected figures are not available from an official source yet.'
)
ui['sources'].append(
    {'label': 'HTSUS 2026 Revision 21, Chapter 99, U.S. note 52(b) (Section 301 exemption list)', 'url': CH99_PDF}
)
ov['intro'] = (
    'Chapter 21 is the "everything else" chapter of the food schedule: coffee and tea extracts, yeasts, sauces and seasonings, soups, ice cream '
    'and — in heading 2106 — dietary supplements, protein concentrates, drink mixes and flavored syrups. Its **118 tariff lines** run from Free on '
    'instant coffee to $1.996/kg on over-quota butter substitutes, and half the trade sits under one subheading: **2106.90**, mostly 2106.90.99 at '
    '6.4%.\n\n'
    f'The U.S. imported **{fmt_usd(total)}** of these goods in {Y}. **Singapore** ({fmt_usd(sg["importsUsd"])}, almost all food preparations) and '
    f'**Canada** ({fmt_usd(ca["importsUsd"])}) were the largest suppliers, then Mexico and Italy. On top of the base rate comes an **extra duty by '
    'country**: since July 24, 2026 a Section 301 tariff on 60 economies — +12.5% for Singapore (12.5% in all when the U.S.–Singapore FTA makes the '
    'base rate Free), 10% in total for the EU, +20% for China (+37.5% on soy sauce and protein concentrates) and +37.5% for Brazil. '
    'USMCA-qualifying goods from Canada and Mexico are exempt, and six coffee, tea, sugar-syrup and fortified orange juice lines are exempt for '
    'every country. Lines that contain sugar or dairy are also under **tariff-rate quotas**: a low rate inside the quota, a high per-kilogram rate '
    'above it.'
)
