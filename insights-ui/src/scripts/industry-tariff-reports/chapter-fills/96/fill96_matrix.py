# Rates by country (industryAreas) page (exec'd from fill96.py).
ia = d['industryAreas']
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]

SHELL = 'Worked shell (9601.90.20) is exempt (note 52(b)).'
RULE_LABELS = {
    'China': 'Base rate + 12.5% Section 301 (9903.05.31) on every line but worked shell, plus +25% List 3 (9903.88.03) on buttons, '
    'zippers and tripods (33 lines) or +7.5% List 4A (9903.88.15) on 84 lines — most pens, pencils, brooms, toothbrushes, lighters and '
    'diapers. The 40 List 4B lines (combs, hair clips, paint and hair brushes, small vacuum flasks) pay only the 12.5%. Cased pencils also '
    'owe a 114.90% antidumping duty (not in the cells).',
    'Canada': 'USMCA-qualifying: no extra duty (9903.05.93) and Free under USMCA. Otherwise base rate + 10% Section 301 (9903.05.29). No '
    'Chapter 96 line is on the Section 338 lists. The 35% IEEPA duty ended February 24, 2026.',
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94) and Free under USMCA. Otherwise base rate + 10% Section 301 (9903.05.55). The '
    '25% IEEPA duty ended February 24, 2026.',
    'Japan': 'Japanese goods: 12.5% in total in place of the base rate when the base rate is lower (9903.05.49); textile diapers at 14.9% '
    'or 16% pay their base rate. ' + SHELL + ' The 15% IEEPA rate ended February 24, 2026.',
    'Vietnam': 'Base rate + 12.5% Section 301 (9903.05.84). ' + SHELL + ' The 20% IEEPA rate ended February 24, 2026.',
    'Germany': 'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39); zippers at 11.5%–13%, textile '
    'diapers and over-quota brooms pay their base rate. ' + SHELL,
    'France': 'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39) — French lighters and pens pay 10%. '
    + SHELL,
    'Italy': 'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39). ' + SHELL,
    'Spain': 'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39). ' + SHELL,
    'Czechia': 'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39) — Czech diapers and pads pay 10%. '
    + SHELL,
    'India': 'Base rate + 10% Section 301 (9903.05.44). ' + SHELL + ' The IEEPA duties (up to 50%) ended in February 2026.',
    'Thailand': 'Base rate + 12.5% Section 301 (9903.05.77). ' + SHELL + ' The 19% IEEPA rate ended February 24, 2026.',
    'Dominican Republic': 'Base rate + 12.5% Section 301 (9903.05.34); CAFTA-DR (P) removes the base rate but not the 12.5% (note 52(a)). '
    'The note 52(i) textile relief is not applied to any Chapter 96 line. ' + SHELL,
    'South Korea': 'Korean goods: 12.5% in total in place of the base rate when the base rate is lower (9903.05.71); the Korea FTA (KR) '
    'removes the base rate but not the 12.5%. ' + SHELL,
    'Taiwan': 'Taiwanese goods: 10% in total in place of the base rate when the base rate is lower (9903.05.76). ' + SHELL,
    'Brazil': 'Base rate + 25% (9903.05.01) + 12.5% (9903.05.27); the Brazil exemption list (note 50(a)(ii)) names no Chapter 96 line. '
    'Worked shell skips only the 12.5%.',
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81); the UK exception list names no Chapter 96 line. ' + SHELL,
    'Malaysia': 'Base rate + 10% Section 301 (9903.05.54). ' + SHELL,
    'Cambodia': 'Base rate + 10% Section 301 (9903.05.28). ' + SHELL,
    'Indonesia': 'Base rate + 10% Section 301 (9903.05.45). ' + SHELL,
}
for c in ia['countries']:
    name = c['country']
    if name in RULE_LABELS:
        c['rule']['label'] = RULE_LABELS[name]
    elif name == 'Any other country':
        c['rule']['label'] = (
            'Countries outside the 60 Section 301 economies (for example Myanmar, Nepal, Kenya, Laos or Panama) pay only the base rate. '
            'The 60 pay +10% or +12.5% (9903.05.20–9903.05.84), or 10% or 12.5% in total; China +20% to +37.5% and Brazil +37.5%. No note 52(j) '
            'exception list names a Chapter 96 line. Column 2 countries (Cuba, North Korea, Russia, Belarus) pay column 2 rates — 20% to 110%.'
        )
    else:
        raise SystemExit('no rule label for ' + name)

ia['seo'] = {
    'title': 'Pens, Brushes, Zippers, Lighters & Diaper Tariffs by Country 2026 — China, Canada, Mexico, Japan, Vietnam, EU (HTS Ch. 96) '
    '| KoalaGains',
    'shortDescription': 'The total 2026 U.S. tariff on pens, pencils, brushes, zippers, buttons, lighters, vacuum flasks, combs and diapers '
    'by country: Free for USMCA goods, 10% for EU goods, 12.5% for Japan and Korea, +12.5% for Vietnam and Thailand, up to 50.5% for '
    'Chinese zippers.',
    'keywords': [
        'chapter 96 customs duty',
        'apparel fasteners import duty',
        'section 301 tariffs on stationery',
        'japan tariff on miscellaneous manufactured articles',
        'tariffs on diapers',
        'vacuum flask tariff by country',
        'tariff on pens from china',
        'zipper tariff code',
    ],
}
ia['intro'] = (
    'Chapter 96 base rates are moderate — mostly 2%–10%, with many Free lines — so for most suppliers the **extra duty by country** is the '
    'bigger part of the bill. Each cell below is the base rate for that product group plus the extra duty for that country, minus any '
    'preference — taken from the current tariff schedule.\n\n'
    'Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** that started '
    'July 24, 2026: **+10% for India, Malaysia, Cambodia, Indonesia and the UK**, **+12.5% for Vietnam, Thailand and the Dominican '
    'Republic**, **10% in total for EU and Taiwanese goods** and **12.5% in total for Japan and Korea** — nothing added where the base rate is '
    'already that high. **China adds 12.5% plus its list duty**: +25% on buttons, zippers and tripods, +7.5% on most pens, pencils, brooms, '
    'lighters and diapers, nothing more on combs, hair clips, paint brushes and small vacuum flasks. USMCA-qualifying goods from Canada and '
    'Mexico — including $1.18B of diapers and pads in 2025 — pay nothing. Brazil pays +37.5% on everything.'
)

assume = ia['assumptions'][:5]
assume += [
    'Not in the cells: the 114.90% antidumping duty on cased pencils from China (9609.10.00), which depends on the exporter and is '
    'collected as a cash deposit; the CPSC lighter rules and FDA device rules, which add compliance cost but no duty.',
    'Sets and accessories (9608.50, 9620.00.15, 9620.00.30) take "the rate applicable" to another article; the cells show that wording plus '
    'the extra duty. For China the cells add the list duty of the set or accessory line; under notes 20(z)–(gg) (9903.88.21–9903.88.28) '
    'that list duty does not apply when the set or accessory takes its rate from a subheading that itself carries a China list duty.',
    'Brooms of broomcorn (9603.10.05, 9603.10.40) pay 8% only until the year\'s quantity (61,655 dozen whiskbrooms, 121,478 dozen other '
    'brooms) has been entered; after that 5¢ or 32¢ each (9603.10.15, 9603.10.50). Each line is priced at its own rate.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied. No Chapter 96 line is on the Canada Section 338 lists.',
]
ia['assumptions'] = assume
ia['exemptionCheck'] = (
    'Read U.S. notes 16, 19, 20, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 general '
    'exemption list (note 52(b), 9903.05.86) names one Chapter 96 line, worked shell (9601.90.20); the civil-aircraft list (note 52(d), '
    '9903.05.88) names tripods of plastics and of carbon (9620.00.50, 9620.00.60) when entered for civil aircraft. No note 52(j) country '
    'exception list names a Chapter 96 line, and the CAFTA-DR textile relief (note 52(i)) is not applied to Chapter 96. The Brazil list '
    '(note 50(a)(ii)) has none. The Canada Section 338 lists (note 51(b)(1)–(3)) have none; 9620.00.50 and 9620.00.60 appear only on the '
    'civil-aircraft relief list (note 51(d)). China: List 3 (note 20(f)) covers all 9606, 9607 and 9620 lines; List 4A (note 20(r)/(s)) '
    'covers 84 lines; List 4B (note 20(u)) is suspended; the exclusions in force (notes 20(vvv), 20(www)) name no Chapter 96 product, and '
    'the older exclusions printed for mop heads, goat-hair lens brushes, liquid-chalk markers, spark lighters and steel tripods have '
    'expired; note 31 names none. Section 232: no Chapter 96 line is on the note 16 metal lists; 9603.90.80.50 is still on the note 19(k) '
    'aluminum derivative list for the Russian 200% (9903.85.68). Note 30(b) sets 35% for Russian 9603.10.90 in place of column 2. The '
    'temporary duty suspensions of subchapter II for hair slides, eyelash curlers, coffee servers and camera tripods (9902.17.95–9902.18.03) '
    'expired December 31, 2020. A Federal Register search of Commerce (ITA) notices found one antidumping order in force on a Chapter 96 '
    'product: cased pencils from China.'
)
add_sources(ia, ['procl-10895', 'procl-11021', 'fr-2026-18496', 'fr-2023-05169'])
