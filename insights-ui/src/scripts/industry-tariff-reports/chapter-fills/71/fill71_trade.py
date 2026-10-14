# Trade-based prose: overview intro + import statistics page (exec'd from fill71.py).
ch_ = lambda c: pct(imp(c), imp(c, PY))  # noqa: E731
g7115 = himp('7115')
gem_dia = himp('7102')
assert TOPN[:6] == ['Switzerland', 'Australia', 'South Africa', 'Canada', 'Mexico', 'India'], TOPN

ov['intro'] = (
    'Chapter 71 covers pearls, diamonds and gemstones, lab-grown stones, gold, silver and the platinum-group metals in every form from doré '
    'to minted bars, precious-metal scrap, fine jewelry, silverware, costume jewelry and coin. **Most base rates are Free**: 73 of the 140 '
    'lines — every diamond, pearl, bullion, bar and coin line — pay nothing; fine jewelry pays 5%–13.5% and costume jewelry up to 11%.\n\n'
    f'The U.S. imported **{fmt_usd(total)}** of these goods in {Y}, {pct(total, prior_total)}% more than in {PY}, driven by precious metal: '
    f'other precious-metal articles (7115.90, where minted bars are classified) {fmt_usd(g7115)}, gold {fmt_usd(g7108)}, platinum-group '
    f'metals {fmt_usd(g7110)} and silver {fmt_usd(g7106)}. **Switzerland** ({fmt_usd(imp("Switzerland"))}) was the largest supplier, ahead '
    f'of Australia, South Africa, Canada and Mexico; **India** ({fmt_usd(imp("India"))}) leads in diamonds and jewelry.\n\n'
    'The extra duty depends on the product as much as on the country. **Bullion, bars, platinum-group metals and legal-tender coin are '
    'exempt** from the 2026 Section 301 tariffs (note 52(b)) — they pay nothing from anywhere except China (25%, List 3). Diamonds, '
    'gemstones and jewelry pay the country rate: **+10% from India**, +12.5% from Israel, South Africa, Thailand and Hong Kong, 10% in total '
    'from the EU — but **EU and Swiss diamonds and gemstones are exempt**. China pays up to 31% on costume jewelry. Canadian polished '
    'diamonds, cast silver bars and jewelry pay a **50% Section 338 duty even under USMCA**, and Russian gold and diamonds cannot be imported.'
)
# Count of Free lines, from the rate table (checked: 140 lines, 67 dutiable).
assert any(s['value'] == '67 of 140' for s in ov['stats']), ov['stats']

ui['h1'] = f'HTS Chapter 71: {SHORT} — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Gold, Diamond & Jewelry Imports by Country — HTS Chapter 71 Trade Statistics | KoalaGains',
    'shortDescription': f'U.S. imports of HTS Chapter 71 goods: {fmt_usd(total)} in {Y}. Who supplies gold and silver bars, platinum, '
    'diamonds and jewelry — Switzerland, Australia, South Africa, Canada, Mexico, India, Israel, Belgium, Italy — with values by product and '
    'year from UN Comtrade.',
    'keywords': [
        'hts chapter 71',
        'hts chapter 71 import duty rates',
        'us gold imports by country',
        'us diamond imports by country',
        'india diamond trade tariffs',
        'switzerland gold imports us',
        'south africa platinum group metals',
        'us jewelry imports by country',
    ],
}
ui['byYearCaption'] = (
    f'U.S. imports of Chapter 71 goods each year, split into the two largest {Y} suppliers (Switzerland and Australia) and everyone else.'
)
ui['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar years '
    f'2020–{Y}. They include monetary and non-monetary gold. Partners without an ISO code in the source (Myanmar, the British Indian Ocean '
    'Territory, the British Virgin Islands) are counted in the totals but not shown by name.'
)
ui['why'] = (
    f'U.S. imports of Chapter 71 goods were **{fmt_usd(total)} in {Y}**, {pct(total, prior_total)}% more than the {fmt_usd(prior_total)} of '
    f'{PY} and well above the {fmt_usd(year_tot[2020])} of 2020. Almost all of the jump was precious metal: other precious-metal articles '
    f'(7115.90, which includes minted bars) rose from {fmt_usd(himp("7115", PY))} to {fmt_usd(g7115)}, gold (7108) from '
    f'{fmt_usd(himp("7108", PY))} to {fmt_usd(g7108)}, silver from {fmt_usd(himp("7106", PY))} to {fmt_usd(g7106)} and the platinum-group '
    f'metals from {fmt_usd(himp("7110", PY))} to {fmt_usd(g7110)}.\n\n'
    f'**Switzerland** supplied {fmt_usd(imp("Switzerland"))} ({round(imp("Switzerland") / total * 100)}%), four times its {PY} level — '
    f'{fmt_usd(hcimp("7115", "Switzerland"))} in 7115 and {fmt_usd(hcimp("7108", "Switzerland"))} in gold. **Australia** '
    f'({fmt_usd(imp("Australia"))}) and **Canada** ({fmt_usd(imp("Canada"))}) ship gold and bars; **South Africa** '
    f'({fmt_usd(imp("South Africa"))}) is the main source of platinum-group metals ({fmt_usd(hcimp("7110", "South Africa"))}); **Mexico** '
    f'({fmt_usd(imp("Mexico"))}) of silver ({fmt_usd(hcimp("7106", "Mexico"))}).\n\n'
    f'Diamonds and jewelry fell. Diamond imports (7102) halved to {fmt_usd(gem_dia)} from {fmt_usd(himp("7102", PY))}: India '
    f'{fmt_usd(hcimp("7102", "India"))}, Israel {fmt_usd(hcimp("7102", "Israel"))}, Belgium {fmt_usd(hcimp("7102", "Belgium"))}. **India** as a '
    f'whole dropped {abs(ch_("India"))}% to {fmt_usd(imp("India"))} and **Israel** {abs(ch_("Israel"))}% to {fmt_usd(imp("Israel"))}. Fine '
    f'jewelry (7113) was {fmt_usd(g7113)}, led by India ({fmt_usd(hcimp("7113", "India"))}), Italy ({fmt_usd(hcimp("7113", "Italy"))}), '
    f'France ({fmt_usd(hcimp("7113", "France"))}) and Thailand ({fmt_usd(hcimp("7113", "Thailand"))}); lab-grown and synthetic stones (7104) '
    f'{fmt_usd(himp("7104"))}, mostly from India; costume jewelry (7117) {fmt_usd(g7117)}, mostly from China.\n\n'
    f'The figures are annual and stop at {Y}, before the 2026 tariff changes (the end of the IEEPA duties in February, the Section 301 '
    'tariffs from July 24, 2026 and the Canada Section 338 duties from August 22); they do not show what those changes did. Duty-collected '
    'figures are not available from an official source yet.'
)
ui['effectiveDuty']['note'] = 'Duty-collected figures aren’t available from an official source yet.'
ts['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar {Y} — before '
    'the 2026 tariff changes. They include monetary and non-monetary gold.'
)
