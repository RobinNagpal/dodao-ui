# Builds src/tariff-data/calculator/measures.json from note-coverage.json plus the reviewed measure definitions below
# (rates, countries, conditions, dates and official sources). Run: python3 src/scripts/tariff-calculator/build-measures.py
# Review every change to the definitions against the cited official documents; see docs/insights-ui/tariffs/calculator-data-refresh.md.
import json, sys
sys.dont_write_bytecode = True  # importing measures_named_products must not leave __pycache__ in the repo
import os
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

# China Section 301 lists (U.S. note 20) — Chapters 01 and 30 only
PCN = 'Section 301 (China, 2018-2019 lists)'
l3 = [c for c in cov['20(f)'] if c[:2] in ('01', '30')]
l4a = [c for c in cov['20(s)(i)'] if c[:2] in ('01', '30')]
measures.append(rec(measureKey='s301-china-list3', program=PCN, ch99Code='9903.88.03', rateKind='additive', ratePct=25, countriesInclude=['CN'],
    coverageInclude=l3, effectiveFrom='2019-05-10', sources=S('ustr-301-cn-3-increase', 'ustr-cn-301-continue') + [hts_note(20)],
    notes=f"List 3, U.S. note 20(e)–(f): base rate + 25% (25% since May 10, 2019). Coverage is limited to the Chapter 01 and 30 lines of the {len(cov['20(f)'])}-line list "
          f"({', '.join(l3)}); the full list is in note-coverage.json \"20(f)\". Product exclusions in note 20 for these lines have expired."))
measures.append(rec(measureKey='s301-china-list4a', program=PCN, ch99Code='9903.88.15', rateKind='additive', ratePct=7.5, countriesInclude=['CN'],
    coverageInclude=l4a, effectiveFrom='2020-02-14', sources=S('ustr-301-cn-4a', 'ustr-301-cn-4a-cut', 'ustr-cn-301-continue') + [hts_note(20)],
    notes=f"List 4A, U.S. note 20(r)–(s): base rate + 7.5% (15% from September 1, 2019, cut to 7.5% from February 14, 2020). Coverage is limited to the Chapter 01 and 30 lines "
          f"of the {len(cov['20(s)(i)'])}-line list: all {sum(1 for c in l4a if c.startswith('01'))} Chapter 01 subheadings and 3006.93.20, 3006.93.50; the full list is in note-coverage.json \"20(s)(i)\". "
          "The Chapter 01 exclusions in notes 20(ddd) and 20(jjj) (research macaques, 0106.11.00.00) have expired. Stacks with the 12.5% 2026 Section 301 duty (9903.05.31)."))

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
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from measures_named_products import load_descriptions, named_product_measures  # noqa: E402
measures += named_product_measures(cov, load_descriptions(ROOT), rec=rec, S=S, hts_note=hts_note, all_s301_codes=ALL_S301_CODES)

out = {'htsEdition': ED, 'reviewedAt': '2026-10-09', 'measures': measures}
json.dump(out, open(ROOT + 'measures.json', 'w'), ensure_ascii=False, indent=2)
print(len(measures), 'measures')
