# Writer content for Chapter 68, part 2 — tariff engineering. Exec'd by fill68.py.
# ruff: noqa

te = d['tariffEngineering']
te['h1'] = f'HTS Chapter 68: {SHORT} — Import Documents & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing Quartz Slabs, Granite, Stone & Asbestos Articles into the U.S.: Safeguard, AD/CVD, EPA Rules & Legal Ways to Lower '
    'Duty (HTS Ch. 68) | KoalaGains',
    'shortDescription': 'What each HTS Chapter 68 line needs at U.S. entry — the quartz safeguard headings, antidumping and countervailing '
    'deposits on Chinese, Indian and Turkish quartz, EPA asbestos bans and notice rules, country-of-origin marking — and the legal ways to '
    'pay less: quartz-versus-natural-stone classification, origin, USMCA and FTAs, the Brazil quartzite exemption, first sale, drawback, '
    'FTZ and rulings.',
    'keywords': [
        'quartz surface products safeguard',
        'quartz countertop antidumping duty',
        'first-sale-for-export valuation stone',
        'usmca tariff-shift rules chapter 68',
        'brazil quartzite exemption',
        'asbestos import ban tsca',
        'hts code 6802.99.00 import duty',
        'tariff engineering building materials',
    ],
}
te['intro'] = (
    'Most Chapter 68 goods need no import license, but three things decide what a shipment costs and whether it may enter at all. **Engineered '
    'quartz** (6810.99.00.20/.40) is the most regulated product in the chapter: it pays the 2026 **Section 201 safeguard** (+25% in quota, +50% '
    'over quota) unless it comes from an excluded country, and from China, India and Turkey it also carries **antidumping and countervailing '
    'duty deposits**. **Asbestos** articles of 6811–6813 fall under EPA\'s Toxic Substances Control Act rules: chrysotile asbestos for '
    'vehicle brakes, friction products and gaskets may no longer be imported, and other asbestos uses need EPA notice first. And every article '
    'must be **marked with its country of origin**.\n\n'
    'On cost, the base rates are low (Free to 9%), so the levers that matter are the extra duties: what the product is (natural quartzite or '
    'granite is outside the quartz safeguard and the quartz trade-remedy orders, and Brazilian quartzite is exempt from the Brazil duty), '
    'where it was made, and whether USMCA, an FTA, the civil-aircraft provisions, first-sale valuation, drawback or a foreign-trade zone '
    'applies. Each lever depends on a document, listed below with its regulation.'
)
te['lastCheckedAt'] = TODAY
te['regulationsAsOf'] = '2026-10-08'

PROCL_11051_URL = src('procl-11051')['url']
te['levers'] = [
    {
        'id': 'qsp-scope',
        'title': 'Know whether the goods are quartz surface products — or natural stone',
        'saves': 'The 25%–50% safeguard, and (from China, India or Turkey) the antidumping and countervailing duties, which reach engineered '
        'quartz but not natural stone',
        'appliesTo': '6810.99.00.20 and 6810.99.00.40 (agglomerated quartz slabs), and natural stone of heading 6802 that is sold as "quartzite" '
        'or "granite"',
        'document': 'A composition sheet showing the share of silica, resin binder and other materials by weight; for natural stone, the '
        'quarry and a petrographic description.',
        'caveat': 'Under U.S. note 41(a) a surface product is QSP when silica is the largest single material by weight and it is bound with '
        'resin — pigments or cement do not take it out, and cutting, polishing or fabricating it in a third country does not change that. '
        'Quarried granite, marble, soapstone and quartzite are outside the scope. A name on the invoice decides nothing; the material does.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 41(a)', 'url': CH99_PDF},
            {'label': 'Proclamation 11051 (91 FR 50645)', 'url': PROCL_11051_URL},
            {'label': 'HTSUS Chapter 68, note 2 (quartzite is "worked stone" of 6802)', 'url': CH68_PDF},
        ],
    },
    {
        'id': 'qsp-quota',
        'title': 'Enter quartz while the quarterly quota is open',
        'saves': '25 points of duty: 25% in quota (9903.45.30) instead of 50% over quota (9903.45.31)',
        'appliesTo': 'Quartz surface products of 6810.99.00.20/.40 from countries not excluded by note 41(c)',
        'document': 'The entry date, quantity in square meters and the in-quota or over-quota Chapter 99 heading on the entry.',
        'caveat': 'The quota for August 15, 2026–August 14, 2027 is 13,006,426 m², 3,251,606 m² in each quarter (from August 15, November 15, '
        'February 14 and May 16); unused quantity carries into the next quarter. Entries beyond the quarter\'s quantity must use the over-quota '
        'heading. Goods from excluded countries do not count against the quota.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 41(d)–(e)', 'url': CH99_PDF},
            {'label': 'Proclamation 11051 (91 FR 50645)', 'url': PROCL_11051_URL},
        ],
    },
    {
        'id': 'origin',
        'title': 'Know the country of origin',
        'saves': 'The difference between country rates: no safeguard for quartz from Canada, Mexico, Israel, Korea, Brazil, Indonesia and the '
        'other note 41(c) countries; +10% Section 301 for India or the UK, +12.5% for Turkey or Vietnam, 10% in total for the EU, +37.5% for China',
        'appliesTo': 'All lines; the gap is widest on engineered quartz and on Chinese and Brazilian stone',
        'document': 'Production records showing where the article was made — for stone, where it was quarried and worked; for quartz, where '
        'the slab was cast.',
        'caveat': 'Cutting, polishing or edging a slab made elsewhere may not move its origin, and for quartz the safeguard and the antidumping '
        'and countervailing orders follow the country where the QSP was manufactured, including when it is finished or fabricated in a third '
        'country.',
        'citations': [
            {'label': '19 CFR 134.1 (country of origin)', 'url': ecfr(19, '134.1')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 41, 50–52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'stone-type',
        'title': 'Classify the stone by what it is — quartzite is not granite',
        'saves': 'From Brazil: 25 points — quartzite and other stone of 6802.99.00 are on the Brazil exemption list (19% in total for a quartzite '
        'slab), granite of 6802.93 is not (41.2%). Elsewhere, the base-rate gap between granite (3.7%), marble (2.5%–4.9%) and other stone (6.5%)',
        'appliesTo': 'Heading 6802 — slabs, tiles, countertops and monuments of natural stone',
        'document': 'A petrographic or mineralogical description of the stone; for slabs, thickness and edge work (additional U.S. note 1).',
        'caveat': 'Commercial names ("granite" for many quartzites and gneisses, "marble" for some limestones) do not decide the line. Chapter '
        '68 note 2 puts quartzite in heading 6802 as "other" stone, and the exemption is by subheading — the goods must actually be 6802.99 '
        'stone. A ruling settles doubtful cases.',
        'citations': [
            {'label': 'HTSUS Chapter 68 notes and additional U.S. notes', 'url': CH68_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 50(a)(ii), 9903.05.03', 'url': CH99_PDF},
            {'label': '19 CFR part 177 (rulings)', 'url': ecfr_part(19, 177)},
        ],
    },
    {
        'id': 'usmca',
        'title': 'Claim USMCA on goods from Mexico or Canada',
        'saves': 'The base rate (up to 9%) plus the 10% Section 301 duty',
        'appliesTo': 'All lines from Mexico; from Canada, every line except 6809.11.00 (gypsum board) and 6810.99.00, which owe the 50% Section '
        '338 duty even under USMCA',
        'document': 'A certification of origin from the importer, exporter or producer, kept ready for CBP.',
        'caveat': 'USMCA does not remove the 50% Section 338 duty on the Canadian subheadings in U.S. note 51(b)(3). The good must meet the '
        'Chapter 68 rule of origin in General Note 11 for its subheading. The USMCA was not renewed at the July 1, 2026 joint review but remains '
        'in force.',
        'citations': [
            {'label': '19 CFR 182.12', 'url': ecfr(19, '182.12')},
            {'label': 'HTSUS General Note 11 (USMCA rules of origin)', 'url': GN_PDF},
            {'label': 'HTSUS 9903.05.93 / 9903.05.94, U.S. notes 51–52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'fta',
        'title': 'Claim an FTA, AGOA or CAFTA-DR rate',
        'saves': 'The base rate on dutiable lines; for quartz, FTA partners on the note 41(c) list (Australia, Colombia, Israel, Korea, Panama, '
        'Peru, Singapore, the CAFTA-DR countries) also pay no safeguard',
        'appliesTo': 'Dutiable lines whose Special column lists the program: AU, BH, CL, CO, D (AGOA), E (CBERA), IL, JO, KR, MA, OM, P '
        '(CAFTA-DR), PA, PE, SG',
        'document': 'The origin proof each program requires and records to back it up.',
        'caveat': 'An FTA removes the base rate but not the 2026 Section 301 duty (U.S. note 52(a)). The safeguard exclusion in note 41(c) goes by '
        'country of origin, not by whether a preference is claimed. GSP (A, A*) has been expired since December 31, 2020; AGOA (D) runs to '
        'December 31, 2026.',
        'citations': [
            {'label': 'HTSUS General Notes 3(c) and 8–34', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 41(c), 52(a)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'cn-exclusion',
        'title': 'Use the China List 3 exclusion for qualifying sandstone pavers',
        'saves': 'The 25% List 3 duty on Chinese sandstone that matches the exclusion description',
        'appliesTo': '6802.99.00.90 — "brown wave" sandstone with one textured side and up to four chiseled edges (density 2,750 kg/m³), and '
        'flamed-finish sandstone 200–3,100 mm long, 100–1,380 mm wide and 30–180 mm thick',
        'document': 'Product specifications showing the stone matches the description; report 9903.88.69 instead of 9903.88.03.',
        'caveat': 'In effect through November 9, 2026 unless USTR extends it again. The 12.5% 2026 Section 301 duty (9903.05.31) still applies.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 20(vvv)(iii), 9903.88.69', 'url': CH99_PDF},
            {'label': '90 FR 55232 (exclusions extended to November 9, 2026)', 'url': src('fr-2025-21671')['url']},
        ],
    },
    {
        'id': 'civil-aircraft',
        'title': 'Claim civil-aircraft treatment for aircraft friction and asbestos parts',
        'saves': 'The 2026 Section 301 duty (note 52(d), 9903.05.88) and, for Canada, the Section 338 duty (9903.03.16)',
        'appliesTo': '6812.80.90, 6812.99, 6813.20, 6813.81 and 6813.89 articles for use in civil aircraft that meet general note 6',
        'document': 'The civil-aircraft certification CBP requires for "Free (C)" treatment, and records of the aircraft use.',
        'caveat': 'Only articles for civil aircraft qualify; military and (for Canada) unmanned aircraft are out. Asbestos-containing articles '
        'remain subject to EPA\'s rules.',
        'citations': [
            {'label': '19 CFR 10.183', 'url': ecfr(19, '10.183')},
            {'label': 'HTSUS General Note 6', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 51(d), 52(d)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'first-sale',
        'title': 'Value at the first sale for export when you buy through a middleman',
        'saves': 'Every ad valorem duty is charged on a lower value — the base rate, the 10%–37.5% Section 301 duties and the 25%–50% safeguard '
        'included — when the factory price to a trading company is lower than the price you pay',
        'appliesTo': 'All lines bought through a trading company, distributor or agent-buyer rather than straight from the quarry or plant',
        'document': 'Proof that the first sale was a bona fide sale for export to the United States at arm\'s length: the factory invoice, '
        'contracts and payment records.',
        'caveat': 'Only a sale clearly destined for the U.S. qualifies. Antidumping and countervailing duties are assessed under Commerce\'s own '
        'rules, not lowered this way.',
        'citations': [{'label': '19 CFR 152.103', 'url': ecfr(19, '152.103')}],
    },
    {
        'id': 'drawback',
        'title': 'Recover duty on goods you export or destroy',
        'saves': 'Up to 99% of the duties paid, when the imported goods (or goods made from them) are exported or destroyed',
        'appliesTo': 'Any line — for example slabs cut into countertops for export, or abrasives used to make exported goods',
        'document': 'A drawback claim to CBP with import, manufacturing and export records.',
        'caveat': 'Antidumping and countervailing duties are not refundable as drawback. Claims have filing deadlines and record-keeping rules; '
        'check whether a given Chapter 99 duty is eligible before relying on it.',
        'citations': [{'label': '19 CFR part 190', 'url': ecfr_part(19, 190)}],
    },
    {
        'id': 'ftz',
        'title': 'Hold or process goods in a foreign-trade zone',
        'saves': 'No duty on goods re-exported from the zone, and duty deferred until goods leave it for the U.S. market',
        'appliesTo': 'Any line — useful for stone and quartz distributed to several countries',
        'document': 'Zone admission (CBP Form 214) and the zone operator\'s inventory records.',
        'caveat': 'Quartz surface products admitted on or after August 15, 2026 must be in privileged foreign status (19 CFR 146.41), so they '
        'pay the safeguard rate of their classification when entered for consumption. Goods entered from a zone pay the duties in force on the '
        'entry date.',
        'citations': [
            {'label': '19 CFR part 146', 'url': ecfr_part(19, 146)},
            {'label': '19 CFR 146.41 (privileged foreign status)', 'url': ecfr(19, '146.41')},
        ],
    },
    {
        'id': 'ch98',
        'title': 'Use a Chapter 98 provision for U.S. goods coming back',
        'saves': 'All duty on U.S.-made goods returned unchanged (9801.00.10)',
        'appliesTo': 'Any line, for American goods returned without having been advanced in value or improved abroad',
        'document': 'Proof of U.S. origin and of the export, as CBP requires for the provision.',
        'caveat': 'The Section 301 and 338 duties also do not apply to goods properly entered under Chapter 98, except subchapter XXIII and '
        '9802.00.40–9802.00.80 (U.S. notes 51(a) and 52(a)).',
        'citations': [
            {'label': 'HTSUS Chapter 98, 9801.00.10', 'url': CH98_PDF},
            {'label': '19 CFR 10.1', 'url': ecfr(19, '10.1')},
        ],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding classification ruling',
        'saves': 'Certainty where the line decides the rate and the extra duty: engineered quartz (6810.99) versus natural quartzite (6802.99) or '
        'granite (6802.93); a slab versus a tile; mounted versus unmounted brake linings (6813 or 8708.30)',
        'appliesTo': 'Any line where the material, thickness or use decides the line',
        'document': 'A ruling request to CBP describing the article, its composition, dimensions and use.',
        'caveat': 'Rulings apply to the transaction described; a CBP ruling does not decide whether goods are within an antidumping order\'s '
        'scope — Commerce does.',
        'citations': [
            {'label': '19 CFR part 177', 'url': ecfr_part(19, 177)},
            {'label': 'HTSUS Chapter 68 notes', 'url': CH68_PDF},
        ],
    },
]

te['rules'] = [
    {
        'id': 'qsp-safeguard',
        'agency': 'CBP (USTR safeguard)',
        'title': 'Quartz surface products: report 9903.45.30 (in quota, +25%) or 9903.45.31 (over quota, +50%) with the line unless the goods are '
        'a product of a note 41(c) country; QSP admitted to a foreign-trade zone must be in privileged foreign status',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 41', 'url': CH99_PDF},
            {'label': 'Proclamation 11051 (91 FR 50645)', 'url': PROCL_11051_URL},
            {'label': '19 CFR 146.41', 'url': ecfr(19, '146.41')},
        ],
    },
    {
        'id': 'adcvd-quartz',
        'agency': 'Commerce (ITA) / CBP',
        'title': 'Quartz surface products from China, India or Turkey are subject merchandise under antidumping and countervailing duty orders: '
        'enter them as AD/CVD entries with the case numbers and cash deposits (A-570-084, C-570-085; A-533-889, C-533-890; A-489-837, '
        'C-489-838), and file the importer\'s non-reimbursement certificate. The written scope, not the HTS line, decides coverage',
        'citations': [
            {'label': '84 FR 33053 (China orders)', 'url': src('fr-2019-14865')['url']},
            {'label': '85 FR 37422 (India and Turkey antidumping orders)', 'url': src('fr-2020-13401')['url']},
            {'label': '85 FR 37431 (India and Turkey countervailing orders)', 'url': src('fr-2020-13374')['url']},
            {'label': '19 CFR 351.402(f) (reimbursement certificate)', 'url': ecfr(19, '351.402')},
        ],
    },
    {
        'id': 'adcvd-other',
        'agency': 'Commerce (ITA) / CBP',
        'title': 'Other orders that reach Chapter 68 lines: diamond saw-blade segments from China (A-570-900, 6804.21.00); sol gel '
        'alumina-based abrasive grains from China, including the grain component of wheels and coated abrasives (A-570-190, C-570-191, 6804.22 '
        'and 6805); magnesia carbon bricks from China and Mexico (A-570-954, C-570-955, A-201-837, 6815.91 and 6815.99)',
        'citations': [
            {'label': '86 FR 18942 (diamond sawblades, continued)', 'url': src('fr-2021-07450')['url']},
            {'label': '90 FR 46555 (sol gel abrasive grains)', 'url': src('fr-2025-18882')['url']},
            {'label': '86 FR 46676 (magnesia carbon bricks, continued)', 'url': src('fr-2021-17790')['url']},
            {'label': '19 CFR 351.402(f) (reimbursement certificate)', 'url': ecfr(19, '351.402')},
        ],
    },
    {
        'id': 'epa-asbestos-ban',
        'agency': 'EPA (TSCA)',
        'title': 'Chrysotile asbestos, and articles containing it, may not be imported for aftermarket automotive brakes and linings, other '
        'vehicle friction products, oilfield brake blocks or other gaskets (since November 25, 2024), or for sheet gaskets used in chemical '
        'production (since May 27, 2026, with limited exceptions to 2029)',
        'citations': [
            {'label': '40 CFR 751.509', 'url': ecfr(40, '751.509')},
            {'label': '40 CFR part 751, subpart F', 'url': ecfr_subpart(40, 751, 'F')},
            {'label': '89 FR 21970 (EPA final rule, March 28, 2024)', 'url': src('fr-2024-05972')['url']},
        ],
    },
    {
        'id': 'epa-asbestos-snur',
        'agency': 'EPA (TSCA)',
        'title': 'Any other import of asbestos — including as part of an article, such as asbestos-cement products, millboard, packings, '
        'woven products or other friction materials — is a significant new use that needs a notice to EPA at least 90 days before import. '
        'Flooring felt, rollboard and commercial, corrugated and specialty paper containing asbestos remain banned',
        'citations': [
            {'label': '40 CFR 721.11095', 'url': ecfr(40, '721.11095')},
            {'label': '40 CFR 721.25 (notice)', 'url': ecfr(40, '721.25')},
            {'label': '40 CFR 763.165', 'url': ecfr(40, '763.165')},
        ],
    },
    {
        'id': 'tsca-cert',
        'agency': 'CBP / EPA',
        'title': 'Importers of substances regulated under TSCA section 6, chrysotile asbestos included, are subject to the TSCA import '
        'certification rules',
        'citations': [
            {'label': '40 CFR 751.7', 'url': ecfr(40, '751.7')},
            {'label': '19 CFR 12.121', 'url': ecfr(19, '12.121')},
        ],
    },
    {
        'id': 'cbp-marking',
        'agency': 'CBP',
        'title': 'Country-of-origin marking in English, legible, indelible and permanent enough to reach the ultimate purchaser — on the article '
        'or, where the article cannot be marked, its container. Mica not further manufactured than cut or stamped to shape is on the '
        'exception list (its container must be marked)',
        'citations': [
            {'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')},
            {'label': '19 CFR 134.33 (J-list)', 'url': ecfr(19, '134.33')},
            {'label': '19 CFR 134.41', 'url': ecfr(19, '134.41')},
        ],
    },
    {
        'id': 'cbp-ch99',
        'agency': 'CBP',
        'title': 'Report the Chapter 99 headings with the line: the 2026 Section 301 heading for the country, China List 3 (9903.88.03) or its '
        'exclusion (9903.88.69), Brazil (9903.05.01) or its exemption (9903.05.03), Canada Section 338 (9903.03.14), Russia (9903.90.08)',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 30, 50–52', 'url': CH99_PDF},
            {'label': 'CBP CSMS # 69606660 (Section 338 guidance)', 'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/4261d04'},
        ],
    },
]

GROUP_RULES = {
    '6801': ['cbp-marking', 'cbp-ch99'],
    '6802': ['cbp-marking', 'cbp-ch99'],
    '6803': ['cbp-marking', 'cbp-ch99'],
    '6804': ['adcvd-other', 'cbp-marking', 'cbp-ch99'],
    '6805': ['adcvd-other', 'cbp-marking', 'cbp-ch99'],
    '6806': ['cbp-marking', 'cbp-ch99'],
    '6807': ['cbp-marking', 'cbp-ch99'],
    '6808': ['cbp-marking', 'cbp-ch99'],
    '6809': ['cbp-marking', 'cbp-ch99'],
    '6810': ['qsp-safeguard', 'adcvd-quartz', 'cbp-marking', 'cbp-ch99'],
    '6811': ['epa-asbestos-snur', 'tsca-cert', 'cbp-marking', 'cbp-ch99'],
    '6812': ['epa-asbestos-ban', 'epa-asbestos-snur', 'tsca-cert', 'cbp-marking', 'cbp-ch99'],
    '6813': ['epa-asbestos-ban', 'epa-asbestos-snur', 'tsca-cert', 'cbp-marking', 'cbp-ch99'],
    '6814': ['cbp-marking', 'cbp-ch99'],
    '6815': ['adcvd-other', 'cbp-marking', 'cbp-ch99'],
}
GROUP_NOTES = {
    '6801': 'No agency license. Rough blocks and unworked stone are in Chapter 25.',
    '6802': 'No agency license. Natural stone — granite, marble, quartzite — is outside the quartz safeguard and the quartz antidumping '
    'orders. Brazilian 6802.99.00 stone (quartzite) is exempt from the 25% Brazil duty; Chinese sandstone pavers of 6802.99.00.90 may use the '
    'List 3 exclusion.',
    '6803': 'No agency license. Roofing slate pays 3.3%, other slate is Free.',
    '6804': 'Diamond segments for circular sawblades (6804.21.00.10) from China are covered by the 2009 antidumping order; wheels made with '
    'Chinese sol-gel alumina grains carry the 2025 orders on the grain component.',
    '6805': 'Sandpaper, belts and discs made with Chinese sol-gel alumina abrasive grains carry the 2025 antidumping and countervailing '
    'duties on the grain component.',
    '6806': 'No agency license for mineral wool, vermiculite or calcium silicate.',
    '6807': 'No agency license. Asphalt rolls are Free, shingles and siding 2.7%.',
    '6808': 'No agency license.',
    '6809': 'Paper-faced gypsum board (6809.11.00) from Canada pays the 50% Section 338 duty even under USMCA.',
    '6810': 'Engineered quartz (6810.99.00.20/.40) pays the safeguard and, from China, India and Turkey, antidumping and countervailing duties; '
    'the orders\' written scope also reaches quartz entered under other 6810 lines. 6810.99.00 from Canada pays the 50% Section 338 duty even '
    'under USMCA.',
    '6811': 'Asbestos-cement articles (6811.40) need an EPA significant new use notice before import; cellulose fiber-cement is unrestricted.',
    '6812': 'Asbestos articles: gaskets and friction uses of chrysotile asbestos are banned from import; other uses need EPA notice first. '
    'Asbestos footwear pays 8.3%.',
    '6813': 'Asbestos friction material (6813.20) may not be imported for vehicle brakes or friction products. Non-asbestos brake linings '
    '(6813.81, 6813.89) are unrestricted; mounted brake pads for vehicles are 8708.30.',
    '6814': 'No agency license. Mica cut or stamped to shape may be marked on its container.',
    '6815': 'Magnesia carbon bricks from China and Mexico (6815.91, 6815.99) are covered by antidumping (and for China countervailing) '
    'orders. Carbon fiber has no import license requirement.',
}
for g in te['groups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['ruleIds'] = GROUP_RULES[g['heading']]
    g['note'] = GROUP_NOTES[g['heading']]

rows_by_hts = {r['hts']: r for r in ov['rateTable']['rows'] if r['hts']}
CIVIL_AIR = ('6812.80.90', '6812.99', '6813.20', '6813.81', '6813.89')
for ln in te['lines']:
    h = ln['hts'][:4]
    sub8 = ln['hts'][:10]
    rules = []
    if h == '6804':
        if ln['hts'].startswith(('6804.21', '6804.22')):
            rules.append('adcvd-other')
    elif h == '6805':
        rules.append('adcvd-other')
    elif h == '6810':
        if ln['hts'] in ('6810.99.00.20', '6810.99.00.40'):
            rules.append('qsp-safeguard')
        rules.append('adcvd-quartz')
    elif h == '6811':
        if sub8 == '6811.40.00':
            rules += ['epa-asbestos-snur', 'tsca-cert']
    elif h == '6812':
        rules += ['epa-asbestos-ban', 'epa-asbestos-snur', 'tsca-cert']
    elif h == '6813':
        if sub8 == '6813.20.00':
            rules += ['epa-asbestos-ban', 'epa-asbestos-snur', 'tsca-cert']
    elif h == '6815':
        if ln['hts'].startswith(('6815.91', '6815.99.41')):
            rules.append('adcvd-other')
    rules += ['cbp-marking', 'cbp-ch99']
    ln['ruleIds'] = rules
    gen = rows_by_hts[ln['hts']]['effectiveGeneral']
    dutiable = bool(gen and gen != 'Free')
    levers = []
    if ln['hts'] in ('6810.99.00.20', '6810.99.00.40'):
        levers += ['qsp-scope', 'qsp-quota']
    if h == '6802':
        levers.append('stone-type')
    levers += ['origin', 'usmca']
    if dutiable:
        levers.append('fta')
    if ln['hts'] == '6802.99.00.90':
        levers.append('cn-exclusion')
    if ln['hts'].startswith(CIVIL_AIR):
        levers.append('civil-aircraft')
    levers += ['first-sale', 'drawback', 'ftz', 'ch98', 'ruling']
    ln['leverIds'] = levers

te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations and the tariff schedule — not legal advice. Whether a slab is a quartz '
    'surface product, whether goods fall within an antidumping or countervailing duty order\'s scope, which line a stone falls in and which '
    'Chapter 99 duties apply depend on the facts of each shipment, and the extra duties change by Federal Register notice and CBP guidance; '
    'confirm the current headings, the quota status and EPA\'s asbestos rules before each shipment.'
)

exec(open(__file__.replace('fill68.py', 'fill68_text3.py')).read())
