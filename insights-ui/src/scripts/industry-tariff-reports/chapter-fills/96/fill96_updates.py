# Tariff updates page (exec'd from fill96.py).
tu = d['tariffUpdates']

tu['seo'] = {
    'title': 'HTS Chapter 96 Tariff Updates 2026: Pens, Pencils, Brushes, Zippers, Lighters & Diapers Duties Since January 2025 | KoalaGains',
    'shortDescription': 'What changed for HTS Chapter 96 — pens, pencils, brushes, buttons, zippers, lighters, vacuum flasks, diapers — '
    'since January 2025: the end of the IEEPA and Section 122 duties, the 2026 Section 301 tariffs (Vietnam +12.5%, EU 10% in total), '
    'China List 3 and List 4A, the cased-pencil antidumping order, with Federal Register citations.',
    'keywords': [
        'hts chapter 96 tariff updates',
        'hts chapter 96 import duty rates',
        'china tariff on miscellaneous manufactured articles',
        'section 301 duties chapter 96',
        'zipper components import duties',
        'button blanks tariff updates',
        'anti dumping on pencils from china',
        'usmca chapter 96 exemptions',
    ],
}

tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current '
    '**2026 Revision 21** (in force October 9, 2026). **No Chapter 96 base rate changed**: all 157 lines carry the same General, Special '
    'and Column 2 rates, from Free to 32%.\n\n'
    'Everything that changed sits on top of the base rate. In 2025 the IEEPA duties reached these goods from every country — 19%–20% for '
    'Vietnam, Thailand, Malaysia, Cambodia and Indonesia, 15% in total for EU and Japanese goods from August 2025, 50% for India from '
    'August 27, and up to 145% for China in April–May 2025 on top of its List 3 and List 4A duties. The IEEPA duties **ended on February '
    '24, 2026**, and the 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026** goods from 60 '
    'economies pay a **Section 301 tariff**: +10% for India, Malaysia, Cambodia, Indonesia and the UK, +12.5% for Vietnam, Thailand and the '
    'Dominican Republic, 10% in total for the EU and Taiwan, 12.5% in total for Japan and Korea. China pays +12.5% plus its 2018–2019 '
    'list duty (+25% on buttons, zippers and tripods, +7.5% on most other lines). One aluminum-brush line lost its Section 232 duty on '
    'April 6, 2026, and the **antidumping order on cased pencils from China** (since 1994) stays at a China-wide 114.90%.'
)
tu['scope'] = (
    'Measures that reach Chapter 96 from any country: the 2026 Section 301 tariffs on 60 economies and their exemption for worked shell, '
    'the Brazil Section 301 tariff, the China Section 301 List 3 and List 4A duties, the Section 232 aluminum duty that reached one brush '
    'line until April 2026 (and still reaches it for Russia), Russia\'s rates in lieu of column 2, and the 2025–2026 IEEPA and Section 122 '
    'duties that have ended. The Canada Section 338 duties name no Chapter 96 product. One antidumping order is in force — cased pencils '
    'from China (9609.10.00); the 1986 order on natural-bristle paint brushes from China was revoked in 2010. Preference programs (GSP, '
    'AGOA) are listed for reference. For the rate each supplier pays, see Rates by country.'
)
tu['stats'] = [
    {'label': 'Base rates unchanged', 'value': '157 of 157 lines'},
    {'label': 'Extra duties in effect', 'value': str(len(tu['inEffect']))},
    {'label': 'Compared', 'value': '2025 Basic → Rev 21'},
    {'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'},
    {'label': 'Antidumping orders', 'value': '1', 'note': 'Cased pencils from China, 114.90%'},
]

NO52B = 'No Chapter 96 line is on the general exemption list (note 52(b)) except worked shell (9601.90.20).'
NO52J = 'No country exception list in note 52(j) names a Chapter 96 line.'
EXEMPTION = {
    'cn-section-301': (
        'Two Section 301 duties stack. +12.5% under the 2026 action (9903.05.31) on every line except worked shell (9601.90.20, note '
        '52(b)). Plus the 2018–2019 list duties, which USTR continued on October 7, 2026: List 3, +25% (9903.88.03), on 33 lines — every '
        'button and snap-fastener line (9606), every zipper line (9607) and every tripod and support line (9620); List 4A, +7.5% '
        '(9903.88.15), on 84 lines — most brooms, toothbrushes and cheap artists\' brushes, pens, markers, pencils and crayons, disposable '
        'and table lighters, scent sprayers, mannequins, large vacuum flasks, paper and plastic diapers and pads, capsules and carvings. '
        'The other 40 lines (hairbrushes, makeup brushes over 10¢, paint brushes and rollers, combs and hair clips, refillable lighters, '
        'vacuum flasks up to 2 liters, some textile diapers) were on List 4B, which was suspended and never collected. No exclusion in force '
        '(notes 20(vvv) and 20(www)) covers a Chapter 96 product, and the 2024 increases (note 31) name none. Where a pen set (9608.50) or '
        'a 9620.00.15/.30 accessory takes its rate from another subheading that itself carries a China list duty, its own list duty is not '
        'charged (9903.88.21–9903.88.28, notes 20(z)–(gg)). The IEEPA duties on China (fentanyl 10%–20%, reciprocal up to 125%) ended '
        'February 24, 2026.'
    ),
    'ca-section-301': (
        'USMCA-qualifying goods pay no Section 301 duty (9903.05.93), and every dutiable Chapter 96 line is Free under USMCA (S); '
        'non-qualifying goods pay base rate + 10% (9903.05.29). ' + NO52B + ' No Chapter 96 subheading is on any Canada Section 338 list '
        '(note 51(b)(1)–(3), 9903.03.12–9903.03.14), so no 50% duty applies. The 35% IEEPA duty on non-USMCA Canadian goods ended February 24, '
        '2026.'
    ),
    'mx-section-301': (
        'USMCA-qualifying goods pay no Section 301 duty (9903.05.94), and every dutiable Chapter 96 line is Free under USMCA (S); '
        'non-qualifying goods pay base rate + 10% (9903.05.55). ' + NO52B + ' The 25% IEEPA duty on non-USMCA Mexican goods ended February 24, '
        '2026.'
    ),
    'jp-section-301': (
        '12.5% in total in place of the base rate when the base rate is lower (9903.05.49); lines above 12.5% — textile diapers at 14.9% or '
        '16%, brooms over their annual quantity, whiskbrooms over 96¢ — pay only the base rate. The 12.5% applies even when the U.S.–Japan '
        'Trade Agreement rate (JP) is claimed (note 52(a)). ' + NO52B + ' The 15% IEEPA rate for Japan ended February 24, 2026.'
    ),
    'vn-section-301': 'Base rate + 12.5% (9903.05.84). ' + NO52B + ' ' + NO52J + ' The 20% IEEPA reciprocal duty (from August 7, 2025) '
    'ended February 24, 2026.',
    'eu-section-301': (
        '10% in total in place of the base rate when the base rate is under 10% (9903.05.39); nothing is added to lines already at 10% or '
        'more — coil and plastic zippers (13%), zipper parts (11.5%), brooms over their quantity (32¢ each or 32%), whiskbrooms over 96¢ '
        '(14%), textile diapers (10.8%–16%), metal hair slides (11%). ' + NO52B + ' The EU exception list (note 52(j)) names no Chapter 96 '
        'line. The 15% in-total IEEPA rate (from August 7, 2025) ended February 24, 2026.'
    ),
    'in-section-301': 'Base rate + 10% (9903.05.44). ' + NO52B + ' ' + NO52J + ' The IEEPA duties on India (25% reciprocal plus 25% '
    'from August 27, 2025) ended in February 2026.',
    'th-section-301': 'Base rate + 12.5% (9903.05.77). ' + NO52B + ' ' + NO52J + ' The 19% IEEPA reciprocal duty ended February 24, 2026.',
    'do-section-301': (
        'Base rate + 12.5% (9903.05.34), even when CAFTA-DR (P) is claimed. Note 52(i) (9903.05.95) exempts CAFTA-DR textile and apparel '
        'goods, but no Chapter 96 line is among the textile provisions the calculator applies it to; whether a textile diaper of 9619 '
        'qualifies would be a question for CBP. ' + NO52B + ' The 10% IEEPA reciprocal duty ended February 24, 2026.'
    ),
    'kr-section-301': (
        '12.5% in total in place of the base rate when the base rate is lower (9903.05.71). The Korea FTA (KR) makes every dutiable '
        'Chapter 96 line Free, but the 12.5% still applies (note 52(a)). ' + NO52B + ' The 15% IEEPA rate ended February 24, 2026.'
    ),
    'tw-section-301': (
        '10% in total in place of the base rate when the base rate is lower (9903.05.76); lines at 10% or more pay only the base rate. '
        + NO52B + ' The IEEPA reciprocal duty on Taiwan ended February 24, 2026.'
    ),
    'br-section-301': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01), on every Chapter 96 line — the Brazil exemption list (note 50(a)(ii)) '
        'names none — and +12.5% under the 2026 action from July 24, 2026 (9903.05.27), except worked shell (note 52(b)). The IEEPA duties on '
        'Brazil (10% reciprocal plus 40% under Executive Order 14323) ended February 24, 2026.'
    ),
    'gb-section-301': 'Base rate + 10% (9903.05.81). ' + NO52B + ' The UK exception list (note 52(j), 9903.05.96) names no Chapter 96 line. '
    'The 10% IEEPA rate ended February 24, 2026.',
    'my-section-301': 'Base rate + 10% (9903.05.54). ' + NO52B + ' ' + NO52J + ' The 19% IEEPA reciprocal duty ended February 24, 2026.',
    'kh-section-301': 'Base rate + 10% (9903.05.28). ' + NO52B + ' ' + NO52J + ' The 19% IEEPA reciprocal duty ended February 24, 2026.',
    'id-section-301': 'Base rate + 10% (9903.05.45). ' + NO52B + ' ' + NO52J + ' The 19% IEEPA reciprocal duty ended February 24, 2026.',
    'ru-section-301': (
        'Russia pays column 2 rates (general note 3(b)) — 20% to 110% on most Chapter 96 lines — plus +12.5% (9903.05.66). Twig brooms '
        '(9603.10.90) pay 35% in place of column 2 under 9903.90.08 (note 30). Aluminum brushes and mops of 9603.90.80.50 that are products '
        'of Russia, or contain aluminum smelted or cast there, pay +200% (9903.85.68, note 19(k)).'
    ),
}
WHAT = {
    'cn-section-301': 'A Chinese coil zipper pays 50.5% (13% + 37.5%), an aluminum tripod 40%, polyester buttons the line rate + 42.1%; a '
    'ballpoint pen 0.8¢ each + 25.4%, a disposable lighter 24%, paper diapers or pads 20%; a vacuum tumbler 19.7% and a plastic comb '
    '14.4¢/gross + 14.5% (no list duty).',
    'ca-section-301': 'Canadian diapers and sanitary pads ($888M in 2025) are Free-rated anyway; with a USMCA claim every Chapter 96 good '
    'from Canada pays nothing, without one 10% plus the base rate.',
    'mx-section-301': 'Mexican diapers, pens, brushes and carvings enter Free with a USMCA claim; without one they pay 10% plus the base '
    'rate — 0.8¢ each + 15.4% for a ballpoint pen.',
    'jp-section-301': 'Japanese pens, markers and mechanical pencils ($209M in 2025) pay 12.5% of their value.',
    'vn-section-301': 'Vietnamese brushes pay 12.5%–20.5%, vacuum flasks 19.4%–19.7%, ballpoint pens 0.8¢ each + 17.9%.',
    'eu-section-301': 'German, Italian and Spanish brushes, French and Spanish lighters and Czech or Spanish diapers pay 10% of value.',
    'in-section-301': 'Indian empty capsules and carvings pay 11.8%–13%, pencils 14¢/gross + 14.3%.',
    'th-section-301': 'Thai vacuum flasks pay 19.4%–19.7%, brushes 12.5%–20.5%.',
    'do-section-301': 'Dominican brushes and brooms ($98.8M in 2025) enter Free under CAFTA-DR but pay the 12.5%.',
    'kr-section-301': 'Korean brushes, pens and diapers pay 12.5% of value.',
    'tw-section-301': 'Taiwanese zippers pay 10%–13% (their own rate where it is above 10%); pens, brushes and flasks 10%.',
    'br-section-301': 'Brazilian pencils and crayons ($63.1M in 2025) pay 14¢/gross + 41.8%; most other goods 37.5% plus the base rate.',
    'gb-section-301': 'British brushes pay 10%–18% plus any specific rate, pens 0.8¢ each + 15.4%.',
    'my-section-301': 'Malaysian vacuum flasks pay 16.9%–17.2%, pens 0.8¢ each + 15.4%.',
    'kh-section-301': 'Cambodian brushes pay 10%–18% plus any specific rate.',
    'id-section-301': 'Indonesian zippers pay 20%–23%, pencils 14¢/gross + 14.3%.',
    'ru-section-301': 'Russian Chapter 96 goods are effectively priced out.',
    'other-section-301': 'A supplier outside the 60 economies pays only the base rate; inside them, 10% or 12.5% more.',
}
EXEMPTION['other-section-301'] = (
    'Base rate + 10% or + 12.5% (9903.05.20–9903.05.83), or 10% or 12.5% in total for some partners, by country. ' + NO52B + ' ' + NO52J
    + ' The IEEPA reciprocal duties on these countries ended February 24, 2026. Countries outside the 60 economies pay only the base rate.'
)
for e in tu['inEffect']:
    e['exemption'] = EXEMPTION[e['id']]
    e['whatItMeans'] = WHAT[e['id']]
    if e['id'] == 'cn-section-301':
        e['measure'] = 'Section 301 tariffs: 2026 action plus List 3 / List 4A'
        e['before'] = '+25% (List 3) or +7.5% (List 4A)'
        e['now'] = '+37.5% (List 3 lines) or +20% (List 4A lines) or +12.5%'
    if e['id'] == 'ru-section-301':
        e['measure'] = 'Section 301 tariff + Section 232 aluminum (1 line) + rate in lieu of column 2 (1 line)'
        e['now'] = '+12.5% (+200% on 9603.90.80.50; 35% in place of column 2 on 9603.10.90)'

GEN = {c['id']: c for c in tu['changes']}
H = ['hts-chapter-99', 'hts-now']


def ch(id_, type_, date, label, title, detail, before, now, countries, sids):
    return {
        'id': id_,
        'type': type_,
        'date': date,
        'dateLabel': label,
        'title': title,
        'detail': detail,
        'before': before,
        'now': now,
        'countries': countries,
        'sourceIds': sids,
    }


base = GEN['base-rates']
base['detail'] = (
    'All 157 Chapter 96 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition, and no '
    'line was added, split or renumbered.'
)
s301 = GEN['section-301-2026-60-economies-2026-07-24']
s301['title'] = 'Section 301 tariffs on 60 economies cover all of Chapter 96 but worked shell'
s301['detail'] = (
    '10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). Worked shell (9601.90.20) is on the general exemption list '
    '(note 52(b)); no other Chapter 96 line is, and no country exception list in note 52(j) names one. EU and Taiwan goods pay 10% in total '
    'and Japanese and Korean goods 12.5% in total (nothing extra on lines already that high). India, Malaysia, Cambodia, Indonesia and the '
    'UK +10%; China, Vietnam, Thailand and the Dominican Republic +12.5%. USMCA-qualifying goods from Canada and Mexico are exempt '
    '(9903.05.93, 9903.05.94).'
)
s301['sourceIds'] = ['fr-2026-15181', 'fr-2026-15274', 'csms-69326983'] + H
br = GEN['section-301-brazil-2026-07-22']
br['title'] = 'Section 301 tariff on products of Brazil'
br['detail'] = (
    '25% on all goods of Brazil (9903.05.01). No Chapter 96 line is on the Brazil exemption list (note 50(a)(ii)). From July 24 the 12.5% '
    'forced-labor tariff (9903.05.27) is added on top: Brazilian pencils and crayons pay 14¢/gross + 41.8%.'
)
br['sourceIds'] = ['fr-2026-14542', 'csms-69302472'] + H
nic = GEN['section-301-nicaragua-scheduled-2027-01-01']
nic['title'] = 'Scheduled: Section 301 tariff on products of Nicaragua'
nic['detail'] = (
    'Products of Nicaragua that are not entered under CAFTA-DR will pay +10% (9903.89.01) from January 1, 2027 and +15% from January 1, '
    '2028. Today Nicaragua pays the 12.5% 2026 Section 301 duty (9903.05.58).'
)
ru = GEN['section-232-aluminum-russia-2025-03-12']
ru['title'] = 'Section 232 aluminum duty reaches aluminum brushes and mops (9603.90.80.50)'
ru['detail'] = (
    'Proclamation 10895 put 9603.90.80.50 (other brushes, brooms and mops — those with aluminum parts) on the derivative aluminum list of '
    'U.S. note 19(k): +25% on the aluminum content for every country from March 12, 2025 (9903.85.08), and +200% for products of Russia or '
    'with Russian-smelted or cast aluminum (9903.85.68). The general duty rose to 50% on June 4, 2025 and ended for this line on April 6, '
    '2026; the Russian 200% continues.'
)
ru['before'] = None
ru['now'] = '+25% on aluminum content (+200% Russia)'
ru['countries'] = 'All (Russia +200%)'
ru['sourceIds'] = ['procl-10895', 'procl-10522'] + H

CHANGES = [
    base,
    ch('cn-301-continue', 'reference', '2026-10-07', 'Published', 'China Section 301 List 3 and List 4A continue after the four-year review',
       'USTR announced that the 2018 China Section 301 actions did not terminate on their 2026 anniversaries because domestic industries '
       'asked for them to continue. For Chapter 96 this keeps +25% (List 3) on buttons, zippers and tripods and +7.5% (List 4A) on most pens, '
       'pencils, brooms, toothbrushes, lighters and diapers.', '+25% / +7.5%', '+25% / +7.5%', 'China', ['fr-2026-20510']),
    ch('ca-338-scope', 'reference', '2026-09-15', 'Effective', 'Canada Section 338 lists revised; still no Chapter 96 product',
       'Proclamations 11064 and 11065 added and removed provisions on the 9903.03.12 and 9903.03.14 lists. None of the added or removed '
       'provisions is in Chapter 96.', None, None, 'Canada', ['procl-11064', 'procl-11065', 'csms-69851916']),
    ch('pencils-ar-2026', 'reference', '2026-09-10', 'Published', 'Cased pencils from China: preliminary review keeps the 114.90% rate',
       'In the 2024–2025 administrative review of the antidumping order on cased pencils from China (9609.10.00), Commerce preliminarily '
       'found that the four reviewed exporters — Shanghai Yover, Yiwu Huijie, Zhejiang Pengsheng and Zhejiang Sinopencil — are part of the '
       'China-wide entity, whose 114.90% rate is not under review. Cash deposits stay at 114.90% until the final results.',
       '114.90%', '114.90%', 'China', ['fr-2026-18496']),
    ch('ca-338', 'reference', '2026-08-22', 'Effective', 'Canada Section 338 duties take effect — no Chapter 96 product listed',
       'The 50% duties on listed products of Canada (alcoholic beverages 9903.03.12, dairy 9903.03.13, motor-vehicle list 9903.03.14) apply '
       'even to USMCA goods, but none of the three lists names a Chapter 96 subheading, so Canadian diapers, brushes and pens pay no Section 338 '
       'duty.', None, None, 'Canada', ['procl-11046', 'procl-11047', 'procl-11048', 'procl-11056', 'csms-69606660']),
    s301,
    ch('s122-end', 'extraDuty', '2026-07-23', 'Expired', 'Section 122 import surcharge expired',
       'The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.', '+10%', None, 'All', ['procl-11012', 'hts-now']),
    br,
    ch('usmca-review', 'reference', '2026-07-01', 'Published', 'USMCA joint review: not renewed, still in force',
       'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution '
       'of the issues or until termination, so USMCA claims (SPI S) still remove the base rate and the Section 301 duty on Canadian and '
       'Mexican Chapter 96 goods.', None, None, 'Canada, Mexico', ['ustr-usmca-review']),
    ch('s232-metals-2026', 'extraDuty', '2026-04-06', 'Effective', 'Section 232 rebuilt: aluminum brushes and mops drop off the list',
       'Proclamation 11021 replaced the note 19 aluminum headings with the 9903.82 program and new product lists in U.S. note 16. '
       '9603.90.80.50 is not on the new lists, so from April 6, 2026 it pays no Section 232 duty — except Russian goods, which still pay 200% '
       '(9903.85.68).', '+50% on aluminum content', 'None (Russia +200%)', 'All except Russia', ['procl-11021', 'csms-68253075'] + H),
    ch('s122-start', 'extraDuty', '2026-02-24', 'Effective', 'Section 122 surcharge replaces the IEEPA tariffs',
       '10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 96 product was on the exemption list (9903.03.03) '
       'other than civil-aircraft tripods (9903.03.05). USMCA-qualifying goods from Canada and Mexico were exempt.', None,
       '+10% (until July 23, 2026)', 'All', ['procl-11012', 'csms-67844987', 'hts-now']),
    ch('ieepa-end', 'extraDuty', '2026-02-24', 'Effective', 'All IEEPA tariffs end',
       'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, '
       'Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting them for goods entered from '
       '12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.',
       'Varied by country', None, 'All', ['scotus-24-1287', 'eo-14389', 'csms-67834313']),
    ch('india-oil-end', 'extraDuty', '2026-02-07', 'Effective', "India's extra 25% IEEPA duty removed",
       'Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) from February 7, 2026. The 25% reciprocal rate '
       'on India ended with the other IEEPA duties on February 24.', '+50%', '+25% (until February 24, 2026)', 'India', ['eo-14384']),
    ch('agoa-renewed', 'reference', '2026-02-03', 'Signed', 'AGOA reauthorized through December 31, 2026',
       'The Consolidated Appropriations Act, 2026 renewed AGOA retroactively from September 30, 2025. AGOA (SPI D) makes most dutiable '
       'Chapter 96 lines Free for eligible sub-Saharan countries, but not the textile diaper and pad lines (9619.00.21–9619.00.79) or '
       'printer ribbons (9612.10.90). GSP (SPI A, A*, A+) remains expired since December 31, 2020.',
       'Lapsed (from September 30, 2025)', 'In force to December 31, 2026', 'AGOA beneficiary countries',
       ['ustr-agoa-2026', 'crs-agoa', 'procl-11030', 'cbp-gsp', 'hts-now']),
    ch('cn-ieepa-cut', 'extraDuty', '2025-11-10', 'Effective', 'China fentanyl duty cut to 10%',
       'The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It ended with the other IEEPA duties on '
       'February 24, 2026.', '+20%', '+10% (ended)', 'China', ['eo-14357']),
    ch('india-oil', 'extraDuty', '2025-08-27', 'Effective', 'Extra 25% on products of India',
       'Executive Order 14329 added 25% on Indian goods (9903.01.84), on top of the 25% reciprocal rate in force since August 7, 2025: 50% in '
       'all on Indian capsules, carvings and pencils, on top of the base rate. Ended February 7, 2026.', '+25%', '+50% (ended)', 'India',
       ['eo-14329', 'eo-14326']),
    ch('country-rates', 'extraDuty', '2025-08-07', 'Effective', 'Country reciprocal rates replace the 10% baseline',
       'Executive Order 14326 set country rates for goods entered from August 7, 2025: Cambodia, Indonesia, Malaysia and Thailand +19%, '
       'Vietnam +20%, India +25%, the UK +10%. EU goods with a column 1 rate under 15% paid 15% in total (9903.02.20); Japan (Executive Order '
       '14345) and Korea got the same 15% in-total treatment later in 2025. Brazilian goods also paid 40% under Executive Order 14323. Ended '
       'February 24, 2026.', '+10%', '+10% to +50% (ended)', 'Listed countries, European Union',
       ['eo-14326', 'eo-14345', 'fr-2025-21940', 'eo-14323', 'hts-now']),
    ch('ca-amended', 'extraDuty', '2025-07-31', 'Signed', 'Canada additional duty raised to 35%',
       'Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10) from August 1, 2025. Ended February 24, 2026.', '+25%',
       '+35% (ended)', 'Canada', ['eo-14325']),
    ch('s232-50', 'extraDuty', '2025-06-04', 'Effective', 'Section 232 aluminum duty doubled to 50%',
       'Proclamation 10947 raised the Section 232 aluminum duty from 25% to 50% (UK 25%), including on the aluminum content of '
       '9603.90.80.50 brushes and mops. Ended for this line on April 6, 2026.', '+25%', '+50% (ended)', 'All except the UK',
       ['procl-10947']),
    ch('cn-reciprocal-10', 'extraDuty', '2025-05-14', 'Effective', 'China reciprocal duty cut from 125% to 10%',
       'Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. A Chinese coil zipper then '
       'paid 13% + 25% (List 3) + 20% + 10% = 68% until November 9, 2025. Ended February 24, 2026.', '+125%', '+10% (ended)', 'China',
       ['eo-14298']),
    ch('cn-125', 'extraDuty', '2025-04-10', 'Effective', 'China reciprocal duty raised to 125%',
       'Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% from April 10, 2025, and paused the higher country rates '
       'announced on April 2 for other countries (Vietnam 46%), which never took effect. With the 20% fentanyl duty and the 25% List 3 duty, a '
       'Chinese coil zipper paid 183% until May 13, 2025.', None, '+125% (ended)', 'China', ['eo-14266']),
    ch('reciprocal', 'extraDuty', '2025-04-02', 'Signed', 'Reciprocal tariff on products of all countries',
       '10% baseline (9903.01.25) from April 5, 2025, and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 96 product was '
       'on the exemption list (Annex II). Ended February 24, 2026.', None, '+10% or more (ended)', 'All except Canada, Mexico',
       ['eo-14257']),
    ru,
    ch('cn-ieepa', 'extraDuty', '2025-03-04', 'Effective', 'China fentanyl duty raised to 20%',
       'The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) to +20%, on top '
       'of the List 3 and List 4A duties. Ended February 24, 2026.', '+10%', '+20% (ended)', 'China', ['eo-14195', 'eo-14228']),
    ch('mx-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Mexico',
       '+25% on non-USMCA goods (9903.01.01) from March 4, 2025; USMCA-qualifying goods exempt from March 7, 2025. Ended February 24, 2026.',
       None, '+25% (ended)', 'Mexico', ['eo-14194', 'eo-14232']),
    ch('ca-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Canada',
       '+25% on non-USMCA goods (9903.01.10) from March 4, 2025, later raised to +35%; USMCA-qualifying goods exempt from March 7, 2025. '
       'Ended February 24, 2026.', None, '+25% (ended)', 'Canada', ['eo-14193', 'eo-14231']),
    nic,
    ch('cn-301-review-2024', 'reference', '2024-09-27', 'Effective', 'China four-year review: no Chapter 96 increase',
       'USTR raised Section 301 rates on Chinese steel and aluminum products, EVs, batteries, semiconductors, medical products and others '
       '(U.S. note 31, 9903.91.01–9903.91.11). No Chapter 96 line is on those lists, so buttons, zippers and tripods stay at +25% and the '
       'List 4A lines at +7.5%.', None, None, 'China', ['fr-2024-21217']),
    ch('pencils-continued-2023', 'reference', '2023-03-14', 'Published', 'Antidumping order on cased pencils from China continued',
       'After the fifth five-year (sunset) review, Commerce and the ITC found that revoking the 1994 order would likely lead to continued '
       'dumping and injury, so the order on cased pencils from China (9609.10.00; mechanical pencils, crayons, pastels, charcoal and chalk '
       'excluded) stays in force. The next sunset review is due by 2028.', None, 'Order in force', 'China', ['fr-2023-05169', 'fr-2023-25290']),
    ch('cn-list4a-cut', 'extraDuty', '2020-02-14', 'Effective', 'China List 4A duty cut to 7.5%',
       'Under the Phase One agreement USTR halved the List 4A duty (9903.88.15) from 15% to 7.5%, the rate still charged on 84 Chapter 96 '
       'lines.', '+15%', '+7.5%', 'China', ['fr-2020-00904']),
    ch('cn-list4a', 'extraDuty', '2019-09-01', 'Effective', 'China List 4A reaches pens, pencils, brooms, lighters and diapers',
       'The fourth China Section 301 list put +15% on Chinese pens, markers, pencils, crayons, brooms, toothbrushes, lighters, mannequins, '
       'large vacuum flasks, diapers and pads, capsules and carvings. List 4B (hairbrushes, paint brushes, combs, hair clips, small vacuum '
       'flasks and others) was suspended and never took effect.', None, '+15%', 'China', ['fr-2019-17865']),
    ch('cn-list3-25', 'extraDuty', '2019-05-10', 'Effective', 'China List 3 duty raised to 25%',
       'USTR raised the List 3 duty (9903.88.03) from 10% to 25%. In Chapter 96 List 3 covers every button and snap-fastener line (9606), '
       'every zipper line (9607) and every tripod and support line (9620).', '+10%', '+25%', 'China', ['fr-2019-09681']),
    ch('cn-list3', 'extraDuty', '2018-09-24', 'Effective', 'China Section 301 List 3 reaches buttons, zippers and tripods',
       'The third China Section 301 list put +10% on Chinese buttons, snap fasteners, button blanks, zippers and zipper parts, and tripods '
       'and similar supports.', None, '+10%', 'China', ['fr-2018-20610']),
    ch('paint-brushes-revoked', 'reference', '2010-07-30', 'Published', 'Antidumping order on paint brushes from China revoked',
       'Commerce revoked the 1986 antidumping order on natural-bristle paint brushes and brush heads from China because the domestic '
       'industry no longer wanted it. Since then the only antidumping order on a Chapter 96 product is the one on cased pencils.',
       'Order in force', 'Revoked', 'China', ['fr-2010-18787']),
]
CHANGES.sort(key=lambda c: c['date'], reverse=True)
tu['changes'] = CHANGES

needed = []
for c in CHANGES:
    needed += c['sourceIds']
for e in tu['inEffect']:
    needed += e['sourceIds']
add_sources(tu, [s for s in dict.fromkeys(needed)])
