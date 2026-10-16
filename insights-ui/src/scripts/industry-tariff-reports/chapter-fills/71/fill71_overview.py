# Overview page (exec'd from fill71.py). Trade figures from fill71_body.py.
top = sorted(trade['byCountry'], key=lambda c: -c['importsUsd'])
TOPN = [c['country'] for c in top[:8]]
g7108, g7102, g7113, g7110, g7106, g7103, g7117, g7118 = (himp(h) for h in ('7108', '7102', '7113', '7110', '7106', '7103', '7117', '7118'))


def share(x, of=None):
    return round(x / (of or total) * 100)


ov['seo']['title'] = 'HTS Chapter 71 Tariffs 2026: Gold, Diamond & Jewelry Import Duty Rates by Country | KoalaGains'
ov['seo']['shortDescription'] = (
    'Searchable 2026 U.S. tariff table for all 140 HTS Chapter 71 lines — gold, silver and platinum bullion and bars, diamonds, lab-grown '
    'diamonds, gemstones, pearls, jewelry, costume jewelry and coins. Most base rates are Free; the extra duty by country decides the cost: '
    'bullion exempt, Indian diamonds +10%, Israeli +12.5%, EU and Swiss diamonds Free.'
)
ov['seo']['keywords'] = [
    'hts chapter 71',
    'hts chapter 71 import duty',
    'precious metals import duty rates',
    'us import duties on gold bullion',
    'switzerland gold bars tariff',
    'india diamond trade tariffs',
    'tariff on jewelry',
    'hs code for jewelry',
    'hts code for diamonds',
    'natural or cultured pearls tariff',
    'section 301 imitation jewelry tariffs',
]

ov['workedExamples'] = [
    {
        'title': 'Polished diamond from India (over 0.5 carat)',
        'line': '7102.39.00.50',
        'body': 'The base rate is Free. India pays +10% under the 2026 Section 301 action (9903.05.44) and has no exception list, so a '
        '$100,000 parcel pays **$10,000**. The same stones cut in Belgium or Switzerland pay nothing (note 52(j), 9903.05.97/.98); from Israel '
        'or the UAE they pay 12.5%; from Canada 50% even under USMCA (Section 338). Between August 27, 2025 and February 6, 2026 the Indian '
        'parcel paid 50% under IEEPA. A stone of 0.5 carat or more mined in Russia cannot be imported at all.',
    },
    {
        'title': 'Kilobar of gold from Switzerland',
        'line': '7108.13.55.00',
        'body': 'Cast and stamped 1-kilogram and 100-ounce bars are semi-manufactured gold, not unwrought bullion (CBP ruling NY N351466), '
        'and the base rate is Free. Every 7108 line is on the Section 301 general exemption list (note 52(b), 9903.05.86), so a $1,000,000 '
        'shipment pays **$0** — from Switzerland, the UK, Canada or anywhere else except China, where the 25% List 3 duty still applies. From '
        'August 7 to September 7, 2025 Swiss bars paid the 39% reciprocal duty.',
    },
    {
        'title': '18-karat gold ring from Italy',
        'line': '7113.19.50.91',
        'body': 'The base rate is 5.5%. EU goods with a base rate under 10% pay 10% in total (9903.05.39), so a $50,000 order pays '
        '**$5,000**. The same ring pays 15.5% from India, 18% from the UAE, Thailand or Hong Kong, 12.5% from Israel under the FTA, 25.5% '
        'from China (5.5% + 12.5% + 7.5% List 4A) and 50% from Canada even under USMCA. If it is set with diamonds, the setting does not '
        'change the line: diamond jewelry of gold is still 7113.19.50.',
    },
    {
        'title': 'Silver bars from Canada — cast or minted',
        'line': '7106.92.10.00',
        'body': 'Cast silver bars of 99.5% (7106.92.10, NY N357226) are Free, but the line is on the Canada Section 338 list, so they pay **50%** '
        '— $15,000 on $30,000 — even under USMCA, and 60% without a USMCA claim. Silver bullion and doré (7106.91.10), minted silver bars of '
        '7115.90.05 and Canadian Maple Leaf coins (7118.90) are on neither the Section 338 list nor the Section 301 list, and enter Free. The '
        'line follows how the bar was made, not how it is sold.',
    },
    {
        'title': 'Costume jewelry from China',
        'line': '7117.19.90.00',
        'body': 'Base-metal costume jewelry pays 11%. China adds +12.5% (9903.05.31) and +7.5% because the line is on List 4A (9903.88.15): '
        '**31%**, $3,100 on a $10,000 order. The same goods pay 21% from India, 23.5% from Thailand or Hong Kong and 11% from the EU (the '
        'base rate is already above 10%, so nothing is added). Since August 29, 2025 low-value parcels no longer enter duty-free under de '
        'minimis.',
    },
]
stats = ov['stats']
for s in stats:
    if s['label'] == 'Lines with an extra duty for some origins':
        s['note'] = (
            'Section 301 (2026, 60 economies): 104 — the 36 bullion lines of note 52(b) are exempt; Brazil: 102; China List 3 or 4A: 134; '
            'Canada Section 338: 14 (also on USMCA goods); Russia 35% in place of column 2: 45'
        )
ov['stats'] = [s for s in stats if s['label'] in ('Tariff lines', 'Lines with a base-rate duty', 'Lines with an extra duty for some origins')]
ov['stats'] += [
    {'label': f'{Y} imports', 'value': fmt_usd(total)},
    {'label': 'Gold (heading 7108) share', 'value': f'{share(g7108)}%'},
]

ts = ov['tradeSnapshot']
ts['effectiveDutyRateNote'] = 'Duty-collected figures aren’t available from an official source yet.'
ts['source'] = f'UN Comtrade, United States imports, HS chapter 71 ({Y})'
ts['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar {Y} — before '
    'the 2026 tariff changes. They include monetary and non-monetary gold.'
)
