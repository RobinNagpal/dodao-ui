# Tariff engineering page (exec'd from fill96.py).
te = d['tariffEngineering']
te['h1'] = f'HTS Chapter 96: {SHORT} — Import Rules & Ways to Lower Duty'
te['lastCheckedAt'] = TODAY
te['regulationsAsOf'] = '2026-10-08'

USC_1313 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap4-subtitleII-partI-sec1313.htm'
USC_1278A = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap30-sec1278a.htm'
FR_PENCILS = src('fr-2026-18496')['url']
FR_PENCILS_2023 = src('fr-2023-05169')['url']

te['levers'] = [
    {
        'id': 'usmca',
        'title': 'Claim USMCA on Canadian and Mexican goods',
        'saves': 'The base rate (up to 16%) and the 10% Section 301 duty — every dutiable Chapter 96 line is Free under USMCA (S)',
        'appliesTo': 'Diapers and pads, brushes, pens, pencils, carvings and other goods of Canada and Mexico that meet the USMCA rules of '
        'origin',
        'document': 'A USMCA certification of origin (importer, exporter or producer) with the required data elements, and records '
        'supporting it.',
        'caveat': 'Goods that only pass through Canada or Mexico, or are made there from Chinese parts without the required tariff shift, '
        'do not qualify and pay the base rate + 10%. No Chapter 96 line is on the Canada Section 338 lists, so a valid claim leaves nothing '
        'to pay.',
        'citations': [
            {'label': '19 CFR part 182', 'url': ecfr_part(19, 182)},
            {'label': 'HTSUS General Note 11', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'origin',
        'title': 'Know the country of origin — where the article was made',
        'saves': 'The gap between country rates: on a ballpoint pen 0.8¢ each + 25.4% from China, + 17.9% from Vietnam, + 15.4% from India, '
        '12.5% from Japan, 10% from the EU, Free from Mexico under USMCA; on a coil zipper 50.5% from China vs 25.5% from Vietnam',
        'appliesTo': 'All lines; the gap is widest on the China List 3 lines (buttons, zippers, tripods) and List 4A lines (pens, pencils, '
        'brooms, lighters, diapers)',
        'document': 'Production records showing where the article was made — for textile diapers and pads, where the fabric was formed or '
        'the article wholly assembled.',
        'caveat': 'For duty, origin is where the goods were last substantially transformed; packing, labeling or simple assembly in a third '
        'country does not change it. Textile articles of 9619.00.21–9619.00.79 follow the textile origin rules of 19 CFR 102.21. Antidumping '
        'duties follow the product: Commerce can find that pencils finished elsewhere from Chinese parts circumvent the order.',
        'citations': [
            {'label': '19 CFR 134.1 (country of origin)', 'url': ecfr(19, '134.1')},
            {'label': '19 CFR 102.21 (textile origin)', 'url': ecfr(19, '102.21')},
            {'label': '19 CFR 351.226 (circumvention)', 'url': ecfr(19, '351.226')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'pencil-ad',
        'title': 'Cased pencils: source outside China or from an exporter with its own rate',
        'saves': 'The 114.90% antidumping cash deposit on wood-cased pencils from China (9609.10.00)',
        'appliesTo': 'Graphite and colored wood-cased pencils of 9609.10.00 from China; mechanical pencils, crayons, pastels, charcoal, '
        'chalk and novelty jumbo pencils are outside the order',
        'document': 'Proof of the country where the pencil was made (core encased), and for Chinese exporters a separate-rate determination '
        'in a Commerce administrative review.',
        'caveat': 'The China-wide rate applies to every Chinese exporter without its own rate; in the 2024–2025 review all four reviewed '
        'exporters were found part of the China-wide entity. The written scope, not the HTS number, decides coverage.',
        'citations': [
            {'label': '91 FR 57545 (2024–2025 review, scope)', 'url': FR_PENCILS},
            {'label': '88 FR 15673 (continuation of the order)', 'url': FR_PENCILS_2023},
            {'label': '19 CFR 351.107 (cash deposit rates)', 'url': ecfr(19, '351.107')},
        ],
    },
    {
        'id': 'material',
        'title': 'Choose the material and type that carries the lower rate',
        'saves': 'Up to 16 points of base rate: diapers of paper pulp or cellulose wadding are Free, of plastics 5%, of synthetic textile '
        '16%; buttons of base metal or casein Free vs 4.7% plastic; tripods of carbon fiber Free, aluminum 2.5%, plastics 5.3%; plastic hair '
        'slides 5.3% vs 11% for other materials',
        'appliesTo': 'Headings 9606, 9615, 9619 and 9620, where the rate follows the material',
        'document': 'A bill of materials with the material of each component and, for textile goods, the fiber content by weight.',
        'caveat': 'The goods must really be what the line describes; CBP classifies by what is imported, not by the invoice. A material '
        'change can also move a line onto or off a China list (paper diapers are on List 4A, some textile diapers on suspended List 4B).',
        'citations': [
            {'label': 'HTSUS Chapter 96', 'url': CH96_PDF},
            {'label': 'CBP ruling NY N354609 (disposable diapers, 9619.00.11)', 'url': ruling('N354609')},
        ],
    },
    {
        'id': 'value-brackets',
        'title': 'Declare unit values correctly — value brackets set the line',
        'saves': 'Several points where the rate depends on unit value: makeup and artists\' brushes over 5¢ each are Free (2.6% below); '
        'hairbrushes over 40¢ pay 0.3¢ + 3.6% instead of 0.2¢ + 7%; combs over $4.50 a gross, snap fasteners over 20¢ a dozen and '
        'lighters over $5 a dozen each move to a different rate',
        'appliesTo': '9603.29, 9603.30, 9606.10, 9613.80, 9615.11 and 9615.19',
        'document': 'A commercial invoice with the per-unit price of each article, separate from cases, sets or packing.',
        'caveat': 'The value is the transaction value of the article as imported; splitting or bundling to cross a bracket is not allowed. '
        'Makeup brush sets with a case are classified as brushes when the brushes give the set its character (NY N342036).',
        'citations': [
            {'label': '19 CFR 152.103 (transaction value)', 'url': ecfr(19, '152.103')},
            {'label': 'CBP ruling NY N342036 (makeup brush set)', 'url': ruling('N342036')},
            {'label': 'HTSUS Chapter 96', 'url': CH96_PDF},
        ],
    },
    {
        'id': 'broom-quota',
        'title': 'Enter broomcorn brooms while the in-quota rate is open',
        'saves': 'The difference between 8% and 32¢ each (or 32% over 96¢) on brooms of broomcorn, and 8% vs 5¢ each on whiskbrooms',
        'appliesTo': 'Brooms and whiskbrooms wholly or partly of broomcorn (9603.10.05–9603.10.60)',
        'document': 'Entry (or warehouse withdrawal) in the calendar year before 121,478 dozen brooms, or 61,655 dozen whiskbrooms, have '
        'been entered; CBP tracks how much has been entered.',
        'caveat': 'The quantity is filled first come, first served across all importers; once it is reached, the higher rate applies to '
        'the rest of the year. Brooms of other twigs pay 10%, and brooms of plastic fibers 2.8% (9603.90.80).',
        'citations': [
            {'label': '19 CFR part 132 (quotas)', 'url': ecfr_part(19, 132)},
            {'label': 'HTSUS Chapter 96 (9603.10)', 'url': CH96_PDF},
        ],
    },
    {
        'id': 'fta',
        'title': 'Use an FTA, CAFTA-DR or AGOA for the base rate',
        'saves': 'The base rate — up to 16% — for goods of Korea, Israel, Australia, Colombia, Peru, the CAFTA-DR countries, other FTA '
        'partners and AGOA countries',
        'appliesTo': 'Dutiable lines with a Free special rate (all of them for most FTAs; AGOA leaves out the textile 9619 lines and '
        'printer ribbons)',
        'document': 'Proof that the goods meet the agreement\'s rules of origin: producer statements, bills of materials, production '
        'records.',
        'caveat': 'Under U.S. note 52(a) the 2026 Section 301 duty still applies when a special rate is claimed — Korean goods pay 12.5% in '
        'total, Dominican CAFTA-DR goods 12.5%. GSP has been expired since December 31, 2020.',
        'citations': [
            {'label': 'HTSUS General Notes (FTAs, AGOA)', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'first-sale',
        'title': 'Value on the first sale for export',
        'saves': 'Duty on the middleman\'s markup — on every percentage rate and on the Section 301 duty',
        'appliesTo': 'Goods bought through a trading company or agent that bought them from the factory',
        'document': 'The factory invoice and proof that the first sale was for export to the United States at arm\'s length.',
        'caveat': 'Only a bona fide sale clearly destined for the United States qualifies; specific rates per piece, gross or line are not '
        'affected.',
        'citations': [{'label': '19 CFR 152.103 (transaction value)', 'url': ecfr(19, '152.103')}],
    },
    {
        'id': 'ch98',
        'title': 'American goods returned and assembly abroad',
        'saves': 'Duty on U.S. content: U.S.-made goods returned unchanged are Free (9801.00.10); articles assembled abroad from U.S. '
        'components pay duty only on the foreign value (9802.00.80)',
        'appliesTo': 'U.S. goods returned, and pens, lighters, brushes or tripods assembled abroad from U.S.-made parts',
        'document': 'Export records and the declarations in 19 CFR 10.1 (returns) or the documentation in 19 CFR 10.24 (assembly), with a '
        'breakdown of U.S. component values.',
        'caveat': 'The Section 301 duty still applies to the foreign value under 9802.00.80 (note 52(a)). Components that are further '
        'fabricated abroad, not just assembled, lose the allowance.',
        'citations': [
            {'label': 'HTSUS Chapter 98', 'url': CH98_PDF},
            {'label': '19 CFR 10.1', 'url': ecfr(19, '10.1')},
            {'label': '19 CFR 10.14 (9802.00.80)', 'url': ecfr(19, '10.14')},
        ],
    },
    {
        'id': 'drawback',
        'title': 'Claim drawback on re-exported goods',
        'saves': 'Up to 99% of the duties, Section 301 duties included, on goods exported or used to make exported goods',
        'appliesTo': 'Imported pens, brushes, zippers, buttons and other goods that are re-exported, or used in exported products',
        'document': 'Import and export records linked by a drawback claim, filed in ACE within five years of import.',
        'caveat': 'Antidumping duties cannot be recovered through drawback, and substitution drawback needs goods of the same 8-digit '
        'subheading.',
        'citations': [
            {'label': '19 U.S.C. 1313', 'url': USC_1313},
            {'label': '19 CFR part 190', 'url': ecfr_part(19, 190)},
            {'label': '19 CFR 190.3 (no drawback of AD/CVD duties)', 'url': ecfr(19, '190.3')},
        ],
    },
    {
        'id': 'ftz',
        'title': 'Use a foreign-trade zone',
        'saves': 'Deferral of duty on stock held in the zone, and no duty on goods re-exported from it',
        'appliesTo': 'Distribution stocks of pens, brushes, flasks and personal-care goods',
        'document': 'Zone admission (CBP Form 214) and an inventory-control system approved for the zone.',
        'caveat': 'Extra-duty notices can require privileged foreign status for goods admitted to a zone (the China Section 301 lists do), '
        'which fixes their classification and duty at admission; check the current Chapter 99 note before relying on zone status.',
        'citations': [
            {'label': '19 CFR part 146', 'url': ecfr_part(19, 146)},
            {'label': '19 CFR 146.65', 'url': ecfr(19, '146.65')},
        ],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding ruling',
        'saves': 'The risk of a wrong line: tumbler vs. vacuum flask, diaper material, brush type, set vs. separate articles, and the Chapter '
        '99 numbers that go with it',
        'appliesTo': 'Any line where the material, the value bracket or the set rule is in doubt',
        'document': 'A ruling request with samples or photos, the material breakdown and the unit value.',
        'caveat': 'A ruling binds CBP only for the goods described; CBP has classified double-walled vacuum stainless tumblers in 9617.00.10 '
        '(NY N356922).',
        'citations': [
            {'label': '19 CFR part 177', 'url': ecfr_part(19, 177)},
            {'label': 'CBP ruling NY N356922 (vacuum tumbler)', 'url': ruling('N356922')},
        ],
    },
]

te['rules'] = [
    {
        'id': 'cpsc-lighters',
        'agency': 'Consumer Product Safety Commission',
        'title': 'Disposable and novelty cigarette lighters must resist operation by at least 85% of a test panel of children under 5 '
        '(16 CFR part 1210); the importer must send CPSC a report, with a sample, at least 30 days before first importing each model, and '
        'keep test records',
        'citations': [
            {'label': '16 CFR 1210.3', 'url': ecfr(16, '1210.3')},
            {'label': '16 CFR 1210.12 (certificate)', 'url': ecfr(16, '1210.12')},
            {'label': '16 CFR 1210.17 (records and reporting)', 'url': ecfr(16, '1210.17')},
        ],
    },
    {
        'id': 'cpsc-multipurpose',
        'agency': 'Consumer Product Safety Commission',
        'title': 'Multipurpose (grill and fireplace) lighters must be child-resistant under 16 CFR part 1212, with the same 30-day report '
        'before import',
        'citations': [
            {'label': '16 CFR 1212.3', 'url': ecfr(16, '1212.3')},
            {'label': '16 CFR 1212.17 (records and reporting)', 'url': ecfr(16, '1212.17')},
        ],
    },
    {
        'id': 'dot-lighters',
        'agency': 'DOT (PHMSA)',
        'title': 'A lighter filled with flammable gas may be offered for transport only if it holds no more than 10 grams of gas and its '
        'design has been examined and tested by a PHMSA-authorized testing agency, and it is packaged as the hazardous materials rules '
        'require',
        'citations': [{'label': '49 CFR 173.308', 'url': ecfr(49, '173.308')}],
    },
    {
        'id': 'cpsc-certificate',
        'agency': 'Consumer Product Safety Commission',
        'title': 'Products under a CPSC rule (lighters) need a General Certificate of Conformity, and children\'s products (children\'s '
        'crayons, pencils, hair clips) a Children\'s Product Certificate based on third-party testing — for lead content, among others; '
        'certificates must be eFiled with the entry from July 8, 2026',
        'citations': [
            {'label': '16 CFR part 1110', 'url': ecfr_part(16, 1110)},
            {'label': '15 U.S.C. 1278a (lead content)', 'url': USC_1278A},
            {'label': '16 CFR part 1303 (lead paint)', 'url': ecfr_part(16, 1303)},
            {'label': '90 FR 45917 (eFiling effective July 8, 2026)', 'url': src('fr-2025-18521')['url']},
        ],
    },
    {
        'id': 'lhama',
        'agency': 'Consumer Product Safety Commission',
        'title': 'Art materials — crayons, colored pencils, pastels, chalk, drawing charcoal, markers — must be reviewed by a toxicologist '
        'and labeled under ASTM D-4236 (Labeling of Hazardous Art Materials Act)',
        'citations': [{'label': '16 CFR 1500.14(b)(8)', 'url': ecfr(16, '1500.14')}],
    },
    {
        'id': 'fda-menstrual',
        'agency': 'Food and Drug Administration',
        'title': 'Menstrual tampons and pads are medical devices: the foreign maker and the initial importer must register and list with '
        'FDA; tampons are Class II devices that need premarket notification (510(k)), most unscented pads are Class I and exempt; tampon '
        'labels must state absorbency and warn about toxic shock syndrome',
        'citations': [
            {'label': '21 CFR 884.5470 (unscented tampon)', 'url': ecfr(21, '884.5470')},
            {'label': '21 CFR 884.5435 (unscented pad)', 'url': ecfr(21, '884.5435')},
            {'label': '21 CFR 801.430 (tampon labeling)', 'url': ecfr(21, '801.430')},
            {'label': '21 CFR part 807 (registration and listing)', 'url': ecfr_part(21, 807)},
        ],
    },
    {
        'id': 'fws-wildlife',
        'agency': 'U.S. Fish and Wildlife Service',
        'title': 'Worked African elephant ivory cannot be imported except in narrow cases (musical instruments, exhibitions, household moves, '
        'inheritances); other wildlife articles — tortoiseshell, coral, horn, bone — need an FWS declaration and, for CITES species, '
        'permits; marine-mammal products such as whalebone and walrus ivory are prohibited',
        'citations': [
            {'label': '50 CFR 17.40(e) (African elephant)', 'url': ecfr(50, '17.40')},
            {'label': '50 CFR 14.61 (declaration)', 'url': ecfr(50, '14.61')},
            {'label': '50 CFR part 23 (CITES)', 'url': ecfr_part(50, 23)},
            {'label': '50 CFR 18.12 (marine mammals)', 'url': ecfr(50, '18.12')},
        ],
    },
    {
        'id': 'adcvd-pencils',
        'agency': 'Commerce (ITA) / CBP',
        'title': 'Cased pencils from China (9609.10.00) are subject to an antidumping order: the entry must be filed as an AD entry with the '
        'case number and a cash deposit (114.90% unless the exporter has its own rate)',
        'citations': [
            {'label': '91 FR 57545', 'url': FR_PENCILS},
            {'label': '88 FR 15673', 'url': FR_PENCILS_2023},
        ],
    },
    {
        'id': 'cbp-marking',
        'agency': 'U.S. Customs and Border Protection',
        'title': 'Every article (or, where that is impossible, its container) must be marked with its country of origin in English',
        'citations': [{'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')}],
    },
    {
        'id': 'cbp-textile-origin',
        'agency': 'U.S. Customs and Border Protection',
        'title': 'Textile diapers, pads and similar articles (9619.00.21–9619.00.79) take their origin from the textile rules: generally '
        'where the article is wholly assembled or the fabric formed',
        'citations': [{'label': '19 CFR 102.21', 'url': ecfr(19, '102.21')}],
    },
    {
        'id': 'cbp-ch99',
        'agency': 'U.S. Customs and Border Protection',
        'title': 'Report the right Chapter 99 numbers with the Chapter 96 line: the 2026 Section 301 heading for the country (9903.05.20–'
        '9903.05.84), 9903.05.86 for worked shell, 9903.05.93/.94 for USMCA goods, 9903.88.03 or 9903.88.15 for China, and 9903.88.21–'
        '9903.88.28 for sets and accessories that take another line\'s rate',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 52', 'url': CH99_PDF},
            {'label': 'CSMS # 69326983 (Section 301 guidance)', 'url': src('csms-69326983')['url']},
        ],
    },
]

GROUP_RULES = {
    '9601': ['fws-wildlife', 'cbp-marking', 'cbp-ch99'],
    '9602': ['cbp-marking', 'cbp-ch99'],
    '9603': ['cbp-marking', 'cbp-ch99'],
    '9604': ['cbp-marking', 'cbp-ch99'],
    '9605': ['cbp-marking', 'cbp-ch99'],
    '9606': ['cbp-marking', 'cbp-ch99'],
    '9607': ['cbp-marking', 'cbp-ch99'],
    '9608': ['lhama', 'cpsc-certificate', 'cbp-marking', 'cbp-ch99'],
    '9609': ['adcvd-pencils', 'lhama', 'cpsc-certificate', 'cbp-marking', 'cbp-ch99'],
    '9610': ['cbp-marking', 'cbp-ch99'],
    '9611': ['cbp-marking', 'cbp-ch99'],
    '9612': ['cbp-marking', 'cbp-ch99'],
    '9613': ['cpsc-lighters', 'cpsc-multipurpose', 'cpsc-certificate', 'dot-lighters', 'cbp-marking', 'cbp-ch99'],
    '9614': ['cbp-marking', 'cbp-ch99'],
    '9615': ['cpsc-certificate', 'cbp-marking', 'cbp-ch99'],
    '9616': ['cbp-marking', 'cbp-ch99'],
    '9617': ['cbp-marking', 'cbp-ch99'],
    '9618': ['cbp-marking', 'cbp-ch99'],
    '9619': ['fda-menstrual', 'cbp-textile-origin', 'cbp-marking', 'cbp-ch99'],
    '9620': ['cbp-marking', 'cbp-ch99'],
}
GROUP_NOTES = {
    '9601': 'Worked African elephant ivory is effectively barred; tortoiseshell, coral and horn need FWS clearance and CITES permits for '
    'listed species; whalebone and other marine-mammal products are prohibited. Worked shell is exempt from the 2026 Section 301 duty.',
    '9602': 'No agency license for empty capsules or carvings. Capsules of gelatin (3%) and of vegetable cellulose (2.7%) have separate '
    'lines.',
    '9603': 'No agency license. The value per brush and the type (tooth, makeup, hair, paint) decide the line; broomcorn brooms have an '
    'annual in-quota quantity at 8%. Chinese paint brushes, rollers and hairbrushes carry no list duty (List 4B), Chinese toothbrushes and '
    'brooms +7.5%.',
    '9604': 'No agency license.',
    '9605': 'Travel kits are classified as a set in 9605 at 8.1%, not article by article.',
    '9606': 'Acrylic and polyester buttons pay a specific duty per line (0.635 mm) per gross: declare the line size. Every 9606 line from '
    'China pays +25% (List 3).',
    '9607': 'No agency license. Every zipper line from China pays +25% (List 3) on top of 10%–13%.',
    '9608': 'Markers and other art pens are art materials (LHAMA labeling); pens for children need a Children\'s Product Certificate. '
    'Sets take each article\'s own rate.',
    '9609': 'Cased pencils from China owe the 114.90% antidumping deposit; crayons, pastels and chalk are art materials under LHAMA; '
    'children\'s pencils and crayons need a Children\'s Product Certificate.',
    '9610': 'No agency license.',
    '9611': 'No agency license.',
    '9612': 'No agency license. Ribbons under 30 mm in cartridges are Free; other ribbons 7.9%.',
    '9613': 'Disposable, novelty and multipurpose lighters must be child-resistant (16 CFR parts 1210, 1212) and reported to CPSC 30 days '
    'before the first import of each model; fuel-filled lighters need an approved design for transport.',
    '9614': 'No agency license for pipes and holders under customs rules; tobacco itself is chapter 24.',
    '9615': 'Hair clips and combs for children are children\'s products under CPSC rules.',
    '9616': 'No agency license for sprayers and puffs; the cosmetics in them are FDA-regulated separately.',
    '9617': 'No agency license. A tumbler that is double-walled and vacuum insulated is a vacuum vessel (9617.00.10, 7.2%).',
    '9618': 'No agency license.',
    '9619': 'Tampons and menstrual pads are FDA medical devices (registration, listing, tampon labeling). Textile diapers and pads follow '
    'the textile origin rules. Paper-pulp diapers are Free from every country before the extra duty.',
    '9620': 'No agency license. Every 9620 line from China pays +25% (List 3); tripods of plastics or carbon for civil aircraft can skip the '
    '2026 Section 301 duty (note 52(d)).',
}
for g in te['groups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['ruleIds'] = GROUP_RULES[g['heading']]
    g['note'] = GROUP_NOTES[g['heading']]

for ln in te['lines']:
    h = ln['hts'][:4]
    rules = list(GROUP_RULES[h])
    if ln['hts'].startswith('9619.00.15.10') or ln['hts'].startswith('9619.00.11') or ln['hts'].startswith('9619.00.05'):
        pass
    if h == '9619' and not any(ln['hts'].startswith(p) for p in ('9619.00.2', '9619.00.3', '9619.00.4', '9619.00.6', '9619.00.7')):
        rules = [r for r in rules if r != 'cbp-textile-origin']
    if h == '9613' and not (ln['hts'].startswith('9613.80.20.10')):
        rules = [r for r in rules if r != 'cpsc-multipurpose']
    if h == '9613' and ln['hts'].startswith('9613.90'):
        rules = [r for r in rules if r not in ('cpsc-lighters', 'dot-lighters')]
    if h == '9609' and not ln['hts'].startswith('9609.10'):
        rules = [r for r in rules if r != 'adcvd-pencils']
    if h == '9608' and (ln['hts'].startswith('9608.9') or ln['hts'].startswith('9608.60')):
        rules = [r for r in rules if r not in ('lhama', 'cpsc-certificate')]
    ln['ruleIds'] = rules
    levers = ['usmca', 'origin']
    if h == '9609' and ln['hts'].startswith('9609.10'):
        levers.append('pencil-ad')
    if h in ('9606', '9615', '9619', '9620'):
        levers.append('material')
    if ln['hts'][:7] in ('9603.29', '9603.30', '9606.10', '9613.80', '9615.11', '9615.19'):
        levers.append('value-brackets')
    if ln['hts'][:7] == '9603.10':
        levers.append('broom-quota')
    levers += ['fta', 'first-sale', 'ch98', 'drawback', 'ftz', 'ruling']
    ln['leverIds'] = levers

te['seo'] = {
    'title': 'Importing Pens, Lighters, Brushes & Diapers into the U.S.: CPSC Lighter Rules, FDA Tampon Rules, Pencil Antidumping & Legal '
    'Ways to Lower Duty (HTS Ch. 96) | KoalaGains',
    'shortDescription': 'What each HTS Chapter 96 line needs at U.S. entry — CPSC child-resistance rules and 30-day reports for lighters, '
    'FDA device rules for tampons and pads, art-material labeling for crayons, the cased-pencil antidumping deposit, FWS rules for ivory '
    'and shell — and the legal ways to pay less: USMCA, origin, material and value brackets, broom quotas, FTAs, drawback and FTZs.',
    'keywords': [
        'hts 9608 import duty on pens',
        'hts 9603 cosmetic brush tariffs',
        'usmca duty rates for chapter 96',
        'cpsc lighter child resistant 16 cfr 1210',
        'tampon fda import requirements',
        'anti dumping on pencils from china',
        'cites restrictions chapter 96 imports',
        'first sale valuation chapter 96',
    ],
}
te['intro'] = (
    'Most Chapter 96 goods need no import license, but a few rules stop or delay shipments. **Lighters** must be child-resistant under CPSC '
    'standards (16 CFR parts 1210 and 1212), and the importer must report each new model to CPSC at least 30 days before importing it. '
    '**Tampons and menstrual pads** are FDA medical devices, so the foreign maker and the importer register and list with FDA. **Crayons, '
    'colored pencils, pastels and markers** are art materials that need ASTM D-4236 labeling, and children\'s versions need a Children\'s '
    'Product Certificate. **Cased pencils from China** owe a 114.90% antidumping deposit. **Ivory, tortoiseshell and coral** articles fall '
    'under Fish and Wildlife Service and CITES rules.\n\n'
    'On cost, the base rate is usually small, so the levers are mostly about the **extra duty**: USMCA (every line Free, no Section 301 '
    'duty), where the goods are made (a coil zipper pays 50.5% from China, 25.5% from Vietnam), the material and unit value that set the '
    'line, the in-quota broom rate, FTAs, first-sale valuation, drawback and foreign-trade zones. Each lever depends on a document, listed '
    'below with its regulation.'
)
te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations and the tariff schedule — not legal advice. The line an article falls '
    'in, its origin, the antidumping scope and the Chapter 99 duties that apply depend on the facts of each shipment, and the extra duties '
    'change by Federal Register notice and agency guidance; confirm the current headings, CPSC and FDA requirements and antidumping cash '
    'deposit rates before each shipment.'
)
