# Overview + tariff-updates pages (exec'd from fill91.py).

SHORT = 'Watches, Clocks & Parts'

# ---------------------------------------------------------------------------------------------------
# Shared phrases
# ---------------------------------------------------------------------------------------------------
EX_AIR = (
    'Only one exemption list names Chapter 91 lines: civil-aircraft goods that meet general note 6 (note 52(d), 9903.05.88), which covers '
    'instrument-panel clocks of 9104.00.05–9104.00.60 and clock movements of 9109.10.50, 9109.10.60 and 9109.90.20. No Chapter 91 line is '
    'on the general exemption list (note 52(b)) or on any country exception list in note 52(j).'
)
AVE = (
    'Under note 52(k) the ad valorem equivalent of a compound watch rate is the base-rate duty divided by the customs value. For nearly '
    'every watch it is well below that figure (a $5,000 steel automatic watch owes $66.53 at the base rate, 1.3%), so the watch pays the '
    'flat percentage of its whole value.'
)
IEEPA_END = 'The IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge ran from February 24 to July 23, 2026.'
CN_LISTS = (
    'The 2018–2019 China lists add +7.5% (List 4A, 9903.88.15) on most watches, watch and clock movements, cases, straps and parts, or +25% '
    '(List 3, 9903.88.03) on instrument-panel clocks (9104.00.05–9104.00.50), time recorders, parking meters and interval timers (9106) and '
    'time switches (9107). Some lines are on neither list: battery and opto-electronic alarm, wall and other clocks (9105.11, 9105.21, '
    '9105.91, 9105.19.40, 9105.29.40, 9105.99.50), clocks with watch movements of 9103.10.20/.40, quartz digital watch movements '
    '(9108.12.00), several clock movements (9109.10.10, .30, .60, .70, 9109.90.40), metal and textile watch bands (9113.20.20, 9113.20.40, '
    '9113.90.40) and a few others.'
)

# ---------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------
o = d['overview']
o['h1'] = 'HTS Chapter 91: Watches, Clocks and Parts — Tariff Rates'
o['seo'] = {
    'title': 'HTS Chapter 91 Tariffs 2026: Watch & Clock Import Duty Rates — Swiss, Japan, China | KoalaGains',
    'shortDescription': f'Searchable 2026 U.S. tariff table for every HTS Chapter 91 line: wrist watches, clocks, movements, cases, straps '
    f'and parts. Watch base rates are compound (per movement + % on the case, strap and battery); since July 24, 2026 Swiss and Japanese '
    f'watches pay 12.5% of value in total, EU watches 10%, Chinese watches the base rate + 20%.',
    'keywords': [
        'hts chapter 91',
        'clocks and watches and parts thereof tariff',
        'clocks and watches and parts thereof import duty rates',
        'switzerland watch import duty',
        'swiss watch tariff',
        'watch import duty usa',
        'hts code for watches',
        'hts 9102.11 import duty',
        'hts 9102.21',
        'hts 9104 instrument panel clocks',
        'tariff on watches from japan',
    ],
}
o['intro'] = (
    f'Chapter 91 covers **wrist and pocket watches** (9101 with a case of precious metal, 9102 all others), **clocks** (9103–9105), time '
    f'recorders and parking meters (9106), time switches (9107), **watch and clock movements** (9108–9110), cases (9111–9112), **watch '
    f'straps and bracelets** (9113) and other parts (9114). Of its {N_ALL} rate lines, {N_FREE} are Free and {N_COMPOUND} carry a '
    f'**compound rate**: a charge per movement plus percentages on the **case**, the **strap, band or bracelet** and the **battery**, each '
    f'on its own value. A steel automatic watch with over 17 jewels and a steel bracelet (9102.21.70) pays $1.53 + 4.2% of the case value '
    f'+ 9.8% of the bracelet value. Many mechanical watches with gold or platinum cases (9101.21.50, 9101.29.90, 9101.91 and most of 9101.99) are Free.\n\n'
    f'The U.S. imported **{fmt_usd(T25)}** of Chapter 91 goods in {LY}, {abs(pct(T25, T24)):.1f}% less than in {PY}. '
    f'**Switzerland** supplied {fmt_usd(SWISS)} ({SWISS_SHARE:.1f}%), almost all of it watches, ahead of Japan '
    f'({fmt_usd(ct("Japan"))}) and China ({fmt_usd(ct("China"))}). Watches (9101 and 9102) were {WATCH_SHARE:.0f}% of the total.\n\n'
    f'Since **July 24, 2026** the Section 301 tariff on 60 economies applies by country. **Swiss and Japanese** goods pay **12.5% in total** '
    f'where their base rate is lower, and **EU and Taiwanese** goods pay **10% in total**. For a compound watch rate this means a flat '
    f'12.5% or 10% of the watch\'s value (note 52(k)). Thailand, Vietnam, the Philippines, Singapore and Hong Kong pay the base rate '
    f'**+12.5%**; the UK, India, Malaysia and non-USMCA goods of Mexico and Canada pay **+10%**. **China** pays the base rate + 12.5% '
    f'plus the 7.5% List 4A duty on most watches and parts, or the 25% List 3 duty on instrument-panel clocks, time recorders and time '
    f'switches. USMCA-qualifying goods pay nothing. The IEEPA duties (39% on Swiss goods from August 7, 2025, then 15% in total) ended '
    f'**February 24, 2026**, and the 10% Section 122 surcharge ended July 23, 2026. No Section 232 duty and no antidumping or '
    f'countervailing duty order covers a Chapter 91 product.'
)
GROUP_TEXT = {
    '9101': (
        'Watches with a case wholly of gold, silver, platinum or metal clad with precious metal (chapter note 2). Electric watches with hands '
        'pay a compound rate (41¢–87¢ + 4.4%–6.25% on case and strap + 3.7%–5.3% on the battery); mechanical watches with over 17 jewels and most '
        'pocket watches are Free, their straps 3.1%.',
        ['gold watch', 'gold rolex', 'platinum watch', 'precious metal watch', 'luxury watch', 'automatic watch', 'pocket watch', 'gold case watch'],
    ),
    '9102': (
        'Watches with a case of steel, titanium, ceramic, plastic or any other material that is not precious metal. Almost every line is '
        'compound: a charge per movement, plus percentages on the case, the strap, band or bracelet and the battery. 9102.21 (automatic) and '
        '9102.11 (quartz with hands) are the largest lines.',
        ['stainless steel watch', 'automatic watch', 'quartz watch', 'analog watch', 'digital watch', 'dive watch', 'chronograph', 'seiko', 'swiss watch'],
    ),
    '9103': (
        'Clocks built around a watch movement, such as small travel and desk clocks, other than vehicle clocks. Compound rates on the movement, '
        'case and battery.',
        ['travel clock', 'desk clock with watch movement', 'small clock'],
    ),
    '9104': (
        'Instrument-panel clocks for cars, aircraft, spacecraft and vessels. Compound rates; on China List 3 (25%) except 9104.00.60. '
        'Civil-aircraft clocks meeting general note 6 are exempt from the 2026 Section 301 duty.',
        ['dashboard clock', 'car clock', 'aircraft clock', 'marine clock', 'instrument panel clock'],
    ),
    '9105': (
        'Alarm clocks, wall clocks and other clocks, including marine chronometers. Mostly per-clock + % on the case (and battery).',
        ['alarm clock', 'wall clock', 'cuckoo clock', 'grandfather clock', 'mantel clock', 'table clock', 'digital clock', 'marine chronometer'],
    ),
    '9106': (
        'Time clocks for employees, parking meters, time locks and interval timers with a clock or watch movement or a synchronous motor. '
        'China List 3 (25%).',
        ['time clock', 'time recorder', 'punch clock', 'parking meter', 'kitchen timer', 'interval timer'],
    ),
    '9107': (
        'Time switches with a clock movement or synchronous motor, such as appliance and lighting timers. Mostly from Mexico, Free under '
        'USMCA; China List 3 (25%).',
        ['time switch', 'timer switch', 'appliance timer', 'defrost timer', 'lighting timer'],
    ),
    '9108': (
        'Complete, assembled watch movements (12 mm thick and 50 mm wide at most). Per-movement rates of 25¢–$2.16, plus % on the battery for '
        'quartz; automatic movements are Free.',
        ['watch movement', 'quartz movement', 'automatic movement', 'miyota movement', 'eta movement', 'caliber'],
    ),
    '9109': (
        'Complete, assembled clock movements. Per-movement rates, plus % on the movement or battery for the larger ones.',
        ['clock movement', 'quartz clock movement', 'clock mechanism', 'pendulum movement'],
    ),
    '9110': (
        'Movement sets (unassembled), incomplete and rough movements, and movement parts fastened together. A movement set pays the rate of '
        'the complete movement; incomplete or rough watch movements 9%.',
        ['movement kit', 'ebauche', 'rough movement', 'incomplete movement'],
    ),
    '9111': (
        'Watch cases and their parts (bezels, backs, centers). Gold or silver cases 12¢ + 4.8%; base-metal cases up to 3.6¢ + 7.6%.',
        ['watch case', 'case back', 'bezel', 'gold watch case'],
    ),
    '9112': ('Clock cases and their parts. 3.5% (metal) to 5.5%.', ['clock case', 'clock housing']),
    '9113': (
        'Watch straps, bands and bracelets imported on their own (with the watch they go to 9101/9102). Precious metal 4.5%, base metal '
        '11.2% (parts 8.8%), textile 7.2%, leather, rubber and other 1.8%.',
        ['watch strap', 'watch band', 'watch bracelet', 'leather watch strap', 'rubber watch strap', 'nato strap', 'apple watch band'],
    ),
    '9114': (
        'Other clock and watch parts: dials, plates and bridges, jewels (Free), springs and hairsprings, assemblies, hands and crowns.',
        ['watch dial', 'watch hands', 'watch crown', 'mainspring', 'hairspring', 'watch jewels', 'watch parts', 'clock parts'],
    ),
}
for g in o['productGroups']:
    g['blurb'], g['searchExamples'] = GROUP_TEXT[g['heading']]
# Shorter rate summaries: the compound watch rates are too long for a tile.
for g in o['productGroups']:
    grp = [r for r in ALL_LINES if r['heading'] == g['heading']]
    rates = list(dict.fromkeys(r['effectiveGeneral'] for r in grp))
    simple = [x for x in rates if len(x) <= 28 and ' on the ' not in x][:4]
    parts = list(simple)
    if any(' on the ' in x for x in rates):
        parts.append('compound: per piece + % on movement, case, strap or battery')
    elif any(x.startswith('The rate applicable') for x in rates):
        parts.append('movement sets at the complete movement\'s rate')
    elif len(simple) < len(rates):
        parts.append('…')
    g['rateSummary'] = ' · '.join(parts)

for s in o['stats']:
    if s['label'] == 'Tariff lines':
        s['note'] = 'Compound watch and clock lines are listed under their first statistical-note-1 number (e.g. 9102.21.90 as 9102.21.9010)'
    elif s['label'] == 'Lines with a base-rate duty':
        pass
    elif s['label'] == 'Lines with an extra duty for some origins':
        s['note'] = 'Section 301 (2026, 60 economies) and Brazil: every line (civil-aircraft clocks exempt); China List 3 or 4A: most lines; USMCA goods exempt'

o['workedExamples'] = [
    {
        'title': 'Swiss steel automatic watch on a rubber strap',
        'line': '9102.21.90',
        'body': 'A $5,000 automatic watch with a stainless-steel case and over 17 jewels; the case is worth $1,500 and the strap $100. '
        'The base rate is $1.53 for the movement + 4.2% of the case ($63) + 2% of the strap ($2) = **$66.53**. The entry reports the movement, '
        'case and strap on their own statistical suffixes (9102.21.9010, .9020, .9030) with their values, as CBP ruled for this line in NY '
        'N362026; the tariff calculator takes the same component values. That is 1.3% of the value, below 12.5%, so for a Swiss watch heading 9903.05.74 replaces it: **12.5% × $5,000 = $625**. The '
        'same watch pays $625 from Japan, $500 from Germany (10% in total), $566.53 from the UK (base + 10%) and $1,066.53 from China (base + '
        '12.5% + 7.5%). Before 2025 it paid $66.53. From August 7 to November 13, 2025 it paid $2,016.53 (base + 39%), then $750 (15% in total) '
        'until February 23, 2026, then $566.53 (base + 10% Section 122) until July 23, 2026.',
    },
    {
        'title': 'Swiss gold automatic watch',
        'line': '9101.21.50',
        'body': 'A $30,000 automatic watch with an 18-karat gold case and over 17 jewels: the watch line is **Free**, and its strap, '
        'reported separately (9101.21.10 or 9101.21.30), pays 3.1%. Both are below 12.5%, so a Swiss watch pays **12.5% of $30,000 = $3,750** '
        '(9903.05.74). From Japan it is also $3,750, from the EU $3,000 and from China $6,000 (12.5% + 7.5%).',
    },
    {
        'title': 'Japanese quartz analog watch',
        'line': '9102.11.45',
        'body': 'A $200 battery watch with hands, a steel case worth $60, a leather strap worth $20 and a $1 battery. The base rate is 40¢ + '
        '8.5% of the case ($5.10) + 2.8% of the strap ($0.56) + 5.3% of the battery ($0.05) = **$6.11** (3.1%). Japan pays **12.5% in total = '
        '$25** (9903.05.49). The same watch pays $46.11 from China ($6.11 + $25 + $15 List 4A), $31.11 from Thailand, Vietnam or Hong Kong, '
        '$26.11 from the UK or non-USMCA Mexico, $20 from the EU and nothing if it qualifies for USMCA.',
    },
    {
        'title': 'Watch movement sets and movement parts from China',
        'line': '9110.11.00.00',
        'body': 'Unassembled movement sets pay **"the rate applicable to the complete, assembled movement"**, so the importer names the '
        'movement line. For 100 sets of a 17-plus-jewel movement (9108.90.90, $1.50 each), worth $5,000, the base is $150; China adds 12.5% '
        '($625) and 7.5% List 4A ($375): **$1,150**. Movement parts fastened together (9110.90.40) pay 4.3% + 1.7¢ per jewel + 0.2¢ per other '
        'piece: $2,000 of parts with 1,700 jewels and 5,000 other pieces owe $124.90. If the parts include a plate, the duty is capped at '
        'the duty on the complete movement, for example $29 for 100 movements of 9108.90.10 (29¢ each).',
    },
    {
        'title': 'Mexican time switches under USMCA',
        'line': '9107.00.40.40',
        'body': f'Time switches (9107) were Mexico\'s main Chapter 91 export to the U.S. ({fmt_usd(HC.get(("Mexico", "9107"), 0))} in {LY}). '
        'They pay 15¢ each + 4% + 2.5¢ per jewel, and +10% under Section 301 (9903.05.55), unless they qualify for USMCA. A qualifying '
        'switch enters **Free** with no Section 301 duty (9903.05.94). The same switch from China pays the base rate + 12.5% + 25% (List 3).',
    },
]
o['tradeSnapshot']['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance) as reported by the United States to UN Comtrade for calendar {LY}, before '
    f'the 2026 tariff changes.'
)

NOTES_CH = (
    '**Note 1.** This chapter does not cover: (a) clock or watch glasses or weights (classified by material); (b) watch chains (heading 7113 '
    'or 7117); (c) parts of general use of base metal (section XV), similar goods of plastics (chapter 39) or of precious metal (generally '
    'heading 7115) — clock or watch springs are, however, classified in heading 9114; (d) bearing balls (7326 or 8482); (e) articles of '
    'heading 8412 constructed to work without an escapement; (f) ball bearings (8482); or (g) articles of chapter 85 not yet assembled into '
    'watch or clock movements or into parts suitable solely or principally for them.\n\n'
    '**Note 2.** Heading 9101 covers only watches with case wholly of precious metal or of metal clad with precious metal, or of those '
    'materials combined with natural or cultured pearls or precious or semiprecious stones of headings 7101 to 7104. Watches with case of '
    'base metal inlaid with precious metal fall in heading 9102.\n\n'
    '**Note 3.** "Watch movements" means devices regulated by a balance wheel and hairspring, quartz crystal or any other system capable of '
    'determining intervals of time, with a display or a system to which a mechanical display can be incorporated, not exceeding 12 mm in '
    'thickness and 50 mm in width, length or diameter.\n\n'
    '**Note 4.** Except as provided in note 1, movements and other parts suitable for use both in clocks or watches and in other articles '
    '(for example, precision instruments) are classified in this chapter.'
)
NOTES_US = (
    '**1.** Definitions: "watches" are timepieces of a kind for wearing or carrying on the person (a timepiece with a stand is not a watch); '
    '"cases" include inner and outer cases and their parts; "jewels" include substitutes for jewels; "clock movements" exceed 12 mm in '
    'thickness or 50 mm in width; and the note defines movement sets, incomplete movements and rough movements.\n\n'
    '**2.** Straps, bands and bracelets entered with wrist watches and of a kind normally sold with them are classified with the watch in '
    '9101 or 9102; otherwise in heading 9113.\n\n'
    '**3.** Batteries entered with battery-powered watches, clocks or movements, and intended for use with them, are classified with the '
    'watch, clock or movement; otherwise in heading 8506 or 8507.\n\n'
    '**4. Special marking requirements.** Any movement or case, imported separately or in a watch or clock, may not be entered unless '
    'conspicuously and indelibly marked by cutting, die-sinking, engraving, stamping or mold-marking: watch movements on a bridge or top '
    'plate with the country of manufacture, the name of the manufacturer or purchaser and, in words, the number of jewels; clock movements '
    'with the country, the manufacturer or purchaser and the number of jewels; watch cases inside or outside the back with the country and '
    'the manufacturer or purchaser; clock cases on the back with the country. Movements with opto-electronic display only, and their '
    'cases, are excepted.\n\n'
    '**5. Products of insular possessions.** Watches and watch movements assembled in the U.S. Virgin Islands, Guam or American Samoa may '
    'enter free of duty regardless of foreign content, within annual quantities and licenses set jointly by the Secretaries of Commerce '
    'and the Interior (15 CFR part 303), unless they contain material of a column 2 country.\n\n'
    '**Statistical note 1.** Duties on many watches, clocks and movements are calculated by constructively separating the article into '
    'its components, each separately valued and reported under its own statistical suffix (for example movement 10, case 20, strap, band '
    'or bracelet 30, battery 40); the component values must add up to the value of the article, and a component that is not in the '
    'shipment is reported with zero quantity and value.'
)
o['notes'] = {'chapterNotes': NOTES_CH, 'additionalUsNotes': NOTES_US}

# ---------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['h1'] = 'HTS Chapter 91: Watches, Clocks and Parts — Tariff Updates'
tu['seo'] = {
    'title': 'Swiss Watch Tariff 2026 & HTS Chapter 91 Tariff Updates: Section 301, IEEPA End, Japan & China Rates | KoalaGains',
    'shortDescription': 'What changed for U.S. watch and clock imports since January 2025: the Swiss 39% reciprocal tariff and the 15% deal '
    'rate (ended February 24, 2026), the 10% Section 122 surcharge (ended July 23), and since July 24, 2026 the Section 301 rates — Swiss and '
    'Japanese watches 12.5% in total, EU 10%, China base + 20% — with Federal Register citations.',
    'keywords': [
        'hts chapter 91',
        'clocks and watches and parts thereof tariff',
        'switzerland tariff on clocks and watches and parts thereof',
        'swiss watch tariff update',
        '39 tariff on swiss watches',
        'swiss watch tariff reduction',
        'swiss watch tariff refund',
        'china section 301 watch tariffs',
        'watch tariffs from japan',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current '
    '**2026 Revision 21** (in force October 9, 2026). **No Chapter 91 base rate changed**, so the compound watch rates (a charge per movement '
    'plus percentages on the case, strap and battery) are the same as before 2025.\n\n'
    'Everything that changed sits on top. In 2025 the IEEPA reciprocal tariff hit watches with no exemption: **Swiss watches paid 39% on '
    'top of the base rate from August 7, 2025**, cut to **15% in total from November 14, 2025** under the U.S.–Switzerland framework. Japanese '
    'and EU watches paid 15% in total, and Chinese watches up to 125% + 20% for five weeks in spring 2025. The IEEPA duties **ended on '
    'February 24, 2026**. The 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026** a **Section 301 '
    'tariff** applies by country: Swiss and Japanese watches pay **12.5% of value in total**, EU and Taiwanese ones 10%; Thailand, Vietnam, the '
    'Philippines, Singapore and Hong Kong add 12.5% to the base rate, the UK, India, Malaysia and non-USMCA goods of Mexico and Canada 10%. '
    'China still adds the List 4A (7.5%) or List 3 (25%) duty on top of its 12.5%.'
)
tu['scope'] = (
    'Measures that reach Chapter 91 from any country: the 2026 Section 301 tariffs on 60 economies and their exemption lists, the Brazil '
    'Section 301 tariff, the China Section 301 List 3 and List 4A duties, and the 2025–2026 IEEPA and Section 122 duties that have ended. The '
    'de minimis suspension, the IEEPA refund process and the scheduled Nicaragua tariff are listed for reference. No Section 232 duty, no '
    'Canada Section 338 list and no antidumping or countervailing duty order covers a Chapter 91 product. For the rate each supplier pays, see '
    'Rates by country.'
)

IE = {
    'ch-section-301': (
        f'Swiss goods pay 12.5% in total where the base rate is below 12.5% (9903.05.74), and only the base rate where it is 12.5% or more '
        f'(9903.05.73). {AVE} {EX_AIR} Switzerland\'s exception list (note 52(j)(3), 9903.05.98) names no watch, clock or part. The 39% IEEPA '
        f'rate of August 7, 2025 (15% in total from November 14, 2025) ended February 24, 2026.',
        'A Swiss watch pays 12.5% of its value whatever its jewels, case or strap: $625 on a $5,000 steel automatic, $3,750 on a $30,000 gold '
        'one. Swiss watch movements, straps and parts pay 12.5% too.',
    ),
    'jp-section-301': (
        f'Japanese goods pay 12.5% in total where the base rate is below 12.5% (9903.05.49). {AVE} {EX_AIR} The 15%-in-total IEEPA rate ended '
        f'February 24, 2026.',
        'A $200 Japanese quartz watch pays $25 (12.5%); a $1,000 automatic $125. Japanese watch movements pay 12.5% of their value.',
    ),
    'cn-section-301': (
        f'Two Section 301 actions stack. The 2026 action adds +12.5% (9903.05.31). {CN_LISTS} USTR kept the lists after its 2026 review, and '
        f'none of the product exclusions still in force (note 20(vvv), (www)) names a Chapter 91 product. {EX_AIR} The IEEPA duties (up to '
        f'125% + 20% in 2025) ended February 24, 2026.',
        'A Chinese quartz watch pays the base rate + 20% ($46.11 on a $200 watch); a steel automatic $1,066.53 on $5,000; a time switch or '
        'instrument-panel clock the base rate + 37.5%; an alarm clock or metal watch band the base rate + 12.5%.',
    ),
    'eu-section-301': (
        f'EU goods pay 10% in total where the base rate is below 10% (9903.05.39). {AVE} {EX_AIR} The EU exception list (note 52(j)(2), '
        f'9903.05.97) names no Chapter 91 line. The 15%-in-total IEEPA rate ended February 24, 2026.',
        'A German or French watch pays 10% of its value ($500 on $5,000); EU wall clocks and parts 10% too.',
    ),
    'mx-section-301': (
        f'Non-USMCA goods pay +10% (9903.05.55); USMCA-qualifying goods are exempt (9903.05.94). {EX_AIR} The 25% IEEPA duty on non-USMCA '
        f'goods ended February 24, 2026.',
        'Mexican time switches and clocks that qualify for USMCA enter Free; non-qualifying ones pay the base rate + 10%.',
    ),
    'th-section-301': (
        f'Base rate + 12.5% (9903.05.77). {EX_AIR} The 19% IEEPA rate ended February 24, 2026.',
        'A $200 Thai quartz watch pays $31.11 ($6.11 base + $25).',
    ),
    'sg-section-301': (
        f'Base rate + 12.5% (9903.05.68), even when the U.S.–Singapore FTA rate (SG) is claimed. {EX_AIR}',
        'Watches from Singapore pay 12.5% under the FTA, the base rate + 12.5% without it.',
    ),
    'ph-section-301': (
        f'Base rate + 12.5% (9903.05.64). {EX_AIR} The 19% IEEPA rate ended February 24, 2026.',
        'A Philippine quartz watch pays the base rate + 12.5%; CBP treats a watch whose movement is assembled there as Philippine (NY N351984).',
    ),
    'ca-section-301': (
        f'Non-USMCA goods pay +10% (9903.05.29); USMCA-qualifying goods are exempt (9903.05.93). {EX_AIR} No Chapter 91 line is on the Canada '
        f'Section 338 lists (note 51(b)). The IEEPA duty on non-USMCA goods (25%, then 35%) ended February 24, 2026.',
        'Canadian clocks and watch cases that qualify for USMCA enter Free; others pay the base rate + 10%.',
    ),
    'vn-section-301': (
        f'Base rate + 12.5% (9903.05.84). {EX_AIR} The 20% IEEPA rate ended February 24, 2026.',
        'Vietnamese watch bands (9113) pay 23.7% (11.2% + 12.5%) if of base metal.',
    ),
    'gb-section-301': (
        f'Base rate + 10% (9903.05.81). {EX_AIR} The UK exception list (note 52(j)(1), 9903.05.96) names no Chapter 91 line. The 10% IEEPA '
        f'rate ended February 24, 2026.',
        'A $5,000 British steel automatic watch pays $566.53 ($66.53 + $500).',
    ),
    'my-section-301': (
        f'Base rate + 10% (9903.05.54). {EX_AIR} Malaysia\'s exception lists (9903.05.99, 9903.06.01) name no Chapter 91 line. The 19% IEEPA '
        f'rate ended February 24, 2026.',
        'A Malaysian watch pays the base rate + 10%; a Malaysian-assembled movement makes the watch Malaysian.',
    ),
    'tw-section-301': (
        f'Taiwanese goods pay 10% in total where the base rate is below 10% (9903.05.76). {AVE} {EX_AIR} Taiwan\'s exception lists '
        f'(9903.06.14, 9903.06.15) name no Chapter 91 line. The 20% IEEPA rate ended February 24, 2026.',
        'A Taiwanese watch or clock pays 10% of its value.',
    ),
    'hk-section-301': (
        f'Base rate + 12.5% (9903.05.43). {EX_AIR} Hong Kong goods are not on the China Section 301 lists. The IEEPA duties that applied to '
        f'China and Hong Kong ended February 24, 2026.',
        'A $200 Hong Kong quartz watch pays $31.11; the same watch from China $46.11.',
    ),
    'in-section-301': (
        f'Base rate + 10% (9903.05.44). {EX_AIR} The IEEPA duties (25%, then 50% from August 27, 2025) ended in February 2026.',
        'An Indian watch pays the base rate + 10%.',
    ),
    'br-section-301': (
        f'Two Section 301 actions: +25% on all goods of Brazil (9903.05.01) since July 22, 2026, and +12.5% (9903.05.27) since July 24. '
        f'Civil-aircraft clocks and clock movements are exempt from both (9903.05.05, 9903.05.88); the Brazil product list (note 50(a)(ii)) '
        f'names no other Chapter 91 line. The 50% IEEPA rate ended February 24, 2026.',
        'A Brazilian watch pays the base rate + 37.5%.',
    ),
    'other-section-301': (
        f'The other economies on the list pay +10% or +12.5%, or 12.5% in total for South Korea (9903.05.71) (9903.05.20–9903.05.84). '
        f'{EX_AIR} Countries outside the 60 pay only the base rate; Russia and Belarus pay column 2 rates (for example $3.25 each + 45% on the '
        f'case + 80% on the strap for 9101.11.80).',
        'Korean watches pay 12.5% in total; Indonesian ones the base rate + 12.5%; watches from a country not on the list only the base rate.',
    ),
}
for e in tu['inEffect']:
    e['exemption'], e['whatItMeans'] = IE[e['id']]
    if e['id'] == 'other-section-301':
        e['country'] = 'Other Section 301 economies'
    if e['id'] not in ('sg-section-301', 'other-section-301') and 'eo-14389' not in e['sourceIds']:
        e['sourceIds'].insert(-1, 'eo-14389')
    if e['id'] == 'cn-section-301':
        e['before'] = '+7.5% or +25%'
        e['now'] = '+20% or +37.5% or +12.5%'
    if e['id'] == 'ph-section-301':
        e['sourceIds'].insert(-1, 'cbp-n351984')

CHANGES = {
    'base-rates': {
        'title': 'No Chapter 91 base rate changed',
        'detail': f'All {N_ALL} Chapter 91 rate lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 '
        f'Basic Edition, including the compound watch rates on the movement, case, strap and battery and the 9110 "rate applicable to the '
        f'complete, assembled movement".',
        'sourceIds': ['hts-before', 'hts-now', 'hts-now-cr', 'hts-ch91'],
    },
    'section-301-2026-60-economies-2026-07-24': {
        'title': 'Section 301 tariffs on 60 economies — Swiss and Japanese watches 12.5% in total',
        'detail': 'Every Chapter 91 line from the 60 listed economies pays the duty (9903.05.20–9903.05.84); only civil-aircraft clocks and '
        'clock movements are exempt (note 52(d)). Switzerland and Japan pay 12.5% in total and the EU and Taiwan 10% in total where the base '
        'rate is lower — for a compound watch rate, measured by its ad valorem equivalent (note 52(k)). Thailand, Vietnam, the Philippines, '
        'Singapore and Hong Kong pay +12.5%; the UK, India, Malaysia, Mexico and Canada +10%. USMCA-qualifying goods are exempt (9903.05.93, '
        '9903.05.94). China pays +12.5% on top of its List 3 or 4A duty.',
        'sourceIds': ['fr-2026-15181', 'fr-2026-15274', 'csms-69326983', 'hts-chapter-99', 'hts-now'],
    },
    'section-301-brazil-2026-07-22': {
        'title': 'Section 301 tariff on products of Brazil',
        'detail': '25% on all goods of Brazil (9903.05.01), civil-aircraft goods excepted (9903.05.05). From July 24 the 12.5% tariff '
        '(9903.05.27) is added on top. Brazil supplied little Chapter 91 trade in 2025.',
    },
    'section-301-nicaragua-scheduled-2027-01-01': {
        'title': 'Scheduled: Section 301 tariff on products of Nicaragua',
        'detail': 'Products of Nicaragua that pay the column 1-general rate (that is, not entered under CAFTA-DR) will pay +10% (9903.89.01) '
        'from January 1, 2027 and +15% from January 1, 2028, on every Chapter 91 line. Today Nicaragua pays the 12.5% 2026 Section 301 duty '
        '(9903.05.58).',
    },
}
for c in tu['changes']:
    if c['id'] in CHANGES:
        for k, v in CHANGES[c['id']].items():
            c[k] = v

NEW_CHANGES = [
    {
        'id': 'cn-301-continue', 'type': 'reference', 'date': '2026-10-07', 'dateLabel': 'Published',
        'title': 'China Section 301 lists continue after the four-year review',
        'detail': 'USTR announced that the 2018–2019 China Section 301 actions did not terminate on their 2026 anniversaries. For Chapter 91 '
        'this keeps +7.5% (List 4A) on most Chinese watches, movements, cases, straps and parts, and +25% (List 3) on instrument-panel clocks, '
        'time recorders and time switches.',
        'before': '+7.5% or +25%', 'now': '+7.5% or +25%', 'countries': 'China', 'sourceIds': ['fr-2026-20510'],
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
        'resolution of the issues or until termination, so USMCA claims (SPI S) still remove the base rate and the Section 301 duty on '
        'Mexican and Canadian time switches, clocks and parts.',
        'before': None, 'now': None, 'countries': 'Canada, Mexico', 'sourceIds': ['ustr-usmca-review'],
    },
    {
        'id': 'dm-ifr', 'type': 'reference', 'date': '2026-06-24', 'dateLabel': 'Effective',
        'title': 'CBP suspends de minimis indefinitely',
        'detail': 'Two interim final rules suspend the $800 de minimis exemption in CBP\'s regulations (19 CFR 10.151(b) for every mode except '
        'mail, 19 CFR 145.31(b) for mail) until CBP announces otherwise. A watch or strap bought online from abroad needs a formal or '
        'informal entry and pays the base rate plus any extra duty.',
        'before': 'Free under de minimis up to $800', 'now': 'Entry required', 'countries': 'All', 'sourceIds': ['cbp-ifr-dm', 'cbp-ifr-mail'],
    },
    {
        'id': 'ieepa-refunds', 'type': 'reference', 'date': '2026-04-20', 'dateLabel': 'Deployed',
        'title': 'CBP opens CAPE for IEEPA duty refunds',
        'detail': 'Importers of record and their brokers can file a CAPE Declaration in ACE listing entries that paid IEEPA duties — for '
        'example the 39% and later 15%-in-total duty on Swiss watches — and ACE refunds the IEEPA duties with interest. The Section 301 '
        'duties and the Section 122 surcharge are not refunded.',
        'before': None, 'now': None, 'countries': 'All', 'sourceIds': ['cbp-ieepa-refunds'],
    },
    {
        'id': 's122-start', 'type': 'extraDuty', 'date': '2026-02-24', 'dateLabel': 'Effective',
        'title': 'Section 122 surcharge replaces the IEEPA tariffs',
        'detail': '10% on products of all countries (9903.03.01) until July 23, 2026, on top of the base rate. No watch, clock or part was on '
        'the product exemption list; civil-aircraft clocks were exempt (9903.03.05), and so were USMCA-qualifying goods of Canada and Mexico. '
        'A $5,000 Swiss steel automatic watch paid $566.53 instead of $750.',
        'before': 'Varied by country', 'now': '+10% (until July 23, 2026)', 'countries': 'All',
        'sourceIds': ['procl-11012', 'csms-67844987', 'hts-now'],
    },
    {
        'id': 'ieepa-end', 'type': 'extraDuty', 'date': '2026-02-24', 'dateLabel': 'Effective',
        'title': 'All IEEPA tariffs end',
        'detail': 'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize '
        'tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP stopped collecting them '
        'for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are '
        'no longer in effect.',
        'before': 'Varied by country', 'now': 'None', 'countries': 'All', 'sourceIds': ['scotus-24-1287', 'eo-14389', 'csms-67834313'],
    },
    {
        'id': 'ch-framework', 'type': 'extraDuty', 'date': '2025-11-14', 'dateLabel': 'Effective',
        'title': 'Swiss watches: 39% cut to 15% in total',
        'detail': 'Under the U.S.–Switzerland–Liechtenstein framework, Swiss and Liechtenstein goods paid the higher of the base rate or 15% '
        '(base rate and reciprocal duty together) instead of the base rate + 39%, for goods entered from November 14, 2025. Watches were '
        'not exempted; civil-aircraft clocks of 9104 were. A $5,000 Swiss steel automatic watch paid $750 instead of $2,016.53. Ended '
        'February 24, 2026.',
        'before': '+39%', 'now': '15% in total (ended)', 'countries': 'Switzerland', 'sourceIds': ['fr-2025-23316'],
    },
    {
        'id': 'cn-ieepa-cut', 'type': 'extraDuty', 'date': '2025-11-10', 'dateLabel': 'Effective',
        'title': 'China fentanyl duty cut to 10%',
        'detail': 'The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It ended with the other IEEPA duties '
        'on February 24, 2026.',
        'before': '+20%', 'now': '+10% (ended)', 'countries': 'China, Hong Kong', 'sourceIds': ['eo-14357'],
    },
    {
        'id': 'jp-15', 'type': 'extraDuty', 'date': '2025-09-04', 'dateLabel': 'Signed',
        'title': 'Japanese watches: reciprocal tariff set at 15% in total',
        'detail': 'Executive Order 14345 set the reciprocal tariff on Japanese goods with a column 1 rate under 15% at 15% in total, applied '
        'to goods entered from August 7, 2025. A $200 Japanese quartz watch paid $30. Ended February 24, 2026.',
        'before': '+15%', 'now': '15% in total (ended)', 'countries': 'Japan', 'sourceIds': ['eo-14345'],
    },
    {
        'id': 'dm-suspended', 'type': 'reference', 'date': '2025-08-29', 'dateLabel': 'Effective',
        'title': 'De minimis suspended for all countries',
        'detail': 'Executive Order 14324 ended duty-free de minimis treatment for shipments of any value, origin or mode, so watches and '
        'straps under $800 ordered from abroad became dutiable. Executive Order 14388 continued the suspension after the IEEPA ruling.',
        'before': 'Free under de minimis up to $800', 'now': 'Entry required', 'countries': 'All',
        'sourceIds': ['eo-14324', 'cbp-dm-2025', 'eo-14388'],
    },
    {
        'id': 'country-rates', 'type': 'extraDuty', 'date': '2025-08-07', 'dateLabel': 'Effective',
        'title': 'Country reciprocal rates replace the 10% baseline — Swiss watches +39%',
        'detail': 'Executive Order 14326 set country rates for goods entered from August 7, 2025: Switzerland +39%, India +25%, Taiwan and '
        'Vietnam +20%, Thailand, the Philippines and Malaysia +19%, the UK +10%; EU goods paid 15% in total. Watches, clocks and parts were '
        'not exempt. A $5,000 Swiss steel automatic watch paid $2,016.53 ($66.53 + 39%). Ended February 24, 2026.',
        'before': '+10%', 'now': '+10% to +39% (ended)', 'countries': 'Listed countries, European Union', 'sourceIds': ['eo-14326', 'hts-now'],
    },
    {
        'id': 'cn-reciprocal-10', 'type': 'extraDuty', 'date': '2025-05-14', 'dateLabel': 'Effective',
        'title': 'China reciprocal duty cut from 125% to 10%',
        'detail': 'Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. Ended February '
        '24, 2026.',
        'before': '+125%', 'now': '+10% (ended)', 'countries': 'China', 'sourceIds': ['eo-14298'],
    },
    {
        'id': 'cn-125', 'type': 'extraDuty', 'date': '2025-04-10', 'dateLabel': 'Effective',
        'title': 'China reciprocal duty raised to 125%',
        'detail': 'Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% from April 10, 2025. With the 20% fentanyl duty '
        'and the 7.5% List 4A duty, a Chinese quartz watch paid the base rate + 152.5% until May 13, 2025.',
        'before': None, 'now': '+125% (ended)', 'countries': 'China', 'sourceIds': ['eo-14266'],
    },
    {
        'id': 'reciprocal', 'type': 'extraDuty', 'date': '2025-04-02', 'dateLabel': 'Signed',
        'title': 'Reciprocal tariff on products of all countries',
        'detail': '10% baseline (9903.01.25) from April 5, 2025 on every Chapter 91 line, including Swiss, Japanese and EU watches; Canada and '
        'Mexico excluded. Higher country rates were paused until August 7, 2025. Ended February 24, 2026.',
        'before': 'None', 'now': '+10% or more (ended)', 'countries': 'All except Canada, Mexico', 'sourceIds': ['eo-14257'],
    },
    {
        'id': 'cn-ieepa', 'type': 'extraDuty', 'date': '2025-03-04', 'dateLabel': 'Effective',
        'title': 'China fentanyl duty raised to 20%',
        'detail': 'The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) to '
        '+20%, on top of the List 3 and List 4A duties. Ended February 24, 2026.',
        'before': '+10%', 'now': '+20% (ended)', 'countries': 'China, Hong Kong', 'sourceIds': ['eo-14195', 'eo-14228'],
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
        'detail': '+25% on non-USMCA goods (9903.01.10) from March 4, 2025, raised to +35% from August 1, 2025; USMCA-qualifying goods exempt '
        'from March 7. Ended February 24, 2026.',
        'before': 'None', 'now': '+25% (ended)', 'countries': 'Canada', 'sourceIds': ['eo-14193', 'eo-14325'],
    },
    {
        'id': 'cn-4a-cut', 'type': 'extraDuty', 'date': '2020-02-14', 'dateLabel': 'Effective',
        'title': 'China List 4A duty cut to 7.5%',
        'detail': 'USTR halved the List 4A duty (9903.88.15) from 15% to 7.5% under the Phase One agreement. It still applies to most Chinese '
        'watches, movements, cases, straps and parts.',
        'before': '+15%', 'now': '+7.5%', 'countries': 'China', 'sourceIds': ['fr-2020-00904'],
    },
    {
        'id': 'cn-4a', 'type': 'extraDuty', 'date': '2019-09-01', 'dateLabel': 'Effective',
        'title': 'China List 4A reaches watches, movements and parts',
        'detail': 'The fourth China Section 301 list put +15% on Chinese watches (9101, 9102), watch and clock movements (9108–9110), cases, '
        'straps and parts (9111–9114), and some clocks.',
        'before': 'None', 'now': '+15%', 'countries': 'China', 'sourceIds': ['fr-2019-17865'],
    },
    {
        'id': 'cn-list3-25', 'type': 'extraDuty', 'date': '2019-05-10', 'dateLabel': 'Effective',
        'title': 'China List 3 duty raised to 25%',
        'detail': 'USTR raised the List 3 duty (9903.88.03) from 10% to 25%. In Chapter 91 it covers instrument-panel clocks (9104.00.05–'
        '9104.00.50), time recorders, parking meters and interval timers (9106) and time switches (9107).',
        'before': '+10%', 'now': '+25%', 'countries': 'China', 'sourceIds': ['fr-2019-09681'],
    },
    {
        'id': 'cn-list3', 'type': 'extraDuty', 'date': '2018-09-24', 'dateLabel': 'Effective',
        'title': 'China Section 301 List 3 reaches clocks, time recorders and time switches',
        'detail': 'The third China Section 301 list put +10% on Chinese instrument-panel clocks, time recorders, parking meters and time '
        'switches.',
        'before': 'None', 'now': '+10%', 'countries': 'China', 'sourceIds': ['fr-2018-20610'],
    },
]
have_ids = {c['id'] for c in tu['changes']}
tu['changes'] += [c for c in NEW_CHANGES if c['id'] not in have_ids]
tu['changes'].sort(key=lambda c: c['date'], reverse=True)

tu['stats'] = [
    {'label': 'Base rates unchanged', 'value': f'{N_ALL} of {N_ALL} lines'},
    {'label': 'Extra duties in effect', 'value': str(len(tu['inEffect']))},
    {'label': 'Swiss & Japanese watches', 'value': '12.5%', 'note': 'in total, since July 24, 2026'},
    {'label': 'Compared', 'value': '2025 Basic → Rev 21'},
    {'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'},
]
add_sources(
    tu,
    [
        'hts-ch91', 'cbp-n351984', 'eo-14389', 'csms-69326983', 'cbp-n362026', 'procl-11012', 'csms-67844987', 'scotus-24-1287', 'csms-67834313',
        'ustr-usmca-review', 'cbp-ifr-dm', 'cbp-ifr-mail', 'cbp-ieepa-refunds', 'fr-2025-23316', 'eo-14357', 'eo-14345', 'eo-14324',
        'cbp-dm-2025', 'eo-14388', 'eo-14326', 'eo-14298', 'eo-14266', 'eo-14257', 'eo-14195', 'eo-14228', 'eo-14194', 'eo-14193',
        'eo-14325',
    ],
)
