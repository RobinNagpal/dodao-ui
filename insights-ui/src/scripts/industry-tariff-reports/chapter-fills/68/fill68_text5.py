# Writer content for Chapter 68, part 5 — overview text, import statistics, matrix intro, FAQ. Exec'd by fill68.py.
# ruff: noqa

L = by_hs6
q6810, marble, ostone, granite = L['681099'], L['680291'], L['680299'], L['680293']
chg_total = pct(total, prior_total)

# ---------------------------------------------------------------- overview
ov['h1'] = f'HTS Chapter 68: {SHORT} — Tariff Rates'
ov['seo'] = {
    'title': 'HTS Chapter 68 Tariffs 2026: Quartz, Granite, Marble & Stone Import Duty Rates by Country | KoalaGains',
    'shortDescription': 'Searchable 2026 U.S. tariff table for all 97 HTS Chapter 68 lines — granite, marble, quartzite, engineered quartz, '
    'slate, grinding wheels, sandpaper, mineral wool, gypsum board, fiber-cement, asbestos and carbon fiber. Base rates Free to 9%, plus the '
    'quartz safeguard (25%/50%), Section 301 by country and antidumping duties on quartz.',
    'keywords': [
        'hts chapter 68',
        'hts chapter 68 import duty rates',
        'articles of stone, plaster, cement, asbestos, mica or similar materials tariff',
        'tariff on quartz countertops',
        'granite tariff code',
        'hs code for quartz slabs',
        'section 301 tariffs on chinese artificial stone',
        'brazilian quartzite import duty exemption',
        'indian slate and granite customs duty',
        'section 201 quartz tariff',
    ],
}
ov['intro'] = (
    'Chapter 68 covers worked stone — granite, marble, travertine, quartzite, slate — and the man-made materials around it: engineered '
    'quartz and concrete articles, gypsum board, mineral wool, asphalt roofing, fiber-cement, grinding wheels and sandpaper, friction '
    'material, asbestos articles, mica and carbon fiber. **Base rates are low**: 42 of the 97 tariff lines are dutiable, at 1.9% to 9% — '
    'granite 3.7%, marble slabs 2.5%, quartzite and other stone 6.5%, mineral wool 3.9% — and engineered quartz slabs are Free.\n\n'
    f'The U.S. imported **{fmt_usd(total)}** of these goods in {Y}: {fmt_usd(h["6802"])} of worked stone (heading 6802) and '
    f'{fmt_usd(h["6810"])} of concrete and artificial-stone articles, engineered quartz included. **Mexico** ({fmt_usd(I("Mexico"))}) and '
    f'**Canada** ({fmt_usd(I("Canada"))}) led, ahead of Brazil, India, Italy and China. The extra duty decides the price: since **August 15, '
    '2026** engineered quartz pays a **Section 201 safeguard** of +25% in quota or +50% over quota (Canada, Mexico, Brazil, Israel, Korea and '
    'other listed countries excluded), on top of a **Section 301 tariff** on 60 economies (+10% India, +12.5% Turkey, Vietnam and Thailand, '
    '10% in total for the EU). China pays +37.5% on every line, and Chinese, Indian and Turkish quartz also carries **antidumping and '
    'countervailing duties**. Brazilian granite pays 41.2%, but **Brazilian quartzite is exempt** from the 25% Brazil duty (19% in total). '
    'Canadian gypsum board and 6810.99 articles owe a **50% Section 338 duty even under USMCA**, and EPA bans the import of chrysotile '
    'asbestos brakes and gaskets.'
)
ov['stats'] = [s for s in ov['stats'] if s['label'] in ('Tariff lines', 'Lines with a base-rate duty')]
ov['stats'] += [
    {
        'label': 'Lines with an extra duty for some origins',
        'value': '97 of 97',
        'note': 'Section 301 (2026, 60 economies): 97; China List 3: 97; Brazil: 93 (6802.99.00 exempt); Russia 35% in lieu of column 2: 27; '
        'Canada Section 338: 5 (also on USMCA goods); quartz safeguard: 2',
    },
    {'label': f'{Y} imports', 'value': fmt_usd(total)},
    {'label': 'Quartz safeguard', 'value': '+25% / +50%', 'note': 'In quota / over quota, 6810.99.00.20/.40'},
]
snap = ov['tradeSnapshot']
snap['effectiveDutyRateNote'] = 'Duty-collected figures aren’t available from an official source yet.'
snap['source'] = f'UN Comtrade, United States imports, HS chapter 68 ({Y})'
snap['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar {Y} — before '
    'the 2026 tariff changes. Comtrade reports engineered quartz together with other articles of 6810.99.'
)
for c in snap['topCountries']:
    c['name'] = disp(c['name'])

# ---------------------------------------------------------------- understand industry
ui['seo'] = {
    'title': 'U.S. Stone, Quartz, Granite & Marble Imports by Country — HTS Chapter 68 Trade Statistics | KoalaGains',
    'shortDescription': f'U.S. imports of HTS Chapter 68 goods: {fmt_usd(total)} in {Y}. Who supplies granite, marble, quartzite, engineered '
    'quartz, gypsum board, abrasives and mineral wool — Mexico, Canada, Brazil, India, Italy, China, Turkey, Vietnam — with values by product '
    'and year from UN Comtrade.',
    'keywords': [
        'hts chapter 68',
        'hts chapter 68 tariff updates',
        'us quartz imports by country',
        'us granite imports by country',
        'marble imports from turkey and italy',
        'brazil quartzite exports to us',
        'china tariff on articles of stone, plaster, cement, asbestos, mica or similar materials',
        'chapter 68 customs duty updates',
    ],
}
ui['valueBasis'] = trade['valueBasis']
ui['byYearCaption'] = (
    f'U.S. imports of Chapter 68 goods each year, split into the two largest {Y} suppliers ({ui["byYearPartners"][0]} and '
    f'{ui["byYearPartners"][1]}) and everyone else.'
)
ui['effectiveDuty']['note'] = 'Duty-collected figures aren’t available from an official source yet.'
th_2020 = imp_year(cname('Thailand'), 2020)
ui['why'] = (
    f'U.S. imports of Chapter 68 goods were **{fmt_usd(total)} in {Y}**, {abs(chg_total)}% less than the {fmt_usd(prior_total)} of {PY} and '
    f'below the {fmt_usd(year_tot[2022])} peak of 2022. Two headings make up more than half: **worked stone (6802)**, {fmt_usd(h["6802"])} — '
    f'marble and travertine {fmt_usd(marble["importsUsd"])}, quartzite and other stone {fmt_usd(ostone["importsUsd"])} (up '
    f'{pct(ostone["importsUsd"], ostone["priorImportsUsd"])}%), granite {fmt_usd(granite["importsUsd"])} (down '
    f'{abs(pct(granite["importsUsd"], granite["priorImportsUsd"]))}%) — and **concrete and artificial-stone articles (6810)**, '
    f'{fmt_usd(h["6810"])}, of which 6810.99 — the line for engineered quartz and other articles — was {fmt_usd(q6810["importsUsd"])}, down '
    f'{abs(pct(q6810["importsUsd"], q6810["priorImportsUsd"]))}%. Carbon fiber, graphite and other mineral articles (6815) added '
    f'{fmt_usd(h["6815"])}.\n\n'
    f'Suppliers specialize. **Mexico** ({fmt_usd(I("Mexico"))}) ships gypsum board ({fmt_usd(hc("6809", "Mexico"))}), concrete and '
    f'artificial-stone articles ({fmt_usd(hc("6810", "Mexico"))}) and coated abrasives; **Canada** ({fmt_usd(I("Canada"))}) asphalt roofing ({fmt_usd(hc("6807", "Canada"))}), 6810 articles '
    f'({fmt_usd(hc("6810", "Canada"))}) and mineral wool. **Brazil** ({fmt_usd(I("Brazil"))}, +{C("Brazil")}%) is the largest stone supplier — {fmt_usd(hc("6802", "Brazil"))} of '
    f'heading 6802 — ahead of **Italy** ({fmt_usd(hc("6802", "Italy"))}) and **Turkey** '
    f'({fmt_usd(hc("6802", cname("Turkey")))}). Heading 6810, where engineered quartz is classified, comes mainly from **India** '
    f'({fmt_usd(hc("6810", "India"))}), **Vietnam** ({fmt_usd(hc("6810", cname("Vietnam")))}) and **Thailand** '
    f'({fmt_usd(hc("6810", cname("Thailand")))}; Thailand\'s total imports grew from {fmt_usd(th_2020)} in 2020 to '
    f'{fmt_usd(I("Thailand"))}). **China** fell {abs(C("China"))}% to {fmt_usd(I("China"))}, from {fmt_usd(imp_year("China", 2020))} in 2020 — '
    'its quartz has been under antidumping duties since 2019. Germany, Japan, Mexico and France lead heading 6815 (carbon fiber, graphite and other mineral articles).\n\n'
    f'The figures are annual and stop at {Y}, before the 2026 tariff changes (the end of the IEEPA duties in February, the Section 301 tariffs '
    'from July 24, the quartz safeguard from August 15 and the Canada Section 338 duties from August 22); they do not show what those '
    'changes did. Duty-collected figures are not available from an official source yet.'
)
ui['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar years '
    f'2020–{Y}. HS 6810.99 combines engineered quartz with other articles of cement, concrete or artificial stone. "Other Asia, nes" is how UN '
    'Comtrade reports Taiwan.'
)
ui['sources'] = [{'label': f'UN Comtrade (public API), United States imports, HS chapter 68 (retrieved {trade["retrievedAt"]})', 'url': 'https://comtradeplus.un.org/'}]
ui['lastCheckedAt'] = TODAY

# ---------------------------------------------------------------- industry areas
ia['seo'] = {
    'title': 'Quartz, Granite & Stone Tariffs by Country 2026 — Brazil, India, Italy, China, Turkey, Vietnam (HTS Ch. 68) | KoalaGains',
    'shortDescription': 'The total 2026 U.S. tariff on Chapter 68 goods by country: 10% for Italian and Spanish stone, 13.7% for Indian '
    'granite, 19% for Brazilian quartzite but 41.2% for Brazilian granite, 37.5%–62.5% for Vietnamese and Thai quartz, up to 87.5% plus '
    'antidumping duties for Chinese quartz, and 50% Section 338 on Canadian drywall.',
    'keywords': [
        'chapter 68 customs duty',
        'tariff on granite from india',
        'tariffs on granite from brazil',
        'tariff on quartzite from brazil',
        'italian marble tariffs',
        'tariff on granite from china',
        'usmca compliant mexican stone tariffs',
        'quartz safeguard tariff by country',
    ],
}
ia['intro'] = (
    'Chapter 68 base rates are low — Free to 9% — so the extra duty that **depends on where the goods come from** decides the price. Each cell '
    'below is the base rate for that product group plus the extra duty for that country, minus any preference — taken from the current tariff '
    'schedule.\n\n'
    'Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** that started July '
    '24, 2026: **+10% for India**, **+12.5% for Turkey, Vietnam and Thailand**, **10% in total for Italy, Spain, Germany and the rest of the '
    'EU** and **12.5% in total for Japan and Korea**. **China adds 37.5%** (12.5% plus the 25% List 3 duty) and **Brazil 37.5%** — except on '
    'quartzite and other stone of 6802.99.00, which pays only 12.5%. Engineered quartz from most countries adds the **quartz safeguard** '
    '(+25% in quota, +50% over quota), so the 6810 cells show three totals. USMCA-qualifying goods from Mexico pay nothing; from Canada they '
    'pay nothing except on gypsum board and 6810.99 articles, which owe the **50% Section 338 duty** whatever is claimed.'
)

# ---------------------------------------------------------------- FAQ
fc = d['finalConclusion']
fc['h1'] = f'HTS Chapter 68: {SHORT} — Tariff FAQ'
fc['seo'] = {
    'title': 'Quartz, Granite, Marble & Stone Tariff FAQ: Quartz Safeguard, Brazil Quartzite, India, China, HS Codes (HTS Ch. 68) | KoalaGains',
    'shortDescription': 'Answers to what people search about U.S. tariffs on quartz countertops, granite, marble, quartzite and natural '
    'stone — the 2026 quartz safeguard, quartz antidumping duties, Brazilian quartzite, Indian and Chinese granite — plus the HS codes for '
    'quartz slabs, granite, marble, grinding wheels, sandpaper, mineral wool, gypsum board, carbon fiber and brake linings, and the U.S. '
    'asbestos import ban.',
    'keywords': [
        'tariff on quartz countertops',
        'section 201 quartz tariff',
        'anti dumping duty on quartz from india',
        'tariff on quartzite from brazil',
        'tariff on granite from india',
        'italian marble tariffs',
        'tariffs on natural stone',
        'hs code for quartz slabs',
        'hs code for granite',
        'hs code for marble',
        'hs code for gypsum board',
        'is asbestos banned in the us',
    ],
}
fc['intro'] = (
    'Straight answers to the most common questions about U.S. tariffs and import rules for quartz, granite, marble and other Chapter 68 goods. '
    'Each answer links to the page with the full detail.'
)
fc['keyTakeaways'] = [
    '42 of the 97 Chapter 68 lines carry a base duty, all of it low: granite 3.7%, marble slabs 2.5%, quartzite and other stone 6.5%, '
    'mineral wool 3.9%, concrete tiles up to 9%. Engineered quartz slabs, sandpaper, gypsum board and carbon fiber are Free.',
    'Since August 15, 2026 engineered quartz (6810.99.00.20/.40) pays a Section 201 safeguard: +25% within the quarterly quota, +50% over '
    'it, stepping down each August to 2030. Canada, Mexico, Brazil, Israel, Korea, the CAFTA-DR countries and listed developing countries '
    'are excluded.',
    'Since July 24, 2026 a Section 301 duty is added by country: +10% India, +12.5% Turkey, Vietnam and Thailand, 10% in total for the EU, '
    '12.5% in total for Japan and Korea. China pays +37.5% on every line; Brazil +37.5% except quartzite and other stone of 6802.99.00 '
    '(+12.5%).',
    'Quartz from China, India and Turkey also carries antidumping and countervailing duties, continued in 2025; diamond saw-blade '
    'segments, sol-gel abrasive grains and magnesia carbon bricks from China (and bricks from Mexico) have their own orders.',
    'USMCA-qualifying goods from Mexico pay nothing; Canadian gypsum board and 6810.99 articles pay 50% Section 338 even under USMCA.',
    'The IEEPA duties ended February 24, 2026 and the 10% Section 122 surcharge July 23, 2026. EPA bans the import of chrysotile asbestos '
    'brakes, friction products and gaskets; other asbestos articles need EPA notice first.',
]
fc['lastCheckedAt'] = TODAY
fc['questionSource'] = 'Google search suggestions (U.S. English), collected October 13, 2026'


def faq(fid, q, searched, ans, link):
    return {'id': fid, 'question': q, 'searchedAs': searched, 'answer': ans, 'link': link}


fc['faqs'] = [
    faq(
        'quartz-tariff', 'Is there a tariff on quartz countertops?',
        ['tariff on quartz countertops', 'us tariff on quartz', 'new tariff on quartz', 'trump tariff on quartz', 'tariff on imported quartz',
         'quartz countertop tariff', 'section 201 quartz tariff', 'quartz safeguard tariff'],
        'Yes. Engineered quartz slabs and countertops (6810.99.00.20/.40) are Free in the base column, but since August 15, 2026 they pay a '
        'Section 201 safeguard (Proclamation 11051): +25% while the quarterly quota of 3,251,606 m² is open (9903.45.30) and +50% once it is '
        'filled (9903.45.31), falling to 23%/49% on August 15, 2027 and ending August 14, 2030. The Section 301 duty for the country is added: '
        'Vietnamese or Thai quartz pays 37.5% or 62.5%, Indian 35% or 60%, Spanish or Italian 35% or 60%, Chinese 62.5% or 87.5%. Quartz from '
        'Canada, Mexico, Brazil, Israel, Korea, Indonesia and other countries on the note 41(c) list pays no safeguard.',
        'tariff-updates',
    ),
    faq(
        'quartz-adcvd', 'Is there an antidumping duty on quartz from India, China or Turkey?',
        ['anti dumping duty on quartz from india', 'anti dumping duty on quartz', 'quartz safeguard case'],
        'Yes. Commerce antidumping and countervailing duty orders cover quartz surface products from China (since 2019: A-570-084, C-570-085, '
        'continued January 2025) and from India (A-533-889, C-533-890) and Turkey (A-489-837, C-489-838), both since 2020 and continued in '
        'December 2025. At the orders, China-wide cash deposits were 326.15% antidumping plus 45.32% or more countervailing; India 0.33%–3.58% '
        'antidumping plus about 2% countervailing; Turkey 5.13% plus 2.43%. Commerce resets company rates in annual reviews. These duties are '
        'on top of the safeguard and the Section 301 duty.',
        'tariff-updates',
    ),
    faq(
        'quartzite-brazil', 'What is the tariff on quartzite from Brazil?',
        ['tariff on quartzite', 'tariff on quartzite from brazil', 'tariffs on quartzite from brazil to usa', 'brazil quartzite tariff',
         'quartzite tariff'],
        'Quartzite slabs (6802.99.00.50) have a 6.5% base rate. Brazil pays the 12.5% Section 301 duty (9903.05.27), but 6802.99.00 is on the '
        'exemption list of the 25% Brazil Section 301 duty (U.S. note 50(a)(ii)), so a quartzite slab pays 19% in total. Natural quartzite is '
        f'not a quartz surface product, so the quartz safeguard does not apply. Brazil supplied {fmt_usd(hc("6802", "Brazil"))} of worked stone '
        f'in {Y}.',
        'industry-areas',
    ),
    faq(
        'granite', 'What is the tariff on granite from India, China and Brazil?',
        ['tariff on granite', 'granite tariffs', 'tariff on granite from india', 'tariff on granite from china', 'tariffs on granite countertops',
         'tariffs on granite from brazil', 'us tariff on indian granite', 'is there a tariff on granite', 'brazil granite tariff'],
        'Granite slabs, countertops and monuments (6802.93) have a 3.7% base rate. Indian granite pays 13.7% (+10% Section 301), Brazilian '
        '41.2% (+12.5% and the 25% Brazil duty — granite is not on its exemption list), Chinese 41.2% (+12.5% and 25% List 3), Italian or '
        'Spanish 10% in total, Turkish or Vietnamese 16.2%. USMCA-qualifying Mexican or Canadian granite pays nothing. Granite is natural stone, '
        'so the quartz safeguard does not apply.',
        'industry-areas',
    ),
    faq(
        'marble', 'What are the tariffs on marble from Italy and Turkey?',
        ['marble tariffs', 'italian marble tariffs', 'tariffs on marble'],
        'Marble slabs pay 2.5% (6802.91.05), other worked marble 4.9% and marble simply cut or sawn 1.9%. Italian (or other EU) marble pays 10% '
        'in total since July 24, 2026 (9903.05.39) — $1,000 on $10,000 of slabs — instead of 15% in late 2025. Turkish marble pays the base '
        f'rate plus 12.5%: 15% for slabs. Italy supplied {fmt_usd(hc("6802", "Italy"))} and Turkey {fmt_usd(hc("6802", cname("Turkey")))} of '
        f'worked stone in {Y}.',
        'industry-areas',
    ),
    faq(
        'natural-stone', 'Are there tariffs on natural stone and stone countertops?',
        ['tariff on natural stone', 'tariffs on natural stone', 'brazil tariff on natural stone', 'tariffs on stone countertops',
         'tariffs on imported stone', 'tariffs on stone'],
        'Yes, but natural stone pays far less than engineered quartz. Base rates run from 1.9% to 6.5% (heading 6802), and the 2026 Section '
        '301 duty is added by country: 10% in total from the EU, +10% from India, +12.5% from Turkey or Vietnam, +37.5% from China and from '
        'Brazil (except quartzite and other 6802.99 stone, +12.5%). Granite, marble, soapstone and quartzite are outside the quartz safeguard '
        'and the quartz antidumping orders.',
        'industry-areas',
    ),
    faq(
        'hs-quartz', 'What is the HS code for quartz slabs and quartz countertops?',
        ['hs code for quartz slabs', 'hs code for quartz stone slabs', 'hs code for quartz countertop', 'quartz hs code', 'hs code for quartz stone',
         'hs code for quartzite'],
        'Engineered (agglomerated) quartz slabs of the type used for countertops are 6810.99.00: 6810.99.00.20 for rectangular slabs at least '
        '3 m long and 1.25 m wide, 6810.99.00.40 for other quartz slabs and countertops. Quartz tiles may fall in 6810.19.12. Natural quartzite '
        'is worked stone of 6802.99.00 (slabs 6802.99.00.50). Quartz sand and crystals are in Chapters 25 and 71.',
        '',
    ),
    faq(
        'hs-granite', 'What is the HS code for granite slabs, countertops and tiles?',
        ['hs code for granite', 'hs code for granite slabs', 'hs code for granite countertops', 'hs code for granite tiles', 'granite tariff code',
         'hs code for granite blocks'],
        'Polished or further-worked granite is 6802.93.00 (3.7%): 6802.93.00.10 for building pieces not cut to size, 6802.93.00.20/.25 for '
        'pieces cut to size up to 1.5 cm or 7.5 cm thick (slabs, tiles, countertops), 6802.93.00.35 for monuments. Granite simply cut or sawn '
        'with a flat surface is 6802.23.00 (3.7%); small tiles under 7 cm are 6802.10.00 (4.8%). Rough granite blocks are 2516.11 or 2516.12 '
        '(Chapter 25).',
        '',
    ),
    faq(
        'hs-marble', 'What is the HS code for marble slabs and tiles?',
        ['hs code for marble', 'hs code for marble slabs', 'hs code for marble tiles', 'hs code for marble stone', 'hs code for marble table top',
         'hs code for marble blocks'],
        'Marble slabs (flat pieces up to 5.1 cm thick, additional U.S. note 1) are 6802.91.05.00 (2.5%); other worked marble, including tiles '
        'whose face is 7 cm or more across, is 6802.91.15.00 (4.9%); marble simply cut or sawn is 6802.21.50.00 (1.9%). Marble blocks are '
        'heading 2515 (Chapter 25), and marble statues that are works of art are Chapter 97.',
        '',
    ),
    faq(
        'hs-abrasives', 'What is the HS code for grinding wheels and sandpaper?',
        ['hs code for grinding wheel', 'hs code for abrasive wheel', 'hs code for grinding disc', 'hs code for diamond grinding wheel',
         'hs code for sandpaper', 'hs code for sanding belt', 'hs code for abrasive paper'],
        'Grinding wheels and discs without frameworks are heading 6804: diamond wheels 6804.21.00 (Free), wheels bonded with synthetic resin '
        '6804.22.10 (5¢/kg + 2%), vitrified abrasive wheels 6804.22.40 (Free). Sandpaper is 6805.20.00 (on paper), abrasive cloth 6805.10.00 '
        'and belts and discs on other backings 6805.30 — all Free. Chinese diamond saw-blade segments and products made with Chinese sol-gel '
        'alumina grains carry antidumping duties.',
        '',
    ),
    faq(
        'hs-building', 'What are the HS codes for gypsum board, mineral wool and cement board?',
        ['hs code for gypsum board', 'hs code for drywall', 'plasterboard hs code', 'hs code for mineral wool', 'hs code for rock wool',
         'hs code for rock wool board', 'hs code for cement board', 'hs code for fiber cement board'],
        'Paper-faced gypsum board (drywall) is 6809.11.00 (Free; 6809.11.00.10 for gypsum plaster); other plaster boards 6809.19.00 (3%). Rock '
        'and slag wool batts, boards and pipe coverings are 6806.10.00 (3.9%). Fiber-cement board and siding without asbestos is 6811.82.00 '
        '(Free); cement backer board of other concrete is 6810.99.00.80. Canadian gypsum board pays the 50% Section 338 duty even under USMCA.',
        '',
    ),
    faq(
        'hs-carbon-fiber', 'What is the HS code for carbon fiber?',
        ['hs code for carbon fiber', 'hs code for carbon fiber fabric', 'hs code for carbon fiber sheet', 'hs code for carbon fibre',
         'tariff on carbon fiber'],
        'Carbon fibers are 6815.11.00, fabrics of carbon fibers 6815.12.00 and other articles of carbon fibers for non-electrical uses '
        '6815.13.00 — all Free in the base column. The Section 301 duty applies by country: 10% in total from the EU, 12.5% in total from Japan '
        'or Korea, +37.5% from China. Parts made for a specific machine or vehicle are usually classified with that article.',
        '',
    ),
    faq(
        'hs-brakes', 'What is the HS code for brake linings and brake pads?',
        ['hs code for brake lining', 'hs code for brake pads', 'hs code for brake shoe', 'disc pads hs code'],
        'Friction material that is not mounted — brake lining in rolls or segments, unmounted pads, clutch facings — is heading 6813: '
        '6813.81.00 for brake linings and pads without asbestos, 6813.89.00 for other friction material, 6813.20.00 if it contains asbestos — '
        'all Free. Brake pads and shoes mounted for motor vehicles are 8708.30. Asbestos friction products for vehicles may not be imported '
        'under EPA\'s 2024 rule.',
        'tariff-engineering',
    ),
    faq(
        'asbestos', 'Is asbestos banned in the U.S.? Can asbestos products be imported?',
        ['is asbestos banned in the us', 'is asbestos illegal in the us', 'is asbestos completely banned in the us', 'asbestos import ban',
         'are asbestos products banned in the us', 'hs code for asbestos'],
        'Partly. EPA\'s 2024 TSCA rule bans importing chrysotile asbestos, or articles containing it, for aftermarket automotive brakes and '
        'linings, other vehicle friction products, oilfield brake blocks and other gaskets (since November 25, 2024) and for sheet gaskets in '
        'chemical production (since May 27, 2026, with limited exceptions to 2029). Flooring felt and asbestos paper products have been banned '
        'since the 1990s, and any other asbestos use — asbestos-cement products, millboard, packings — needs a significant new use notice to '
        'EPA 90 days before import. Asbestos articles are classified in 6811.40, 6812 and 6813.20.',
        'tariff-engineering',
    ),
]
assert 11 <= len(fc['faqs']) <= 15

d['asOf'] = TODAY
_blob = json.dumps(d, ensure_ascii=False)
if 'TODO' in _blob:
    i = _blob.index('TODO')
    raise SystemExit('TODO left: ' + _blob[i - 200:i + 50])
json.dump(d, open(OUT, 'w'), ensure_ascii=False, indent=1)
print('wrote', OUT)
