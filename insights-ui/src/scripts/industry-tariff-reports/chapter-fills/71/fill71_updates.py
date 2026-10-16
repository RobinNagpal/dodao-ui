# Tariff updates page (exec'd from fill71.py).
tu = d['tariffUpdates']
tu['h1'] = f'HTS Chapter 71: {SHORT} — Tariff Updates'

BULLION = (
    'silver bullion and doré (7106.91.10), every gold line of heading 7108, the platinum-group metals of 7110, precious-metal ash (7112.30) '
    'and platinum scrap (7112.92), minted precious-metal bars (7115.90.05), other gold articles (7115.90.30) and legal-tender coin (7118.90)'
)
GEMS_52J = 'natural pearls (7101.10), diamonds (7102.10, 7102.31, 7102.39) and gemstones (7103.10, 7103.91, 7103.99)'
EX_52B = (
    'The 21 subheadings on the general exemption list in note 52(b) (9903.05.86) — ' + BULLION + ' — pay no Section 301 duty.'
)

IN_EFFECT = {
    'Switzerland': (
        'Swiss goods pay 12.5% in total where the base rate is below 12.5% (9903.05.74). ' + EX_52B + ' Switzerland\'s exception list in note '
        '52(j)(3) (9903.05.98) also frees ' + GEMS_52J + '. The 39% IEEPA rate of August 7, 2025 (15% in total from November 14, 2025) ended '
        'February 24, 2026.',
        'Swiss gold bars (7108.13.55) and platinum enter Free; Swiss cast silver bars (7106.92.10) and gold jewelry pay 12.5% in total; '
        'Swiss-cut diamonds and gemstones are Free.',
    ),
    'Canada': (
        'Non-USMCA goods pay +10% (9903.05.29); USMCA-qualifying goods are exempt (9903.05.93). ' + EX_52B + ' Separately, seven Chapter 71 '
        'subheadings are on the Section 338 motor-vehicle list in note 51(b)(3) (9903.03.14) and pay 50% even under USMCA: polished diamonds '
        '(7102.39), cast silver bars (7106.92.10), silver jewelry (7113.11.50), gold necklaces (7113.19.29), other precious-metal jewelry '
        '(7113.19.50), base-metal costume jewelry (7117.19.90) and coin that is not legal tender (7118.10). The IEEPA duty (25%, then 35% on '
        'non-USMCA goods) ended February 24, 2026.',
        'Canadian gold bullion, gold bars, Maple Leaf coins and platinum enter Free. A Canadian polished diamond, silver bar or gold ring pays '
        '50% under USMCA; without a USMCA claim the diamond and the silver bar pay 60%, the gold ring 65.5%.',
    ),
    'Mexico': (
        'Non-USMCA goods pay +10% (9903.05.55); USMCA-qualifying goods are exempt (9903.05.94). ' + EX_52B + ' The 25% IEEPA duty on non-USMCA '
        'goods ended February 24, 2026.',
        'Mexican silver and gold bullion and doré enter Free whatever the claim; USMCA-qualifying silver jewelry and costume jewelry pay nothing, '
        'non-qualifying silver jewelry 15% (5% + 10%).',
    ),
    'India': (
        'Base rate + 10% (9903.05.44). ' + EX_52B + ' India has no exception list in note 52(j), so its diamonds, gemstones and lab-grown '
        'diamonds pay the duty. The IEEPA duties (25% from August 7, 2025, 50% from August 27, 2025 to February 6, 2026) ended February 24, '
        '2026.',
        'Indian polished and lab-grown diamonds pay 10%, gold jewelry 15.5% (5.5% + 10%), silver jewelry 15%.',
    ),
    'Israel': (
        'Base rate + 12.5% (9903.05.47). ' + EX_52B + ' Israel has no exception list, and under U.S. note 52(a) the duty applies even when the '
        'U.S.–Israel FTA rate (IL) is claimed. The 15% IEEPA rate ended February 24, 2026.',
        'Israeli polished diamonds pay 12.5%; jewelry entered under the FTA pays 12.5% instead of 5%–7%.',
    ),
    'European Union': (
        'EU goods pay 10% in total where the base rate is below 10% (9903.05.39), so nothing is added to lines already at 10% or more. ' + EX_52B
        + ' The EU exception list in note 52(j)(2) (9903.05.97) also frees ' + GEMS_52J + '. The 15%-in-total IEEPA rate ended February 24, 2026.',
        'Belgian and other EU diamonds and gemstones enter Free; Italian gold jewelry (5.5%) pays 10% in total; EU cultured pearls and '
        'lab-grown diamonds pay 10%.',
    ),
    'South Africa': (
        'Base rate + 12.5% (9903.05.69). ' + EX_52B + ' Under U.S. note 52(a) the duty applies even when AGOA (D) is claimed. The 30% IEEPA '
        'rate ended February 24, 2026.',
        'South African platinum, palladium, rhodium and gold enter Free; diamonds pay 12.5%; AGOA jewelry pays 12.5%.',
    ),
    'United Arab Emirates': (
        'Base rate + 12.5% (9903.05.80). ' + EX_52B + ' The UAE has no exception list. The 10% IEEPA rate ended February 24, 2026.',
        'Gold bars and bullion from the UAE enter Free; Emirati gold jewelry pays 18% (5.5% + 12.5%), diamonds 12.5%.',
    ),
    'Thailand': (
        'Base rate + 12.5% (9903.05.77). ' + EX_52B + ' The 19% IEEPA rate ended February 24, 2026.',
        'Thai silver jewelry pays 17.5% (5% + 12.5%), gold jewelry 18%, cut gemstones 12.5%.',
    ),
    'Hong Kong': (
        'Base rate + 12.5% (9903.05.43). ' + EX_52B + ' Hong Kong goods are not on the China Section 301 lists. The IEEPA duties that applied '
        'to China and Hong Kong ended February 24, 2026.',
        'Hong Kong gold jewelry pays 18%, polished diamonds 12.5%, pearl strands 18% (5.5% + 12.5%).',
    ),
    'China': (
        'Two Section 301 actions stack. The 2026 action adds +12.5% (9903.05.31), except on the 21 bullion subheadings of note 52(b). The 2018–2019 '
        'China lists add +25% (List 3, 9903.88.03) on precious metals, bullion, bars, scrap and silverware (7102.21–.29, 7105–7112, 7114, 7115) '
        'or +7.5% (List 4A, 9903.88.15) on pearls, diamonds, gemstones, lab-grown stones, jewelry, costume jewelry and coin. Six lines on the '
        'suspended List 4B (7116.10.10, 7116.20.05, 7117.19.05, 7117.90.45, .60, .75) pay neither list duty. USTR kept the lists after its '
        '2026 review. The IEEPA duties ended February 24, 2026.',
        'Chinese gold bullion pays 25% (List 3 only), gold jewelry 25.5% (5.5% + 12.5% + 7.5%), costume jewelry 31%, lab-grown diamonds cut '
        'for jewelry 20%.',
    ),
    'United Kingdom': (
        'Base rate + 10% (9903.05.81). ' + EX_52B + ' The UK exception list in note 52(j)(1) names no Chapter 71 line. The 10% IEEPA rate ended '
        'February 24, 2026.',
        'UK gold bars and platinum enter Free; UK silver bars pay 10%, jewelry 15%–15.5%.',
    ),
    'Peru': (
        'Base rate + 12.5% (9903.05.63), even when the U.S.–Peru TPA rate (PE) is claimed. ' + EX_52B,
        'Peruvian gold bullion and doré enter Free; silver jewelry under the TPA pays 12.5%.',
    ),
    'Colombia': (
        'Base rate + 12.5% (9903.05.32), even when the U.S.–Colombia TPA rate (CO) is claimed. ' + EX_52B,
        'Colombian gold enters Free; emeralds and jewelry pay 12.5%.',
    ),
    'Australia': (
        'Base rate + 12.5% (9903.05.23), even when the U.S.–Australia FTA rate (AU) is claimed. ' + EX_52B,
        'Australian gold bars and coins enter Free; opals and other gemstones, pearls and jewelry pay 12.5%.',
    ),
    'Brazil': (
        'Two Section 301 actions: +25% on all goods of Brazil (9903.05.01) since July 22, 2026, and +12.5% (9903.05.27) since July 24. The '
        'Brazil exemption list in note 50(a)(ii) (9903.05.03) takes the 21 bullion subheadings and rough gemstones (7103.10.20, 7103.10.40) out '
        'of the 25%; note 52(b) takes the bullion subheadings out of the 12.5%.',
        'Brazilian gold enters Free; rough gemstones pay 12.5%; cut gemstones 37.5%; gold jewelry 43% (5.5% + 37.5%).',
    ),
    'Japan': (
        'Japanese goods pay 12.5% in total where the base rate is below 12.5% (9903.05.49). ' + EX_52B + ' Japan has no exception list, so '
        'cultured pearls pay the duty. The 15%-in-total IEEPA rate ended February 24, 2026.',
        'Japanese cultured pearls (Free base) pay 12.5%; pearl strands (5.5%) 12.5% in total; gold bars Free.',
    ),
    'Russia': (
        'Russia pays column 2 rates (Pub. L. 117-110) and, on 45 Chapter 71 lines, 35% in place of column 2 (9903.90.08, note 30(b)), plus '
        '+12.5% (9903.05.66) on lines outside note 52(b). But imports of Russian-origin gold, non-industrial diamonds, unsorted diamonds and '
        'diamond jewelry are banned by OFAC determinations under E.O. 14068, as are Russian-mined diamonds of 0.5 carat or more cut in another '
        'country.',
        'Most Russian Chapter 71 goods cannot be imported at all; Russian platinum-group metals and silver can, at column 2 or 35%.',
    ),
    'Kazakhstan': (
        'Base rate + 12.5% (9903.05.51). ' + EX_52B + ' Kazakhstan has no exception list. The 25% IEEPA rate ended February 24, 2026.',
        'Kazakh gold and silver bullion, minted bars and gold enter Free; cast silver bars (7106.92.10) pay 12.5%.',
    ),
    'Singapore': (
        'Base rate + 12.5% (9903.05.68), even when the U.S.–Singapore FTA rate (SG) is claimed. ' + EX_52B,
        'Singapore gold bars and bullion enter Free; jewelry pays 12.5% under the FTA.',
    ),
    'South Korea': (
        'Korean goods pay 12.5% in total where the base rate is below 12.5% (9903.05.71). ' + EX_52B + ' The 15%-in-total IEEPA rate ended '
        'February 24, 2026.',
        'Korean silver bullion and gold bars enter Free; cast silver bars and jewelry pay 12.5% in total.',
    ),
}

for e in tu['inEffect']:
    c = e['country']
    if c.startswith('Other Section 301 economies'):
        e['country'] = 'Other Section 301 economies'
        e['exemption'] = (
            'The other economies on the list pay +10% or +12.5%, or 12.5% in total for South Korea and 10% in total for Taiwan '
            '(9903.05.20–9903.05.84). ' + EX_52B + ' The exception lists in note 52(j) free ' + GEMS_52J + ' for Malaysia, Cambodia, '
            'Guatemala, El Salvador, Argentina, Bangladesh, Taiwan, Indonesia, Ecuador and Jordan.'
        )
        e['whatItMeans'] = (
            'Turkish and Vietnamese gold jewelry pays 18% (5.5% + 12.5%); Sri Lankan sapphires pay 10%, Indonesian ones nothing (note 52(j)). '
            'Countries outside the 60 — for example Botswana, Namibia and Mauritius — pay only the base rate.'
        )
        continue
    if c not in IN_EFFECT:
        raise SystemExit(f'no in-effect text for {c}')
    e['exemption'], e['whatItMeans'] = IN_EFFECT[c]

# Section 301 measure name, readable
for e in tu['inEffect']:
    e['measure'] = e['measure'].replace('Section 301 (2026, 60 economies)', 'Section 301 (2026, 60 economies)')
    if e['country'] == 'Russia':
        e['sourceIds'] = list(dict.fromkeys(e['sourceIds'][:-1] + ['pl-117-110', 'ofac-ru-gold', 'ofac-ru-diamonds', 'hts-now']))
    if e['country'] in ('Canada', 'Mexico', 'India', 'Switzerland', 'European Union', 'South Africa', 'Israel', 'Thailand', 'Japan',
                        'United Kingdom', 'United Arab Emirates', 'Hong Kong', 'China'):
        if 'eo-14389' not in e['sourceIds']:
            e['sourceIds'].insert(-1, 'eo-14389')

# ---- change log -------------------------------------------------------------------------------------
CHANGE_DETAIL = {
    'base-rates': (
        'No Chapter 71 base rate changed',
        'All 136 Chapter 71 lines that exist in both editions carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the '
        '2025 Basic Edition — from Free to 13.5%. Four statistical lines are new, at the same 5.5% rate: gold jewelry other than chains '
        '(7113.19.50.91) split from 7113.19.50.95 on July 1, 2025, and uniform-link gold necklaces (7113.19.29.10, .90) split out on July 1, 2026.',
    ),
}
for c in tu['changes']:
    if c['id'] == 'base-rates':
        c['title'], c['detail'] = CHANGE_DETAIL['base-rates']
        c['sourceIds'] = ['hts-before', 'hts-now', 'hts-now-cr', 'hts-2026-basic-cr', 'hts-2026-rev11-cr']
    elif c['id'].startswith('section-301-nicaragua'):
        c['title'] = 'Scheduled: Section 301 tariff on products of Nicaragua'
        c['date'] = '2025-12-29'
        c['dateLabel'] = 'Published'
        c['detail'] = (
            'Products of Nicaragua that pay the column 1-general rate (that is, not entered under CAFTA-DR) will pay +10% (9903.89.01) from '
            'January 1, 2027 and +15% from January 1, 2028, on every Chapter 71 line. Today Nicaragua pays the 12.5% 2026 Section 301 duty '
            '(9903.05.58), which spares the bullion subheadings of note 52(b).'
        )
    elif c['id'].startswith('section-338-canada'):
        c['title'] = 'Canada Section 338 duty reaches diamonds, silver bars, jewelry and coin'
        c['detail'] = (
            '50% on listed products of Canada after a 3-day suspension lapsed (9903.03.14, note 51(b)(3)). Seven Chapter 71 subheadings are on '
            'the list: polished diamonds (7102.39), cast silver bars of 99.5% (7106.92.10), silver jewelry (7113.11.50), gold necklaces '
            '(7113.19.29), other precious-metal jewelry (7113.19.50), base-metal costume jewelry (7117.19.90) and coin that is not legal tender '
            '(7118.10). It applies to USMCA-qualifying goods too (note 51(a)). Gold bullion and bars, Maple Leaf coins and platinum are not on '
            'the list.'
        )
    elif c['id'].startswith('section-301-2026-60-economies'):
        c['title'] = 'Section 301 tariffs on 60 economies — bullion exempt'
        c['detail'] = (
            '10% or 12.5% on products of 60 economies (9903.05.20–9903.05.84), on 104 of the 140 Chapter 71 lines. The general exemption list '
            '(note 52(b), 9903.05.86) takes out ' + BULLION + '. EU, Swiss, Malaysian, Cambodian, Guatemalan, Salvadoran, Argentine, '
            'Bangladeshi, Taiwanese, Indonesian, Ecuadorian and Jordanian ' + GEMS_52J + ' are exempt too (note 52(j)). India pays +10% on its '
            'diamonds and jewelry, Israel, the UAE, South Africa, Thailand and Hong Kong +12.5%; the EU 10% and Switzerland and Japan 12.5% in '
            'total. USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94).'
        )
    elif c['id'].startswith('section-301-brazil'):
        c['title'] = 'Section 301 tariff on products of Brazil'
        c['detail'] = (
            '25% on all goods of Brazil (9903.05.01), except the bullion subheadings and rough or roughly shaped gemstones (7103.10.20, '
            '7103.10.40) on the Brazil exemption list (note 50(a)(ii), 9903.05.03). From July 24 the 12.5% tariff (9903.05.27) is added on top.'
        )

EXTRA_CHANGES = [
    {
        'id': 'cn-301-continue', 'type': 'reference', 'date': '2026-10-07', 'dateLabel': 'Published',
        'title': 'China Section 301 lists continue after the four-year review',
        'detail': 'USTR announced that the 2018–2019 China Section 301 actions did not terminate on their 2026 anniversaries. For Chapter 71 '
        'this keeps +25% (List 3) on Chinese gold, silver, platinum, scrap and silverware, and +7.5% (List 4A) on Chinese pearls, diamonds, '
        'gemstones, jewelry, costume jewelry and coin.',
        'before': '+25% or +7.5%', 'now': '+25% or +7.5%', 'countries': 'China', 'sourceIds': ['fr-2026-20510'],
    },
    {
        'id': 'ru-gl104b', 'type': 'reference', 'date': '2026-08-26', 'dateLabel': 'Issued',
        'title': 'Russian-diamond carve-out extended to September 1, 2027',
        'detail': 'OFAC General License 104B (replacing 104A) keeps allowing imports of non-industrial diamonds of 1.0 carat or more that were '
        'outside Russia before March 1, 2024, and of 0.5 carat or more that were outside Russia before September 1, 2024 — even if they were '
        'mined in Russia — through September 1, 2027. Diamonds of Russian origin stay banned.',
        'before': 'Through September 1, 2026', 'now': 'Through September 1, 2027', 'countries': 'Russia',
        'sourceIds': ['ofac-gl104b', 'ofac-gl104a'],
    },
    {
        'id': 's122-end', 'type': 'extraDuty', 'date': '2026-07-23', 'dateLabel': 'Expired',
        'title': 'Section 122 import surcharge expired',
        'detail': 'The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.',
        'before': '+10%', 'now': 'None', 'countries': 'All', 'sourceIds': ['procl-11012', 'hts-now'],
    },
    {
        'id': 'usmca-review', 'type': 'reference', 'date': '2026-07-01', 'dateLabel': 'Announced',
        'title': 'USMCA joint review: not renewed, still in force',
        'detail': 'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending '
        'resolution of the issues or until termination, so USMCA claims (SPI S) still remove the base rate and the Section 301 duty on Mexican '
        'and Canadian jewelry — but not the Canada Section 338 duty.',
        'before': None, 'now': None, 'countries': 'Canada, Mexico', 'sourceIds': ['ustr-usmca-review'],
    },
    {
        'id': 'dm-ifr', 'type': 'reference', 'date': '2026-06-24', 'dateLabel': 'Effective',
        'title': 'CBP suspends de minimis indefinitely',
        'detail': 'Two interim final rules suspend the $800 de minimis exemption in CBP\'s regulations (19 CFR 10.151(b) for every mode except '
        'mail, 19 CFR 145.31(b) for mail) until CBP announces otherwise. Low-value parcels of jewelry and costume jewelry need a formal or '
        'informal entry and pay the base rate plus any extra duty.',
        'before': 'Free under de minimis up to $800', 'now': 'Entry required', 'countries': 'All', 'sourceIds': ['cbp-ifr-dm', 'cbp-ifr-mail'],
    },
    {
        'id': 'ieepa-refunds', 'type': 'reference', 'date': '2026-04-20', 'dateLabel': 'Deployed',
        'title': 'CBP opens CAPE for IEEPA duty refunds',
        'detail': 'Importers of record and their brokers can file a CAPE Declaration in ACE listing entries that paid IEEPA duties — for example '
        'the 2025 duties on Indian diamonds and jewelry or on Swiss gold bars — and ACE refunds the IEEPA duties with interest. The Section 301 '
        'and Section 338 duties are not refunded.',
        'before': None, 'now': None, 'countries': 'All', 'sourceIds': ['cbp-ieepa-refunds'],
    },
    {
        'id': 's122-start', 'type': 'extraDuty', 'date': '2026-02-24', 'dateLabel': 'Effective',
        'title': 'Section 122 surcharge replaces the IEEPA tariffs — bullion exempt',
        'detail': '10% on products of all countries (9903.03.01) until July 23, 2026. The product exemption list (9903.03.03) covered 20 of the 21 '
        'bullion subheadings that note 52(b) now exempts (all but precious-metal ash), so gold, platinum, silver bullion and legal-tender coin paid nothing; diamonds, '
        'gemstones and jewelry paid 10%. USMCA-qualifying goods from Canada and Mexico were exempt.',
        'before': 'None', 'now': '+10% (until July 23, 2026)', 'countries': 'All', 'sourceIds': ['procl-11012', 'csms-67844987', 'hts-now'],
    },
    {
        'id': 'ieepa-end', 'type': 'extraDuty', 'date': '2026-02-24', 'dateLabel': 'Effective',
        'title': 'All IEEPA tariffs end',
        'detail': 'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, '
        'Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP stopped collecting them for goods '
        'entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer '
        'in effect.',
        'before': 'Varied by country', 'now': 'None', 'countries': 'All', 'sourceIds': ['scotus-24-1287', 'eo-14389', 'csms-67834313'],
    },
    {
        'id': 'india-oil-end', 'type': 'extraDuty', 'date': '2026-02-07', 'dateLabel': 'Effective',
        'title': "India's extra 25% IEEPA duty removed",
        'detail': 'Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) from February 7, 2026. The 25% '
        'reciprocal rate on Indian diamonds and jewelry ended with the other IEEPA duties on February 24.',
        'before': '+50%', 'now': '+25% (until February 24, 2026)', 'countries': 'India', 'sourceIds': ['eo-14384'],
    },
    {
        'id': 'agoa-renewed', 'type': 'reference', 'date': '2026-02-03', 'dateLabel': 'Signed',
        'title': 'AGOA reauthorized through December 31, 2026',
        'detail': 'The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025. AGOA (SPI D) '
        'makes the dutiable Chapter 71 lines Free for eligible sub-Saharan countries such as South Africa, Botswana and Namibia — but the 2026 '
        'Section 301 duty still applies to South African goods. GSP (SPI A, A*, A+) remains expired since December 31, 2020.',
        'before': 'Lapsed (from September 30, 2025)', 'now': 'In force to December 31, 2026', 'countries': 'AGOA beneficiary countries',
        'sourceIds': ['ustr-agoa-2026', 'crs-agoa', 'procl-11030', 'cbp-gsp', 'hts-now'],
    },
    {
        'id': 'ch-framework', 'type': 'extraDuty', 'date': '2025-11-14', 'dateLabel': 'Effective',
        'title': 'Swiss rate cut to 15% in total; Swiss diamonds, gems and platinum exempt',
        'detail': 'Under the U.S.–Switzerland–Liechtenstein framework, Swiss goods paid 15% in total instead of the 39% reciprocal duty, and Swiss '
        'natural pearls, diamonds, gemstones, platinum-group metals, platinum scrap and coin were exempt (9903.02.84). Gold bars had been exempt '
        'since September 8. Ended February 24, 2026.',
        'before': '+39%', 'now': '15% in total (ended)', 'countries': 'Switzerland', 'sourceIds': ['fr-2025-23316'],
    },
    {
        'id': 'cn-ieepa-cut', 'type': 'extraDuty', 'date': '2025-11-10', 'dateLabel': 'Effective',
        'title': 'China fentanyl duty cut to 10%',
        'detail': 'The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It ended with the other IEEPA duties on '
        'February 24, 2026.',
        'before': '+20%', 'now': '+10% (ended)', 'countries': 'China', 'sourceIds': ['eo-14357'],
    },
    {
        'id': 'bullion-annex', 'type': 'extraDuty', 'date': '2025-09-08', 'dateLabel': 'Effective',
        'title': 'Gold bars and other gold forms exempted from the reciprocal tariff',
        'detail': 'Executive Order 14346 replaced Annex II of the reciprocal-tariff order. From September 8, 2025 the exemption (9903.01.32) '
        'covered every gold line of 7108 — including cast bars of 7108.13.55, which CBP had ruled in July were not exempt — plus minted bars '
        '(7115.90.05) and other gold articles (7115.90.30), on top of the silver and gold bullion and doré, platinum-group metals, platinum scrap '
        'and legal-tender coin exempt since April 5. Ended with the reciprocal tariff on February 24, 2026.',
        'before': 'Country rate (up to 39%)', 'now': 'Exempt (ended)', 'countries': 'All', 'sourceIds': ['eo-14346', 'hts-now'],
    },
    {
        'id': 'eu-framework', 'type': 'extraDuty', 'date': '2025-09-01', 'dateLabel': 'Effective',
        'title': 'EU diamonds, gemstones and platinum exempted',
        'detail': 'Under the U.S.–EU framework, EU natural pearls, diamonds (7102.10, .31, .39), gemstones (7103), platinum-group metals, '
        'platinum scrap and coin paid no reciprocal duty (9903.02.74), retroactive to September 1, 2025. Other EU goods kept paying 15% in '
        'total. Ended February 24, 2026.',
        'before': '15% in total', 'now': 'Exempt (ended)', 'countries': 'European Union', 'sourceIds': ['fr-2025-18660'],
    },
    {
        'id': 'dm-suspended', 'type': 'reference', 'date': '2025-08-29', 'dateLabel': 'Effective',
        'title': 'De minimis suspended for all countries',
        'detail': 'Executive Order 14324 ended duty-free de minimis treatment for shipments of any value, origin or mode, so online orders of '
        'jewelry and costume jewelry under $800 became dutiable. Executive Order 14388 continued the suspension after the IEEPA ruling.',
        'before': 'Free under de minimis up to $800', 'now': 'Entry required', 'countries': 'All',
        'sourceIds': ['eo-14324', 'cbp-dm-2025', 'eo-14388'],
    },
    {
        'id': 'india-oil', 'type': 'extraDuty', 'date': '2025-08-27', 'dateLabel': 'Effective',
        'title': 'Extra 25% on products of India',
        'detail': 'Executive Order 14329 added 25% on Indian goods (9903.01.84), on top of the 25% reciprocal rate in force since August 7, 2025: '
        '50% in all on Indian polished diamonds and lab-grown diamonds, and 55.5% on gold jewelry (5.5% + 50%). Ended February 7, 2026.',
        'before': '+25%', 'now': '+50% (ended)', 'countries': 'India', 'sourceIds': ['eo-14329', 'eo-14326'],
    },
    {
        'id': 'country-rates', 'type': 'extraDuty', 'date': '2025-08-07', 'dateLabel': 'Effective',
        'title': 'Country reciprocal rates replace the 10% baseline',
        'detail': 'Executive Order 14326 set country rates for goods entered from August 7, 2025: Switzerland +39%, South Africa +30%, India '
        '+25%, Thailand +19%, Israel +15%, the UAE, the UK, Australia, Peru and Colombia +10%; EU goods paid 15% in total. Diamonds '
        'and gemstones were not exempt; silver and gold bullion and doré, platinum-group metals and legal-tender coin were (Annex II). Ended '
        'February 24, 2026.',
        'before': '+10%', 'now': '+10% to +39% (ended)', 'countries': 'Listed countries, European Union', 'sourceIds': ['eo-14326', 'hts-now'],
    },
    {
        'id': 'br-ieepa', 'type': 'extraDuty', 'date': '2025-08-06', 'dateLabel': 'Effective',
        'title': 'Additional 40% on products of Brazil',
        'detail': 'Executive Order 14323 added 40% on Brazilian goods (9903.01.77) on top of the 10% reciprocal rate; silver and gold bullion and '
        'doré (7106.91.10, 7108.12.10) were exempt (9903.01.81), Brazilian gemstones and jewelry were not. Ended February 24, 2026.',
        'before': 'None', 'now': '+40% (ended)', 'countries': 'Brazil', 'sourceIds': ['eo-14323', 'hts-now'],
    },
    {
        'id': 'gold-bar-ruling', 'type': 'reference', 'date': '2025-07-31', 'dateLabel': 'Ruled',
        'title': 'CBP: cast 1-kilogram and 100-ounce gold bars are 7108.13.55, not exempt bullion',
        'detail': 'Ruling NY N351466 classified Swiss cast gold bars stamped with the refiner\'s logo, weight and fineness as semi-manufactured '
        'gold (7108.13.55), not unwrought bullion (7108.12.10), because stamping and lasering go beyond the "simple trimming" allowed by '
        'additional U.S. note 1(a). The bars were therefore subject to the reciprocal tariff — 39% for Switzerland from August 7 — until '
        'Executive Order 14346 exempted them from September 8, 2025.',
        'before': None, 'now': None, 'countries': 'Switzerland, all', 'sourceIds': ['cbp-n351466', 'eo-14346'],
    },
    {
        'id': 'ca-amended', 'type': 'extraDuty', 'date': '2025-07-31', 'dateLabel': 'Signed',
        'title': 'Canada additional duty raised to 35%',
        'detail': 'Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.',
        'before': '+25%', 'now': '+35% (ended)', 'countries': 'Canada', 'sourceIds': ['eo-14325'],
    },
    {
        'id': 'cn-reciprocal-10', 'type': 'extraDuty', 'date': '2025-05-14', 'dateLabel': 'Effective',
        'title': 'China reciprocal duty cut from 125% to 10%',
        'detail': 'Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. Chinese costume '
        'jewelry (11% base) then paid 11% + 7.5% (List 4A) + 20% + 10% = 48.5% until November 9, 2025. Ended February 24, 2026.',
        'before': '+125%', 'now': '+10% (ended)', 'countries': 'China', 'sourceIds': ['eo-14298'],
    },
    {
        'id': 'cn-125', 'type': 'extraDuty', 'date': '2025-04-10', 'dateLabel': 'Effective',
        'title': 'China reciprocal duty raised to 125%',
        'detail': 'Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% from April 10, 2025. With the 20% fentanyl duty and '
        'the 7.5% List 4A duty, Chinese costume jewelry paid 163.5% until May 13, 2025. Bullion on Annex II stayed exempt from the reciprocal '
        'duty.',
        'before': None, 'now': '+125% (ended)', 'countries': 'China', 'sourceIds': ['eo-14266'],
    },
    {
        'id': 'reciprocal', 'type': 'extraDuty', 'date': '2025-04-02', 'dateLabel': 'Signed',
        'title': 'Reciprocal tariff on products of all countries — bullion exempt',
        'detail': '10% baseline (9903.01.25) from April 5, 2025, and country rates (9903.02.xx); Canada and Mexico excluded. Annex II (9903.01.32) '
        'exempted silver bullion and doré (7106.91.10), gold bullion and doré (7108.12.10), the platinum-group metals of 7110, platinum scrap '
        '(7112.92) and legal-tender coin (7118.90) — but not cast gold bars (7108.13) or minted bars (7115.90.05) until September 8. Diamonds, '
        'gemstones and jewelry were not exempt. Ended February 24, 2026.',
        'before': 'None', 'now': '+10% or more (ended)', 'countries': 'All except Canada, Mexico', 'sourceIds': ['eo-14257'],
    },
    {
        'id': 'kp-list', 'type': 'reference', 'date': '2025-03-06', 'dateLabel': 'Published',
        'title': 'Kimberley Process participant list updated',
        'detail': 'The State Department republished the list of Kimberley Process participants from which rough diamonds (7102.10, 7102.21, '
        '7102.31) may be imported under the Clean Diamond Trade Act, adding Uzbekistan. Rough diamonds from a non-participant cannot be '
        'imported.',
        'before': None, 'now': None, 'countries': 'All', 'sourceIds': ['state-kp-2025', 'usc-3903'],
    },
    {
        'id': 'cn-ieepa', 'type': 'extraDuty', 'date': '2025-03-04', 'dateLabel': 'Effective',
        'title': 'China fentanyl duty raised to 20%',
        'detail': 'The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) to '
        '+20%, on top of the List 3 and List 4A duties. Ended February 24, 2026.',
        'before': '+10%', 'now': '+20% (ended)', 'countries': 'China', 'sourceIds': ['eo-14195', 'eo-14228'],
    },
    {
        'id': 'mx-imposed', 'type': 'extraDuty', 'date': '2025-02-01', 'dateLabel': 'Signed',
        'title': 'Additional duty on products of Mexico',
        'detail': '+25% on non-USMCA goods (9903.01.01) from March 4, 2025; USMCA-qualifying goods exempt from March 7. Ended February 24, 2026.',
        'before': 'None', 'now': '+25% (ended)', 'countries': 'Mexico', 'sourceIds': ['eo-14194'],
    },
    {
        'id': 'ca-imposed', 'type': 'extraDuty', 'date': '2025-02-01', 'dateLabel': 'Signed',
        'title': 'Additional duty on products of Canada',
        'detail': '+25% on non-USMCA goods (9903.01.10) from March 4, 2025, later raised to +35%; USMCA-qualifying goods exempt from March 7. '
        'Ended February 24, 2026.',
        'before': 'None', 'now': '+25% (ended)', 'countries': 'Canada', 'sourceIds': ['eo-14193'],
    },
    {
        'id': 'ru-diamonds-05ct', 'type': 'reference', 'date': '2024-09-01', 'dateLabel': 'Effective',
        'title': 'Ban on Russian-mined diamonds cut elsewhere extended to 0.5 carat',
        'detail': 'The second phase of OFAC\'s February 8, 2024 determination: non-industrial diamonds of 0.5 carat or more that were mined in '
        'Russia cannot be imported even after cutting and polishing in India, Belgium or elsewhere. General License 104B allows stones that were '
        'outside Russia before the cut-off dates through September 1, 2027.',
        'before': '1.0 carat or more', 'now': '0.5 carat or more', 'countries': 'Russia (mine origin)',
        'sourceIds': ['ofac-ru-diamonds', 'ofac-gl104b'],
    },
    {
        'id': 'ru-diamonds-1ct', 'type': 'reference', 'date': '2024-03-01', 'dateLabel': 'Effective',
        'title': 'Ban on Russian diamond jewelry and on Russian-mined diamonds of 1 carat or more',
        'detail': 'OFAC determinations under E.O. 14068, as amended by E.O. 14114, banned imports of diamond jewelry and unsorted diamonds of '
        'Russian origin or exported from Russia, and of Russian-mined non-industrial diamonds of 1.0 carat or more even after they are '
        'transformed in another country.',
        'before': None, 'now': 'Import prohibited', 'countries': 'Russia (mine origin)', 'sourceIds': ['ofac-ru-diamonds', 'eo-14114'],
    },
    {
        'id': 'ru-35-2023', 'type': 'extraDuty', 'date': '2023-04-01', 'dateLabel': 'Effective',
        'title': 'Russia: 35% on more precious-metal lines',
        'detail': 'Proclamation 10523 added platinum, semi-manufactured palladium, rhodium, iridium, osmium and ruthenium (7110) and industrial diamonds '
        '(7102.21.30, .40, 7102.29) to the 35% rate in place of column 2 (9903.90.08, note 30(b)).',
        'before': 'Column 2', 'now': '35%', 'countries': 'Russia', 'sourceIds': ['procl-10523'],
    },
    {
        'id': 'ru-35-2022', 'type': 'extraDuty', 'date': '2022-07-27', 'dateLabel': 'Effective',
        'title': 'Russia: 35% in place of column 2 on diamonds, silver, gold bars and coin',
        'detail': 'Proclamation 10420 set 35% (9903.90.08) on Russian miners\' diamonds, gemstones, synthetic and lab-grown stones, diamond and gemstone '
        'dust, silver bullion and bars, gold bars, minted bars and coin, among other products.',
        'before': 'Column 2', 'now': '35%', 'countries': 'Russia', 'sourceIds': ['procl-10420'],
    },
    {
        'id': 'ru-gold-ban', 'type': 'reference', 'date': '2022-06-28', 'dateLabel': 'Effective',
        'title': 'Import ban on Russian gold',
        'detail': 'OFAC determined that the E.O. 14068 import prohibition applies to gold of Russian Federation origin, except gold that was '
        'outside Russia before June 28, 2022.',
        'before': None, 'now': 'Import prohibited', 'countries': 'Russia', 'sourceIds': ['ofac-ru-gold', 'eo-14068'],
    },
    {
        'id': 'ru-ntr', 'type': 'baseRate', 'date': '2022-04-08', 'dateLabel': 'Signed',
        'title': 'Russia and Belarus moved to column 2 rates',
        'detail': 'The Suspending Normal Trade Relations with Russia and Belarus Act applied column 2 rates to their goods — from Free to 110% in '
        'Chapter 71 (for example 80% on gold jewelry, 110% on costume jewelry).',
        'before': 'Column 1 (General)', 'now': 'Column 2', 'countries': 'Russia, Belarus', 'sourceIds': ['pl-117-110'],
    },
    {
        'id': 'ru-diamonds', 'type': 'reference', 'date': '2022-03-11', 'dateLabel': 'Signed',
        'title': 'Import ban on Russian non-industrial diamonds',
        'detail': 'Executive Order 14068 prohibited imports of non-industrial diamonds of Russian Federation origin (along with seafood and '
        'alcoholic beverages).',
        'before': None, 'now': 'Import prohibited', 'countries': 'Russia', 'sourceIds': ['eo-14068'],
    },
    {
        'id': 'cn-4a-cut', 'type': 'extraDuty', 'date': '2020-02-14', 'dateLabel': 'Effective',
        'title': 'China List 4A duty cut to 7.5%',
        'detail': 'USTR halved the List 4A duty (9903.88.15) from 15% to 7.5% under the Phase One agreement. It still applies to Chinese pearls, '
        'diamonds, gemstones, lab-grown stones, jewelry, costume jewelry and coin.',
        'before': '+15%', 'now': '+7.5%', 'countries': 'China', 'sourceIds': ['fr-2020-00904'],
    },
    {
        'id': 'cn-4a', 'type': 'extraDuty', 'date': '2019-09-01', 'dateLabel': 'Effective',
        'title': 'China List 4A reaches jewelry, diamonds and pearls',
        'detail': 'The fourth China Section 301 list put +15% on Chinese pearls, diamonds, gemstones, synthetic stones, jewelry, costume jewelry '
        'and coin (headings 7101–7104, 7113, 7116–7118).',
        'before': 'None', 'now': '+15%', 'countries': 'China', 'sourceIds': ['fr-2019-17865'],
    },
    {
        'id': 'cn-list3-25', 'type': 'extraDuty', 'date': '2019-05-10', 'dateLabel': 'Effective',
        'title': 'China List 3 duty raised to 25%',
        'detail': 'USTR raised the List 3 duty (9903.88.03) from 10% to 25%. It covers Chinese gold, silver, platinum-group metals, precious-metal '
        'scrap, silverware and other precious-metal articles (7105–7112, 7114, 7115) and industrial diamonds (7102.21, 7102.29).',
        'before': '+10%', 'now': '+25%', 'countries': 'China', 'sourceIds': ['fr-2019-09681'],
    },
    {
        'id': 'cn-list3', 'type': 'extraDuty', 'date': '2018-09-24', 'dateLabel': 'Effective',
        'title': 'China Section 301 List 3 reaches precious metals',
        'detail': 'The third China Section 301 list put +10% on Chinese precious metals, bullion, scrap, silverware and industrial diamonds.',
        'before': 'None', 'now': '+10%', 'countries': 'China', 'sourceIds': ['fr-2018-20610'],
    },
]
have_ids = {c['id'] for c in tu['changes']}
tu['changes'] += [c for c in EXTRA_CHANGES if c['id'] not in have_ids]
tu['changes'].sort(key=lambda c: c['date'], reverse=True)

need = set()
for c in tu['changes']:
    need.update(c['sourceIds'])
for e in tu['inEffect']:
    need.update(e['sourceIds'])
add_sources(tu, sorted(need))

stats = [s for s in tu['stats'] if s['label'] not in ('IEEPA duties',)]
for s in stats:
    if s['label'] == 'New or renumbered lines':
        s['label'] = 'New statistical lines'
        s['note'] = 'Gold jewelry splits in 7113.19 (rates unchanged)'
stats.append({'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'})
tu['stats'] = stats

tu['seo'] = {
    'title': 'HTS Chapter 71 Tariff Updates 2026: Gold, Diamond & Jewelry Import Duties Since January 2025 | KoalaGains',
    'shortDescription': 'What changed for HTS Chapter 71 — gold, silver, platinum, diamonds, gemstones, jewelry and coins — since January '
    '2025: bullion exempt throughout, the end of the IEEPA duties (India 50%, Switzerland 39%), the 2026 Section 301 tariffs (India +10%, '
    'Israel +12.5%, EU diamonds exempt), Canada Section 338 and the Russian diamond bans, with Federal Register citations.',
    'keywords': [
        'hts chapter 71 tariff updates',
        'tariff on gold',
        'is gold exempt from tariffs',
        'swiss gold tariff',
        'tariff on diamonds from india to usa',
        'section 301 diamond tariff',
        'russian diamond ban',
        'china section 301 jewelry tariffs',
        'us import duties on gold bullion',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current '
    '**2026 Revision 21** (in force October 9, 2026). **No Chapter 71 base rate changed** — diamonds, gemstones, pearls and bullion stay Free, '
    'fine jewelry 5%–13.5%, costume jewelry up to 11%.\n\n'
    'Everything that changed sits on top of the base rate. **Gold, silver and platinum bullion stayed exempt** from every 2025–2026 tariff: '
    'the reciprocal tariff exempted bullion from April 5, 2025 and cast gold bars from September 8, 2025, and the Section 122 surcharge and '
    'the 2026 Section 301 tariffs exempt the same 21 subheadings. **Diamonds and jewelry did not**: Indian diamonds and jewelry paid 25% from '
    'August 7, 2025 and 50% from August 27, Swiss goods 39%, South African 30%. The IEEPA duties **ended on February 24, 2026**, and the '
    '10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026** a **Section 301 tariff** applies by '
    'country: India +10%, Israel, the UAE, South Africa, Thailand and Hong Kong +12.5%, EU goods 10% in total — with EU and Swiss diamonds, '
    'gemstones and natural pearls exempt. China still pays the List 3 (25%) or List 4A (7.5%) duty. Since **August 22, 2026** Canadian '
    'polished diamonds, silver bars, jewelry and some coin pay **50% under Section 338**, even under USMCA. Imports of Russian gold and '
    'diamonds remain banned.'
)
tu['scope'] = (
    'Measures that reach Chapter 71 from any country: the 2026 Section 301 tariffs on 60 economies and their exemption lists, the Brazil '
    'Section 301 tariff, the China Section 301 List 3 and List 4A duties, the Canada Section 338 duties, Russia\'s column 2 and 35% rates, and '
    'the 2025–2026 IEEPA and Section 122 duties that have ended. The OFAC import bans on Russian gold and diamonds, the Kimberley Process '
    'rules for rough diamonds, the de minimis suspension and preference-program changes (GSP, AGOA) are listed for reference. No Section 232 '
    'duty and no antidumping or countervailing duty order covers a Chapter 71 product. For the rate each supplier pays, see Rates by country.'
)

for e in tu['inEffect']:
    if e['country'] == 'Canada':
        e['now'] = '+10% (non-USMCA); 50% Section 338 on 7 subheadings, also under USMCA'
