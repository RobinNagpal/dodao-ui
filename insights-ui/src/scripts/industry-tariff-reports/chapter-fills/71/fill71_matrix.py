# Rates by country (industryAreas) page (exec'd from fill71.py).
ia = d['industryAreas']
ia['h1'] = f'HTS Chapter 71: {SHORT} — Tariff Rates by Country'
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]

BUL = 'Bullion, gold, platinum-group metals and legal-tender coin (note 52(b)) are exempt.'
RULE_LABELS = {
    'Switzerland': 'Swiss goods: 12.5% in total in place of the base rate when the base rate is lower (9903.05.74). ' + BUL + ' Swiss natural '
    'pearls, diamonds and gemstones are exempt too (note 52(j)(3), 9903.05.98). The IEEPA rate (39%, then 15% in total) ended February 24, '
    '2026.',
    'Canada': 'USMCA-qualifying: no Section 301 duty (9903.05.93); otherwise base rate + 10% (9903.05.29). ' + BUL + ' On top, 50% Section 338 '
    '(9903.03.14) on polished diamonds, cast silver bars, silver and gold jewelry, costume jewelry and non-legal-tender coin, whether or not '
    'USMCA is claimed.',
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94). Otherwise base rate + 10% Section 301 (9903.05.55). ' + BUL + ' The 25% IEEPA duty '
    'ended February 24, 2026.',
    'India': 'Base rate + 10% Section 301 (9903.05.44), on diamonds, lab-grown diamonds, gemstones and jewelry alike. ' + BUL + ' The IEEPA '
    'duties (up to 50%) ended in February 2026.',
    'Israel': 'Base rate + 12.5% Section 301 (9903.05.47); the U.S.–Israel FTA (IL) removes the base rate but not the 12.5% (note 52(a)). ' + BUL,
    'Belgium': 'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39). ' + BUL + ' EU natural pearls, '
    'diamonds and gemstones are exempt too (note 52(j)(2), 9903.05.97), so Antwerp diamonds enter Free.',
    'Italy': 'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39) — gold and silver jewelry pay 10%. '
    + BUL + ' EU natural pearls, diamonds and gemstones are exempt (9903.05.97).',
    'Germany': 'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39). ' + BUL + ' EU natural pearls, '
    'diamonds and gemstones are exempt (9903.05.97).',
    'France': 'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39). ' + BUL + ' EU natural pearls, '
    'diamonds and gemstones are exempt (9903.05.97).',
    'South Africa': 'Base rate + 12.5% Section 301 (9903.05.69); AGOA (D) removes the base rate but not the 12.5% (note 52(a)). ' + BUL
    + ' The 30% IEEPA rate ended February 24, 2026.',
    'United Arab Emirates': 'Base rate + 12.5% Section 301 (9903.05.80). ' + BUL,
    'Thailand': 'Base rate + 12.5% Section 301 (9903.05.77). ' + BUL + ' The 19% IEEPA rate ended February 24, 2026.',
    'Hong Kong': 'Base rate + 12.5% Section 301 (9903.05.43). ' + BUL + ' Hong Kong goods are not on the China lists.',
    'China': 'Base rate + 12.5% Section 301 (9903.05.31), except on note 52(b) bullion, plus +25% List 3 (9903.88.03) on precious metals, '
    'bullion, scrap and silverware, or +7.5% List 4A (9903.88.15) on pearls, diamonds, gemstones, jewelry, costume jewelry and coin. Six '
    'pearl, gemstone and toy-jewelry lines are on no list.',
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81). ' + BUL + ' The UK exception list names no Chapter 71 line.',
    'Peru': 'Base rate + 12.5% Section 301 (9903.05.63); the Peru TPA (PE) removes the base rate but not the 12.5%. ' + BUL,
    'Colombia': 'Base rate + 12.5% Section 301 (9903.05.32); the Colombia TPA (CO) removes the base rate but not the 12.5%. ' + BUL,
    'Australia': 'Base rate + 12.5% Section 301 (9903.05.23); the Australia FTA (AU) removes the base rate but not the 12.5%. ' + BUL,
    'Brazil': 'Base rate + 25% (9903.05.01) + 12.5% (9903.05.27). Bullion and rough gemstones (7103.10) skip the 25% (note 50(a)(ii)); bullion '
    'skips the 12.5% too.',
    'Japan': 'Japanese goods: 12.5% in total in place of the base rate when the base rate is lower (9903.05.49), cultured pearls included. ' + BUL,
    'Russia': 'Column 2 rates, or 35% in place of column 2 on 45 lines (9903.90.08), plus +12.5% Section 301 (9903.05.66) outside note 52(b). '
    'Russian gold, non-industrial diamonds and diamond jewelry cannot be imported at all (OFAC).',
    'Kazakhstan': 'Base rate + 12.5% Section 301 (9903.05.51). ' + BUL,
    'South Korea': 'Korean goods: 12.5% in total in place of the base rate when the base rate is lower (9903.05.71). ' + BUL,
    'Turkey': 'Base rate + 12.5% Section 301 (9903.05.79). ' + BUL,
    'Türkiye': 'Base rate + 12.5% Section 301 (9903.05.79). ' + BUL,
    'Vietnam': 'Base rate + 12.5% Section 301 (9903.05.84). ' + BUL,
    'Dominican Republic': 'Base rate + 12.5% Section 301 (9903.05.34), even under CAFTA-DR. ' + BUL,
    'Singapore': 'Base rate + 12.5% Section 301 (9903.05.68), even under the Singapore FTA. ' + BUL,
}


def rule_label(c):
    name = c['country']
    if name in RULE_LABELS:
        return RULE_LABELS[name]
    if name == 'Any other country':
        return (
            'Countries outside the 60 Section 301 economies (for example Botswana, Namibia, Mauritius) pay only the base rate. The others pay '
            '+10% or +12.5% (9903.05.20–9903.05.84), or 12.5% in total for South Korea and 10% for Taiwan; bullion is exempt everywhere, and '
            'natural pearls, diamonds and gemstones are exempt for Malaysia, Cambodia, Guatemala, El Salvador, Argentina, Bangladesh, Taiwan, '
            'Indonesia, Ecuador and Jordan (note 52(j)). Column 2 countries (Cuba, North Korea, Russia, Belarus) pay column 2 rates — Free to '
            '110%.'
        )
    raise SystemExit(f'no rule label for {name}')


for c in ia['countries']:
    c['rule']['label'] = rule_label(c)
    if c['country'] == 'Any other country':
        c['rule']['ch99Code'] = '9903.05.20–9903.05.84'
    ids = c['rule']['sourceIds']
    if c['country'] not in ('Any other country', 'Peru', 'Colombia', 'Australia', 'Brazil', 'Russia', 'Dominican Republic', 'Singapore'):
        if 'eo-14389' not in ids:
            ids.insert(-1, 'eo-14389')
    if c['country'] == 'Russia':
        for s in ('ofac-ru-gold', 'ofac-ru-diamonds'):
            if s not in ids:
                ids.insert(-1, s)
need = set()
for c in ia['countries']:
    need.update(c['rule']['sourceIds'])
add_sources(ia, sorted(need))

ia['seo'] = {
    'title': 'Gold, Diamond & Jewelry Tariffs by Country 2026 — India, Switzerland, Belgium, Israel, Canada, China (HTS Ch. 71) | KoalaGains',
    'shortDescription': 'The total 2026 U.S. tariff on gold, silver, platinum, diamonds, gemstones, jewelry and coins by country: bullion '
    'Free from everywhere, Belgian and Swiss diamonds Free, Indian diamonds 10%, Israeli 12.5%, Canadian 50%; gold jewelry 10% from Italy, '
    '15.5% from India, 25.5% from China.',
    'keywords': [
        'chapter 71 import duty rates',
        'tariff on diamonds from india to usa',
        'tariff on diamonds from israel',
        'tariff on jewelry from italy',
        'tariff on jewelry from canada to usa',
        'switzerland gold bars tariff',
        'south africa platinum tariff',
        'china section 301 jewelry tariffs',
        'india tariff on gold jewelry',
    ],
}
ia['intro'] = (
    'Most Chapter 71 base rates are Free, so the total a shipment pays is mostly the **extra duty for its country of origin**. Each cell below '
    'is the base rate for that product group plus the extra duty for that country, minus any preference — taken from the current tariff '
    'schedule.\n\n'
    '**Bullion pays nothing from anywhere** except China: gold, silver bullion and doré, platinum-group metals, minted bars and legal-tender '
    'coin are on the Section 301 exemption list. For everything else the Section 301 tariff of July 24, 2026 applies: **+10% for India**, '
    '**+12.5% for Israel, the UAE, South Africa, Thailand and Hong Kong**, **10% in total for the EU** and **12.5% in total for Switzerland '
    'and Japan** — but **EU and Swiss diamonds, gemstones and natural pearls are exempt**, so Antwerp and Swiss stones enter Free while Indian '
    'ones pay 10%. China pays +12.5% plus 25% (List 3) or 7.5% (List 4A). USMCA-qualifying goods from Mexico pay nothing; from Canada, '
    'polished diamonds, cast silver bars, jewelry, costume jewelry and non-legal-tender coin pay **50% under Section 338** even with a USMCA '
    'claim.'
)
assumptions = [a for a in ia['assumptions'] if 'TODO' not in a]
assumptions += [
    'Canada, "USMCA-qualifying" side: the Section 301 duty is removed (9903.05.93), but the 50% Section 338 duty stays on the seven listed '
    'subheadings because U.S. note 51(a) applies it even when a special rate is claimed.',
    'EU, Switzerland and Japan "in total" rules: where the base rate is below 10% (EU) or 12.5% (Switzerland, Japan), the total is that '
    'figure; lines at or above it pay only their base rate.',
    'Not in the cells: the OFAC import bans on Russian gold and diamonds and on Russian-mined diamonds cut elsewhere (the goods cannot be '
    'entered); the Kimberley Process requirements for rough diamonds; the note 52(j) exemptions for the stones of Malaysia, Cambodia, '
    'Guatemala, El Salvador, Argentina, Bangladesh, Taiwan, Indonesia, Ecuador and Jordan (those countries are in "Any other country"); '
    'AGOA and FTA preferences of countries not listed. No antidumping or countervailing duty order and no Section 232 duty covers a Chapter '
    '71 product.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied.',
]
ia['assumptions'] = assumptions
ia['exemptionCheck'] = (
    'Read U.S. notes 16, 19, 20, 30, 33, 36–39, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 general '
    'exemption list (note 52(b), 9903.05.86) names 21 Chapter 71 subheadings: 7106.91.10, all of 7108 (7108.11.00, 7108.12.10, 7108.12.50, '
    '7108.13.10, 7108.13.55, 7108.13.70, 7108.20.00), all of 7110, 7112.30.01, 7112.92.01, 7115.90.05, 7115.90.30 and 7118.90.00. The '
    'country exception lists in note 52(j) name the same ten pearl, diamond and gemstone subheadings (7101.10.30, 7101.10.60, 7102.10.00, '
    '7102.31.00, 7102.39.00, 7103.10.20, 7103.10.40, 7103.91.00, 7103.99.10, 7103.99.50) for the EU (9903.05.97), Switzerland (9903.05.98), '
    'Malaysia, Cambodia, Guatemala, El Salvador, Argentina, Bangladesh, Taiwan, Indonesia, Ecuador and Jordan; the UK list names none. The '
    'Brazil list (note 50(a)(ii), 9903.05.03) names the 21 bullion subheadings plus 7103.10.20 and 7103.10.40. The Canada Section 338 list '
    '(note 51(b)(3), 9903.03.14) names 7102.39.00, 7106.92.10, 7113.11.50, 7113.19.29, 7113.19.50, 7117.19.90 and 7118.10.00; the '
    'alcoholic-beverage and dairy lists and the September 29, 2026 import bans name none. China: List 3 (9903.88.03) and List 4A '
    '(9903.88.15) together cover every Chapter 71 subheading except six on the suspended List 4B (7116.10.10, 7116.20.05, 7117.19.05, '
    '7117.90.45, 7117.90.60, 7117.90.75); no note 20 exclusion and no 2024 four-year-review increase (note 31) names a Chapter 71 line. Section '
    '232: no Chapter 71 line is on the metal, vehicle, wood or semiconductor lists; the certified auto-parts elections are opt-in and not '
    'applied. Note 30(b) sets 35% in place of column 2 on 45 Russian lines. A Federal Register search of Commerce (ITA) notices found no antidumping or countervailing duty order on a Chapter '
    '71 subheading.'
)
