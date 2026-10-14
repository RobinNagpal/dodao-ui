# Writer content for Chapter 68 — exec'd by fill68.py (shares its globals).
# ruff: noqa

TITLE = 'Articles of Stone, Plaster, Cement, Asbestos, Mica or Similar Materials'
SHORT = 'Stone, Quartz, Plaster, Cement & Abrasives'
d['chapter']['title'] = TITLE
d['sources'] = [
    {'label': 'Harmonized Tariff Schedule of the United States', 'url': 'https://hts.usitc.gov/', 'note': 'rate table rows (2026 Revision 21)'},
    {'label': 'UN Comtrade', 'url': 'https://comtradeplus.un.org/', 'note': f'{Y} import figures'},
]

GROUP_LABELS = {
    '6801': ('Setts, curbstones & flagstones of natural stone', 'Setts & curbstones'),
    '6802': ('Worked stone: granite, marble, travertine, quartzite & other monumental or building stone', 'Granite, marble & stone'),
    '6803': ('Worked slate & slate articles (incl. roofing slate)', 'Slate'),
    '6804': ('Millstones, grindstones & grinding wheels (incl. diamond and resin-bonded)', 'Grinding wheels'),
    '6805': ('Coated abrasives: sandpaper, abrasive cloth, belts & discs', 'Sandpaper & abrasives'),
    '6806': ('Mineral wool (rock & slag wool), vermiculite & expanded clays', 'Mineral wool'),
    '6807': ('Asphalt articles: roofing rolls, shingles & siding', 'Asphalt roofing'),
    '6808': ('Wood-wool, straw & fiber panels bonded with cement or plaster', 'Wood-wool panels'),
    '6809': ('Plaster articles: gypsum board (drywall), plaster panels & tiles', 'Gypsum board'),
    '6810': ('Cement, concrete & artificial stone: engineered quartz slabs, tiles, blocks & precast', 'Quartz & concrete'),
    '6811': ('Fiber-cement (asbestos-cement and cellulose fiber-cement) sheets, panels & pipes', 'Fiber-cement'),
    '6812': ('Asbestos fibers & articles: gaskets, jointing, paper, clothing', 'Asbestos articles'),
    '6813': ('Friction material: unmounted brake linings & pads, clutch facings', 'Friction material'),
    '6814': ('Worked mica & mica articles', 'Mica'),
    '6815': ('Other mineral articles: carbon fiber, graphite, peat, magnesia & talc articles', 'Carbon fiber & other'),
}

BLURBS = {
    '6801': (
        'Setts (paving cubes), curbstones and flagstones of natural stone other than slate pay 2.8%.',
        ['curbstones', 'paving stones', 'cobblestones', 'flagstones', 'granite pavers', 'setts'],
    ),
    '6802': (
        'The rate follows the stone and how far it is worked. Granite slabs, countertops and monuments pay 3.7%; marble slabs 2.5%, other worked '
        'marble 4.9% (simply cut or sawn 1.9%); travertine 3.7%–4.2%; limestone and other calcareous stone 4.9%; quartzite, sandstone, slate-free '
        'mosaics and "other stone" 6%–6.5%; small tiles and cubes under 7 cm and colored granules 4.8%. Rough blocks are in Chapter 25.',
        ['granite countertop', 'granite slab', 'marble slab', 'marble tile', 'travertine', 'limestone', 'quartzite slab', 'headstone', 'monument', 'mosaic'],
    ),
    '6803': (
        'Roofing slate pays 3.3%; other worked slate — tiles, flooring, slabs — is Free.',
        ['roofing slate', 'slate tile', 'slate flooring', 'slate slab'],
    ),
    '6804': (
        'Most grinding articles are Free: millstones, diamond wheels and saw-blade segments, vitrified abrasive wheels, natural sharpening stones. '
        'Wheels bonded with synthetic resin pay 5¢/kg + 2%. Diamond saw-blade segments from China fall under a Commerce antidumping order.',
        ['grinding wheel', 'cutting disc', 'diamond grinding wheel', 'diamond segments', 'whetstone', 'sharpening stone', 'millstone'],
    ),
    '6805': (
        'Sandpaper, emery cloth, sanding belts, discs and sponges — abrasive on a backing of cloth, paper or other material — are all Free.',
        ['sandpaper', 'sanding belt', 'sanding disc', 'abrasive cloth', 'emery paper', 'flap disc'],
    ),
    '6806': (
        'Rock wool and slag wool insulation — batts, boards, pipe coverings and acoustical pads — pays 3.9%; exfoliated vermiculite, expanded '
        'clays, foamed slag, calcium silicate and other heat- or sound-insulating mineral mixtures are Free.',
        ['rock wool', 'mineral wool insulation', 'slag wool', 'vermiculite', 'acoustic panel', 'calcium silicate board'],
    ),
    '6807': (
        'Asphalt roofing in rolls is Free; asphalt shingles, siding and other asphalt articles pay 2.7%.',
        ['asphalt shingles', 'roofing felt', 'bitumen membrane', 'asphalt roll roofing'],
    ),
    '6808': (
        'Panels, boards, tiles and blocks of wood wool, shavings, straw or other vegetable fiber bonded with cement, plaster or another mineral '
        'binder are Free.',
        ['wood wool board', 'cement-bonded particle board', 'straw panel'],
    ),
    '6809': (
        'Gypsum board (drywall, plasterboard) faced with paper is Free; other plaster boards and tiles pay 3%; ornamented plaster articles and '
        'molds are Free. Gypsum board from Canada pays the 50% Section 338 duty, even under USMCA.',
        ['drywall', 'gypsum board', 'plasterboard', 'sheetrock', 'plaster ceiling tile', 'plaster molding'],
    ),
    '6810': (
        'Engineered quartz slabs (6810.99.00.20/.40) are Free in the base column but carry the 2026 safeguard tariff (+25% in quota, +50% over '
        'quota) from most countries, and antidumping and countervailing duties from China, India and Turkey. Agglomerated-stone floor tiles '
        'pay 4.9%, other cement or concrete tiles 9%, concrete blocks and bricks 3.2%, other articles 3.9%; precast structural parts are Free.',
        ['quartz countertop', 'quartz slab', 'engineered stone', 'concrete blocks', 'cement tiles', 'terrazzo', 'precast concrete', 'cement board'],
    ),
    '6811': (
        'Fiber-cement sheets, corrugated roofing, panels, pipes and siding are Free. Articles that contain asbestos (6811.40) are Free in the '
        'tariff but need EPA notice under the asbestos significant new use rule before they are imported.',
        ['fiber cement board', 'cement siding', 'corrugated roofing sheet', 'asbestos cement pipe'],
    ),
    '6812': (
        'Asbestos footwear pays 8.3%; other asbestos clothing, paper, millboard, compressed-fiber jointing and gaskets are Free. EPA bans the '
        'import of chrysotile asbestos for gaskets and vehicle friction products.',
        ['asbestos gasket', 'asbestos rope', 'asbestos paper', 'asbestos sheet jointing'],
    ),
    '6813': (
        'Unmounted friction material — brake linings and pads, clutch facings, sheets and rolls — is Free, with or without asbestos. Brake pads '
        'mounted for motor vehicles are classified with vehicle parts (8708.30).',
        ['brake lining', 'brake pad material', 'clutch facing', 'friction sheet'],
    ),
    '6814': (
        'Mica plates and sheets of agglomerated or reconstituted mica pay 2.7%; other worked mica 2.6%.',
        ['mica sheet', 'mica plate', 'mica insulator'],
    ),
    '6815': (
        'Carbon fibers, carbon-fiber fabric and other non-electrical carbon-fiber articles are Free, as are graphite articles, peat articles, '
        'magnesia and magnesia-carbon refractory shapes, and cut talc or soapstone. Magnesia carbon bricks from China and Mexico fall under '
        'Commerce antidumping (and, for China, countervailing) orders.',
        ['carbon fiber', 'carbon fiber fabric', 'carbon fiber sheet', 'graphite', 'soapstone', 'magnesia carbon bricks'],
    ),
}

ov = d['overview']
for g in ov['productGroups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['blurb'], g['searchExamples'] = BLURBS[g['heading']]

# SPI legend: the generator's names are fine except the expired GSP codes.
for e in ov['spiLegend']:
    if e['code'] == 'A':
        e['name'] = 'Generalized System of Preferences (GSP) — expired December 31, 2020'
    elif e['code'] == 'A*':
        e['name'] = 'GSP, some beneficiary countries excluded — expired December 31, 2020'
    elif e['code'] == 'NP':
        e['name'] = 'Nepal Preference Program (expired December 31, 2025)'

ov['notes'] = {
    'chapterNotes': '**Note 1.** This chapter does not cover: (a) goods of chapter 25; (b) coated, impregnated or covered paper and '
    'paperboard of heading 4810 or 4811 (for example, paper and paperboard coated with mica powder or graphite, bituminized or asphalted paper '
    'and paperboard); (c) coated, impregnated or covered textile fabric of chapter 56 or 59 (for example, fabric coated or covered with mica '
    'powder, bituminized or asphalted fabric); (d) articles of chapter 71; (e) tools or parts of tools, of chapter 82; (f) lithographic stones '
    'of heading 8442; (g) electrical insulators (heading 8546) or fittings of insulating material of heading 8547; (h) dental burrs (heading '
    '9018); (ij) articles of chapter 91 (for example, clocks and clock cases); (k) articles of chapter 94 (for example, furniture, luminaires and '
    'lighting fittings, prefabricated buildings); (l) articles of chapter 95 (for example, toys, games and sports equipment); (m) articles of '
    'heading 9602, if made of materials specified in note 2(b) to chapter 96, or of heading 9606 (for example, buttons), of heading 9609 (for '
    'example, slate pencils), heading 9610 (for example, drawing slates) or of heading 9620 (monopods, bipods, tripods and similar articles); '
    'or (n) articles of chapter 97 (for example, works of art).\n\n'
    '**Note 2.** In heading 6802 the expression "worked monumental or building stone" applies not only to the varieties of stone referred to '
    'in heading 2515 or 2516, but also to all other natural stone (for example, quartzite, flint, dolomite and steatite) similarly worked; it '
    'does not, however, apply to slate.',
    'additionalUsNotes': '**1.** For the purposes of heading 6802, the term "slabs" embraces flat stone pieces, not over 5.1 cm in thickness, '
    'having a facial area of 25.8 cm² or more, the edges of which have not been beveled, rounded or otherwise processed except such processing '
    'as may be needed to facilitate installation as tiling or veneering in building construction.\n\n'
    '**2.** For the purposes of heading 6810, the term "tiles" does not include any article 3.2 cm or more in thickness.',
}

ov['workedExamples'] = [
    {
        'title': 'Engineered quartz slab from Vietnam (in quota)',
        'line': '6810.99.00.20',
        'body': 'The base rate is Free. Vietnam adds the 12.5% Section 301 duty (9903.05.84) and, because the slab is a quartz surface product '
        'under U.S. note 41 and Vietnam is not on the note 41(c) exclusion list, the safeguard tariff: +25% while the quarterly quota is open '
        '(9903.45.30), **37.5%** in total — $3,750 on a $10,000 slab shipment. Once the quarter\'s 3,251,606 m² quota is filled, the same slab '
        'enters under 9903.45.31 at +50%: **62.5%**. No antidumping order covers Vietnamese quartz.',
    },
    {
        'title': 'Engineered quartz countertops from China',
        'line': '6810.99.00.40',
        'body': 'China pays +12.5% (9903.05.31) and +25% (List 3, 9903.88.03), plus the safeguard (+25% in quota or +50% over quota): **62.5% or '
        '87.5%** before trade remedies. On top come the 2019 antidumping and countervailing duty orders on Chinese quartz surface products — '
        'set at 326.15% (China-wide cash deposit) and 45.32% (all others) when the orders were issued — so Chinese quartz is priced out of the '
        'U.S. market.',
    },
    {
        'title': 'Quartzite and granite slabs from Brazil',
        'line': '6802.99.00.50',
        'body': 'Brazil pays the 12.5% Section 301 duty (9903.05.27) and the 25% Brazil Section 301 duty (9903.05.01) — but 6802.99.00, the line '
        'for quartzite and other stone, is on the Brazil exemption list in U.S. note 50(a)(ii), so a quartzite slab pays 6.5% + 12.5% = **19%**. '
        'A Brazilian granite slab (6802.93.00.25, 3.7%) pays all three: **41.2%**. Natural quartzite is not a quartz surface product, so no '
        'safeguard applies.',
    },
    {
        'title': 'Marble slabs from Italy or Turkey',
        'line': '6802.91.05.00',
        'body': 'Polished marble slabs pay 2.5%. For EU goods with a base rate under 10%, the 2026 Section 301 action charges 10% in total '
        '(9903.05.39): **10%**, $1,000 on $10,000 of Carrara slabs. Turkish marble pays 2.5% + 12.5% (9903.05.79) = **15%**.',
    },
    {
        'title': 'Gypsum board (drywall) from Canada',
        'line': '6809.11.00.10',
        'body': 'Paper-faced gypsum board is Free and USMCA-qualifying goods skip the 10% Section 301 duty (9903.05.93). But 6809.11.00 is on '
        'the Section 338 list in U.S. note 51(b)(3) (9903.03.14), and that 50% applies even when USMCA is claimed: **50%**, $5,000 on a '
        '$10,000 load. A non-qualifying load pays 60%.',
    },
]

# ---------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['h1'] = f'HTS Chapter 68: {SHORT} — Tariff Updates'
tu['seo'] = {
    'title': 'HTS Chapter 68 Tariff Updates 2026: Quartz Safeguard, Granite & Stone Duties Since January 2025 | KoalaGains',
    'shortDescription': 'What changed for HTS Chapter 68 — granite, marble, quartzite, engineered quartz, gypsum board, abrasives, '
    'mineral wool — since January 2025: the 2026 Section 201 quartz safeguard (25%/50%), the end of the IEEPA and Section 122 duties, the '
    'Section 301 tariffs on 60 economies, China List 3, Brazil and Canada Section 338, and the quartz antidumping orders, with Federal '
    'Register citations.',
    'keywords': [
        'hts chapter 68 tariff updates',
        'hts chapter 68 import duty rates',
        'section 201 quartz tariff',
        'quartz safeguard tariff',
        'quartz surface products antidumping',
        'section 301 tariffs chapter 68',
        'brazil quartzite import duty',
        'section 338 canada gypsum board',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current '
    '**2026 Revision 21** (in force October 9, 2026). **No Chapter 68 base rate changed**: all 97 lines carry the same General, Special and '
    'Column 2 rates, from Free to 9%.\n\n'
    'What changed sits on top of the base rate. In 2025 the IEEPA duties reached stone and building materials from every country — 15% in '
    'total for EU marble and granite and 15% for Turkey from August 7, 2025, 50% for India from August 27, 50% for most Brazilian stone '
    '(quartzite exempt), and up to 125% for China in April–May 2025 on top of the 25% List 3 duty. The IEEPA duties **ended on February 24, '
    '2026**, and the 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026** goods from 60 economies '
    'pay a **Section 301 tariff** (+10% India and the UK, +12.5% Turkey, Vietnam and Brazil, 10% in total for the EU); China still pays the '
    '**25% List 3 duty** on every Chapter 68 line, and Brazil a further 25% on everything but quartzite and other stone of 6802.99. Since '
    '**August 15, 2026** engineered quartz slabs and countertops pay a **Section 201 safeguard** — +25% in quota, +50% over quota — unless '
    'they come from Canada, Mexico, an FTA partner or a listed developing country. Since **August 22, 2026** Canadian gypsum board and '
    '6810.99 articles pay a **50% Section 338 duty**, even under USMCA.\n\n'
    'Trade remedies run alongside: Commerce antidumping and countervailing duty orders cover quartz surface products from **China** (2019) and '
    '**India and Turkey** (2020) — all continued after five-year reviews — diamond saw-blade segments and sol-gel abrasive grains from China, '
    'and magnesia carbon bricks from China and Mexico.'
)
tu['scope'] = (
    'Measures that reach Chapter 68 from any country: the 2026 Section 201 safeguard on quartz surface products (U.S. note 41), the 2026 '
    'Section 301 tariffs on 60 economies, the Brazil Section 301 tariff and its exemption for 6802.99.00, the China Section 301 List 3 duty '
    'and its one product exclusion, the Canada Section 338 duties, Russia\'s rates in lieu of column 2, and the 2025–2026 IEEPA and Section 122 '
    'duties that have ended. Antidumping and countervailing duty orders are described in the change log with their Federal Register notices; '
    'their company-specific rates are set by Commerce and are not part of the rates shown. EPA\'s chrysotile asbestos import bans are listed '
    'for reference. For the rate each supplier pays, see Rates by country.'
)

S301_SRC = ['fr-2026-15181', 'fr-2026-15274', 'hts-chapter-99', 'hts-now']
NO52 = 'No Chapter 68 line is on the general exemption list (note 52(b)) or on any country exception list in note 52(j)'
CIVIL = 'Civil-aircraft brake linings and asbestos articles of 6812–6813 that meet general note 6 are exempt (note 52(d), 9903.05.88)'
QSP_NOTE = (
    'Engineered quartz slabs and countertops (6810.99.00.20/.40) also pay the Section 201 safeguard: +25% in quota (9903.45.30) or +50% '
    'over quota (9903.45.31)'
)

INEFFECT = {
    'cn-section-301': (
        'Two Section 301 duties stack on every Chapter 68 line: +12.5% under the 2026 action (9903.05.31) and +25% under List 3 (9903.88.03), '
        'which covers all Chapter 68 subheadings. The only exclusion in force (U.S. note 20(vvv)(iii), 9903.88.69) covers brown-wave and '
        'flamed sandstone pavers of the dimensions described (6802.99.00.90), through November 9, 2026. ' + CIVIL + '. ' + QSP_NOTE + ', '
        'and Chinese quartz also carries the 2019 antidumping and countervailing duties. The IEEPA duties on China (fentanyl and reciprocal) '
        'ended February 24, 2026; USTR\'s four-year review kept List 3 in place.',
        'Chinese granite slabs and countertops pay 41.2% (3.7% + 37.5%), marble 39.4%–42.4%, resin-bonded grinding wheels 5¢/kg + 39.5%, '
        'sandpaper and carbon fiber 37.5%; engineered quartz 62.5%–87.5% before antidumping and countervailing duties.',
        ['fr-2026-15181', 'fr-2026-15274', 'hts-chapter-99', 'fr-2018-20610', 'fr-2019-09681', 'fr-2026-20510', 'fr-2025-21671', 'procl-11051', 'fr-2019-14865', 'hts-now'],
    ),
    'in-section-301': (
        'Base rate + 10% (9903.05.44). ' + NO52 + '. ' + QSP_NOTE + ' — India is not on the note 41(c) exclusion list — and the 2020 '
        'antidumping and countervailing duty orders on Indian quartz surface products, continued in December 2025. The IEEPA duties on India '
        '(25% reciprocal from August 7, 2025, plus 25% from August 27, 2025) ended in February 2026.',
        'Indian granite slabs and countertops pay 13.7%, sandstone and other stone 16.5%, slate tiles 10%; Indian engineered quartz 35% in '
        'quota or 60% over quota, plus its company antidumping and countervailing rates.',
        S301_SRC + ['procl-11051', 'fr-2020-13401', 'fr-2020-13374', 'fr-2026-00739'],
    ),
    'eu-section-301': (
        'For EU goods whose base rate is under 10% — every Chapter 68 line — the total is 10% (9903.05.39), in place of the base rate. ' + NO52
        + '. The EU is not on the note 41(c) list, so EU engineered quartz pays the safeguard on top: 35% in quota, 60% over quota. This replaced '
        'the 15%-in-total IEEPA rate (9903.02.20), which ended February 24, 2026.',
        'Italian marble and granite, Spanish slate and limestone, German grinding wheels and mineral wool pay 10% of value — $1,000 on $10,000 — '
        'instead of 15% in late 2025 and 1.9%–6.5% before that. Spanish or Italian engineered quartz pays 35% or 60%.',
        S301_SRC + ['procl-11051'],
    ),
    'br-section-301': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 (9903.05.27). The '
        'Brazil exemption list (U.S. note 50(a)(ii), 9903.05.03) names 6802.99.00 — quartzite, sandstone and the other "other stone" of '
        'heading 6802 — so those four lines pay only the 12.5%. Civil-aircraft articles are relieved by 9903.05.05 and 9903.05.88. Brazil is a '
        'developing country on the note 41(c) list, so its engineered quartz pays no safeguard. The 40% IEEPA duty on Brazil (Executive Order '
        '14323, which also exempted 6802.99.00) ended February 24, 2026.',
        'A Brazilian quartzite slab pays 19% (6.5% + 12.5%); a granite slab or countertop 41.2% (3.7% + 37.5%); marble 39.4%–42.4%.',
        S301_SRC + ['fr-2026-14542', 'eo-14323', 'procl-11051'],
    ),
    'tr-section-301': (
        'Base rate + 12.5% (9903.05.79). ' + NO52 + '. ' + QSP_NOTE + ' — Turkey is not on the note 41(c) list — and Turkish quartz surface '
        'products carry the 2020 antidumping and countervailing duty orders, continued in December 2025. The 15% IEEPA reciprocal duty ended '
        'February 24, 2026.',
        'Turkish marble slabs pay 15%, travertine 16.2%–16.7%, other worked marble 17.4%; Turkish engineered quartz 37.5% or 62.5% plus its '
        'antidumping and countervailing rates.',
        S301_SRC + ['procl-11051', 'fr-2020-13401', 'fr-2020-13374', 'fr-2026-00739'],
    ),
    'mx-section-301': (
        'USMCA-qualifying goods pay no Section 301 duty (9903.05.94); others pay +10% (9903.05.55). ' + NO52 + '. Mexico is excluded from the '
        'quartz safeguard (note 41(c)(i)) and is not subject to the Canada Section 338 duties. Mexican magnesia carbon bricks are under a '
        'Commerce antidumping order. The 25% IEEPA duty on non-USMCA goods (9903.01.01) ended February 24, 2026.',
        'USMCA-qualifying Mexican stone, quartz, concrete, gypsum and mineral wool pay nothing; non-qualifying goods pay the base rate plus 10%.',
        S301_SRC + ['procl-11051', 'fr-2021-17790'],
    ),
    'ca-section-301': (
        'Two measures. The 2026 Section 301 duty (+10%, 9903.05.29) does not apply to USMCA-qualifying goods (9903.05.93). The Section 338 duty '
        '(+50%, from August 22, 2026, 9903.03.14) applies to products of Canada of 6809.11.00 (paper-faced gypsum board) and 6810.99.00 (other '
        'articles of cement, concrete or artificial stone, including quartz slabs), and U.S. note 51(a) says it applies even when USMCA or '
        'another special rate is claimed. Civil-aircraft articles are relieved (9903.03.16). Canada is excluded from the quartz safeguard (note '
        '41(c)(i)). The 35% IEEPA duty on non-USMCA goods (9903.01.10) ended February 24, 2026.',
        'USMCA-qualifying Canadian drywall and quartz slabs pay 50%; non-qualifying 60%. Other USMCA-qualifying Canadian goods — mineral wool, '
        'abrasives, stone, asphalt shingles — pay nothing.',
        ['procl-11048', 'fr-2026-15181', 'fr-2026-15274', 'hts-chapter-99', 'procl-11056', 'csms-69606660', 'procl-11065', 'csms-69851916', 'procl-11051', 'hts-now'],
    ),
    'vn-section-301': (
        'Base rate + 12.5% (9903.05.84). ' + NO52 + '. ' + QSP_NOTE + ' — Vietnam is not on the note 41(c) list. No antidumping order '
        'covers Vietnamese Chapter 68 goods. The 20% IEEPA reciprocal duty (9903.02.69) ended February 24, 2026.',
        'Vietnamese engineered quartz pays 37.5% in quota or 62.5% over quota; granite 16.2%, other stone 19%.',
        S301_SRC + ['procl-11051'],
    ),
    'jp-section-301': (
        'For Japanese goods whose base rate is under 12.5% — every Chapter 68 line — the total is 12.5% (9903.05.49). ' + NO52 + '. Japan is '
        'not on the note 41(c) list, so its quartz surface products also pay the safeguard. The 15%-in-total IEEPA rate ended February 24, '
        '2026.',
        'Japanese carbon fiber, grinding wheels, mica and other Chapter 68 goods pay 12.5% of value in total.',
        S301_SRC + ['procl-11051'],
    ),
    'gb-section-301': (
        'Base rate + 10% (9903.05.81). ' + NO52 + ' — the UK list (note 52(j)(1)) has no Chapter 68 line. The UK is not on the note 41(c) '
        'list, so its quartz surface products also pay the safeguard. The 10% IEEPA reciprocal duty ended February 24, 2026.',
        'British slate, stone and abrasives pay the base rate plus 10% — 13.3% for roofing slate, 13.7% for granite.',
        S301_SRC + ['procl-11051'],
    ),
    'de-section-301': None,  # EU entry covers Germany
    'th-section-301': (
        'Base rate + 12.5% (9903.05.77). ' + NO52 + '. ' + QSP_NOTE + ' — Thailand is not on the note 41(c) list. No antidumping order '
        'covers Thai Chapter 68 goods. The 19% IEEPA reciprocal duty (9903.02.61) ended February 24, 2026.',
        'Thai engineered quartz — the third-largest source of heading 6810 in 2025 — pays 37.5% in quota or 62.5% over quota; Thai granite '
        '16.2%.',
        S301_SRC + ['procl-11051'],
    ),
    'kr-section-301': (
        'For Korean goods whose base rate is under 12.5% — every Chapter 68 line — the total is 12.5% (9903.05.71). ' + NO52 + '. Korea is '
        'on the note 41(c)(ii) list, so Korean quartz surface products pay no safeguard. The 15%-in-total IEEPA rate ended February 24, 2026.',
        'Korean grinding wheels, coated abrasives, carbon fiber and engineered quartz pay 12.5% of value in total.',
        S301_SRC + ['procl-11051'],
    ),
    'ru-section-301': (
        'Russia pays column 2 rates (general note 3(b)) — 13% to 60% on stone, 20%–45% on most other lines — plus +12.5% (9903.05.66). '
        'Seventeen Chapter 68 subheadings — marble slabs, slate, millstones and diamond tools, some abrasive articles, mineral wool and '
        'vermiculite, asphalt rolls, fiber-cement sheets and 6810.99 articles including quartz slabs — pay 35% under 9903.90.08 in place of '
        'their column 2 rate (U.S. note 30).',
        'Most Russian Chapter 68 goods pay 32.5% to 72.5%; fiber-cement articles 1.7¢–2.2¢/kg plus 12.5%.',
        ['fr-2026-15181', 'fr-2026-15274', 'hts-chapter-99', 'procl-10420', 'procl-10523', 'hts-now'],
    ),
    'other-section-301': (
        'Rates by country: Israel and the UAE +12.5%, Malaysia and the UK +10%, Taiwan 10% and Switzerland 12.5% in total, and the '
        'other listed economies +10% or +12.5%. No Chapter 68 line is on the general exemption list (note 52(b)) or any '
        'country exception list (note 52(j)). Countries outside the 60 economies pay only the base rate. For quartz surface products, Israel, '
        'Korea, Australia, Colombia, Panama, Peru, Singapore, the CAFTA-DR countries, CBERA beneficiaries and the listed developing countries '
        '(note 41(c)) pay no safeguard; Malaysia, Taiwan, Thailand and others do.',
        'Israeli engineered quartz pays 12.5% (no safeguard); Malaysian or Taiwanese quartz pays 10% plus the 25%/50% safeguard; UAE asphalt roofing pays the base rate plus 12.5%.',
        S301_SRC + ['procl-11051'],
    ),
}
QSP_ENTRY = {
    'country': 'All countries except Canada, Mexico, FTA partners and listed developing countries (U.S. note 41(c))',
    'measure': 'Section 201 safeguard on quartz surface products (tariff-rate quota)',
    'exemption': 'Applies only to quartz surface products — slabs, countertops, vanity tops, tiles and other surfaces in which silica is the '
    'largest single material by weight, bound with resin — of 6810.99.00.20 and 6810.99.00.40 (and 7020.00.60 in Chapter 70), finished or '
    'not, including QSP fabricated in a third country. It does not cover granite, marble, soapstone or quartzite. Within a quarterly quota of '
    '3,251,606 m² (13,006,426 m² for August 15, 2026–August 14, 2027) the rate is +25% (9903.45.30); entries beyond it pay +50% '
    '(9903.45.31). The duty is cumulative with the base rate and all other duties, including antidumping and countervailing duties and the '
    'Section 301 duties. Products of the countries listed in U.S. note 41(c) — Canada and Mexico; Australia, Colombia, Costa Rica, the '
    'Dominican Republic, El Salvador, Guatemala, Honduras, Israel, Nicaragua, Panama, Peru, Singapore and South Korea; the listed '
    'developing countries (among them Brazil, Indonesia, the Philippines, Cambodia, Pakistan, Sri Lanka, Egypt and South Africa); and CBERA '
    'beneficiaries — are excluded and do not count against the quota. QSP admitted to a foreign-trade zone from August 15, 2026 must be in '
    'privileged foreign status.',
    'whatItMeans': 'A Vietnamese, Indian, Turkish, Spanish or Chinese quartz slab pays +25% while the quarter\'s quota is open and +50% once '
    'it is filled; the rates fall to 23%/49% on August 15, 2027, and the measure ends August 14, 2030. Brazilian, Indonesian, Israeli, '
    'Korean, Mexican and Canadian quartz pays none.',
}

for e in tu['inEffect']:
    if e['id'] in INEFFECT and INEFFECT[e['id']]:
        e['exemption'], e['whatItMeans'], ids = INEFFECT[e['id']]
        for sid in ids:
            if sid not in e['sourceIds']:
                e['sourceIds'].insert(-1, sid) if e['sourceIds'][-1] == 'hts-now' else e['sourceIds'].append(sid)
    elif 'section-201' in e['id']:
        e.update({k: v for k, v in QSP_ENTRY.items()})
        e['ch99Code'] = '9903.45.30 / 9903.45.31'
        e['now'] = '+25% (in quota) or +50% (over quota)'
        for sid in ['fr-2026-10133', 'fr-2025-21715', 'hts-chapter-99']:
            if sid not in e['sourceIds']:
                e['sourceIds'].insert(-1, sid)
    else:
        raise SystemExit(f'no inEffect text for {e["id"]}')
    if e['id'] == 'other-section-301':
        e['country'] = 'Other Section 301 economies (incl. Israel, Malaysia, Taiwan, the UK, the UAE, Switzerland)'
    if 'TODO' in json.dumps(e):
        raise SystemExit(f'TODO left in inEffect {e["id"]}')
    # The validator requires effectiveSourceId to be listed in sourceIds.
    assert e['effectiveSourceId'] in e['sourceIds'], e['id']

# Put the quartz safeguard entry right after China (it is the chapter's own measure).
qsp = [e for e in tu['inEffect'] if 'section-201' in e['id']]
rest = [e for e in tu['inEffect'] if 'section-201' not in e['id']]
tu['inEffect'] = rest[:1] + qsp + rest[1:]

CHANGE_DETAIL = {
    'section-338-canada-2026-08-22': (
        'Canada Section 338 duty takes effect on gypsum board and 6810.99 articles',
        '50% on listed products of Canada after a 3-day suspension lapsed. Chapter 68 is on the motor-vehicle list (9903.03.14) with two '
        'subheadings: 6809.11.00 (gypsum board faced with paper — drywall) and 6810.99.00 (other articles of cement, concrete or artificial '
        'stone, including quartz slabs). Unlike the Section 301 duty, it applies to USMCA-qualifying goods too (U.S. note 51(a)). Both '
        'subheadings remain on the list in Revision 21, after the September 15, 2026 revisions.',
    ),
    'section-201-safeguard-quartz-surface-products-2026-08-15': (
        'Section 201 safeguard on quartz surface products takes effect',
        'Proclamation 11051 put a 4-year tariff-rate quota on quartz surface products (6810.99.00.20, 6810.99.00.40 and 7020.00.60): +25% '
        '(9903.45.30) within a quota of 13,006,426 m² for the first year, filled quarter by quarter (3,251,606 m² each), and +50% '
        '(9903.45.31) over it. The duty stacks on the base rate, the Section 301 duties and the antidumping and countervailing duties. '
        'Canada, Mexico, Australia, Colombia, Israel, Korea, Panama, Peru, Singapore, the CAFTA-DR countries, CBERA beneficiaries and listed '
        'developing countries (U.S. note 41(c)) are excluded. Granite, marble, soapstone and quartzite are outside the scope.',
    ),
    'section-201-safeguard-quartz-surface-products-scheduled-2027-08-15': (
        'Scheduled: quartz safeguard rates step down each August 15',
        'Under U.S. note 41(d)–(e) the in-quota rate falls to 23% and the over-quota rate to 49% for entries from August 15, 2027 (quota '
        '14,771,583 m²), then 21%/48% from August 15, 2028 (15,236,099 m²) and 19%/47% from August 15, 2029 (15,700,614 m²). The safeguard ends '
        'after August 14, 2030.',
    ),
    'section-301-2026-60-economies-2026-07-24': (
        'Section 301 tariffs on 60 economies cover all of Chapter 68',
        '10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). No Chapter 68 line is on the general exemption list (note 52(b)) '
        'or on any country exception list (note 52(j)); only civil-aircraft articles of 6812–6813 are relieved (note 52(d)). EU goods pay 10% '
        'in total and Japanese goods 12.5% in total — every Chapter 68 base rate is below both. India and the UK +10%; Turkey, Vietnam and '
        'Brazil +12.5%. USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94).',
    ),
    'section-301-brazil-2026-07-22': (
        'Section 301 tariff on products of Brazil; quartzite exempt',
        '25% on all goods of Brazil (9903.05.01), except the subheadings in U.S. note 50(a)(ii) (9903.05.03). For Chapter 68 that list names '
        'one subheading, 6802.99.00 — worked quartzite, sandstone and other stone — so Brazilian quartzite slabs pay no Brazil duty, while '
        'granite (6802.93), marble and every other Chapter 68 good pays it. From July 24 the 12.5% forced-labor tariff (9903.05.27) is added on '
        'top of both.',
    ),
    'section-301-nicaragua-scheduled-2027-01-01': (
        'Scheduled: Section 301 tariff on products of Nicaragua',
        'Products of Nicaragua that pay the column 1-general rate (that is, not entered under CAFTA-DR) will pay +10% (9903.89.01) from January '
        '1, 2027 and +15% from January 1, 2028. Today Nicaragua pays the 12.5% 2026 Section 301 duty (9903.05.58).',
    ),
}
# Pending items carry the date of the notice that scheduled them, not the HTS release date (generator quirk).
PENDING_DATES = {
    'section-301-nicaragua-scheduled-2027-01-01': ('2025-12-29', 'Announced'),
    'section-201-safeguard-quartz-surface-products-scheduled-2027-08-15': ('2026-07-31', 'Signed'),
}
for c in tu['changes']:
    if c['id'] in CHANGE_DETAIL:
        c['title'], c['detail'] = CHANGE_DETAIL[c['id']]
    if c['id'] in PENDING_DATES:
        c['date'], c['dateLabel'] = PENDING_DATES[c['id']]
    if c['id'] == 'base-rates':
        c['title'] = 'No Chapter 68 base-rate changes'
        c['detail'] = (
            'All 97 Chapter 68 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition, and no '
            'line was added, split or renumbered.'
        )
    if c['id'].startswith('section-201'):
        c['countries'] = 'All except note 41(c) countries'
        for sid in ['fr-2026-10133']:
            if sid not in c['sourceIds']:
                c['sourceIds'].insert(1, sid)
    if 'TODO' in c['detail']:
        raise SystemExit(f'unfilled change {c["id"]}')


def ch(cid, typ, date, label, title, detail, before, now, countries, ids):
    return {
        'id': cid,
        'type': typ,
        'date': date,
        'dateLabel': label,
        'title': title,
        'detail': detail,
        'before': before,
        'now': now,
        'countries': countries,
        'sourceIds': ids,
    }


EXTRA_CHANGES = [
    ch(
        'cn-301-continue', 'reference', '2026-10-07', 'Published', 'China Section 301 List 3 continues after the four-year review',
        'USTR announced that the 2018 China Section 301 actions did not terminate on their 2026 anniversaries because domestic industries asked '
        'for them to continue. For Chapter 68 this keeps +25% (List 3) on every line — stone, quartz, abrasives, mineral wool, gypsum board, '
        'friction material and carbon fiber.',
        '+25%', '+25%', 'China', ['fr-2026-20510'],
    ),
    ch(
        'qsp-india-review', 'reference', '2026-09-14', 'Published', 'Antidumping review of Indian quartz: preliminary results',
        'Commerce published preliminary results of the 2024–2025 administrative review of the antidumping order on quartz surface products '
        'from India (A-533-889). Final results will reset the company cash-deposit rates; until then the rates from the last completed review '
        'apply.',
        None, None, 'India', ['fr-2026-18700'],
    ),
    ch(
        'ca-338-scope', 'reference', '2026-09-15', 'Effective', 'Canada Section 338 lists revised; Chapter 68 entries kept',
        'Proclamation 11065 modified the provisions on the 9903.03.14 list from September 15, 2026. In Revision 21, which carries the revised '
        'list, 6809.11.00 and 6810.99.00 are still listed.',
        None, None, 'Canada', ['procl-11065', 'csms-69851916', 'hts-chapter-99'],
    ),
    ch(
        'sawblades-sunset', 'reference', '2026-07-06', 'Published', 'Diamond saw-blade order: Commerce finds dumping likely to continue',
        'In the third sunset review of the 2009 antidumping order on diamond sawblades and parts from China (A-570-900), Commerce found that '
        'revocation would likely lead to dumping at margins up to 164.09%. The order — which reaches diamond segments for circular sawblades '
        'entered under 6804.21.00 — stays in force while the USITC completes its expedited review.',
        None, None, 'China', ['fr-2026-13573', 'fr-2026-13610', 'fr-2021-07450'],
    ),
    ch(
        'mcb-sunset', 'reference', '2026-07-02', 'Initiated', 'Magnesia carbon brick orders enter their third five-year review',
        'Commerce and the USITC started sunset reviews of the antidumping orders on magnesia carbon bricks from China and Mexico and the '
        'countervailing duty order on China (A-570-954, A-201-837, C-570-955). The scope covers bricks entered under 6815.91 and 6815.99 as '
        'well as heading 6902; the orders stay in force during the reviews.',
        None, None, 'China, Mexico', ['fr-2026-13416', 'fr-2021-17790'],
    ),
    ch(
        'qsp-201-report', 'reference', '2026-05-18', 'Transmitted', 'USITC finds serious injury from quartz imports (Section 201)',
        'The USITC sent the President its report in investigation TA-201-79, finding that quartz surface products are imported in such '
        'increased quantities as to be a substantial cause of serious injury to the U.S. industry, and recommending relief. USTR took comments '
        'and held a hearing in June; the President proclaimed the safeguard on July 31, 2026.',
        None, None, 'All', ['fr-2026-10133', 'fr-2026-09809', 'procl-11051'],
    ),
    ch(
        'asbestos-gaskets', 'reference', '2026-05-27', 'Effective', 'EPA ban on chrysotile asbestos sheet gaskets takes effect',
        'After May 27, 2026 no one may manufacture or import chrysotile asbestos, or articles containing it, for sheet gaskets used in '
        'chemical production (40 CFR 751.509(a)); titanium dioxide and nuclear-material users have until May 28, 2029 (Savannah River Site '
        '2037). This reaches compressed asbestos fiber jointing and gaskets of 6812.99.',
        'Allowed', 'Import banned', 'All', ['fr-2024-05972'],
    ),
    ch(
        'qsp-in-tr-continue', 'reference', '2025-12-18', 'Effective', 'Quartz antidumping and countervailing orders on India and Turkey continued',
        'After the first five-year reviews, the USITC found that revoking the orders would likely lead to continued injury, and Commerce '
        'continued the antidumping (A-533-889, A-489-837) and countervailing (C-533-890, C-489-838) orders on quartz surface products from '
        'India and Turkey, effective December 18, 2025.',
        None, None, 'India, Turkey', ['fr-2026-00739'],
    ),
    ch(
        'qsp-201-start', 'reference', '2025-11-17', 'Instituted', 'USITC opens a Section 201 safeguard investigation on quartz',
        'On a petition by U.S. producers, the USITC instituted investigation TA-201-79 into whether increased imports of quartz surface '
        'products from all countries cause serious injury — the first step toward the 2026 safeguard tariff.',
        None, None, 'All', ['fr-2025-21715'],
    ),
    ch(
        'sol-gel-orders', 'reference', '2025-09-29', 'Published', 'Antidumping and countervailing orders on Chinese sol-gel abrasive grains',
        'Commerce issued orders on sol gel alumina-based ceramic abrasive grains from China (A-570-190, C-570-191): 88.32% antidumping '
        '(China-wide) and 165.05% countervailing. The scope covers the grains whether or not incorporated into abrasive papers, grinding wheels '
        'and discs — only the grain component, not the whole article — and lists 6804.22 and 6805 subheadings among the classifications.',
        None, None, 'China', ['fr-2025-18882'],
    ),
    ch(
        'qsp-cn-continue', 'reference', '2025-01-24', 'Effective', 'Quartz antidumping and countervailing orders on China continued',
        'After the first sunset reviews Commerce continued the 2019 antidumping (A-570-084) and countervailing (C-570-085) duty orders on '
        'quartz surface products from China, effective January 24, 2025.',
        None, None, 'China', ['fr-2025-01946'],
    ),
    ch(
        'asbestos-brakes', 'reference', '2024-11-25', 'Effective', 'EPA bans imports of chrysotile asbestos brakes, friction products and gaskets',
        'EPA\'s 2024 TSCA rule prohibits the manufacture (including import), processing and distribution of chrysotile asbestos, and articles '
        'containing it, for oilfield brake blocks, aftermarket automotive brakes and linings, other vehicle friction products and other gaskets '
        'after November 25, 2024 (40 CFR 751.509(d)–(e)). For Chapter 68 this reaches asbestos friction material of 6813.20 and asbestos '
        'gaskets and jointing of 6812.',
        'Allowed', 'Import banned', 'All', ['fr-2024-05972'],
    ),
]

# IEEPA / Section 122 history, newest first (shared ids from other chapter files).
IEEPA_CHANGES = [
    ch(
        's122-end', 'extraDuty', '2026-07-23', 'Expired', 'Section 122 import surcharge expired',
        'The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.',
        '+10%', 'None', 'All', ['procl-11012', 'hts-now'],
    ),
    ch(
        'usmca-review', 'reference', '2026-07-01', 'Announced', 'USMCA joint review: not renewed, still in force',
        'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of '
        'the issues or until termination, so USMCA claims (SPI S) still remove the base rate and the Section 301 duty on Mexican and Canadian '
        'goods — but not the Section 338 duty on Canadian gypsum board and 6810.99 articles.',
        None, None, 'Canada, Mexico', ['ustr-usmca-review'],
    ),
    ch(
        's122-start', 'extraDuty', '2026-02-24', 'Effective', 'Section 122 surcharge replaces the IEEPA tariffs',
        '10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 68 subheading was on the product exemption list '
        '(9903.03.03); civil-aircraft articles of 6812–6813 were relieved (9903.03.05). USMCA-qualifying goods from Canada and Mexico were exempt.',
        'None', '+10% (until July 23, 2026)', 'All', ['procl-11012', 'hts-now'],
    ),
    ch(
        'ieepa-end', 'extraDuty', '2026-02-24', 'Effective', 'All IEEPA tariffs end',
        'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive '
        'Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP stopped collecting them for goods entered from '
        '12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.',
        'Varied by country', 'None', 'All', ['scotus-24-1287', 'eo-14389', 'csms-67834313'],
    ),
    ch(
        'india-oil-end', 'extraDuty', '2026-02-07', 'Effective', "India's extra 25% IEEPA duty removed",
        'Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) from February 7, 2026. The 25% reciprocal rate on '
        'India ended with the other IEEPA duties on February 24.',
        '+50%', '+25% (until February 24, 2026)', 'India', ['eo-14384'],
    ),
    ch(
        'cn-ieepa-cut', 'extraDuty', '2025-11-10', 'Effective', 'China fentanyl duty cut to 10%',
        'The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It ended with the other IEEPA duties on February '
        '24, 2026.',
        '+20%', '+10% (ended)', 'China', ['eo-14357'],
    ),
    ch(
        'india-oil', 'extraDuty', '2025-08-27', 'Effective', 'Extra 25% on products of India',
        'Executive Order 14329 added 25% on Indian goods (9903.01.84), on top of the 25% reciprocal rate in force since August 7, 2025 (EO '
        '14326): 50% in all on Indian granite, sandstone and quartz, on top of the base rate and any antidumping duty. Ended February 7, 2026.',
        '+25%', '+50% (ended)', 'India', ['eo-14329', 'eo-14326'],
    ),
    ch(
        'country-rates', 'extraDuty', '2025-08-07', 'Effective', 'Country reciprocal rates replace the 10% baseline',
        'Executive Order 14326 set country rates for goods entered from August 7, 2025: India +25%, Vietnam +20%, Turkey +15%, Brazil and the '
        'UK +10%. EU goods with a column 1 rate under 15% — every Chapter 68 line — paid 15% in total (9903.02.20). '
        'Ended February 24, 2026.',
        '+10%', '+10% to +25% (ended)', 'Listed countries, European Union', ['eo-14326', 'hts-now'],
    ),
    ch(
        'brazil-40', 'extraDuty', '2025-08-06', 'Effective', 'Additional 40% on products of Brazil; quartzite exempt',
        'Executive Order 14323 added 40% on Brazilian goods (9903.01.77) on top of the 10% reciprocal duty — 50% in all on Brazilian granite and '
        'marble. Its exemption list (9903.01.81) named 6802.99.00, so Brazilian quartzite paid only the 10%. Ended February 24, 2026.',
        '+10%', '+50% (ended)', 'Brazil', ['eo-14323'],
    ),
    ch(
        'ca-amended', 'extraDuty', '2025-07-31', 'Signed', 'Canada additional duty raised to 35%',
        'Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.',
        '+25%', '+35% (ended)', 'Canada', ['eo-14325'],
    ),
    ch(
        'cn-reciprocal-10', 'extraDuty', '2025-05-14', 'Effective', 'China reciprocal duty cut from 125% to 10%',
        'Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. A Chinese granite countertop '
        'then paid 3.7% + 25% (List 3) + 20% + 10% = 58.7% until November 9, 2025. Ended February 24, 2026.',
        '+125%', '+10% (ended)', 'China', ['eo-14298'],
    ),
    ch(
        'cn-125', 'extraDuty', '2025-04-10', 'Effective', 'China reciprocal duty raised to 125%',
        'Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% from April 10, 2025, and paused the higher country rates '
        'announced on April 2 for other countries, which never took effect. With the 20% fentanyl duty and the 25% List 3 duty, a Chinese '
        'granite countertop paid 173.7% until May 13, 2025.',
        None, '+125% (ended)', 'China', ['eo-14266'],
    ),
    ch(
        'reciprocal', 'extraDuty', '2025-04-02', 'Signed', 'Reciprocal tariff on products of all countries',
        '10% baseline (9903.01.25) from April 5, 2025, and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 68 product was on '
        'the Annex II exemption list. Ended February 24, 2026.',
        'None', '+10% or more (ended)', 'All except Canada, Mexico', ['eo-14257'],
    ),
    ch(
        'cn-ieepa', 'extraDuty', '2025-03-04', 'Effective', 'China fentanyl duty raised to 20%',
        'The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) to +20%, on top '
        'of the List 3 duty. Ended February 24, 2026.',
        '+10%', '+20% (ended)', 'China', ['eo-14195', 'eo-14228'],
    ),
    ch(
        'mx-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Mexico',
        '+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.',
        'None', '+25% (ended)', 'Mexico', ['eo-14194'],
    ),
    ch(
        'ca-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Canada',
        '+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, 2026.',
        'None', '+25% (ended)', 'Canada', ['eo-14193'],
    ),
]
OLD_CHANGES = [
    ch(
        'qsp-in-tr-orders', 'reference', '2020-06-22', 'Published', 'Antidumping and countervailing orders on quartz from India and Turkey',
        'Commerce issued antidumping orders on quartz surface products from India (A-533-889; 0.33%–3.58% cash deposits, all others 1.02%) '
        'and Turkey (A-489-837; 5.13%), and countervailing orders (C-533-890; India all others 2.17%; C-489-838; Turkey 2.43%). The rates have '
        'since been reset in administrative reviews.',
        None, None, 'India, Turkey', ['fr-2020-13401', 'fr-2020-13374'],
    ),
    ch(
        'qsp-cn-orders', 'reference', '2019-07-11', 'Published', 'Antidumping and countervailing orders on quartz from China',
        'Commerce issued antidumping (A-570-084) and countervailing (C-570-085) duty orders on quartz surface products from China: antidumping '
        'cash deposits of 255.27%–295.02% for examined and separate-rate companies and 326.15% for the China-wide entity, and countervailing '
        'rates of 45.32% to 190.99%.',
        None, None, 'China', ['fr-2019-14865'],
    ),
    ch(
        'cn-list3-25', 'extraDuty', '2019-05-10', 'Effective', 'China List 3 duty raised to 25%',
        'USTR raised the List 3 duty (9903.88.03) from 10% to 25%. List 3 covers every Chapter 68 subheading, and the rate has applied ever since.',
        '+10%', '+25%', 'China', ['fr-2019-09681'],
    ),
    ch(
        'cn-list3', 'extraDuty', '2018-09-24', 'Effective', 'China Section 301 List 3 reaches all of Chapter 68',
        'The third China Section 301 list put +10% on Chinese stone, quartz, abrasives, mineral wool, plaster and cement articles, asbestos and '
        'friction articles, mica and carbon fiber — every Chapter 68 subheading.',
        'None', '+10%', 'China', ['fr-2018-20610'],
    ),
]

tu['changes'] = tu['changes'] + EXTRA_CHANGES + IEEPA_CHANGES + OLD_CHANGES
# Newest first; within one date keep extraDuty before reference (stable sort on date only).
tu['changes'].sort(key=lambda c: c['date'], reverse=True)
seen = set()
for c in tu['changes']:
    assert c['id'] not in seen, c['id']
    seen.add(c['id'])

need = set()
for e in tu['inEffect']:
    need.update(e['sourceIds'])
for c in tu['changes']:
    need.update(c['sourceIds'])
add_sources(tu, sorted(need))

n_in_effect = len(tu['inEffect'])
tu['stats'] = [
    {'label': 'Base rates unchanged', 'value': '97 of 97 lines'},
    {'label': 'Extra duties in effect', 'value': str(n_in_effect)},
    {'label': 'Compared', 'value': '2025 Basic → Rev 21'},
    {'label': 'Quartz safeguard', 'value': '25% / 50%', 'note': 'In quota / over quota, since August 15, 2026'},
    {'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'},
]

exec(open(__file__.replace('fill68.py', 'fill68_text2.py')).read())
