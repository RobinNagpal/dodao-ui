# Rates by country, import statistics, duty-saving rules and FAQ pages (exec'd from fill91.py).

# ---------------------------------------------------------------------------------------------------
# Rates by country (industryAreas)
# ---------------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['h1'] = 'HTS Chapter 91: Watches, Clocks and Parts — Tariff Rates by Country'
ia['seo'] = {
    'title': 'Watch & Clock Tariffs by Country 2026 — Switzerland, Japan, China, Hong Kong, Germany (HTS Ch. 91) | KoalaGains',
    'shortDescription': 'The total 2026 U.S. tariff on watches, clocks, movements, straps and parts by country: Swiss and Japanese watches '
    '12.5% of value in total, German, French and Italian 10%, Thai, Vietnamese and Hong Kong base rate + 12.5%, Chinese base rate + 20%, '
    'USMCA-qualifying Mexican time switches Free.',
    'keywords': [
        'clocks and watches and parts thereof import duty rates',
        'horological movements import duty',
        'usmca tariff on clocks and watches and parts thereof',
        'quartz watch tariff',
        'tariff on watches from switzerland',
        'tariff on watches from japan',
        'tariff on watches from china',
        'tariff on watches from hong kong',
        'watch tariffs germany',
    ],
}
GROUP_LABELS = {
    '9101': ('Watches with precious-metal case', 'Gold watches'),
    '9102': ('Watches with other case (steel, titanium, plastic)', 'Other watches'),
    '9103': ('Clocks with watch movements', 'Watch-movement clocks'),
    '9104': ('Instrument-panel clocks for vehicles, aircraft and vessels', 'Panel clocks'),
    '9105': ('Alarm, wall and other clocks', 'Clocks'),
    '9106': ('Time recorders, parking meters and interval timers', 'Time recorders'),
    '9107': ('Time switches', 'Time switches'),
    '9108': ('Watch movements, complete and assembled', 'Watch movements'),
    '9109': ('Clock movements, complete and assembled', 'Clock movements'),
    '9110': ('Movement sets, incomplete and rough movements, movement parts', 'Movement sets'),
    '9111': ('Watch cases and parts', 'Watch cases'),
    '9112': ('Clock cases and parts', 'Clock cases'),
    '9113': ('Watch straps, bands and bracelets', 'Watch straps'),
    '9114': ('Other clock and watch parts (dials, plates, springs, jewels)', 'Other parts'),
}
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]

AIR = 'Civil-aircraft clocks and movements are exempt (note 52(d)).'
RULE_LABELS = {
    'Switzerland': 'Swiss goods: 12.5% in total in place of the base rate when the base rate is lower (9903.05.74) — for a compound watch '
    'rate, its ad valorem equivalent (note 52(k)), so a Swiss watch pays 12.5% of its value. The Swiss exception list names no Chapter 91 '
    'line. ' + AIR + ' The IEEPA rate (39%, then 15% in total) ended February 24, 2026.',
    'Japan': 'Japanese goods: 12.5% in total in place of the base rate when the base rate is lower (9903.05.49), so a Japanese watch pays '
    '12.5% of its value. ' + AIR + ' The 15%-in-total IEEPA rate ended February 24, 2026.',
    'China': 'Base rate + 12.5% (9903.05.31), plus +7.5% List 4A (9903.88.15) on most watches, movements, cases, straps and parts or +25% '
    'List 3 (9903.88.03) on instrument-panel clocks, time recorders and time switches. Some alarm and wall clocks, clock movements and metal '
    'or textile bands are on neither list. ' + AIR,
    'Germany': 'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39), so a German watch pays 10% of its '
    'value; lines at 10% or more (14% straps) pay only the base rate. ' + AIR,
    'France': 'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39). ' + AIR,
    'Italy': 'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39). ' + AIR,
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94). Otherwise base rate + 10% Section 301 (9903.05.55). ' + AIR + ' The 25% IEEPA '
    'duty ended February 24, 2026.',
    'Canada': 'USMCA-qualifying: no extra duty (9903.05.93). Otherwise base rate + 10% Section 301 (9903.05.29). No Chapter 91 line is on the '
    'Section 338 lists. ' + AIR,
    'Thailand': 'Base rate + 12.5% Section 301 (9903.05.77). ' + AIR + ' The 19% IEEPA rate ended February 24, 2026.',
    'Singapore': 'Base rate + 12.5% Section 301 (9903.05.68), even when the Singapore FTA (SG) is claimed — so FTA watches pay 12.5%. ' + AIR,
    'Philippines': 'Base rate + 12.5% Section 301 (9903.05.64). ' + AIR,
    'Vietnam': 'Base rate + 12.5% Section 301 (9903.05.84). ' + AIR + ' The 20% IEEPA rate ended February 24, 2026.',
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81). The UK exception list names no Chapter 91 line. ' + AIR,
    'Malaysia': 'Base rate + 10% Section 301 (9903.05.54). Malaysia\'s exception lists name no Chapter 91 line. ' + AIR,
    'Taiwan': 'Taiwanese goods: 10% in total in place of the base rate when the base rate is under 10% (9903.05.76). ' + AIR,
    'Hong Kong': 'Base rate + 12.5% Section 301 (9903.05.43). Hong Kong goods are not on the China lists. ' + AIR,
    'India': 'Base rate + 10% Section 301 (9903.05.44). ' + AIR,
    'Brazil': 'Base rate + 25% (9903.05.01) + 12.5% (9903.05.27). Civil-aircraft goods are exempt from both.',
}


def rule_label(c):
    name = c['country']
    if name in RULE_LABELS:
        return RULE_LABELS[name]
    if name == 'Any other country':
        return (
            'Countries outside the 60 Section 301 economies pay only the base rate. The others pay +10% or +12.5% (9903.05.20–9903.05.84), or '
            '12.5% in total for South Korea; civil-aircraft clocks and movements are exempt everywhere. Column 2 countries (Cuba, North Korea, '
            'Russia, Belarus) pay column 2 rates, for example $3.25 each + 45% on the case + 80% on the strap for a quartz watch with hands.'
        )
    raise SystemExit(f'no rule label for {name}')


for c in ia['countries']:
    c['rule']['label'] = rule_label(c)
    if c['country'] == 'Any other country':
        c['rule']['ch99Code'] = '9903.05.20–9903.05.84'
    ids = c['rule']['sourceIds']
    if c['country'] not in ('Any other country', 'Singapore') and 'eo-14389' not in ids:
        ids.insert(-1, 'eo-14389')

ia['intro'] = (
    'Each cell is the base rate for that product group plus the extra duty for that country, minus any preference, from the current tariff '
    'schedule. For watches the country matters more than the base rate. **Swiss and Japanese** watches pay **12.5% of their value in '
    'total** (9903.05.74, 9903.05.49), and **EU and Taiwanese** watches **10%** (9903.05.39, 9903.05.76): the compound base rate of a watch '
    'is almost always worth less than that, so the flat rate replaces it. From **Thailand, Vietnam, the Philippines, Singapore and Hong Kong** '
    'the base rate is charged and **12.5%** is added; from the **UK, India and Malaysia**, 10%. **China** adds 12.5% plus 7.5% (List 4A) on '
    'most watches and parts, or 25% (List 3) on time switches, time recorders and instrument-panel clocks. USMCA-qualifying goods from Mexico '
    'and Canada pay nothing.'
)
assumptions = [a for a in ia['assumptions'] if not a.startswith('TODO')]
assumptions += [
    'Compound base rates ("$1.53 each + 4.2% on the case + 2% on the strap, band or bracelet") are charged on the value of each component, '
    'which the importer declares on its statistical-note-1 number (for 9102.21.90: movement 9102.21.9010, case .9020, strap .9030). Each '
    'such line is listed under its first statistical number, and the tariff calculator prices it from the component values entered for '
    'those numbers. The cells use nominal component values and keep the component terms in words; for Switzerland, Japan, the EU and '
    'Taiwan the "in total" rate is compared with the ad valorem equivalent of the base rate (note 52(k)), shown as "the higher of".',
    'Movement sets (9110.11, 9110.90.20) pay the rate of the complete movement, which the importer names; those cells show the rule in words. '
    'Movement parts with a plate (9110.90.40, 9114.90.30) are capped at the duty on the complete movement; the cells show the uncapped '
    'rate with the cap in words.',
    'EU, Switzerland, Japan and Taiwan "in total" rules: where the base rate is below 10% (EU, Taiwan) or 12.5% (Switzerland, Japan), the '
    'total is that figure; lines at or above it pay only their base rate.',
    'Not in the cells: the insular-possessions watch program (additional U.S. note 5, 15 CFR part 303), the civil-aircraft exemption '
    '(note 52(d)), FTA preferences of countries not listed, and the Section 232 certified-parts elections, which are opt-in. No antidumping '
    'or countervailing duty order and no Section 232 duty covers a Chapter 91 product.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied.',
]
ia['assumptions'] = assumptions
ia['exemptionCheck'] = (
    'Read U.S. notes 2, 16, 19, 20, 30, 31, 33, 36–39, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The only Chapter 99 '
    'lists that name Chapter 91 lines are the civil-aircraft lists — note 52(d) (9903.05.88), note 50(a)(iv) for Brazil (9903.05.05), note '
    '51(d) for Canada and the expired Section 122 list (9903.03.05) — which cover instrument-panel clocks 9104.00.05–9104.00.60 and clock '
    'movements 9109.10.50, 9109.10.60 and 9109.90.20 for civil aircraft. The general exemption list (note 52(b)), the product list in note '
    '52(c) and every country exception list in note 52(j) — EU, Switzerland, UK, Malaysia, Taiwan and the others — name no Chapter 91 line. '
    'The Canada Section 338 lists (note 51(b)) name none. China: List 3 (9903.88.03) covers 9104.00.05–9104.00.50, 9106 and 9107; List 4A '
    '(9903.88.15) covers most other lines; the lines on neither include 9103.10.20/.40, most of 9105.11, 9105.21 and 9105.91, 9108.12.00, '
    '9108.90.80, several clock movements and 9113.20.20/.40 and 9113.90.40. The product exclusions still in force (note 20(vvv), (www), '
    'through November 9, 2026) name no Chapter 91 product; the watch-case, dial and kitchen-timer exclusions in earlier subdivisions have '
    'expired. No note 31 increase, Russia note 30 line or Section 232 list names a Chapter 91 line. A Federal Register search found no '
    'antidumping or countervailing duty order on watches, clocks or their parts.'
)
add_sources(ia, ['eo-14389', 'hts-ch91'])

# ---------------------------------------------------------------------------------------------------
# Import statistics (understandIndustry)
# ---------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
ui['h1'] = 'HTS Chapter 91: Watches, Clocks and Parts — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Watch & Clock Imports by Country — Swiss Watch Imports, HTS Chapter 91 Trade Statistics | KoalaGains',
    'shortDescription': f'U.S. imports of HTS Chapter 91 goods: {fmt_usd(T25)} in {LY}. Swiss watches were {SWISS_SHARE:.0f}% of it; '
    f'Japan, China, Germany, Mexico and Thailand follow. Values by country, product and year from UN Comtrade.',
    'keywords': [
        'hts chapter 91',
        'clocks and watches and parts thereof import duty rates',
        'china tariff on clocks and watches and parts thereof',
        'switzerland watch import duties',
        'hts 9102.11.10',
        'us watch imports by country',
        'swiss watch exports to us',
        'section 301 watch tariffs',
    ],
}
ch_sw = ct('Switzerland', PY)
ui['why'] = (
    f'U.S. imports of Chapter 91 goods were **{fmt_usd(T25)} in {LY}**, {abs(pct(T25, T24)):.1f}% less than the {fmt_usd(T24)} of {PY} '
    f'and {pct(T25, TOT[2020]):.0f}% more than in 2020. Watches dominate: heading 9102 (cases other than precious metal) '
    f'{fmt_usd(hd("9102"))} and heading 9101 (precious-metal cases) {fmt_usd(hd("9101"))}. The largest single line is automatic watches '
    f'with a steel or other case (9102.21, {fmt_usd(HS6["910221"]["importsUsd"])}), ahead of automatic gold watches (9101.21, '
    f'{fmt_usd(HS6["910121"]["importsUsd"])}) and quartz watches with hands (9102.11, {fmt_usd(HS6["910211"]["importsUsd"])}).\n\n'
    f'**Switzerland** supplied {fmt_usd(SWISS)} ({SWISS_SHARE:.1f}%), down {abs(pct(SWISS, ch_sw)):.1f}% from {fmt_usd(ch_sw)} in {PY}. '
    f'In {LY} Swiss watches paid IEEPA duties from April 5 (10%, then 39% from August 7 and 15% in total from November 14). Gold-cased watches fell most: 9101.21 dropped {abs(pct(HS6["910121"]["importsUsd"], HS6["910121"]["priorImportsUsd"])):.1f}%. '
    f'**Japan** ({fmt_usd(ct("Japan"))}) ships mostly 9102 watches. **China** ({fmt_usd(ct("China"))}) ships cheaper watches, straps '
    f'({fmt_usd(HC.get(("China", "9113"), 0))}), clocks ({fmt_usd(HC.get(("China", "9105"), 0))}) and time switches. **Mexico** '
    f'({fmt_usd(ct("Mexico"))}, up {pct(ct("Mexico"), ct("Mexico", PY)):.0f}%) ships almost only time switches (9107), most of them '
    f'Free under USMCA. Germany, Thailand, France and Singapore follow.\n\n'
    f'The figures are annual and stop at {LY}, before the 2026 tariff changes (the end of the IEEPA duties in February, the 10% Section 122 '
    f'surcharge to July 23 and the Section 301 tariffs from July 24, 2026); they do not show what those changes did. Duty-collected figures '
    f'are not available from an official source yet.'
)
ui['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar years 2020–{LY}. '
    f'"Other Asia, nes" is Taiwan in UN Comtrade.'
)

# ---------------------------------------------------------------------------------------------------
# Duty-saving rules (tariffEngineering)
# ---------------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['h1'] = 'HTS Chapter 91: Watches, Clocks and Parts — Import Rules & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing Watches into the U.S.: Watch Marking Rules, Component Valuation, Country of Origin & Ways to Lower Duty (HTS Ch. 91) | KoalaGains',
    'shortDescription': 'What each HTS Chapter 91 line needs at U.S. entry — the special watch and clock marking rules (additional U.S. note 4, '
    '19 CFR 11.9), component values under statistical note 1, origin by movement, wildlife rules for exotic-leather straps — and the legal '
    'ways to pay less: classification, origin, USMCA, repairs abroad, the insular-possessions program, drawback and FTZs.',
    'keywords': [
        'hts chapter 91',
        'clocks and watches and parts thereof tariff',
        'mexico tariff on clocks and watches and parts thereof',
        'unused merchandise drawback chapter 91',
        'watch country of origin marking',
        'watch movement marking requirements',
        'watch component valuation statistical note 1',
        'watch repair abroad duty 9802',
    ],
}
te['intro'] = (
    'Watches and clocks need no import license, but they have **their own marking rule**. Every movement and case — imported alone or inside '
    'a watch or clock — must be marked by cutting, die-sinking, engraving, stamping or mold-marking with the country of manufacture, the name '
    'of the manufacturer or purchaser and, on movements, the number of jewels (additional U.S. note 4); CBP will not release unmarked goods '
    '(19 CFR 11.9). Quartz watches with a digital display only are excepted. The entry must also **split each watch into its components** — '
    'movement, case, strap, battery — with a value for each (statistical note 1), because the compound rate is charged on those values.\n\n'
    'On cost, the main lever is the **country of origin**, which for a watch is where the **movement was assembled**: a Swiss watch pays '
    '12.5% of value, an EU one 10%, a Chinese one the base rate + 20%. USMCA, the insular-possessions program, repairs abroad (9802), drawback '
    'and foreign-trade zones can lower it further.'
)
te['regulationsAsOf'] = REG_AS_OF
HTS91_NOTE = 'HTSUS Chapter 91'
te['rules'] = [
    {
        'id': 'watch-marking',
        'agency': 'U.S. Customs and Border Protection',
        'title': 'Watch and clock movements, cases and dials must carry the special marking — country of manufacture, manufacturer or purchaser '
        '(full name or registered trade name) and, on movements, the number of jewels in words — by cutting, die-sinking, engraving, stamping '
        'or mold-marking; unmarked goods are not released and owe a 10% marking duty unless marked, exported or destroyed',
        'citations': [
            {'label': 'HTSUS Chapter 91, additional U.S. note 4', 'url': CH91_PDF},
            {'label': '19 CFR 11.9', 'url': ecfr(19, '11.9')},
            {'label': '19 CFR 134.43(b)', 'url': ecfr(19, '134.43')},
            {'label': '19 U.S.C. 1304', 'url': 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap4-subtitleII-partI-sec1304.htm'},
        ],
    },
    {
        'id': 'origin-marking',
        'agency': 'U.S. Customs and Border Protection',
        'title': 'Every article is marked with its country of origin; a watch takes the origin of its movement, and a strap made in another '
        'country must be marked with its own origin (a hangtag that stays on until sale is acceptable)',
        'citations': [
            {'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')},
            {'label': 'CBP ruling NY N364461', 'url': 'https://rulings.cbp.gov/ruling/N364461'},
        ],
    },
    {
        'id': 'components',
        'agency': 'U.S. Customs and Border Protection',
        'title': 'Watches, clocks and movements with compound rates are entered component by component — movement, case, strap, band or '
        'bracelet, battery — each on its own statistical suffix with its own value, the values adding up to the article\'s value; CBP '
        'reapportions values that are not supported (the tariff calculator asks for the same component values)',
        'citations': [
            {'label': 'HTSUS Chapter 91, statistical note 1', 'url': CH91_PDF},
            {'label': 'CBP ruling NY N362026', 'url': 'https://rulings.cbp.gov/ruling/N362026'},
            {'label': 'CBP decision HQ H326900', 'url': 'https://rulings.cbp.gov/ruling/H326900'},
        ],
    },
    {
        'id': 'wildlife',
        'agency': 'U.S. Fish and Wildlife Service',
        'title': 'Straps of alligator, crocodile, ostrich, lizard or other wildlife leather need a Fish and Wildlife declaration (Form 3-177) '
        'and, for CITES-listed species, the CITES documents',
        'citations': [
            {'label': '50 CFR 14.61', 'url': ecfr(50, '14.61')},
            {'label': '50 CFR 23.13', 'url': ecfr(50, '23.13')},
        ],
    },
    {
        'id': 'stamping-act',
        'agency': 'Federal Trade Commission / Department of Justice',
        'title': 'Gold watchcases stamped with a fineness mark must not fall short of it by more than three one-thousandths (15 U.S.C. 295); '
        'falsely marked gold or silver goods may not be imported for sale (15 U.S.C. 294)',
        'citations': [
            {'label': '15 U.S.C. 294', 'url': 'https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap8-sec294.htm'},
            {'label': '15 U.S.C. 295', 'url': 'https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap8-sec295.htm'},
        ],
    },
    {
        'id': 'cbp-ch99',
        'agency': 'U.S. Customs and Border Protection',
        'title': 'Report the Chapter 99 heading that applies to the origin — the 2026 Section 301 country heading (9903.05.20–9903.05.84), the '
        'USMCA or civil-aircraft exemption heading, and for China the List 3 or 4A heading — with the Chapter 91 line',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20 and 52', 'url': CH99_PDF},
            {'label': 'CBP CSMS # 69326983', 'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/421d887'},
        ],
    },
]
te['levers'] = [
    {
        'id': 'components',
        'title': 'Declare each component\'s value correctly',
        'saves': 'The duty on the case, strap and battery percentages: on a $5,000 watch of 9102.21.70, moving $500 of value from a steel '
        'bracelet (9.8%) to the movement (charged per piece) changes the base rate by $49 — but only where the base rate is charged (not for '
        'Swiss, Japanese, EU or Taiwanese watches, which pay a flat 12.5% or 10% of the whole value)',
        'appliesTo': 'Compound-rate watches and clocks of 9101–9105, 9108 and 9109',
        'document': 'Supplier invoices or cost breakdowns that value the movement, case, strap and battery separately.',
        'caveat': 'The values must reflect what the components are worth. CBP rejected an importer\'s allocation that put brand, profit and '
        'overhead on the movement and reapportioned the entries (HQ H326900).',
        'citations': [
            {'label': 'HTSUS Chapter 91, statistical note 1', 'url': CH91_PDF},
            {'label': 'CBP decision HQ H326900', 'url': 'https://rulings.cbp.gov/ruling/H326900'},
        ],
    },
    {
        'id': 'classify',
        'title': 'Classify by case, movement, jewels and strap material',
        'saves': 'Up to the whole base rate: a mechanical watch with a gold case and over 17 jewels (9101.21.50) is Free, one with a steel case '
        '(9102.21.70) pays $1.53 + 4.2% of the case + 9.8% of a steel bracelet; a leather strap entered on its own pays 1.8% (9113.90.80), a '
        'steel bracelet 11.2% (9113.20)',
        'appliesTo': 'Headings 9101–9114',
        'document': 'Technical sheets: case material, movement type, jewel count, movement size, display type, strap material.',
        'caveat': 'Heading 9101 needs a case wholly of precious metal (chapter note 2); a steel case inlaid with gold is 9102. A strap entered '
        'with the watch goes with the watch (additional U.S. note 2). Smartwatches are not Chapter 91 — CBP classifies them in 8517.62 (NY '
        'N349122).',
        'citations': [
            {'label': 'HTSUS Chapter 91, notes 2–3 and additional U.S. notes 1–3', 'url': CH91_PDF},
            {'label': 'CBP ruling NY N349122 (smartwatches)', 'url': 'https://rulings.cbp.gov/ruling/N349122'},
        ],
    },
    {
        'id': 'origin',
        'title': 'Know the country of origin — where the movement was assembled',
        'saves': 'The gap between country rates: a $5,000 steel automatic pays $500 from the EU, $625 from Switzerland or Japan, $691.53 from '
        'Thailand or Hong Kong and $1,066.53 from China',
        'appliesTo': 'All watches; for clocks and parts, the usual substantial-transformation rule',
        'document': 'Production records showing where the movement was assembled and where the strap was made.',
        'caveat': 'CBP\'s long-standing position is that a watch (without its strap) originates where the movement is assembled; casing, dial '
        'and hands do not change it (NY N364461, NY N351984). A Japanese movement cased in China makes a Japanese watch; a strap keeps its '
        'own origin.',
        'citations': [
            {'label': 'CBP ruling NY N364461', 'url': 'https://rulings.cbp.gov/ruling/N364461'},
            {'label': 'CBP ruling NY N351984', 'url': 'https://rulings.cbp.gov/ruling/N351984'},
            {'label': '19 CFR 134.1', 'url': ecfr(19, '134.1')},
        ],
    },
    {
        'id': 'usmca',
        'title': 'Claim USMCA for Mexican and Canadian clocks, time switches and parts',
        'saves': 'The base rate and the 10% Section 301 duty: a qualifying Mexican time switch enters Free',
        'appliesTo': 'Goods of Mexico and Canada that meet the USMCA rules of origin (SPI S)',
        'document': 'A USMCA certification of origin (19 CFR 182.12) kept with the entry records.',
        'caveat': 'Most watches are not made in North America; the claim helps time switches (9107), clocks and parts.',
        'citations': [
            {'label': '19 CFR part 182', 'url': ecfr_part(19, 182)},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(g)–(h)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'insular',
        'title': 'Assemble watches in the U.S. Virgin Islands, Guam or American Samoa',
        'saves': 'The whole base rate: licensed insular watches and movements enter Free regardless of foreign parts, within the annual '
        'quantity; producers can also earn duty-refund certificates',
        'appliesTo': 'Watches and watch movements (9101, 9102, 9108)',
        'document': 'A license and shipment permit from Commerce and Interior (15 CFR part 303); producers apply on form ITA-334P.',
        'caveat': 'The goods may contain no material from a column 2 country, and must meet the minimum assembly rules. The last published '
        'allocation (calendar 2015) gave the USVI 1,866,000 units and found no producers in Guam, American Samoa or the Northern Mariana '
        'Islands.',
        'citations': [
            {'label': 'HTSUS Chapter 91, additional U.S. note 5', 'url': CH91_PDF},
            {'label': '15 CFR part 303', 'url': ecfr_part(15, 303)},
            {'label': '80 FR 12802', 'url': 'https://www.federalregister.gov/documents/2015/03/11/2015-05313/allocation-of-duty-exemptions-for-calendar-year-2015-for-watch-producers-located-in-the-united'},
        ],
    },
    {
        'id': 'ch98',
        'title': 'Use Chapter 98 for repairs abroad and U.S. goods returned',
        'saves': 'Duty on everything but the repair: a watch sent abroad for service pays duty, including the Section 301 duty, only on '
        'the value of the repair (9802.00.40 for warranty repairs, 9802.00.50 for others); U.S. goods, or foreign goods within 3 years of '
        'export, returned unchanged enter Free (9801.00.10) with no Section 301 duty',
        'appliesTo': 'Watches and clocks exported for repair or alteration, or returned',
        'document': 'Proof of export (CBP Form 4455 or equivalent) and the repairer\'s invoice for the work (19 CFR 10.8).',
        'caveat': 'Note 52(a) charges the Section 301 duty on the value of the repairs for 9802.00.40/.50 entries; other Chapter 98 '
        'entries such as 9801.00.10 are outside it. The watch must come back the same article, not exchanged for another.',
        'provisions': [
            {'code': '9802.00.40', 'rate': 'Duty on the value of repairs', 'text': 'Repairs or alterations made pursuant to a warranty'},
            {'code': '9802.00.50', 'rate': 'Duty on the value of repairs or alterations', 'text': 'Articles exported for repairs or alterations'},
            {'code': '9801.00.10', 'rate': 'Free', 'text': 'U.S. goods, or other goods within 3 years of export, returned without being advanced in value'},
        ],
        'citations': [
            {'label': 'HTSUS Chapter 98', 'url': CH98_PDF},
            {'label': '19 CFR 10.8', 'url': ecfr(19, '10.8')},
            {'label': '19 CFR 10.1', 'url': ecfr(19, '10.1')},
        ],
    },
    {
        'id': 'temporary',
        'title': 'Bring samples in temporarily — TIB or ATA carnet',
        'saves': 'All duty on watches imported for a trade show or to take orders, if re-exported',
        'appliesTo': 'Samples and exhibition goods',
        'document': 'A temporary importation bond (9813.00) or an ATA carnet.',
        'caveat': 'The goods must be exported within the bond period (one year, extendable) and not sold.',
        'citations': [
            {'label': '19 CFR 10.31', 'url': ecfr(19, '10.31')},
            {'label': '19 CFR part 115', 'url': ecfr_part(19, 115)},
        ],
    },
    {
        'id': 'drawback',
        'title': 'Claim drawback on re-exported watches',
        'saves': 'Up to 99% of the duties paid, including the Section 301 duty, when the watches (or interchangeable ones) are exported',
        'appliesTo': 'Watches, movements and parts that are exported or destroyed',
        'document': 'Import and export records and a drawback claim in ACE (19 CFR part 190).',
        'caveat': 'Substitution needs commercially interchangeable goods (CBP has ruled on watch models); file within five years of import.',
        'citations': [
            {'label': '19 CFR part 190', 'url': ecfr_part(19, 190)},
            {'label': '19 CFR 190.32', 'url': ecfr(19, '190.32')},
        ],
    },
    {
        'id': 'ftz',
        'title': 'Hold stock in a foreign-trade zone',
        'saves': 'Defers duty until goods leave the zone for the U.S. market; none on goods re-exported',
        'appliesTo': 'Distributors holding inventory for the U.S. and export markets',
        'document': 'Zone admission (CBP Form 214) and the zone operator\'s records.',
        'caveat': 'Goods admitted after the 2026 Section 301 duty generally enter in privileged-foreign status and pay the duty when they '
        'leave the zone.',
        'citations': [{'label': '19 CFR part 146', 'url': ecfr_part(19, 146)}],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding ruling before the first shipment',
        'saves': 'Certainty on classification, origin and component reporting',
        'appliesTo': 'New models, multi-country supply chains, smart or hybrid watches',
        'document': 'A ruling request to CBP (19 CFR part 177).',
        'caveat': 'A ruling binds only for the facts described in it.',
        'citations': [{'label': '19 CFR 177.1', 'url': ecfr(19, '177.1')}],
    },
]
WATCH_RULES = ['watch-marking', 'origin-marking', 'components', 'wildlife', 'stamping-act', 'cbp-ch99']
GROUP_NOTES = {
    '9101': (WATCH_RULES, 'Movement and case must carry the note 4 marking; a gold case\'s fineness mark must be accurate. Swiss and Japanese '
             'gold watches pay 12.5% of value; exotic-leather straps need a wildlife declaration.'),
    '9102': (['watch-marking', 'origin-marking', 'components', 'wildlife', 'cbp-ch99'], 'Enter movement, case, strap and battery on their own '
             'suffixes with their values. Quartz watches with a digital display only are excepted from the note 4 marking.'),
    '9103': (['watch-marking', 'origin-marking', 'components', 'cbp-ch99'], 'Movement and case marking (note 4); travel clocks and other '
             'clocks report movement, case and battery separately.'),
    '9104': (['watch-marking', 'origin-marking', 'components', 'cbp-ch99'], 'Civil-aircraft clocks meeting general note 6 are exempt from '
             'the 2026 Section 301 duty; Chinese panel clocks pay 25% (List 3).'),
    '9105': (['watch-marking', 'origin-marking', 'components', 'cbp-ch99'], 'Clock movements and cases carry the note 4 marking; clocks '
             'that run only on AC power report as one unit.'),
    '9106': (['origin-marking', 'cbp-ch99'], 'No special marking beyond origin unless a clock movement is inside. Chinese time recorders pay '
             '25% (List 3).'),
    '9107': (['origin-marking', 'cbp-ch99'], 'USMCA-qualifying Mexican time switches enter Free with no Section 301 duty.'),
    '9108': (['watch-marking', 'origin-marking', 'cbp-ch99'], 'Each movement marked on a bridge or top plate with country, maker and '
             'jewels in words.'),
    '9109': (['watch-marking', 'origin-marking', 'cbp-ch99'], 'Clock movements marked on the front or back plate. Civil-aircraft '
             'movements of 9109.10.50, 9109.10.60 and 9109.90.20 are exempt from the 2026 Section 301 duty.'),
    '9110': (['watch-marking', 'origin-marking', 'cbp-ch99'], 'A movement set pays the rate of the complete movement — name that line at '
             'entry. Parts with a plate are capped at the complete movement\'s duty.'),
    '9111': (['watch-marking', 'origin-marking', 'stamping-act', 'cbp-ch99'], 'Watch cases marked inside or outside the back with country '
             'and maker; gold cases must meet their fineness mark.'),
    '9112': (['watch-marking', 'origin-marking', 'cbp-ch99'], 'Clock cases marked on the outside of the back with the country of '
             'manufacture.'),
    '9113': (['origin-marking', 'wildlife', 'cbp-ch99'], 'Straps marked with their own origin; exotic leather needs a wildlife declaration.'),
    '9114': (['watch-marking', 'origin-marking', 'cbp-ch99'], 'Dials and plates for movements follow the note 4 marking when imported '
             'separately (19 CFR 11.9 names dials); jewels are Free.'),
}
for g in te['groups']:
    g['ruleIds'], g['note'] = GROUP_NOTES[g['heading']]
    g['label'] = GROUP_LABELS[g['heading']][0]

LEVERS_BY_HEADING = {
    '9101': ['components', 'classify', 'origin', 'insular', 'ch98', 'temporary', 'drawback', 'ftz', 'ruling'],
    '9102': ['components', 'classify', 'origin', 'usmca', 'insular', 'ch98', 'temporary', 'drawback', 'ftz', 'ruling'],
    '9108': ['classify', 'origin', 'insular', 'drawback', 'ftz', 'ruling'],
}
DEFAULT_LEVERS = ['components', 'classify', 'origin', 'usmca', 'ch98', 'temporary', 'drawback', 'ftz', 'ruling']
for l in te['lines']:
    h = l['hts'][:4]
    l['ruleIds'] = list(GROUP_NOTES[h][0])
    levers = LEVERS_BY_HEADING.get(h, DEFAULT_LEVERS)
    gen = (ROW.get(l['hts']) or {}).get('effectiveGeneral') or ''
    if ' on the ' not in gen:
        levers = [x for x in levers if x != 'components']
    l['leverIds'] = levers
te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations and the tariff schedule — not legal advice. The line a watch falls '
    'in, the value of each component, the origin of a movement and the Chapter 99 duties that apply depend on the facts of each shipment, and '
    'the extra duties change by Federal Register notice and CBP guidance; confirm the current headings and marking before each shipment.'
)

# ---------------------------------------------------------------------------------------------------
# FAQ (finalConclusion)
# ---------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['h1'] = 'HTS Chapter 91: Watches, Clocks and Parts — Tariff FAQ'
fc['seo'] = {
    'title': 'Watch Tariff FAQ 2026: Swiss Watch Tariff, Japan, China & Hong Kong Rates, Watch HS Codes (HTS Ch. 91) | KoalaGains',
    'shortDescription': 'Answers to what people search about U.S. tariffs on watches and clocks: the current Swiss watch tariff, whether '
    'the 39% still applies, refunds, watches from Japan, China and Hong Kong, used watches, how watch duty is calculated, and the HS codes '
    'for watches, straps, parts, clocks and smartwatches.',
    'keywords': [
        'hts chapter 91 import customs duty',
        'swiss watches import duty rates',
        'swiss watch tariff',
        'current tariff on swiss watches',
        'tariff on watches from japan',
        'tariff on watches from china',
        'are watches exempt from tariffs',
        'watch import duty calculator usa',
        'hs code for watches',
        'hs code for watch strap',
        'smartwatch hs code',
    ],
}
fc['intro'] = (
    'Straight answers to the most common questions about U.S. tariffs and import rules for watches, clocks, movements, straps and parts. '
    'Each answer links to the page with the full detail.'
)
fc['keyTakeaways'] = [
    'Chapter 91 base rates have not changed: most watches pay a compound rate — a charge per movement plus percentages on the case, strap '
    'and battery — and many gold mechanical watches are Free.',
    'Since July 24, 2026 Swiss and Japanese watches pay 12.5% of their value in total and EU and Taiwanese watches 10% (Section 301, note '
    '52(k)); Thailand, Vietnam, the Philippines, Singapore and Hong Kong add 12.5% to the base rate; the UK, India and Malaysia 10%.',
    'Chinese watches pay the base rate + 12.5% + 7.5% (List 4A); Chinese time switches, time recorders and panel clocks the base rate + 37.5%.',
    'The 2025 IEEPA tariffs — 39% on Swiss watches from August 7, 2025, then 15% in total — ended February 24, 2026; importers can claim '
    'refunds through CBP\'s CAPE process. The 10% Section 122 surcharge ran from February 24 to July 23, 2026.',
    'A watch\'s origin is where its movement was assembled; every movement and case must carry the special marking of additional U.S. note 4.',
    'Smartwatches are not Chapter 91: CBP classifies them in 8517.62.',
]
fc['questionSource'] = 'Google search suggestions (U.S. English), collected October 13, 2026'
fc['faqs'] = [
    {
        'id': 'swiss-tariff',
        'question': 'What is the U.S. tariff on Swiss watches now?',
        'searchedAs': ['swiss watch tariff', 'swiss watch tariff rate', 'swiss watch tariff us', 'tariff on swiss watches', 'current tariff on swiss watches',
                       'us tariff on swiss watches', 'tariff on watches from switzerland', 'rolex tariffs', 'are rolex watches subject to tariffs'],
        'answer': 'Since July 24, 2026, Swiss watches pay 12.5% of their customs value in total. The Section 301 heading for Switzerland '
        '(9903.05.74) replaces the base rate with 12.5% whenever the base rate is lower, and for a watch\'s compound rate it almost always is — '
        'a $5,000 steel automatic owes $66.53 at the base rate (1.3%). So that watch pays $625, and a $30,000 gold watch $3,750. Swiss watch '
        'movements, straps and parts pay 12.5% too. Switzerland\'s exception list names no Chapter 91 product.',
        'link': 'tariff-updates',
    },
    {
        'id': 'swiss-39',
        'question': 'Does the 39% tariff on Swiss watches still apply?',
        'searchedAs': ['39 tariff on swiss watches', 'trump tariff on swiss watches', 'swiss watch tariff reduction', 'swiss watch tariff update',
                       'swiss watch tariff news'],
        'answer': 'No. The 39% IEEPA reciprocal rate applied to Swiss goods entered from August 7, 2025, on top of the base rate. From November '
        '14, 2025 it was cut to 15% in total under the U.S.–Switzerland framework. All IEEPA duties ended on February 24, 2026, after the '
        'Supreme Court ruled that IEEPA does not authorize tariffs. Swiss watches then paid the base rate + 10% (Section 122) until July 23, 2026, '
        'and 12.5% in total since July 24, 2026.',
        'link': 'tariff-updates',
    },
    {
        'id': 'refund',
        'question': 'Can I get a refund of the tariffs paid on Swiss watches in 2025?',
        'searchedAs': ['swiss watch tariff refund'],
        'answer': 'The IEEPA duties — the 10%, 39% and 15%-in-total rates on Swiss watches in 2025–2026 — are being refunded. Since April 20, '
        '2026 the importer of record (or its broker) can file a CAPE Declaration in ACE listing the entries, and CBP refunds the IEEPA duty '
        'with interest. The Section 122 surcharge and the Section 301 duties are not refunded. A consumer who bought from a retailer is not '
        'the importer of record.',
        'link': 'tariff-updates',
    },
    {
        'id': 'japan',
        'question': 'What is the tariff on watches from Japan?',
        'searchedAs': ['tariff on watches from japan', 'tariff on watches from japan to usa', 'watch tariffs from japan', 'us tariff on watches from japan',
                       'what is the current tariff on watches from japan', 'are there tariffs on watches from japan', 'tariff on swiss watches from japan'],
        'answer': 'Japanese watches pay 12.5% of their value in total (9903.05.49): a $200 quartz watch pays $25. What counts is the watch\'s '
        'origin — the country where its movement was assembled — not where it was bought or shipped from, so a Swiss watch bought in Japan '
        'still pays the Swiss rate (also 12.5%), and a watch with a Japanese movement cased in China is Japanese.',
        'link': 'industry-areas',
    },
    {
        'id': 'china',
        'question': 'What is the tariff on watches from China?',
        'searchedAs': ['tariff on watches from china', 'china tariff on clocks and watches', 'section 301 watch list'],
        'answer': 'Most Chinese watches pay the base rate + 12.5% (2026 Section 301) + 7.5% (List 4A): $46.11 on a $200 quartz watch with hands. '
        'Chinese time switches, time recorders and instrument-panel clocks pay the base rate + 12.5% + 25% (List 3). Some alarm and wall '
        'clocks and metal watch bands are on neither list and pay the base rate + 12.5%. The 2025 IEEPA duties (up to 145%) have ended.',
        'link': 'industry-areas',
    },
    {
        'id': 'hong-kong',
        'question': 'What is the tariff on watches from Hong Kong?',
        'searchedAs': ['tariff on watches from hong kong', 'us tariff on 6500 watch from hong kong'],
        'answer': 'A watch of Hong Kong origin pays the base rate + 12.5% (9903.05.43); Hong Kong goods are not on the China Section 301 '
        'lists. But origin is where the movement was assembled: a Swiss watch bought from a Hong Kong dealer pays the Swiss rate, 12.5% of value '
        '— $812.50 on a $6,500 watch — and a watch with a Chinese movement pays the China rate.',
        'link': 'industry-areas',
    },
    {
        'id': 'exempt',
        'question': 'Are watches exempt from tariffs?',
        'searchedAs': ['are watches exempt from tariffs', 'are swiss watches exempt from tariffs', 'are watches subject to tariffs',
                       'are swiss watches subject to tariffs'],
        'answer': 'No. No watch, clock or part is on the Section 301 general exemption list or on any country\'s exception list; the only '
        'Chapter 91 goods exempted are instrument-panel clocks and clock movements for civil aircraft. Watches were not exempt from the 2025 '
        'reciprocal tariff or the 2026 Section 122 surcharge either. Goods from countries outside the 60 Section 301 economies, and '
        'USMCA-qualifying goods, pay only the base rate.',
        'link': 'tariff-updates',
    },
    {
        'id': 'used',
        'question': 'Do used or pre-owned watches pay tariffs?',
        'searchedAs': ['are used watches subject to tariffs', 'tariff on used watches from japan'],
        'answer': 'Yes. A used watch is classified and charged like a new one — its origin is still where the movement was assembled, so a '
        'pre-owned Swiss watch bought in Japan pays 12.5% of its value. A watch exported from the U.S. and returned unchanged within 3 years '
        'can enter Free (9801.00.10), and a watch sent abroad for repair pays duty only on the repair (9802.00.40 or 9802.00.50).',
        'link': 'tariff-engineering',
    },
    {
        'id': 'calculate',
        'question': 'How is import duty on a watch calculated?',
        'searchedAs': ['watch import duty calculator usa', 'watch import duty calculator', 'watch tariff calculator', 'swiss watch tariff calculator',
                       'watch import duty usa', 'watch customs duty usa', 'customs duty on watches'],
        'answer': 'Most watch rates are compound: a charge per movement (for example $1.53) plus a percentage of the case value, of the strap '
        'value and, for quartz watches, of the battery value. The entry lists each component on its own statistical suffix with its value '
        '(statistical note 1). Then the country rule applies: Swiss and Japanese watches pay 12.5% of the whole value if that is more than the '
        'base rate, EU watches 10%; others pay the base rate plus their Section 301 rate. The KoalaGains tariff calculator asks for the value '
        'of each component on its statistical-note-1 number and prices the total. Since de minimis is suspended, every watch shipped from '
        'abroad pays.',
        'link': '',
    },
    {
        'id': 'hts-watches',
        'question': 'What is the HTS code for watches?',
        'searchedAs': ['hts code for watches', 'hs code for watches', 'harmonized tariff code for watches', 'hs code for wrist watches',
                       'hts code for luxury watches', 'hts 9102.21', 'hts 9101', 'hts code 9102'],
        'answer': 'Wrist and pocket watches are heading 9101 if the case is wholly of precious metal and 9102 otherwise. The next digits '
        'depend on the movement (electric with hands 9101.11/9102.11, digital 9101.19/9102.12, automatic 9101.21/9102.21, manual 9101.29/9102.29), '
        'the jewels, the movement size and value and the strap material. A steel automatic with over 17 jewels and a steel bracelet is '
        '9102.21.70; with a rubber or leather strap 9102.21.90; with a gold case 9101.21.',
        'link': '',
    },
    {
        'id': 'hts-straps',
        'question': 'What is the HS code for a watch strap or band?',
        'searchedAs': ['hs code for watch strap', 'hs code for watch band', 'watch strap tariff code', 'hs code for leather watch strap',
                       'hs code for rubber watch strap', 'watch strap tariff'],
        'answer': 'A strap entered with its watch is classified with the watch. On its own it is heading 9113: precious metal 9113.10 (4.5%), '
        'base-metal bracelets 9113.20 (11.2%), textile straps 9113.90.40 (7.2%) and leather, rubber and other straps 9113.90.80 (1.8%). The '
        'Section 301 rate for the country is added (Swiss and Japanese 12.5% in total).',
        'link': '',
    },
    {
        'id': 'hts-parts',
        'question': 'What is the HS code for watch parts and movements?',
        'searchedAs': ['watch parts hs code', 'hs code for watch parts', 'watch parts tariff code', 'hs code for watch case', 'hs code for watch battery',
                       'hs code for clock movements'],
        'answer': 'Complete watch movements are 9108, clock movements 9109, movement sets and incomplete movements 9110, watch cases 9111, clock '
        'cases 9112 and other parts — dials, plates, springs, jewels, hands — 9114. A battery entered with a watch or movement goes with it; '
        'otherwise it is heading 8506 or 8507.',
        'link': '',
    },
    {
        'id': 'smartwatch',
        'question': 'What is the HS code for a smartwatch or Apple Watch?',
        'searchedAs': ['smartwatch hs code', 'hs code for apple watch', 'smartwatch tariff code', 'smart watch tariff classification', 'apple watch tariff code'],
        'answer': 'Smartwatches are not Chapter 91. CBP classifies them as apparatus for the transmission or reception of data, 8517.62.00.90 '
        '(NY N349122, Free base rate), so the Chapter 91 watch rates and marking rules do not apply; the country\'s Section 301 rate does.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'hts-clocks',
        'question': 'What is the HS code for clocks?',
        'searchedAs': ['hs code for clocks', 'hts code for clock', 'hs code for wall clock', 'wall clock hs code', 'alarm clock hs code',
                       'cuckoo clock hs code', 'hs code for digital clock'],
        'answer': 'Alarm clocks are 9105.11–9105.19, wall clocks 9105.21–9105.29 and other clocks (including cuckoo, mantel and table clocks) '
        '9105.91–9105.99; clocks built on a watch movement are 9103 and vehicle or aircraft dashboard clocks 9104. Rates are per clock plus a '
        'percentage of the case and battery values.',
        'link': '',
    },
]
