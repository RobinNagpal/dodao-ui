# Tariff-updates page of Chapter 87 — exec'd from fill87.py (shares its globals).

tu = d['tariffUpdates']
tu['h1'] = f'HTS Chapter 87: {SHORT} — Tariff Updates'
tu['seo'] = {
    'title': 'Auto Tariff Updates 2026: Section 232 Cars, Parts & Trucks, EU/Japan/Korea 15% Deals, USMCA, China EV 100% (HTS Ch. 87) | KoalaGains',
    'shortDescription': (
        'Every U.S. tariff change on cars, auto parts, trucks, buses, motorcycles and bicycles since 2025, dated and sourced: the '
        'Section 232 auto, parts and truck duties, the 15% EU, Japan and Korea deals, the UK quota, the USMCA U.S.-content rule, '
        "China's 100% EV duty, the 2026 Section 301 and Canada Section 338 duties, the end of the IEEPA tariffs and AD/CVD orders."
    ),
    'keywords': [
        'u.s. auto tariffs',
        '25% automobile tariffs',
        'auto tariffs effective date',
        'auto tariffs section 232',
        'section 232 auto parts tariff list',
        'us truck tariffs section 232',
        'trump car tariffs eu',
        'chinese ev tariffs us',
        'usmca auto tariffs',
        'canada auto exports',
        'mexico auto exports',
        'japan auto exports',
        'chassis antidumping',
    ],
}
tu['intro'] = (
    'What changed for imported vehicles and parts, when, and under which document. The top of the page lists every extra duty in force '
    'today for each country, with its Chapter 99 heading and the exemptions that matter; below it, a dated change log (newest first) '
    'runs from the 2025 IEEPA tariffs and the Section 232 automobile actions to the October 2026 schedule, including the antidumping and '
    f'countervailing duty orders on chassis, trailers, wheels, brake drums and golf carts. The base rates of the {N_LINES} lines are '
    'compared between the 2025 Basic Edition and the 2026 Revision 21.'
)
tu['scope'] = (
    'U.S. import duties on Chapter 87 goods: base rates (General, Special, Column 2), the Chapter 99 duties in force on '
    f'{TODAY} — Section 232 (automobiles, auto parts, medium- and heavy-duty vehicles and buses, their parts, and steel, aluminum and '
    'copper), the 2026 Section 301 duties on 60 economies, the Brazil and China Section 301 duties, the Canada Section 338 duty and '
    'import ban, and the Russia rates — for the countries in the rate matrix and the rest of the world. Ended measures (IEEPA, Section '
    '122) are kept in the log. AD/CVD orders are explained in the log; their company-specific rates are not in the totals.'
)

# --- line status counts -------------------------------------------------------------------------
st = {}
for ln in tu['lines']:
    st[ln['status']] = st.get(ln['status'], 0) + 1
NEW_LINES = sorted(ln['hts'] for ln in tu['lines'] if ln['status'] == 'new')
CHANGED_LINES = sorted(ln['hts'] for ln in tu['lines'] if ln['status'] == 'changed')
print('line status', st, NEW_LINES, CHANGED_LINES)

tu['stats'] = [
    {'label': 'Base rates unchanged', 'value': f"{st.get('unchanged', 0)} of {N_LINES} lines", 'note': '2025 Basic Edition → 2026 Revision 21'},
    {'label': 'Section 232 vehicle actions', 'value': '5', 'note': 'Cars and light trucks, auto parts, trucks, buses, truck and bus parts'},
    {'label': 'Extra duties in effect', 'value': str(len(tu['inEffect'])), 'note': 'Grouped by country; see the cards below'},
    {'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026; Section 122 surcharge ended July 23, 2026'},
]

ENDED = 'The IEEPA duties ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026; Section 232 vehicles and parts were outside both.'
S232_NO301 = (
    'Goods under the Section 232 vehicle, parts, truck, bus and metals headings do not pay it (U.S. note 52(f), 9903.05.90); no '
    'Chapter 87 line is on the general exemption list (note 52(b)) or a country exception list (note 52(j)).'
)
IE = {
    'bloc-ca-section-232': (
        'These are the USMCA headings. A USMCA-qualifying passenger vehicle or light truck pays 25% only on the value of its non-U.S. '
        'content (9903.94.03, U.S. note 33(d)), and a USMCA medium- or heavy-duty truck the same (9903.74.03, note 38(d)), once the '
        'Secretary of Commerce approves the importer\'s U.S.-content documentation; the U.S. content is entered on a second line under '
        '9903.94.02 or 9903.74.06 at 0% (CSMS # 65649652, # 68559236). U.S. content is the value of parts wholly obtained, produced '
        'entirely or substantially transformed in the United States. Without an approval the 25% applies to the full value. USMCA parts '
        'of cars and trucks pay no Section 232 duty (9903.94.06, 9903.74.10). Buses get no content rule (+10%, 9903.74.02). Mobile '
        'industrial equipment (single-axle and track-laying tractors, mobile cranes) under the metals action pays 25% on the non-U.S. '
        'content and on U.S. content above 40% of the value (9903.82.20 / 9903.82.21) through 2027. Relief: articles that are not cars, '
        'light trucks or MHDVs and vehicles 25 or more years old (9903.94.02, 9903.94.04, 9903.74.05, 9903.74.07). The 2025 IEEPA '
        'duties on Canada and Mexico never reached Section 232 autos and parts (U.S. note 33(a)(2)–(3)) and ended February 24, 2026.',
        'A USMCA $40,000 SUV from Mexico or Canada with $16,000 of approved U.S. content pays 25% × $24,000 = $6,000 (15% of the value); '
        'without an approval, $10,000. A USMCA engine part or axle pays nothing; a USMCA bus pays 10%.',
    ),
    'mx-section-301': (
        'Goods of Mexico entered free under USMCA are exempt (note 52(h), 9903.05.94). ' + S232_NO301 + ' The 25% IEEPA duty on '
        'non-USMCA Mexican goods (9903.01.01) ended February 24, 2026.',
        'Only non-USMCA Mexican goods outside the Section 232 actions pay +10%: motorcycles 10%, bicycles 21% (11% base), wheelchairs, '
        'strollers, bicycle parts and listed articles that are not vehicle parts. Claiming USMCA removes it.',
    ),
    'ca-section-301': (
        'Goods of Canada entered free under USMCA are exempt from the 10% (note 52(g), 9903.05.93), and Section 232 goods are exempt '
        '(note 52(f)). The 50% Section 338 duty (9903.03.14, U.S. note 51) has no USMCA exemption and, since September 15, 2026, '
        'applies in addition to any Section 232 duty (Proclamation 11065; note 51(c) now relieves only 9903.03.13). In Chapter 87 it '
        'covers golf carts and similar vehicles (8703.10.50) and vehicles up to 1,000 cc (8703.21.01). Motorcycles over 800 cc (8711.50) '
        'paid it from August 22, 2026 and have been excluded from importation since September 29, 2026 (Proclamation 11063). The 35% '
        'IEEPA duty on non-USMCA Canadian goods ended February 24, 2026.',
        'USMCA cars, trucks and parts from Canada pay only the Section 232 content duty; a Canadian golf cart pays 75% (25% metals + 50%), '
        'a Canadian side-by-side or other vehicle up to 1,000 cc 65% (15% + 50%), and large Canadian motorcycles cannot be imported.',
    ),
    'bloc-ar-section-232': (
        'Mobile industrial equipment of note 16(c)(xi) — single-axle and track-laying tractors, mobile cranes and drilling derricks — '
        'from the deal partners (the EU, Japan, South Korea, Taiwan, the United Kingdom, Switzerland, Liechtenstein, Argentina, Ecuador, '
        'El Salvador and Guatemala) pays 15% in total, or nothing extra when the base rate is 15% or more (9903.82.22), through '
        'December 31, 2027; from January 1, 2028 it pays 25% (Proclamation 11032). Relief: no metal (9903.82.01), metal under 15% of '
        'the weight (9903.82.03), motorcycle parts for U.S. manufacturing (9903.82.13). Goods under 9903.82 do not pay the 2026 '
        'Section 301 or Brazil duties (notes 52(f)(1), 50(a)(vi)(1)).',
        'A German or Japanese mobile crane, Free at base, pays 15%: $150,000 on $1 million. From 2028 it is scheduled to pay 25%.',
    ),
    'jp-section-301': (
        'Passenger vehicles and light trucks (note 33(k)) and the listed auto parts (note 33(l)) of Japan pay 15% in total when the '
        'column 1 rate is under 15% (9903.94.41, 9903.94.43), and only the base rate when it is 15% or more (9903.94.40, 9903.94.42), '
        'since September 16, 2025 (Executive Order 14345; 90 FR 44638). They do not pay the 2026 Section 301 or metals duties (notes '
        '52(f)(2)–(3), 33(k)(1)). Importers who certify that other parts are for U.S. vehicle production or repair can enter them at '
        '15% in total (9903.94.54 / 9903.94.55, note 33(r)). Trucks over 5 t, buses and truck parts get no Japan rate. Everything else '
        'pays the 12.5% Section 301 rate in place of a lower base rate (9903.05.49). The 15% IEEPA reciprocal rate ended February 24, '
        '2026.',
        'A $30,000 Japanese car pays $4,500 (15%); a Japanese pickup keeps its 25% base rate; a car part 15%; a motorcycle, bicycle or a '
        'part that is not a vehicle part 12.5%; a heavy truck its base rate + 25%. A 25-year-old import pays 12.5%.',
    ),
    'kr-section-301': (
        'Passenger vehicles and light trucks (note 33(s)) and listed auto parts (note 33(t)) of South Korea pay 15% in total when the '
        'rate is under 15% (9903.94.61, 9903.94.63) and only that rate when it is 15% or more (9903.94.60, 9903.94.62), since November '
        '1, 2025 (90 FR 55964). Under note 33(m) the comparison uses the column 1-General rate or a KORUS (KR) rate properly claimed, so '
        'a KORUS car (Free) still pays 15% and a pickup keeps the 25% KORUS rate. Certified parts for U.S. production or repair: '
        '9903.94.64 / 9903.94.65. No 2026 Section 301 or metals duty on these (notes 52(f)(2)–(3)). Other goods pay the 12.5% rate in '
        'place of a lower base rate (9903.05.71). The IEEPA reciprocal rate ended February 24, 2026.',
        'A $30,000 Korean car pays $4,500 (15%) with or without a KORUS claim; Korean auto parts 15%; Korean trucks over 5 t their base '
        'rate + 25%.',
    ),
    'eu-section-301': (
        'Passenger vehicles and light trucks (note 33(n)) and listed auto parts (note 33(o)) of the 27 EU member states pay 15% in total '
        'when the column 1 rate is under 15% (9903.94.51, 9903.94.53) and only the base rate when it is 15% or more (9903.94.50, '
        '9903.94.52), since August 1, 2025 (90 FR 46136). Certified parts for U.S. production or repair: 9903.94.44 / 9903.94.45. No '
        '2026 Section 301 or metals duty on these (notes 52(f)(2)–(3)). Other EU goods pay 10% in place of a lower base rate '
        '(9903.05.38–9903.05.39); no Chapter 87 line is on the EU exception list of note 52(j)(2). The IEEPA rate ended February 24, 2026.',
        'A $50,000 German, Italian or Swedish car pays $7,500 (15%); an EU pickup 25%; listed EU auto parts 15%; heavy trucks their base '
        'rate + 25%; EU motorcycles and e-bikes 10%; bicycles 11% (their base rate is above 10%).',
    ),
    'cn-section-301': (
        'The 12.5% 2026 Section 301 duty (9903.05.31) does not apply to Section 232 vehicles, parts, trucks and metals goods (note '
        '52(f)); the China duties of notes 20 and 31 do, on top of Section 232 (note 33(a)). Note 31(d), 9903.91.03: +100% on electric '
        'and plug-in hybrid cars (8703.60–8703.90) and electric buses (8702.40, 8702.90) since September 27, 2024. List 1 (9903.88.01, '
        '25%): gasoline and diesel cars and conventional hybrids (8703.21–8703.50), trucks, buses, motorcycles over 800 cc, works trucks. '
        'List 2 (9903.88.02, 25%): road and farm tractors, cranes, electric trucks, e-bikes and electric motorcycles, mopeds up to 50 cc. '
        'List 3 (9903.88.03, 25%): auto parts, chassis and bodies, bicycles and their parts, trailers and hand trucks. List 4A '
        '(9903.88.15, 7.5%): snowmobiles and golf carts, motorcycles of 50–800 cc and their parts, tanks. Exclusions through November 9, '
        '2026 (9903.88.69, note 20(vvv)): mopeds up to 50 cc valued up to $500, certain park-gear blanks and stator shafts '
        '(8708.40.75.70), certain bicycle trailers (8716.40). From November 10, 2026 intermodal chassis and their parts add +100% '
        '(9903.91.12, note 31(k)). USTR continued the 2018 actions (91 FR 64212). The IEEPA duties on China ended February 24, 2026.',
        'A Chinese EV pays 127.5% (2.5% + 100% + 25%); a gasoline car 52.5%; a car part 52.5% (2.5% + 25% List 3 + 25% Section 232); a '
        'bicycle 48.5%; an e-bike 37.5%; a golf cart 35% plus AD/CVD deposits. AD/CVD orders also cover Chinese chassis, steel wheels, '
        'brake drums, hand trucks and van-type trailers.',
    ),
    'gb-section-301': (
        'UK passenger vehicles of the 12 subheadings in note 33(i) pay 7.5% on top of the 2.5% base (10% in all) within a tariff-rate '
        'quota of 100,000 vehicles a year — no more than 25,000 a quarter, with unused quantity carried from Q1 to Q3 and Q2 to Q4 — '
        '(9903.94.31, since June 30, 2025); over the quota, 25% (9903.94.01). UK light trucks have no quota and pay 25%. The UK auto parts '
        f'listed in note 33(j) ({N_UKP} Chapter 87 lines) pay 10% in all (9903.94.32), and other UK parts certified for UK-built '
        'automobiles 10% (9903.94.33, note 33(q)). These pay no 2026 Section 301 duty (note 52(f)(2)–(3)). UK trucks, buses and truck '
        'parts pay the general Section 232 rates. Metals derivatives pay 25% (15% with at least 95% UK-melted metal, 9903.82.05). Other '
        'UK goods: +10% (9903.05.81); no Chapter 87 line is on the UK exception list (note 52(j)(1)). The 10% IEEPA tariff ended '
        'February 24, 2026.',
        'A $50,000 UK car inside the quota pays $5,000; once CBP reports the quota filled, $13,750 (27.5%). Listed UK car parts pay 10%; '
        'UK bicycles 21%; motorcycles 10% or 12.4%.',
    ),
    'tw-section-301': (
        'Listed auto parts of Taiwan (notes 33(g), 33(u)) pay 15% in total when the column 1 rate is under 15% (9903.94.67) and only the '
        'base rate when it is 15% or more (9903.94.66), since May 1, 2026 (91 FR 31818); certified parts for U.S. production or repair: '
        '9903.94.68 / 9903.94.69. Taiwan has no vehicle deal: its cars and light trucks pay 25% (9903.94.01). Other goods pay 10% in '
        'place of a lower base rate (9903.05.76). ' + S232_NO301,
        'Taiwanese car parts pay 15%; bicycles keep their 11% base (10% floor for lower-rated bicycles and parts); a Taiwanese car pays '
        '27.5%.',
    ),
    'vn-section-301': (
        '+12.5% on products of Vietnam (9903.05.84). ' + S232_NO301 + ' Vietnam has no Section 232 deal rate. ' + ENDED,
        'Vietnamese cars pay 27.5%, car parts 2.5% + 25%, bicycles 11% + 12.5% = 23.5%, e-bikes and motorcycles 12.5%. Vietnamese '
        'chassis pay a 186.84% AD deposit, and Commerce is checking whether Vietnamese steel wheels circumvent the China wheel orders.',
    ),
    'th-section-301': (
        '+12.5% on products of Thailand (9903.05.77). ' + S232_NO301 + ' Thailand has no Section 232 deal rate. ' + ENDED,
        'A Thai pickup pays 25% + 25% = 50%; Thai car parts 27.5%; motorcycles 12.5%. Thai chassis pay AD (72.85% for most exporters) '
        'and CVD (10.50%) deposits.',
    ),
    'in-section-301': (
        '+10% on products of India (9903.05.44). ' + S232_NO301 + ' India has no Section 232 deal rate. The extra 25% IEEPA duty on '
        'India ended February 7, 2026 and the reciprocal duty February 24, 2026.',
        'Indian cars pay 27.5%, car parts 25% + base, motorcycles 10% or 12.4%, bicycles 21%.',
    ),
    'br-section-301': (
        '+25% Brazil Section 301 (9903.05.01, since July 22, 2026) plus +12.5% 2026 Section 301 (9903.05.27). Both are lifted for the '
        'Section 232 vehicles, parts, trucks and metals goods (notes 50(a)(vi), 52(f); 9903.05.07, 9903.05.90). No Chapter 87 line is on '
        'the Brazil exemption list (note 50(a)(ii)). Brazil\'s 2025 IEEPA duties ended February 24, 2026.',
        'A Brazilian car pays 27.5% (Section 232 only); a Brazilian motorcycle or bicycle 37.5% plus its base rate.',
    ),
    'bloc-by-section-232': (
        'Belarus, Cuba and North Korea (no normal trade relations, general note 3(b)) pay column 2 rates and +25% on the agricultural '
        'and industrial equipment of note 16(c)(ix)–(x) (9903.82.12) instead of the 15% the others pay.',
        'Farm tractors and their parts from these countries pay the column 2 rate + 25%.',
    ),
    'ru-section-301': (
        'Russia pays column 2 rates (since April 9, 2022) and, on the note 30(b) lines, 35% in lieu of column 2 (9903.90.08). Russian '
        'aluminum derivatives pay 200% (9903.85.68); steel and copper derivatives 25% (9903.82.16). The 12.5% 2026 Section 301 duty '
        '(9903.05.66) is lifted for Section 232 goods (note 52(f)).',
        'Russian vehicles and parts face column 2 or 35% rates plus the Section 232 duties, and 200% on aluminum derivative articles: '
        'imports are effectively priced out.',
    ),
    'other-section-301': (
        '+10% or +12.5% for the other listed economies (9903.05.20–9903.05.83), or a floor in place of a lower base rate where the '
        'heading says so. ' + S232_NO301 + ' ' + ENDED,
        'Their cars pay 2.5% + 25%, car parts their base + 25%, motorcycles, bicycles and other goods the base rate + 10% or 12.5%.',
    ),
    'all-section-232-1': (
        f'The steel, aluminum and copper action (U.S. note 16) reaches {N_METALS} Chapter 87 lines: derivative articles such as bumpers '
        '(8708.10), trailers and semi-trailers (8716.10, 8716.39), hand trucks and carts (8716.80.50), castors and trailer parts '
        '(8716.90), golf carts and snowmobiles (8703.10) at 25% (9903.82.09); mobile industrial equipment at 25% (15% for deal partners, '
        'USMCA content rule) through 2027; farm tractors, vehicles up to 1,000 cc and other agricultural and industrial equipment at 15% '
        'in total (9903.82.10). Since April 6, 2026 the duty is charged on the full customs value regardless of metal content '
        '(Proclamation 11021). Lower rates: 10% with at least 85% U.S.-melted metal (9903.82.06 / 9903.82.07); UK 15% with 95% UK metal. '
        'Relief: no metal (9903.82.01), metal under 15% of the weight (9903.82.03), motorcycle parts for U.S. manufacturing '
        '(9903.82.13). Section 232 cars, auto parts, trucks and truck parts are not subject to it (notes 33(a)(1), 33(f)(1), 38).',
        'A $10,000 steel bumper that is not an auto part, or a $20,000 utility trailer, pays 25% on top of its base rate from any country '
        '(China adds its Section 301 list duty). The 2026 Section 301 and Brazil duties are not added.',
    ),
    'all-section-232-2': (
        f'Passenger vehicles (sedans, SUVs, crossovers, minivans, cargo vans) and light trucks of the 17 note 33(b) subheadings ({N_AUTOS} '
        'lines) pay +25% since April 3, 2025 (Proclamation 10908), new or used, also when an FTA rate is claimed. Instead: the EU, Japan '
        'and South Korea 15% in total (9903.94.41, .51, .61); the UK 10% within its quota (9903.94.31); USMCA vehicles 25% of the '
        'non-U.S. content (9903.94.03). Relief: an article of these subheadings that is not a passenger vehicle or light truck '
        '(9903.94.02; an electric truck of 8704.60 over the light-truck class pays the truck duty instead), and a vehicle made in a year '
        'at least 25 years before the year of entry (9903.94.04). These entries pay no metals, Canada or Mexico IEEPA, 2026 Section 301 '
        'or Brazil duty (notes 33(a)(1)–(3), 52(f)(2), 50(a)(vi)); AD/CVD and the China duties stack. Vehicles under 1,000 cc, golf carts '
        'and snowmobiles (8703.10, 8703.21) are outside the action.',
        'A $30,000 car from Vietnam, Thailand, India, Brazil or Taiwan pays $8,250 (27.5%); a pickup from those countries 50%. A '
        '25-year-old classic pays its base rate plus the Section 301 duty for its country.',
    ),
    'all-section-232-3': (
        f'Auto parts on the note 33(g) list (130 provisions across chapters 40, 70, 73, 83–85, 87, 90 and 94; {N_PARTS} Chapter 87 lines) '
        'pay +25% since May 3, 2025 (Proclamation 10908), but only when they are parts of passenger vehicles or light trucks; the same '
        'articles for other uses enter under 9903.94.06 (note 33(h)(ii)). USMCA parts, other than knock-down kits, enter free of it '
        '(9903.94.06, note 33(h)(i)). Japan, the EU, South Korea and Taiwan: 15% in total; UK: 10% in total. Since November 1, 2025 an '
        'importer may also certify that other parts will be used for U.S. vehicle production or repair and enter them under 9903.94.07 at '
        '25% (an election under Proclamation 10984, not in chapters 72, 73 or 76), in place of the metals and 2026 Section 301 duties. U.S. '
        'assemblers can claim an import adjustment offset (Proclamation 10925). No 2026 Section 301 duty on these parts (note 52(f)(3)).',
        'A $10,000 brake caliper or axle for cars pays $2,750 from Thailand, India or Brazil, $1,500 from Japan or Germany, $1,000 from '
        'the UK (if listed in 33(j)) and nothing from Mexico or Canada under USMCA.',
    ),
    'all-section-232-4': (
        f'Medium- and heavy-duty vehicles of note 38(b) ({N_MHDV} lines: road tractors 8701.21–8701.29, trucks over 5 t and dumpers of '
        '8704, electric and other trucks 8704.60 / 8704.90, concrete mixers and other special vehicles 8705.40 / 8705.90, chassis for them, '
        f'works trucks 8709.11 / 8709.19) pay +25%, and buses of 8702 ({N_BUS} lines) +10%, since November 1, 2025 (Proclamation 10984). '
        'No country deal rates. USMCA trucks: 25% of the non-U.S. content (9903.74.03); USMCA buses still pay 10% on the full value. '
        'Relief: not an MHDV (9903.74.05), 25 years or older (9903.74.07). No 2026 Section 301, metals or Canada / Mexico IEEPA duty '
        '(notes 52(f)(5), 38(a)).',
        'A $150,000 road tractor pays 29% (4% + 25%) from any country without USMCA, including the EU and Japan; a $300,000 coach pays '
        '12%.',
    ),
    'all-section-232-5': (
        f'Parts of medium- and heavy-duty vehicles on the note 38(i) list (182 provisions; {N_MHDVP} Chapter 87 lines) pay +25% since '
        'November 1, 2025 (9903.74.08), only when they are parts of such vehicles; the listed articles for other uses enter under '
        '9903.74.11. USMCA parts: no duty (9903.74.10). Importers may elect to certify other parts for U.S. MHDV production or repair '
        '(9903.74.09, note 38(j)). The UK, EU, Japan and Korea deal rates do not cover truck parts. No 2026 Section 301 duty (note '
        '52(f)(6)).',
        'A $10,000 truck axle or brake drum pays $2,750 (2.5% + 25%) from any country without USMCA; Chinese and Turkish brake drums add '
        'AD/CVD deposits.',
    ),
}
for e in tu['inEffect']:
    assert e['id'] in IE, e['id']
    e['exemption'], e['whatItMeans'] = IE[e['id']]

GEN_DETAIL = {
    'section-338-canada-2026-09-15': (
        'Canada Section 338: 50% extended to golf carts and small vehicles, on top of Section 232',
        'Proclamation 11065 (signed September 8, 2026) revised the Section 338 list effective September 15, 2026: it added golf carts '
        'and similar vehicles (8703.10.50) and vehicles up to 1,000 cc (8703.21.01) to heading 9903.03.14 and made the 50% apply in '
        'addition to any Section 232 duty. The duty applies to USMCA goods too (U.S. note 51(a)).',
    ),
    'section-338-canada-2026-08-22': (
        'Canada Section 338 duty takes effect: motorcycles over 800 cc',
        'Proclamation 11048 (signed July 20, 2026) imposed 50% on listed Canadian products to offset Canada\'s motor-vehicle tariff '
        'scheme; after a three-day suspension (Proclamation 11056) it took effect on August 22, 2026. In Chapter 87 it reached '
        'motorcycles over 800 cc (8711.50). Articles subject to Section 232 were exempt until September 14 (9903.03.15).',
    ),
    'section-301-2026-60-economies-2026-07-24': (
        '2026 Section 301 duties on 60 economies; Section 232 vehicles and parts exempt',
        f'+10% or +12.5% (9903.05.20–9903.05.84) on products of 60 economies from July 24, 2026, listed against all {N_LINES} Chapter 87 '
        'lines. Note 52(f) (9903.05.90) lifts them for goods under the Section 232 headings — passenger vehicles and light trucks, '
        'listed auto parts, trucks, buses, truck parts and metals goods — so in practice they reach motorcycles, e-bikes, bicycles, '
        'wheelchairs, strollers, some trailers and listed articles that are not vehicle parts. For the EU (10%), Japan and South Korea '
        '(12.5%) and Taiwan (10%) the rate replaces a lower base rate. Canadian and Mexican goods entered under USMCA are exempt (notes '
        '52(g)–(h)).',
    ),
    'section-301-brazil-2026-07-22': (
        'Brazil Section 301: 25%; Section 232 vehicles and parts exempt',
        '+25% on products of Brazil (9903.05.01) from July 22, 2026, on top of the 12.5% 2026 Section 301 duty from July 24. Note '
        '50(a)(vi) (9903.05.07) lifts it for the Section 232 vehicles, parts, trucks, buses and metals goods, the same list as note 52(f).',
    ),
    'section-232-steel-aluminum-copper-2026-06-08': (
        'Section 232 metals: new rates for mobile, agricultural and industrial equipment',
        'Proclamation 11032 set new rates from June 8, 2026 for the equipment lists of note 16(c)(ix)–(xi): mobile industrial equipment '
        '(single-axle and track-laying tractors, mobile cranes, drilling derricks) pays 25% (9903.82.09), 15% in total from the deal '
        'partners (9903.82.22) and, under USMCA, 25% on the non-U.S. content plus U.S. content above 40% (9903.82.20) through December '
        '31, 2027; agricultural and industrial equipment, including farm tractors, vehicles up to 1,000 cc of 8703.21, farm wagons and '
        'agricultural tractor parts, pays 15% in total (9903.82.10). A derivative counts as U.S.-made at 85% U.S.-melted metal (10%).',
    ),
    'section-232-steel-aluminum-copper-end-2026-06-07': (
        'Equipment lines leave the general 25% metals heading',
        'From April 6 to June 7, 2026 the farm, industrial and mobile equipment entries of Chapter 87 (tractors, cranes, vehicles of '
        '8703.21, agricultural tractor parts) paid the general 25% under 9903.82.09. Proclamation 11032 moved them to the equipment '
        'lists from June 8, 2026, with the 15% and 25% rates above.',
    ),
    'section-232-steel-aluminum-copper-scheduled-2028-01-01': (
        'Scheduled: equipment metals rates rise to 25% on January 1, 2028',
        'Under Proclamations 11021 and 11032, the 15% totals for agricultural and industrial equipment and for the deal partners\' mobile '
        'equipment, and the USMCA content rule for mobile equipment, end December 31, 2027; from January 1, 2028 these Chapter 87 lines '
        'pay 25% (UK 15% with 95% UK metal, 10% with 85% U.S.-melted metal). The HTS heading for the step is not published yet.',
    ),
    'section-232-steel-aluminum-copper-2026-04-06': (
        'Section 232 metals rebuilt on full value (Proclamation 11021)',
        'Proclamation 11021 replaced the earlier steel and aluminum headings with 9903.82.02–9903.82.26, charged on the full customs value '
        'regardless of metal content. Chapter 87 derivatives — bumpers, trailers, hand trucks, castors and trailer parts, golf carts and '
        'snowmobiles — pay 25% (9903.82.09); UK goods with at least 95% UK-melted metal 15% (9903.82.05); goods made from U.S.-melted '
        'metal 10%. Section 232 vehicles and auto and truck parts remain outside the metals duties.',
    ),
    'section-301-nicaragua-scheduled-2027-01-01': (
        'Scheduled: Section 301 tariff on Nicaragua from 2027',
        'Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 '
        '(9903.89.01, U.S. note 29), on every Chapter 87 line. The rate is 0% in 2026.',
    ),
    'section-232-passenger-vehicles-and-light-trucks-2025-11-01': (
        'South Korea: cars and light trucks at 15% in total',
        'Korean passenger vehicles and light trucks pay 15% in total when the column 1-General or KORUS rate is under 15% (9903.94.61), '
        'and only that rate when it is 15% or more (9903.94.60), for goods entered from November 1, 2025, replacing the 25% '
        '(9903.94.01). Published December 4, 2025 (90 FR 55964).',
    ),
    'section-232-automobile-parts-2025-11-01': (
        'Korean auto parts at 15%; certified-parts election opens',
        'From November 1, 2025, listed Korean auto parts pay 15% in total (9903.94.63). Proclamation 10984 also let importers certify '
        'other parts for U.S. vehicle production or repair and enter them under 9903.94.07 (25%; 15% for the EU, Japan, Korea and Taiwan '
        'deal headings, 10% under 9903.94.33 for UK parts used in UK automobiles) in place of the metals and later the 2026 Section 301 '
        'duties.',
    ),
    'section-232-medium-and-heavy-duty-vehicles-and-buses-2025-11-01': (
        'Section 232 duty on trucks (25%) and buses (10%)',
        'Proclamation 10984 (signed October 17, 2025) imposed 25% on medium- and heavy-duty vehicles (road tractors, trucks over 5 t, '
        'dumpers, concrete mixers, works trucks, their chassis) and 10% on buses, for goods entered from November 1, 2025, from every '
        'country. USMCA trucks pay 25% only on the non-U.S. content once Commerce approves it (9903.74.03; CSMS # 68559236); buses get no '
        'content rule.',
    ),
    'section-232-medium-and-heavy-duty-vehicle-parts-2025-11-01': (
        'Section 232 duty on truck and bus parts (25%)',
        'From November 1, 2025, parts of medium- and heavy-duty vehicles on the note 38(i) list (engines, transmissions, axles, brakes, '
        'wheels, seats and other parts) pay +25% (9903.74.08) when they are parts of such vehicles. USMCA parts pay nothing until '
        'Commerce sets up a non-U.S.-content process (9903.74.10).',
    ),
    'section-301-china-maritime-and-cargo-handling-equipment-scheduled-2026-11-10': (
        'Scheduled: +100% on Chinese intermodal chassis from November 10, 2026',
        'USTR\'s Section 301 action on China\'s maritime, logistics and shipbuilding sectors adds 100% on intermodal chassis, their '
        'subassemblies and parts (8716.39.00.90, 8716.90.30, 8716.90.50) of China (9903.91.12, note 31(k)). It was suspended for one '
        'year and now applies to entries from November 10, 2026; other goods of those lines enter under 9903.91.13 without it. The 25% '
        'List 3 duty and the chassis AD/CVD orders stay.',
    ),
    'section-232-passenger-vehicles-and-light-trucks-2025-09-16': (
        'Japan: cars and light trucks at 15% in total',
        'Japanese passenger vehicles and light trucks pay 15% in total when the column 1 rate is under 15% (9903.94.41) and the base rate '
        'when it is higher (9903.94.40), from September 16, 2025, implementing Executive Order 14345 (90 FR 44638).',
    ),
    'section-232-automobile-parts-2025-09-16': (
        'Japan: listed auto parts at 15% in total',
        'Listed Japanese auto parts pay 15% in total (9903.94.43), or their base rate when it is 15% or more (9903.94.42), from September '
        '16, 2025.',
    ),
    'section-232-aluminum-russia-2025-08-18': (
        'Russian aluminum duty (200%) reaches more Chapter 87 parts',
        'The aluminum derivatives added through Commerce\'s inclusions process (90 FR 40326) include Chapter 87 articles, so Russian-'
        'origin ones pay 200% (9903.85.68) from August 18, 2025.',
    ),
    'section-232-passenger-vehicles-and-light-trucks-2025-08-01': (
        'EU: cars and light trucks at 15% in total',
        'EU passenger vehicles and light trucks pay 15% in total (9903.94.51) or their base rate when it is higher (9903.94.50), for goods '
        'entered from August 1, 2025, under the U.S.-EU framework (90 FR 46136, published September 25, 2025; earlier entries refunded).',
    ),
    'section-232-automobile-parts-2025-08-01': (
        'EU: listed auto parts at 15% in total',
        'Listed EU auto parts pay 15% in total (9903.94.53) or their base rate when it is 15% or more (9903.94.52), from August 1, 2025.',
    ),
    'section-232-passenger-vehicles-and-light-trucks-2025-06-30': (
        'UK: cars at 10% within a quota',
        'UK passenger vehicles of 12 subheadings pay 7.5% on top of the 2.5% base (10%) within a quota of 65,205 vehicles for the rest of '
        '2025 and 100,000 a year from 2026 (9903.94.31), under Executive Order 14309 (90 FR 27851).',
    ),
    'section-232-automobile-parts-2025-06-30': (
        'UK: listed auto parts at 10% in total',
        'UK parts in the statistical reporting numbers listed in note 33(j) pay 10% in total, including the MFN rate (9903.94.32), from '
        'June 30, 2025.',
    ),
    'section-232-automobile-parts-2026-05-01': (
        'Taiwan: listed auto parts at 15% in total',
        'Listed Taiwanese auto parts pay 15% in total (9903.94.67) or their base rate when higher (9903.94.66), for goods entered from '
        'May 1, 2026 (91 FR 31818). Taiwanese vehicles stay at 25%.',
    ),
    'section-232-automobile-parts-2025-05-03': (
        'Section 232 duty on auto parts (25%)',
        'Proclamation 10908 extended the 25% to the auto parts listed in U.S. note 33(g) — engines, transmissions, powertrain and '
        'electrical parts, chassis, bodies and most of heading 8708, plus tires, glass, batteries, lights and seats in other chapters — '
        'for goods entered from May 3, 2025, when they are parts of passenger vehicles or light trucks. USMCA parts were left out '
        '(9903.94.06). Proclamation 10925 (April 29, 2025) added an import adjustment offset for U.S. vehicle assemblers.',
    ),
    'section-232-passenger-vehicles-and-light-trucks-2025-04-03': (
        'Section 232 duty on cars and light trucks (25%)',
        'Proclamation 10908 (signed March 26, 2025) imposed 25% on passenger vehicles (sedans, SUVs, crossovers, minivans, cargo vans) '
        'and light trucks from every country for goods entered from April 3, 2025, new or used, and on top of FTA rates. USMCA '
        'vehicles may pay it only on their non-U.S. content once Commerce approves the U.S. content (9903.94.03; CSMS # 65649652).',
    ),
    'section-232-aluminum-russia-2025-03-12': (
        'Russian aluminum duty raised to 200%',
        'Proclamation 10895 kept the 200% duty on Russian aluminum and extended it to derivative articles (9903.85.68); in Chapter 87 it '
        'reaches aluminum derivative articles such as bumpers and trailers of Russian origin.',
    ),
}
for c in tu['changes']:
    if c['id'] in GEN_DETAIL:
        c['title'], c['detail'] = GEN_DETAIL[c['id']]
    elif c['id'] == 'base-rates':
        c['title'] = 'Chapter 87 base rates: 2025 Basic Edition vs 2026 Revision 21'
        c['detail'] = (
            f"{st.get('unchanged', 0)} of {N_LINES} lines keep the same General, Special and Column 2 rates. "
            + (f"New or renumbered statistical lines: {', '.join(NEW_LINES)}. " if NEW_LINES else '')
            + (f"Changed: {', '.join(CHANGED_LINES)}. " if CHANGED_LINES else '')
            + 'The base rates themselves did not move: cars 2.5%, light trucks 25%, parts 2.5% or Free.'
        )
    assert 'TODO' not in c['detail'], (c['id'], c['detail'])

# Sources for the added entries.
EXTRA_IDS = [
    'scotus-24-1287', 'eo-14389', 'csms-67834313', 'procl-11012', 'csms-67844987', 'eo-14193', 'eo-14194', 'eo-14195', 'eo-14228',
    'eo-14231', 'eo-14232', 'eo-14257', 'eo-14266', 'eo-14298', 'eo-14289', 'eo-14309', 'eo-14325', 'eo-14326', 'eo-14329', 'eo-14345',
    'eo-14357', 'eo-14384', 'procl-11063', 'ustr-usmca-review', 'cbp-ieepa-refunds', 'fr-2026-20510', 'hts-ch87', 'procl-10925',
    'ad-chassis-cn', 'cvd-chassis-cn', 'chassis-cn-sunset-ad', 'chassis-cn-sunset-cvd', 'itc-chassis-cn-5yr', 'ad-chassis-mtv',
    'cvd-chassis-mt', 'itc-chassis-mtv', 'adcvd-wheels-cn', 'wheels-cn-cont', 'wheels-cn-circ', 'adcvd-trailer-wheels-cn',
    'trailer-wheels-cn-cont', 'ad-brake-drums', 'cvd-brake-drums', 'brake-drums-circ', 'ad-hand-trucks', 'adcvd-lsptv', 'itc-lsptv',
    'ad-van-trailers-cn', 'cvd-van-trailers-cn', 'ad-van-trailers-mx-prelim', 'ad-van-trailers-ca-prelim', 'cvd-van-trailers-mx-prelim',
    'itc-van-trailers-schedule', 'csms-69326983', 'csms-69302472',
]
add_sources(tu, EXTRA_IDS)
have = {s['id'] for s in tu['sources']}


def ch(cid, ctype, date, label, title, detail, before, now, countries, ids):
    for i in ids:
        assert i in have, (cid, i)
    return dict(id=cid, type=ctype, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries,
                sourceIds=ids)


tu['changes'] += [
    ch('cn-301-continue', 'reference', '2026-10-07', 'Published', 'China Section 301 lists continue after the four-year review',
       'USTR announced that the 2018 China Section 301 actions did not terminate on their 2026 anniversaries because domestic industries '
       'asked for them to continue. For Chapter 87 this keeps 25% (Lists 1–3) and 7.5% (List 4A) on Chinese vehicles, parts, '
       'bicycles and trailers, on top of Section 232.', '+7.5% to +25%', '+7.5% to +25%', 'China', ['fr-2026-20510']),
    ch('chassis-cn-sunset', 'reference', '2026-10-02', 'Published', 'Chinese chassis AD/CVD orders: expedited sunset reviews',
       'Commerce found that revoking the 2021 antidumping and countervailing duty orders on chassis and subassemblies from China would '
       'likely lead to renewed dumping (188.05% China-wide) and subsidies, and the ITC scheduled expedited five-year reviews. The '
       'orders on container and other trailer chassis (8716.39.00.90, 8716.90.50) stay in force during the reviews.', None, None,
       'China', ['itc-chassis-cn-5yr', 'chassis-cn-sunset-ad', 'chassis-cn-sunset-cvd', 'ad-chassis-cn', 'cvd-chassis-cn']),
    ch('ca-ban-motorcycles', 'extraDuty', '2026-09-29', 'Effective', 'Canadian motorcycles over 800 cc banned from importation',
       'Proclamation 11063 excluded certain Canadian products that carried the Section 338 duty from importation, for goods imported '
       'from 12:01 a.m. ET on September 29, 2026; in Chapter 87 this covers motorcycles over 800 cc (8711.50). Goods imported earlier '
       'but not yet entered pay the 50% duty.', '+50%', 'Import banned', 'Canada', ['procl-11063']),
    ch('brake-drums-circ', 'reference', '2026-09-22', 'Published', 'Brake drums: compacted graphite iron drums found to circumvent the orders',
       'Commerce preliminarily determined that compacted graphite iron brake drums from China are later-developed merchandise '
       'circumventing the 2025 antidumping and countervailing duty orders on brake drums, so they would pay the same deposits.', None,
       None, 'China', ['brake-drums-circ', 'ad-brake-drums', 'cvd-brake-drums']),
    ch('hand-trucks-cont', 'reference', '2026-09-03', 'Published', 'Antidumping order on Chinese hand trucks continued',
       'After the fourth sunset review, Commerce continued the antidumping duty order on hand trucks and certain parts from China '
       '(8716.80.50.10, 8716.80.50.90, 8716.90.50.60) for five more years.', None, None, 'China', ['ad-hand-trucks']),
    ch('van-trailers', 'pending', '2026-08-31', 'Published', 'Van-type trailers from China, Mexico and Canada: AD/CVD investigations',
       'Commerce made final affirmative determinations on van-type trailers and subassemblies from China (antidumping 130.86%, cash '
       'deposit 129.73%; countervailing 134.75%) and preliminary antidumping determinations on Mexico (8.72% for most exporters, '
       '79.92% for two) and Canada (4.29%, 44.86% for two), plus a preliminary countervailing duty on Mexico (1.91%). Deposits are '
       'being collected; orders follow only if the ITC makes final affirmative injury votes (hearing held August 27, 2026). The '
       'Canadian countervailing duty case was withdrawn.', None, None, 'China, Mexico, Canada',
       ['ad-van-trailers-cn', 'cvd-van-trailers-cn', 'ad-van-trailers-mx-prelim', 'cvd-van-trailers-mx-prelim',
        'ad-van-trailers-ca-prelim', 'itc-van-trailers-schedule']),
    ch('s122-end', 'extraDuty', '2026-07-23', 'Expired', 'Section 122 import surcharge expired',
       'The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.', '+10%', 'None', 'All', ['procl-11012', 'hts-now']),
    ch('usmca-review', 'reference', '2026-07-01', 'Announced', 'USMCA joint review: not renewed, still in force',
       'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending '
       'resolution of the issues or until termination, so USMCA claims still lower the Section 232 vehicle duty to the non-U.S. content '
       'and remove it on parts.', None, None, 'Canada, Mexico', ['ustr-usmca-review']),
    ch('chassis-mtv', 'reference', '2026-06-18', 'Published', 'AD/CVD orders on chassis from Mexico, Thailand and Vietnam',
       'Commerce issued antidumping orders on chassis and subassemblies from Mexico (32.37%), Thailand (72.85%; 129.63% for one exporter) '
       'and Vietnam (186.84%) and countervailing orders on Mexico (76.91%) and Thailand (10.50%; 9.65%–10.72% for named exporters), after '
       'the ITC\'s affirmative injury votes. They cover chassis of 8716.39.00.90 and subassemblies of 8716.90.50.', None, None,
       'Mexico, Thailand, Vietnam', ['ad-chassis-mtv', 'cvd-chassis-mt', 'itc-chassis-mtv']),
    ch('wheels-circ', 'reference', '2026-03-19', 'Published', 'Steel wheels: circumvention inquiry on Vietnam',
       'Commerce opened a country-wide inquiry into whether steel wheels from Vietnam circumvent the 2019 antidumping and countervailing '
       'duty orders on certain steel wheels (22.5 and 24.5 inch truck and trailer wheels) from China.', None, None, 'China, Vietnam',
       ['wheels-cn-circ', 'adcvd-wheels-cn', 'wheels-cn-cont']),
    ch('s122-start', 'extraDuty', '2026-02-24', 'Effective', 'Section 122 surcharge replaces the IEEPA tariffs',
       '10% on products of all countries (9903.03.01) until July 23, 2026. Section 232 cars, light trucks, auto parts, trucks, truck '
       'parts and metals goods were exempt (9903.03.06), as were USMCA-qualifying goods of Canada and Mexico. Motorcycles, bicycles, '
       'e-bikes and other non-Section 232 goods paid it.', 'None', '+10% (until July 23, 2026)', 'All',
       ['procl-11012', 'csms-67844987', 'hts-now']),
    ch('ieepa-end', 'extraDuty', '2026-02-24', 'Effective', 'All IEEPA tariffs end',
       'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, '
       'Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting them for goods entered '
       'from 12:00 a.m. ET on February 24. Importers can claim refunds of IEEPA duties paid. The 9903.01 and 9903.02 headings are still '
       'printed in Revision 21 but are no longer in effect.', 'Varied by country', 'None', 'All',
       ['scotus-24-1287', 'eo-14389', 'csms-67834313', 'cbp-ieepa-refunds']),
    ch('india-oil-end', 'extraDuty', '2026-02-07', 'Effective', "India's extra 25% IEEPA duty removed",
       'Executive Order 14384 ended the additional 25% on products of India (9903.01.84) from February 7, 2026; the 25% reciprocal rate '
       'ended with the other IEEPA duties on February 24. Indian Section 232 vehicles and parts were never subject to either.', '+50%',
       '+25% (until February 24, 2026)', 'India', ['eo-14384']),
    ch('cn-ieepa-cut', 'extraDuty', '2025-11-10', 'Effective', 'China fentanyl duty cut to 10%',
       'The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. Note 33(a) did not exempt Section 232 '
       'vehicles and parts from it, as it did for the Canada and Mexico duties. It ended February 24, 2026.', '+20%', '+10% (ended)', 'China', ['eo-14357']),
    ch('jp-eo', 'reference', '2025-09-04', 'Signed', 'Executive Order 14345 implements the U.S.-Japan agreement',
       'The order set the 15% all-in rate for Japanese passenger vehicles, light trucks and listed auto parts, applied by Commerce from '
       'September 16, 2025 (see the entries for that date).', None, None, 'Japan', ['eo-14345', 'fr-2025-17908']),
    ch('india-oil', 'extraDuty', '2025-08-27', 'Effective', 'Extra 25% on products of India',
       'Executive Order 14329 added 25% on Indian goods (9903.01.84) on top of the 25% reciprocal rate: 50% on Indian motorcycles, '
       'bicycles and other goods outside Section 232. Ended February 7, 2026.', '+25%', '+50% (ended)', 'India', ['eo-14329', 'eo-14326']),
    ch('country-rates', 'extraDuty', '2025-08-07', 'Effective', 'Country reciprocal rates replace the 10% baseline',
       'Executive Order 14326 set country rates from August 7, 2025 (for example Thailand and Indonesia +19%, Vietnam and Taiwan +20%, '
       'India +25%, Japan and South Korea +15%, the EU 15% in total, the UK +10%). Section 232 vehicles and parts were outside the '
       'reciprocal duties (9903.01.33), so they reached only motorcycles, bicycles, e-bikes, trailers and other goods. Ended February 24, '
       '2026.', '+10%', '+10% to +40% (ended)', 'Listed countries, European Union', ['eo-14326', 'hts-now']),
    ch('ca-amended', 'extraDuty', '2025-07-31', 'Signed', 'Canada additional duty raised to 35%',
       'Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Section 232 vehicles and parts were not subject to it '
       '(U.S. note 33(a)(2)). Ended February 24, 2026.', '+25%', '+35% (ended)', 'Canada', ['eo-14325']),
    ch('uk-eo', 'reference', '2025-06-16', 'Signed', 'Executive Order 14309: U.S.-UK deal on cars and parts',
       'The order implementing the U.S.-UK Economic Prosperity Deal set the UK vehicle quota (100,000 a year at 10% in total) and the 10% '
       'rate on UK auto parts, applied from June 30, 2025.', None, None, 'United Kingdom', ['eo-14309', 'fr-2025-12060']),
    ch('cn-reciprocal-10', 'extraDuty', '2025-05-14', 'Effective', 'China reciprocal duty cut from 125% to 10%',
       'Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. It never applied to '
       'Section 232 vehicles and parts. Ended February 24, 2026.', '+125%', '+10% (ended)', 'China', ['eo-14298']),
    ch('no-stacking', 'reference', '2025-04-29', 'Signed', 'No stacking of the auto duty with the Canada / Mexico and metals duties',
       'Executive Order 14289 and Proclamation 10925 provided that goods subject to the Section 232 automobile and parts duties do not also '
       'pay the IEEPA duties on Canada and Mexico or the Section 232 steel and aluminum duties, and set up an import adjustment offset '
       'for parts used by U.S. vehicle assemblers.', None, None, 'All', ['eo-14289', 'procl-10925']),
    ch('cn-125', 'extraDuty', '2025-04-10', 'Effective', 'China reciprocal duty raised to 125%',
       'Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% from April 10, 2025. Chinese bicycles, e-bikes and '
       'motorcycles paid it on top of the fentanyl and Section 301 duties until May 13, 2025; cars and auto parts were outside it.', None,
       '+125% (ended)', 'China', ['eo-14266']),
    ch('reciprocal', 'extraDuty', '2025-04-02', 'Signed', 'Reciprocal tariff on products of all countries',
       '10% baseline (9903.01.25) from April 5, 2025, and country rates (9903.02.xx); Canada and Mexico excluded, and goods subject to '
       'Section 232 duties — including the cars, light trucks and parts covered from April 3 and May 3, 2025 — left out. Ended February '
       '24, 2026.', 'None', '+10% or more (ended)', 'All except Canada, Mexico', ['eo-14257']),
    ch('mx-usmca-exempt', 'extraDuty', '2025-03-07', 'Effective', 'USMCA goods exempted from the Canada and Mexico IEEPA duties',
       'Executive Orders 14231 and 14232 exempted goods of Canada and Mexico that qualify for USMCA from the IEEPA duties from March 7, '
       '2025 (9903.01.04, 9903.01.14). Ended with those duties on February 24, 2026.', '+25%', 'Free for USMCA goods (ended)',
       'Canada, Mexico', ['eo-14231', 'eo-14232']),
    ch('cn-ieepa', 'extraDuty', '2025-03-04', 'Effective', 'China fentanyl duty raised to 20%',
       'The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) to +20%, '
       'on top of the Section 301 lists. Ended February 24, 2026.', '+10%', '+20% (ended)', 'China', ['eo-14195', 'eo-14228']),
    ch('mx-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Mexico',
       '+25% on Mexican goods (9903.01.01), in force from March 4, 2025. Ended February 24, 2026.', 'None', '+25% (ended)', 'Mexico',
       ['eo-14194']),
    ch('ca-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Canada',
       '+25% on Canadian goods (9903.01.10), in force from March 4, 2025, later raised to +35%. Ended February 24, 2026.', 'None',
       '+25% (ended)', 'Canada', ['eo-14193']),
    ch('lsptv-orders', 'reference', '2025-08-12', 'Published', 'AD/CVD orders on Chinese golf carts and other low-speed vehicles',
       'After the ITC\'s affirmative votes, Commerce issued antidumping (119.39%–312.54%; 478.09% China-wide) and countervailing '
       '(31.45%–691.58%; 41.14% all others) duty orders on low-speed personal transportation vehicles from China — golf carts, '
       'neighborhood vehicles and similar (8703.10.50, 8703.90.01) and their chassis and bodies.', None, None, 'China',
       ['adcvd-lsptv', 'itc-lsptv']),
    ch('brake-drum-orders', 'reference', '2025-08-12', 'Published', 'AD/CVD orders on brake drums from China and Türkiye',
       'Commerce issued antidumping (China 77.14% for listed exporters, 160.79% China-wide; Türkiye 15.22%–149.29%) and countervailing '
       '(China 11.94%–446.83%; Türkiye 2.80%–131.60%) duty orders on certain brake drums for trucks and trailers (8708.30.50).', None,
       None, 'China, Türkiye', ['ad-brake-drums', 'cvd-brake-drums']),
    ch('trailer-wheels-cont', 'reference', '2025-03-26', 'Published', 'Steel trailer wheel orders on China continued',
       'Commerce continued the 2019 antidumping and countervailing duty orders on steel trailer wheels 12 to 16.5 inches from China '
       '(8716.90.50.35, 8716.90.50.59).', None, None, 'China', ['trailer-wheels-cn-cont', 'adcvd-trailer-wheels-cn']),
    ch('wheels-cont', 'reference', '2024-11-18', 'Published', 'Steel truck wheel orders on China continued',
       'Commerce continued the 2019 antidumping (231.70% China-wide) and countervailing (457.10%) duty orders on certain steel wheels of '
       '22.5 and 24.5 inches from China (8708.70.45, 8708.70.60, 8716.90.50).', None, None, 'China', ['wheels-cn-cont', 'adcvd-wheels-cn']),
    ch('chassis-cn-orders', 'reference', '2021-07-08', 'Published', 'AD/CVD orders on chassis from China',
       'Commerce issued a countervailing duty order (44.32%, May 10, 2021) and an antidumping duty order (188.05% China-wide, July 8, '
       '2021) on chassis and subassemblies from China, such as container chassis (8716.39.00.90, 8716.90.50).', None, None, 'China',
       ['ad-chassis-cn', 'cvd-chassis-cn']),
]
tu['changes'].sort(key=lambda c: c['date'], reverse=True)
for c in tu['changes']:
    for i in c['sourceIds']:
        assert i in have, (c['id'], i)
