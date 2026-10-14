# understand-industry, industry-areas, tariff-engineering and final-conclusion pages of Chapter 87 — exec'd from fill87.py.

# ================================================================== understandIndustry
ui['h1'] = f'HTS Chapter 87: {SHORT} — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Car & Auto Parts Imports by Country: Mexico, Japan, Korea, Canada, Germany (HTS Ch. 87) | KoalaGains',
    'shortDescription': (
        f'Where U.S. imports of cars, trucks, auto parts, motorcycles and bicycles come from, {ui["byYear"][0]["year"]}–{Y}: '
        f'{money(TOT)} in {Y}. By country, by product and over time, from UN Comtrade.'
    ),
    'keywords': [
        'us car imports by country',
        'us auto parts imports',
        'mexico auto exports to us',
        'japan auto exports',
        'south korea auto exports',
        'canada auto exports',
        'germany auto exports',
        'HTS chapter 87 import statistics',
    ],
}
ui['valueBasis'] = 'CIF value (customs value plus freight and insurance), as reported by the United States to UN Comtrade.'
ui['byYearPartners'] = ['Mexico', 'Canada']
ui['byYearCaption'] = (
    'U.S. imports of Chapter 87 goods each year, split into the two USMCA partners (Mexico and Canada), whose vehicles and parts '
    'follow the USMCA rules, and everyone else.'
)
ui['effectiveDuty']['note'] = 'Duty-collected figures aren’t available from an official source yet.'
ui['effectiveDuty']['dutyPaidUsd'] = None
for c in ui['byCountry']:
    c['dutyPaidUsd'] = None
for x in ui['byLine']:
    x['dutyPaidUsd'] = None


def bl(hs6):
    x = BYL.get(hs6)
    return x['importsUsd'] if x else 0


mx, jp, kr, ca, de, cn = (imp(c) for c in ('Mexico', 'Japan', 'South Korea', 'Canada', 'Germany', 'China'))
ui['why'] = (
    f'U.S. imports of Chapter 87 goods were **{money(TOT)} in {Y}**, {pct_change(TOT, PRIOR)} from {money(PRIOR)} in {PY}. '
    f'**Cars and other passenger vehicles** (8703) were {money(H.get("8703", 0))}, **auto parts** (8708) {money(H.get("8708", 0))} and '
    f'**trucks** (8704) {money(H.get("8704", 0))}; motorcycles, bicycles, trailers and the rest made up the balance.\n\n'
    f'**Mexico** ({money(mx)}, {share(mx)}) is the largest supplier of both vehicles and parts: {money(hc("8703", "Mexico"))} of cars, '
    f'{money(hc("8704", "Mexico"))} of trucks and {money(hc("8708", "Mexico"))} of parts. **Japan** ({money(jp)}), **South Korea** '
    f'({money(kr)}) and **Germany** ({money(de)}) ship mostly finished cars, while **Canada** ({money(ca)}) ships cars and parts '
    f'within the North American production chain. **China** ({money(cn)}) ships mostly parts ({money(hc("8708", "China"))}), '
    f'with {money(hc("8703", "China"))} of vehicles of 8703 (cars, golf carts and other small vehicles), '
    f'{money(hc("8716", "China"))} of trailers and smaller amounts of bicycles, e-bikes, wheelchairs and strollers; Chinese cars face '
    '52.5%, and EVs 127.5%.\n\n'
    f'{Y} is the latest full year of trade data, so it shows the first year of the Section 232 automobile duties (from April and May '
    '2025) but not the truck duty (November 2025), the 2026 Section 301 duties or the Section 338 duty on Canada. UN Comtrade does '
    'not say which imports were claimed under USMCA, how much of each vehicle was U.S. content, or which listed articles were '
    'vehicle parts, which is what decides most of the Section 232 duty. Duty-collected figures aren’t available from an official '
    'source yet.'
)
ui['sources'] = [
    {'label': f'UN Comtrade (public API), United States imports, HS chapter 87 (retrieved {TODAY})', 'url': 'https://comtradeplus.un.org/'},
]
ui['coverageNote'] = (
    'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. Vehicle values '
    'include the U.S.-made parts inside vehicles assembled in Mexico and Canada.'
)

# ================================================================== industryAreas
ia = d['industryAreas']
add_sources(ia, ['hts-ch87', 'eo-14389', 'procl-11012', 'procl-11063', 'fr-2026-20510', 'ad-chassis-mtv', 'adcvd-lsptv', 'ad-brake-drums'])
ia['h1'] = f'HTS Chapter 87: {SHORT} — Tariff Rates by Country'
ia['seo'] = {
    'title': 'Car & Auto Parts Tariffs by Country 2026: Mexico, Japan, Korea, Canada, Germany, China, UK (HTS Ch. 87) | KoalaGains',
    'shortDescription': (
        'The total U.S. tariff on cars, pickups, trucks, auto parts, motorcycles, e-bikes and bicycles from each country: 15% for EU, '
        'Japanese and Korean cars, 10% for UK cars in quota, 25% on the non-U.S. content of USMCA vehicles, 27.5% elsewhere, 127.5% '
        'for Chinese EVs.'
    ),
    'keywords': [
        'auto tariffs by country',
        'car import tariffs by country',
        'tariffs on cars from japan',
        'tariff on german cars in us',
        'us tariff on korean cars',
        'tariffs on cars from mexico',
        'tariffs on cars from canada to us',
        'tariffs on uk cars to us',
        'tariffs on cars from china',
        'auto parts tariffs by country',
    ],
}
ia['intro'] = (
    'Each cell is the base rate for that product group plus the extra duties for that country, minus any preference, from the current '
    'tariff schedule. Many Chapter 87 lines depend on what the article is used for, so a cell can show more than one total, '
    'labelled by the answer: **car or light-truck part** (Section 232 auto parts, note 33(g)), **truck or bus part** (Section 232 '
    'truck parts, note 38(i)), or **not a vehicle part** (neither: the base rate plus the Section 301 duty for the country).\n\n'
    'For Mexico and Canada the **USMCA-qualifying** view applies the USMCA rules: Free base rates, no Section 232 duty on parts, and '
    'for cars, light trucks and heavy trucks 25% of the **non-U.S. content** (shown as 25%, the rate with no approved U.S. content; '
    'each dollar of U.S. content Commerce approves comes off the base the 25% is charged on). Buses pay 10% even under USMCA. UK cars '
    'are shown inside the 100,000-vehicle quota (10%); over the quota they pay 27.5%. AD/CVD deposits (chassis, van-type trailers, '
    'steel wheels, brake drums, golf carts, hand trucks) are not included.'
)
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]

EU_RULE = (
    'EU: cars, SUVs and light trucks 15% in total (9903.94.51; a 25% pickup stays 25%); listed car parts 15% (9903.94.53); trucks '
    'over 5 t and road tractors base + 25%, buses + 10%, truck parts + 25% (no EU rate); metals goods 25% (cranes 15%, farm tractors '
    '15%); everything else 10% in place of a lower base rate (9903.05.39). The ended 15% IEEPA rate is not applied.'
)
L = {
    'Mexico': (
        'USMCA: cars, light trucks and heavy trucks 25% of the non-U.S. content (9903.94.03, 9903.74.03; U.S. content Commerce-approved, '
        'entered under 9903.94.02 / 9903.74.06 at 0%); USMCA car and truck parts Free (9903.94.06, 9903.74.10); buses +10% '
        '(9903.74.02); metals goods 25% (mobile equipment: 25% of the non-U.S. content and of U.S. content above 40%); other goods Free '
        '(9903.05.94). Without USMCA: base + 25% on vehicles and parts, + 10% Section 301 (9903.05.55) on other goods. The 25% IEEPA duty '
        'ended February 24, 2026.'
    ),
    'Canada': (
        'USMCA: same as Mexico — cars and trucks 25% of the non-U.S. content (9903.94.03, 9903.74.03), USMCA parts Free, buses +10%, other '
        'goods Free (9903.05.93). Section 338: +50% even with USMCA, on top of Section 232 since September 15, 2026, on golf carts '
        '(8703.10.50: 75%) and vehicles up to 1,000 cc (8703.21.01: 65%) (9903.03.14); motorcycles over 800 cc are banned since '
        'September 29, 2026 (Proclamation 11063). Without USMCA: base + 25% on vehicles and parts, + 10% (9903.05.29) on other goods. '
        'The 35% IEEPA duty ended February 24, 2026.'
    ),
    'Japan': (
        'Cars, SUVs and light trucks 15% in total (9903.94.41; a 25% pickup stays 25%); listed car parts 15% (9903.94.43); trucks over '
        '5 t and road tractors base + 25%, buses + 10%, truck parts + 25% (no Japan rate); metals goods 25% (cranes, farm tractors 15%); '
        'everything else 12.5% in place of a lower base rate (9903.05.49). The ended 15% IEEPA rate is not applied.'
    ),
    'South Korea': (
        'Cars, SUVs and light trucks 15% in total (9903.94.61), comparing with the General or KORUS rate: a KORUS car still 15%, a pickup '
        'its 25% KORUS rate; listed car parts 15% (9903.94.63); trucks over 5 t and road tractors base + 25%, buses + 10%, truck parts + '
        '25%; other goods 12.5% in place of a lower base rate (9903.05.71). KORUS (KR) is applied where it lowers the base.'
    ),
    'Germany': EU_RULE,
    'Italy': EU_RULE,
    'Slovakia': EU_RULE,
    'Sweden': EU_RULE,
    'Austria': EU_RULE,
    'Hungary': EU_RULE,
    'France': EU_RULE,
    'Spain': EU_RULE,
    'Netherlands': EU_RULE,
    'Belgium': EU_RULE,
    'United Kingdom': (
        'Cars of 8703 2.5% + 7.5% = 10% inside the 100,000-vehicle quota (9903.94.31; 27.5% over it); light trucks 25% + 25%; parts '
        'listed in note 33(j) 10% in total (9903.94.32), other listed car parts 25% + base; trucks, buses and truck parts at the general '
        'Section 232 rates; metals goods 25% (15% with 95% UK metal, 9903.82.05); other goods + 10% (9903.05.81). The 10% IEEPA tariff '
        'ended February 24, 2026.'
    ),
    'China': (
        'Section 232 as for any country (cars + 25%, parts + 25%, trucks + 25%, buses + 10%), plus Section 301: +100% on EVs and plug-in '
        'hybrids and electric buses (9903.91.03), +25% Lists 1–3 (9903.88.01–.03) on most other cars, trucks, tractors, e-bikes, parts, '
        'bicycles and trailers, +7.5% List 4A (9903.88.15) on golf carts, snowmobiles and mid-size motorcycles. The 12.5% 2026 Section '
        '301 duty (9903.05.31) applies only to goods outside Section 232. Totals: EV 127.5%, gasoline car 52.5%, car part 52.5%, '
        'bicycle 48.5%, e-bike 37.5%. Exclusions (9903.88.69) need the importer\'s confirmation and are not applied. AD/CVD not '
        'included.'
    ),
    'Taiwan': (
        'Listed car parts 15% in total (9903.94.67, since May 1, 2026); no vehicle deal, so cars and light trucks base + 25% '
        '(9903.94.01); trucks, buses and truck parts at the general rates; other goods 10% in place of a lower base rate (9903.05.76).'
    ),
    'Vietnam': (
        'Section 232 at the general rates (cars and light trucks + 25%, parts + 25%, trucks + 25%, buses + 10%); other goods + 12.5% '
        '(9903.05.84). Vietnamese chassis also pay a 186.84% AD deposit (not included).'
    ),
    'Thailand': (
        'Section 232 at the general rates (a 25% pickup pays 50%); other goods + 12.5% (9903.05.77). Thai chassis also pay AD and CVD '
        'deposits (not included).'
    ),
    'India': (
        'Section 232 at the general rates; other goods + 10% (9903.05.44). The 2025 IEEPA duties on India (25% + 25%) ended in February '
        '2026.'
    ),
    'Brazil': (
        'Section 232 at the general rates, with no Brazil or 2026 Section 301 duty on those goods (9903.05.07, 9903.05.90); other goods '
        '+ 25% (9903.05.01) + 12.5% (9903.05.27). The 2025 IEEPA duties on Brazil ended February 24, 2026.'
    ),
    'Any other country': (
        'Section 232 at the general rates from every country (cars and light trucks + 25%, listed parts + 25%, trucks + 25%, buses + '
        '10%, metals goods 15%–25%); other goods pay the base rate only, or + 10% to + 12.5% for the other Section 301 economies '
        '(9903.05.20–9903.05.83). Russia, Belarus, Cuba and North Korea (column 2 rates) are outside this range.'
    ),
}
for c in ia['countries']:
    assert c['country'] in L, c['country']
    c['rule']['label'] = L[c['country']]
    if c['country'] == 'China':
        for sid in ('fr-2026-20510',):
            if sid not in c['rule']['sourceIds']:
                c['rule']['sourceIds'].append(sid)
    if c['country'] == 'Canada' and 'procl-11063' not in c['rule']['sourceIds']:
        c['rule']['sourceIds'].append('procl-11063')
    if 'hts-ch87' not in c['rule']['sourceIds']:
        c['rule']['sourceIds'].append('hts-ch87')
ia['assumptions'] = [a for a in ia['assumptions'] if 'TODO' not in a] + [
    'Variant labels: "car or light-truck part" and "truck or bus part" price the listed article as a Section 232 auto or truck part; '
    '"not a vehicle part" prices it without those duties. Vehicles are priced as passenger vehicles, light trucks or medium- and '
    'heavy-duty vehicles; the reliefs for articles that are not (9903.94.02, 9903.74.05) and for vehicles 25 or more years old '
    '(9903.94.04, 9903.74.07) need the importer\'s confirmation and are not applied.',
    'USMCA vehicles: the 25% of the non-U.S. content is shown with no approved U.S. content (so 25% of the full value); approved U.S. '
    'content lowers it. UK cars are shown inside the quota (10%).',
    'Certified-parts elections (9903.94.07, 9903.94.33, 9903.94.45, 9903.94.55, 9903.94.65, 9903.94.69, 9903.74.09) are opt-in and '
    'not applied; the import adjustment offsets for U.S. assemblers are not modelled.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 '
    'surcharge (9903.03.01) expired July 23, 2026; neither is applied. Canadian motorcycles over 800 cc show as banned.',
    'AD/CVD deposits are company-specific and not included: chassis (China, Mexico, Thailand, Vietnam), steel wheels and steel '
    'trailer wheels (China), brake drums (China, Türkiye), low-speed vehicles such as golf carts (China), hand trucks (China); van-type '
    'trailers (China, Mexico, Canada) are still under investigation with provisional deposits.',
    'Admissibility is separate from duty: vehicles must meet EPA and NHTSA rules at entry (see Tariff engineering).',
]
ia['exemptionCheck'] = (
    'Read U.S. notes 2, 16, 20, 29, 30, 31, 33, 38, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. No Chapter 87 '
    'line is on the 2026 Section 301 general exemption lists (note 52(b)–(d)) or any country exception list (note 52(j)), or on the '
    'Brazil exemption list (note 50(a)(ii)); the vehicle, parts, truck, bus and metals headings are lifted from both duties by notes '
    '52(f) and 50(a)(vi) (9903.05.90, 9903.05.07). Note 33(b) lists 17 subheadings of passenger vehicles and light trucks, note 33(g) '
    '130 auto-parts provisions, note 33(j) the UK parts, note 38(b) the medium- and heavy-duty vehicles and note 38(i) their parts. '
    'Note 51(b)(3) lists 8703.10.50, 8703.21.01 and 8711.50.00 for Canada (8711.50 now banned under Proclamation 11063). China: '
    'notes 20 (Lists 1–4A) and 31(d) and 31(k); the note 20(vvv) exclusions for 8711.10.00.00, 8708.40.75.70 and 8716.40.00.00 run '
    'through November 9, 2026. Note 30(b) lists the Russia 35% lines.'
)

# ================================================================== tariffEngineering
te = d['tariffEngineering']
te['h1'] = f'HTS Chapter 87: {SHORT} — Import Documents & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing a Car into the U.S.: EPA 3520-1, DOT HS-7, 25-Year Rule, USMCA U.S. Content & Legal Ways to Lower Auto Tariffs (HTS Ch. 87) | KoalaGains',
    'shortDescription': (
        'What each HTS Chapter 87 line needs at U.S. entry — EPA Form 3520-1, the DOT HS-7 declaration, registered importers, the '
        '25-year rule, CPSC bicycle rules, AD/CVD — and the legal ways to pay less: USMCA U.S. content, vehicle-part status, deal rates, '
        'the certified-parts election, drawback and foreign-trade zones.'
    ),
    'keywords': [
        'importing a car to the us',
        'importing a used car to the us',
        '25 year import rule usa',
        'epa form 3520-1',
        'dot hs-7 declaration',
        'registered importer nhtsa',
        'usmca auto rules of origin',
        'section 232 auto parts usmca',
        'e bike tariff code',
        'trailer tariff code',
    ],
}
te['intro'] = (
    '**Vehicles are regulated products.** A car, truck or motorcycle enters only if it meets the U.S. emission and safety standards '
    'or qualifies for an exemption: the importer files **EPA Form 3520-1** (3520-21 for heavy-duty engines) and the **DOT HS-7** '
    'declaration with the entry. A vehicle built to U.S. standards carries the manufacturer\'s EPA label and FMVSS certification '
    'label; a non-conforming one must go through an EPA Independent Commercial Importer and a NHTSA Registered Importer, or be at least '
    '**25 years old** (NHTSA) — EPA\'s own age exemption follows its separate rules. ATVs, off-highway motorcycles and snowmobiles '
    'follow EPA\'s nonroad rules; bicycles and low-speed e-bikes the CPSC bicycle standard; wheelchairs are FDA devices.\n\n'
    'On cost, the levers are: proving **U.S. content** for USMCA vehicles, claiming **USMCA** on parts, showing whether a listed article '
    'is really a **car or truck part**, the right **classification** (a cab chassis pays 4% where a complete truck pays 25%), the '
    '**country deal rates**, the opt-in **certified-parts** headings, and the usual **drawback**, **foreign-trade zone**, first-sale '
    'and **Chapter 98** provisions.'
)
te['regulationsAsOf'] = ECFR_AS_OF
te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations and the tariff schedule — not legal advice. Whether a vehicle '
    'is a passenger vehicle, light truck or MHDV, whether an article is a vehicle part, what share of a vehicle is U.S. content and '
    'which AD/CVD case applies depend on the facts of each shipment, and the Section 232 and Section 301 headings change by '
    'proclamation and notice; confirm with CBP (a binding ruling under 19 CFR part 177), EPA and NHTSA before importing.'
)
CSMS_USMCA = 'https://content.govdelivery.com/bulletins/gd/USDHSCBP-3e9bbf4'
CSMS_MHDV = 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3f93b75'
CSMS_MHDV_USMCA = 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/4162184'
CBP_FAQ = 'https://www.cbp.gov/trade/programs-administration/entry-summary/section-232-additional-faqs-autos'
te['levers'] = [
    {
        'id': 'usmca-content',
        'title': 'Get Commerce approval of the U.S. content of USMCA vehicles',
        'saves': 'The 25% Section 232 duty on the U.S.-content share: a $40,000 USMCA SUV with $16,000 of U.S. content pays $6,000 instead of $10,000',
        'appliesTo': 'Passenger vehicles and light trucks (note 33(b)) and medium- and heavy-duty trucks (note 38(b)) from Mexico or Canada that qualify for USMCA; not buses',
        'document': 'A USMCA certification of origin, plus the Secretary of Commerce\'s approval of the importer\'s documentation of U.S. content (parts wholly obtained, produced entirely or substantially transformed in the United States); the entry is split into a 9903.94.03 (or 9903.74.03) line for the non-U.S. content and a 9903.94.02 (or 9903.74.06) line for the U.S. content.',
        'caveat': 'Without an approval the 25% is charged on the full value. The vehicle must first qualify under the USMCA automotive rules of origin (general note 11). Buses of 8702 pay 10% on the full value.',
        'citations': [
            {'label': 'HTSUS Chapter 99, U.S. notes 33(d) and 38(d)', 'url': CH99_PDF},
            {'label': 'CSMS # 65649652 (USMCA cars and light trucks)', 'url': CSMS_USMCA},
            {'label': 'CSMS # 68559236 (USMCA trucks)', 'url': CSMS_MHDV_USMCA},
            {'label': 'HTSUS General Note 11 (USMCA rules of origin)', 'url': GN_PDF},
        ],
    },
    {
        'id': 'usmca-parts',
        'title': 'Claim USMCA on parts and other goods from Mexico or Canada',
        'saves': 'The base rate, the 25% Section 232 parts duty (car and truck parts) and the 10% Section 301 duty: a USMCA axle pays nothing instead of 27.5%',
        'appliesTo': 'Auto parts of 8706–8708 and the other listed parts, truck parts, motorcycles, bicycles, trailers and other goods from Mexico or Canada',
        'document': 'A certification of origin from the importer, exporter or producer, with the records showing the good meets the USMCA rule (regional value content and the other automotive requirements for vehicle parts).',
        'caveat': 'Knock-down kits and parts compilations are not covered by the parts relief. Canada\'s Section 338 duty (golf carts, small vehicles) applies even to USMCA goods, and USMCA does not lift the Section 232 metals duty on trailers, bumpers and other derivatives.',
        'citations': [
            {'label': 'HTSUS Chapter 99, U.S. notes 33(h), 38(k), 52(g)–(h)', 'url': CH99_PDF},
            {'label': '19 CFR part 182 (USMCA)', 'url': ecfr_part(19, 182)},
            {'label': 'HTSUS General Note 11', 'url': GN_PDF},
        ],
    },
    {
        'id': 'vehicle-part',
        'title': 'Show whether a listed article is really a car or truck part',
        'saves': 'The 25% Section 232 parts duty (15% or 10% from deal partners) on listed articles that are not parts of passenger vehicles, light trucks or medium- and heavy-duty vehicles — they pay the base rate plus the Section 301 duty for the country instead',
        'appliesTo': 'The note 33(g) and 38(i) lines: chassis, bodies, most of 8708 (for example axles, brakes, gearboxes for farm tractors, forklifts or other machinery), trailer parts of 8716.90.50',
        'document': 'Product specifications and sales records showing the vehicle the article is designed and sold for; enter it under 9903.94.06 (note 33(h)(ii)) or 9903.74.11 (note 38(l)).',
        'caveat': 'CBP looks at the article as designed and sold; a part sold for both uses is a vehicle part for the share used in cars or trucks. Most of these articles from China still pay the 25% List 3 duty.',
        'citations': [
            {'label': 'HTSUS Chapter 99, U.S. notes 33(g)–(h), 38(i)–(l)', 'url': CH99_PDF},
            {'label': 'CBP Section 232 FAQs: automobiles and parts', 'url': CBP_FAQ},
        ],
    },
    {
        'id': 'classify',
        'title': 'Classify the vehicle by what it is as imported',
        'saves': 'Up to 25 points of base rate and the Section 232 vehicle duty: a cab chassis (8704.22.11, 4%) vs a complete truck (8704.22.51, 25%); a passenger vehicle (8703, 2.5%) vs a goods vehicle (8704, 25%); a vehicle of 8703.21 (up to 1,000 cc) or 8703.10 outside the auto action',
        'appliesTo': 'Vans, pickups, cab chassis, side-by-sides and ATVs, golf carts, e-bikes (8711.60, Free) vs bicycles (8712, 11%)',
        'document': 'A binding ruling from CBP describing the vehicle as imported: design, seating, cargo area, engine, G.V.W., motor power.',
        'caveat': 'Classification follows the vehicle\'s condition and principal design at import; post-import conversion does not change it and is examined. Chapter note 3: chassis fitted with cabs go to 8702–8704, not 8706.',
        'citations': [
            {'label': 'HTSUS Chapter 87 notes', 'url': CH87_PDF},
            {'label': '19 CFR part 177 (rulings)', 'url': ecfr_part(19, 177)},
        ],
    },
    {
        'id': 'origin-deals',
        'title': 'Know the country of origin and the deal rates',
        'saves': 'The gap between 15% (EU, Japan, Korea cars and parts; Taiwan parts), 10% (UK cars in quota, UK listed parts) and 27.5% (cars from other countries) — or 127.5% for a Chinese EV',
        'appliesTo': 'Passenger vehicles, light trucks and listed auto parts',
        'document': 'Production records showing where the vehicle or part was last substantially transformed, and the origin marking.',
        'caveat': 'The deal rates are floors: a 25% pickup from Japan, the EU or Korea stays at 25%. UK cars pay 27.5% once the quarterly or annual quota fills. Trucks, buses and truck parts have no deal rates.',
        'citations': [
            {'label': 'HTSUS Chapter 99, U.S. notes 33(i)–(u)', 'url': CH99_PDF},
            {'label': '19 CFR 134.11 (origin marking)', 'url': ecfr(19, '134.11')},
        ],
    },
    {
        'id': 'certified-parts',
        'title': 'Use the certified-parts election when it is cheaper',
        'saves': 'Parts that would pay the 25% metals duty (or 25% + Section 301) can enter at 15% in total from the EU, Japan, Korea or Taiwan, 10% from the UK for UK-built cars, or 25% from elsewhere with no Section 301 duty',
        'appliesTo': 'Parts not on the note 33(g) / 38(i) lists and not in chapters 72, 73 or 76 that will be used for U.S. vehicle production or repair — for example other parts of 8708.99 that now pay the metals duty',
        'document': 'The importer of record\'s certification that the parts will be used for automobile (or MHDV) production or repair in the United States, with the information CBP requires (headings 9903.94.07, .33, .45, .55, .65, .69; 9903.74.09).',
        'caveat': 'An election, not a requirement: from countries without a deal it raises the duty on parts that would otherwise pay only the 10%–12.5% Section 301 rate. USMCA parts certified this way pay nothing (9903.94.06, 9903.74.10).',
        'citations': [
            {'label': 'HTSUS Chapter 99, U.S. notes 33(p)–(r), 38(j)', 'url': CH99_PDF},
            {'label': 'CSMS # 66665333', 'url': CSMS_MHDV},
        ],
    },
    {
        'id': 'old-vehicles',
        'title': 'Vehicles 25 years old or more',
        'saves': 'The 25% Section 232 vehicle duty (9903.94.04, 9903.74.07) — a 25-year-old import from Japan pays 12.5% instead of 15%, from a country without a deal its base rate plus Section 301 instead of 27.5%',
        'appliesTo': 'Passenger vehicles, light trucks and medium- and heavy-duty vehicles manufactured in a year at least 25 years before the year of entry',
        'document': 'Proof of the manufacture date (title, build plate, VIN decoding); for NHTSA, the HS-7 declaration that the vehicle is 25 or more years old.',
        'caveat': 'The 2026 Section 301 duty still applies (note 52(f) does not list 9903.94.04). EPA has its own rules: a vehicle not exempt by age under 40 CFR 85.1511 needs an EPA-compliant entry.',
        'citations': [
            {'label': 'HTSUS Chapter 99, U.S. notes 33(e) and 38(g)', 'url': CH99_PDF},
            {'label': '49 U.S.C. 30112(b)(9)', 'url': USC_30112},
            {'label': '49 CFR 591.5(i)', 'url': ecfr(49, '591.5')},
        ],
    },
    {
        'id': 'returning-vehicle',
        'title': 'Bring back your own vehicle duty-free',
        'saves': 'All duty on a U.S. resident\'s vehicle taken abroad and returned, and on U.S.-made goods returned unchanged',
        'appliesTo': 'Cars, motorcycles, trailers and other vehicles taken abroad by U.S. residents; American-made vehicles and parts returned without being advanced in value',
        'document': 'Proof that the vehicle was taken abroad (registration, export record); for American goods, proof of U.S. origin and export.',
        'caveat': 'Repairs and alterations abroad are dutiable on their value (9802.00.40/.50); for Section 232 goods 9802.00.60 is assessed on the full value (note 33(a)). The vehicle must still meet EPA and NHTSA entry rules.',
        'citations': [
            {'label': '19 CFR 148.32', 'url': ecfr(19, '148.32')},
            {'label': 'HTSUS Chapter 98', 'url': CH98_PDF},
            {'label': '19 CFR 10.8', 'url': ecfr(19, '10.8')},
        ],
    },
    {
        'id': 'first-sale',
        'title': 'Value at the first sale for export when you buy through a middleman',
        'saves': 'Every ad valorem duty is charged on a lower value — the base rate and the 25% to 100% extra duties — when the factory price to a trading company is lower than the price you pay',
        'appliesTo': 'Parts, bicycles, e-bikes and trailers bought through a trading company rather than straight from the maker',
        'document': 'Proof that the first sale was a bona fide sale for export to the United States at arm\'s length: the factory invoice, contracts and payment records.',
        'caveat': 'Only a sale clearly destined for the U.S. qualifies. AD/CVD deposits follow Commerce\'s own rules.',
        'citations': [{'label': '19 CFR 152.103 (transaction value)', 'url': ecfr(19, '152.103')}],
    },
    {
        'id': 'drawback',
        'title': 'Recover duty on goods you export or destroy',
        'saves': 'Up to 99% of the duties paid, when imported vehicles or parts (or vehicles built with them) are exported',
        'appliesTo': 'Any line; common for parts used in U.S.-built vehicles that are exported',
        'document': 'A drawback claim to CBP with import, manufacturing and export records.',
        'caveat': 'AD/CVD deposits are not refundable as drawback, and each Chapter 99 duty\'s eligibility should be checked first; the 2026 metals proclamations limit drawback on the metals duties.',
        'citations': [
            {'label': '19 CFR part 190', 'url': ecfr_part(19, 190)},
            {'label': '19 CFR 191.3', 'url': ecfr(19, '191.3')},
        ],
    },
    {
        'id': 'ftz',
        'title': 'Assemble, hold or re-export in a foreign-trade zone',
        'saves': 'No duty on vehicles and parts re-exported from the zone, and duty deferred until goods leave it for the U.S. market',
        'appliesTo': 'Any line — used by vehicle assembly plants and parts distributors',
        'document': 'Zone admission (CBP Form 214) and the zone operator\'s inventory records.',
        'caveat': 'Section 232 vehicles and parts, and deal-rate goods, admitted to a zone must take privileged foreign status (notes 33(i)–(u)), which fixes their duty at admission; the inverted-tariff benefit is lost.',
        'citations': [
            {'label': '19 CFR part 146', 'url': ecfr_part(19, 146)},
            {'label': '19 CFR 146.41 (privileged foreign status)', 'url': ecfr(19, '146.41')},
        ],
    },
]
te['rules'] = [
    {
        'id': 'epa-emissions',
        'agency': 'EPA / CBP',
        'title': 'Motor vehicles and engines must meet EPA emission standards: the importer files EPA Form 3520-1 (3520-21 for heavy-duty engines) in ACE; a vehicle without an EPA certificate label enters only under an exemption or exclusion (for example by age or for racing) or through an EPA Independent Commercial Importer, and can be held 30 days pending the forms',
        'citations': [
            {'label': '19 CFR 12.73', 'url': ecfr(19, '12.73')},
            {'label': '40 CFR 85.1501', 'url': ecfr(40, '85.1501')},
            {'label': '40 CFR 85.1511 (exemptions and exclusions)', 'url': ecfr(40, '85.1511')},
            {'label': '42 U.S.C. 7522', 'url': USC_7522},
        ],
    },
    {
        'id': 'nhtsa-fmvss',
        'agency': 'NHTSA / CBP',
        'title': 'Vehicles and vehicle equipment must meet the Federal Motor Vehicle Safety, bumper and theft-prevention standards: the importer files the DOT HS-7 declaration; a non-conforming vehicle enters only through a NHTSA Registered Importer for a model NHTSA has found eligible, under bond, or under an exemption (25 or more years old, research, show or display)',
        'citations': [
            {'label': '19 CFR 12.80', 'url': ecfr(19, '12.80')},
            {'label': '49 CFR 591.5', 'url': ecfr(49, '591.5')},
            {'label': '49 CFR part 592 (registered importers)', 'url': ecfr_part(49, 592)},
            {'label': '49 CFR part 593 (import eligibility)', 'url': ecfr_part(49, 593)},
            {'label': '49 U.S.C. 30112 and 30141', 'url': USC_30141},
        ],
    },
    {
        'id': 'nhtsa-labels',
        'agency': 'NHTSA',
        'title': 'Each vehicle carries a 17-character VIN and the manufacturer\'s certification label; foreign manufacturers of vehicles and equipment designate a U.S. agent for service of process',
        'citations': [
            {'label': '49 CFR part 565 (VIN)', 'url': ecfr_part(49, 565)},
            {'label': '49 CFR 567.4 (certification label)', 'url': ecfr(49, '567.4')},
            {'label': '49 CFR 571 (FMVSS)', 'url': ecfr_part(49, 571)},
            {'label': '49 CFR 551.45 (U.S. agent)', 'url': ecfr(49, '551.45')},
        ],
    },
    {
        'id': 'epa-nonroad',
        'agency': 'EPA',
        'title': 'Snowmobiles, off-highway motorcycles and ATVs are recreational vehicles under EPA\'s nonroad rules: they need an EPA certificate, and the import rules of 40 CFR part 1068 apply',
        'citations': [
            {'label': '40 CFR 1051.1', 'url': ecfr(40, '1051.1')},
            {'label': '40 CFR 1068.301', 'url': ecfr(40, '1068.301')},
        ],
    },
    {
        'id': 'cpsc-bicycles',
        'agency': 'CPSC',
        'title': 'Bicycles, including low-speed electric bicycles (fully operable pedals, motor under 750 W, under 20 mph on the motor alone), must meet the CPSC bicycle safety standard; low-speed e-bikes are consumer products, not motor vehicles',
        'citations': [
            {'label': '16 CFR part 1512', 'url': ecfr_part(16, 1512)},
            {'label': '16 CFR 1512.2 (definitions)', 'url': ecfr(16, '1512.2')},
            {'label': '15 U.S.C. 2085', 'url': USC_2085},
        ],
    },
    {
        'id': 'cpsc-strollers',
        'agency': 'CPSC',
        'title': 'Carriages and strollers must meet the CPSC safety standard for carriages and strollers',
        'citations': [{'label': '16 CFR part 1227', 'url': ecfr_part(16, 1227)}],
    },
    {
        'id': 'fda-wheelchairs',
        'agency': 'FDA',
        'title': 'Wheelchairs and mobility scooters are medical devices: mechanical wheelchairs are Class I, powered wheelchairs and motorized three-wheeled vehicles Class II (510(k)); the foreign establishment must be registered and the device listed',
        'citations': [
            {'label': '21 CFR 890.3850', 'url': ecfr(21, '890.3850')},
            {'label': '21 CFR 890.3860', 'url': ecfr(21, '890.3860')},
            {'label': '21 CFR 890.3800', 'url': ecfr(21, '890.3800')},
        ],
    },
    {
        'id': 'adcvd',
        'agency': 'Commerce (ITA) / CBP',
        'title': 'Antidumping and countervailing duty cash deposits apply to chassis (China, Mexico, Thailand, Vietnam), steel wheels and steel trailer wheels (China), brake drums (China, Türkiye), golf carts and other low-speed vehicles (China), hand trucks (China) and, provisionally, van-type trailers (China, Mexico, Canada); the importer declares the case number and the exporter\'s rate, and the order\'s written scope decides coverage',
        'citations': [
            {'label': '19 CFR part 351', 'url': ecfr_part(19, 351)},
            {'label': '91 FR 36806 (chassis: Mexico, Thailand, Vietnam)', 'url': next(s['url'] for s in tu['sources'] if s['id'] == 'ad-chassis-mtv')},
            {'label': '90 FR 38730 (brake drums)', 'url': next(s['url'] for s in tu['sources'] if s['id'] == 'ad-brake-drums')},
        ],
    },
    {
        'id': 'cbp-marking',
        'agency': 'CBP',
        'title': 'Country-of-origin marking in English, legible and permanent enough to reach the ultimate purchaser — on the part, bicycle or carton; vehicles carry the origin of the final assembly',
        'citations': [{'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')}],
    },
    {
        'id': 'cbp-ch99',
        'agency': 'CBP',
        'title': 'Report the Chapter 99 heading with the line: the vehicle heading (9903.94.01, or a deal, quota, USMCA-content or relief heading), the parts heading (9903.94.05/.06 or a deal heading), the truck and bus headings (9903.74.01–.11), or the metals heading; otherwise the Section 301 heading for the country; China list and note 31 headings on top; 9903.03.14 for the Canada Section 338 duty',
        'citations': [
            {'label': 'HTSUS Chapter 99', 'url': CH99_PDF},
            {'label': 'CSMS # 66665333', 'url': CSMS_MHDV},
            {'label': 'CBP Section 232 FAQs: automobiles and parts', 'url': CBP_FAQ},
        ],
    },
]

VEH_RULES = ['epa-emissions', 'nhtsa-fmvss', 'nhtsa-labels', 'cbp-marking', 'cbp-ch99']
PART_RULES = ['nhtsa-labels', 'cbp-marking', 'cbp-ch99']
GROUP_RULES = {
    '8701': VEH_RULES,
    '8702': VEH_RULES,
    '8703': VEH_RULES + ['epa-nonroad', 'adcvd'],
    '8704': VEH_RULES,
    '8705': VEH_RULES,
    '8706': ['cbp-marking', 'cbp-ch99', 'adcvd'],
    '8707': ['cbp-marking', 'cbp-ch99', 'adcvd'],
    '8708': PART_RULES + ['adcvd'],
    '8709': ['cbp-marking', 'cbp-ch99'],
    '8710': ['cbp-marking', 'cbp-ch99'],
    '8711': VEH_RULES + ['epa-nonroad', 'cpsc-bicycles'],
    '8712': ['cpsc-bicycles', 'cbp-marking', 'cbp-ch99'],
    '8713': ['fda-wheelchairs', 'cbp-marking', 'cbp-ch99'],
    '8714': ['cbp-marking', 'cbp-ch99'],
    '8715': ['cpsc-strollers', 'cbp-marking', 'cbp-ch99'],
    '8716': ['nhtsa-fmvss', 'cbp-marking', 'cbp-ch99', 'adcvd'],
}
GROUP_NOTES = {
    '8701': 'Road tractors are trucks for the Section 232 truck duty (25%) and need EPA and DOT entry papers; farm tractors are nonroad equipment (EPA nonroad engine rules) and carry the 15% metals duty.',
    '8702': 'Buses pay +10% Section 232 from every country, USMCA included. Electric buses from China add 100%.',
    '8703': 'The note 33(b) lines (8703.22–8703.90) pay the Section 232 auto duty; 8703.10 and 8703.21 are outside it and carry the metals duty instead. EPA Form 3520-1 and DOT HS-7 at entry; 25-year-old vehicles are exempt from FMVSS and from the Section 232 duty.',
    '8704': 'Light trucks (up to 5 t) pay the auto duty, heavier trucks the truck duty; both at 25%. Cab chassis (8704.22.11) pay a 4% base rate, complete trucks 25%.',
    '8705': 'Mobile cranes and drilling derricks: metals duty on mobile equipment; concrete mixers and other special trucks: truck duty; fire trucks: Section 301 only.',
    '8706': 'Chassis for cars are auto parts; chassis for trucks and buses are trucks or truck parts. Chinese chassis for container trailers are not here but in 8716 (AD/CVD).',
    '8707': 'Car bodies are auto parts, truck and bus bodies truck parts (25%), when used in those vehicles.',
    '8708': 'Most lines are on the auto-parts (33(g)) and truck-parts (38(i)) lists: 25% only when the article is such a part. Chinese and Turkish brake drums and Chinese steel wheels carry AD/CVD deposits.',
    '8709': 'Works trucks are on the truck list (25%); their parts pay the truck-parts duty when used in such vehicles.',
    '8710': 'Free at base; only the Section 301 duty for the country applies.',
    '8711': 'Motorcycles need EPA and DOT papers; e-bikes that meet the low-speed electric bicycle definition follow the CPSC bicycle rules instead. Canadian motorcycles over 800 cc are banned.',
    '8712': 'CPSC bicycle standard (16 CFR 1512). Chinese bicycles pay 25% List 3 plus 12.5%.',
    '8713': 'FDA medical devices; Free at base, Section 301 duty for the country only.',
    '8714': 'Bicycle parts pay Free to 10% at base; no Section 232 duty.',
    '8715': 'CPSC stroller standard (16 CFR 1227); 4.4% base.',
    '8716': 'Trailers and semi-trailers with lighting must meet FMVSS (DOT HS-7). Most trailers, hand trucks and trailer parts carry the 25% metals duty; chassis, van-type trailers, steel trailer wheels and hand trucks face AD/CVD.',
}
for g in te['groups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['ruleIds'] = GROUP_RULES[g['heading']]
    g['note'] = GROUP_NOTES[g['heading']]

AUTOS = set(covered('s232-autos'))
PARTS = set(covered('s232-auto-parts'))
MHDV = MHDV_SET | set(covered('s232-buses'))
MHDVP = MHDVP_SET
COMMON = ['origin-deals', 'first-sale', 'drawback', 'ftz', 'returning-vehicle']
for ln in te['lines']:
    h = ln['hts'][:4]
    ln['ruleIds'] = GROUP_RULES[h]
    levers = ['usmca-parts', 'classify']
    if ln['hts'] in AUTOS or ln['hts'] in MHDV:
        levers = ['usmca-content', 'old-vehicles', 'classify']
    if ln['hts'] in PARTS or ln['hts'] in MHDVP:
        levers = ['usmca-parts', 'vehicle-part', 'certified-parts', 'classify']
    elif h in ('8708', '8706', '8707', '8716'):
        levers = ['usmca-parts', 'certified-parts', 'classify']
    ln['leverIds'] = levers + COMMON

# ================================================================== finalConclusion
fc = d['finalConclusion']
fc['h1'] = f'HTS Chapter 87: {SHORT} — Tariff FAQ'
fc['seo'] = {
    'title': 'Car Tariff FAQ 2026: Japan, Germany, Korea, Mexico, Canada, UK & Chinese EVs, Auto Parts, Chicken Tax, 25-Year Rule (HTS Ch. 87) | KoalaGains',
    'shortDescription': (
        'Answers to what people search about U.S. tariffs on cars and auto parts: rates by country, USMCA U.S. content, Chinese EVs, '
        'the Section 232 parts list, truck tariffs, the chicken tax, the 25-year import rule, bicycles, e-bikes and the HS codes.'
    ),
    'keywords': [
        'car tariffs 2026',
        'auto tariffs us',
        'how much is the tariff on cars',
        'are tariffs on cars still in effect',
        'tariffs on cars from japan',
        'tariffs on cars from canada to us',
        'chinese ev tariffs us',
        'auto parts tariffs us',
        'truck tariffs 232',
        'chicken tax',
        '25 year import rule usa',
        'e bike tariffs',
        'hs code for car parts',
    ],
}
fc['intro'] = (
    'Straight answers to the most common questions about U.S. tariffs and import rules for cars, trucks, auto parts, motorcycles, '
    'bicycles and trailers. Each answer links to the page with the full detail.'
)
fc['keyTakeaways'] = [
    'Cars pay a 2.5% base rate and pickups 25%, plus the 25% Section 232 automobile duty in force since April 3, 2025: 27.5% for a car from most countries.',
    'The EU, Japan and South Korea pay 15% in total on cars, SUVs and listed parts (a 25% pickup stays 25%); UK cars pay 10% inside a 100,000-vehicle quota.',
    'USMCA cars and trucks from Mexico and Canada pay 25% only on their non-U.S. content once Commerce approves it; USMCA parts pay nothing.',
    'Chinese EVs pay 127.5%: 2.5% + 100% Section 301 + 25% Section 232. Other Chinese cars pay 52.5%.',
    'Listed auto parts pay 25% (from May 3, 2025) only when they are car or light-truck parts; trucks over 5 t and their parts pay 25% and buses 10% since November 1, 2025.',
    'Motorcycles, bicycles, e-bikes and other goods outside Section 232 pay the 2026 Section 301 duty for their country (10%–12.5%; China 25% more). The IEEPA tariffs ended February 24, 2026.',
    'Every vehicle needs EPA Form 3520-1 and the DOT HS-7 at entry; a vehicle at least 25 years old is exempt from the U.S. safety standards and from the Section 232 duty.',
]
fc['questionSource'] = 'Google search suggestions (United States, English), collected October 13, 2026'
fc['faqs'] = [
    {
        'id': 'what-is-ch87',
        'question': 'What does HTS Chapter 87 cover?',
        'searchedAs': ['chapter 87 hts', 'chapter 87 htsus', 'chapter 87 hts code', 'chapter 87 hts 2025'],
        'answer': (
            f'Chapter 87 of the Harmonized Tariff Schedule covers vehicles other than railway rolling stock and their parts: tractors '
            '(8701), buses (8702), cars and SUVs (8703), trucks (8704), special-purpose vehicles (8705), chassis (8706), bodies (8707), '
            'auto parts (8708), works trucks (8709), armored vehicles (8710), motorcycles and e-bikes (8711), bicycles (8712), '
            f'wheelchairs (8713), bike and motorcycle parts (8714), strollers (8715) and trailers (8716). It has {N_LINES} tariff lines; '
            f'{N_DUTIABLE} carry a base duty, from 1.4% to 25%.'
        ),
        'link': '',
    },
    {
        'id': 'car-tariffs-2026',
        'question': 'What is the U.S. tariff on imported cars in 2026, and is it still in effect?',
        'searchedAs': ['car tariffs 2026', 'tariffs on cars', 'auto tariffs us', 'car import tariffs us', 'how much is the tariff on cars',
                       'are tariffs on cars still in effect', 'auto tariffs effective date'],
        'answer': (
            'Yes. Cars, SUVs, minivans and light trucks pay their base rate (2.5% for cars, 25% for pickups) plus a 25% Section 232 duty '
            '(9903.94.01) in force since April 3, 2025, new or used: 27.5% for a car from most countries. It was not part of the IEEPA '
            'tariffs that ended February 24, 2026. Lower totals: 15% for the EU, Japan and South Korea, 10% for UK cars inside the quota, '
            '25% of the non-U.S. content for USMCA vehicles. Chinese EVs pay 127.5%.'
        ),
        'link': 'industry-areas',
    },
    {
        'id': 'japan-eu-korea',
        'question': 'What is the tariff on cars from Japan, Germany and South Korea?',
        'searchedAs': ['tariffs on cars from japan', 'tariff on german cars in us', 'tariffs on cars from europe', 'us tariff on korean cars',
                       'current tariff on japanese cars', 'tariffs on cars from germany'],
        'answer': (
            'Cars and SUVs from Japan (since September 16, 2025), the EU including Germany (since August 1, 2025) and South Korea (since '
            'November 1, 2025) pay 15% in total — the 2.5% base rate and the Section 232 duty combined (9903.94.41, 9903.94.51, '
            '9903.94.61): $4,500 on a $30,000 car. Pickups keep their 25% rate. Listed auto parts from these countries also pay 15%. '
            'Heavy trucks and buses have no deal rate.'
        ),
        'link': 'industry-areas',
    },
    {
        'id': 'mexico-canada',
        'question': 'How are cars from Mexico and Canada taxed under USMCA?',
        'searchedAs': ['tariffs on cars from canada to us', 'tariffs on cars from mexico', 'us tariff on canadian cars', '25 tariff on canadian cars',
                       'usmca auto tariffs', 'tariff on mexican cars'],
        'answer': (
            'A car or light truck that qualifies for USMCA pays no base rate and a 25% Section 232 duty only on the value of its non-U.S. '
            'content (9903.94.03), once the Secretary of Commerce approves the importer\'s documentation of U.S. content (parts wholly '
            'obtained, produced or substantially transformed in the United States); the U.S. content is entered at 0% under 9903.94.02. '
            'A $30,000 car with $12,000 of approved U.S. content pays $4,500. Without an approval it pays 25% of the full value; without '
            'a USMCA claim 27.5%. USMCA parts pay nothing. Heavy trucks follow the same content rule; buses pay 10%. Canadian golf carts '
            'and vehicles up to 1,000 cc also pay a 50% Section 338 duty.'
        ),
        'link': 'industry-areas',
    },
    {
        'id': 'uk-cars',
        'question': 'What is the tariff on cars from the UK?',
        'searchedAs': ['tariffs on uk cars to us', 'us tariffs on british cars', 'tariffs on cars from uk', 'trump tariffs on uk cars'],
        'answer': (
            'UK passenger cars pay 10% (2.5% base + 7.5%, 9903.94.31) within a tariff-rate quota of 100,000 vehicles a year — no more '
            'than 25,000 a quarter, plus unused quantity carried forward — and 27.5% once CBP reports the quota filled. UK light trucks '
            'have no quota (25% + 25%). Listed UK auto parts pay 10% in total (9903.94.32).'
        ),
        'link': 'industry-areas',
    },
    {
        'id': 'china-ev',
        'question': 'What is the U.S. tariff on Chinese EVs?',
        'searchedAs': ['chinese ev tariffs us', 'chinese ev tariffs', 'tariffs on cars from china', 'electric car tariffs'],
        'answer': (
            'A Chinese electric or plug-in hybrid car pays 127.5%: the 2.5% base rate, 100% under the 2024 Section 301 increase '
            '(9903.91.03, since September 27, 2024) and 25% Section 232. The 12.5% 2026 Section 301 duty does not apply to Section 232 '
            'vehicles. A $40,000 EV owes $51,000. Gasoline cars and conventional hybrids from China pay 52.5% (25% List 1 instead of '
            '100%). EV batteries shipped separately are in Chapter 85.'
        ),
        'link': 'tariff-updates',
    },
    {
        'id': 'auto-parts',
        'question': 'Which auto parts pay the Section 232 tariff, and how much?',
        'searchedAs': ['auto parts tariffs us', 'section 232 auto parts', 'section 232 auto parts tariff list', 'auto parts tariffs hts list',
                       'tariffs on car parts from china', 'tariffs on car parts from canada to us', 'section 232 auto parts usmca'],
        'answer': (
            'The parts listed in U.S. note 33(g) to Chapter 99 — engines, transmissions, axles, brakes, bodies, chassis and most of '
            'heading 8708, plus tires, glass, batteries, lights, wiring sets and seats in other chapters — pay their base rate plus 25% '
            '(9903.94.05) since May 3, 2025, but only when they are parts of passenger vehicles or light trucks. Totals: 15% from the EU, '
            'Japan, Korea and Taiwan, 10% for listed UK parts, nothing under USMCA, 52.5% for a Chinese part (adds 25% List 3). Truck and '
            'bus parts on the note 38(i) list pay 25% since November 1, 2025.'
        ),
        'link': 'tariff-updates',
    },
    {
        'id': 'trucks',
        'question': 'What are the U.S. tariffs on trucks and buses?',
        'searchedAs': ['truck tariffs', 'truck tariffs 232', 'heavy truck tariffs', 'us truck tariffs section 232', 'truck tariffs 25'],
        'answer': (
            'Since November 1, 2025 medium- and heavy-duty vehicles — road tractors, trucks over 5 t, dumpers, concrete mixers, works '
            'trucks — pay their base rate (4% or 25%) plus 25% (9903.74.01), and buses 2% plus 10% (9903.74.02), from every country; '
            'there are no EU, Japan or Korea deal rates. USMCA trucks pay 25% of the non-U.S. content; USMCA buses still pay 10%. A '
            '$150,000 road tractor from outside North America pays 29%.'
        ),
        'link': 'tariff-updates',
    },
    {
        'id': 'chicken-tax',
        'question': 'What is the chicken tax on pickup trucks?',
        'searchedAs': ['chicken tax', 'chicken tax trucks', 'chicken tax small trucks', 'chicken tax tariff', 'chicken tax law'],
        'answer': (
            'The "chicken tax" is the 25% general base rate on light trucks (8704.21, 8704.31, 8704.41, 8704.51; G.V.W. up to 5 t) and on '
            'most heavier trucks — ten times the 2.5% rate on cars. Korea\'s KORUS rate on these trucks is also 25%. Since 2025 the '
            'Section 232 duty adds 25% more (50% in total) unless the truck is from the EU, Japan or Korea (15% floor, so the total stays '
            '25%) or qualifies for USMCA (Free base, 25% of the non-U.S. content).'
        ),
        'link': '',
    },
    {
        'id': 'import-car',
        'question': 'What do I need to import a car into the U.S.?',
        'searchedAs': ['importing a car to the us', 'importing a used car to the us', 'importing a car to usa from uk', 'importing a car from japan to the us',
                       'bringing a car to the us from canada', 'importing a car to the us from europe'],
        'answer': (
            'At entry you file EPA Form 3520-1 (19 CFR 12.73) and the DOT HS-7 declaration (19 CFR 12.80, 49 CFR 591.5), and pay the duty '
            'for the car\'s origin. A car built to U.S. standards carries the EPA label and the FMVSS certification label. A '
            'non-conforming car must be brought into compliance by a NHTSA Registered Importer for an eligible model and by an EPA '
            'Independent Commercial Importer, unless an exemption applies (for example 25 years or older for NHTSA). Your own U.S. car '
            'returning from abroad re-enters duty-free (19 CFR 148.32).'
        ),
        'link': 'tariff-engineering',
    },
    {
        'id': '25-year-rule',
        'question': 'What is the 25-year import rule?',
        'searchedAs': ['25 year import rule', '25 year import rule usa', '25 year import rule cars', '25 year import law', '25 year import rule japan'],
        'answer': (
            'A motor vehicle at least 25 years old does not have to meet the Federal Motor Vehicle Safety Standards to be imported '
            '(49 U.S.C. 30112(b)(9); box 1 of the HS-7, 49 CFR 591.5(i)). For tariffs, a passenger vehicle or light truck made in a year '
            'at least 25 years before the year of entry is also exempt from the 25% Section 232 duty (9903.94.04), but it pays the 2026 '
            'Section 301 duty: 12.5% in total from Japan, 10% from the EU. EPA emission rules are separate (40 CFR 85.1511).'
        ),
        'link': 'tariff-engineering',
    },
    {
        'id': 'bicycles-ebikes',
        'question': 'What are the tariffs on bicycles and e-bikes?',
        'searchedAs': ['bicycle tariffs', 'us bicycle tariffs', 'e bike tariffs', 'e bike import tariffs', 'e bike tariff code'],
        'answer': (
            'Bicycles (8712) pay 11%, or 5.5% for light road bikes and certain wheel sizes, plus the 2026 Section 301 duty for the country: '
            '48.5% for a standard Chinese bicycle (adds 25% List 3 and 12.5%), 23.5% from Vietnam, 21% from India, 11% from Taiwan or the '
            'EU (their 10% rate replaces only a lower base rate). E-bikes are classified with motorcycles (8711.60, Free): 37.5% from '
            'China, 12.5% from Vietnam, 10% from the EU or Taiwan. Neither pays Section 232. Low-speed e-bikes must meet the CPSC bicycle '
            'standard.'
        ),
        'link': 'industry-areas',
    },
    {
        'id': 'hs-codes',
        'question': 'What are the HS codes for cars and car parts?',
        'searchedAs': ['hs code for car', 'hs code for car parts', 'hts code for car parts', 'hs code 8703', 'hs code 8708', 'hs code 8703.80',
                       'hs code 8708.99'],
        'answer': (
            'Cars and SUVs are in heading 8703, by engine type and size: 8703.22–8703.24 gasoline, 8703.31–8703.33 diesel, 8703.40–8703.70 '
            'hybrids, 8703.80 electric (8703.80.00.20 new). Car parts are in 8708: bumpers 8708.10, body parts 8708.29, brakes 8708.30, '
            'gearboxes 8708.40, axles 8708.50, wheels 8708.70, shock absorbers 8708.80, radiators 8708.91, exhausts 8708.92, clutches '
            '8708.93, steering 8708.94, airbags 8708.95 and other parts 8708.99. Tires (4011), batteries (8507) and engines (8407–8408) '
            'are classified elsewhere.'
        ),
        'link': '',
    },
    {
        'id': 'motorcycles',
        'question': 'What are the U.S. tariffs on motorcycles?',
        'searchedAs': ['motorcycle tariffs us', 'motorcycle tariffs', 'tariffs motorcycle parts', 'motorcycle tariffs canada'],
        'answer': (
            'Motorcycles are Free up to 700 cc and 2.4% above, and are not under Section 232, so they pay the 2026 Section 301 duty for '
            'their country: 10% from the EU, 12.5% from Japan, 10% or 12.4% from India, 20%–39.9% from China (7.5% or 25% list duty plus '
            '12.5%). Motorcycles over 800 cc from Canada are banned from importation since September 29, 2026. Motorcycle parts (8714.10) '
            'are Free plus the same country duty.'
        ),
        'link': 'industry-areas',
    },
    {
        'id': 'trailers',
        'question': 'What are the tariffs on trailers and chassis?',
        'searchedAs': ['trailer tariff code', 'trailer tariff', 'trailer parts tariff code', 'chassis antidumping'],
        'answer': (
            'Trailers and semi-trailers (8716) are Free at base, but campers, van and platform trailers and container chassis carry the '
            '25% Section 232 metals duty (9903.82.09), and trailer parts 3.1% plus 25%. Chinese trailers add 25% List 3. Chassis from '
            'China (188.05% AD, 44.32% CVD), Mexico, Thailand and Vietnam carry AD/CVD deposits, Chinese intermodal chassis pay another '
            '100% from November 10, 2026, and van-type trailers from China, Mexico and Canada are under AD/CVD investigation.'
        ),
        'link': 'tariff-updates',
    },
]
assert 11 <= len(fc['faqs']) <= 15, len(fc['faqs'])

d['sources'] = [
    {'label': 'Harmonized Tariff Schedule of the United States', 'url': 'https://hts.usitc.gov/',
     'note': 'rate table rows, Chapter 87 notes and Chapter 99 (2026 Revision 21)'},
    {'label': 'UN Comtrade', 'url': 'https://comtradeplus.un.org/', 'note': f'{Y} import figures'},
]
