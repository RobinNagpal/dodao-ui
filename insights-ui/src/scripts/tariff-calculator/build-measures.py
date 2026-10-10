# Builds src/tariff-data/calculator/measures.json from note-coverage.json plus the reviewed measure definitions below
# (rates, countries, conditions, dates and official sources). Run: python3 src/scripts/tariff-calculator/build-measures.py
# Review every change to the definitions against the cited official documents; see docs/insights-ui/tariffs/calculator-data-refresh.md.
import json, sys
sys.dont_write_bytecode = True  # importing measures_named_products must not leave __pycache__ in the repo
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # measures_named_products
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tariff-data', 'calculator') + os.sep
cov = json.load(open(ROOT + 'note-coverage.json'))['notes']
ED = '2026 Revision 21'
CH99_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'

def hts_note(n):
    return {'citation': f'HTSUS 2026 Revision 21, Chapter 99, subchapter III, U.S. note {n}', 'url': CH99_PDF, 'published': '2026-10-07'}

SRC = {
  'ustr-301-fl': {'citation': '91 FR 47318 (USTR notice of actions in the Section 301 forced-labor investigations of 60 economies)', 'url': 'https://www.federalregister.gov/documents/2026/07/28/2026-15181/notice-of-actions-in-section-301-investigations-of-acts-policies-and-practices-of-various-economies', 'published': '2026-07-28'},
  'pm-301-fl': {'citation': '91 FR 47717 (Presidential Memorandum of July 23, 2026: Section 301 actions on 60 economies)', 'url': 'https://www.federalregister.gov/documents/2026/07/28/2026-15274/actions-by-the-united-states-in-the-investigations-under-section-301-of-the-trade-act-of-1974-of-the', 'published': '2026-07-28'},
  'ustr-301-br': {'citation': '91 FR 45516 (USTR notice of action: Brazil Section 301 investigation)', 'url': 'https://www.federalregister.gov/documents/2026/07/20/2026-14542/notice-of-action-brazils-acts-policies-and-practices-related-to-digital-trade-and-electronic-payment', 'published': '2026-07-20'},
  'ustr-301-cn-3-increase': {'citation': '84 FR 20459 (USTR: List 3 rate increased from 10% to 25%)', 'url': 'https://www.federalregister.gov/documents/2019/05/09/2019-09681/notice-of-modification-of-section-301-action-chinas-acts-policies-and-practices-related-to', 'published': '2019-05-09'},
  'ustr-301-cn-4a': {'citation': '84 FR 43304 (USTR: List 4A imposed)', 'url': 'https://www.federalregister.gov/documents/2019/08/20/2019-17865/notice-of-modification-of-section-301-action-chinas-acts-policies-and-practices-related-to', 'published': '2019-08-20'},
  'ustr-301-cn-4a-cut': {'citation': '85 FR 3741 (USTR: List 4A rate cut from 15% to 7.5% from February 14, 2020)', 'url': 'https://www.federalregister.gov/documents/2020/01/22/2020-00904/notice-of-modification-of-section-301-action-chinas-acts-policies-and-practices-related-to', 'published': '2020-01-22'},
  'ustr-301-cn-1': {'citation': '83 FR 28710 (USTR notice of action: List 1, 25% from July 6, 2018)', 'url': 'https://www.federalregister.gov/documents/2018/06/20/2018-13248/notice-of-action-and-request-for-public-comment-concerning-proposed-determination-of-action-pursuant', 'published': '2018-06-20'},
  'ustr-301-cn-2': {'citation': '83 FR 40823 (USTR notice of action: List 2, 25% from August 23, 2018)', 'url': 'https://www.federalregister.gov/documents/2018/08/16/2018-17709/notice-of-action-pursuant-to-section-301-chinas-acts-policies-and-practices-related-to-technology', 'published': '2018-08-16'},
  'ustr-301-cn-3': {'citation': '83 FR 47974 (USTR: List 3 imposed, 10% from September 24, 2018)', 'url': 'https://www.federalregister.gov/documents/2018/09/21/2018-20610/notice-of-modification-of-section-301-action-chinas-acts-policies-and-practices-related-to', 'published': '2018-09-21'},
  'ustr-301-cn-2024': {'citation': '89 FR 76581 (USTR four-year review modification: 2024–2026 increases, ship-to-shore cranes, solar-equipment exclusions)', 'url': 'https://www.federalregister.gov/documents/2024/09/18/2024-21217/notice-of-modification-chinas-acts-policies-and-practices-related-to-technology-transfer', 'published': '2024-09-18'},
  'ustr-301-cn-2024-dec': {'citation': '89 FR 101682 (USTR: polysilicon, wafers and tungsten products from January 1, 2025)', 'url': 'https://www.federalregister.gov/documents/2024/12/16/2024-29462/notice-of-modification-chinas-acts-policies-and-practices-related-to-technology-transfer', 'published': '2024-12-16'},
  'ustr-301-cn-semis': {'citation': '90 FR 60848 (USTR semiconductor action: 9903.91.05 rate to rise on June 23, 2027)', 'url': 'https://www.federalregister.gov/documents/2025/12/29/2025-23912/notice-of-action-chinas-acts-policies-and-practices-related-to-targeting-of-the-semiconductor', 'published': '2025-12-29'},
  'ustr-301-cn-excl-2024': {'citation': '89 FR 46948 (USTR: extension of 164 product exclusions, note 20(vvv))', 'url': 'https://www.federalregister.gov/documents/2024/05/30/2024-11904/notice-of-extension-of-certain-exclusions-chinas-acts-policies-and-practices-related-to-technology', 'published': '2024-05-30'},
  'ustr-301-cn-excl-ext': {'citation': '90 FR 55232 (USTR: the 178 exclusions extended through November 9, 2026)', 'url': 'https://www.federalregister.gov/documents/2025/12/01/2025-21671/notice-of-product-exclusion-extensions-chinas-acts-policies-and-practices-related-to-technology', 'published': '2025-12-01'},
  'ustr-301-cn-excl-conform-1': {'citation': '91 FR 56538 (USTR: conforming amendments to note 20(vvv)(i)(4)–(6), (iv)(4) for the July 1, 2026 statistical changes)', 'url': 'https://www.federalregister.gov/documents/2026/09/02/2026-17925/notice-of-conforming-amendments-to-product-exclusions-chinas-acts-policies-and-practices-related-to', 'published': '2026-09-02'},
  'ustr-301-cn-excl-conform-2': {'citation': '91 FR 64211 (USTR: conforming amendment to note 20(vvv)(i)(20))', 'url': 'https://www.federalregister.gov/documents/2026/10/07/2026-20511/notice-of-conforming-amendment-to-product-exclusion-chinas-acts-policies-and-practices-related-to', 'published': '2026-10-07'},
  'ustr-301-maritime': {'citation': '90 FR 48320 (USTR maritime Section 301: 100% on ship-to-shore cranes and intermodal chassis, headings 9903.91.12–9903.91.16)', 'url': 'https://www.federalregister.gov/documents/2025/10/16/2025-19568/notice-of-modification-and-proposed-modification-of-section-301-action-chinas-targeting-of-the', 'published': '2025-10-16'},
  'ustr-301-maritime-suspend': {'citation': '90 FR 50947 (USTR: maritime Section 301 actions suspended November 10, 2025 through November 9, 2026)', 'url': 'https://www.federalregister.gov/documents/2025/11/13/2025-19873/notice-of-modification-of-section-301-action-chinas-targeting-of-the-maritime-logistics-and', 'published': '2025-11-13'},
  'procl-10522': {'citation': '88 FR 13267 (Proclamation 10522: Adjusting Imports of Aluminum — 200% on Russian aluminum and derivatives)', 'url': 'https://www.federalregister.gov/documents/2023/03/02/2023-04470/adjusting-imports-of-aluminum-into-the-united-states', 'published': '2023-03-02'},
  'procl-10895': {'citation': '90 FR 9807 (Proclamation 10895: Adjusting Imports of Aluminum — derivative lists of note 19(i)–(k) from March 12, 2025)', 'url': 'https://www.federalregister.gov/documents/2025/02/18/2025-02832/adjusting-imports-of-aluminum-into-the-united-states', 'published': '2025-02-18'},
  'bis-incl-0818': {'citation': '90 FR 40326 (Commerce/BIS: Section 232 steel and aluminum derivative inclusions, from August 18, 2025)', 'url': 'https://www.federalregister.gov/documents/2025/08/19/2025-15819/adoption-and-procedures-of-the-section-232-steel-and-aluminum-tariff-inclusions-process', 'published': '2025-08-19'},
  'ustr-301-ni': {'citation': '90 FR 57807 (USTR notice of action: Nicaragua Section 301 — 0% in 2026, 10% in 2027, 15% from 2028 on goods not originating under CAFTA-DR)', 'url': 'https://www.federalregister.gov/documents/2025/12/12/2025-22690/notice-of-action-nicaraguas-acts-policies-and-practices-related-to-labor-rights-human-rights-and', 'published': '2025-12-12'},
  'ustr-301-ni-impl': {'citation': '90 FR 60850 (USTR notice of implementation: Nicaragua Section 301, heading 9903.89.01 and U.S. note 29)', 'url': 'https://www.federalregister.gov/documents/2025/12/29/2025-23892/notice-of-implementation-of-action-nicaraguas-acts-policies-and-practices-related-to-labor-rights', 'published': '2025-12-29'},
  'ustr-cn-301-continue': {'citation': '91 FR 64212 (USTR: China Section 301 actions continue during the four-year review)', 'url': 'https://www.federalregister.gov/documents/2026/10/07/2026-20510/continuation-of-actions-chinas-acts-policies-and-practices-related-to-technology-transfer', 'published': '2026-10-07'},
  'procl-11020': {'citation': '91 FR 18183 (Proclamation 11020: Adjusting Imports of Pharmaceuticals and Pharmaceutical Ingredients)', 'url': 'https://www.federalregister.gov/documents/2026/04/09/2026-06956/adjusting-imports-of-pharmaceuticals-and-pharmaceutical-ingredients-into-the-united-states', 'published': '2026-04-09'},
  'csms-69395344': {'citation': 'CBP CSMS # 69395344 (Section 232 duties on patented pharmaceuticals: guidance)', 'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/422e390', 'published': '2026-07-30'},
  'csms-70054007': {'citation': 'CBP CSMS # 70054007 (Section 232 pharmaceuticals: updated guidance)', 'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/42cf077', 'published': '2026-09-28'},
  'bis-uk': {'citation': '91 FR 49406 (Commerce/BIS: UK patented pharmaceuticals reduced to 0%)', 'url': 'https://www.federalregister.gov/documents/2026/08/04/2026-15799/notice-of-reduction-of-tariffs-on-patented-pharmaceuticals-and-pharmaceutical-ingredients-for', 'published': '2026-08-04'},
  'csms-69415934': {'citation': 'CBP CSMS # 69415934 (UK patented pharmaceuticals: reduction to 0%)', 'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/42333fe', 'published': '2026-08-01'},
  'bis-specialty': {'citation': '91 FR 60360 (Commerce/BIS: specialty pharmaceuticals, eligible jurisdictions and technical corrections)', 'url': 'https://www.federalregister.gov/documents/2026/09/23/2026-19498/guidance-and-procedures-for-implementing-tariff-adjustments-for-specialty-pharmaceuticals-and', 'published': '2026-09-23'},
}
def S(*ids): return [SRC[i] for i in ids]
GN29 = {'citation': 'HTSUS 2026 Revision 21, General Note 29 (Dominican Republic-Central America-United States Free Trade Agreement; SPI "P" / "P+")', 'url': 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes', 'published': '2026-10-07'}

EU = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE']

# 2026 Section 301 (U.S. note 52) duty headings: code, key suffix, name, countries, rate, kind
S301 = [
 ('20','dz','Algeria',['DZ'],12.5),('21','ao','Angola',['AO'],12.5),('22','ar','Argentina',['AR'],10),('23','au','Australia',['AU'],12.5),
 ('24','bs','the Bahamas',['BS'],12.5),('25','bh','Bahrain',['BH'],12.5),('26','bd','Bangladesh',['BD'],10),('27','br','Brazil',['BR'],12.5),
 ('28','kh','Cambodia',['KH'],10),('29','ca','Canada',['CA'],10),('30','cl','Chile',['CL'],12.5),('31','cn','China',['CN'],12.5),
 ('32','co','Colombia',['CO'],12.5),('33','cr','Costa Rica',['CR'],12.5),('34','do','the Dominican Republic',['DO'],12.5),('35','ec','Ecuador',['EC'],10),
 ('36','eg','Egypt',['EG'],12.5),('37','sv','El Salvador',['SV'],10),('39','eu','the European Union',EU,10),('40','gt','Guatemala',['GT'],10),
 ('41','gy','Guyana',['GY'],12.5),('42','hn','Honduras',['HN'],10),('43','hk','Hong Kong',['HK'],12.5),('44','in','India',['IN'],10),
 ('45','id','Indonesia',['ID'],10),('46','iq','Iraq',['IQ'],12.5),('47','il','Israel',['IL'],12.5),('49','jp','Japan',['JP'],12.5),
 ('50','jo','Jordan',['JO'],10),('51','kz','Kazakhstan',['KZ'],12.5),('52','kw','Kuwait',['KW'],12.5),('53','ly','Libya',['LY'],12.5),
 ('54','my','Malaysia',['MY'],10),('55','mx','Mexico',['MX'],10),('56','ma','Morocco',['MA'],12.5),('57','nz','New Zealand',['NZ'],12.5),
 ('58','ni','Nicaragua',['NI'],12.5),('59','ng','Nigeria',['NG'],12.5),('60','no','Norway',['NO'],12.5),('61','om','Oman',['OM'],12.5),
 ('62','pk','Pakistan',['PK'],10),('63','pe','Peru',['PE'],12.5),('64','ph','the Philippines',['PH'],12.5),('65','qa','Qatar',['QA'],12.5),
 ('66','ru','Russia',['RU'],12.5),('67','sa','Saudi Arabia',['SA'],12.5),('68','sg','Singapore',['SG'],12.5),('69','za','South Africa',['ZA'],12.5),
 ('71','kr','South Korea',['KR'],12.5),('72','lk','Sri Lanka',['LK'],10),('74','ch','Switzerland',['CH'],12.5),('76','tw','Taiwan',['TW'],10),
 ('77','th','Thailand',['TH'],12.5),('78','tt','Trinidad and Tobago',['TT'],10),('79','tr','Türkiye',['TR'],12.5),('80','ae','the United Arab Emirates',['AE'],12.5),
 ('81','gb','the United Kingdom',['GB'],10),('82','uy','Uruguay',['UY'],12.5),('83','ve','Venezuela',['VE'],12.5),('84','vn','Vietnam',['VN'],12.5),
]
assert len(S301) == 60
FLOOR_PAIR = {'39': '38', '49': '48', '71': '70', '74': '73', '76': '75'}
ALL_S301_CODES = [f'9903.05.{n:02d}' for n in range(20, 85)]

def rec(**kw):
    base = dict(measureKey=None, program=None, ch99Code=None, rateKind=None, ratePct=None, countriesInclude=[], countriesExclude=[],
                coverageInclude=[], coverageExclude=[], conditions={}, replacesCodes=[], effectiveFrom=None, effectiveTo=None,
                sources=[], htsEdition=ED)
    base.update(kw)
    return base

measures = []
P301 = 'Section 301 (2026, 60 economies)'
for n, k, name, countries, rate, in [(a,b,c,d,e) for a,b,c,d,e in S301]:
    code = f'9903.05.{n}'
    r = rec(measureKey=f's301-2026-{k}', program=P301, ch99Code=code, countriesInclude=countries,
            effectiveFrom='2026-07-24', sources=S('ustr-301-fl', 'pm-301-fl') + [hts_note(52)])
    if n in FLOOR_PAIR:
        r.update(rateKind='floor', ratePct=rate,
                 notes=f'Products of {name}: U.S. note 52(k) makes the total {rate:g}% when the column 1 rate (or its ad valorem equivalent) is under {rate:g}% '
                       f'({code}); at or above {rate:g}% no additional duty is due (9903.05.{FLOOR_PAIR[n]}). Modeled as a floor: max(base, {rate:g}%).'
                       + (' For South Korea, a claimed KORUS (KR) special rate is the column 1 rate compared.' if k == 'kr' else ''))
    else:
        r.update(rateKind='additive', ratePct=rate, notes=f'Products of {name}: base rate + {rate:g}%. U.S. note 52(a): applies also when an FTA/GSP special rate is claimed.')
    if k in ('ca', 'mx'):
        r['conditions'] = {'usmcaQualifying': False}
        r['notes'] += f" Not for goods of {name} entered free under USMCA (U.S. note 52({'g' if k == 'ca' else 'h'}), {'9903.05.93' if k == 'ca' else '9903.05.94'})."
    measures.append(r)

# USMCA relief
for k, name, code, dutycode, sub in [('ca', 'Canada', '9903.05.93', '9903.05.29', 'g'), ('mx', 'Mexico', '9903.05.94', '9903.05.55', 'h')]:
    measures.append(rec(measureKey=f's301-2026-usmca-{k}', program=P301, ch99Code=code, rateKind='relief', countriesInclude=[k.upper()],
        conditions={'usmcaQualifying': True}, replacesCodes=[dutycode], effectiveFrom='2026-07-24',
        sources=S('ustr-301-fl') + [hts_note(52)],
        notes=f'U.S. note 52({sub}): products of {name} entered free of duty under USMCA (SPI S/S+), including lines whose general rate is already Free, pay no Section 301 duty.'))

# General exemptions
measures.append(rec(measureKey='s301-2026-exempt-52b', program=P301, ch99Code='9903.05.86', rateKind='relief',
    coverageInclude=cov['52(b)'], replacesCodes=ALL_S301_CODES, effectiveFrom='2026-07-24', sources=S('ustr-301-fl') + [hts_note(52)],
    notes=f"U.S. note 52(b): the {len(cov['52(b)'])} subheadings listed are exempt from 9903.05.20–9903.05.84 for every country (in Chapter 30: 45 subheadings in 3001–3004 and 3006). No Chapter 01 line is listed."))
ch30e = [c for c in cov['52(e)'] if c.startswith('30')]
other52e = [c for c in cov['52(e)'] if not c.startswith('30')]
PHARMA_USE_CH30 = ("Chapter 30 is \"Pharmaceutical products\": its headings 3003/3004 are medicaments for therapeutic or prophylactic uses and heading 3006 "
    "covers the pharmaceutical goods of chapter note 4, so the classification itself establishes the pharmaceutical application and no confirmation is asked "
    "(as in the Chapter 30 content file). Review point: 3006.92 (waste pharmaceuticals) is presumed the same way.")
measures.append(rec(measureKey='s301-2026-exempt-52e-pharma-use-ch30', program=P301, ch99Code='9903.05.89', rateKind='relief',
    coverageInclude=ch30e, replacesCodes=ALL_S301_CODES, effectiveFrom='2026-07-24', sources=S('ustr-301-fl') + [hts_note(52)],
    notes=f"U.S. note 52(e): articles for use in pharmaceutical applications. The {len(ch30e)} Chapter 30 subheadings of the {len(cov['52(e)'])}-line list "
          f"({', '.join(ch30e)}) are exempt without a confirmation. {PHARMA_USE_CH30} The other {len(other52e)} lines are in s301-2026-exempt-52e-pharma-use."))
measures.append(rec(measureKey='s301-2026-exempt-52e-pharma-use', program=P301, ch99Code='9903.05.89', rateKind='relief',
    coverageInclude=other52e, conditions={'endUse': 'pharmaceutical'}, replacesCodes=ALL_S301_CODES, effectiveFrom='2026-07-24',
    sources=S('ustr-301-fl') + [hts_note(52)], reviewedAt='2026-10-09',
    notes=f"U.S. note 52(e): the {len(other52e)} non-Chapter-30 subheadings of the {len(cov['52(e)'])}-line list (Chapters 28, 29, 32, 34, 35, 38, 39) are exempt from "
          "9903.05.20–9903.05.84 for every country only when the goods are for use in pharmaceutical applications (heading 9903.05.89), including lines entered "
          "under a \"Free (K)\" special rate. These chemicals have many non-pharmaceutical uses, so the exemption applies only when the importer confirms the end use "
          "(conditions.endUse = pharmaceutical); CBP may ask the importer to support the claim."))

# Country exceptions 52(j)
EXC = [
 ('52(j)(1)', '9903.05.96', 'gb', ['GB'], ['9903.05.81'], 'the United Kingdom'),
 ('52(j)(2)', '9903.05.97', 'eu', EU, ['9903.05.38', '9903.05.39'], 'the European Union'),
 ('52(j)(3)', '9903.05.98', 'ch', ['CH'], ['9903.05.73', '9903.05.74'], 'Switzerland'),
 ('52(j)(4)(i)', '9903.05.99', 'my', ['MY'], ['9903.05.54'], 'Malaysia'),
 ('52(j)(5)(i)', '9903.06.02', 'kh', ['KH'], ['9903.05.28'], 'Cambodia'),
 ('52(j)(6)(i)', '9903.06.04', 'gt', ['GT'], ['9903.05.40'], 'Guatemala'),
 ('52(j)(7)(i)', '9903.06.07', 'sv', ['SV'], ['9903.05.37'], 'El Salvador'),
 ('52(j)(8)(i)', '9903.06.10', 'ar', ['AR'], ['9903.05.22'], 'Argentina'),
 ('52(j)(9)(i)', '9903.06.12', 'bd', ['BD'], ['9903.05.26'], 'Bangladesh'),
 ('52(j)(10)(i)', '9903.06.14', 'tw', ['TW'], ['9903.05.75', '9903.05.76'], 'Taiwan'),
 ('52(j)(11)(i)', '9903.06.16', 'id', ['ID'], ['9903.05.45'], 'Indonesia'),
 ('52(j)(12)(i)', '9903.06.18', 'ec', ['EC'], ['9903.05.35'], 'Ecuador'),
 ('52(j)(13)(i)', '9903.06.20', 'jo', ['JO'], ['9903.05.50'], 'Jordan'),
]
for sub, code, k, countries, repl, name in EXC:
    codes = cov[sub]
    ch01 = [c for c in codes if c.startswith('01')]
    measures.append(rec(measureKey=f's301-2026-except-{k}', program=P301, ch99Code=code, rateKind='relief', countriesInclude=countries,
        coverageInclude=codes, replacesCodes=repl, effectiveFrom='2026-07-24', sources=S('ustr-301-fl') + [hts_note(52)],
        notes=f'U.S. note {sub}: products of {name} classifiable in the {len(codes)} listed provisions pay no Section 301 duty under {", ".join(repl)}.'
              + (f' Chapter 01 lines: {", ".join(ch01)}.' if ch01 else ' No Chapter 01 or 30 line is listed.')))

# CAFTA-DR textiles and apparel (U.S. note 52(j)(6)(iii), 52(j)(7)(iii)). The SPI codes are "P" and "P+" (HTSUS general note 29(a)(i)(A)).
CAFTA_SPI = ['P', 'P+']
for sub, code, k, countries, repl, name in [('52(j)(6)(iii)', '9903.06.06', 'gt', ['GT'], ['9903.05.40'], 'Guatemala'),
                                             ('52(j)(7)(iii)', '9903.06.09', 'sv', ['SV'], ['9903.05.37'], 'El Salvador')]:
    codes = cov[sub]
    measures.append(rec(measureKey=f's301-2026-except-{k}-cafta-dr', program=P301, ch99Code=code, rateKind='relief', countriesInclude=countries,
        coverageInclude=codes, conditions={'spiClaimed': CAFTA_SPI}, replacesCodes=repl, effectiveFrom='2026-07-24',
        sources=S('ustr-301-fl') + [hts_note(52), GN29], reviewedAt='2026-10-09',
        notes=f'U.S. note {sub}: articles the product of {name} for which entry is claimed under the Dominican Republic-Central America-United States Free Trade '
              f'Agreement (CAFTA-DR) consistent with general note 29, classifiable in the {len(codes)} listed provisions (textiles and apparel of Chapters 50–63, '
              f'plus listed lines of Chapters 42, 65, 70 and 94), pay no Section 301 duty under {", ".join(repl)}. Applies only when the CAFTA-DR special rate is '
              'claimed (SPI "P" or "P+", general note 29(a)(i)); without the claim the duty is charged. '
              'Note 52(i) (heading 9903.05.95: CAFTA-DR textile or apparel goods of Costa Rica, the Dominican Republic, El Salvador, Guatemala, Honduras and Nicaragua) '
              'is not modeled: it has no code list and defines its goods by the Annex to the WTO Agreement on Textiles and Clothing (general note 29(d)(v)), '
              'which the HTS does not reproduce.'))

# Brazil Section 301 (U.S. note 50)
PBR = 'Section 301 (Brazil)'
measures.append(rec(measureKey='s301-brazil', program=PBR, ch99Code='9903.05.01', rateKind='additive', ratePct=25, countriesInclude=['BR'],
    effectiveFrom='2026-07-22', sources=S('ustr-301-br') + [hts_note(50)],
    notes='U.S. note 50(a)(i): products of Brazil pay base rate + 25%, also when an FTA/GSP special rate is claimed. Stacks with the 12.5% 2026 Section 301 duty (9903.05.27).'))
measures.append(rec(measureKey='s301-brazil-exempt-50a-ii', program=PBR, ch99Code='9903.05.03', rateKind='relief', countriesInclude=['BR'],
    coverageInclude=cov['50(a)(ii)'], replacesCodes=['9903.05.01'], effectiveFrom='2026-07-22', sources=S('ustr-301-br') + [hts_note(50)],
    notes=f"U.S. note 50(a)(ii): the {len(cov['50(a)(ii)'])} listed subheadings are exempt from 9903.05.01 (in Chapter 30, the same 45 subheadings as note 52(b)). No Chapter 01 line is listed."))
ch30v = [c for c in cov['50(a)(v)'] if c.startswith('30')]
other50v = [c for c in cov['50(a)(v)'] if not c.startswith('30')]
measures.append(rec(measureKey='s301-brazil-exempt-50a-v-pharma-use-ch30', program=PBR, ch99Code='9903.05.06', rateKind='relief', countriesInclude=['BR'],
    coverageInclude=ch30v, replacesCodes=['9903.05.01'], effectiveFrom='2026-07-22', sources=S('ustr-301-br') + [hts_note(50)],
    notes=f"U.S. note 50(a)(v): Brazilian articles for use in pharmaceutical applications. The {len(ch30v)} Chapter 30 subheadings of the {len(cov['50(a)(v)'])}-line list "
          f"are exempt without a confirmation. {PHARMA_USE_CH30} The other {len(other50v)} lines are in s301-brazil-exempt-50a-v-pharma-use."))
measures.append(rec(measureKey='s301-brazil-exempt-50a-v-pharma-use', program=PBR, ch99Code='9903.05.06', rateKind='relief', countriesInclude=['BR'],
    coverageInclude=other50v, conditions={'endUse': 'pharmaceutical'}, replacesCodes=['9903.05.01'], effectiveFrom='2026-07-22',
    sources=S('ustr-301-br') + [hts_note(50)], reviewedAt='2026-10-09',
    notes=f"U.S. note 50(a)(v): the {len(other50v)} non-Chapter-30 subheadings of the {len(cov['50(a)(v)'])}-line list are exempt from the 25% Brazil duty (9903.05.01) "
          "only when the goods are for use in pharmaceutical applications (heading 9903.05.06), including lines entered under a \"Free (K)\" special rate. "
          "Applies only when the importer confirms the end use (conditions.endUse = pharmaceutical). The 12.5% 2026 Section 301 duty on Brazil (9903.05.27) is "
          "removed separately by s301-2026-exempt-52e-pharma-use for the lines also on the note 52(e) list."))

# China Section 301 (issue #1795): the 2018–2019 lists (U.S. note 20), the 2024 four-year-review increases (note 31,
# 9903.91.xx), ship-to-shore cranes (9903.92.10) and the maritime action (9903.91.12 / .14), for every chapter.
#
# Stacking with the 2026 Section 301 duty on China (9903.05.31, note 52): note 52(a) says goods paying 9903.05.20–9903.05.84
# "shall also be subject to any additional duty provided for in this subchapter" (subchapter III, which holds notes 20 and
# 31), except as provided in 52(b)–(k). So the China list / note 31 duties and the 12.5% are ADDITIVE; the 52(b)/(c)/(e)
# exemptions (9903.05.86/.87/.89) lift only 9903.05.31, and the note 20 exclusions (9903.88.69/.70) lift only the
# 9903.88.xx list duty. The one 52(b)–(k) carve-out that touches China lines here is 52(f): goods subject to the Section
# 232 headings it names (metals, autos and parts, trucks, wood, semiconductors, patented pharmaceuticals) do not pay
# 9903.05.31 (heading 9903.05.90). Only the passenger-vehicle part is modelled below, for China (see s301-2026-exempt-52f-cn-*).
PCN = 'Section 301 (China, 2018-2019 lists)'
PCN24 = 'Section 301 (China, 2024 four-year review)'
PCNM = 'Section 301 (China, maritime and cargo-handling equipment)'
CN_CONT = S('ustr-cn-301-continue')
CN_STACK = ('Stacks with the 12.5% 2026 Section 301 duty on China (9903.05.31): note 52(a) keeps "any additional duty provided for in this '
            'subchapter" on top of 9903.05.20–9903.05.84. Also charged when an FTA/GSP special rate is claimed (note 20(a)).')
NOT_MODELLED_20 = ('Not modelled: 9903.88.09 (10% for List 3 goods exported before May 10, 2019, entered before June 15, 2019 — ended), '
                   '9903.88.16 (List 4B, 15%, suspended — note 20(t)), and notes 20(z)–20(gg) (9903.88.21–9903.88.28: no list duty on '
                   'certain subheadings whose rate is derived from another listed subheading; depends on how the rate was derived).')


def split_described(sub):
    """Note 20(g) / 20(s)(ii) list '8-digit subheading, except statistical numbers …': 8-digit → include, 10-digit → exclude."""
    inc = [c for c in cov[sub] if len(c) == 8]
    exc = [c for c in cov[sub] if len(c) == 10]
    assert inc and all(any(e.startswith(i) for i in inc) for e in exc), f'{sub}: an excepted statistical number is outside its subheadings'
    return inc, exc


l1, l2, l3 = cov['20(b)'], cov['20(d)'], cov['20(f)']
l3g, l3g_exc = split_described('20(g)')
l4a_ii, l4a_exc = split_described('20(s)(ii)')
l4a = sorted(cov['20(s)(i)'] + l4a_ii)
assert not set(l4a_exc) & {c for c in cov['20(s)(i)']}, 'a 20(s)(ii) exception is also a 20(s)(i) subheading'
for a_name, a in [('20(b)', l1), ('20(d)', l2), ('20(f)', l3), ('20(g)', l3g), ('20(s)', l4a)]:
    for b_name, b in [('20(b)', l1), ('20(d)', l2), ('20(f)', l3), ('20(g)', l3g), ('20(s)', l4a)]:
        if a_name < b_name:
            shared = set(a) & set(b)
            if {a_name, b_name} == {'20(g)', '20(s)'}:
                # 8517.62.00, 9401.69.60, 9401.71.00 are split by statistical number between List 3 (20(g)) and List 4A (20(s)(ii)):
                # each list carves out the other's numbers (checked against the Revision 21 statistical lines when reviewing).
                assert all(any(e.startswith(c) for e in l3g_exc) and any(e.startswith(c) for e in l4a_exc) for c in shared), shared
                continue
            assert not shared, f'{a_name} and {b_name} overlap: {sorted(shared)[:5]}'
ch0130 = lambda codes: [c for c in codes if c[:2] in ('01', '30')]
assert ch0130(l1) == [] and ch0130(l2) == [] and ch0130(l3g) == [] and ch0130(l4a_ii) == []
measures.append(rec(measureKey='s301-china-list1', program=PCN, ch99Code='9903.88.01', rateKind='additive', ratePct=25, countriesInclude=['CN'],
    coverageInclude=l1, effectiveFrom='2018-07-06', sources=S('ustr-301-cn-1') + CN_CONT + [hts_note(20)], reviewedAt='2026-10-10',
    notes=f"List 1, U.S. note 20(a)–(b): products of China in the {len(l1)} subheadings of note 20(b) pay base rate + 25% (since July 6, 2018). "
          "Product exclusions in effect: note 20(vvv)(i) (9903.88.69), see s301-china-excl-20vvvi-*. " + CN_STACK))
measures.append(rec(measureKey='s301-china-list2', program=PCN, ch99Code='9903.88.02', rateKind='additive', ratePct=25, countriesInclude=['CN'],
    coverageInclude=l2, effectiveFrom='2018-08-23', sources=S('ustr-301-cn-2') + CN_CONT + [hts_note(20)], reviewedAt='2026-10-10',
    notes=f"List 2, U.S. note 20(c)–(d): products of China in the {len(l2)} subheadings of note 20(d) pay base rate + 25% (since August 23, 2018). "
          "Product exclusions in effect: notes 20(vvv)(ii) (9903.88.69) and 20(www) (9903.88.70, solar manufacturing equipment of heading 8486). " + CN_STACK))
measures.append(rec(measureKey='s301-china-list3', program=PCN, ch99Code='9903.88.03', rateKind='additive', ratePct=25, countriesInclude=['CN'],
    coverageInclude=l3, effectiveFrom='2019-05-10', sources=S('ustr-301-cn-3', 'ustr-301-cn-3-increase') + CN_CONT + [hts_note(20)], reviewedAt='2026-10-10',
    notes=f"List 3, U.S. note 20(e)–(f): products of China in the {len(l3)} subheadings of note 20(f) pay base rate + 25% (10% from September 24, 2018, "
          f"25% since May 10, 2019). Chapter 01/30 lines: {', '.join(ch0130(l3))}. Product exclusions in effect: note 20(vvv)(iii) (9903.88.69). "
          + CN_STACK + ' ' + NOT_MODELLED_20))
measures.append(rec(measureKey='s301-china-list3-described', program=PCN, ch99Code='9903.88.04', rateKind='additive', ratePct=25, countriesInclude=['CN'],
    coverageInclude=l3g, coverageExclude=l3g_exc, effectiveFrom='2019-05-10', sources=S('ustr-301-cn-3', 'ustr-301-cn-3-increase') + CN_CONT + [hts_note(20)],
    reviewedAt='2026-10-10',
    notes=f"List 3 (described products), U.S. note 20(g): the {len(l3g)} subheadings it names (2931.90.90, 8517.62.00, seats of 9401, furniture of 9403.70) "
          f"pay base rate + 25%, except the statistical numbers it carves out ({', '.join(l3g_exc)}). Product exclusions in effect: note 20(vvv)(iii). " + CN_STACK))
measures.append(rec(measureKey='s301-china-list4a', program=PCN, ch99Code='9903.88.15', rateKind='additive', ratePct=7.5, countriesInclude=['CN'],
    coverageInclude=l4a, coverageExclude=l4a_exc, effectiveFrom='2020-02-14',
    sources=S('ustr-301-cn-4a', 'ustr-301-cn-4a-cut') + CN_CONT + [hts_note(20)], reviewedAt='2026-10-10',
    notes=f"List 4A, U.S. note 20(r)–(s): products of China in the {len(cov['20(s)(i)'])} subheadings of note 20(s)(i) and the {len(l4a_ii)} subheadings "
          f"described in note 20(s)(ii) (except the statistical numbers it carves out: {', '.join(l4a_exc)}) pay base rate + 7.5% (15% from "
          f"September 1, 2019, cut to 7.5% from February 14, 2020). Chapter 01/30 lines: all {sum(1 for c in l4a if c.startswith('01'))} Chapter 01 "
          "subheadings and 3006.93.20, 3006.93.50. Product exclusions in effect: note 20(vvv)(iv) (9903.88.69); the Chapter 01 exclusions in notes "
          "20(ddd) and 20(jjj) (research macaques) have expired. " + CN_STACK))

# Product exclusions in effect (note 20(vvv) via 9903.88.69, note 20(www) via 9903.88.70), through November 9, 2026.
from measures_named_products import china_exclusion_measures, load_descriptions  # noqa: E402
CN_EXCL_SRC = {
    '9903.88.69': S('ustr-301-cn-excl-2024', 'ustr-301-cn-excl-ext', 'ustr-301-cn-excl-conform-1', 'ustr-301-cn-excl-conform-2'),
    '9903.88.70': S('ustr-301-cn-2024', 'ustr-301-cn-excl-ext'),
}
measures += china_exclusion_measures(cov, load_descriptions(ROOT), rec=rec, sources=CN_EXCL_SRC, hts_note=hts_note, program=PCN)

# 2024 four-year-review increases (U.S. note 31). Rates and dates from the headings and note 31's subdivisions.
N31 = [
    # key, heading, subdivision(s), rate, from, to, what
    ('31b', '9903.91.01', ['31(b)'], 25, '2024-09-27', None, 'critical minerals, steel and aluminum products'),
    ('31c', '9903.91.02', ['31(c)'], 50, '2024-09-27', None, 'solar cells and modules (8541.42, 8541.43)'),
    ('31d', '9903.91.03', ['31(d)'], 100, '2024-09-27', None, 'electric and plug-in hybrid vehicles of 8702/8703, syringes and needles (9018.31, 9018.32)'),
    ('31e', '9903.91.04', ['31(e)'], 25, '2025-01-01', '2025-12-31', 'disposable textile facemasks (6307.90.9870), 2025 only'),
    ('31f', '9903.91.05', ['31(f)(i)'], 50, '2025-01-01', None, 'semiconductors (8541, 8542), polysilicon (2804.61) and wafers (3818)'),
    ('31g', '9903.91.06', ['31(g)'], 25, '2026-01-01', None, 'natural graphite (2504), permanent magnets (8505.11) and lithium-ion batteries (8507.60)'),
    ('31h', '9903.91.07', ['31(h)'], 50, '2026-01-01', None, 'respirators and face masks of textiles (6307.90.9842/9844/9850/9870/9875)'),
    ('31i', '9903.91.08', ['31(i)'], 100, '2026-01-01', None, 'medical gloves of rubber (4015.12.10)'),
    ('31j', '9903.91.11', ['31(j)'], 25, '2025-01-01', None, 'tungsten products (8101.94, 8101.99.10, 8101.99.80)'),
]
ch99 = {h['code']: h for h in json.load(open(ROOT + 'ch99-headings.json'))['headings']}
for key, code, subs, rate, start, end, what in N31:
    h = ch99[code]
    assert h['rateKind'] == 'additive' and h['ratePct'] == rate and h['countries'] == ['CN'], f'{code}: heading rate/country changed — re-review note 31'
    codes = sorted({c for s in subs for k, v in cov.items() if k == s or k.startswith(s + '(') for c in v})
    assert codes and not ch0130(codes), f'{code}: empty coverage or a Chapter 01/30 line'
    measures.append(rec(measureKey=f's301-china-2024-{key}', program=PCN24, ch99Code=code, rateKind='additive', ratePct=rate, countriesInclude=['CN'],
        coverageInclude=codes, effectiveFrom=start, effectiveTo=end,
        sources=S('ustr-301-cn-2024') + (S('ustr-301-cn-2024-dec') if key in ('31f', '31j') else []) + (S('ustr-301-cn-semis') if key == '31f' else [])
                + CN_CONT + [hts_note(31)], reviewedAt='2026-10-10',
        notes=f"U.S. note 31({key[2:]}) / heading {code}: products of China ({what}), {len(codes)} provisions, pay base rate + {rate:g}% from {start}"
              + (f' through {end}' if end else '') + '. '
              + ('The rate rises on June 23, 2027 by an amount USTR has not yet announced (note 31(f)(ii), 90 FR 60848) — re-check then. ' if key == '31f' else '')
              + ('Enteral syringes of 9018.31.0080 were excepted (9903.91.10) only until December 31, 2025 — not modelled. ' if key == '31d' else '')
              + 'The products moved here are no longer on the note 20 lists (e.g. 8703.60–8703.90, 8507.60), so there is no double charge. '
              + 'Note 31(a): also charged when an FTA/GSP special rate is claimed. ' + CN_STACK.split(': ')[0] + ' (note 52(a)).'))

# Described products of note 31: the duty applies only to the described goods, so it is conditioned on the importer
# confirming the description (other goods of the same lines: 9903.92.80 / 9903.91.13, no duty).
desc31 = [d for d in load_descriptions(ROOT)['descriptions'] if d['note'].startswith('31(')]
sts = [d['id'] for d in desc31 if d['note'] == '31(l)(i)']
chassis = [d for d in desc31 if d['note'] == '31(k)(i)']
assert len(sts) == 1 and len(chassis) == 3, 'note 31(k)(i)/(l)(i) descriptions missing — re-run extract-ch99-note-coverage.ts'
for code, rate in [('9903.92.10', 25), ('9903.91.14', 100), ('9903.91.12', None)]:
    assert ch99[code]['ratePct'] == rate, f'{code}: heading rate changed — re-review'
measures.append(rec(measureKey='s301-china-sts-cranes', program=PCN24, ch99Code='9903.92.10', rateKind='additive', ratePct=25, countriesInclude=['CN'],
    coverageInclude=['84261900'], conditions={'productDescriptionIds': sts}, effectiveFrom='2024-09-27',
    sources=S('ustr-301-cn-2024') + CN_CONT + [hts_note(31)], reviewedAt='2026-10-10',
    notes='Subheading 9903.92.10 (note 31(a)): ship-to-shore gantry cranes of China (configured as a high- or low-profile steel superstructure, designed to '
          'unload intermodal containers from vessels, with spreaders or twist-locks), classified in 8426.19.00, pay base rate + 25% from September 27, 2024. '
          'Other cranes of 8426.19.00 enter under 9903.92.80 with no additional duty, so the duty applies only when the importer confirms the product is such a crane '
          '(description from note 31(l)(i), the same wording). Not modelled: 9903.91.09 (cranes under a contract dated before May 14, 2024, entered before '
          'May 14, 2026 — ended). ' + CN_STACK.split(': ')[0] + ' (note 52(a)).'))
measures.append(rec(measureKey='s301-china-maritime-sts-cranes', program=PCNM, ch99Code='9903.91.14', rateKind='additive', ratePct=100, countriesInclude=['CN'],
    coverageInclude=['84261900'], conditions={'productDescriptionIds': sts}, effectiveFrom='2026-11-10',
    sources=S('ustr-301-maritime', 'ustr-301-maritime-suspend') + [hts_note(31)], reviewedAt='2026-10-10',
    notes='Heading 9903.91.14, note 31(l): ship-to-shore gantry cranes of 8426.19.00 pay base rate + 100% from November 10, 2026 (the action of 90 FR 48320 '
          'was suspended from November 10, 2025 through November 9, 2026 by 90 FR 50947), on top of the 25% of 9903.92.10 (note 31(l)(i)). Applies only when the '
          'importer confirms the product is such a crane. Modelled for products of China only: cranes of other countries with Chinese boom, trolley, spreader, '
          'cabin, legs, cable reel, power supply, bogies or control IT (31(l)(ii)) or made by a Chinese-owned or -controlled company (31(l)(iii), (v)) are also '
          'covered, and the attestations of 9903.91.15 (no Chinese link) and 9903.91.16 (contract dated before April 17, 2025, entered before April 18, 2027) '
          'are not modelled.'))
measures.append(rec(measureKey='s301-china-maritime-chassis', program=PCNM, ch99Code='9903.91.12', rateKind='additive', ratePct=100, countriesInclude=['CN'],
    coverageInclude=[d['codePrefix'] for d in chassis], conditions={'productDescriptionIds': [d['id'] for d in chassis]}, effectiveFrom='2026-11-10',
    sources=S('ustr-301-maritime', 'ustr-301-maritime-suspend') + [hts_note(31)], reviewedAt='2026-10-10',
    notes='Heading 9903.91.12, note 31(k)(i): intermodal chassis, subassemblies and parts of China (8716.39.0090, 8716.90.30, 8716.90.50) pay base rate + 100% '
          'from November 10, 2026 (90 FR 48320; suspended through November 9, 2026 by 90 FR 50947). The heading reads "The duty provided in subheadings 8716.39.00, '
          '8716.90.30 or 8716.90.50 + 100%". Other goods of those lines enter under 9903.91.13 with no additional duty, so the duty applies only when the importer '
          'confirms the product is intermodal chassis (or a subassembly or part). These lines are also on List 3 (25%, 9903.88.03), which stays.'))

# Note 52(f)(2): passenger vehicles and light trucks subject to Section 232 (heading 9903.94.01, note 33(b)) do not pay the
# 2026 Section 301 duty (heading 9903.05.90). China only: Section 232 autos is not in this overlay (issue #1796), and for the
# other 59 economies the relief without the 25% Section 232 duty would understate the total even more than today.
c33b = cov['33(b)']
assert c33b and all(c[:4] in ('8703', '8704') for c in c33b)
measures.append(rec(measureKey='s301-2026-exempt-52f-cn-passenger-vehicles', program=P301, ch99Code='9903.05.90', rateKind='relief', countriesInclude=['CN'],
    coverageInclude=c33b, replacesCodes=['9903.05.31'], effectiveFrom='2026-07-24', sources=S('ustr-301-fl') + [hts_note(52), hts_note(33)],
    reviewedAt='2026-10-10',
    notes=f"U.S. note 52(f)(2) (heading 9903.05.90): passenger vehicles (sedans, SUVs, crossovers, minivans, cargo vans) and light trucks under the Section 232 "
          f"automobile headings (9903.94.01 etc., the {len(c33b)} subheadings of note 33(b)) do not pay 9903.05.20–9903.05.84. Modelled for China (9903.05.31) "
          "only, because the 25% Section 232 automobile duty (9903.94.01) is not in this overlay yet (issue #1796): until it is, China-origin vehicles here show "
          "the China Section 301 duties without the Section 232 duty. Articles of these subheadings that are not passenger vehicles or light trucks "
          "(9903.94.02) would still owe 9903.05.31; the classification is taken as establishing the vehicle type."))

# Section 232 aluminum: Russia (U.S. note 19(m), headings 9903.85.67 / 9903.85.68, 200%). Headings 9903.85.01–9903.85.15,
# 9903.85.21–9903.85.66 and 9903.85.69–9903.85.72 were terminated on April 6, 2026 (note 19 compiler's note); these two remain.
P232AL = 'Section 232 (aluminum, Russia)'
RU_ORIGIN = ('Modelled for products of Russia (countriesInclude RU). Not modelled: the same 200% applies to articles of any origin when any primary '
             'aluminum used in them was smelted in Russia or the articles were cast in Russia (note 19(m)) — the calculator has no question for that yet. '
             'Collected on the full value, in addition to any special rate, and stacks with the 12.5% 2026 Section 301 duty on Russia (9903.05.66): '
             'note 52(f)(1) removes 9903.05.20–9903.05.84 only for the 9903.82 metals headings, not 9903.85.67/.68. Russia is a column 2 country, '
             'so the base is the column 2 rate.')
# Provisions Commerce added to note 19(k) from August 18, 2025 (90 FR 40326, Annex I.f; 9401.99.9081 there was replaced by
# 9401.99.9030 / 9401.99.9070 in the same notice). The rest of 19(k) was on the list before.
AL_INCLUSIONS_0818 = [
    '04029968', '04029970', '04029990', '2106909998', '2710193050', '29034310', '29034510', '29034900', '29035110', '29035990', '3004909244',
    '32081000', '32082000', '32089000', '32091000', '32099000', '32139000', '32141000', '33030010', '33030020', '33030030', '33043000', '33049950',
    '33051000', '33053000', '33059000', '33069000', '33071010', '33071020', '33072000', '33074900', '33079000', '34013010', '34013050', '34023190',
    '34024990', '34025011', '34025051', '34029010', '34029030', '34029050', '34031910', '34031950', '34039900', '34051000', '34052000', '34054000',
    '34059000', '35061050', '35069110', '35069150', '35069900', '3701300000', '38085910', '38085940', '38086110', '38086150', '38086210', '38086250',
    '38086910', '38086950', '38089115', '38089125', '38089130', '38089150', '38089410', '38089450', '38099100', '38101000', '38111900', '38112100',
    '38140010', '38140020', '38140050', '38200000', '3824999397', '7308200035', '8307906000', '8309900020', '8309900025', '8412909070', '8412909075',
    '84148016', '84181000', '8419501000', '84248990', '8443160000', '84501100', '84512100', '84672200', '84672900', '84678100', '84678950',
    '8483405020', '8483905020', '8501640110', '85022000', '8502310000', '8503009546', '8503009570', '85043120', '85043140', '85043160', '85043300',
    '85043400', '85049020', '85049041', '85049065', '85049075', '85049096', '85441900', '85444290', '8544492000', '8544499000', '8544602000',
    '8544606000', '8716390040', '94017900', '9401999030', '9401999070',
]
al_primary = ['7601', '7604', '7605', '7606', '7607', '7608', '7609', '76169951']  # note 19(g)(i)–(vii): headings 7601, 7604–7609 and 7616.99.51
assert '76169951' in cov['19(g)(vii)']
measures.append(rec(measureKey='s232-aluminum-ru', program=P232AL, ch99Code='9903.85.67', rateKind='additive', ratePct=200, countriesInclude=['RU'],
    coverageInclude=al_primary, effectiveFrom='2025-03-12', sources=S('procl-10522', 'procl-10895') + [hts_note(19)], reviewedAt='2026-10-10',
    notes='Heading 9903.85.67, U.S. note 19(m)(A): aluminum articles of note 19(g) (unwrought aluminum 7601, bars/rods/profiles 7604, wire 7605, plates/sheets/strip '
          '7606, foil 7607, tubes/pipes/fittings 7608–7609, castings and forgings 7616.99.51) that are products of Russia: base + 200% (since March 10, 2023, '
          'Proclamation 10522; the note 19(m) wording applies from March 12, 2025). ' + RU_ORIGIN))
k_aug = set(cov['19(k)']) & set(AL_INCLUSIONS_0818)
k_early = [c for c in cov['19(k)'] if c not in k_aug]
ij = sorted(set(cov['19(i)']) | set(cov['19(j)']))
measures.append(rec(measureKey='s232-aluminum-ru-derivatives', program=P232AL, ch99Code='9903.85.68', rateKind='additive', ratePct=200, countriesInclude=['RU'],
    coverageInclude=sorted(set(ij) | set(k_early)), effectiveFrom='2025-03-12', sources=S('procl-10522', 'procl-10895') + [hts_note(19)], reviewedAt='2026-10-10',
    notes=f'Heading 9903.85.68, U.S. note 19(m)(B): derivative aluminum articles of notes 19(i) ({len(cov["19(i)"])} provisions: stranded wire 7614, bumper and body stampings 8708.10.30 / '
          f'8708.29.21), 19(j) ({len(cov["19(j)"])} provisions of chapter 76) and the {len(k_early)} note 19(k) provisions that were on the list before the August 18, 2025 inclusions, '
          'products of Russia: base + 200% from March 12, 2025. ' + RU_ORIGIN))
measures.append(rec(measureKey='s232-aluminum-ru-derivatives-0818', program=P232AL, ch99Code='9903.85.68', rateKind='additive', ratePct=200, countriesInclude=['RU'],
    coverageInclude=sorted(k_aug), effectiveFrom='2025-08-18', sources=S('procl-10522', 'bis-incl-0818') + [hts_note(19)], reviewedAt='2026-10-10',
    notes=f'Heading 9903.85.68, U.S. note 19(m)(B): the {len(k_aug)} note 19(k) provisions Commerce added to the aluminum derivative list from August 18, 2025 (90 FR 40326), '
          'e.g. 3004.90.9244 (lorazepam preparations), aerosol and chemical products, products of Russia: base + 200%. ' + RU_ORIGIN))

# Nicaragua Section 301 (U.S. note 29, heading 9903.89.01): 0% in 2026, 10% in 2027, 15% from January 1, 2028 (note 29(b)).
PNI = 'Section 301 (Nicaragua)'
assert ch99['9903.89.01']['countries'] == ['NI']
NI_TERMS = ('U.S. note 29(a): applies to products of Nicaragua "subject to the rates of duty provided for in column 1-general" and not to originating goods '
            'under CAFTA-DR (general note 29), so it is charged only when no special rate is claimed (conditions.spiNotClaimed ["*", "P", "P+"]: "*" = any '
            'claim; "P"/"P+" are listed so the calculator offers the CAFTA-DR claim on Free lines). USTR: "all imported Nicaraguan goods that are not '
            'originating under CAFTA-DR" (90 FR 57807). Stacks with the 12.5% 2026 Section 301 duty on Nicaragua (9903.05.58, note 52(a)) and, per '
            'note 29(a), with 9903.02.47. The 0% step (January 1 – December 31, 2026) has no record.')
for key, rate, start, end in [('2027', 10, '2027-01-01', '2027-12-31'), ('2028', 15, '2028-01-01', None)]:
    measures.append(rec(measureKey=f's301-nicaragua-{key}', program=PNI, ch99Code='9903.89.01', rateKind='additive', ratePct=rate, countriesInclude=['NI'],
        conditions={'spiNotClaimed': ['*', 'P', 'P+']}, effectiveFrom=start, effectiveTo=end, sources=S('ustr-301-ni', 'ustr-301-ni-impl') + [hts_note(29)],
        reviewedAt='2026-10-10',
        notes=f'Heading 9903.89.01, U.S. note 29(b): products of Nicaragua, base rate + {rate}% for entries from {start}' + (f' through {end}' if end else '') + '. ' + NI_TERMS))

# Section 232 pharmaceuticals (U.S. note 40)
P232 = 'Section 232 (pharmaceuticals)'
c40 = cov['40(c)']
REPL_301 = ALL_S301_CODES + ['9903.05.01']
DEAL = EU + ['JP', 'KR', 'CH', 'LI']
SPECIALTY = sorted(EU + ['AR', 'BD', 'KH', 'EC', 'SV', 'GT', 'IN', 'ID', 'JP', 'JO', 'MY', 'MK', 'KR', 'CH', 'LI', 'TW', 'TH', 'GB', 'VN'])
COV_NOTE = f'Coverage: the {len(c40)} provisions of U.S. note 40(c) (77 in Chapter 30: 3002, 3003, 3004; the rest are Chapter 29 ingredients).'
STACK_NOTE = 'Patented articles under 9903.04.60–9903.04.66 are excluded from the 2026 Section 301 duties (U.S. note 52(f)(8)) and the Brazil duty (note 50(a)(vi)(8)), so those codes are replaced.'
measures.append(rec(measureKey='s232-pharma-patented', program=P232, ch99Code='9903.04.60', rateKind='floor', ratePct=100, countriesExclude=sorted(DEAL + ['GB']),
    coverageInclude=c40, conditions={'productTypes': ['patented', 'specialty']}, replacesCodes=REPL_301, effectiveFrom='2026-09-29',
    sources=S('procl-11020', 'csms-69395344', 'csms-70054007', 'bis-specialty') + [hts_note(40)],
    notes='U.S. note 40(d): when the column 1 rate is below 100%, the total is 100%; when above, no additional duty. Modeled as a floor: max(base, 100%). '
          'In force for all importers from September 29, 2026 (companies in Annex III to Proclamation 11020 from July 31, 2026). '
          'Specialty products from jurisdictions not on the 9903.04.66 list are charged as patented. Note 40(b): collected even when an FTA special rate is claimed. '
          'Company programs (9903.04.64 onshoring, 9903.04.65 MFN pricing, Annex III companies before September 29), U.S.-origin ingredient (9903.04.68) and research use (9903.04.70) are separate measures conditioned on the importer\'s confirmation; '
          'non-pharmaceutical articles and articles neither patented nor generic (9903.04.69) are the "other" product type, which no Section 232 measure charges. '
          + COV_NOTE + ' ' + STACK_NOTE))
measures.append(rec(measureKey='s232-pharma-deal-15', program=P232, ch99Code='9903.04.62', rateKind='floor', ratePct=15, countriesInclude=DEAL,
    coverageInclude=c40, conditions={'productTypes': ['patented', 'specialty']}, replacesCodes=REPL_301, effectiveFrom='2026-09-29',
    sources=S('procl-11020', 'csms-70054007') + [hts_note(40)],
    notes='U.S. note 40(f): patented articles of Japan, the EU, South Korea, Switzerland or Liechtenstein; when the column 1 rate is below 15% the total is 15%, otherwise no additional duty. Modeled as a floor: max(base, 15%). '
          + COV_NOTE + ' ' + STACK_NOTE))
measures.append(rec(measureKey='s232-pharma-uk', program=P232, ch99Code='9903.04.63', rateKind='additive', ratePct=0, countriesInclude=['GB'],
    coverageInclude=c40, conditions={'productTypes': ['patented', 'specialty']}, replacesCodes=REPL_301, effectiveFrom='2026-07-31',
    sources=S('bis-uk', 'csms-69415934') + [hts_note(40)],
    notes='U.S. note 40(g): patented articles of the United Kingdom, base rate + 0% (set at 10% by Proclamation 11020, reduced to 0% from July 31, 2026). Must still be entered under 9903.04.63. '
          + COV_NOTE + ' ' + STACK_NOTE))
measures.append(rec(measureKey='s232-pharma-specialty', program=P232, ch99Code='9903.04.66', rateKind='additive', ratePct=0, countriesInclude=SPECIALTY,
    coverageInclude=c40, conditions={'productTypes': ['specialty']}, replacesCodes=['9903.04.60', '9903.04.62', '9903.04.63', '9903.04.64'] + REPL_301, effectiveFrom='2026-09-29',
    sources=S('procl-11020', 'bis-specialty') + [hts_note(40)],
    notes='U.S. note 40(h)(iii): orphan drugs, nuclear medicines, plasma-derived therapies, fertility drugs, cell and gene therapies, ADCs, CBRN countermeasures and animal-health products '
          'of the jurisdictions BIS listed on September 23, 2026 (EU, Argentina, Bangladesh, Cambodia, Ecuador, El Salvador, Guatemala, India, Indonesia, Japan, Jordan, Malaysia, North Macedonia, '
          'South Korea, Switzerland, Liechtenstein, Taiwan, Thailand, United Kingdom, Vietnam): base rate + 0%. Products meeting an urgent U.S. health need (BIS approval, any origin) are not modeled. '
          + COV_NOTE + ' ' + STACK_NOTE))
measures.append(rec(measureKey='s232-pharma-generic', program=P232, ch99Code='9903.04.67', rateKind='relief',
    coverageInclude=c40, conditions={'productTypes': ['generic']}, replacesCodes=['9903.04.60', '9903.04.62', '9903.04.63'], effectiveFrom='2026-07-31',
    sources=S('procl-11020', 'csms-70054007') + [hts_note(40)],
    notes='Proclamation 11020 clause 5 and U.S. note 40(c)(iii): generic pharmaceuticals, biosimilars and their ingredients pay no Section 232 duty (entered under 9903.04.67). '
          'They are not in 9903.04.60–9903.04.66, so the 2026 Section 301 and Brazil duties still apply unless another exemption covers the line (all Chapter 30 lines of note 40(c) are on note 52(b) / 50(a)(ii)). '
          + COV_NOTE))

# Section 232 pharmaceuticals: company programs and other confirmed facts (issue #1790, phase A: self-declared).
# Note 40(a): headings 9903.04.60–9903.04.70 are mutually exclusive; clause (8) of Proclamation 11020: the lowest applicable rate applies.
PATENTED = ['patented', 'specialty']
S232_DUTY = ['9903.04.60', '9903.04.61', '9903.04.62', '9903.04.63', '9903.04.64', '9903.04.65', '9903.04.66']
measures.append(rec(measureKey='s232-pharma-other-companies-before-0929', program=P232, ch99Code='9903.04.61', rateKind='relief',
    coverageInclude=c40, conditions={'productTypes': PATENTED}, replacesCodes=REPL_301, effectiveFrom='2026-07-31', effectiveTo='2026-09-28',
    sources=S('procl-11020', 'csms-69395344') + [hts_note(40)], reviewedAt='2026-10-09',
    notes='U.S. note 40(e) and CBP CSMS # 69395344: from July 31 through September 28, 2026, patented pharmaceutical articles of companies NOT listed in Annex III '
          'to Proclamation 11020 enter under 9903.04.61 with no Section 232 duty. 9903.04.61 is within 9903.04.60–9903.04.66, so the 2026 Section 301 and Brazil duties '
          'do not apply either (notes 52(f)(8), 50(a)(vi)(8)). Annex III companies (companyProgram annexCompany) paid the duty from July 31: see s232-pharma-annex3-*. '
          + COV_NOTE))
measures.append(rec(measureKey='s232-pharma-annex3-patented', program=P232, ch99Code='9903.04.60', rateKind='floor', ratePct=100, countriesExclude=sorted(DEAL + ['GB']),
    coverageInclude=c40, conditions={'productTypes': PATENTED, 'companyProgram': 'annexCompany'}, replacesCodes=['9903.04.61'] + REPL_301,
    effectiveFrom='2026-07-31', effectiveTo='2026-09-28', sources=S('procl-11020', 'csms-69395344') + [hts_note(40)], reviewedAt='2026-10-09',
    notes='Proclamation 11020 clause (4) and CBP CSMS # 69395344: products of the companies listed in Annex III to the proclamation paid the Section 232 duty from '
          'July 31, 2026, eight weeks before everyone else (other companies used 9903.04.61 until September 28). Same terms as s232-pharma-patented: when the column 1 rate '
          'is below 100% the total is 100%. Self-declared: the Annex III company names are not in the Federal Register text of the proclamation, so the importer '
          'confirms the manufacturer is listed (companyProgram annexCompany). ' + COV_NOTE + ' ' + STACK_NOTE))
measures.append(rec(measureKey='s232-pharma-annex3-deal-15', program=P232, ch99Code='9903.04.62', rateKind='floor', ratePct=15, countriesInclude=DEAL,
    coverageInclude=c40, conditions={'productTypes': PATENTED, 'companyProgram': 'annexCompany'}, replacesCodes=['9903.04.61'] + REPL_301,
    effectiveFrom='2026-07-31', effectiveTo='2026-09-28', sources=S('procl-11020', 'csms-69395344') + [hts_note(40)], reviewedAt='2026-10-09',
    notes='U.S. note 40(f) for Annex III companies from July 31 through September 28, 2026: patented articles of Japan, the EU, South Korea, Switzerland or Liechtenstein, '
          'total 15% when the column 1 rate is below 15%. Self-declared (companyProgram annexCompany). ' + COV_NOTE + ' ' + STACK_NOTE))
measures.append(rec(measureKey='s232-pharma-onshoring', program=P232, ch99Code='9903.04.64', rateKind='additive', ratePct=20, countriesExclude=sorted(DEAL + ['GB']),
    coverageInclude=c40, conditions={'productTypes': PATENTED, 'companyProgram': 'onshoring'}, replacesCodes=['9903.04.60'] + REPL_301,
    effectiveFrom='2026-09-29', effectiveTo='2030-04-01', sources=S('procl-11020', 'csms-69395344', 'csms-70054007') + [hts_note(40)], reviewedAt='2026-10-09',
    notes='U.S. note 40(h)(i), heading 9903.04.64 ("The duty provided in the applicable subheading + 20%"; CBP: 20% additional): patented articles imported for companies '
          'with an onshoring plan approved by the Secretary of Commerce pay base rate + 20% instead of 9903.04.60. Self-declared (companyProgram onshoring); CBP may '
          'require proof, and CSMS # 69395344 said no company was yet eligible. Not offered for products of Japan, the EU, South Korea, Switzerland, Liechtenstein or '
          'the United Kingdom, whose lower rates (15%, 0%) apply under clause (8) of the proclamation (lowest rate wins); specialty products eligible for 9903.04.66 '
          'stay at 0%. The rate rises to 100% on April 2, 2030 (Proclamation 11020 clause 3(b)), so the measure ends April 1, 2030 and 9903.04.60 applies again. '
          + COV_NOTE + ' ' + STACK_NOTE))
measures.append(rec(measureKey='s232-pharma-mfn-pricing', program=P232, ch99Code='9903.04.65', rateKind='additive', ratePct=0,
    coverageInclude=c40, conditions={'productTypes': PATENTED, 'companyProgram': 'mfnPricing'}, replacesCodes=['9903.04.60', '9903.04.62', '9903.04.63', '9903.04.64'] + REPL_301,
    effectiveFrom='2026-09-29', effectiveTo='2029-01-19', sources=S('procl-11020', 'csms-69395344', 'csms-70054007') + [hts_note(40)], reviewedAt='2026-10-09',
    notes='U.S. note 40(h)(ii), heading 9903.04.65 (base rate + 0%): patented articles of companies with an approved onshoring plan AND a most-favored-nation '
          'pharmaceutical pricing agreement with HHS, including the company agreements in Annex II to Proclamation 11020 (clause 3(e); CSMS # 69395344). '
          'Self-declared (companyProgram mfnPricing); CBP may require proof. The zero rate runs until January 20, 2029 (CSMS: 9903.04.65 expires that day), '
          'so the measure ends January 19, 2029. ' + COV_NOTE + ' ' + STACK_NOTE))
measures.append(rec(measureKey='s232-pharma-us-origin-api', program=P232, ch99Code='9903.04.68', rateKind='relief',
    coverageInclude=c40, conditions={'usOriginIngredient': True}, replacesCodes=S232_DUTY, effectiveFrom='2026-07-31',
    sources=S('procl-11020', 'csms-69395344', 'csms-70054007') + [hts_note(40)], reviewedAt='2026-10-09',
    notes='Heading 9903.04.68 (Proclamation 11020 clause (11); CSMS # 69395344 and # 70054007): pharmaceutical products with an active pharmaceutical ingredient that is '
          'a product of the United States, packaged in dosage form abroad, pay no Section 232 duty (0%). Applies only when the importer confirms the U.S.-origin '
          'ingredient (conditions.usOriginIngredient). 9903.04.68 is outside 9903.04.60–9903.04.66, so the 2026 Section 301 and Brazil duties still apply unless '
          'another exemption covers the line. ' + COV_NOTE))
measures.append(rec(measureKey='s232-pharma-research-use', program=P232, ch99Code='9903.04.70', rateKind='relief',
    coverageInclude=c40, conditions={'endUse': 'research'}, replacesCodes=S232_DUTY, effectiveFrom='2026-09-29',
    sources=S('bis-specialty', 'csms-70054007') + [hts_note(40)], reviewedAt='2026-10-09',
    notes='Heading 9903.04.70 (added by 91 FR 60360 from September 29, 2026; CSMS # 70054007): pharmaceutical articles and ingredients of note 40(c) solely for use in '
          'clinical trials, research and development, or other non-commercial applications pay no Section 232 duty (0%). Applies only when the importer confirms '
          'that end use (conditions.endUse = research). 9903.04.70 is outside 9903.04.60–9903.04.66, so the 2026 Section 301 and Brazil duties still apply unless '
          'another exemption covers the line. ' + COV_NOTE))

# Named-product exemptions (notes 52(c), 52(j)(n)(ii), 50(a)(iii)): one relief measure per (note, subheading),
# applying only when the importer confirms the described product (issue #1790).
from measures_named_products import named_product_measures  # noqa: E402
measures += named_product_measures(cov, load_descriptions(ROOT), rec=rec, S=S, hts_note=hts_note, all_s301_codes=ALL_S301_CODES)

out = {'htsEdition': ED, 'reviewedAt': '2026-10-09', 'measures': measures}
json.dump(out, open(ROOT + 'measures.json', 'w'), ensure_ascii=False, indent=2)
print(len(measures), 'measures')
