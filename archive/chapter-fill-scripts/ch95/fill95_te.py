# Tariff engineering page for Chapter 95 — exec'd from fill95.py (shares its globals).
te = d['tariffEngineering']
te['h1'] = f'HTS Chapter 95: {SHORT} — Import Rules & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing Toys into the U.S.: CPSC Toy Rules, Children\'s Product Certificate, eFiling & Tariff Engineering (HTS Ch. 95) | '
    'KoalaGains',
    'shortDescription': 'What toys, games and sporting goods need at U.S. entry — ASTM F963-23 (16 CFR 1250), small-parts and lead rules, '
    'third-party testing, the Children\'s Product Certificate and CPSC eFiling since July 8, 2026, FCC rules for consoles, the excise tax '
    'on fishing tackle — and the legal ways to pay less: origin, USMCA, Chapter 98, first sale, drawback, FTZ and rulings.',
    'keywords': [
        'hts chapter 95 tariff engineering',
        'toy import regulations',
        'importing toys to usa',
        'children\'s product certificate',
        'cpsc efiling requirements',
        'astm f963-23',
        'cpsia lead and phthalates',
        'small parts rule toys',
    ],
}
te['intro'] = (
    'Toys need no import license, but they carry **more safety paperwork than almost any other consumer good**. A toy for children 12 or '
    'younger must meet the mandatory toy standard (**ASTM F963-23**, 16 CFR part 1250), the small-parts, lead and phthalate limits, be '
    '**tested by a CPSC-accepted laboratory**, carry tracking labels, and be covered by a **Children\'s Product Certificate** — whose data '
    'importers must **eFile with CBP at entry since July 8, 2026**. Consoles and radio-controlled toys need FCC authorization, fishing '
    'tackle and archery equipment owe a federal excise tax when sold, and every article must be marked with its country of origin.\n\n'
    'On cost, most Chapter 95 lines are Free, so the levers are about the **extra duty**: the **country of origin** (Free outside the 60 '
    'Section 301 economies, 10% from Indonesia, Cambodia, India, Malaysia, Taiwan or the EU, 12.5% from China or Vietnam, 50% from Canada '
    'on the Section 338 lines), USMCA for Mexican goods, Chapter 98 provisions that the Section 301 duty does not reach, first-sale '
    'valuation, drawback and foreign-trade zones. Each lever depends on a document, listed below with its regulation.'
)
te['regulationsAsOf'] = '2026-10-08'
te['levers'] = [
    {
        'id': 'origin',
        'title': 'Know the country of origin — it decides almost the whole duty',
        'saves': 'On a Free toy, the whole duty: 12.5% from China, Vietnam or Thailand, 10% from Indonesia, Cambodia, India, Malaysia, Taiwan or '
        'the EU, 12.5% in total from Japan, 50% from Canada on the Section 338 lines, nothing from a country outside the 60 Section 301 '
        'economies. On List 4A sports goods China adds 7.5% more.',
        'appliesTo': 'All lines; the gap is widest on Canadian toys and consoles and on Chinese List 4A sports equipment',
        'document': 'Production records showing where the article was last substantially transformed — for a toy, typically where it is molded, '
        'assembled and decorated, not where it is packed; for goods of Canada or Mexico, the 19 CFR part 102 tariff-shift rules.',
        'caveat': 'Packing, labeling or adding batteries in a third country does not move the origin. The Section 301 and Section 338 duties '
        'follow the country of origin, not the country of export, and CBP can ask for proof.',
        'citations': [
            {'label': '19 CFR 134.1 (country of origin)', 'url': ecfr(19, '134.1')},
            {'label': '19 CFR 102.11 (origin of goods of Canada and Mexico)', 'url': ecfr(19, '102.11')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 51, 52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'usmca',
        'title': 'Claim USMCA on goods from Mexico — and know its limit for Canada',
        'saves': 'The 10% Section 301 duty (and the base rate on dutiable sports and fishing lines)',
        'appliesTo': 'All lines from Mexico; from Canada, every line except the 27 Section 338 lines (toys, consoles, arcade and other game '
        'machines, some Christmas and festive articles, golf parts, ice skates, exercise equipment, pools, other sports goods, fishing rods, '
        'hockey equipment)',
        'document': 'A certification of origin from the importer, exporter or producer, kept ready for CBP.',
        'caveat': 'USMCA does not remove the 50% Section 338 duty on the listed Canadian lines (U.S. note 51(a)). The good must meet its rule '
        'of origin in General Note 11. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.',
        'citations': [
            {'label': '19 CFR 182.12', 'url': ecfr(19, '182.12')},
            {'label': 'HTSUS General Note 11 (USMCA rules of origin)', 'url': GN_PDF},
            {'label': 'HTSUS 9903.05.93 / 9903.05.94, U.S. notes 51–52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'fta',
        'title': 'Claim an FTA or AGOA on dutiable sports goods and fishing tackle',
        'saves': 'The base rate — 2.6% to 9.2%, or 24¢ a reel — on the 48 dutiable lines',
        'appliesTo': 'Dutiable lines of 9506 and 9507 whose Special column lists the program: AGOA (D, to December 31, 2026), Australia (AU), '
        'Korea (KR), Singapore (SG), Chile (CL), CAFTA-DR (P), Japan (JP, on golf clubs, golf parts, tennis rackets not strung, some hooks, '
        'reels and line) and the other FTA partners',
        'document': 'The origin proof each program requires (a certification or declaration of origin, or the AGOA documentation) and '
        'records to back it up.',
        'caveat': 'An FTA removes the base rate but not the 2026 Section 301 duty of a listed country (U.S. note 52(a)) — Japanese and Korean '
        'golf clubs still pay 12.5% in total. Toys, games, Christmas articles and amusement rides are Free anyway. GSP (A) has been expired '
        'since December 31, 2020.',
        'citations': [
            {'label': 'HTSUS General Notes 3(c) and 8–34', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a)', 'url': CH99_PDF},
            {'label': '19 U.S.C. 2466a (AGOA)', 'url': USC_2466A},
            {'label': '19 U.S.C. 2463 (GSP)', 'url': USC_2463},
        ],
    },
    {
        'id': 'ch98',
        'title': 'Use a Chapter 98 provision: adaptive equipment, holiday utilitarian articles, U.S. goods returned',
        'saves': 'A Chapter 98 entry skips the 2026 Section 301 duty and the Canada Section 338 duty (U.S. notes 51(a), 52(a)): sports and play '
        'equipment specially designed or adapted for persons with a permanent disability enters Free (9817.00.96); utilitarian articles in the '
        'form of a holiday symbol — light-up figures, plastic or ceramic Christmas tableware — are Free under 9817.95.05; U.S.-made goods '
        'returned unchanged pay nothing (9801.00.10).',
        'appliesTo': 'Adaptive sports equipment; holiday-shaped utilitarian articles classified in plastics, ceramics, glass, textile or '
        'lighting headings (not Chapter 95); American toys and sports goods coming back',
        'document': 'For 9817.00.96, evidence the article is specially designed or adapted for persons with a permanent or chronic disability; '
        'for 9817.95.05, a description showing the three-dimensional holiday motif and the underlying subheading; for 9801.00.10, proof of U.S. '
        'origin and export.',
        'caveat': '9817.95.01 and 9817.95.05 cover only articles of the subheadings they list (for example 3924.10, 3926.90, 6307.90, 6911.10, '
        '6912.00, 7013, 9405.21–9405.50), not Christmas ornaments or decorations of heading 9505, which are Free anyway. Under 9802.00.80 '
        '(U.S. components assembled abroad) the Section 301 duty still applies to the value added abroad.',
        'provisions': [
            {
                'code': '9817.00.96',
                'rate': 'Free',
                'text': 'Articles specially designed or adapted for the use or benefit of physically or mentally handicapped persons (other than '
                'articles for the blind)',
            },
            {
                'code': '9817.95.05',
                'rate': 'Free',
                'text': 'Utilitarian articles in the form of a three-dimensional representation of a symbol or motif clearly associated with a '
                'specific holiday in the United States',
            },
            {'code': '9801.00.10', 'rate': 'Free', 'text': 'Products of the United States returned without having been advanced in value or improved'},
        ],
        'citations': [
            {'label': 'HTSUS Chapter 98, 9817.00.96, 9817.95.05, 9801.00.10', 'url': CH98_PDF},
            {'label': 'HTSUS Chapter 95, note 1(x)', 'url': CH95_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 51(a), 52(a)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'classification',
        'title': 'Check the heading: toy, sports article, festive article or something else',
        'saves': 'The gap between a Free Chapter 95 line and a dutiable one elsewhere — and between Chapter 95 lines: soccer balls and footballs '
        'are Free, basketballs and volleyballs 4.8%; golf balls Free, golf clubs 4.4%; fishing reels 9.2% up to $2.70 each, 24¢ each to $8.45, '
        '3.9% above. For Chinese goods it also decides List 4A (+7.5%) or the suspended List 4B.',
        'appliesTo': 'Toys sold with other items (note 4), pet toys (note 5, excluded), drones (8806), children\'s bicycles (8712), Christmas '
        'lighting strings (9405), sports bags (4202) and apparel (chapters 61–62), trading cards, pickleball sets',
        'document': 'A product description, photos and the retail packaging; for a set, what each item is and why the toy gives the essential '
        'character.',
        'caveat': 'Classification follows the HTS notes and CBP rulings, not marketing. CBP classifies Pokémon trading cards as playing cards '
        '(9504.40, NY N359352) and a pickleball set under 9506.99.60 (NY N347450); a ruling on a similar article is guidance, not a ruling for '
        'yours.',
        'citations': [
            {'label': 'HTSUS Chapter 95, notes 1, 3, 4, 5 and subheading note 1', 'url': CH95_PDF},
            {'label': 'CBP ruling NY N359352 (trading cards, 9504.40)', 'url': RULING_POKEMON},
            {'label': 'CBP ruling NY N347450 (pickleball set, 9506.99.60)', 'url': RULING_PICKLEBALL},
        ],
    },
    {
        'id': 'first-sale',
        'title': 'Value at the first sale for export when you buy through a middleman',
        'saves': 'Every ad valorem duty is charged on a lower value — the 10%–12.5% Section 301 duty, List 4A and Section 338 included — when the '
        'factory price to a trading company or licensor is lower than the price you pay. For fishing reels the value per reel also decides the '
        'rate bracket.',
        'appliesTo': 'All lines bought through a trading company, agent-buyer or brand owner rather than straight from the factory',
        'document': 'Proof that the first sale was a bona fide sale for export to the United States at arm\'s length: the factory invoice, '
        'contracts and payment records.',
        'caveat': 'Only a sale clearly destined for the U.S. qualifies, and the importer must be able to show the earlier price at entry.',
        'citations': [
            {'label': '19 CFR 152.103', 'url': ecfr(19, '152.103')},
        ],
    },
    {
        'id': 'drawback',
        'title': 'Recover duty on goods you export or destroy',
        'saves': 'Up to 99% of the duties paid, when imported toys, consoles or sports goods are exported (for example to Canadian or Latin '
        'American stores) or destroyed under CBP supervision',
        'appliesTo': 'Any line that paid a duty',
        'document': 'A drawback claim to CBP with import and export (or destruction) records that tie the goods together.',
        'caveat': 'Claims have filing deadlines and record-keeping rules; check whether a given Chapter 99 duty is eligible before relying on it.',
        'citations': [{'label': '19 CFR part 190', 'url': ecfr_part(19, 190)}],
    },
    {
        'id': 'ftz',
        'title': 'Hold, kit or relabel goods in a foreign-trade zone',
        'saves': 'No duty on goods re-exported from the zone, and duty deferred until they leave it for the U.S. market — useful for seasonal '
        'toy and Christmas inventory',
        'appliesTo': 'Any line — useful for distribution centers that also ship to Canada and Mexico',
        'document': 'Zone admission (CBP Form 214) and the zone operator\'s inventory records.',
        'caveat': 'Goods entered for consumption from a zone pay the duties in force on the entry date. CPSC certificate eFiling for goods '
        'entered from a zone starts January 8, 2027.',
        'citations': [
            {'label': '19 CFR part 146', 'url': ecfr_part(19, 146)},
            {'label': '16 CFR 1110.13 (certificate eFiling, FTZ entries)', 'url': ecfr(16, '1110.13')},
        ],
    },
    {
        'id': 'ieepa-refund',
        'title': 'Claim back IEEPA duties paid in 2025–2026',
        'saves': 'The IEEPA duties paid on goods entered between February 2025 and February 23, 2026 — for example 145%, then 30% and 20% on '
        'Chinese toys and consoles, 20% on Vietnamese and 19% on Indonesian or Malaysian goods — with interest',
        'appliesTo': 'Past entries of any line that paid an IEEPA duty (9903.01.xx, 9903.02.xx)',
        'document': 'A CAPE Declaration filed in the ACE Portal by the importer of record or its customs broker, listing the entries, plus ACH '
        'refund details on file.',
        'caveat': 'Phase 1 covers unliquidated entries and entries within the voluntary reliquidation period; other entries may need a protest or '
        'court action. It does not refund Section 301, List 4A or Section 338 duties. Refunds go to the importer of record.',
        'citations': [{'label': 'CBP: IEEPA Duty Refunds (CAPE)', 'url': CBP_REFUNDS}],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding classification ruling',
        'saves': 'Certainty where the line decides the rate or the extra duty: toy or not, set or not, List 4A or 4B line, Section 338 line or '
        'not, Chapter 95 or a utilitarian heading',
        'appliesTo': 'Any line where the design, use or materials decide the line',
        'document': 'A ruling request to CBP describing the article, with photos, a sample and the retail packaging.',
        'caveat': 'Rulings apply to the article described; a changed design or packaging may need a new one.',
        'citations': [
            {'label': '19 CFR part 177', 'url': ecfr_part(19, 177)},
            {'label': 'HTSUS Chapter 95 notes', 'url': CH95_PDF},
        ],
    },
]

te['rules'] = [
    {
        'id': 'cpsc-toy-standard',
        'agency': 'CPSC',
        'title': 'Toys must meet ASTM F963-23, the mandatory toy safety standard, plus the added water-bead (from March 12, 2026) and neck-float '
        '(from June 15, 2026) requirements',
        'citations': [
            {'label': '16 CFR 1250.2', 'url': ecfr(16, '1250.2')},
            {'label': '16 CFR 1250.4 (water beads)', 'url': ecfr(16, '1250.4')},
            {'label': '16 CFR 1250.5 (neck floats)', 'url': ecfr(16, '1250.5')},
            {'label': '15 U.S.C. 2056b (CPSIA section 106)', 'url': USC_2056B},
        ],
    },
    {
        'id': 'cpsc-small-parts',
        'agency': 'CPSC',
        'title': 'Toys for children under 3 may not have small parts that fit the test cylinder; toys and games with small parts for ages 3 '
        'to 6, latex balloons, and small balls and marbles for children 3 and older need the choking-hazard warning on the package',
        'citations': [
            {'label': '16 CFR 1500.18(a)(9)', 'url': ecfr(16, '1500.18')},
            {'label': '16 CFR part 1501', 'url': ecfr_part(16, 1501)},
            {'label': '16 CFR 1500.19 (warning labels)', 'url': ecfr(16, '1500.19')},
        ],
    },
    {
        'id': 'cpsc-lead-phthalates',
        'agency': 'CPSC',
        'title': 'Children\'s products: lead content up to 100 ppm in any accessible part and 90 ppm in paint and coatings; toys and child-care '
        'articles: no more than 0.1% of each of eight phthalates (DEHP, DBP, BBP, DINP, DIBP, DPENP, DHEXP, DCHP) in plasticized parts',
        'citations': [
            {'label': '15 U.S.C. 1278a (lead)', 'url': USC_1278A},
            {'label': '16 CFR 1303.1 (lead paint)', 'url': ecfr(16, '1303.1')},
            {'label': '16 CFR 1307.3 (phthalates)', 'url': ecfr(16, '1307.3')},
        ],
    },
    {
        'id': 'cpsc-cpc-efiling',
        'agency': 'CPSC / CBP',
        'title': 'Children\'s products must be third-party tested by a CPSC-accepted laboratory, carry permanent tracking labels, and be covered '
        'by a Children\'s Product Certificate; since July 8, 2026 the importer must eFile the certificate data in ACE with the entry (mail '
        'shipments: in CPSC\'s Product Registry before arrival; FTZ entries from January 8, 2027)',
        'citations': [
            {'label': '16 CFR 1107.20 (third-party testing)', 'url': ecfr(16, '1107.20')},
            {'label': '16 CFR 1110.11 (certificate content)', 'url': ecfr(16, '1110.11')},
            {'label': '16 CFR 1110.13 (eFiling)', 'url': ecfr(16, '1110.13')},
            {'label': '15 U.S.C. 2063 (certificates, tracking labels)', 'url': USC_2063},
        ],
    },
    {
        'id': 'fcc-rf',
        'agency': 'FCC',
        'title': 'Radio-frequency devices — game consoles and handhelds with Wi-Fi or Bluetooth, wireless controllers, remote-control toys — may '
        'be imported only with a valid FCC equipment authorization or under another import condition',
        'citations': [{'label': '47 CFR 2.1204', 'url': ecfr(47, '2.1204')}],
    },
    {
        'id': 'irs-excise',
        'agency': 'IRS',
        'title': 'Federal excise tax on the importer\'s first sale: sport fishing equipment 10% (fishing rods and poles capped at $10, tackle '
        'boxes 3%); bows of 30 lb draw weight or more and archery parts, quivers and broadheads 11%; arrow shafts a per-shaft tax',
        'citations': [{'label': '26 U.S.C. 4161', 'url': USC_4161}],
    },
    {
        'id': 'cbp-marking',
        'agency': 'CBP',
        'title': 'Country-of-origin marking in English, legible, indelible and permanent enough to reach the ultimate purchaser — on the article or, '
        'where an exception applies, on its retail package',
        'citations': [
            {'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')},
            {'label': '19 CFR 134.41', 'url': ecfr(19, '134.41')},
        ],
    },
    {
        'id': 'cbp-ch99',
        'agency': 'CBP',
        'title': 'Report the Chapter 99 headings with the line: the 2026 Section 301 heading for the country, China List 4A (9903.88.15), Brazil '
        '(9903.05.01), Canada Section 338 (9903.03.12 / 9903.03.14)',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 50–52', 'url': CH99_PDF},
            {'label': 'CBP CSMS # 69606660 (Section 338 guidance)', 'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/4261d04'},
        ],
    },
]

GROUP_RULES = {
    '9503': ['cpsc-toy-standard', 'cpsc-small-parts', 'cpsc-lead-phthalates', 'cpsc-cpc-efiling', 'fcc-rf', 'cbp-marking', 'cbp-ch99'],
    '9504': ['cpsc-toy-standard', 'cpsc-lead-phthalates', 'cpsc-cpc-efiling', 'fcc-rf', 'cbp-marking', 'cbp-ch99'],
    '9505': ['cpsc-lead-phthalates', 'cpsc-cpc-efiling', 'cbp-marking', 'cbp-ch99'],
    '9506': ['cpsc-lead-phthalates', 'cpsc-cpc-efiling', 'irs-excise', 'cbp-marking', 'cbp-ch99'],
    '9507': ['irs-excise', 'cbp-marking', 'cbp-ch99'],
    '9508': ['cbp-marking', 'cbp-ch99'],
}
GROUP_NOTES = {
    '9503': 'Every toy for a child 12 or under is a children\'s product: ASTM F963-23, small parts (under 3), lead and phthalates, third-party '
    'testing and a CPC eFiled at entry. The statistical suffix follows the youngest age on the label. From Canada, 50% Section 338 even under '
    'USMCA.',
    '9504': 'Consoles and controllers with radios need FCC authorization. Board games, cards and handheld games meant for children 12 or under '
    'are children\'s products under the CPSC rules. 9504.30, 9504.50 and 9504.90.40 from Canada owe the 50% Section 338 duty.',
    '9505': 'Christmas decorations are general-use products unless designed for children; Christmas lighting strings are 9405, not this '
    'chapter. Glass ornaments are on China\'s List 4A, the rest of 9505 on suspended List 4B.',
    '9506': 'Sports equipment designed for children 12 or under is a children\'s product. Bows and archery parts owe the 11% excise tax. Most '
    'lines are on China\'s List 4A; exercise equipment, pools, ice skates, golf parts and hockey gear from Canada owe the Section 338 duty.',
    '9507': 'All lines are dutiable (3.7%–9.2% or 24¢ a reel). The importer owes the 10% sport-fishing excise tax when it sells rods, reels, '
    'lures, line and other tackle.',
    '9508': 'Amusement rides are Free; China List 4A adds 7.5% to the 12.5% Section 301 duty.',
}
for g in te['groups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['ruleIds'] = GROUP_RULES[g['heading']]
    g['note'] = GROUP_NOTES[g['heading']]

rows_by_hts = {r['hts']: r for r in ov['rateTable']['rows'] if r['hts']}
for ln in te['lines']:
    sub = ln['hts'][:10]
    h = sub[:4]
    row = rows_by_hts[ln['hts']]
    gen = row['effectiveGeneral']
    dutiable = bool(gen and gen != 'Free')
    rules = list(GROUP_RULES[h])
    if h == '9504' and sub not in ('9504.30.00', '9504.50.00', '9504.90.40'):
        rules.remove('fcc-rf')
    if h == '9506' and not sub.startswith('9506.99.05'):
        rules.remove('irs-excise')
    if h == '9504' and sub.startswith('9504.20'):
        rules = [r for r in rules if not r.startswith('cpsc')]
    ln['ruleIds'] = rules
    levers = ['origin', 'usmca']
    if dutiable:
        levers.append('fta')
    levers += ['ch98', 'classification', 'first-sale', 'drawback', 'ftz', 'ieepa-refund', 'ruling']
    ln['leverIds'] = levers

te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations and the tariff schedule — not legal advice. Whether an article is a '
    'toy or a children\'s product depends on its design, labeling and marketing; which line it falls in depends on the HTS notes and CBP '
    'rulings; and the extra duties change by Federal Register notice and CBP guidance. Confirm the current headings and CPSC requirements '
    'before each shipment.'
)
